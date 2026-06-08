const prisma = require("../config/db");
const ApiError = require("../utils/apiError");

// Record a price history entry (called when crop is created/updated)
const recordPriceHistory = async ({ cropId, cropName, category, pricePerKg, location, farmerId }) => {
  return prisma.priceHistory.create({
    data: { cropId, cropName, category, pricePerKg, location, farmerId },
  });
};

// Get price trend for a crop name over time
const getPriceTrend = async (query) => {
  const { cropName, category, location, days = 90 } = query;

  const where = {};
  if (cropName) where.cropName = { contains: cropName };
  if (category) where.category = category;
  if (location) where.location = { contains: location };

  const since = new Date();
  since.setDate(since.getDate() - parseInt(days));
  where.recordedAt = { gte: since };

  const records = await prisma.priceHistory.findMany({
    where,
    orderBy: { recordedAt: "asc" },
    select: {
      id: true,
      cropName: true,
      category: true,
      pricePerKg: true,
      location: true,
      recordedAt: true,
    },
  });

  // Aggregate by date (daily average)
  const dailyMap = {};
  records.forEach((r) => {
    const dateKey = r.recordedAt.toISOString().slice(0, 10);
    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = { total: 0, count: 0, min: Infinity, max: -Infinity };
    }
    dailyMap[dateKey].total += r.pricePerKg;
    dailyMap[dateKey].count += 1;
    dailyMap[dateKey].min = Math.min(dailyMap[dateKey].min, r.pricePerKg);
    dailyMap[dateKey].max = Math.max(dailyMap[dateKey].max, r.pricePerKg);
  });

  const trend = Object.entries(dailyMap).map(([date, data]) => ({
    date,
    avgPrice: parseFloat((data.total / data.count).toFixed(2)),
    minPrice: data.min,
    maxPrice: data.max,
    samples: data.count,
  }));

  return { trend, totalRecords: records.length };
};

