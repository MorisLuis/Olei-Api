## Milestone 0: Repository audit and deployment scope

### Status

- Decision: proceed toward an authorized Olei staging deployment.
- Production migration is outside this milestone and requires separate authorization.
- AWS resources created by this milestone: none.
- Ongoing AWS cost introduced by this milestone: none.

### Authorization and ownership boundary

The backend maintainer confirmed authorization to package and deploy this repository and confirmed that an approved staging environment is available. The backend maintainer does not own the SQL Server databases.

Before any AWS-hosted task connects to a database, the database or infrastructure owner must approve the source network, firewall rules, staging credentials, permitted databases and data, and connection limits. Approval for staging must not be treated as approval for production.

| Area | Required owner |
| --- | --- |
| Backend code and deployment | Olei backend owner |
| SQL Server access and firewall policy | Database or infrastructure owner |
| AWS account and billing | Olei-approved AWS account owner |
| Redis | Olei-approved service owner |
| Secrets and rotation | Named Olei owner |
| Deployment approval and rollback | Backend and infrastructure owners |

If any required authorization becomes unavailable, use a sanitized application and synthetic data instead of Olei code, credentials, or customer data.

### Repository assessment

The repository contains an existing Node.js and Express API written in strict TypeScript. Its principal runtime and test technologies are SQL Server, Redis, Zod, Jest, and Supertest. The application follows the repository convention `server -> router -> controller -> service -> database`.

Current relevant characteristics:

- CI uses Node.js 22 and runs TypeScript and ESLint checks.
- CodeQL and Semgrep security workflows exist.
- Production compilation emits JavaScript to `dist` and starts with `node dist/index.js`.
- No Node.js version is declared in `package.json`, `.nvmrc`, or `.node-version`.
- `.env` is ignored and is not tracked.
- No Dockerfile, Compose file, ECR/ECS configuration, Terraform, CDK, or other AWS deployment definition exists.
- The application has controller, service, database-connection, and SQL-deployment tests. Tests must not connect to production databases.
- The repository was clean before this document was created.

### Application startup and lifecycle assessment

The entry point loads environment variables, constructs the Express server, and starts listening. Server construction starts the central SQL Server connection asynchronously but does not await it before opening the HTTP listener.

Consequences and current lifecycle gaps:

- The process can accept traffic before the central database is ready.
- An initial database rejection can occur outside a controlled startup failure path.
- There are no explicit liveness or readiness endpoints.
- Signal handlers close SQL Server pools on `SIGINT` and `SIGTERM`.
- The HTTP server is not retained and closed during shutdown.
- In-flight requests are not explicitly drained.
- The Redis connection is not explicitly closed during shutdown.
- Shutdown forces exit code zero after SQL cleanup, regardless of the initiating condition.
- Configuration is not validated centrally at startup.
- Logging is primarily unstructured console output.

These lifecycle gaps belong to Milestone 1, not this audit.

### Deployment dependency inventory

| Dependency | Role | When required | Deployment concern |
| --- | --- | --- | --- |
| Central SQL Server | Durable application and authentication data | Startup and core requests | External network path, owner approval, TLS identity, credentials, latency |
| Tenant SQL Servers | Durable tenant business data | Tenant-specific requests | Dynamic destinations, approved data scope, credentials, aggregate connection count |
| Redis | Sessions, rate limits, and temporary AI query records | Authentication and related features | Availability, authentication, transport security, persistence expectations |
| Azure-hosted language model | AI feature | AI endpoints only | Outbound HTTPS, secret management, timeout and cost controls |
| SMTP services | Email delivery | Email endpoints only | Outbound SMTP, tenant configuration, credentials, provider rules |
| External HTTP assets | Product and image features | Feature-specific requests | Outbound access, TLS, availability |
| Public repository assets | Static runtime files | Feature-dependent | Must be included deliberately in the container artifact |

No queue workers or scheduled business jobs were found. A process-local timer checks disconnected SQL pools every five minutes.

### Stateful and disposable state

SQL Server and Redis contain state that must survive replacement of an application task. Redis holds user sessions, so sessions are not tied to one Node.js process.

SQL connection pools, the pool cache, the cleanup timer, compiled application files, and other process memory are disposable. A replacement task must be able to recreate them. The tenant SQL pool cap is enforced per process, so scaling the ECS service will multiply the possible aggregate database connection count.

