using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;
using Umbraco.Cms.Core;

namespace Shop404.Cms.Bootstrap;

public class Shop404ContentTypesComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
        => builder.AddNotificationHandler<UmbracoApplicationStartedNotification, Shop404ContentTypesBootstrapper>();
}

public class Shop404ContentTypesBootstrapper : INotificationHandler<UmbracoApplicationStartedNotification>
{
    private static readonly object BootstrapLock = new();
    private static bool _bootstrapCompleted;

    private readonly IRuntimeState _runtimeState;
    private readonly IContentTypeService _contentTypeService;
    private readonly IDataTypeService _dataTypeService;
    private readonly IShortStringHelper _shortStringHelper;
    private readonly ILogger<Shop404ContentTypesBootstrapper> _logger;

    public Shop404ContentTypesBootstrapper(
        IRuntimeState runtimeState,
        IContentTypeService contentTypeService,
        IDataTypeService dataTypeService,
        IShortStringHelper shortStringHelper,
        ILogger<Shop404ContentTypesBootstrapper> logger)
    {
        _runtimeState = runtimeState;
        _contentTypeService = contentTypeService;
        _dataTypeService = dataTypeService;
        _shortStringHelper = shortStringHelper;
        _logger = logger;
    }

    public void Handle(UmbracoApplicationStartedNotification notification)
    {
        if (_runtimeState.Level != RuntimeLevel.Run)
        {
            _logger.LogInformation("Skipping Shop404 content type bootstrap. Runtime level is {RuntimeLevel}", _runtimeState.Level);
            return;
        }

        lock (BootstrapLock)
        {
            if (_bootstrapCompleted)
            {
                _logger.LogInformation("Shop404 content type bootstrap already completed in this process — skipping.");
                return;
            }

            EnsureBasePageComposition();
            EnsurePageTypes();
            EnsureSiteSettings();
            EnsureBlockTypes();

            _bootstrapCompleted = true;
        }
    }

    private void EnsureBasePageComposition()
    {
        var basePage = EnsureContentType(
            alias: "basePage",
            name: "Base Page",
            description: "Shared page fields used by marketing pages.",
            isElement: true,
            allowedAsRoot: false,
            out bool isNew);

        bool changed = false;
        changed |= EnsureProperty(basePage, "Content", "pageTitle", "Page Title", "Umbraco.TextBox");
        changed |= EnsureProperty(basePage, "Content", "slug", "Slug", "Umbraco.TextBox");
        changed |= EnsureProperty(basePage, "SEO", "seoTitle", "SEO Title", "Umbraco.TextBox");
        changed |= EnsureProperty(basePage, "SEO", "seoDescription", "SEO Description", "Umbraco.TextArea");
        changed |= EnsureProperty(basePage, "SEO", "hideFromNavigation", "Hide From Navigation", "Umbraco.TrueFalse");
        changed |= EnsureProperty(basePage, "SEO", "openGraphImage", "OpenGraph Image", "Umbraco.MediaPicker3");

        if (isNew || changed)
            SaveContentType(basePage);
    }

    private void EnsurePageTypes()
    {
        var basePage = _contentTypeService.Get("basePage");
        if (basePage is null)
        {
            _logger.LogWarning("Base Page composition was not found. Skipping page type composition.");
            return;
        }

        var homePage = EnsureContentType(
            alias: "homePage",
            name: "Home Page",
            description: "Landing page content.",
            isElement: false,
            allowedAsRoot: true,
            out bool homePageIsNew);
        bool homePageChanged = EnsureComposition(homePage, basePage);
        homePageChanged |= EnsureProperty(homePage, "Content", "heroHeading", "Hero Heading", "Umbraco.TextBox");
        homePageChanged |= EnsureProperty(homePage, "Content", "heroText", "Hero Text", "Umbraco.TextArea");
        homePageChanged |= EnsureProperty(homePage, "Content", "heroImage", "Hero Image", "Umbraco.MediaPicker3");
        homePageChanged |= EnsureProperty(homePage, "Content", "featuredProductsSection", "Featured Products Section", "Umbraco.BlockList");
        homePageChanged |= EnsureProperty(homePage, "Content", "featuredArticles", "Featured Articles", "Umbraco.ContentPicker");
        if (homePageIsNew || homePageChanged)
            SaveContentType(homePage);

        var standardPage = EnsureContentType(
            alias: "standardPage",
            name: "Standard Page",
            description: "Standard marketing/informational page.",
            isElement: false,
            allowedAsRoot: false,
            out bool standardPageIsNew);
        bool standardPageChanged = EnsureComposition(standardPage, basePage);
        standardPageChanged |= EnsureProperty(standardPage, "Content", "bodyContent", "Body Content", "Umbraco.RichText");
        standardPageChanged |= EnsureProperty(standardPage, "Content", "contentBlocks", "Content Blocks", "Umbraco.BlockList");
        if (standardPageIsNew || standardPageChanged)
            SaveContentType(standardPage);

        var blogOverview = EnsureContentType(
            alias: "blogOverview",
            name: "Blog / Knowledge Base Overview",
            description: "Root node for blog and knowledge base entries.",
            isElement: false,
            allowedAsRoot: false,
            out bool blogOverviewIsNew);
        bool blogOverviewChanged = EnsureComposition(blogOverview, basePage);
        blogOverviewChanged |= EnsureProperty(blogOverview, "Content", "introText", "Intro Text", "Umbraco.TextArea");
        if (blogOverviewIsNew || blogOverviewChanged)
            SaveContentType(blogOverview);

        var blogPost = EnsureContentType(
            alias: "blogPost",
            name: "Blog Post",
            description: "Blog article/document page.",
            isElement: false,
            allowedAsRoot: false,
            out bool blogPostIsNew);
        bool blogPostChanged = EnsureComposition(blogPost, basePage);
        blogPostChanged |= EnsureProperty(blogPost, "Content", "publishDate", "Publish Date", "Umbraco.DateTime");
        blogPostChanged |= EnsureProperty(blogPost, "Content", "author", "Author", "Umbraco.TextBox");
        blogPostChanged |= EnsureProperty(blogPost, "Content", "summary", "Summary", "Umbraco.TextArea");
        blogPostChanged |= EnsureProperty(blogPost, "Content", "body", "Body", "Umbraco.RichText");
        blogPostChanged |= EnsureProperty(blogPost, "Content", "tags", "Tags", "Umbraco.Tags");
        blogPostChanged |= EnsureProperty(blogPost, "Content", "featuredImage", "Featured Image", "Umbraco.MediaPicker3");
        if (blogPostIsNew || blogPostChanged)
            SaveContentType(blogPost);
    }

