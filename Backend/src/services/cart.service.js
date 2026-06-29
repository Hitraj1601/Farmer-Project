const prisma = require("../config/db");
const ApiError = require("../utils/apiError");
const { addTrackingEntry } = require("./tracking.service");
const { notifyUser } = require("../config/socket");

/**
 * Get or create a cart for the buyer, with full item details.
 */
const getCart = async (buyerId) => {
  let cart = await prisma.cart.findUnique({
    where: { buyerId },
    include: {
      items: {
        include: {
          crop: {
            select: {
              id: true,
              cropName: true,
              pricePerKg: true,
              quantity: true,
              location: true,
              category: true,
              imageUrl: true,
              farmerId: true,
              farmer: { select: { id: true, name: true, phone: true } },
            },
          },
        },
        orderBy: { addedAt: "asc" },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { buyerId },
      include: { items: { include: { crop: true } } },
    });
  }

  return cart;
};

/**
 * Add an item to cart (or update quantity if already exists).
 */
const addToCart = async ({ buyerId, cropId, quantity }) => {
  const crop = await prisma.crop.findUnique({ where: { id: cropId } });
  if (!crop) throw new ApiError(404, "Crop not found.");
  if (crop.farmerId === buyerId) throw new ApiError(400, "You cannot add your own crop to cart.");
  if (quantity > crop.quantity) throw new ApiError(400, `Only ${crop.quantity} kg available.`);

  // Get or create cart
  let cart = await prisma.cart.findUnique({ where: { buyerId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { buyerId } });
  }

  // Upsert cart item
  const item = await prisma.cartItem.upsert({
    where: { cartId_cropId: { cartId: cart.id, cropId } },
    create: { cartId: cart.id, cropId, quantity },
    update: { quantity },
    include: {
      crop: {
        select: {
          id: true,
          cropName: true,
          pricePerKg: true,
          quantity: true,
          imageUrl: true,
          location: true,
          farmerId: true,
          farmer: { select: { id: true, name: true } },
        },
      },
    },
  });

  return item;
};

/**
 * Update quantity of a cart item.
 */
const updateCartItem = async ({ buyerId, cropId, quantity }) => {
  const cart = await prisma.cart.findUnique({ where: { buyerId } });
  if (!cart) throw new ApiError(404, "Cart not found.");

  const crop = await prisma.crop.findUnique({ where: { id: cropId } });
  if (!crop) throw new ApiError(404, "Crop not found.");
  if (quantity > crop.quantity) throw new ApiError(400, `Only ${crop.quantity} kg available.`);

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_cropId: { cartId: cart.id, cropId } },
  });
  if (!existing) throw new ApiError(404, "Item not in cart.");

  const item = await prisma.cartItem.update({
    where: { id: existing.id },
    data: { quantity },
    include: {
      crop: {
        select: {
          id: true,
          cropName: true,
          pricePerKg: true,
          quantity: true,
          imageUrl: true,
          location: true,
          farmerId: true,
          farmer: { select: { id: true, name: true } },
        },
      },
    },
  });

  return item;
};

/**
 * Remove a single item from cart.
 */
const removeFromCart = async ({ buyerId, cropId }) => {
  const cart = await prisma.cart.findUnique({ where: { buyerId } });
  if (!cart) throw new ApiError(404, "Cart not found.");

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_cropId: { cartId: cart.id, cropId } },
  });
  if (!existing) throw new ApiError(404, "Item not in cart.");

  await prisma.cartItem.delete({ where: { id: existing.id } });
  return true;
};

/**
 * Clear entire cart.
 */
const clearCart = async (buyerId) => {
  const cart = await prisma.cart.findUnique({ where: { buyerId } });
  if (!cart) return true;

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return true;
};

/**
 * Checkout: validate items, group by farmer, create orders with OrderItems.
 */
const checkout = async (buyerId) => {
  // 1. Get cart with items
  const cart = await prisma.cart.findUnique({
    where: { buyerId },
    include: {
      items: {
        include: {
          crop: {
            select: {
              id: true,
              cropName: true,
              pricePerKg: true,
              quantity: true,
              location: true,
              farmerId: true,
              farmer: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty.");
  }

  // 2. Validate all items
  const errors = [];
  for (const item of cart.items) {
    if (!item.crop) {
      errors.push(`A crop in your cart no longer exists.`);
      continue;
    }
    if (item.crop.farmerId === buyerId) {
      errors.push(`You cannot order your own crop "${item.crop.cropName}".`);
    }
    if (item.quantity > item.crop.quantity) {
      errors.push(`"${item.crop.cropName}" only has ${item.crop.quantity} kg available (you requested ${item.quantity} kg).`);
    }
  }
  if (errors.length > 0) {
    throw new ApiError(400, errors.join(" | "));
  }

  // 3. Group items by farmerId
  const farmerGroups = {};
  for (const item of cart.items) {
    const fId = item.crop.farmerId;
    if (!farmerGroups[fId]) {
      farmerGroups[fId] = { farmerId: fId, farmerName: item.crop.farmer?.name, items: [] };
    }
    farmerGroups[fId].items.push(item);
  }

  // 4. Create orders within a transaction
  const createdOrders = await prisma.$transaction(async (tx) => {
    const orders = [];

    for (const group of Object.values(farmerGroups)) {
      // Calculate total price for this farmer's order
      let totalPrice = 0;
      const orderItemsData = group.items.map((item) => {
        const subtotal = parseFloat((item.quantity * item.crop.pricePerKg).toFixed(2));
        totalPrice += subtotal;
        return {
          cropId: item.cropId,
          quantity: item.quantity,
          pricePerKg: item.crop.pricePerKg,
          subtotal,
        };
      });
      totalPrice = parseFloat(totalPrice.toFixed(2));

      // Use the first crop as the "primary" crop for backward compat
      const primaryItem = group.items[0];

      const order = await tx.order.create({
        data: {
          buyerId,
          cropId: primaryItem.cropId,
          quantity: primaryItem.quantity,
          totalPrice,
          items: { create: orderItemsData },
        },
        include: {
          items: {
            include: {
              crop: { select: { cropName: true, pricePerKg: true, imageUrl: true } },
            },
          },
          crop: { select: { cropName: true, pricePerKg: true, location: true } },
        },
      });

      orders.push(order);
    }

    // 5. Clear the cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return orders;
  });

  // 6. Post-transaction: create tracking entries + notify farmers
  for (const order of createdOrders) {
    const cropNames = order.items.map((i) => i.crop?.cropName).filter(Boolean).join(", ");

    await addTrackingEntry({
      orderId: order.id,
      status: "PENDING",
      location: order.crop?.location || null,
      note: "Order placed successfully",
    });

    // Find the farmerId from the primary crop
    const primaryCrop = await prisma.crop.findUnique({
      where: { id: order.cropId },
      select: { farmerId: true },
    });

    if (primaryCrop) {
      notifyUser(primaryCrop.farmerId, {
        title: "New Order Received!",
        message: `A buyer ordered ${order.items.length} item(s): ${cropNames}.`,
        type: "success",
        orderId: order.id,
      });
    }
  }

  return createdOrders;
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart, checkout };
