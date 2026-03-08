using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Web.Common.Controllers;

namespace Shop404.Cms.Controllers;

/// <summary>
/// Adapter endpoints consumed by the React SPA.
/// Maps Umbraco published content to stable frontend DTOs (see ADR-006).
/// Base path: /api/content
/// </summary>
[ApiController]
[Route("api/content")]
public class ContentApiController : UmbracoApiController
{
    private readonly IPublishedContentQuery _contentQuery;
    private readonly IPublishedValueFallback _fallback;

    public ContentApiController(IPublishedContentQuery contentQuery, IPublishedValueFallback fallback)
    {
        _contentQuery = contentQuery;
        _fallback = fallback;
    }

    // GET /api/content/page?route=/about
    [HttpGet("page")]
    public IActionResult GetPage([FromQuery] string route)
    {
        if (string.IsNullOrWhiteSpace(route))
            return BadRequest(new { error = "route parameter is required" });

        var content = _contentQuery.ContentAtRoute(route);
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

        var nav = settings.Value<IEnumerable<IPublishedContent>>("headerNavigation", _fallback)
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
        var overview = _contentQuery.ContentOfType("blogOverview").FirstOrDefault();
        if (overview is null)
            return Ok(new { items = Array.Empty<object>() });

        var posts = overview.Children
            .Where(c => c.ContentType.Alias == "blogPost")
            .OrderByDescending(c => c.Value<DateTime>("publishDate", _fallback))
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
        var overview = _contentQuery.ContentOfType("blogOverview").FirstOrDefault();
        if (overview is null)
            return NotFound(new { error = "Blog not found" });

        var post = overview.Children.FirstOrDefault(c =>
            c.ContentType.Alias == "blogPost" &&
            string.Equals(
                c.Value<string>("slug", _fallback) ?? c.UrlSegment,
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
            return Ok(new { footerText = "", defaultSeoTitle = "", defaultSeoDescription = "" });

        Response.Headers.CacheControl = "public, max-age=300, stale-while-revalidate=60";
        return Ok(new
        {
            footerText = settings.Value<string>("footerText", _fallback) ?? string.Empty,
            defaultSeoTitle = settings.Value<string>("defaultSeoTitle", _fallback) ?? string.Empty,
            defaultSeoDescription = settings.Value<string>("defaultSeoDescription", _fallback) ?? string.Empty,
        });
    }

    // --- helpers ---

    private IPublishedContent? FindSiteSettings()
        => _contentQuery.ContentOfType("siteSettings").FirstOrDefault();

    private object MapPage(IPublishedContent page) => new
    {
        id = page.Key.ToString(),
        contentType = page.ContentType.Alias,
        name = page.Name,
        url = page.Url(),
        properties = new
        {
            pageTitle = page.Value<string>("pageTitle", _fallback) ?? page.Name,
            slug = page.Value<string>("slug", _fallback) ?? page.UrlSegment,
            seoTitle = page.Value<string>("seoTitle", _fallback) ?? string.Empty,
            seoDescription = page.Value<string>("seoDescription", _fallback) ?? string.Empty,
            hideFromNavigation = page.Value<bool>("hideFromNavigation", _fallback),
            bodyContent = page.Value<string>("bodyContent", _fallback) ?? string.Empty,
            introText = page.Value<string>("introText", _fallback) ?? string.Empty,
            heroHeading = page.Value<string>("heroHeading", _fallback) ?? string.Empty,
            heroText = page.Value<string>("heroText", _fallback) ?? string.Empty,
        },
    };

    private static object MapBlogSummary(IPublishedContent post, IPublishedValueFallback fb) => new
    {
        id = post.Key.ToString(),
        title = post.Value<string>("pageTitle", fb) ?? post.Name,
        slug = post.Value<string>("slug", fb) ?? post.UrlSegment,
        publishDate = post.Value<DateTime>("publishDate", fb).ToString("yyyy-MM-dd"),
        summary = post.Value<string>("summary", fb) ?? string.Empty,
        author = post.Value<string>("author", fb) ?? string.Empty,
        tags = post.Value<IEnumerable<string>>("tags", fb) ?? Enumerable.Empty<string>(),
    };

    private static object MapBlogDetail(IPublishedContent post, IPublishedValueFallback fb) => new
    {
        id = post.Key.ToString(),
        title = post.Value<string>("pageTitle", fb) ?? post.Name,
        slug = post.Value<string>("slug", fb) ?? post.UrlSegment,
        publishDate = post.Value<DateTime>("publishDate", fb).ToString("yyyy-MM-dd"),
        summary = post.Value<string>("summary", fb) ?? string.Empty,
        author = post.Value<string>("author", fb) ?? string.Empty,
        body = post.Value<string>("body", fb) ?? string.Empty,
        seoTitle = post.Value<string>("seoTitle", fb) ?? string.Empty,
        seoDescription = post.Value<string>("seoDescription", fb) ?? string.Empty,
        tags = post.Value<IEnumerable<string>>("tags", fb) ?? Enumerable.Empty<string>(),
    };
}