### Environment-variable inventory

This inventory records names only. It does not record values.

### Secrets

- `ACCESS_TOKEN_SECRET`
- `ACCESS_TOKEN_SEVER_SECRET` (the existing name contains `SEVER`)
- `REFRESH_TOKEN_SECRET`
- `DB_USER`
- `DB_PASSWORD`
- `REDIS_PASSWORD`
- `AZURE_OPENAI_API_KEY`

### Runtime configuration

- `PORT`
- `DB_SERVER`
- `DB_DATABASE`
- `REDIS_HOST`
- `REDIS_PORT`
- `AZURE_OPENAI_API_INSTANCE_NAME`
- `AZURE_OPENAI_API_DEPLOYMENT_NAME`
- `AZURE_OPENAI_API_VERSION`
- `JWT_ACCESS_ISSUER`
- `JWT_ACCESS_AUDIENCE`
- `JWT_ACCESS_SUBJECT`
- `JWT_REFRESH_ISSUER`
- `JWT_REFRESH_AUDIENCE`
- `JWT_REFRESH_SUBJECT`
- `JWT_SERVER_ISSUER`
- `JWT_SERVER_AUDIENCE`
- `JWT_SERVER_SUBJECT`

Host and database identifiers are configuration, but they can still be operationally sensitive and must not be exposed unnecessarily.

### Configuration inconsistencies

- Some JWT metadata names referenced by the application were not present in the inspected local environment key inventory.
- `PORT` was not present locally, but the application provides a default.
- `KEY_EMAIL` was present locally, but no application reference was found.
- Required values are checked inconsistently and can fail only when an affected endpoint receives traffic.
- The language-model configuration uses TypeScript non-null assertions instead of runtime validation.

Milestone 1 must define and validate the authoritative runtime schema before the process opens its HTTP listener.

### Security finding requiring immediate external action

A tracked email transport source file contains a hard-coded SMTP credential. The credential value is intentionally omitted here. Treat it as compromised even if the associated default configuration is currently unused.

Required owner actions:

1. Rotate or revoke the credential.
2. Confirm the credential owner and review relevant access logs.
3. Remove the hard-coded credential from the application in an authorized change.
4. Determine whether repository-history rewriting is required.
5. Store any replacement secret in an approved secret system and restrict retrieval permissions.

Credential rotation and history rewriting are external or destructive actions and are not authorized by creation of this audit document.

### Initial target architecture

```text
Clients
   |
   | HTTPS
   v
AWS ingress boundary (design pending)
   |
   v
ECS service on Fargate
   +-- Olei Node.js container
   |     +-- stdout/stderr ----------> CloudWatch Logs
   |     +-- configuration <---------- ECS task definition
   |     +-- secrets <---------------- Approved AWS secret service
   |
   +-- outbound SQL -----------------> Approved external staging SQL Servers
   +-- outbound Redis ---------------> Approved staging Redis
   +-- outbound HTTPS ---------------> External AI and asset services
   +-- outbound SMTP ----------------> Approved SMTP services

ECR -- immutable container image ----> ECS deployment
IAM task execution role -------------> ECR, logs, and approved secret retrieval
```

The ingress, TLS, DNS, VPC, subnet, egress, Redis-hosting, and fixed-source-address design remains pending. The future deployment artifact should be one immutable image tested in staging and promoted without rebuilding; environment-specific configuration and secrets must be injected at runtime.

### Risk register

| Priority | Risk | Required treatment |
| --- | --- | --- |
| Critical | Tracked SMTP credential | Rotate, investigate, remove, and decide history-remediation scope |
| High | Database connectivity depends on an owner outside the backend team | Record approval and agree on network and connection limits before deployment |
| High | HTTP listener can start before SQL readiness | Correct startup sequencing in Milestone 1 |
| High | No liveness or readiness contract | Add and test endpoints in Milestone 1 |
| High | Shutdown does not drain HTTP or close Redis | Implement bounded graceful shutdown in Milestone 1 |
| High | Missing centralized configuration validation | Fail safely during startup in Milestone 1 |
| High | SQL TLS accepts an unverified server certificate | Review certificate and trust policy with the database owner |
| Medium | Redis transport security is not evident | Decide approved Redis TLS and authentication configuration |
| Medium | ECS scaling multiplies tenant pools | Establish aggregate SQL connection budgets before scaling |
| Medium | Logs can expose infrastructure identifiers or dependency errors | Define structured, redacted logging before CloudWatch deployment |
| Medium | AWS ownership, tagging, budgets, and cleanup are not yet defined | Establish them before creating billed resources |
| Medium | Runtime Node.js version is not declared in the repository | Pin the supported version during container preparation |

