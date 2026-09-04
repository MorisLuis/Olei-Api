# API consumer ownership

This inventory records the consumer established from the mounted route, authentication middleware, controller session type, service call, and database connection path. `App` uses the client/database authentication flow and `dbConnection(...)`. `CRM` uses `validateJWTWeb`, `req.sessionWeb`, and normally `dbConnectionWeb(...)`.

The connection helper is supporting evidence, not the classification by itself. Where those signals conflict, the endpoint is listed as unclear.

## App

| Endpoints | Service or database access |
| --- | --- |
| `POST /api/auth/loginServer`, `POST /api/auth/login`, `GET /api/auth/logoutServer`, `GET /api/auth/logoutUser`, `POST /api/auth/refreshServer`, `POST /api/auth/refresh` | `services/auth/database/*`, `services/auth/client/*`; central authentication plus App tenant `dbConnection(...)` where needed |
| `GET /api/almacenes`, `GET /api/almacenes/update` | `almacenesService`; App session and `dbConnection(...)` |
| `PUT /api/costos` | `codebarService`; App session and `dbConnection(...)` |
| `POST /api/inventory` | `inventoryServices`; App session and `dbConnection(...)` |
| `GET /api/inventory/search/product`, `GET /api/inventory/search/product/withoutcodebar` | `services/products`; App session and `dbConnection(...)` |
| `GET /api/product/byStock`, `GET /api/product/byStockCount`, `GET /api/product/byStockAndCodeBar`, `GET /api/product/:id` | `services/products` (with direct controller access for `/:id`); `validateJWTClient`, App session, and `dbConnection(...)` |
| `GET /api/documents/types` | Direct database access in `typeOfDocuments.controller`; App session and `dbConnection(...)` |
| `GET /api/typeofmovements` | Direct database access in `typeofmovements` controller; App session and `dbConnection(...)` |
| `GET /api/vendedores`, `GET /api/vendedores/:id` | `services/vendedores`; App session and `dbConnection(...)` |

## CRM

| Endpoints | Service or database access |
| --- | --- |
| `POST /api/auth/loginWeb`, `GET /api/auth/renewWeb`, `GET /api/auth/logout` | `authServices` plus CRM web-session helpers; central database and Redis |
| `GET /api/product`, `GET /api/product/web/:id`, `GET /api/product/count`, `GET /api/product/search` | `productsServices`; CRM web session and `dbConnectionWeb(...)` |
| `GET /api/search/familias`, `GET /api/search/marcas`, `GET /api/search/codigos` | `searchServices`; CRM web session and `dbConnectionWeb(...)` |
| All routes under `/api/client` | `services/clients/*`; CRM web session, Redis selection state, and `dbConnectionWeb(...)` |
| All routes under `/api/order` | `services/order/orderServices`; CRM web session and `dbConnectionWeb(...)` |
| All routes under `/api/sells` | `sellsDocsServices`, `sellsProducts`, `cobranzaService`, and `generateReportSells`; CRM web route/session. The report service is an exception that calls `dbConnection(...)` with credentials carried by the web session |
| All routes under `/api/meetings` | `services/meetings/*`; CRM web session and `dbConnectionWeb(...)` |
| All routes under `/api/calendar` | `calendarService` and `calendar/getAllTasksByDay`; CRM web session and `dbConnectionWeb(...)` |
| All routes under `/api/email` | `emailService`; CRM web session and `dbConnectionWeb(...)` when tenant email configuration is loaded |
| All routes under `/api/abonos` | `services/abonos/*`; CRM web session and `dbConnectionWeb(...)` |
| `GET /api/statistics/crm-brief` | `statisticsService`; explicitly CRM-named dashboard service, CRM web session, and `dbConnectionWeb(...)` |
| All routes under `/api/ai` | `ai/sqlPrompt.service` and controller query execution; CRM web session and `dbConnectionWeb(...)` |
| All routes under `/api/informesia` | `informesia.service`; CRM web session and `dbConnectionWeb(...)` |
| `GET /api/utils/banner` | Direct controller behavior; CRM web middleware and session |

## Ecommerce

No mounted endpoint or service can be confidently assigned to Ecommerce from the current repository. The CORS allowlist includes `https://www.oleionline.com`, and `ClientInterface` has a historical Olei Online comment, but neither proves which endpoints that frontend currently calls. The web-authenticated routes are classified as CRM only where their route/controller/service flow and domain naming support that conclusion.

## Unclear or outside the three consumers

| Endpoints | Reason |
| --- | --- |
| `GET /api/tables` | Uses `validateJWTClient`, but its controller reads `req.sessionWeb` and calls `dbConnectionWeb(...)`. The route and implementation disagree, so ownership and working behavior are unclear. |
| `GET /api/utils/excell`, `GET /api/reports/excell` | Both use `validateJWTClient`, but the shared controller reads `req.sessionWeb` and calls `dbConnectionWeb(...)`. The route and implementation disagree, so ownership and working behavior are unclear. |
| `POST /api/errors` | Unauthenticated central error ingestion. Its optional `From` field may describe a caller, but the API does not establish App, CRM, or Ecommerce ownership. |
| `GET /health/live`, `GET /health/ready` | Operational health endpoints, not product-consumer endpoints. |

## Observed inconsistencies

- The comment above `GET /api/product/:id` says the route is shared by web and App, but the actual route uses `validateJWTClient` and the controller reads the App session. The current implementation therefore establishes App ownership only.
- `generateReportSells` is reached only through the CRM sell-report route but uses `dbConnection(...)`, unlike the other CRM sales services. Its route and session establish CRM ownership; the connection choice should be reviewed separately before changing it.
- `GET /api/abonos/:folio` is declared before `GET /api/abonos/details/:folio`, so Express can route `/details/:folio` through the parameter handler. This inventory records intended controller wiring, not a claim that the shadowed route is reachable.
- Static sales paths declared after `GET /api/sells/:folio` are vulnerable to parameter-route capture. Route-order behavior should be protected with focused routing tests before correction.
