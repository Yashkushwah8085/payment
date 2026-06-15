import paymentService from '../services/payment.service.js';

class PaymentController {
  /**
   * GET /api/health
   */
  async getHealth(req, res, next) {
    try {
      const healthInfo = paymentService.getHealthStatus();
      res.status(200).json(healthInfo);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payment/order
   */
  async createOrder(req, res, next) {
    try {
      const { amount, currency, receipt } = req.body;
      const order = await paymentService.createOrder(amount, currency, receipt);
      
      res.status(201).json({
        success: true,
        message: order.isMock 
          ? 'Mock order created successfully' 
          : 'Razorpay order created successfully',
        order
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payment/verify
   */
  async verifyPayment(req, res, next) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      
      const verificationResult = paymentService.verifyPayment(
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature
      );

      res.status(200).json(verificationResult);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message || 'Signature verification failed'
      });
    }
  }
}

export default new PaymentController();
