using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Services.Navigation;
using Umbraco.Cms.Core.Web;
using Umbraco.Extensions;

namespace Shop404.Cms.Controllers;

/// <summary>
/// Adapter endpoints consumed by the React SPA.
/// Maps Umbraco published content to stable frontend DTOs (see ADR-006).
/// Base path: /api/content
/// </summary>
/// <remarks>
/// Umbraco 17 API notes (breaking changes from v13):
/// - IPublishedContentQuery, UmbracoApiController, IPublishedSnapshotAccessor removed.
///   Use IUmbracoContextAccessor + IDocumentNavigationQueryService instead.
/// - IPublishedContentCache.GetAtRoot() removed. Use IDocumentNavigationQueryService.TryGetRootKeys().
/// - Value&lt;T&gt;(alias, fallback) → Value&lt;T&gt;(fallback, alias) (argument order swapped).
/// - IPublishedContent.Children property obsolete → use Children() extension method.
/// - BlockListModel.Items (protected) → iterate BlockListModel directly (IEnumerable&lt;BlockListItem&gt;).
/// </remarks>
[ApiController]
[Route("api/content")]
public class ContentApiController : ControllerBase
{
    private readonly IUmbracoContextAccessor _contextAccessor;
    private readonly IDocumentNavigationQueryService _navigationQuery;
    private readonly IPublishedValueFallback _fallback;

    public ContentApiController(
        IUmbracoContextAccessor contextAccessor,
        IDocumentNavigationQueryService navigationQuery,
        IPublishedValueFallback fallback)
    {
        _contextAccessor = contextAccessor;
        _navigationQuery = navigationQuery;
        _fallback = fallback;
    }

    private IPublishedContentCache? ContentCache =>
        _contextAccessor.TryGetUmbracoContext(out var ctx) ? ctx?.Content : null;

    // GET /api/content/page?route=/about
    [HttpGet("page")]
    public IActionResult GetPage([FromQuery] string route)
    {
        if (string.IsNullOrWhiteSpace(route))
            return BadRequest(new { error = "route parameter is required" });

        var content = FindByRoute(route);
        if (content is null)
            return NotFound(new { error = "Page not found", route });

        Response.Headers.CacheControl = "public, max-age=60, stale-while-revalidate=30";
        return Ok(MapPage(content));
    }

    // GET /api/content/navigation
    [HttpGet("navigation")]
    public IActionResult GetNavigation()
    {
        var settings = FindSiteSettings();
        if (settings is null)
            return Ok(new { items = Array.Empty<object>() });

        // Umbraco 17: Value<T>(fallback, alias) — argument order changed from v13.
        var nav = settings.Value<IEnumerable<IPublishedContent>>(_fallback, "headerNavigation")
                  ?? Enumerable.Empty<IPublishedContent>();

        var items = nav
            .Select(p => new { title = p.Name, url = p.Url() })
            .ToArray();

        Response.Headers.CacheControl = "public, max-age=120, stale-while-revalidate=60";
        return Ok(new { items });
    }

    // GET /api/content/blog?limit=10
    [HttpGet("blog")]
    public IActionResult GetBlogPosts([FromQuery] int limit = 10)
    {
        var overview = FindFirstOfType("blogOverview");
        if (overview is null)
            return Ok(new { items = Array.Empty<object>() });

        // Children() extension method replaces the obsolete Children property.
        var posts = overview.Children()
            .Where(c => c.ContentType.Alias == "blogPost")
            .OrderByDescending(c => c.Value<DateTime>(_fallback, "publishDate"))
            .Take(Math.Max(1, Math.Min(limit, 100)))
            .Select(p => MapBlogSummary(p, _fallback))
            .ToArray();

        Response.Headers.CacheControl = "public, max-age=60, stale-while-revalidate=30";
        return Ok(new { items = posts });
    }

