const bcrypt = require("bcrypt");
const prisma = require("../config/db");
const { generateToken } = require("../utils/jwt");
const ApiError = require("../utils/apiError");

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const normalizePhone = (phone = "") => phone.trim();
const normalizeName = (name = "") => name.trim();

const register = async ({ name, phone, email, password, role }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);
  const normalizedName = normalizeName(name);

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email: normalizedEmail }, { phone: normalizedPhone }] },
  });
  if (existingUser) {
    throw new ApiError(409, "User with this email or phone already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: normalizedName,
      phone: normalizedPhone,
      email: normalizedEmail,
      password: password.trim(),
      role,
    },
    select: { id: true, name: true, phone: true, email: true, role: true, createdAt: true },
  });

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return { user, token };
};

const login = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
  });
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  return user;
};

module.exports = { register, login, getProfile };
