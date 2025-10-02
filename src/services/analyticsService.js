import Delivery from '../models/Delivery.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';

// Get analytics data
export const getAnalytics = async (startDate, endDate) => {
  try {
    // Date filters
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      dateFilter.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      dateFilter.createdAt = { $lte: new Date(endDate) };
    }

    // Delivery analytics
    const totalDeliveries = await Delivery.countDocuments(dateFilter);
    const pendingDeliveries = await Delivery.countDocuments({ ...dateFilter, status: 'pending' });
    const inProgressDeliveries = await Delivery.countDocuments({ ...dateFilter, status: 'in-progress' });
    const completedDeliveries = await Delivery.countDocuments({ ...dateFilter, status: 'completed' });
    const cancelledDeliveries = await Delivery.countDocuments({ ...dateFilter, status: 'cancelled' });

    // Payment analytics
    const successfulPayments = await Payment.find({ ...dateFilter, status: 'success' });
    const totalRevenue = successfulPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const averageOrderValue = successfulPayments.length > 0 ? totalRevenue / successfulPayments.length : 0;

    // User analytics
    const totalCustomers = await User.countDocuments({ ...dateFilter, role: 'customer' });
    const totalRiders = await User.countDocuments({ ...dateFilter, role: 'rider' });
    const availableRiders = await User.countDocuments({ ...dateFilter, role: 'rider', isAvailable: true });

    // Delivery time analytics (for completed deliveries)
    const completedDeliveriesData = await Delivery.find({ ...dateFilter, status: 'completed' });
    const deliveryTimes = completedDeliveriesData.map(delivery => {
      if (delivery.pickupTime && delivery.deliveryTime) {
        return (delivery.deliveryTime - delivery.pickupTime) / (1000 * 60); // in minutes
      }
      return 0;
    }).filter(time => time > 0);

    const averageDeliveryTime = deliveryTimes.length > 0 
      ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length 
      : 0;

    return {
      deliveries: {
        total: totalDeliveries,
        pending: pendingDeliveries,
        inProgress: inProgressDeliveries,
        completed: completedDeliveries,
        cancelled: cancelledDeliveries
      },
      revenue: {
        total: totalRevenue,
        averageOrderValue: averageOrderValue,
        successfulTransactions: successfulPayments.length
      },
      users: {
        customers: totalCustomers,
        riders: totalRiders,
        availableRiders: availableRiders
      },
      performance: {
        averageDeliveryTime: averageDeliveryTime
      }
    };
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw error;
  }
};