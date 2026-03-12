const prisma = require("../config/db");
const ApiError = require("../utils/apiError");

const upsertFarmerProfile = async (userId, data) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "FARMER") {
    throw new ApiError(403, "Only farmers can create a farmer profile.");
  }

  const profile = await prisma.farmerProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  return profile;
};

const getFarmerProfile = async (userId) => {
  const profile = await prisma.farmerProfile.findUnique({
    where: { userId },
    include: { user: { select: { id: true, name: true, phone: true, email: true, role: true } } },
  });
  if (!profile) return null;
  return profile;
};

const upsertBuyerProfile = async (userId, data) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "BUYER") {
    throw new ApiError(403, "Only buyers can create a buyer profile.");
  }

  const profile = await prisma.buyerProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  return profile;
};

const getBuyerProfile = async (userId) => {
  const profile = await prisma.buyerProfile.findUnique({
    where: { userId },
    include: { user: { select: { id: true, name: true, phone: true, email: true, role: true } } },
  });
  if (!profile) return null;
  return profile;
};

module.exports = { upsertFarmerProfile, getFarmerProfile, upsertBuyerProfile, getBuyerProfile };
