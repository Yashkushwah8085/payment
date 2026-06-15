import crypto from 'crypto';
import { razorpay, isMockMode, config } from '../config/razorpay.js';

// In-memory store for simulation orders
const ordersDb = new Map();

class PaymentService {
  /**
   * Create an order (real Razorpay order or mock simulation)
   * @param {number} amount - Amount in Rupees
   * @param {string} currency - Currency code (default: INR)
   * @param {string} [receipt] - Custom receipt identifier
   */
  async createOrder(amount, currency = 'INR', receipt) {
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount provided.');
    }

    // Convert amount to paise (e.g. 500 Rupees -> 50000 paise)
    const amountInPaise = Math.round(amount * 100);
    const customReceipt = receipt || `rec_${Date.now()}`;

    // Fallback to Mock simulation order
    if (isMockMode || !razorpay) {
      const mockOrder = {
        id: `order_mock_${Math.random().toString(36).substring(2, 12)}`,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency: currency,
        receipt: customReceipt,
        status: 'created',
        attempts: 0,
        notes: { mode: 'mock' },
        created_at: Math.floor(Date.now() / 1000),
        isMock: true,
        key_id: 'mock_key_id'
      };

      ordersDb.set(mockOrder.id, mockOrder);
      return mockOrder;
    }

    // Real Razorpay order creation
    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: customReceipt
    };

    const order = await razorpay.orders.create(options);
    
    return {
      ...order,
      isMock: false,
      key_id: config.razorpayKeyId
    };
  }

  /**
   * Verify signature of the payment
   * @param {string} orderId - Razorpay/Mock Order ID
   * @param {string} paymentId - Razorpay/Mock Payment ID
   * @param {string} [signature] - Razorpay HMAC SHA256 Signature (required for real mode)
   */
  verifyPayment(orderId, paymentId, signature) {
    if (!orderId || !paymentId) {
      throw new Error('Missing required verification parameters: orderId or paymentId');
    }

    // Verify Mock Payment
    if (orderId.startsWith('order_mock_')) {
      const order = ordersDb.get(orderId);
      if (!order) {
        throw new Error('Order not found in simulation database.');
      }

      // Update in-memory DB status
      order.status = 'paid';
      order.amount_paid = order.amount;
      order.amount_due = 0;
      ordersDb.set(orderId, order);

      return {
        success: true,
        message: 'Mock Payment verification successful',
        payment: {
          id: paymentId,
          order_id: orderId,
          status: 'captured',
          method: 'mock',
          created_at: Math.floor(Date.now() / 1000)
        }
      };
    }

    // Verify Real Payment
    if (isMockMode || !razorpay) {
      throw new Error('Backend is running in mock mode, but received a live order ID.');
    }

    if (!signature) {
      throw new Error('Missing razorpay_signature for live payment verification.');
    }

    const hmac = crypto.createHmac('sha256', config.razorpayKeySecret);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === signature) {
      return {
        success: true,
        message: 'Payment verified and captured successfully'
      };
    } else {
      throw new Error('Invalid payment signature.');
    }
  }

  /**
   * Get server health status
   */
  getHealthStatus() {
    return {
      status: 'healthy',
      mode: isMockMode ? 'mock' : 'live/test',
      razorpayKeyId: isMockMode ? null : config.razorpayKeyId
    };
  }
}

export default new PaymentService();
