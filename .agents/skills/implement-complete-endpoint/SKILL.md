---
name: implement-complete-endpoint
description: Implement one complete Node.js API endpoint across its required backend layers and tests. Use when asked to create, add, or implement a complete endpoint, route, or API operation in this repository.
---

# Implement a complete endpoint

## Establish the contract
1. Read every `AGENTS.md` that applies to the target files, from the repository root through any nested scope.
2. Extract the endpoint contract: method, path, inputs, authentication and authorization, response, business rules, persistence behavior, and failure cases.
3. Inspect the nearest comparable endpoint end to end, including its tests. Prefer similarity in domain, request context, operation type, and persistence strategy.
4. Determine whether the endpoint uses the web, app/mobile, central, or tenant context defined by the applicable instructions and nearby route.
5. Identify only the layers required for this endpoint: route, validation, controller, service, database query or stored-procedure adapter, types, server registration, and tests.

Ask a concise question only when a missing business decision materially changes behavior or the public contract and cannot be resolved from repository context. Otherwise, state reasonable assumptions and proceed.

## Implement
1. Preserve the established public contract and naming conventions of the nearest comparable endpoint.
2. Implement only the necessary layers. Reuse existing routers, schemas, types, helpers, query modules, and registration when appropriate.
3. Keep changes scoped to one endpoint and avoid unrelated cleanup or refactoring.
4. Add controller tests covering validated inputs, service invocation, success responses, and error forwarding.
5. Add service tests covering business rules, persistence calls and parameter binding, result mapping, and dependency failures. Add branch, authorization, or transaction tests when the endpoint requires them.
6. Mock database, Redis, and external dependencies; do not use production infrastructure.

## Verify and review
1. Run the verification commands specified by the applicable `AGENTS.md`, including targeted tests for the new endpoint.
2. Run the full test suite when required by those instructions or warranted by the change's risk.
3. Inspect the final diff and working-tree status. Separate pre-existing changes from endpoint changes.
4. Check the implementation against every requested requirement and look for missing layers, contract drift, unsafe persistence behavior, authorization gaps, and untested branches.
5. Do not claim checks passed when they were not run or when only unrelated tests passed.

## Report
Report:

- The implemented method and final path.
- The request context and authorization behavior.
- Files created and modified by layer.
- Tests added and behaviors covered.
- Every verification command and its result.
- Assumptions, limitations, and anything not verified.
- Any pre-existing working-tree changes that were left untouched.

## Pagination
- GET-by-ID endpoints must not use pagination.
- GET endpoints that return collections must use pagination by default.
- Pagination may be omitted only for small, bounded catalogs when explicitly
  requested.
- Use `PageNumber` and `PageSize` query parameters.
- Default to `PageNumber = 1` and `PageSize = 20`.
- Allow a maximum `limit` of 100.
- Validate pagination parameters with Zod.
- Perform pagination in SQL Server, not in Node.js memory.
- Use deterministic `ORDER BY` with `OFFSET` and `FETCH NEXT`.
- Execute a count query using the same filters as the data query.
- Return records in `data` and pagination metadata through the `info` argument
  of `successResponse`.

