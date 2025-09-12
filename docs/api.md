# API Reference

The VIPSpot API provides secure contact form processing with comprehensive security measures.

## Base URL

```
https://vipspot-api-a7ce781e1397.herokuapp.com
```

## Endpoints

### Health Check

**GET** `/healthz`

Returns API health status.

**Response:**
```json
{
  "ok": true
}
```

**Example:**
```bash
curl -sS https://vipspot-api-a7ce781e1397.herokuapp.com/healthz
```

### Contact Form

**POST** `/contact`

Processes contact form submissions and sends dual emails.

**Headers:**
```
Content-Type: application/json
Origin: https://vipspot.net
X-Request-ID: unique-request-id
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "message": "Hello from VIPSpot!",
  "timestamp": 1694736000000
}
```

**Security Features:**
- **Timing Guard**: `timestamp` must be ≥ 3 seconds in the past
- **Rate Limiting**: 1 request per 30 seconds per IP
- **CORS**: Only allows whitelisted origins
- **Honeypot**: Rejects requests with `company` field

**Response (Success):**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "requestId": "req_123456789"
}
```

**Response (Error):**
```json
{
  "error": "Timing guard failed",
  "requestId": "req_123456789"
}
```

## Ready-to-Run Example

```bash
# Generate timestamp (5 seconds ago)
TIMESTAMP=$(($(date +%s) - 5))000

curl -sS -X POST https://vipspot-api-a7ce781e1397.herokuapp.com/contact \
  -H "Content-Type: application/json" \
  -H "Origin: https://vipspot.net" \
  -H "X-Request-ID: test-$(date +%s)" \
  -d '{
    "name": "API Test",
    "email": "test@example.com",
    "message": "Testing the VIPSpot API!",
    "timestamp": '${TIMESTAMP}'
  }'
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit**: 1 request per 30 seconds per IP address
- **Scope**: Per IP address
- **Headers**: Rate limit info included in response headers
- **429 Response**: When rate limit exceeded

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (missing fields, timing guard failed) |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |

## Security Headers

All responses include security headers:

- `X-Request-ID`: Request correlation ID
- `Server-Timing`: Performance metrics
- `X-Frame-Options`: DENY
- `X-Content-Type-Options`: nosniff
- Standard Helmet.js security headers