// Demand forecasting using moving average + simple linear regression
const getDemandForecast = async (query) => {
  const { cropName, category, days = 60 } = query;

  const since = new Date();
  since.setDate(since.getDate() - parseInt(days));

  const orderWhere = { createdAt: { gte: since } };
  if (cropName) orderWhere.crop = { cropName: { contains: cropName } };
  if (category) orderWhere.crop = { ...orderWhere.crop, category };

  // Get orders with price info
  const orders = await prisma.order.findMany({
    where: orderWhere,
    include: { crop: { select: { cropName: true, pricePerKg: true, category: true } } },
    orderBy: { createdAt: "asc" },
  });

  // Get price history
  const priceWhere = { recordedAt: { gte: since } };
  if (cropName) priceWhere.cropName = { contains: cropName };
  if (category) priceWhere.category = category;

  const priceRecords = await prisma.priceHistory.findMany({
    where: priceWhere,
    orderBy: { recordedAt: "asc" },
  });

  // Weekly aggregation for demand (orders)
  const weeklyDemand = {};
  orders.forEach((o) => {
    const weekStart = getWeekStart(o.createdAt);
    if (!weeklyDemand[weekStart]) weeklyDemand[weekStart] = { orders: 0, quantity: 0, revenue: 0 };
    weeklyDemand[weekStart].orders += 1;
    weeklyDemand[weekStart].quantity += o.quantity;
    weeklyDemand[weekStart].revenue += o.totalPrice;
  });

  const demandSeries = Object.entries(weeklyDemand)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, data]) => ({ week, ...data }));

  // Weekly price aggregation
  const weeklyPrice = {};
  priceRecords.forEach((r) => {
    const weekStart = getWeekStart(r.recordedAt);
    if (!weeklyPrice[weekStart]) weeklyPrice[weekStart] = { total: 0, count: 0 };
    weeklyPrice[weekStart].total += r.pricePerKg;
    weeklyPrice[weekStart].count += 1;
  });

  const priceSeries = Object.entries(weeklyPrice)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, data]) => ({
      week,
      avgPrice: parseFloat((data.total / data.count).toFixed(2)),
    }));

  // Moving average (3-week window) for price prediction
  const priceValues = priceSeries.map((p) => p.avgPrice);
  const movingAvg = calculateMovingAverage(priceValues, 3);

  // Linear regression on price trend
  const regression = linearRegression(priceValues);

  // Predict next week price
  const nextWeekIndex = priceValues.length;
  const predictedPrice = regression.slope * nextWeekIndex + regression.intercept;

  // Moving average prediction (last window average)
  const maPredict = movingAvg.length > 0 ? movingAvg[movingAvg.length - 1] : null;

  // Demand prediction using linear regression on quantities
  const demandValues = demandSeries.map((d) => d.quantity);
  const demandRegression = linearRegression(demandValues);
  const predictedDemand = Math.max(0, demandRegression.slope * demandValues.length + demandRegression.intercept);

  // Calculate demand factor
  const avgDemand = demandValues.length > 0 ? demandValues.reduce((a, b) => a + b, 0) / demandValues.length : 0;
  const demandFactor = avgDemand > 0 ? (predictedDemand - avgDemand) / avgDemand : 0;

  return {
    demandSeries,
    priceSeries,
    movingAverage: priceSeries.map((p, i) => ({
      ...p,
      movingAvg: movingAvg[i] || null,
    })),
    prediction: {
      nextWeekPrice: {
        regression: parseFloat(Math.max(0, predictedPrice).toFixed(2)),
        movingAverage: maPredict ? parseFloat(maPredict.toFixed(2)) : null,
        combined: parseFloat(
          Math.max(0, ((predictedPrice + (maPredict || predictedPrice)) / 2)).toFixed(2)
        ),
      },
      nextWeekDemand: parseFloat(predictedDemand.toFixed(2)),
      demandFactor: parseFloat(demandFactor.toFixed(4)),
      trend: regression.slope > 0.1 ? "RISING" : regression.slope < -0.1 ? "FALLING" : "STABLE",
    },
    stats: {
      totalOrders: orders.length,
      totalQuantity: orders.reduce((sum, o) => sum + o.quantity, 0),
      avgPrice: priceValues.length > 0
        ? parseFloat((priceValues.reduce((a, b) => a + b, 0) / priceValues.length).toFixed(2))
        : 0,
    },
  };
};

