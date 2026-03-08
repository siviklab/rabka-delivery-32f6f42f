# Rabka Delivery — Restaurant Integration Guide

## Overview

This document describes how to integrate your restaurant POS/order management system with the Rabka Delivery platform to automatically dispatch delivery orders to our driver network.

---

## 1. Onboarding Checklist

| Step | Action | Who |
|------|--------|-----|
| 1 | Restaurant registered in Rabka Delivery admin panel | Rabka Admin |
| 2 | API key generated and shared securely | Rabka Admin |
| 3 | Restaurant provides `webhook_url` for status callbacks | Restaurant IT |
| 4 | Integration tested in sandbox environment | Both |
| 5 | Go-live | Both |

---

## 2. Authentication

All API requests require the header:

```
x-restaurant-api-key: <YOUR_API_KEY>
```

API keys are issued per-restaurant. Never share keys between locations. Keys can be rotated via the admin panel.

---

## 3. Create a Delivery Order

**Endpoint:** `POST /create-order`

### Request Example

```bash
curl -X POST \
  https://<BASE_URL>/functions/v1/create-order \
  -H "Content-Type: application/json" \
  -H "x-restaurant-api-key: rk_live_abc123def456" \
  -d '{
    "external_order_id": "REST-2026-00142",
    "customer_name": "Jan Kowalski",
    "customer_phone": "+48 123 456 789",
    "customer_address": "ul. Główna 15, 34-700 Rabka-Zdrój",
    "customer_lat": 49.6092,
    "customer_lng": 19.9567,
    "order_details": "Ring doorbell twice. 2nd floor.",
    "delivery_fee": 7.50,
    "items": [
      {
        "item_name": "Margherita Pizza",
        "quantity": 2,
        "unit_price": 24.99,
        "notes": "Extra cheese"
      },
      {
        "item_name": "Cola 0.5L",
        "quantity": 2,
        "unit_price": 5.00
      }
    ]
  }'
```

### Success Response (201)

```json
{
  "success": true,
  "order": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "external_order_id": "REST-2026-00142",
    "status": "pending",
    "created_at": "2026-03-08T14:30:00Z"
  }
}
```

### Error Response (400)

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    { "field": "customer_phone", "message": "Invalid phone format" },
    { "field": "items", "message": "At least one item is required" }
  ]
}
```

---

## 4. Check Order Status

**Endpoint:** `POST /order-status`

```bash
curl -X POST \
  https://<BASE_URL>/functions/v1/order-status \
  -H "Content-Type: application/json" \
  -H "x-restaurant-api-key: rk_live_abc123def456" \
  -d '{ "order_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890" }'
```

### Response

```json
{
  "success": true,
  "order": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "external_order_id": "REST-2026-00142",
    "status": "in_transit",
    "driver_name": "Piotr Nowak",
    "driver_phone": "+48 987 654 321",
    "estimated_time_minutes": 12,
    "picked_up_at": "2026-03-08T14:45:00Z",
    "delivered_at": null
  }
}
```

---

## 5. Cancel Order

**Endpoint:** `POST /cancel-order`

Only orders with status `pending` or `accepted` can be cancelled.

```bash
curl -X POST \
  https://<BASE_URL>/functions/v1/cancel-order \
  -H "Content-Type: application/json" \
  -H "x-restaurant-api-key: rk_live_abc123def456" \
  -d '{
    "order_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "reason": "Customer cancelled by phone"
  }'
```

---

## 6. Webhooks (Status Callbacks)

When an order status changes, we send a `POST` request to your registered `webhook_url`.

### Webhook Payload

```json
{
  "event": "order.status_changed",
  "timestamp": "2026-03-08T14:45:00Z",
  "data": {
    "order_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "external_order_id": "REST-2026-00142",
    "previous_status": "accepted",
    "new_status": "picked_up",
    "driver_name": "Piotr Nowak",
    "driver_phone": "+48 987 654 321",
    "picked_up_at": "2026-03-08T14:45:00Z",
    "delivered_at": null
  }
}
```

### Webhook Requirements

| Requirement | Detail |
|-------------|--------|
| Method | `POST` |
| Content-Type | `application/json` |
| Expected response | `2xx` within 5 seconds |
| Retry policy | 3 retries with exponential backoff (5s, 30s, 120s) |
| Signature header | `x-webhook-signature: HMAC-SHA256(payload, webhook_secret)` |

### Verifying Webhook Signatures

```python
import hmac, hashlib

def verify_signature(payload_body: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(secret.encode(), payload_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
```

```javascript
const crypto = require('crypto');

function verifySignature(payloadBody, signature, secret) {
  const expected = crypto.createHmac('sha256', secret).update(payloadBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
```

---

## 7. Order Status Lifecycle

```
pending → accepted → picked_up → in_transit → delivered
   ↓         ↓
 cancelled  cancelled
```

| Status | Description |
|--------|-------------|
| `pending` | Order received, awaiting driver assignment |
| `accepted` | Driver assigned, heading to restaurant |
| `picked_up` | Driver collected the order |
| `in_transit` | Driver en route to customer |
| `delivered` | Successfully delivered |
| `cancelled` | Order cancelled (before pickup only) |

---

## 8. Rate Limits

| Limit | Value |
|-------|-------|
| Create order | 60 requests/minute |
| Status check | 120 requests/minute |
| Cancel order | 30 requests/minute |

Exceeding limits returns `429 Too Many Requests`.

---

## 9. Error Codes

| HTTP Code | Meaning |
|-----------|---------|
| 201 | Order created |
| 200 | Success |
| 400 | Validation error (check `details` array) |
| 401 | Invalid/missing API key |
| 404 | Order not found |
| 409 | Conflict (e.g. duplicate `external_order_id`) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## 10. Sandbox / Testing

A sandbox environment is available for testing:

- **Base URL:** `https://<SANDBOX_URL>/functions/v1`
- **Test API Key:** Provided during onboarding
- Orders in sandbox are not dispatched to real drivers

---

## Support

For integration support, contact: **integration@rabka-delivery.com**
