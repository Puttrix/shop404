using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Actions;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;

namespace Shop404.Cms.Bootstrap;

/// <summary>
/// Seeds the Editor and Publisher user groups on first startup.
/// Fully idempotent — skips if a group with the given alias already exists.
///
/// Role summary:
///   shop404-editor    — create/edit content; submit for review; cannot publish.
///   shop404-publisher — all editor permissions plus publish, rollback, delete.
///   Administrators    — built-in Umbraco group; schema, settings, users, infra.
///
/// See docs/EDITORIAL_WORKFLOW.md for the full approval workflow and
/// two-person review rules for legal/compliance pages.
/// </summary>
[ComposeAfter(typeof(Shop404ContentTypesComposer))]
public class Shop404UserGroupBootstrapperComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
        => builder.AddNotificationAsyncHandler<UmbracoApplicationStartedNotification, Shop404UserGroupBootstrapper>();
}

public class Shop404UserGroupBootstrapper : INotificationAsyncHandler<UmbracoApplicationStartedNotification>
{
    private readonly IRuntimeState _runtimeState;
    private readonly IUserGroupService _userGroupService;
    private readonly IShortStringHelper _shortStringHelper;
    private readonly ILogger<Shop404UserGroupBootstrapper> _logger;

    public Shop404UserGroupBootstrapper(
        IRuntimeState runtimeState,
        IUserGroupService userGroupService,
        IShortStringHelper shortStringHelper,
        ILogger<Shop404UserGroupBootstrapper> logger)
    {
        _runtimeState = runtimeState;
        _userGroupService = userGroupService;
        _shortStringHelper = shortStringHelper;
        _logger = logger;
    }

    public async Task HandleAsync(UmbracoApplicationStartedNotification notification, CancellationToken cancellationToken)
    {
        if (_runtimeState.Level != RuntimeLevel.Run)
            return;

        await EnsureGroupAsync("shop404-editor", "Shop404 Editor", EditorPermissions);
        await EnsureGroupAsync("shop404-publisher", "Shop404 Publisher", PublisherPermissions);
    }

    private async Task EnsureGroupAsync(string alias, string name, ISet<string> permissions)
    {
        var existing = await _userGroupService.GetAsync(alias);
        if (existing is not null)
        {
            _logger.LogInformation("User group '{Alias}' already exists — skipping.", alias);
            return;
        }

        var group = new UserGroup(_shortStringHelper)
        {
            Alias = alias,
            Name = name,
            Icon = Constants.Icons.UserGroup,
            Permissions = permissions,
        };
        group.AddAllowedSection("content");

        var result = await _userGroupService.CreateAsync(group, Constants.Security.SuperUserKey, Array.Empty<Guid>());
        if (result.Success)
            _logger.LogInformation("Created user group '{Alias}'.", alias);
        else
            _logger.LogWarning("Failed to create user group '{Alias}': {Status}", alias, result.Status);
    }

    // ── Permission sets ──────────────────────────────────────────────────────
    // Editor: browse, create, update. Cannot publish, delete, move, or rollback.

    private static readonly ISet<string> EditorPermissions = new HashSet<string>
    {
        ActionBrowse.ActionLetter.ToString(),   // F — view node
        ActionNew.ActionLetter.ToString(),       // C — create child node
        ActionUpdate.ActionLetter.ToString(),    // U — save draft
        ActionNotify.ActionLetter.ToString(),    // I — email notifications
    };

    // Publisher: full content operations — can publish and roll back.
    // Admins use the built-in Administrators group for schema/infra access.

    private static readonly ISet<string> PublisherPermissions = new HashSet<string>
    {
        ActionBrowse.ActionLetter.ToString(),    // F — view node
        ActionNew.ActionLetter.ToString(),        // C — create child node
        ActionUpdate.ActionLetter.ToString(),     // U — save draft
        ActionPublish.ActionLetter.ToString(),    // P — publish to live
        ActionRollback.ActionLetter.ToString(),   // R — rollback to previous version
        ActionDelete.ActionLetter.ToString(),     // D — delete node
        ActionMove.ActionLetter.ToString(),       // M — move in tree
        ActionCopy.ActionLetter.ToString(),       // O — copy node (ActionCopy)
        ActionSort.ActionLetter.ToString(),       // S — reorder children
        ActionNotify.ActionLetter.ToString(),     // I — email notifications
    };
}
