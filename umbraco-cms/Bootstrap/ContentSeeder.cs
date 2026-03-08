using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;

namespace Shop404.Cms.Bootstrap;

/// <summary>
/// Seeds the initial content tree (home, about, faq, terms, privacy, blog, site settings)
/// on first run. Fully idempotent — skips if a homePage root node already exists.
///
/// Content tree created:
///   / (homePage "Home")
///     /about   (standardPage "About")
///     /faq     (standardPage "FAQ")
///     /terms   (standardPage "Terms and Conditions")
///     /privacy (standardPage "Privacy Policy")
///     /blog    (blogOverview "Blog")
///   /site-settings (siteSettings singleton)
///
/// Production content migration is a manual backoffice workflow.
/// See .assistant/canvas/notes.md for the migration mapping.
/// </summary>
[ComposeAfter(typeof(Shop404ContentTypesComposer))]
public class Shop404ContentSeederComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
        => builder.AddNotificationHandler<UmbracoApplicationStartedNotification, Shop404ContentSeeder>();
}

public class Shop404ContentSeeder : INotificationHandler<UmbracoApplicationStartedNotification>
{
    private readonly IRuntimeState _runtimeState;
    private readonly IContentService _contentService;
    private readonly ILogger<Shop404ContentSeeder> _logger;

    public Shop404ContentSeeder(
        IRuntimeState runtimeState,
        IContentService contentService,
        ILogger<Shop404ContentSeeder> logger)
    {
        _runtimeState = runtimeState;
        _contentService = contentService;
        _logger = logger;
    }

    public void Handle(UmbracoApplicationStartedNotification notification)
    {
        if (_runtimeState.Level != RuntimeLevel.Run)
            return;

        var rootNodes = _contentService.GetRootContent().ToList();

        // Idempotency guard: skip if a homePage root already exists.
        if (rootNodes.Any(n => n.ContentType.Alias == "homePage"))
        {
            _logger.LogInformation("Shop404 content seed already applied — skipping.");
            return;
        }

        _logger.LogInformation("Seeding Shop404 initial content tree...");

        EnsureSiteSettings(rootNodes);
        var home = EnsureHome();
        if (home is not null)
        {
            EnsureStandardPage(home.Id, "About",                   "about",   AboutBody);
            EnsureStandardPage(home.Id, "FAQ",                     "faq",     FaqBody);
            EnsureStandardPage(home.Id, "Terms and Conditions",    "terms",   TermsBody);
            EnsureStandardPage(home.Id, "Privacy Policy",          "privacy", PrivacyBody);
            EnsureBlogOverview(home.Id);
        }

        _logger.LogInformation("Shop404 content seeding complete.");
    }

    // ── Page creators ──────────────────────────────────────────────────────

    private void EnsureSiteSettings(IReadOnlyList<IContent> rootNodes)
    {
        if (rootNodes.Any(n => n.ContentType.Alias == "siteSettings"))
            return;

        var node = _contentService.Create("Site Settings", Constants.System.Root, "siteSettings");
        node.SetValue("footerText", $"© {DateTime.UtcNow.Year} Shop404. For testing purposes only.");
        node.SetValue("defaultSeoTitle", "Shop404 — Demo Ecommerce & Analytics Test Bed");
        node.SetValue("defaultSeoDescription",
            "Shop404 is a mock ecommerce and donation site built for testing " +
            "Matomo, GTM/GA4, Optimizely Web, and ODP implementations.");
        Publish(node, "Site Settings");
    }

    private IContent? EnsureHome()
    {
        var node = _contentService.Create("Home", Constants.System.Root, "homePage");
        node.SetValue("pageTitle", "Home");
        node.SetValue("slug", "/");
        node.SetValue("heroHeading", "Modern mock ecommerce + donation site");
        node.SetValue("heroText",
            "Built for testing Matomo, GTM/GA4, Optimizely Web, and ODP implementations.");
        node.SetValue("seoTitle", "Shop404 — Demo Ecommerce");
        node.SetValue("seoDescription",
            "Shop404 is a mock ecommerce and donation site built for testing analytics and tag management implementations.");
        return Publish(node, "Home") ? node : null;
    }

    private void EnsureStandardPage(int parentId, string name, string slug, string bodyHtml)
    {
        var node = _contentService.Create(name, parentId, "standardPage");
        node.SetValue("pageTitle", name);
        node.SetValue("slug", slug);
        node.SetValue("bodyContent", bodyHtml);
        Publish(node, name);
    }

