import express from 'express';
import {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getDashboardSummary,
} from '../controllers/subscriptionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All subscription routes require authentication

router.get('/summary/dashboard', getDashboardSummary);

router
  .route('/')
  .get(getSubscriptions)
  .post(createSubscription);

router
  .route('/:id')
  .get(getSubscriptionById)
  .put(updateSubscription)
  .delete(deleteSubscription);

export default router;
