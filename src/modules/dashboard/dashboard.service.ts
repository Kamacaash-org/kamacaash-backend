import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

type DashboardPoint = { date: string; count: number; revenue?: number };

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<any>,
    @InjectModel('Business') private readonly businessModel: Model<any>,
    @InjectModel('SurplusPackage') private readonly surplusPackageModel: Model<any>,
    @InjectModel('Order') private readonly orderModel: Model<any>,
    @InjectModel('Review') private readonly reviewModel: Model<any>,
  ) {}

  async getAdminDashboardOverview() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [
      totalUsers,
      totalBusinesses,
      approvedBusinesses,
      pendingBusinesses,
      rejectedBusinesses,
      totalPackages,
      totalOrders,
      totalReviews,
      orderStatusCounts,
      revenueAgg,
      avgRatingAgg,
      todayOrdersAgg,
      ordersLast7DaysAgg,
      usersLast7DaysAgg,
      businessesLast7DaysAgg,
      recentOrders,
      recentReviews,
      recentBusinesses,
    ] = await Promise.all([
      this.userModel.countDocuments({ isBanned: { $ne: true } }),
      this.businessModel.countDocuments({ isArchived: { $ne: true } }),
      this.businessModel.countDocuments({ status: 'APPROVED', isArchived: { $ne: true } }),
      this.businessModel.countDocuments({ status: 'PENDING', isArchived: { $ne: true } }),
      this.businessModel.countDocuments({ status: 'REJECTED', isArchived: { $ne: true } }),
      this.surplusPackageModel.countDocuments({ isArchived: { $ne: true } }),
      this.orderModel.countDocuments({ isArchived: { $ne: true } }),
      this.reviewModel.countDocuments({}),
      this.orderModel.aggregate([
        { $match: { isArchived: { $ne: true } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.orderModel.aggregate([
        {
          $match: {
            isArchived: { $ne: true },
            status: 'COMPLETED',
            paymentStatus: 'CONFIRMED',
          },
        },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
      ]),
      this.reviewModel.aggregate([
        { $group: { _id: null, averageRating: { $avg: '$rating' } } },
      ]),
      this.orderModel.aggregate([
        {
          $match: {
            isArchived: { $ne: true },
            createdAt: { $gte: todayStart, $lte: todayEnd },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$status', 'COMPLETED'] },
                      { $eq: ['$paymentStatus', 'CONFIRMED'] },
                    ],
                  },
                  '$amount',
                  0,
                ],
              },
            },
          },
        },
      ]),
      this.orderModel.aggregate([
        {
          $match: {
            isArchived: { $ne: true },
            createdAt: { $gte: sevenDaysAgo, $lte: todayEnd },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$status', 'COMPLETED'] },
                      { $eq: ['$paymentStatus', 'CONFIRMED'] },
                    ],
                  },
                  '$amount',
                  0,
                ],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      this.userModel.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo, $lte: todayEnd } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      this.businessModel.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo, $lte: todayEnd } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      this.orderModel
        .find({ isArchived: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(8)
        .select('orderId userId businessId amount status paymentStatus createdAt')
        .lean(),
      this.reviewModel
        .find({})
        .sort({ createdAt: -1 })
        .limit(8)
        .select('businessId userId rating comment isVisible isFeatured createdAt')
        .populate({ path: 'userId', select: 'fullName name surname email' })
        .populate({ path: 'businessId', select: 'businessName' })
        .lean(),
      this.businessModel
        .find({ isArchived: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(8)
        .select('businessName status isActive createdAt')
        .lean(),
    ]);

    const byStatus = {
      RESERVED: 0,
      PAID: 0,
      READY_FOR_PICKUP: 0,
      COMPLETED: 0,
      EXPIRED: 0,
      CANCELLED: 0,
    };

    for (const item of orderStatusCounts) {
      if (item?._id && byStatus[item._id as keyof typeof byStatus] !== undefined) {
        byStatus[item._id as keyof typeof byStatus] = item.count || 0;
      }
    }

    const ordersLast7Days = this.build7DaySeries(ordersLast7DaysAgg, sevenDaysAgo);
    const usersLast7Days = this.build7DaySeries(usersLast7DaysAgg, sevenDaysAgo);
    const businessesLast7Days = this.build7DaySeries(businessesLast7DaysAgg, sevenDaysAgo);
    const friendlyRecentReviews = (recentReviews || []).map((review: any) => {
      const user = review?.userId && typeof review.userId === 'object' ? review.userId : null;
      const business =
        review?.businessId && typeof review.businessId === 'object' ? review.businessId : null;
      const reviewerName =
        user?.fullName ||
        [user?.name, user?.surname].filter(Boolean).join(' ') ||
        'Unknown User';

      return {
        reviewId: review?._id?.toString?.() || review?._id,
        reviewerId: user?._id?.toString?.() || review?.userId?.toString?.() || review?.userId,
        reviewerName,
        reviewerEmail: user?.email || null,
        businessId:
          business?._id?.toString?.() || review?.businessId?.toString?.() || review?.businessId,
        businessName: business?.businessName || 'Unknown Business',
        rating: review?.rating || 0,
        comment: review?.comment || '',
        isVisible: !!review?.isVisible,
        isFeatured: !!review?.isFeatured,
        createdAt: review?.createdAt,
      };
    });

    return {
      generatedAt: now.toISOString(),
      summary: {
        totalUsers,
        totalBusinesses,
        approvedBusinesses,
        pendingBusinesses,
        rejectedBusinesses,
        totalPackages,
        totalOrders,
        totalReviews,
        totalRevenue: revenueAgg[0]?.totalRevenue || 0,
        averageRating: Number((avgRatingAgg[0]?.averageRating || 0).toFixed(2)),
      },
      orders: {
        byStatus,
        today: {
          count: todayOrdersAgg[0]?.count || 0,
          revenue: todayOrdersAgg[0]?.revenue || 0,
        },
      },
      trends: {
        ordersLast7Days,
        usersLast7Days,
        businessesLast7Days,
      },
      recent: {
        orders: recentOrders,
        reviews: friendlyRecentReviews,
        businesses: recentBusinesses,
        recentLogins: [
          {
            userId: 'USR-1001',
            userName: 'John Carter',
            role: 'Business Owner',
            loginAt: '2026-02-12T08:05:00.000Z',
            ipAddress: '192.168.10.24',
          },
          {
            userId: 'USR-1002',
            userName: 'Aisha Khan',
            role: 'Customer',
            loginAt: '2026-02-12T07:50:00.000Z',
            ipAddress: '192.168.10.37',
          },
          {
            userId: 'USR-1003',
            userName: 'Mateo Silva',
            role: 'Customer',
            loginAt: '2026-02-12T07:41:00.000Z',
            ipAddress: '192.168.10.11',
          },
          {
            userId: 'USR-1004',
            userName: 'Priya Sharma',
            role: 'Business Staff',
            loginAt: '2026-02-12T07:33:00.000Z',
            ipAddress: '192.168.10.52',
          },
          {
            userId: 'USR-1005',
            userName: 'David Lee',
            role: 'Admin',
            loginAt: '2026-02-12T07:20:00.000Z',
            ipAddress: '192.168.10.3',
          },
        ],
      },
    };
  }

  private build7DaySeries(rawPoints: any[], startDate: Date): DashboardPoint[] {
    const map = new Map<string, { count: number; revenue?: number }>();
    for (const row of rawPoints) {
      map.set(row._id, { count: row.count || 0, revenue: row.revenue });
    }

    const points: DashboardPoint[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const key = date.toISOString().slice(0, 10);
      const row = map.get(key);
      points.push({
        date: key,
        count: row?.count || 0,
        ...(row?.revenue !== undefined ? { revenue: row.revenue || 0 } : {}),
      });
    }
    return points;
  }
}