    private void EnsureSiteSettings()
    {
        var siteSettings = EnsureContentType(
            alias: "siteSettings",
            name: "Site Settings",
            description: "Singleton global settings for navigation, footer, and default SEO.",
            isElement: false,
            allowedAsRoot: true,
            out bool isNew);

        bool changed = false;
        changed |= EnsureProperty(siteSettings, "Global", "headerNavigation", "Header Navigation", "Umbraco.MultiNodeTreePicker");
        changed |= EnsureProperty(siteSettings, "Global", "footerLinks", "Footer Links", "Umbraco.MultiNodeTreePicker");
        changed |= EnsureProperty(siteSettings, "Global", "footerText", "Footer Text", "Umbraco.TextArea");
        changed |= EnsureProperty(siteSettings, "SEO", "defaultSeoTitle", "Default SEO Title", "Umbraco.TextBox");
        changed |= EnsureProperty(siteSettings, "SEO", "defaultSeoDescription", "Default SEO Description", "Umbraco.TextArea");

        if (isNew || changed)
            SaveContentType(siteSettings);
    }

    private void EnsureBlockTypes()
    {
        var heroBlock = EnsureContentType(
            alias: "heroBlock",
            name: "Hero Block",
            description: "Reusable hero section block.",
            isElement: true,
            allowedAsRoot: false,
            out bool heroBlockIsNew);
        bool heroBlockChanged = false;
        heroBlockChanged |= EnsureProperty(heroBlock, "Content", "heading", "Heading", "Umbraco.TextBox");
        heroBlockChanged |= EnsureProperty(heroBlock, "Content", "text", "Text", "Umbraco.TextArea");
        heroBlockChanged |= EnsureProperty(heroBlock, "Content", "backgroundImage", "Background Image", "Umbraco.MediaPicker3");
        heroBlockChanged |= EnsureProperty(heroBlock, "Content", "ctaText", "CTA Text", "Umbraco.TextBox");
        heroBlockChanged |= EnsureProperty(heroBlock, "Content", "ctaLink", "CTA Link", "Umbraco.ContentPicker");
        if (heroBlockIsNew || heroBlockChanged)
            SaveContentType(heroBlock);

        var ctaBlock = EnsureContentType(
            alias: "ctaBlock",
            name: "CTA Block",
            description: "Reusable call-to-action block.",
            isElement: true,
            allowedAsRoot: false,
            out bool ctaBlockIsNew);
        bool ctaBlockChanged = false;
        ctaBlockChanged |= EnsureProperty(ctaBlock, "Content", "title", "Title", "Umbraco.TextBox");
        ctaBlockChanged |= EnsureProperty(ctaBlock, "Content", "description", "Description", "Umbraco.TextArea");
        ctaBlockChanged |= EnsureProperty(ctaBlock, "Content", "buttonText", "Button Text", "Umbraco.TextBox");
        ctaBlockChanged |= EnsureProperty(ctaBlock, "Content", "buttonUrl", "Button URL", "Umbraco.TextBox");
        if (ctaBlockIsNew || ctaBlockChanged)
            SaveContentType(ctaBlock);

        var productTeaserBlock = EnsureContentType(
            alias: "productTeaserBlock",
            name: "Product Teaser Block",
            description: "Reusable product teaser block.",
            isElement: true,
            allowedAsRoot: false,
            out bool productTeaserBlockIsNew);
        bool productTeaserBlockChanged = false;
        productTeaserBlockChanged |= EnsureProperty(productTeaserBlock, "Content", "productName", "Product Name", "Umbraco.TextBox");
        productTeaserBlockChanged |= EnsureProperty(productTeaserBlock, "Content", "image", "Image", "Umbraco.MediaPicker3");
        productTeaserBlockChanged |= EnsureProperty(productTeaserBlock, "Content", "price", "Price", "Umbraco.TextBox");
        productTeaserBlockChanged |= EnsureProperty(productTeaserBlock, "Content", "link", "Link", "Umbraco.ContentPicker");
        if (productTeaserBlockIsNew || productTeaserBlockChanged)
            SaveContentType(productTeaserBlock);

    }

