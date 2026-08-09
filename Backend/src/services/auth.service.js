const bcrypt = require("bcrypt");
const prisma = require("../config/db");
const { generateToken } = require("../utils/jwt");
const ApiError = require("../utils/apiError");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

const resetTokens = new Map();

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
      password: hashedPassword,
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

const googleLogin = async ({ idToken, role }) => {
  const audience = process.env.GOOGLE_CLIENT_ID;
  if (!audience) {
    throw new ApiError(500, "Google Client ID is not configured on the server. Please set GOOGLE_CLIENT_ID in your .env file.");
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience,
    });
    payload = ticket.getPayload();
  } catch (error) {
    console.error("Google token verification error:", error);
    throw new ApiError(401, "Invalid or expired Google ID Token.");
  }

  const { email, name } = payload;
  const normalizedEmail = normalizeEmail(email);

  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    const allowedRoles = ["FARMER", "BUYER"];
    const userRole = role && allowedRoles.includes(role.toUpperCase()) ? role.toUpperCase() : "BUYER";

    user = await prisma.user.create({
      data: {
        name: name || "Google User",
        email: normalizedEmail,
        role: userRole,
      },
    });
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

const forgotPassword = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user) {
    throw new ApiError(404, "User with this email does not exist.");
  }

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 15 * 60 * 1000; // 15 mins
  resetTokens.set(code, { email: normalizedEmail, expires });

  console.log(`\n====================================`);
  console.log(`🔑 PASSWORD RESET CODE GENERATED`);
  console.log(`Email: ${normalizedEmail}`);
  console.log(`Code: ${code}`);
  console.log(`Expires in: 15 minutes`);
  console.log(`====================================\n`);

  return { message: "Password reset code has been sent. Please check your console." };
};

const resetPassword = async ({ email, code, newPassword }) => {
  const normalizedEmail = normalizeEmail(email);
  const tokenData = resetTokens.get(code);

  if (!tokenData) {
    throw new ApiError(400, "Invalid or incorrect verification code.");
  }

  if (Date.now() > tokenData.expires) {
    resetTokens.delete(code);
    throw new ApiError(400, "Verification code has expired.");
  }

  if (tokenData.email !== normalizedEmail) {
    throw new ApiError(400, "Verification code does not match this email address.");
  }

  // Verify strong password format
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!strongPasswordRegex.test(newPassword)) {
    throw new ApiError(400, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { email: normalizedEmail },
    data: { password: hashedPassword },
  });

  resetTokens.delete(code);
  return { message: "Password updated successfully." };
};

module.exports = { register, login, getProfile, googleLogin, forgotPassword, resetPassword };
