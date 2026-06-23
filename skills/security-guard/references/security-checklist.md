# Security Guard Checklist

Reusable checklist for security-focused reviews.

---

## 1. Secrets and Credentials

- [ ] No hardcoded API keys, secrets, tokens, passwords, or private keys in source.
- [ ] No `.env` files or secret stores committed to version control.
- [ ] Secrets are loaded from environment variables or a secrets manager.
- [ ] No secrets printed in logs, error messages, or stack traces.
- [ ] CI configuration does not expose secrets in plain text or logs.

## 2. Injection and Input Validation

- [ ] User input is validated and sanitized before use.
- [ ] Database queries use parameterized statements or ORM equivalents.
- [ ] Shell commands do not interpolate unsanitized input.
- [ ] File paths are validated to prevent traversal outside intended directories.
- [ ] HTML output is escaped or rendered safely to prevent XSS.

## 3. Authentication and Authorization

- [ ] Protected endpoints require authentication.
- [ ] Authorization checks ownership, roles, or scopes correctly.
- [ ] Session tokens, JWTs, or cookies are set with secure flags (`HttpOnly`, `Secure`, `SameSite`).
- [ ] Passwords are hashed with a strong algorithm (e.g., bcrypt, Argon2).
- [ ] OAuth or third-party auth flows validate state and redirect URIs.

## 4. Dependencies and Supply Chain

- [ ] New dependencies are from reputable sources.
- [ ] No known high-severity vulnerabilities in added or updated dependencies.
- [ ] Dependency versions are pinned or locked.
- [ ] Unused dependencies are removed.

## 5. Infrastructure and Exposure

- [ ] CORS policy is restrictive, not `*` in production.
- [ ] Content Security Policy (CSP) is defined where applicable.
- [ ] Security headers (HSTS, X-Frame-Options, X-Content-Type-Options) are present.
- [ ] Production endpoints use HTTPS.
- [ ] Cloud or container configurations do not expose admin ports or secrets.

## 6. Data Handling

- [ ] PII, payment, or health data is handled according to relevant requirements.
- [ ] Sensitive data is encrypted at rest and in transit.
- [ ] Data retention and deletion requirements are respected.
- [ ] User input is not persisted without consent or need.

## 7. AI Artifacts

- [ ] No placeholder secrets, `TODO` credentials, or `console.log` of tokens.
- [ ] No empty `catch` blocks that swallow security errors.
- [ ] No disabled certificate validation or insecure defaults left for debugging.
