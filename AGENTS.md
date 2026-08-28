# Olei API repository instructions

Olei API uses Node.js, Express, TypeScript, SQL Server/MSSQL, Redis, Zod, Jest, and Supertest. Follow the nearest comparable endpoint and do not introduce a new architectural pattern without a clear need.

## Project architecture

- Follow `server -> router -> controller -> service -> database`.
- `src/models/server.ts` owns `/api/<domain>` prefixes. Routers own relative paths and middleware order.
- Controllers validate HTTP input, read request context, call services, format responses, and forward errors with `next(error)`.
- Services own business rules and persistence orchestration. They must not depend on Express `Request` or `Response`.
- Put domain SQL and stored-procedure adapters or identifiers in `src/database/querys`.

## Request contexts

Choose the request path from the target route and nearby domain code. Never copy web behavior into an app endpoint or vice versa.

- Web: `validateJWTWeb -> req.sessionWeb -> UserWebSessionInterface -> dbConnectionWeb(...)`.
- App/mobile: `validateJWTClient -> req.session and req.sessionId -> UserSessionInterface -> dbConnection(...)`.
- Use `dbConnectionMain()` only for the central Olei database, not a tenant database.

## Validation and types

- Validate external body, params, and query values with Zod at the HTTP boundary. Use separate schemas when an endpoint reads multiple input sources.
- Normalize strings and coerce or constrain numbers, dates, pagination, enums, and optional values deliberately.
- After validation, pass a precise typed command to the service; do not weaken it to `Partial<>` without a domain reason.
- Reuse shared domain and session types. Do not use `any`, suppress type errors, or rely on unsafe assertions.

## SQL Server

- Use parameterized SQL only; never interpolate request-controlled values into SQL.
- Specify MSSQL parameter types explicitly. For monetary decimals, specify precision and scale.
- Select the correct central, web-tenant, or app-tenant connection for the request context.
- Keep query text and stored-procedure identifiers in the database layer.
- Tests must never execute against a real production database.

## Transactions

- Complete validation and non-database preparation before starting a transaction.
- Protect transaction begin, all writes, and commit with error handling. Bind every request to the same transaction.
- Commit only after every required write succeeds. Roll back failures after a successful begin.
- Preserve the original failure if rollback also fails.
- Do not add a transaction around one independent write without a concrete atomicity or concurrency reason.

## Authentication and authorization

- Authentication does not imply domain authorization. Enforce required permissions, ownership, warehouse access, and tenant access.
- Derive actor identity from the authenticated session; never hard-code an actor ID.
- Do not return credentials, session secrets, or internal database fields.

## Responses and errors
- All new successful HTTP responses must use `successResponse` from
  `src/helpers/response.ts`.
- Call it as:
  `successResponse(req, res, data, message?, status?, info?)`.
- Place the endpoint result inside the `data` property; do not create custom
  success envelopes such as `{ ok: true }`, `{ tasks: [...] }`, or direct
  `res.status(...).json(...)` responses.
- Pass pagination metadata through the `info` argument when applicable.
- Preserve an existing endpoint's public response contract when modifying it
  unless the task explicitly authorizes a breaking change.
- Use the existing typed application errors and let the centralized error
  handler format failures.
- Do not build ad hoc error responses in controllers.
- Do not log raw SQL errors, credentials, tokens, or other secrets.
## Testing

- Add controller tests for validation, service arguments, response behavior, and `next(error)`.
- Add service tests for business rules, SQL parameter binding, result mapping, and dependency failures.
- Mock SQL, Redis, and external APIs. Prefer behavior tests over implementation-detail tests.
- Explicitly test optional inputs, compatibility branches, recognized SQL errors, authorization rules, and other special branches.
- For transactions, verify shared transaction use, write order, commit on success, and rollback for each failure position.
- Do not claim an endpoint is verified because unrelated tests pass.

## Verification

- Type check: `npm run typecheck`.
- Lint without modifying files: `npx eslint . --ext .ts`. The package script `npm run lint` includes `--fix`; do not use it for read-only verification.
- Targeted tests: `npm test -- --watchman=false --runInBand <test-paths>`.
- Full suite when appropriate: `npm test -- --watchman=false --runInBand`.
- Before finishing, review the diff for unrelated changes, confirm the requested behavior, and report every command and result, including anything not verified.

## Existing inconsistencies not to copy

- Hard-coded actor IDs.
- SQL text or stored-procedure names inside services.
- Implicit MSSQL parameter types.
- `Partial<>` service inputs after Zod validation.
- Transactions started before validation or preparation.
- Raw infrastructure error logging.
- Authentication without required domain authorization.
