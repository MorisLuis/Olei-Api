---
name: create-tests
description: Create, add, complete, or improve tests for an existing controller, service, middleware, helper, or database function in the Olei API repository. Use for focused Jest unit tests or Supertest integration tests that extend coverage of existing production behavior.
---

# Create tests

## Inspect before writing

1. Read every applicable `AGENTS.md`, the target implementation, and the dependencies it calls.
2. Inspect `package.json`, `jest.config.ts`, `__tests__/setup/jest.setup.ts`, and the nearest comparable tests. Prefer similarity in layer, domain, request context, persistence strategy, and error handling.
3. Derive the observable contract: inputs, outputs, dependency calls, side effects, validation, typed errors, and important branches. Check current coverage before duplicating scenarios.
4. Keep changes scoped to tests. Change production code only when testing reveals a real design defect that prevents correct behavior; explain that change explicitly.

## Follow repository conventions

- Place tests under `__tests__`, mirroring the source layer and domain. Use `*.test.ts`; use `*.int.test.ts` only for genuine integration coverage. Jest recognizes both patterns through `jest.config.ts`.
- Use Jest with `ts-jest` in the Node environment. Keep small request doubles, fixtures, builders, and factories local to the test file unless repeated use clearly justifies sharing them.
- Follow the closest test's import and quoting style. Use typed mocks such as `jest.MockedFunction<typeof dependency>` and reset mocks between tests.
- Test observable behavior rather than private functions or incidental call structure. Assert dependency arguments when they are part of the contract, especially validated commands, SQL parameters, query identifiers, transaction ordering, and external requests.
- Mock module boundaries with `jest.mock`. Mock SQL Server pools, requests, `input`, `query`, `execute`, and transactions; assert explicit MSSQL types and bound values. Mock Redis client methods and HTTP or other external clients. Never connect to a real database, Redis instance, or external service.
- Test controllers directly with typed Express request, response, and `next` doubles when matching current controller tests. Assert validation and normalization, precise service arguments, `successResponse` output, and `next(error)` behavior.
- Use Supertest when behavior crosses the Express route boundary and needs middleware order, authentication wiring, routing, or full HTTP serialization. Build an isolated app and mock its downstream infrastructure. Do not add Supertest merely to replace the established direct-controller pattern.
- Test services for business rules, result mapping, dependency failures, connection selection, and persistence parameter binding. For transactions, verify shared transaction use, write order, commit on success, and rollback at each failure position.
- Test middleware through its public `req`, `res`, and `next` effects. Test helpers and database utilities through returned values, emitted effects, and typed errors. Test query adapters without executing production SQL.

## Cover meaningful behavior

Include the successful case, expected failures, and important edge cases supported by the implementation. Prioritize:

- Valid, normalized, defaulted, optional, boundary, and invalid inputs.
- Authentication, authorization, ownership, tenant or warehouse access, and web-versus-app session behavior when relevant.
- Empty and malformed dependency results, recognized SQL or Redis conditions, and rejected dependencies.
- Response status, payload, pagination metadata, absence of unsafe fields, and no downstream call after failed validation.
- Compatibility branches, idempotency, ordering, or transaction behavior present in the target.

Do not invent requirements solely to increase coverage. Avoid brittle assertions on private implementation details, exhaustive mock call counts without contract value, snapshots for simple objects, or tests of framework behavior.

## Verify and report

1. Run the smallest relevant command first: `npm test -- --watchman=false --runInBand <test-paths>`.
2. Fix failures caused by the new tests. Do not conceal a production defect by weakening a valid assertion.
3. Run `npm run typecheck` and read-only lint with `npx eslint . --ext .ts` when appropriate to the scope. Do not use `npm run lint` for verification because it includes `--fix`.
4. Run the full suite only when repository instructions require it or the change's breadth warrants it.
5. Review the final diff and working-tree status, separating pre-existing changes from test work.

Report the test files created or modified, scenarios covered, every verification command and result, any production change and why it was necessary, and anything not verified.
