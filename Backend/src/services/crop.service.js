const prisma = require("../config/db");
const ApiError = require("../utils/apiError");
const { recordPriceHistory } = require("./analytics.service");

const CATEGORY_ALIASES = {
  grains: ["Grain", "Grains"],
  vegetables: ["Vegetable", "Vegetables"],
  fruits: ["Fruit", "Fruits"],
  spices: ["Spice", "Spices"],
  pulses: ["Pulse", "Pulses"],
  oilseeds: ["Oilseed", "Oilseeds"],
  dairy: ["Dairy"],
  others: ["Other", "Others"],
};

const getCategoryVariants = (category) => {
  if (!category || typeof category !== "string") return [];
  const normalized = category.trim().toLowerCase();
  if (!normalized || normalized === "all") return [];

  const aliases = CATEGORY_ALIASES[normalized];
  if (aliases) return aliases;

  // Handle singular/plural fallback for unexpected category labels.
  if (normalized.endsWith("s")) {
    return [category.trim(), category.trim().slice(0, -1)];
  }

  return [category.trim(), `${category.trim()}s`];
};

const createCrop = async (data) => {
  const crop = await prisma.crop.create({ data });

  // Record price history
  await recordPriceHistory({
    cropId: crop.id,
    cropName: crop.cropName,
    category: crop.category,
    pricePerKg: crop.pricePerKg,
    location: crop.location,
    farmerId: crop.farmerId,
  });

  return crop;
};

const getAllCrops = async (query) => {
  const { page = 1, limit = 10, location, search, category } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (location) where.location = { contains: location };
  if (search) where.cropName = { contains: search };
  const categoryVariants = getCategoryVariants(category);
  if (categoryVariants.length > 0) {
    where.category = { in: categoryVariants };
  }

  const [crops, total] = await Promise.all([
    prisma.crop.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: { farmer: { select: { id: true, name: true, phone: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.crop.count({ where }),
  ]);

  return {
    crops,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  };
};

const getMyCrops = async (farmerId) => {
  const crops = await prisma.crop.findMany({
    where: { farmerId },
    orderBy: { createdAt: "desc" },
  });
  return crops;
};

const getCropById = async (id) => {
  const crop = await prisma.crop.findUnique({
    where: { id },
    include: { farmer: { select: { id: true, name: true, phone: true, email: true } } },
  });
  if (!crop) throw new ApiError(404, "Crop not found.");
  return crop;
};

const updateCrop = async (id, farmerId, data) => {
  const crop = await prisma.crop.findUnique({ where: { id } });
  if (!crop) throw new ApiError(404, "Crop not found.");
  if (crop.farmerId !== farmerId) throw new ApiError(403, "You can only update your own crops.");

  const updated = await prisma.crop.update({ where: { id }, data });

  // Record price history if price changed
  if (data.pricePerKg && data.pricePerKg !== crop.pricePerKg) {
    await recordPriceHistory({
      cropId: updated.id,
      cropName: updated.cropName,
      category: updated.category,
      pricePerKg: updated.pricePerKg,
      location: updated.location,
      farmerId: updated.farmerId,
    });
  }

  return updated;
};

const deleteCrop = async (id, farmerId) => {
  const crop = await prisma.crop.findUnique({ where: { id } });
  if (!crop) throw new ApiError(404, "Crop not found.");
  if (crop.farmerId !== farmerId) throw new ApiError(403, "You can only delete your own crops.");

  await prisma.crop.delete({ where: { id } });
  return true;
};

const getStockAlerts = async (farmerId) => {
  const crops = await prisma.crop.findMany({
    where: {
      farmerId,
      stockAlertThreshold: { gt: 0 },
    },
    orderBy: { quantity: "asc" },
  });
  // Return only crops at or below their threshold
  return crops.filter((c) => c.quantity <= c.stockAlertThreshold);
};

module.exports = { createCrop, getAllCrops, getMyCrops, getCropById, updateCrop, deleteCrop, getStockAlerts };