    // GET /api/content/blog/{slug}
    [HttpGet("blog/{slug}")]
    public IActionResult GetBlogPost(string slug)
    {
        var overview = FindFirstOfType("blogOverview");
        if (overview is null)
            return NotFound(new { error = "Blog not found" });

        var post = overview.Children().FirstOrDefault(c =>
            c.ContentType.Alias == "blogPost" &&
            string.Equals(
                c.Value<string>(_fallback, "slug") ?? c.UrlSegment,
                slug,
                StringComparison.OrdinalIgnoreCase));

        if (post is null)
            return NotFound(new { error = "Blog post not found", slug });

        Response.Headers.CacheControl = "public, max-age=60, stale-while-revalidate=30";
        return Ok(MapBlogDetail(post, _fallback));
    }

    // GET /api/content/settings
    [HttpGet("settings")]
    public IActionResult GetSettings()
    {
        var settings = FindSiteSettings();
        if (settings is null)
            return Ok(new { footerText = "", footerLinks = Array.Empty<object>(), defaultSeoTitle = "", defaultSeoDescription = "" });

        var footerLinks = (settings.Value<IEnumerable<IPublishedContent>>(_fallback, "footerLinks")
                           ?? Enumerable.Empty<IPublishedContent>())
                          .Select(p => new { title = p.Name, url = p.Url() })
                          .ToArray();

        Response.Headers.CacheControl = "public, max-age=300, stale-while-revalidate=60";
        return Ok(new
        {
            footerText = settings.Value<string>(_fallback, "footerText") ?? string.Empty,
            footerLinks,
            defaultSeoTitle = settings.Value<string>(_fallback, "defaultSeoTitle") ?? string.Empty,
            defaultSeoDescription = settings.Value<string>(_fallback, "defaultSeoDescription") ?? string.Empty,
        });
    }

    // --- helpers ---

    private IPublishedContent? FindSiteSettings() => FindFirstOfType("siteSettings");