### Explicit non-goals

- Production deployment or production database access
- Dockerfile or container build changes
- AWS account, ECR, ECS, IAM, networking, or logging changes
- Credential rotation or repository-history rewriting
- Copying credentials or `.env` into source control or a future image
- Application lifecycle, health-check, or configuration-validation implementation
- CI/CD, queues, alarms, or infrastructure as code

### Milestone acceptance criteria

- Repository structure and runtime dependencies are documented.
- Environment-variable names are inventoried without values.
- Stateful dependencies and disposable process state are distinguished.
- The authorized staging path and database ownership constraint are explicit.
- The initial target architecture and unresolved networking decisions are recorded.
- Security and deployment risks are prioritized.
- No AWS resource or ongoing AWS cost is introduced.
- No secret, customer data, production hostname, or AWS account identifier is added.

### Cleanup

This milestone creates only this documentation file. Before it is committed, rollback consists of deleting the file. After it is committed, rollback consists of reverting the commit that introduced it. There are no AWS resources to delete.

## Milestone 1: Container-ready application lifecycle

### Status and scope

Milestone 1 is complete for the application lifecycle and has been verified against approved staging services. The live verification process was explicitly started with `NODE_ENV=staging`; no production service, business endpoint, customer workflow, or AWS resource was used.

Implemented behavior:

- Runtime configuration is parsed and validated with Zod before server construction or dependency access.
- Secrets have no source-code fallback; validation failures name invalid variables without printing their values.
- The tracked SMTP credential fallback was removed. External credential revocation and repository-history review remain owner actions.
- Startup follows `configuration -> central SQL Server -> Redis -> HTTP listener -> ready`.
- Redis uses an explicit lazy connection so module loading does not initiate network access.
- `/health/live` reports process liveness without testing SQL Server or Redis.
- `/health/ready` returns success only after startup and while central SQL Server and Redis remain available.
- Shutdown marks the process unready, stops accepting connections and drains HTTP, stops the cleanup timer, closes SQL Server and Redis, and exits successfully only after cleanup completes.
- Failed or timed-out shutdown uses exit code 1; the timeout prevents a task from remaining alive forever.
- Long-running process events use structured JSON logging with an explicit metadata allowlist.
- Production builds clean `dist` before compilation, preventing obsolete JavaScript from shadowing current compiled modules.

### Verification evidence

