import express from 'express';
import cors from 'cors';
import { config, isMockMode } from './config/razorpay.js';
import router from './routes/payment.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();
const PORT = config.port;

// Express Configuration
app.use(cors({
  origin: ['http://localhost:4200'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Mount API routes
app.use('/api', router);

// Error Handler Middleware
app.use(errorHandler);

// Log warnings if in mock mode
if (isMockMode) {
  console.log('--------------------------------------------------');
  console.log('⚠️  WARNING: Running in MOCK SANDBOX MODE.');
  console.log('No valid Razorpay Key ID or Secret found in .env.');
  console.log('Payments will be simulated using a custom UI modal.');
  console.log('--------------------------------------------------');
} else {
  console.log('🚀 Razorpay initialized in PRODUCTION/SANDBOX mode.');
}

// Start Listening
app.listen(PORT, () => {
  console.log(`⚡ Production-grade Server running on http://localhost:${PORT}`);
});
