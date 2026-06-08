# Payment Methods Guide

## Overview
The payment system now supports two payment methods:
1. **Razorpay** - For standard online payments (requires API keys)
2. **FREE** - For free orders (no payment processing needed)

## Free Payment Method

### Backend Changes

#### 1. New Route Added
```
POST /api/payments/free
```

**Request Body:**
```json
{
  "orderId": "order-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Free payment processed successfully.",
  "data": {
    "id": "payment-uuid",
    "orderId": "order-uuid",
    "amount": 0,
    "status": "SUCCESS",
    "method": "FREE",
    "transactionId": "FREE-order-uuid-timestamp",
    "createdAt": "2024-03-17T10:00:00Z"
  }
}
```

#### 2. Database Schema Update
- Added `method` field to Payment model
- Stores payment method as "RAZORPAY" or "FREE"

#### 3. Service Updates
- `processFreePayment()` function handles free orders
- Automatically sets order status to "ACCEPTED"
- Creates payment record with status "SUCCESS"

## Usage in Frontend

### Payment Service API
```javascript
// For free orders
const response = await paymentService.processFree(orderId);

// For Razorpay orders
const response = await paymentService.createOrder(orderId);
```

### Example Implementation

```javascript
const handleFreePayment = async () => {
  try {
    const result = await paymentService.processFree(orderId);
    if (result.success) {
      console.log("Free payment processed!");
      // Update UI to show order accepted
    }
  } catch (error) {
    console.error("Free payment failed:", error);
  }
};
```

## Key Features

✅ **No Gateway Required** - Works without Razorpay API keys
✅ **Instant Processing** - Payment is immediately marked as SUCCESS
✅ **Order Auto-Acceptance** - Order status automatically changes to ACCEPTED
✅ **Transaction Tracking** - Free payments get unique transaction IDs
✅ **Error Handling** - Validates user authorization and order ownership

## Configuration

No additional configuration needed for free payments! 
- The endpoint is already integrated
- No environment variables required
- Works with existing authentication middleware

## Migration Guide

If you have existing orders:
1. Run `npx prisma migrate dev` to apply schema changes
2. No data migration needed - existing payments remain unchanged
3. New free orders will use the new payment method

## Troubleshooting

### Free payment fails with "Order not found"
- Verify orderId exists in database
- Ensure the order belongs to the authenticated user

### Payment status shows as something other than SUCCESS
- Check if order was already paid
- Verify user has BUYER role

## Future Enhancements
- Add discount/coupon codes
- Implement payment history tracking
- Add admin dashboard for payment analytics
