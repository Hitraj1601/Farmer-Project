const prisma = require("../config/db");
const ApiError = require("../utils/apiError");
const { recordPriceHistory } = require("./analytics.service");
const {
  indexCrop,
  deleteCropIndex,
  searchCropsElastic,
} = require("./elasticsearch.service");

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
  const crop = await prisma.crop.create({
    data,
    include: { farmer: { select: { name: true } } },
  });

  // Record price history
  await recordPriceHistory({
    cropId: crop.id,
    cropName: crop.cropName,
    category: crop.category,
    pricePerKg: crop.pricePerKg,
    location: crop.location,
    farmerId: crop.farmerId,
  });

  // Index in Elasticsearch (async non-blocking)
  indexCrop(crop).catch((err) =>
    console.warn("ES indexing warning:", err.message)
  );

  return crop;
};

const getLocationScore = (cropLocation, buyerLoc, serviceableAreas) => {
  if (!buyerLoc || typeof buyerLoc !== "string") return 0;
  const normBuyer = buyerLoc.toLowerCase().trim();
  if (!normBuyer) return 0;

  const buyerTokens = normBuyer.split(/[\s,]+/).filter((t) => t.length > 2);

  // 1. Direct Physical Crop Location Match (Tier 1 = Score 100)
  if (cropLocation && typeof cropLocation === "string") {
    const normCrop = cropLocation.toLowerCase().trim();
    if (normCrop === normBuyer || normCrop.includes(normBuyer) || normBuyer.includes(normCrop)) {
      return 100;
    }
    for (const token of buyerTokens) {
      if (normCrop.includes(token)) return 100;
    }
  }

  // 2. Farmer Serviceable Area Match (Tier 2 = Score 50)
  if (serviceableAreas && typeof serviceableAreas === "string") {
    const normAreas = serviceableAreas.toLowerCase().trim();
    if (normAreas.includes(normBuyer)) return 50;
    for (const token of buyerTokens) {
      if (normAreas.includes(token)) return 50;
    }
  }

  return 0;
};

const getAllCrops = async (query) => {
  const { page = 1, limit = 20, location, search, category, minPrice, maxPrice, farmerName, sortBy, buyerLocation } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const parsedLimit = parseInt(limit);

  // Try Elasticsearch search first if available
  const esCropIds = await searchCropsElastic(query);

  const where = {};

  if (esCropIds !== null) {
    // Elasticsearch responded with matching crop IDs
    where.id = { in: esCropIds };
  } else {
    // Fallback to case-insensitive Prisma database query
    if (location && sortBy !== "nearby") {
      where.OR = [
        { location: { contains: location, mode: "insensitive" } },
        { farmer: { farmerProfile: { serviceableAreas: { contains: location, mode: "insensitive" } } } },
      ];
    }
    if (search) {
      where.OR = [
        { cropName: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { farmer: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.pricePerKg = {};
      if (minPrice) where.pricePerKg.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerKg.lte = parseFloat(maxPrice);
    }

    // Farmer name filter (search via relation, case-insensitive)
    if (farmerName) {
      where.farmer = { name: { contains: farmerName, mode: "insensitive" } };
    }

    const categoryVariants = getCategoryVariants(category);
    if (categoryVariants.length > 0) {
      where.category = { in: categoryVariants };
    }
  }

  // Sort order
  let orderBy = { createdAt: "desc" }; // default: newest
  if (sortBy === "priceAsc") orderBy = { pricePerKg: "asc" };
  else if (sortBy === "priceDesc") orderBy = { pricePerKg: "desc" };
  else if (sortBy === "quantityDesc") orderBy = { quantity: "desc" };

  const effectiveBuyerLoc = buyerLocation || location;

  if (sortBy === "nearby" && effectiveBuyerLoc) {
    const allMatchingCrops = await prisma.crop.findMany({
      where,
      include: { farmer: { select: { id: true, name: true, phone: true, email: true, farmerProfile: { select: { serviceableAreas: true } } } } },
      orderBy: { createdAt: "desc" },
    });

    const annotated = allMatchingCrops.map((c) => {
      const score = getLocationScore(c.location, effectiveBuyerLoc, c.farmer?.farmerProfile?.serviceableAreas);
      return {
        ...c,
        locationScore: score,
        isNearby: score >= 50,
        isDirectLocal: score === 100,
      };
    });

    // Tiered sort: Score 100 first (direct city match), then score 50 (serviceable), then score 0 (others).
    // Within each tier, preserve exact createdAt DESC order.
    annotated.sort((a, b) => {
      if (b.locationScore !== a.locationScore) {
        return b.locationScore - a.locationScore;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const total = annotated.length;
    const paginatedCrops = annotated.slice(skip, skip + parsedLimit);

    return {
      crops: paginatedCrops,
      pagination: {
        total,
        page: parseInt(page),
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };
  }

  const [crops, total] = await Promise.all([
    prisma.crop.findMany({
      where,
      skip,
      take: parsedLimit,
      include: { farmer: { select: { id: true, name: true, phone: true, email: true, farmerProfile: { select: { serviceableAreas: true } } } } },
      orderBy,
    }),
    prisma.crop.count({ where }),
  ]);

  const annotatedCrops = crops.map((c) => ({
    ...c,
    isNearby: effectiveBuyerLoc ? checkIsNearby(c.location, effectiveBuyerLoc, c.farmer?.farmerProfile?.serviceableAreas) : false,
  }));

  return {
    crops: annotatedCrops,
    pagination: {
      total,
      page: parseInt(page),
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
    },
  };
};

const getMyCrops = async (farmerId, query = {}) => {
  const { page = 1, limit = 10 } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [crops, total] = await Promise.all([
    prisma.crop.findMany({
      where: { farmerId },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    }),
    prisma.crop.count({ where: { farmerId } }),
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

const getCropById = async (id) => {
  const crop = await prisma.crop.findUnique({
    where: { id },
    include: { farmer: { select: { id: true, name: true, phone: true, email: true, farmerProfile: { select: { serviceableAreas: true } } } } },
  });
  if (!crop) throw new ApiError(404, "Crop not found.");
  return crop;
};

const updateCrop = async (id, farmerId, data) => {
  const crop = await prisma.crop.findUnique({ where: { id } });
  if (!crop) throw new ApiError(404, "Crop not found.");
  if (crop.farmerId !== farmerId) throw new ApiError(403, "You can only update your own crops.");

  const updated = await prisma.crop.update({
    where: { id },
    data,
    include: { farmer: { select: { name: true } } },
  });

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

  // Update in Elasticsearch
  indexCrop(updated).catch((err) =>
    console.warn("ES update indexing warning:", err.message)
  );

  return updated;
};

const deleteCrop = async (id, farmerId) => {
  const crop = await prisma.crop.findUnique({ where: { id } });
  if (!crop) throw new ApiError(404, "Crop not found.");
  if (crop.farmerId !== farmerId) throw new ApiError(403, "You can only delete your own crops.");

  await prisma.crop.delete({ where: { id } });

  // Delete from Elasticsearch
  deleteCropIndex(id).catch((err) =>
    console.warn("ES delete indexing warning:", err.message)
  );

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

