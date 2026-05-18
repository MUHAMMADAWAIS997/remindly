import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a subscription name'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Entertainment', 'Education', 'Health', 'Utilities', 'Finance', 'Other'],
    default: 'Other',
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date'],
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please add an expiry or renewal date'],
  },
  amount: {
    type: Number,
    required: [true, 'Please add a subscription amount'],
    min: 0,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  lastNotifiedAt: {
    type: Date,
  },
}, { timestamps: true });

subscriptionSchema.virtual('statusInfo').get(function() {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { status: 'Expired', daysLeft };
  } else if (daysLeft <= 7) {
    return { status: 'Expiring Soon', daysLeft };
  } else {
    return { status: 'Active', daysLeft };
  }
});

subscriptionSchema.set('toJSON', { virtuals: true });
subscriptionSchema.set('toObject', { virtuals: true });

export default mongoose.model('Subscription', subscriptionSchema);