// Dynamic price suggestion
const getSuggestedPrice = async (query) => {
  const { cropName, category, location } = query;

  if (!cropName) throw new ApiError(400, "cropName is required for price suggestion.");

  // Get market average price for this crop
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const priceWhere = {
    cropName: { contains: cropName },
    recordedAt: { gte: thirtyDaysAgo },
  };
  if (category) priceWhere.category = category;

  const priceRecords = await prisma.priceHistory.findMany({
    where: priceWhere,
    select: { pricePerKg: true, recordedAt: true },
    orderBy: { recordedAt: "asc" },
  });

  // Get current live prices from crops
  const liveCrops = await prisma.crop.findMany({
    where: { cropName: { contains: cropName } },
    select: { pricePerKg: true, quantity: true, location: true },
  });

  // Calculate averages
  let allPrices = [
    ...priceRecords.map((p) => p.pricePerKg),
    ...liveCrops.map((c) => c.pricePerKg),
  ];

  // Fallback: if no data for this specific crop, try category-wide data
  if (allPrices.length === 0 && category) {
    const categoryPrices = await prisma.priceHistory.findMany({
      where: { category, recordedAt: { gte: thirtyDaysAgo } },
      select: { pricePerKg: true },
    });
    const categoryCrops = await prisma.crop.findMany({
      where: { category },
      select: { pricePerKg: true },
    });
    allPrices = [
      ...categoryPrices.map((p) => p.pricePerKg),
      ...categoryCrops.map((c) => c.pricePerKg),
    ];
  }

  // Fallback: if still no data, try all crops in the system
  if (allPrices.length === 0) {
    const anyCrops = await prisma.crop.findMany({
      select: { pricePerKg: true },
    });
    allPrices = anyCrops.map((c) => c.pricePerKg);
  }

  if (allPrices.length === 0) {
    throw new ApiError(404, "No price data available yet. Add some crops first to get price suggestions.");
  }

  const avgMarketPrice = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);

  // Calculate demand factor from recent orders
  const recentOrders = await prisma.order.findMany({
    where: {
      crop: { cropName: { contains: cropName } },
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { quantity: true, createdAt: true },
  });

  const totalDemand = recentOrders.reduce((sum, o) => sum + o.quantity, 0);
  const totalSupply = liveCrops.reduce((sum, c) => sum + c.quantity, 0);

  // Demand factor: positive when demand > supply
  let demandFactor = 0;
  if (totalSupply > 0) {
    const ratio = totalDemand / totalSupply;
    demandFactor = (ratio - 1) * 0.1 * avgMarketPrice; // ±10% adjustment based on supply/demand
  }

  // Price trend factor
  const prices = priceRecords.map((p) => p.pricePerKg);
  const regression = linearRegression(prices);
  const trendFactor = regression.slope * 0.5; // dampened slope influence

  const suggestedPrice = parseFloat(
    Math.max(minPrice * 0.8, avgMarketPrice + demandFactor + trendFactor).toFixed(2)
  );

  // Location-specific pricing
  let locationAvg = null;
  if (location) {
    const locationPrices = [
      ...priceRecords.filter(() => true).map((p) => p.pricePerKg), // Using all records as proxy
      ...liveCrops.filter((c) => c.location?.includes(location)).map((c) => c.pricePerKg),
    ];
    if (locationPrices.length > 0) {
      locationAvg = parseFloat(
        (locationPrices.reduce((a, b) => a + b, 0) / locationPrices.length).toFixed(2)
      );
    }
  }

  return {
    cropName,
    suggestedPrice,
    marketAverage: parseFloat(avgMarketPrice.toFixed(2)),
    priceRange: { min: parseFloat(minPrice.toFixed(2)), max: parseFloat(maxPrice.toFixed(2)) },
    demandFactor: parseFloat(demandFactor.toFixed(2)),
    trendFactor: parseFloat(trendFactor.toFixed(2)),
    trend: regression.slope > 0.1 ? "RISING" : regression.slope < -0.1 ? "FALLING" : "STABLE",
    supplyDemand: {
      totalDemand: parseFloat(totalDemand.toFixed(2)),
      totalSupply: parseFloat(totalSupply.toFixed(2)),
      ratio: totalSupply > 0 ? parseFloat((totalDemand / totalSupply).toFixed(2)) : 0,
    },
    locationAvg,
    formula: `Suggested = ₹${avgMarketPrice.toFixed(2)} (Market Avg) + ₹${demandFactor.toFixed(2)} (Demand) + ₹${trendFactor.toFixed(2)} (Trend)`,
  };
};

// --- Helper functions ---

function getWeekStart(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

function calculateMovingAverage(values, windowSize) {
  const result = [];
  for (let i = 0; i < values.length; i++) {
    if (i < windowSize - 1) {
      result.push(null);
    } else {
      const window = values.slice(i - windowSize + 1, i + 1);
      result.push(window.reduce((a, b) => a + b, 0) / windowSize);
    }
  }
  return result;
}

function linearRegression(values) {
  if (values.length < 2) return { slope: 0, intercept: values[0] || 0, r2: 0 };

  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
    sumY2 += values[i] * values[i];
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // R² calculation
  const ssTot = sumY2 - (sumY * sumY) / n;
  const ssRes = values.reduce((sum, y, i) => {
    const predicted = slope * i + intercept;
    return sum + (y - predicted) ** 2;
  }, 0);
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  return {
    slope: isNaN(slope) ? 0 : slope,
    intercept: isNaN(intercept) ? 0 : intercept,
    r2: isNaN(r2) ? 0 : r2,
  };
}

module.exports = {
  recordPriceHistory,
  getPriceTrend,
  getDemandForecast,
  getSuggestedPrice,
};