Offline verification on 2026-08-25:

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npx eslint . --ext .ts` | Passed without modifying files |
| `npm test -- --watchman=false --runInBand` | Passed: 36 suites, 187 tests |
| `npm run build` | Passed after cleaning `dist` |
| `git diff --check` | Passed |
| Isolated missing-config process check | Exited 1 with `application.startup_failed`; no dependency connection or secret-shaped output |

Live staging verification on 2026-08-25:

| Check | Result |
| --- | --- |
| Runtime mode | Explicitly `NODE_ENV=staging` |
| Dependency scope | Approved staging SQL Server and Redis only |
| Startup ordering | Dependencies ready before HTTP listener |
| `GET /health/live` | HTTP 200, `live` |
| `GET /health/ready` | HTTP 200, `ready` |
| `SIGTERM` | `shutdown.started` then `shutdown.completed` |
| Process exit | Exit code 0 |
| Listener cleanup | Port released after shutdown |

The first live attempt detected an older verification process occupying port 5001. That process had been started by an incorrectly isolated check, was stopped gracefully with `SIGTERM`, and released the port. The subsequent clean live staging run passed. This was a verification-harness issue, not a staging dependency failure.

### Remaining risks and owner actions

- Rotate or revoke the previously tracked SMTP credential, review access logs, and decide whether Git history must be rewritten.
- Obtain and retain the database/infrastructure owner's approval for the eventual AWS task source network, firewall policy, TLS trust, credentials, permitted staging databases, and aggregate connection limits.
- Redis transport security and the SQL Server certificate trust policy still require deployment-specific decisions.
- The supported Node.js version is not yet pinned in the repository; container preparation must choose and pin it.
- Health readiness reflects dependency client state rather than executing a SQL query on every request. This avoids turning probes into database load, but ECS thresholds must tolerate brief client-state transitions.
- Container packaging, non-root execution, image scanning, ECS health-check timing, IAM, networking, secret injection, observability, and rollback remain future milestones.

### Cost and cleanup

Milestone 1 created no AWS resources and introduced no AWS cost. Its live verification used existing approved staging services and one local Node.js process, which was terminated cleanly. Rollback is a source-control revert of the Milestone 1 application and test changes; there is no cloud resource to delete.

## Milestone 2: Production container image

### Status and implementation

Milestone 2 is complete. The backend now has a reproducible multi-stage Docker build based on Node.js 22 and a restricted build context.

- `package.json` declares the supported Node.js runtime family as `>=22 <23`.
- ESLint, Jest types, Node compile-time types, and Supertest are classified as development dependencies. Some Node type packages remain transitively required by production packages including ExcelJS and MSSQL/Tedious.
- The build stage installs the locked dependency tree, compiles TypeScript, and prunes development dependencies.
- The runtime stage contains the compiled application, production dependencies, public assets, and SQL deployment objects.
- The application runs as the unprivileged `node` user.
- `tmp/exports` is writable by that user and remains disposable container-local state.
- The image documents container port 5001 and uses exec-form `CMD` so Node receives container signals.
- `.env`, Git metadata, host dependencies, compiled host output, tests, coverage, documentation, and temporary files are excluded from the build context.
- No application secret or environment-specific endpoint is embedded in the image.

### Image evidence

The local image was built on 2026-08-25 as `olei-api:milestone-2`.

| Property | Verified value |
| --- | --- |
| Operating system and architecture | Linux ARM64 |
| Node.js | 22.23.2 |
| Runtime user | `node` |
| Working directory | `/app` |
| Exposed container port | `5001/tcp` |
| Runtime command | `node dist/index.js` |
| Local image ID prefix | `5e8a93da3f6f` |
| Docker-displayed local size | Approximately 602 MB |
| Largest application layer | Production `node_modules`, approximately 215 MB |

ARM64 is the native local platform. The ECS/Fargate CPU architecture must be selected explicitly before an image is pushed to ECR; this local result does not silently decide the AWS architecture.

### Container verification

| Check | Result |
| --- | --- |
| Compiled entry point present | Passed |
| `.env`, tests, and TypeScript application source absent | Passed |
| Direct ESLint, Jest, and Supertest development packages absent | Passed |
| Non-root UID | Passed |
| `tmp/exports` write/delete probe | Passed |
| No-network missing-configuration test | Exited 1 with only `application.startup_failed` and no secret-shaped output |
| Runtime mode for live test | Explicitly `NODE_ENV=staging` |
| Live dependency scope | Approved staging SQL Server and Redis only |
| `GET /health/live` | HTTP 200, `live` |
| `GET /health/ready` | HTTP 200, `ready` |
| Docker stop | Delivered `SIGTERM`; `shutdown.started` and `shutdown.completed` observed |
| Graceful exit | Exit code 0 |
| Host port | Released after shutdown |
| Verification container | Removed |

The repository `.env` uses whitespace around some assignment operators. The application `dotenv` parser accepts that syntax, while Docker's `--env-file` parser does not. Verification therefore parsed the ignored file locally and passed variable names through the Docker CLI environment without placing values in command arguments or logs. Values remained visible to the local Docker daemon as container environment metadata only until the verification container was deleted.

### Remaining risks and decisions

- The local image remains on disk and has not been pushed to a registry.
- The image is Linux ARM64; Fargate ARM64 versus AMD64 remains an explicit deployment decision.
- The production dependency audit reported existing vulnerabilities that require a separate, controlled dependency-remediation effort. No automatic breaking upgrade was applied during Dockerization.
- The image size is measured rather than claimed to be minimal. Production dependencies account for meaningful size and should be optimized only after confirming which application capabilities are required.
- Image digest promotion, vulnerability scanning, tag immutability, lifecycle policies, and registry authentication belong to the ECR milestone.
- Local Docker environment injection is not the final secret-management design. ECS secret injection and IAM remain later milestones.

### Cost and cleanup

Milestone 2 created no AWS resource and no ongoing cloud cost. Docker Desktop stores `olei-api:milestone-2` locally, consuming disk space only. No Milestone 2 container remains.

Exact local cleanup, if the image is no longer required:

```bash
docker image rm olei-api:milestone-2
```

Source rollback consists of reverting the Dockerfile, `.dockerignore`, package manifest, lockfile, and this documentation. Do not use broad Docker cleanup commands for this milestone.

## Milestone 3: AWS identity and cost-safety baseline

### Status and ownership

Milestone 3 is complete. The backend owner also controls the approved AWS account, billing, recovery channels, and initial AWS administration. The account has a professional organizational name and controlled billing, operations, and security contacts. No account ID, ARN, access-portal URL, email address, phone number, credential, or MFA detail is recorded in this repository.

The account root user has MFA enabled, has no access keys, and is reserved for root-only account operations. IAM access to Billing was activated once by root so authorized roles can use their policy-granted billing capabilities. Ordinary console and CLI work now uses IAM Identity Center.

### Human identity architecture

```text
AWS account root user
  +-- MFA, no access keys
  +-- recovery and root-only operations

