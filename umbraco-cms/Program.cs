WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddComposers()
    .Build();

// OpenIddict (Umbraco 17 backoffice auth) rejects plain HTTP with error ID2083.
// Also relax cookie Secure/SameSite policy — without this the browser silently
// drops Secure cookies on HTTP and the login button appears to do nothing.
if (builder.Environment.IsDevelopment())
{
    builder.Services.PostConfigure<OpenIddict.Server.AspNetCore.OpenIddictServerAspNetCoreOptions>(
        options => options.DisableTransportSecurityRequirement = true);

    // ConfigureApplicationCookie only covers the default Identity scheme.
    // PostConfigureAll covers every cookie auth scheme, including Umbraco's
    // backoffice scheme — needed so the browser stores the session cookie on HTTP.
    builder.Services.PostConfigureAll<Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationOptions>(options =>
    {
        options.Cookie.SecurePolicy = Microsoft.AspNetCore.Http.CookieSecurePolicy.None;
        options.Cookie.SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Lax;
    });
}

// CORS — allow the React SPA origin(s) to call /api/content/* endpoints.
// Origins are read from Shop404:CorsOrigins (comma-separated).
// Set via env var Shop404__CorsOrigins or appsettings.
builder.Services.AddCors(options =>
{
    options.AddPolicy("Spa", policy =>
    {
        var raw = builder.Configuration["Shop404:CorsOrigins"] ?? string.Empty;
        var origins = raw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (origins.Length > 0)
            policy.WithOrigins(origins).AllowAnyMethod().AllowAnyHeader();
    });
});

WebApplication app = builder.Build();

await app.BootUmbracoAsync();

// CORS middleware must run before Umbraco's pipeline.
app.UseCors("Spa");

app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
    });

await app.RunAsync();
