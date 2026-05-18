import Subscription from '../models/Subscription.js';

export const getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id }).sort({ expiryDate: 1 });
    
    const { statusFilter, category } = req.query;
    
    let filtered = subscriptions;

    if (category && category !== 'All') {
      filtered = filtered.filter(sub => sub.category === category);
    }

    if (statusFilter) {
      filtered = filtered.filter(sub => {
        const info = sub.statusInfo;
        if (statusFilter === 'active') return info.status !== 'Expired';
        if (statusFilter === 'expired') return info.status === 'Expired';
        if (statusFilter === 'upcoming') return info.status === 'Expiring Soon';
        return true;
      });
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const createSubscription = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    const subscription = await Subscription.create(req.body);

    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    let subscription = await Subscription.findOne({ _id: req.params.id, user: req.user.id });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const getDashboardSummary = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id });

    let activeCount = 0;
    let expiredCount = 0;
    let upcomingCount = 0;
    let totalMonthlyOutflow = 0;
    let upcomingList = [];

    subscriptions.forEach(sub => {
      const info = sub.statusInfo;
      if (info.status === 'Expired') {
        expiredCount += 1;
      } else {
        activeCount += 1;
        totalMonthlyOutflow += sub.amount;
        if (info.status === 'Expiring Soon') {
          upcomingCount += 1;
          upcomingList.push(sub);
        }
      }
    });
    
    upcomingList.sort((a, b) => a.statusInfo.daysLeft - b.statusInfo.daysLeft);

    res.status(200).json({
      success: true,
      data: {
        totalActive: activeCount,
        totalExpired: expiredCount,
        upcomingRenewals: upcomingCount,
        totalMonthlyOutflow: Number(totalMonthlyOutflow.toFixed(2)),
        upcomingList,
      },
    });
  } catch (error) {
    next(error);
  }
};