AWS Organizations management account
  +-- IAM Identity Center organization instance (us-east-1)
       +-- MFA-protected human user
       +-- aws-administrators group
       +-- AdministratorAccess permission set (one-hour session)
            +-- temporary console and CLI role sessions
```

`AdministratorAccess` is intentionally available for initial account bootstrap and remains highly privileged. It is not the final least-privilege deployment model. Later IAM work must introduce narrower permissions for routine staging deployment and separate ECS execution and application roles.

### CLI authentication evidence

AWS CLI v2 is installed locally and configured with the explicit profile `olei-staging`.

| Check | Result |
| --- | --- |
| AWS CLI | Version 2.36.31 |
| Profile | `olei-staging` |
| SSO session | `olei` |
| Identity Center Region | `us-east-1` |
| Default workload Region | `us-east-2` |
| Authentication | Identity Center assumed role with temporary credentials |
| Static `~/.aws/credentials` file | Absent |
| AWS config file permissions | Owner-only (`600`) |
| `aws sso logout` | Temporary session removed; subsequent AWS request rejected |
| `aws sso login` | Browser and MFA login restored the session |
| Sanitized STS verification | Passed without displaying account or role identifiers |

Future commands must name the profile explicitly and should name the Region explicitly:

```bash
aws <service> <operation> --profile olei-staging --region us-east-2
```

The local SSO cache grants temporary access while valid. It must remain private and should be cleared with `aws sso logout` on shared, lost, or decommissioned devices.

### Region decisions

- IAM Identity Center primary Region: `us-east-1` (US East, N. Virginia).
- Initial workload default Region: `us-east-2` (US East, Ohio).
- The external staging SQL Server and primary user population are in Mexico.
- `mx-central-1` remains a candidate, not a selected deployment Region. It must be compared during networking design for required-service availability, cross-cloud latency, routing, operational complexity, and price.
- Identity Center's Region does not require application resources to use the same Region.

### Cost guardrails

The learning target is no more than USD 5 per month. This is a planning boundary, not a guarantee enforced by AWS.

Configured alerts:

- A zero-spend budget for the first detected cost.
- A recurring USD 5 monthly cost budget.
- No automated budget actions.

Budget information can be delayed, and alerts do not stop resources. Before any cost-generating resource is created, the expected price, billing dimensions, expected lifetime, and exact cleanup operation must be explained and separately authorized. Expensive defaults such as a continuously running NAT Gateway are not approved by this milestone.

### Resource naming convention

General environment-specific pattern:

```text
olei-<environment>-<purpose>
```

Planned names:

| Resource type | Convention |
| --- | --- |
| ECR repository | `olei-api` |
| ECS cluster | `olei-staging` |
| ECS service | `olei-staging-api` |
| ECS task definition family | `olei-staging-api` |
| CloudWatch log group | `/olei/staging/api` |
| ECS execution role | `olei-staging-ecs-execution` |
| Application task role | `olei-staging-api-task` |
| Secret or parameter path | `olei/staging/api/<secret-name>` |

The ECR repository is environment-neutral so an exact image digest can be tested in staging and promoted without rebuilding. Names use lowercase and hyphens unless an AWS service requires another format. Names must never contain account identifiers, personal details, customer data, credentials, or secret values. Production resources require separate explicit authorization.

### Mandatory resource tags

Apply these tags at creation wherever the AWS resource type supports them:

| Tag key | Value |
| --- | --- |
| `olei:project` | `olei-api` |
| `olei:environment` | `staging` |
| `olei:owner` | `backend` |
| `olei:managed-by` | `manual` |
| `olei:cost-scope` | `learning` |

Tags are case-sensitive metadata, not access controls or cost caps, and must not contain sensitive information. Change `olei:managed-by` to `terraform` or `cdk` only when that resource is genuinely controlled by the selected infrastructure-as-code system.

### Creation and cleanup protocol

Before resource creation:

1. Authenticate through the named Identity Center profile.
2. Verify the intended account without printing its identifier.
3. State and verify the intended Region.
4. Explain security implications and estimated cost.
5. Resolve the exact cleanup operation.
6. Obtain explicit authorization.
7. Create the resource with mandatory tags when supported.
8. Verify the resource and add it to the inventory.

Current inventory:

| Resource | Location | Cost state | Cleanup method | Status |
| --- | --- | --- | --- | --- |
| Docker image `olei-api:milestone-2` | Local Docker | Local disk only | `docker image rm olei-api:milestone-2` | Retained |
| AWS Organization | Global | No additional charge | Governance review required before deletion | Active |
| IAM Identity Center organization instance | `us-east-1` | No additional charge | Remove assignments/users, then review disabling prerequisites | Active |
| Administrator permission set and assignment | `us-east-1` | No additional charge | Remove exact assignment and permission set after replacement access exists | Active |
| Zero-spend and USD 5 budgets | Global | No charge without actions | Delete the exact named budgets in Billing | Active |
| AWS CLI SSO session | Local | No charge | `aws sso logout` | Active, temporary |
| ECR private repository `olei-api` | `us-east-2` | Active; storage billed by data retained | Delete exact images, then delete the repository | Active after Milestone 4 |
| ECS, Fargate, VPC, load balancer, NAT, secrets, application logs | Not created | None | Not applicable | Not created |

Do not delete Identity Center access before establishing and verifying a replacement administrator path. Do not use broad cleanup commands. The AWS Organization and identity baseline are governance controls, not temporary compute resources that should be routinely destroyed.

### Remaining risks and next decisions

- The bootstrap administrator permission is broad and requires later least-privilege refinement.
- One AWS account currently serves as both management boundary and intended learning environment; multi-account separation can be evaluated later without blocking this staging exercise.
- ARM64 versus AMD64 remains undecided for ECR/ECS.
- The workload Region requires confirmation during networking design, especially for external SQL Server connectivity.
- Budget alerts do not prevent overspend.
- At the close of Milestone 3, no application infrastructure, registry, secret, network, compute task, or application log group existed; Milestone 4 subsequently created the ECR repository.

### Task 3 cost and rollback

This documentation task created no AWS resource and introduced no cost. Rollback consists of reverting this Milestone 3 documentation section. Existing security and cost controls should not be removed merely to roll back documentation.

## Milestone 4: Private ECR image publication

### Status and scope

Milestone 4 is complete for the first authorized staging image publication and registry verification. It created one private ECR repository and retained one application image in `us-east-2`. It did not create or update ECS, Fargate, networking, load-balancing, secret-management, or production resources.

The repository is named `olei-api` and has the mandatory project, environment, owner, management, and learning-cost tags. No AWS account ID, registry address, ARN, SSO URL, image digest, credential, or personal information is recorded here.

### Registry controls

| Control | Verified state |
| --- | --- |
| Repository visibility | Private |
| Region | `us-east-2` |
| Tag mutability | `IMMUTABLE` |
| Scan on push | Enabled |
| Encryption | AWS-managed AES-256 encryption |
| Untagged-image lifecycle | Expire after one day |
| Tagged-image lifecycle | Retain the newest five `git-*` images |
| Repository tags | All five mandatory tags applied |

Immutable Git-derived tags prevent a later build from silently replacing an already published tag. The image digest remains the authoritative content identity for deployment and promotion.

### Authentication and publication model

AWS and Docker authenticate independently:

```text
Human + MFA
   |
   v