    private void EnsureBlogOverview(int parentId)
    {
        var node = _contentService.Create("Blog", parentId, "blogOverview");
        node.SetValue("pageTitle", "Blog");
        node.SetValue("slug", "blog");
        node.SetValue("introText",
            "Articles, tutorials, and updates from the Shop404 project.");
        Publish(node, "Blog");
    }

    private bool Publish(IContent node, string label)
    {
        // Umbraco 17: SaveAndPublish removed — call Save then Publish separately.
        _contentService.Save(node, Constants.Security.SuperUserId);
        var result = _contentService.Publish(node, Array.Empty<string>(), Constants.Security.SuperUserId);
        if (result.Success)
        {
            _logger.LogInformation("Seeded and published: {Label}", label);
            return true;
        }
        _logger.LogWarning("Failed to publish seed node '{Label}': {Status}", label, result.Result);
        return false;
    }

    // ── Seed body content ──────────────────────────────────────────────────
    // Plain HTML — editors should replace this via the backoffice.
    // The Rich Text Editor in Umbraco 17 (Tiptap) accepts HTML on import.

    private const string AboutBody = """
        <h2>About Shop404</h2>
        <p>Shop404 is a demo ecommerce and donation site built as an analytics test bed.
        It is used to validate Matomo, Google Tag Manager, GA4, Optimizely Web,
        and Optimizely Data Platform (ODP) integrations.</p>
        <h3>Purpose</h3>
        <p>This site exists to provide a realistic, multi-page ecommerce journey for
        testing analytics implementations without affecting real customer data or
        live storefronts.</p>
        <h3>Tech Stack</h3>
        <ul>
          <li>React + Vite (SPA)</li>
          <li>Umbraco CMS (headless, .NET 10)</li>
          <li>SQL Server</li>
          <li>Docker Compose</li>
        </ul>
        """;

    private const string FaqBody = """
        <h2>Frequently Asked Questions</h2>
        <h3>Is this a real store?</h3>
        <p>No. Shop404 is a demonstration site only. No real products are sold and
        no real payments are processed.</p>
        <h3>Can I use this to test my analytics setup?</h3>
        <p>Yes — that is exactly what this site is designed for. You can add GTM
        containers, Matomo trackers, or ODP snippets and exercise them across
        the full purchase funnel.</p>
        <h3>Where can I report a bug?</h3>
        <p>Open an issue on the project's GitHub repository.</p>
        <h3>Is there a donation flow?</h3>
        <p>Yes. Navigate to <strong>/donate</strong> to test donation events and
        custom conversion tracking.</p>
        """;

    private const string TermsBody = """
        <h2>Terms and Conditions</h2>
        <p><em>Last updated: January 2026</em></p>
        <p>Shop404 is provided for demonstration and testing purposes only.
        By using this site you agree to the following terms.</p>
        <h3>1. No Real Transactions</h3>
        <p>All products, prices, and checkout flows are simulated.
        No payment is processed and no goods are shipped.</p>
        <h3>2. Data Collection</h3>
        <p>This site may collect analytics data including page views,
        events, and interaction data for the purposes of testing
        analytics integrations. No personal data is sold or shared.</p>
        <h3>3. Liability</h3>
        <p>This site is provided "as is" without warranty of any kind.
        The operators accept no liability for any damages arising from use of this site.</p>
        <h3>4. Changes</h3>
        <p>These terms may be updated at any time without notice.</p>
        """;

    private const string PrivacyBody = """
        <h2>Privacy Policy</h2>
        <p><em>Last updated: January 2026</em></p>
        <p>This policy describes how Shop404 handles information collected on this site.</p>
        <h3>What we collect</h3>
        <ul>
          <li>Analytics events (page views, clicks, ecommerce interactions)</li>
          <li>Consent preferences</li>
          <li>Session and device information via analytics tools</li>
        </ul>
        <h3>Why we collect it</h3>
        <p>Data is collected solely to test and validate analytics and tag management
        integrations. It is not used for advertising or profiling.</p>
        <h3>Third-party services</h3>
        <p>Depending on configuration, this site may load scripts from Google Tag Manager,
        Matomo, Optimizely, or similar services. Each service's own privacy policy applies.</p>
        <h3>Your rights</h3>
        <p>You may withdraw consent at any time using the consent banner on this site.
        Contact the project maintainers to request data deletion.</p>
        """;
}
