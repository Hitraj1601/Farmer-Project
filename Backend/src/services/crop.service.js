const prisma = require("../config/db");
const ApiError = require("../utils/apiError");

const createCrop = async (data) => {
  const crop = await prisma.crop.create({ data });
  return crop;
};

const getAllCrops = async (query) => {
  const { page = 1, limit = 10, location, search } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (location) where.location = { contains: location };
  if (search) where.cropName = { contains: search };

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
  return updated;
};

const deleteCrop = async (id, farmerId) => {
  const crop = await prisma.crop.findUnique({ where: { id } });
  if (!crop) throw new ApiError(404, "Crop not found.");
  if (crop.farmerId !== farmerId) throw new ApiError(403, "You can only delete your own crops.");

  await prisma.crop.delete({ where: { id } });
  return true;
};

module.exports = { createCrop, getAllCrops, getMyCrops, getCropById, updateCrop, deleteCrop };
