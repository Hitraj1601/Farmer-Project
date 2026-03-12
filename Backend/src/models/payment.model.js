// Payment model is defined in prisma/schema.prisma
// This file re-exports the Prisma client for convenience
const prisma = require("../config/db");

module.exports = prisma.payment;