    /// <summary>
    /// Finds a published page whose Url() matches the given route.
    /// </summary>
    private IPublishedContent? FindByRoute(string route)
    {
        var normalized = route.TrimEnd('/');
        return AllPublishedContent()
            .FirstOrDefault(x =>
                string.Equals(
                    x.Url()?.TrimEnd('/'),
                    normalized,
                    StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// Returns the first published node of the given content type alias.
    /// Replaces IPublishedContentQuery.ContentOfType() (removed in Umbraco 14).
    /// </summary>
    private IPublishedContent? FindFirstOfType(string alias)
        => AllPublishedContent().FirstOrDefault(x => x.ContentType.Alias == alias);

    /// <summary>
    /// Enumerates all published content nodes via IDocumentNavigationQueryService.
    /// Replaces IPublishedContentCache.GetAtRoot() + manual recursion (removed in Umbraco 14).
    /// </summary>
    private IEnumerable<IPublishedContent> AllPublishedContent()
    {
        var cache = ContentCache;
        if (cache is null) yield break;

        if (!_navigationQuery.TryGetRootKeys(out var rootKeys))
            yield break;

        foreach (var key in rootKeys)
        {
            var root = cache.GetById(key);
            if (root is not null) yield return root;

            if (!_navigationQuery.TryGetDescendantsKeys(key, out var descendantKeys))
                continue;

            foreach (var dKey in descendantKeys)
            {
                var node = cache.GetById(dKey);
                if (node is not null) yield return node;
            }
        }
    }

    private object MapPage(IPublishedContent page) => new
    {
        id = page.Key.ToString(),
        contentType = page.ContentType.Alias,
        name = page.Name,
        url = page.Url(),
        properties = new
        {
            pageTitle = page.Value<string>(_fallback, "pageTitle") ?? page.Name,
            slug = page.Value<string>(_fallback, "slug") ?? page.UrlSegment,
            seoTitle = page.Value<string>(_fallback, "seoTitle") ?? string.Empty,
            seoDescription = page.Value<string>(_fallback, "seoDescription") ?? string.Empty,
            hideFromNavigation = page.Value<bool>(_fallback, "hideFromNavigation"),
            bodyContent = page.Value<string>(_fallback, "bodyContent") ?? string.Empty,
            introText = page.Value<string>(_fallback, "introText") ?? string.Empty,
            heroHeading = page.Value<string>(_fallback, "heroHeading") ?? string.Empty,
            heroText = page.Value<string>(_fallback, "heroText") ?? string.Empty,
            contentBlocks = MapBlockList(page, "contentBlocks"),
            featuredProductsSection = MapBlockList(page, "featuredProductsSection"),
        },
    };

    private IEnumerable<object> MapBlockList(IPublishedContent page, string propertyAlias)
    {
        var blockList = page.Value<BlockListModel>(_fallback, propertyAlias);
        if (blockList is null) return Enumerable.Empty<object>();

        // BlockListModel is IEnumerable<BlockListItem> — iterate directly.
        // blockList.Items was removed in Umbraco 17 (protected ReadOnlyCollection<T>.Items).
        return blockList.Select(item => (object)new
        {
            alias = item.Content.ContentType.Alias,
            data = MapBlockData(item.Content),
        });
    }

    private static object MapBlockData(IPublishedElement el) => el.ContentType.Alias switch
    {
        "heroBlock" => new
        {
            heading = el.Value<string>("heading") ?? string.Empty,
            text = el.Value<string>("text") ?? string.Empty,
            backgroundImage = el.Value<IPublishedContent>("backgroundImage")?.Url() ?? string.Empty,
            ctaText = el.Value<string>("ctaText") ?? string.Empty,
            ctaLink = el.Value<IPublishedContent>("ctaLink")?.Url() ?? string.Empty,
        },
        "ctaBlock" => new
        {
            title = el.Value<string>("title") ?? string.Empty,
            description = el.Value<string>("description") ?? string.Empty,
            buttonText = el.Value<string>("buttonText") ?? string.Empty,
            buttonUrl = el.Value<string>("buttonUrl") ?? string.Empty,
        },
        "productTeaserBlock" => new
        {
            productName = el.Value<string>("productName") ?? string.Empty,
            image = el.Value<IPublishedContent>("image")?.Url() ?? string.Empty,
            price = el.Value<string>("price") ?? string.Empty,
            link = el.Value<IPublishedContent>("link")?.Url() ?? string.Empty,
        },
        _ => (object)new { },
    };

    private static object MapBlogSummary(IPublishedContent post, IPublishedValueFallback fb) => new
    {
        id = post.Key.ToString(),
        title = post.Value<string>(fb, "pageTitle") ?? post.Name,
        slug = post.Value<string>(fb, "slug") ?? post.UrlSegment,
        publishDate = post.Value<DateTime>(fb, "publishDate").ToString("yyyy-MM-dd"),
        summary = post.Value<string>(fb, "summary") ?? string.Empty,
        author = post.Value<string>(fb, "author") ?? string.Empty,
        tags = post.Value<IEnumerable<string>>(fb, "tags") ?? Enumerable.Empty<string>(),
    };

    private static object MapBlogDetail(IPublishedContent post, IPublishedValueFallback fb) => new
    {
        id = post.Key.ToString(),
        title = post.Value<string>(fb, "pageTitle") ?? post.Name,
        slug = post.Value<string>(fb, "slug") ?? post.UrlSegment,
        publishDate = post.Value<DateTime>(fb, "publishDate").ToString("yyyy-MM-dd"),
        summary = post.Value<string>(fb, "summary") ?? string.Empty,
        author = post.Value<string>(fb, "author") ?? string.Empty,
        body = post.Value<string>(fb, "body") ?? string.Empty,
        seoTitle = post.Value<string>(fb, "seoTitle") ?? string.Empty,
        seoDescription = post.Value<string>(fb, "seoDescription") ?? string.Empty,
        tags = post.Value<IEnumerable<string>>(fb, "tags") ?? Enumerable.Empty<string>(),
    };
}
