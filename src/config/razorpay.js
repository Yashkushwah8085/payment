import dotenv from 'dotenv';
import Razorpay from 'razorpay';

// Load environment variables
dotenv.config();

const isKeyValid = (key) => {
  return key && key.trim() !== '' && !key.startsWith('YOUR_');
};

export const config = {
  port: process.env.PORT || 5000,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
};

export const isMockMode = !isKeyValid(config.razorpayKeyId) || !isKeyValid(config.razorpayKeySecret);

let razorpay = null;

if (!isMockMode) {
  try {
    razorpay = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret
    });
  } catch (error) {
    console.error('❌ Failed to initialize Razorpay SDK. Falling back to Mock Mode.', error);
  }
}

export { razorpay };
