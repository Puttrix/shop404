# Editorial Workflow

Defines role-based publishing controls, the content approval workflow, and
compliance rules for the Shop404 Umbraco CMS.

---

## Roles

Three roles operate the CMS. The first two are bootstrapped automatically by
`UserGroupBootstrapper.cs`; the third uses Umbraco's built-in group.

| Role | Umbraco group alias | Who | Content access |
|------|--------------------|----|----------------|
| **Editor** | `shop404-editor` | Content authors | Create and edit draft content; cannot publish |
| **Publisher** | `shop404-publisher` | Content lead | Full content operations: publish, rollback, delete |
| **Admin** | `Administrators` (built-in) | Dev/ops | Schema, settings, user management, infrastructure |

### Permission detail

| Permission | Editor | Publisher | Admin |
|-----------|--------|-----------|-------|
| Browse / view node | ✓ | ✓ | ✓ |
| Create child node | ✓ | ✓ | ✓ |
| Save draft | ✓ | ✓ | ✓ |
| Publish to live | — | ✓ | ✓ |
| Rollback to version | — | ✓ | ✓ |
| Delete node | — | ✓ | ✓ |
| Move / copy / sort | — | ✓ | ✓ |
| Schema / data types | — | — | ✓ |
| User management | — | — | ✓ |
| Settings / infra | — | — | ✓ |

---

## Approval Workflow

Umbraco 17 CE does not include a native multi-step approval workflow. The
following process is enforced by convention and documented here for all team
members.

### Standard content update

1. **Editor** logs in to the backoffice and edits a draft.
2. Editor saves (does **not** publish) and notifies the Publisher via the
   team's agreed channel (e.g. Slack, Linear ticket, email).
3. **Publisher** reviews the draft in the backoffice (`Content` → node →
   compare with previous version using the **Versions** tab).
4. Publisher publishes the node.
5. Publisher confirms the change is live on the production site.

### Urgency override

If a Publisher is unavailable and a fix is time-critical (e.g. live legal
compliance issue):

1. A second Publisher or Admin may publish directly.
2. The action must be logged in the team channel immediately after.
3. A retrospective review is completed within 24 hours.

---

## Two-Person Review Rule (Legal / Compliance Pages)

The following pages contain legal or compliance-sensitive content and require
**two people** to sign off before publishing:

| Route | Node | Reason |
|-------|------|--------|
| `/terms` | "Terms and Conditions" | Legal terms; binding on users |
| `/privacy` | "Privacy Policy" | GDPR / data protection obligations |

### Process

1. Editor prepares the draft and flags it as ready for legal review.
2. **Reviewer 1** (Publisher or designated legal reviewer) reads and approves
   the draft in writing (Slack/email/Linear).
3. **Reviewer 2** (a different Publisher or Admin) independently reviews and
   provides written approval.
4. Only after both approvals does Publisher 2 (or either approved party)
   publish the node.
5. Both approvals and the publish action are logged in the team channel with
   a timestamp.

> **Important:** Do not publish `/terms` or `/privacy` without written approval
> from two separate reviewers. This rule applies even if the change appears
> trivial (e.g. a date update).

---

## Audit Trail

Umbraco records all content actions in its built-in audit log.

**Viewing the audit log:**
1. Log in as Admin.
2. Navigate to **Users** → select a user → scroll to **Audit Log**, or
3. Open a content node → **Info** tab → **History**.

**What is recorded:**
- Saves, publishes, unpublishes, rollbacks, deletes, moves
- Timestamp and user name for each action

**Retention:** Umbraco stores audit entries indefinitely in the database.
Archive or clean old entries via the **Content Version Cleanup** policy in
`appsettings.json` (`EnableCleanup: true`).

---

## Rollback Procedure

To revert a published node to a previous version:

1. Open the content node in the backoffice.
2. Click the **Info** tab → **History** (or **Versions**).
3. Find the version to restore — hover to see the diff.
4. Click **Rollback** → confirm.
5. The node is reverted and **remains published** (Umbraco publishes the
   rolled-back version immediately).
6. Notify the team channel with the version date restored and reason.

**Emergency rollback (full site):**
If a corrupt publish has broken the frontend for multiple routes, restore the
SQL Server database from the last clean backup. See [PORTAINER.md](PORTAINER.md)
for the database volume name and backup procedure.

---

## Assigning Users to Roles

After creating a new backoffice user (Admin → Users → Create), assign them to
the correct group:

1. Open the user in **Admin → Users**.
2. Under **Groups**, add `Shop404 Editor` or `Shop404 Publisher`.
3. Save.

The `shop404-editor` and `shop404-publisher` groups are created automatically
on first startup by `UserGroupBootstrapper.cs`. If they are missing, restart
the CMS container to re-trigger the bootstrapper.

---

## Deferred: Native Approval Workflow

A native content approval workflow (requiring explicit sign-off in the
backoffice before publish) is available via the **Umbraco Workflow** add-on
(paid) or a custom notification handler. This is deferred to a future phase.

If added, the two-person review rule for `/terms` and `/privacy` should be
codified as a mandatory approval step in the workflow engine rather than a
manual convention.
