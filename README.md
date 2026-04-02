# Prueba Técnica Torre y Torres

Este repositorio contiene una solución fullstack con:
- **Backend .NET (auth-service)**: Servicio de autenticación con JWT.
- **Backend Laravel (crm-service)**: API RESTful para gestión de clientes y pedidos.
- **Frontend Angular (dashboard-app)**: Aplicación web.
- **Infraestructura Docker**: Orquestación de servicios y base de datos SQL Server.

---

## Requisitos

- Docker y Docker Compose
- PowerShell (para comandos de base de datos)
- .NET 8 SDK (para migraciones manuales)
- Node.js y Angular CLI (opcional, para desarrollo frontend)

---

## 1. Levantar el entorno con Docker

Desde la raíz del proyecto:

```sh
docker-compose up --build -d
```

Esto levantará:
- SQL Server (`mssql`)
- API .NET (`dotnet`)
- API Laravel (`php`)
- Frontend Angular (`angular`)
- Nginx reverse proxy (`nginx`)

---

## 2. Crear las bases de datos en SQL Server

Abre una terminal y ejecuta:

```sh
# Crear base de datos AuthDB (para .NET)
docker exec -it mssql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost \
  -U sa \
  -P "LaMeg@Password123!" \
  -C \
  -Q "CREATE DATABASE AuthDB"

# Crear base de datos CrmDB (para Laravel)
docker exec -it mssql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost \
  -U sa \
  -P "LaMeg@Password123!" \
  -C \
  -Q "IF DB_ID('CrmDB') IS NULL CREATE DATABASE CrmDB"
```

Puedes verificar las bases creadas con:

```sh
docker exec -it mssql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost \
  -U sa \
  -P "LaMeg@Password123!" \
  -C \
  -Q "SELECT name FROM sys.databases"
```

---

## 3. Ejecutar migraciones

### .NET (auth-service)

Desde la carpeta `auth-service/AuthService`:

```sh
dotnet ef database update
```

> Si es la primera vez, puedes crear la migración inicial con:
> ```
> dotnet ef migrations add InitialCreate
> ```

### Laravel (crm-service)

Desde la carpeta `crm-service`:

```sh
composer install
php artisan migrate
```

---

## 4. Acceso a las aplicaciones

- **Frontend Angular:**  
  http://localhost

- **API .NET (Swagger):**  
  http://localhost:5000/swagger/index.html

- **API Laravel:**  
  http://localhost/api/v1/clientes

---


---

## 5. Ejecutar tests en Laravel (crm-service)

Desde la carpeta `crm-service` puedes ejecutar los tests de PHP con:

```sh
composer test
# o
php artisan test
```

Esto ejecutará todos los tests unitarios y de características (Feature) usando SQLite en memoria.

Para ejecutar solo los tests de un archivo específico, por ejemplo solo los de pedidos:

```sh
php artisan test --filter=PedidoTest
```

---

## 6. Ejecutar pruebas unitarias en Angular (dashboard-app)

Desde la carpeta `dashboard-app` ejecuta:

```sh
npm install
ng test --watch=false
```

Esto ejecutará todos los tests unitarios y de integración del frontend en modo consola (sin abrir navegador).

---

## 7. Ejecutar pruebas unitarias en C# (.NET)

Desde la carpeta `auth-service/AuthService` ejecuta:

```sh
dotnet test
```

Esto compilará y ejecutará todos los tests unitarios definidos en el proyecto o solución de .NET. Si no tienes tests definidos, verás solo mensajes de compilación exitosa.

## 8. Pruebas de integración entre microservicios

Desde la carpeta `auth-service/IntegrationTests` ejecuta:

```sh
dotnet test
```

Esto ejecutará pruebas de integración que validan:

- Que el microservicio de autenticación (.NET) entrega un JWT válido y permite acceder a endpoints protegidos del CRM (Laravel).
- Que es posible crear un cliente y un pedido en el CRM usando autenticación JWT, y luego listar los pedidos asociados.

Las pruebas están en:
- `auth-service/IntegrationTests/MicroservicesIntegrationTests.cs`
- `auth-service/IntegrationTests/ClientesPedidosIntegrationTests.cs`
- `auth-service/IntegrationTests/RegisterAndLoginIntegrationTests.cs` (registro, login y acceso protegido)

**Requisitos:**
- Todos los servicios deben estar levantados con Docker Compose y accesibles en `localhost`.
- El usuario de integración debe existir o ser creado por la prueba.

Puedes agregar más pruebas siguiendo el patrón de estos archivos para validar otros flujos críticos entre microservicios.

---

### Prueba de flujo crítico de negocio (PHP)

En el backend Laravel (`crm-service`) existe el test:
- `tests/Feature/FlujoCriticoNegocioTest.php`

Este test automatiza el flujo completo:
1. Registro de usuario en AuthService (.NET)
2. Login y obtención de JWT
3. Creación de cliente en CRM
4. Creación de pedido asociado
5. Consulta del dashboard

#### Para ejecutarlo:

Desde la carpeta `crm-service`:

```sh
php artisan test --filter=FlujoCriticoNegocioTest
```

Esto validará que todos los microservicios funcionan integrados en los flujos más importantes del negocio.

---

- Las variables de entorno y secretos están configurados en los archivos `.env` y en los servicios de Docker.
- El sistema utiliza JWT para autenticación entre servicios.
- Si necesitas limpiar los contenedores y volúmenes:
  ```sh
  docker-compose down -v
  ```
---