    private void SaveContentType(IContentType contentType)
    {
        EnsureUniquePropertyKeys(contentType);
        _contentTypeService.Save(contentType);
    }

    private static void EnsureUniquePropertyKeys(IContentType contentType)
    {
        var seen = new HashSet<Guid>();

        foreach (var propertyType in contentType.PropertyTypes)
        {
            if (propertyType.Key == Guid.Empty || seen.Contains(propertyType.Key))
            {
                propertyType.Key = Guid.NewGuid();
            }

            seen.Add(propertyType.Key);
        }
    }

    private IContentType EnsureContentType(string alias, string name, string description, bool isElement, bool allowedAsRoot, out bool isNew)
    {
        var existing = _contentTypeService.Get(alias);
        if (existing is not null)
        {
            existing.Name = name;
            existing.Description = description;
            existing.IsElement = isElement;
            existing.AllowedAsRoot = allowedAsRoot;
            isNew = false;
            return existing;
        }

        isNew = true;
        var contentType = new ContentType(_shortStringHelper, -1)
        {
            Alias = alias,
            Name = name,
            Description = description,
            Icon = "icon-document",
            Thumbnail = "folder.png",
            IsElement = isElement,
            AllowedAsRoot = allowedAsRoot
        };

        // Persist the shell first. Subsequent property additions are saved via update path.
        _contentTypeService.Save(contentType);
        return _contentTypeService.Get(alias) ?? contentType;
    }

    private bool EnsureComposition(IContentType contentType, IContentType composition)
    {
        if (contentType.ContentTypeCompositionExists(composition.Alias))
            return false;

        contentType.AddContentType(composition);
        return true;
    }

    private bool EnsureProperty(IContentType contentType, string groupName, string alias, string name, string preferredEditorAlias)
    {
        if (contentType.PropertyTypeExists(alias))
            return false;

        var dataType = ResolveDataType(preferredEditorAlias);
        if (dataType is null)
        {
            _logger.LogWarning(
                "Could not resolve a data type for editor alias {EditorAlias}. Skipping property {PropertyAlias} on {ContentTypeAlias}.",
                preferredEditorAlias,
                alias,
                contentType.Alias);
            return false;
        }

        var groupAlias = _shortStringHelper.CleanStringForSafeAlias(groupName);
        if (contentType.PropertyGroups.Any(x => x.Alias.InvariantEquals(groupAlias)) == false)
        {
            contentType.AddPropertyGroup(groupAlias, groupName);
        }

        var propertyType = new PropertyType(_shortStringHelper, dataType.EditorAlias, dataType.DatabaseType, alias)
        {
            Name = name,
            DataTypeKey = dataType.Key
        };

        contentType.AddPropertyType(propertyType);
        contentType.MovePropertyType(alias, groupAlias);
        return true;
    }

    private IDataType? ResolveDataType(string preferredEditorAlias)
    {
        var dataTypes = _dataTypeService.GetAll().ToList();

        var match = dataTypes.FirstOrDefault(x => x.EditorAlias.InvariantEquals(preferredEditorAlias));
        if (match is not null)
        {
            return match;
        }

        // Fallbacks for common built-in aliases/names across environments.
        return preferredEditorAlias switch
        {
            "Umbraco.TextBox" => dataTypes.FirstOrDefault(x => x.Name.InvariantEquals("Textstring")),
            "Umbraco.TextArea" => dataTypes.FirstOrDefault(x => x.Name.InvariantEquals("Textarea")),
            "Umbraco.TrueFalse" => dataTypes.FirstOrDefault(x => x.Name.InvariantEquals("True/false")),
            "Umbraco.DateTime" => dataTypes.FirstOrDefault(x => x.Name.InvariantEquals("Date Picker")),
            "Umbraco.RichText" => dataTypes.FirstOrDefault(x => x.Name.InvariantEquals("Rich Text Editor")),
            "Umbraco.MediaPicker3" => dataTypes.FirstOrDefault(x => x.Name.InvariantEquals("Media Picker")),
            "Umbraco.ContentPicker" => dataTypes.FirstOrDefault(x => x.Name.InvariantEquals("Content Picker")),
            "Umbraco.MultiNodeTreePicker" => dataTypes.FirstOrDefault(x => x.Name.InvariantEquals("Multi Node Treepicker")),
            "Umbraco.BlockList" => dataTypes.FirstOrDefault(x => x.Name.InvariantEquals("Block List")),
            "Umbraco.Tags" => dataTypes.FirstOrDefault(x => x.Name.InvariantEquals("Tags")),
            _ => null
        };
    }
}
