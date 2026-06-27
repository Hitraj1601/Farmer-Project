require("dotenv").config();
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const COMMON_PASSWORD = "Test@1234";
const shouldReset = process.argv.includes("--reset");

const daysAgo = (days, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const toPrice = (value) => parseFloat(value.toFixed(2));

async function resetDatabase() {
  await prisma.$transaction([
    prisma.orderTracking.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.review.deleteMany(),
    prisma.priceHistory.deleteMany(),
    prisma.order.deleteMany(),
    prisma.crop.deleteMany(),
    prisma.farmerProfile.deleteMany(),
    prisma.buyerProfile.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function createUsersAndProfiles() {
  const passwordHash = await bcrypt.hash(COMMON_PASSWORD, 12);

  const users = {
    admin: {
      name: "Farm Admin",
      phone: "9000000000",
      email: "admin@farmconnect.com",
      role: "ADMIN",
    },
    farmers: [
      {
        key: "rajesh",
        name: "Rajesh Kumar",
        phone: "9000000001",
        email: "rajesh@farmconnect.com",
        farmLocation: "Nashik, Maharashtra",
        bankAccount: "111122223333",
        ifscCode: "SBIN0000456",
      },
      {
        key: "sunita",
        name: "Sunita Patil",
        phone: "9000000002",
        email: "sunita@farmconnect.com",
        farmLocation: "Indore, Madhya Pradesh",
        bankAccount: "444455556666",
        ifscCode: "HDFC0001023",
      },
      {
        key: "harpreet",
        name: "Harpreet Singh",
        phone: "9000000003",
        email: "harpreet@farmconnect.com",
        farmLocation: "Ludhiana, Punjab",
        bankAccount: "777788889999",
        ifscCode: "ICIC0003041",
      },
    ],
    buyers: [
      {
        key: "freshmart",
        name: "Amit Verma",
        phone: "9000000004",
        email: "amit@freshmart.com",
        businessName: "FreshMart Retail",
        businessAddress: "MG Road, Pune",
      },
      {
        key: "greenbasket",
        name: "Priya Sharma",
        phone: "9000000005",
        email: "priya@greenbasket.com",
        businessName: "GreenBasket Foods",
        businessAddress: "Salt Lake, Kolkata",
      },
      {
        key: "citysupply",
        name: "Rohan Mehta",
        phone: "9000000006",
        email: "rohan@citysupply.com",
        businessName: "City Supply Chain",
        businessAddress: "Andheri East, Mumbai",
      },
      {
        key: "harvesthub",
        name: "Neha Gupta",
        phone: "9000000007",
        email: "neha@harvesthub.com",
        businessName: "Harvest Hub",
        businessAddress: "Sector 62, Noida",
      },
    ],
  };

  const admin = await prisma.user.upsert({
    where: { email: users.admin.email },
    update: {
      name: users.admin.name,
      phone: users.admin.phone,
      role: users.admin.role,
      password: passwordHash,
    },
    create: {
      ...users.admin,
      password: passwordHash,
      createdAt: daysAgo(35),
    },
  });

  const farmerMap = {};
  for (const farmer of users.farmers) {
    const user = await prisma.user.upsert({
      where: { email: farmer.email },
      update: {
        name: farmer.name,
        phone: farmer.phone,
        role: "FARMER",
        password: passwordHash,
      },
      create: {
        name: farmer.name,
        phone: farmer.phone,
        email: farmer.email,
        role: "FARMER",
        password: passwordHash,
        createdAt: daysAgo(32),
      },
    });

    await prisma.farmerProfile.upsert({
      where: { userId: user.id },
      update: {
        farmLocation: farmer.farmLocation,
        bankAccount: farmer.bankAccount,
        ifscCode: farmer.ifscCode,
      },
      create: {
        userId: user.id,
        farmLocation: farmer.farmLocation,
        bankAccount: farmer.bankAccount,
        ifscCode: farmer.ifscCode,
      },
    });

    farmerMap[farmer.key] = user;
  }

  const buyerMap = {};
  for (const buyer of users.buyers) {
    const user = await prisma.user.upsert({
      where: { email: buyer.email },
      update: {
        name: buyer.name,
        phone: buyer.phone,
        role: "BUYER",
        password: passwordHash,
      },
      create: {
        name: buyer.name,
        phone: buyer.phone,
        email: buyer.email,
        role: "BUYER",
        password: passwordHash,
        createdAt: daysAgo(30),
      },
    });

    await prisma.buyerProfile.upsert({
      where: { userId: user.id },
      update: {
        businessName: buyer.businessName,
        businessAddress: buyer.businessAddress,
      },
      create: {
        userId: user.id,
        businessName: buyer.businessName,
        businessAddress: buyer.businessAddress,
      },
    });

    buyerMap[buyer.key] = user;
  }

  return { admin, farmers: farmerMap, buyers: buyerMap };
}

async function createCrops(farmers) {
  const cropDefinitions = [
    // ── Vegetables ──
    {
      key: "tomato",
      cropName: "Tomato",
      quantity: 720,
      pricePerKg: 26,
      location: "Nashik",
      category: "Vegetable",
      imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea",
      farmerKey: "rajesh",
      createdAt: daysAgo(18),
    },
    {
      key: "onion",
      cropName: "Onion",
      quantity: 880,
      pricePerKg: 21,
      location: "Nashik",
      category: "Vegetable",
      imageUrl: "https://images.unsplash.com/photo-1508747703725-719777637510",
      farmerKey: "rajesh",
      createdAt: daysAgo(14),
    },
    {
      key: "potato",
      cropName: "Potato",
      quantity: 960,
      pricePerKg: 24,
      location: "Indore",
      category: "Vegetable",
      imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
      farmerKey: "sunita",
      createdAt: daysAgo(16),
    },
    {
      key: "brinjal",
      cropName: "Brinjal",
      quantity: 430,
      pricePerKg: 32,
      location: "Indore",
      category: "Vegetable",
      imageUrl: "https://images.unsplash.com/photo-1615484477778-ca3b77940c25",
      farmerKey: "sunita",
      createdAt: daysAgo(8),
    },
    {
      key: "cauliflower",
      cropName: "Cauliflower",
      quantity: 560,
      pricePerKg: 35,
      location: "Ludhiana",
      category: "Vegetable",
      imageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb",
      farmerKey: "harpreet",
      createdAt: daysAgo(7),
    },
    {
      key: "spinach",
      cropName: "Spinach",
      quantity: 310,
      pricePerKg: 28,
      location: "Nashik",
      category: "Vegetable",
      imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb",
      farmerKey: "rajesh",
      createdAt: daysAgo(5),
    },
    {
      key: "capsicum",
      cropName: "Green Capsicum",
      quantity: 280,
      pricePerKg: 55,
      location: "Indore",
      category: "Vegetable",
      imageUrl: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83",
      farmerKey: "sunita",
      createdAt: daysAgo(4),
    },
    // ── Grains ──
    {
      key: "wheat",
      cropName: "Wheat",
      quantity: 1500,
      pricePerKg: 31,
      location: "Indore",
      category: "Grain",
      imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1c0a9f9c2",
      farmerKey: "sunita",
      createdAt: daysAgo(13),
    },
    {
      key: "basmati",
      cropName: "Basmati Rice",
      quantity: 1250,
      pricePerKg: 54,
      location: "Ludhiana",
      category: "Grain",
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31b",
      farmerKey: "harpreet",
      createdAt: daysAgo(17),
    },
    {
      key: "maize",
      cropName: "Maize (Corn)",
      quantity: 1100,
      pricePerKg: 22,
      location: "Ludhiana",
      category: "Grain",
      imageUrl: "https://images.unsplash.com/photo-1551754655-cd27e38d2076",
      farmerKey: "harpreet",
      createdAt: daysAgo(12),
    },
    {
      key: "bajra",
      cropName: "Bajra (Pearl Millet)",
      quantity: 800,
      pricePerKg: 28,
      location: "Nashik",
      category: "Grain",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-070f87b36787",
      farmerKey: "rajesh",
      createdAt: daysAgo(15),
    },
    // ── Fruits ──
    {
      key: "banana",
      cropName: "Banana",
      quantity: 930,
      pricePerKg: 33,
      location: "Nashik",
      category: "Fruit",
      imageUrl: "https://images.unsplash.com/photo-1603833665858-e61d17a86224",
      farmerKey: "rajesh",
      createdAt: daysAgo(10),
    },
    {
      key: "mango",
      cropName: "Alphonso Mango",
      quantity: 600,
      pricePerKg: 120,
      location: "Nashik",
      category: "Fruit",
      imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078",
      farmerKey: "rajesh",
      createdAt: daysAgo(6),
    },
    {
      key: "guava",
      cropName: "Guava",
      quantity: 450,
      pricePerKg: 40,
      location: "Indore",
      category: "Fruit",
      imageUrl: "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46",
      farmerKey: "sunita",
      createdAt: daysAgo(5),
    },
    {
      key: "pomegranate",
      cropName: "Pomegranate",
      quantity: 380,
      pricePerKg: 95,
      location: "Nashik",
      category: "Fruit",
      imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5",
      farmerKey: "rajesh",
      createdAt: daysAgo(3),
    },
    // ── Spices ──
    {
      key: "turmeric",
      cropName: "Turmeric",
      quantity: 350,
      pricePerKg: 110,
      location: "Nashik",
      category: "Spice",
      imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5",
      farmerKey: "rajesh",
      createdAt: daysAgo(20),
    },
    {
      key: "redchilli",
      cropName: "Red Chilli",
      quantity: 260,
      pricePerKg: 150,
      location: "Indore",
      category: "Spice",
      imageUrl: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d",
      farmerKey: "sunita",
      createdAt: daysAgo(19),
    },
    {
      key: "coriander",
      cropName: "Coriander Seeds",
      quantity: 180,
      pricePerKg: 85,
      location: "Ludhiana",
      category: "Spice",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d",
      farmerKey: "harpreet",
      createdAt: daysAgo(9),
    },
    // ── Pulses ──
    {
      key: "moongdal",
      cropName: "Moong Dal",
      quantity: 700,
      pricePerKg: 95,
      location: "Indore",
      category: "Pulse",
      imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246",
      farmerKey: "sunita",
      createdAt: daysAgo(16),
    },
    {
      key: "chana",
      cropName: "Chickpea (Chana)",
      quantity: 850,
      pricePerKg: 65,
      location: "Ludhiana",
      category: "Pulse",
      imageUrl: "https://images.unsplash.com/photo-1515543904823-0e9137b9d0d7",
      farmerKey: "harpreet",
      createdAt: daysAgo(14),
    },
    {
      key: "toor",
      cropName: "Toor Dal (Arhar)",
      quantity: 620,
      pricePerKg: 105,
      location: "Nashik",
      category: "Pulse",
      imageUrl: "https://images.unsplash.com/photo-1612257416648-ee7a6c5b17eb",
      farmerKey: "rajesh",
      createdAt: daysAgo(11),
    },
    // ── Oilseeds ──
    {
      key: "mustard",
      cropName: "Mustard",
      quantity: 640,
      pricePerKg: 69,
      location: "Ludhiana",
      category: "Oilseed",
      imageUrl: "https://images.unsplash.com/photo-1498654077810-12f21d4d6dc3",
      farmerKey: "harpreet",
      createdAt: daysAgo(11),
    },
    {
      key: "soybean",
      cropName: "Soybean",
      quantity: 1120,
      pricePerKg: 47,
      location: "Indore",
      category: "Oilseed",
      imageUrl: "https://images.unsplash.com/photo-1628359355624-855775b5c9c3",
      farmerKey: "sunita",
      createdAt: daysAgo(9),
    },
    {
      key: "groundnut",
      cropName: "Groundnut (Peanut)",
      quantity: 540,
      pricePerKg: 75,
      location: "Nashik",
      category: "Oilseed",
      imageUrl: "https://images.unsplash.com/photo-1567892320421-1c657571ea4a",
      farmerKey: "rajesh",
      createdAt: daysAgo(7),
    },
    // ── Dairy ──
    {
      key: "milk",
      cropName: "Fresh Cow Milk",
      quantity: 200,
      pricePerKg: 55,
      location: "Ludhiana",
      category: "Dairy",
      imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b",
      farmerKey: "harpreet",
      createdAt: daysAgo(2),
    },
    {
      key: "ghee",
      cropName: "Pure Desi Ghee",
      quantity: 80,
      pricePerKg: 550,
      location: "Ludhiana",
      category: "Dairy",
      imageUrl: "https://images.unsplash.com/photo-1631209121750-a9f656d17e7e",
      farmerKey: "harpreet",
      createdAt: daysAgo(1),
    },
    {
      key: "paneer",
      cropName: "Fresh Paneer",
      quantity: 120,
      pricePerKg: 320,
      location: "Nashik",
      category: "Dairy",
      imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7",
      farmerKey: "rajesh",
      createdAt: daysAgo(1),
    },
    // ── Others ──
    {
      key: "jaggery",
      cropName: "Organic Jaggery (Gur)",
      quantity: 400,
      pricePerKg: 65,
      location: "Nashik",
      category: "Other",
      imageUrl: "https://images.unsplash.com/photo-1604152135912-04a022e23696",
      farmerKey: "rajesh",
      createdAt: daysAgo(6),
    },
    {
      key: "honey",
      cropName: "Raw Forest Honey",
      quantity: 150,
      pricePerKg: 350,
      location: "Indore",
      category: "Other",
      imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38",
      farmerKey: "sunita",
      createdAt: daysAgo(4),
    },
    {
      key: "sugarcane",
      cropName: "Sugarcane",
      quantity: 2000,
      pricePerKg: 4,
      location: "Indore",
      category: "Other",
      imageUrl: "https://images.unsplash.com/photo-1527676863397-3f0808d9a6fd",
      farmerKey: "sunita",
      createdAt: daysAgo(3),
    },
  ];

  const cropMap = {};
  for (const crop of cropDefinitions) {
    const farmerId = farmers[crop.farmerKey].id;
    const existing = await prisma.crop.findFirst({
      where: {
        farmerId,
        cropName: crop.cropName,
        location: crop.location,
      },
      orderBy: { createdAt: "asc" },
    });

    const created = existing
      ? await prisma.crop.update({
          where: { id: existing.id },
          data: {
            quantity: crop.quantity,
            pricePerKg: crop.pricePerKg,
            category: crop.category,
            imageUrl: crop.imageUrl,
          },
        })
      : await prisma.crop.create({
          data: {
            cropName: crop.cropName,
            quantity: crop.quantity,
            pricePerKg: crop.pricePerKg,
            location: crop.location,
            category: crop.category,
            imageUrl: crop.imageUrl,
            farmerId,
            createdAt: crop.createdAt,
          },
        });

    cropMap[crop.key] = created;
  }

  return cropMap;
}

async function createPriceHistory(crops, farmers) {
  if (!shouldReset) {
    const existingRows = await prisma.priceHistory.count();
    if (existingRows > 0) {
      console.log("Skipping price history in safe mode because records already exist.");
      return;
    }
  }

  const historyRows = [];

  Object.values(crops).forEach((crop, cropIndex) => {
    for (let point = 12; point >= 0; point -= 1) {
      const swing = ((cropIndex % 2 === 0 ? 1 : -1) * point * 0.45) + ((point % 3) - 1) * 0.35;

      historyRows.push({
        cropId: crop.id,
        cropName: crop.cropName,
        category: crop.category,
        pricePerKg: toPrice(crop.pricePerKg + swing),
        location: crop.location,
        farmerId: crop.farmerId,
        recordedAt: daysAgo(point * 2, 8 + (point % 3)),
      });
    }
  });

  await prisma.priceHistory.createMany({ data: historyRows });

  // Add a few category-wide comparative rows from different farmers.
  await prisma.priceHistory.createMany({
    data: [
      {
        cropId: crops.tomato.id,
        cropName: "Tomato",
        category: "Vegetable",
        pricePerKg: 27.4,
        location: "Indore",
        farmerId: farmers.sunita.id,
        recordedAt: daysAgo(5, 9),
      },
      {
        cropId: crops.wheat.id,
        cropName: "Wheat",
        category: "Grain",
        pricePerKg: 32.2,
        location: "Ludhiana",
        farmerId: farmers.harpreet.id,
        recordedAt: daysAgo(4, 11),
      },
      {
        cropId: crops.mustard.id,
        cropName: "Mustard",
        category: "Oilseed",
        pricePerKg: 70.1,
        location: "Nashik",
        farmerId: farmers.rajesh.id,
        recordedAt: daysAgo(3, 12),
      },
    ],
  });
}

async function createOrdersAndPayments(crops, buyers) {
  if (!shouldReset) {
    const existingOrders = await prisma.order.count();
    if (existingOrders > 0) {
      console.log("Skipping orders/payments/tracking in safe mode because orders already exist.");
      return;
    }
  }

  const orderDefinitions = [
    {
      buyerKey: "freshmart",
      cropKey: "tomato",
      quantity: 120,
      status: "DELIVERED",
      createdAt: daysAgo(12),
      payment: { status: "SUCCESS", transactionId: "pay_seed_001", razorpayOrderId: "order_seed_001" },
    },
    {
      buyerKey: "greenbasket",
      cropKey: "potato",
      quantity: 90,
      status: "SHIPPED",
      createdAt: daysAgo(9),
      payment: { status: "SUCCESS", transactionId: "pay_seed_002", razorpayOrderId: "order_seed_002" },
    },
    {
      buyerKey: "citysupply",
      cropKey: "wheat",
      quantity: 200,
      status: "ACCEPTED",
      createdAt: daysAgo(8),
      payment: { status: "SUCCESS", transactionId: "pay_seed_003", razorpayOrderId: "order_seed_003" },
    },
    {
      buyerKey: "harvesthub",
      cropKey: "basmati",
      quantity: 75,
      status: "PENDING",
      createdAt: daysAgo(2),
      payment: { status: "INITIATED", razorpayOrderId: "order_seed_004" },
    },
    {
      buyerKey: "greenbasket",
      cropKey: "onion",
      quantity: 160,
      status: "REJECTED",
      createdAt: daysAgo(6),
      payment: { status: "FAILED", razorpayOrderId: "order_seed_005" },
    },
    {
      buyerKey: "freshmart",
      cropKey: "mustard",
      quantity: 80,
      status: "DELIVERED",
      createdAt: daysAgo(15),
      payment: { status: "SUCCESS", transactionId: "pay_seed_006", razorpayOrderId: "order_seed_006" },
    },
    {
      buyerKey: "citysupply",
      cropKey: "banana",
      quantity: 140,
      status: "SHIPPED",
      createdAt: daysAgo(4),
      payment: { status: "SUCCESS", transactionId: "pay_seed_007", razorpayOrderId: "order_seed_007" },
    },
    {
      buyerKey: "harvesthub",
      cropKey: "soybean",
      quantity: 110,
      status: "ACCEPTED",
      createdAt: daysAgo(3),
      payment: { status: "SUCCESS", transactionId: "pay_seed_008", razorpayOrderId: "order_seed_008" },
    },
  ];

  const trackingNotes = {
    PENDING: "Order placed successfully",
    ACCEPTED: "Order accepted by farmer",
    REJECTED: "Order rejected by farmer",
    SHIPPED: "Order shipped - In transit",
    DELIVERED: "Order delivered successfully",
  };

  for (const [index, definition] of orderDefinitions.entries()) {
    const crop = crops[definition.cropKey];
    const buyer = buyers[definition.buyerKey];
    const totalPrice = toPrice(definition.quantity * crop.pricePerKg);

    const order = await prisma.order.create({
      data: {
        buyerId: buyer.id,
        cropId: crop.id,
        quantity: definition.quantity,
        totalPrice,
        status: definition.status,
        createdAt: definition.createdAt,
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: totalPrice,
        status: definition.payment.status,
        transactionId: definition.payment.transactionId || null,
        razorpayOrderId: definition.payment.razorpayOrderId || null,
        createdAt: daysAgo(Math.max(0, 14 - index), 13),
      },
    });

    const progression = {
      PENDING: ["PENDING"],
      ACCEPTED: ["PENDING", "ACCEPTED"],
      REJECTED: ["PENDING", "REJECTED"],
      SHIPPED: ["PENDING", "ACCEPTED", "SHIPPED"],
      DELIVERED: ["PENDING", "ACCEPTED", "SHIPPED", "DELIVERED"],
    }[definition.status];

    for (const [stepIndex, status] of progression.entries()) {
      await prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status,
          location: crop.location,
          note: trackingNotes[status],
          timestamp: new Date(definition.createdAt.getTime() + stepIndex * 6 * 60 * 60 * 1000),
        },
      });
    }
  }
}

async function createReviews(farmers, buyers) {
  const reviews = [
    {
      buyerId: buyers.freshmart.id,
      farmerId: farmers.rajesh.id,
      rating: 5,
      comment: "Fresh produce and timely delivery. Great quality for retail stores.",
      createdAt: daysAgo(7),
    },
    {
      buyerId: buyers.greenbasket.id,
      farmerId: farmers.sunita.id,
      rating: 4,
      comment: "Consistent quality. Packaging can improve a little during transit.",
      createdAt: daysAgo(5),
    },
    {
      buyerId: buyers.citysupply.id,
      farmerId: farmers.harpreet.id,
      rating: 5,
      comment: "Best grain quality we received this quarter.",
      createdAt: daysAgo(4),
    },
    {
      buyerId: buyers.harvesthub.id,
      farmerId: farmers.rajesh.id,
      rating: 4,
      comment: "Good communication and fair pricing.",
      createdAt: daysAgo(2),
    },
  ];

  for (const review of reviews) {
    await prisma.review.upsert({
      where: {
        buyerId_farmerId_cropId: {
          buyerId: review.buyerId,
          farmerId: review.farmerId,
          cropId: null,
        },
      },
      update: {
        rating: review.rating,
        comment: review.comment,
      },
      create: review,
    });
  }
}

async function main() {
  if (shouldReset) {
    console.log("Reset mode enabled: removing existing data...");
    await resetDatabase();
  } else {
    console.log("Safe mode enabled: preserving existing data and adding missing demo records...");
  }

  console.log("Creating users and profiles...");
  const { farmers, buyers } = await createUsersAndProfiles();

  console.log("Creating crops...");
  const crops = await createCrops(farmers);

  console.log("Creating historical market prices...");
  await createPriceHistory(crops, farmers);

  console.log("Creating orders, payments, and tracking timeline...");
  await createOrdersAndPayments(crops, buyers);

  console.log("Creating reviews...");
  await createReviews(farmers, buyers);

  const [usersCount, cropsCount, ordersCount, paymentsCount, reviewsCount, historyCount] = await Promise.all([
    prisma.user.count(),
    prisma.crop.count(),
    prisma.order.count(),
    prisma.payment.count(),
    prisma.review.count(),
    prisma.priceHistory.count(),
  ]);

  console.log(`\nSeed completed successfully (${shouldReset ? "reset" : "safe"} mode).`);
  console.log(`Users: ${usersCount}, Crops: ${cropsCount}, Orders: ${ordersCount}, Payments: ${paymentsCount}, Reviews: ${reviewsCount}, PriceHistory: ${historyCount}`);
  console.log("\nDemo password for all seeded users: Test@1234");
  console.log("Admin login: admin@farmconnect.com");
  console.log("Farmer login: rajesh@farmconnect.com");
  console.log("Buyer login: amit@freshmart.com");
  console.log("\nRun with --reset for full wipe and reseed.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
