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

        EnsureBasePageComposition();
        EnsurePageTypes();
        EnsureSiteSettings();
        EnsureBlockTypes();
    }

    private void EnsureBasePageComposition()
    {
        var basePage = EnsureContentType(
            alias: "basePage",
            name: "Base Page",
            description: "Shared page fields used by marketing pages.",
            isElement: true,
            allowedAsRoot: false);

        EnsureProperty(basePage, "Content", "pageTitle", "Page Title", "Umbraco.TextBox");
        EnsureProperty(basePage, "Content", "slug", "Slug", "Umbraco.TextBox");
        EnsureProperty(basePage, "SEO", "seoTitle", "SEO Title", "Umbraco.TextBox");
        EnsureProperty(basePage, "SEO", "seoDescription", "SEO Description", "Umbraco.TextArea");
        EnsureProperty(basePage, "SEO", "hideFromNavigation", "Hide From Navigation", "Umbraco.TrueFalse");
        EnsureProperty(basePage, "SEO", "openGraphImage", "OpenGraph Image", "Umbraco.MediaPicker3");

        _contentTypeService.Save(basePage);
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
            allowedAsRoot: true);
        EnsureComposition(homePage, basePage);
        EnsureProperty(homePage, "Content", "heroHeading", "Hero Heading", "Umbraco.TextBox");
        EnsureProperty(homePage, "Content", "heroText", "Hero Text", "Umbraco.TextArea");
        EnsureProperty(homePage, "Content", "heroImage", "Hero Image", "Umbraco.MediaPicker3");
        EnsureProperty(homePage, "Content", "featuredProductsSection", "Featured Products Section", "Umbraco.BlockList");
        EnsureProperty(homePage, "Content", "featuredArticles", "Featured Articles", "Umbraco.ContentPicker");
        _contentTypeService.Save(homePage);

        var standardPage = EnsureContentType(
            alias: "standardPage",
            name: "Standard Page",
            description: "Standard marketing/informational page.",
            isElement: false,
            allowedAsRoot: false);
        EnsureComposition(standardPage, basePage);
        EnsureProperty(standardPage, "Content", "bodyContent", "Body Content", "Umbraco.RichText");
        EnsureProperty(standardPage, "Content", "contentBlocks", "Content Blocks", "Umbraco.BlockList");
        _contentTypeService.Save(standardPage);

        var blogOverview = EnsureContentType(
            alias: "blogOverview",
            name: "Blog / Knowledge Base Overview",
            description: "Root node for blog and knowledge base entries.",
            isElement: false,
            allowedAsRoot: false);
        EnsureComposition(blogOverview, basePage);
        EnsureProperty(blogOverview, "Content", "introText", "Intro Text", "Umbraco.TextArea");
        _contentTypeService.Save(blogOverview);

        var blogPost = EnsureContentType(
            alias: "blogPost",
            name: "Blog Post",
            description: "Blog article/document page.",
            isElement: false,
            allowedAsRoot: false);
        EnsureComposition(blogPost, basePage);
        EnsureProperty(blogPost, "Content", "publishDate", "Publish Date", "Umbraco.DateTime");
        EnsureProperty(blogPost, "Content", "author", "Author", "Umbraco.TextBox");
        EnsureProperty(blogPost, "Content", "summary", "Summary", "Umbraco.TextArea");
        EnsureProperty(blogPost, "Content", "body", "Body", "Umbraco.RichText");
        EnsureProperty(blogPost, "Content", "tags", "Tags", "Umbraco.Tags");
        EnsureProperty(blogPost, "Content", "featuredImage", "Featured Image", "Umbraco.MediaPicker3");
        _contentTypeService.Save(blogPost);
    }

    private void EnsureSiteSettings()
    {
        var siteSettings = EnsureContentType(
            alias: "siteSettings",
            name: "Site Settings",
            description: "Singleton global settings for navigation, footer, and default SEO.",
            isElement: false,
            allowedAsRoot: true);

        EnsureProperty(siteSettings, "Global", "headerNavigation", "Header Navigation", "Umbraco.MultiNodeTreePicker");
        EnsureProperty(siteSettings, "Global", "footerLinks", "Footer Links", "Umbraco.MultiNodeTreePicker");
        EnsureProperty(siteSettings, "Global", "footerText", "Footer Text", "Umbraco.TextArea");
        EnsureProperty(siteSettings, "SEO", "defaultSeoTitle", "Default SEO Title", "Umbraco.TextBox");
        EnsureProperty(siteSettings, "SEO", "defaultSeoDescription", "Default SEO Description", "Umbraco.TextArea");

        _contentTypeService.Save(siteSettings);
    }

    private void EnsureBlockTypes()
    {
        var heroBlock = EnsureContentType(
            alias: "heroBlock",
            name: "Hero Block",
            description: "Reusable hero section block.",
            isElement: true,
            allowedAsRoot: false);
        EnsureProperty(heroBlock, "Content", "heading", "Heading", "Umbraco.TextBox");
        EnsureProperty(heroBlock, "Content", "text", "Text", "Umbraco.TextArea");
        EnsureProperty(heroBlock, "Content", "backgroundImage", "Background Image", "Umbraco.MediaPicker3");
        EnsureProperty(heroBlock, "Content", "ctaText", "CTA Text", "Umbraco.TextBox");
        EnsureProperty(heroBlock, "Content", "ctaLink", "CTA Link", "Umbraco.ContentPicker");
        _contentTypeService.Save(heroBlock);

        var ctaBlock = EnsureContentType(
            alias: "ctaBlock",
            name: "CTA Block",
            description: "Reusable call-to-action block.",
            isElement: true,
            allowedAsRoot: false);
        EnsureProperty(ctaBlock, "Content", "title", "Title", "Umbraco.TextBox");
        EnsureProperty(ctaBlock, "Content", "description", "Description", "Umbraco.TextArea");
        EnsureProperty(ctaBlock, "Content", "buttonText", "Button Text", "Umbraco.TextBox");
        EnsureProperty(ctaBlock, "Content", "buttonUrl", "Button URL", "Umbraco.TextBox");
        _contentTypeService.Save(ctaBlock);

        var productTeaserBlock = EnsureContentType(
            alias: "productTeaserBlock",
            name: "Product Teaser Block",
            description: "Reusable product teaser block.",
            isElement: true,
            allowedAsRoot: false);
        EnsureProperty(productTeaserBlock, "Content", "productName", "Product Name", "Umbraco.TextBox");
        EnsureProperty(productTeaserBlock, "Content", "image", "Image", "Umbraco.MediaPicker3");
        EnsureProperty(productTeaserBlock, "Content", "price", "Price", "Umbraco.TextBox");
        EnsureProperty(productTeaserBlock, "Content", "link", "Link", "Umbraco.ContentPicker");
        _contentTypeService.Save(productTeaserBlock);
    }

    private IContentType EnsureContentType(string alias, string name, string description, bool isElement, bool allowedAsRoot)
    {
        var existing = _contentTypeService.Get(alias);
        if (existing is not null)
        {
            existing.Name = name;
            existing.Description = description;
            existing.IsElement = isElement;
            existing.AllowedAsRoot = allowedAsRoot;
            return existing;
        }

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

        return contentType;
    }

    private void EnsureComposition(IContentType contentType, IContentType composition)
    {
        if (contentType.ContentTypeCompositionExists(composition.Alias))
        {
            return;
        }

        contentType.AddContentType(composition);
    }

    private void EnsureProperty(IContentType contentType, string groupName, string alias, string name, string preferredEditorAlias)
    {
        if (contentType.PropertyTypeExists(alias))
        {
            return;
        }

        var dataType = ResolveDataType(preferredEditorAlias);
        if (dataType is null)
        {
            _logger.LogWarning(
                "Could not resolve a data type for editor alias {EditorAlias}. Skipping property {PropertyAlias} on {ContentTypeAlias}.",
                preferredEditorAlias,
                alias,
                contentType.Alias);
            return;
        }

        var groupAlias = _shortStringHelper.CleanStringForSafeAlias(groupName);
        if (contentType.PropertyGroups.Any(x => x.Alias.InvariantEquals(groupAlias)) == false)
        {
            contentType.AddPropertyGroup(groupAlias, groupName);
        }

        var propertyType = new PropertyType(_shortStringHelper, dataType)
        {
            Alias = alias,
            Name = name
        };

        contentType.AddPropertyType(propertyType);
        contentType.MovePropertyType(alias, groupAlias);
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
