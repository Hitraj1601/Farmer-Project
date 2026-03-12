const prisma = require("../config/db");
const ApiError = require("../utils/apiError");

const getAllUsers = async (query) => {
  const { page = 1, limit = 10, role, search } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (role) where.role = role.toUpperCase();
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
        farmerProfile: true,
        buyerProfile: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  };
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      createdAt: true,
      farmerProfile: true,
      buyerProfile: true,
      crops: true,
      buyerOrders: { include: { crop: true, payment: true } },
      reviewsGiven: true,
      reviewsReceived: true,
    },
  });
  if (!user) throw new ApiError(404, "User not found.");
  return user;
};

const getAllOrders = async (query) => {
  const { page = 1, limit = 10, status } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (status) where.status = status.toUpperCase();

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        buyer: { select: { id: true, name: true, email: true, phone: true } },
        crop: {
          select: {
            cropName: true,
            pricePerKg: true,
            location: true,
            farmer: { select: { id: true, name: true, phone: true } },
          },
        },
        payment: { select: { status: true, transactionId: true, amount: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  };
};

const getAnalytics = async () => {
  const [
    totalUsers,
    totalFarmers,
    totalBuyers,
    totalCrops,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    totalRevenue,
    successfulPayments,
    totalReviews,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "FARMER" } }),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.crop.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.aggregate({ _sum: { totalPrice: true }, where: { status: { in: ["ACCEPTED", "SHIPPED", "DELIVERED"] } } }),
    prisma.payment.count({ where: { status: "SUCCESS" } }),
    prisma.review.count(),
  ]);

  // Get revenue by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentOrders = await prisma.order.findMany({
    where: {
      status: { in: ["ACCEPTED", "SHIPPED", "DELIVERED"] },
      createdAt: { gte: sixMonthsAgo },
    },
    select: { totalPrice: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const monthlyMap = {};
  recentOrders.forEach((order) => {
    const month = order.createdAt.toLocaleString("en-US", { month: "short", year: "2-digit" });
    monthlyMap[month] = (monthlyMap[month] || 0) + order.totalPrice;
  });

  const revenueByMonth = Object.entries(monthlyMap).map(([month, revenue]) => ({
    month,
    revenue: parseFloat(revenue.toFixed(2)),
  }));

  return {
    users: { total: totalUsers, farmers: totalFarmers, buyers: totalBuyers },
    crops: { total: totalCrops },
    orders: { total: totalOrders, pending: pendingOrders, delivered: deliveredOrders },
    revenue: { total: totalRevenue._sum.totalPrice || 0 },
    payments: { successful: successfulPayments },
    reviews: { total: totalReviews },
    revenueByMonth,
  };
};

const deleteUser = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new ApiError(404, "User not found.");
  if (user.role === "ADMIN") throw new ApiError(400, "Cannot delete an admin user.");

  await prisma.user.delete({ where: { id } });
  return true;
};

module.exports = { getAllUsers, getUserById, getAllOrders, getAnalytics, deleteUser };
