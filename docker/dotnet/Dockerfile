
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5001

# Copia los certificados SSL (PEM)
COPY docker/dotnet/ssl /https

# Configuración para usar certificados PEM (CRT y KEY)
ENV ASPNETCORE_URLS=https://+:5001
ENV ASPNETCORE_Kestrel__Certificates__Default__Path=/https/server.crt
ENV ASPNETCORE_Kestrel__Certificates__Default__KeyPath=/https/server.key

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY auth-service/AuthService ./AuthService
# Ajusta aquí si el archivo de solución es .slnx
COPY auth-service/AuthService.slnx ./AuthService.sln
RUN dotnet publish ./AuthService/AuthService.csproj -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "AuthService.dll"]