AWS IAM Identity Center session
   |
   v
AWS CLI temporary role credentials
   |
   +-- request short-lived ECR authorization token
           |
           v
       Docker registry login
           |
           v
       tag and push image to private ECR
```

`aws sso login` authenticates the human and AWS CLI. Docker cannot use that session directly, so the AWS CLI requests a short-lived ECR authorization token and passes it to Docker. `docker tag` adds a registry-qualified name to an existing local image without copying or uploading it. `docker push` uploads missing content-addressed layers and the manifest or image index that references them.

The published tag was derived from the 12-character Git commit prefix. The exact tag and commit are intentionally omitted from this document because the durable verification property is the recorded Git-derived naming method plus the remotely verified digest.

### Publication and verification evidence

Live verification on 2026-08-26:

| Check | Result |
| --- | --- |
| Named AWS SSO profile | Authenticated successfully |
| Docker ECR authentication | Succeeded using a short-lived token |
| Local destination tag | Created |
| Local image identity | Original and destination tags referenced the same image ID |
| ECR push | Succeeded |
| Remote image lookup | Tag and digest verified |
| Published top-level media type | OCI image index |
| Runtime platform manifest | Linux ARM64 child image found |
| Image scan | Completed against the Linux ARM64 child digest |
| Tag mutability | `IMMUTABLE` |
| Docker ECR logout | Succeeded |
| Local ECR-qualified tag cleanup | Removed |
| Original local image | Retained as `olei-api:milestone-2` |

Modern Docker publication produced an OCI image index rather than tagging the platform manifest directly. The top-level index referenced the Linux ARM64 application image and build metadata. Waiting for a scan by the index tag returned `ScanNotFoundException`; resolving the index and querying the Linux ARM64 child digest returned the actual scan. This was a scan-target selection issue, not an upload or digest-verification failure.

### Vulnerability review

ECR Basic Scanning reported:

| Severity | Count |
| --- | ---: |
| Critical | 3 |
| High | 5 |
| Medium | 11 |
| Low | 1 |

All critical and high findings mapped to the Debian `perl` source package at the version inherited from the `node:22-bookworm-slim` runtime base. Runtime inspection established that the full `perl` package is not installed, while the essential `perl-base` package is installed. A repository search found no explicit Perl invocation or child-process launch in the application source or package manifests.

Absence of an explicit application reference lowers apparent reachability but does not prove that the vulnerable code is unreachable, and scanner severity alone does not establish exploitability in this API. The Debian security tracker currently reports Bookworm as vulnerable for the observed issues, so rebuilding the same base may not yet resolve them. Removing `perl-base` manually is not an approved remediation because it is an essential Debian component and could damage the runtime filesystem.

The image is retained for controlled learning and staging work only. Production deployment is blocked until the critical and high findings are resolved by a supported patched base or separately assessed and explicitly accepted by the responsible security owner. Future remediation should rebuild from the newest supported base, rescan the resulting platform manifest, and evaluate a different supported base only with application compatibility testing.

### Cost and retention

The private repository itself has no fixed hourly compute charge, but retained image data is billed as ECR storage. For this single learning image, the planning estimate is approximately USD 0.01–0.06 per month; actual cost depends on stored bytes, Region pricing, layer reuse, and retention time. Data transfer, replication, enhanced scanning, and additional services are not included in that estimate.

The zero-spend and USD 5 budget alerts remain monitoring controls and do not stop charges. The lifecycle policy limits accumulation by expiring untagged content after one day and retaining only the newest five Git-tagged images.

### Cleanup and rollback

Docker registry authentication and the registry-qualified local tag were already removed. The original local image and the remote ECR image remain.

Remove only the retained local image when it is no longer required:

```bash
docker image rm olei-api:milestone-2
```

Remote cleanup must resolve the exact repository and image in the intended profile and Region before deletion. Delete the exact remote image first, verify that no ECS task or deployment references its digest, and then delete the exact repository only if the repository is no longer required. Do not use wildcard or broad registry-cleanup commands. Repository deletion is destructive and requires separate authorization.

Source rollback consists only of reverting this documentation section. Reverting documentation does not delete the billed ECR image or repository.

### Remaining risks and next decisions

- Three critical and five high inherited operating-system findings block production readiness.
- The published image is ARM64; the future ECS task runtime architecture must explicitly match it.
- Administrator access was used for bootstrap; routine deployment requires a narrower least-privilege identity.
- No ECS execution role, application task role, secret injection, log group, network, ingress, or running task exists yet.
- ECR storage continues until the exact image and repository are deleted.
- Promotion must use the verified digest rather than rebuilding environment-specific images.
