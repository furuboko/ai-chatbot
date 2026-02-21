# Security Checklist - Multimodal AI Chatbot

## 🔒 Image Upload Security

### Client-Side Validation
- [ ] File type validation (JPEG, PNG, GIF, WebP only)
- [ ] File size validation (5MB max per image)
- [ ] Image count validation (5 max per message)
- [ ] Compression reduces file size (1024px max, 85% quality)

### Server-Side Validation
- [ ] Zod schema validation for request body
- [ ] MIME type verification
- [ ] Magic number checking (prevents file type spoofing)
- [ ] Malicious payload detection (script tags, etc.)
- [ ] Filename sanitization (path traversal prevention)
- [ ] Base64 format validation

### Security Tests
```bash
# Test 1: Upload HTML file renamed as .jpg
# Expected: Rejected (magic number mismatch)

# Test 2: Upload oversized file (6MB)
# Expected: Rejected (size limit)

# Test 3: Upload 6 images
# Expected: Rejected (count limit)

# Test 4: Filename with path traversal (../../etc/passwd.jpg)
# Expected: Filename sanitized

# Test 5: Image with script tags in metadata
# Expected: Detected and rejected
```

## 🛡️ API Security

### Rate Limiting
- [ ] Rate limiting active (10 requests/minute per client IP)
- [ ] Rate limit applies to both text and image uploads
- [ ] 429 status code returned when limit exceeded
- [ ] X-RateLimit headers included in response

### Input Validation
- [ ] Message length validation (10,000 chars max)
- [ ] XSS prevention in text messages
- [ ] Either message or images required (not both empty)
- [ ] Content sanitization before storage

### Authentication & Authorization
- [ ] No authentication required (by design)
- [ ] All endpoints publicly accessible
- [ ] CORS properly configured
- [ ] Security headers set (X-Content-Type-Options, X-Frame-Options, etc.)

## 🔐 Environment Variables

### Secrets Management
- [ ] ANTHROPIC_API_KEY stored in Google Secret Manager
- [ ] DATABASE_URL stored in Google Secret Manager
- [ ] No secrets in code or git repository
- [ ] .env.local in .gitignore
- [ ] .env.example provided without actual values

### API Key Rotation
- [ ] API keys rotated quarterly
- [ ] Old keys revoked after rotation
- [ ] Usage monitored in Anthropic console

## 💾 Database Security

### MongoDB Security
- [ ] Authentication enabled
- [ ] TLS/SSL for connections
- [ ] IP whitelist configured
- [ ] Regular backups enabled
- [ ] No sensitive data in plain text

### Data Validation
- [ ] Prisma schema enforces types
- [ ] Content field accepts both string and JSON
- [ ] No SQL injection risk (using Prisma ORM)

## 🌐 Deployment Security

### Cloud Run Configuration
- [ ] HTTPS only (no HTTP)
- [ ] Secrets via Secret Manager (not environment variables)
- [ ] Container runs as non-root user
- [ ] No unnecessary ports exposed
- [ ] Timeout set (300s)

### GitHub Actions
- [ ] Workload Identity Federation (not service account keys)
- [ ] Secrets stored in GitHub Secrets
- [ ] Workflow permissions minimal (read, id-token:write)
- [ ] No hardcoded credentials

## 🧪 Security Testing

### Automated Tests
- [ ] Unit tests for validation functions
- [ ] Integration tests for API endpoints
- [ ] Magic number verification tests

### Manual Tests
- [ ] Attempt file type spoofing
- [ ] Attempt oversized uploads
- [ ] Attempt XSS in messages
- [ ] Attempt path traversal in filenames
- [ ] Verify rate limiting

### Penetration Testing (Optional)
- [ ] Run automated security scanner
- [ ] Test for common OWASP vulnerabilities
- [ ] Check for exposed secrets

## 📋 Compliance

### OWASP Top 10 (2021)
1. **Broken Access Control**: N/A (no authentication)
2. **Cryptographic Failures**: ✅ TLS for connections, secrets in Secret Manager
3. **Injection**: ✅ Parameterized queries via Prisma, input sanitization
4. **Insecure Design**: ✅ Security by design (validation, rate limiting)
5. **Security Misconfiguration**: ✅ Security headers, proper CORS
6. **Vulnerable Components**: ⚠️ Regular dependency updates needed
7. **Identification/Auth Failures**: N/A (no authentication)
8. **Software/Data Integrity**: ✅ No CDN usage, verified dependencies
9. **Logging/Monitoring**: ⚠️ Basic logging in place, monitoring needed
10. **SSRF**: ✅ No external URL fetching

### Recommendations
- ⚠️ Implement monitoring and alerting
- ⚠️ Set up automated dependency updates (Dependabot)
- ⚠️ Add user authentication for production
- ⚠️ Implement message TTL (auto-delete old messages)
- ⚠️ Add CSP headers for XSS protection

## 🚨 Incident Response

### If Security Issue Detected
1. Disable affected endpoints immediately
2. Rotate API keys and secrets
3. Review logs for suspicious activity
4. Patch vulnerability
5. Deploy fixed version
6. Monitor for recurrence

### Contact
- Report security issues to repository owner
- Do not disclose publicly until patched

---

**Last Updated**: 2026-02-21
**Version**: 1.0.0
