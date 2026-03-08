# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Shop404.Cms.csproj .
RUN dotnet restore --verbosity minimal

COPY . .
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runner
WORKDIR /app

COPY --from=build /app/publish .

# Umbraco runtime directories — override with volume mounts in compose.
RUN mkdir -p wwwroot/media umbraco/Logs umbraco/Data

# ASP.NET Core listens on 8080 in containers by default.
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Shop404.Cms.dll"]
