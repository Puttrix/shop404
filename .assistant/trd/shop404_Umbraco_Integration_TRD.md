# Technical Requirements Document (TRD)

## Project: shop404 + Umbraco CMS Integration

------------------------------------------------------------------------

# 1. Technical Overview

## 1.1 Objective

Integrate **Umbraco CMS (latest LTS, .NET 8)** into the existing
**shop404** repository to enable:

-   Editing all marketing and informational pages via Umbraco
-   Managing global site settings (navigation, footer, SEO)
-   Managing reusable content blocks
-   Delivering content to the React SPA via API
-   Containerized deployment via Docker
-   CI/CD via GitHub Actions
-   Deployment via Portainer Stack

------------------------------------------------------------------------

# 2. High-Level Architecture

    React SPA (shop404)
        ↓ fetch
    Umbraco Content Delivery API
        ↓
    Umbraco CMS (.NET 8)
        ↓
    SQL Server

Umbraco will run as a **headless CMS backend**, delivering JSON content
to the React frontend.

------------------------------------------------------------------------

# 3. Content Model Blueprint (Umbraco Document Types)

## 3.1 Composition: BasePage

Shared across all pages:

-   Page Title (Textstring)
-   Slug (Textstring)
-   SEO Title (Textstring)
-   SEO Description (Textarea)
-   Hide From Navigation (Boolean)
-   OpenGraph Image (Media Picker)

------------------------------------------------------------------------

## 3.2 Home Page

Inherits: BasePage

Properties: - Hero Heading (Textstring) - Hero Text (Textarea) - Hero
Image (Media Picker) - Featured Products Section (Block List) - Featured
Articles (Content Picker)

Template: Headless (API only)

------------------------------------------------------------------------

## 3.3 Standard Page

Inherits: BasePage

Properties: - Body Content (Rich Text Editor) - Content Blocks (Block
List)

Used for: - About - FAQ - Terms - Privacy

------------------------------------------------------------------------

## 3.4 Blog / Knowledge Base Overview

Inherits: BasePage

Properties: - Intro Text (Textarea)

Children: - Blog Post

------------------------------------------------------------------------

## 3.5 Blog Post

Inherits: BasePage

Properties: - Publish Date (Date Picker) - Author (Textstring) - Summary
(Textarea) - Body (Rich Text Editor) - Tags (Tags Property Editor) -
Featured Image (Media Picker)

------------------------------------------------------------------------

## 3.6 Site Settings (Singleton)

Properties: - Header Navigation (Multi-node tree picker) - Footer Links
(Multi-node tree picker) - Footer Text (Textarea) - Default SEO Title -
Default SEO Description

------------------------------------------------------------------------

## 3.7 Block Types

### Hero Block

-   Heading
-   Text
-   Background Image
-   CTA Text
-   CTA Link

### CTA Block

-   Title
-   Description
-   Button Text
-   Button URL

### Product Teaser Block

-   Product Name
-   Image
-   Price
-   Link

------------------------------------------------------------------------

# 4. Detailed API Contract

Umbraco will expose content using the **Content Delivery API**.

Base URL:

    /umbraco/delivery/api/v2/content

------------------------------------------------------------------------

## 4.1 Get Page by Route

GET `/api/content/page?route=/about`

Response:

``` json
{
  "id": "1234",
  "contentType": "standardPage",
  "name": "About",
  "properties": {
    "pageTitle": "About Us",
    "bodyContent": "<p>Company info...</p>",
    "seoTitle": "About - Shop404",
    "seoDescription": "Learn more about us."
  }
}
```

------------------------------------------------------------------------

## 4.2 Get Navigation

GET `/api/content/navigation`

Response:

``` json
{
  "items": [
    { "title": "Home", "url": "/" },
    { "title": "About", "url": "/about" }
  ]
}
```

------------------------------------------------------------------------

## 4.3 Get Blog Posts

GET `/api/content/blog?limit=10`

Response:

``` json
{
  "items": [
    {
      "title": "How to track experiments",
      "slug": "/blog/how-to-track",
      "publishDate": "2025-01-01",
      "summary": "Tracking guide..."
    }
  ]
}
```

------------------------------------------------------------------------

## 4.4 Get Blog Post by Slug

GET `/api/content/blog/{slug}`

------------------------------------------------------------------------

## 4.5 Get Site Settings

GET `/api/content/settings`

Response:

``` json
{
  "footerText": "© Shop404 2026",
  "defaultSeoTitle": "Shop404"
}
```

------------------------------------------------------------------------

# 5. Frontend Integration Requirements

React SPA must:

-   Implement a CMS service layer (`cmsService.ts`)
-   Fetch page data before route render
-   Map Umbraco blocks to React components
-   Handle fallback for missing content
-   Implement caching layer (optional)

------------------------------------------------------------------------

# 6. Containerization Requirements

## 6.1 Services

-   shop404-frontend
-   umbraco-cms
-   sql-server

## 6.2 Required Volumes

-   `/umbraco/Data`
-   `/umbraco/Logs`
-   `/wwwroot/media`

------------------------------------------------------------------------

# 7. CI/CD Requirements

GitHub Actions must:

1.  Build frontend
2.  Build Umbraco image
3.  Tag image (latest + SHA)
4.  Push to registry
5.  Trigger Portainer stack redeploy

------------------------------------------------------------------------

# 8. Security Requirements

-   HTTPS enforced
-   Secure Umbraco admin URL
-   Environment-based secrets
-   Role-based CMS access
-   No public DB exposure

------------------------------------------------------------------------

# 9. Performance Requirements

-   Enable output caching
-   CDN-ready media handling
-   API response caching
-   Lazy loading in SPA

------------------------------------------------------------------------

# 10. Acceptance Criteria

-   Editors can edit all marketing pages
-   SPA dynamically renders CMS content
-   Navigation fully CMS-driven
-   Blog posts fully CMS-driven
-   Deployment works via GitHub + Portainer
-   Media persists across restarts

------------------------------------------------------------------------

# 11. Risks & Mitigation

  Risk                         Mitigation
  ---------------------------- -------------------------------
  React & CMS model mismatch   Define strict API schema
  Media loss                   Persistent volumes
  SEO issues                   SSR or prerender option later
  API latency                  Add caching
  Unauthorized access          Secure admin endpoint

------------------------------------------------------------------------

# End of Document
