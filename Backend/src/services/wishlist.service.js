const prisma = require("../config/db");
const ApiError = require("../utils/apiError");

const addToWishlist = async (buyerId, cropId) => {
  const crop = await prisma.crop.findUnique({ where: { id: cropId } });
  if (!crop) throw new ApiError(404, "Crop not found.");
  if (crop.farmerId === buyerId) throw new ApiError(400, "You cannot wishlist your own crop.");

  // Upsert: if already exists, update notifiedPrice to current price
  const item = await prisma.wishlist.upsert({
    where: { buyerId_cropId: { buyerId, cropId } },
    update: { notifiedPrice: crop.pricePerKg },
    create: { buyerId, cropId, notifiedPrice: crop.pricePerKg },
    include: { crop: { select: { cropName: true, pricePerKg: true, imageUrl: true, location: true } } },
  });
  return item;
};

const removeFromWishlist = async (buyerId, cropId) => {
  const item = await prisma.wishlist.findUnique({
    where: { buyerId_cropId: { buyerId, cropId } },
  });
  if (!item) throw new ApiError(404, "Item not in wishlist.");
  await prisma.wishlist.delete({ where: { buyerId_cropId: { buyerId, cropId } } });
  return true;
};

const getWishlist = async (buyerId) => {
  const items = await prisma.wishlist.findMany({
    where: { buyerId },
    include: {
      crop: {
        select: {
          id: true,
          cropName: true,
          pricePerKg: true,
          quantity: true,
          imageUrl: true,
          location: true,
          category: true,
          farmer: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { addedAt: "desc" },
  });
  return items;
};

const checkPriceDrops = async (buyerId) => {
  const items = await prisma.wishlist.findMany({
    where: { buyerId },
    include: {
      crop: { select: { id: true, cropName: true, pricePerKg: true, imageUrl: true } },
    },
  });

  const drops = items
    .filter((item) => item.crop.pricePerKg < item.notifiedPrice)
    .map((item) => ({
      cropId: item.cropId,
      cropName: item.crop.cropName,
      imageUrl: item.crop.imageUrl,
      oldPrice: item.notifiedPrice,
      newPrice: item.crop.pricePerKg,
      drop: parseFloat((item.notifiedPrice - item.crop.pricePerKg).toFixed(2)),
    }));

  // Update notifiedPrice to current price so user is only notified once per drop
  if (drops.length > 0) {
    await Promise.all(
      drops.map((d) =>
        prisma.wishlist.update({
          where: { buyerId_cropId: { buyerId, cropId: d.cropId } },
          data: { notifiedPrice: d.newPrice },
        })
      )
    );
  }

  return drops;
};

const getWishlistIds = async (buyerId) => {
  const items = await prisma.wishlist.findMany({
    where: { buyerId },
    select: { cropId: true },
  });
  return items.map((i) => i.cropId);
};

module.exports = { addToWishlist, removeFromWishlist, getWishlist, checkPriceDrops, getWishlistIds };
