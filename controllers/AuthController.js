const axios = require("axios");
const jwt = require("jsonwebtoken");
const { users, ModelHasRoles, Roles } = require("../models");
const bcrypt = require("bcrypt");
require("dotenv").config();

const {
  TWOFACTOR_API_KEY,
  JWT_SECRET = "a3f4e32a2f28639ce75d24a3b7dcaa5a7b27becdd077c5f4ee6ea2af50b27b231aa8a89b2d7e10eb567bf375b3999941ec4b7d1809dbf387d41a36ad91d76109",
  REFRESH_SECRET = "b4g5f43b3g39750df86e35b4c8edd6b8c38cfedd168853g5ff7fb3bg61c38c342bb9b90c3e8f21fc678cg486c4aaa052fd5c8c2910edc3g8e5e247be03e87210",
} = process.env;

const DUMMY_PHONE = "+911234567890";
const DUMMY_OTP = "636963";
const DUMMY_SESSION_ID = "guest_session_123456";

const normalizePhone = (raw) => {
  if (!raw) return null;
  const p = String(raw).trim();
  if (/^\+/.test(p)) return p;
  if (/^\d{10}$/.test(p)) return `+91${p}`;
  return p;
};

const generateUniqueUserOtp = async () => {
  const maxAttempts = 100;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const randomOtp = Math.floor(1000 + Math.random() * 9000);

    const existingUser = await users.findOne({
      where: { user_otp: randomOtp },
    });

    if (!existingUser) {
      return randomOtp;
    }

    attempts++;
  }

  const timestamp = Date.now();
  const fallbackOtp = parseInt(timestamp.toString().slice(-4));

  return fallbackOtp < 1000 ? fallbackOtp + 1000 : fallbackOtp;
};

const getUserRoles = async (userId) => {
  try {
    const userRoles = await ModelHasRoles.findAll({
      where: {
        model_id: userId,
        model_type: "App\\Models\\User",
      },
      include: [
        {
          model: Roles,
          as: "role",
          attributes: ["id", "name", "guard_name"],
        },
      ],
    });

    return userRoles.map((userRole) => ({
      id: userRole.role.id,
      name: userRole.role.name,
    }));
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return [];
  }
};

const formatUserResponse = async (user) => {
  const roles = await getUserRoles(user.id);
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    photo: user.photo,
    points: user.points,
    status: user.status,
    user_otp: user.user_otp,
    role: roles.length > 0 ? roles[0].name : null,
  };
};

const generateTokens = (user) => {
  const payload = { uid: user.id, phone: user.phone };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });

  return {
    accessToken: `Bearer ${accessToken}`,
    refreshToken: `Bearer ${refreshToken}`,
  };
};

const sendOtpUrl = (phone) =>
  `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/${encodeURIComponent(phone)}/AUTOGEN`;

const verifyOtpUrl = (sessionId, code) =>
  `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/VERIFY/${encodeURIComponent(sessionId)}/${encodeURIComponent(code)}`;

const isDummyPhone = (phone) => {
  return phone === DUMMY_PHONE || phone === "9999999999";
};

exports.sendOTP = async (req, res) => {
  try {
    const phoneRaw = req.body.phone;
    const phone = normalizePhone(phoneRaw);
    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "phone is required" });
    }

    if (isDummyPhone(phone)) {
      return res.status(200).json({
        success: true,
        message: "OTP sent (Guest Mode)",
        sessionId: DUMMY_SESSION_ID,
      });
    }

    const { data } = await axios.get(sendOtpUrl(phone), { timeout: 10000 });
    if (!data || data.Status !== "Success" || !data.Details) {
      return res.status(500).json({
        success: false,
        message: data?.Details || "Failed to send OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent",
      sessionId: data.Details,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: err.message,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { sessionId, code, phone: phoneRaw } = req.body;
    if (!sessionId || !code || !phoneRaw) {
      return res.status(400).json({
        success: false,
        message: "sessionId, code and phone are required",
      });
    }

    const phone = normalizePhone(phoneRaw);

    if (isDummyPhone(phone)) {
      if (sessionId === DUMMY_SESSION_ID && code === DUMMY_OTP) {
        let user = await users.findOne({ where: { phone: DUMMY_PHONE } });
        let created = false;

        if (!user) {
          created = true;
          const uniqueUserOtp = await generateUniqueUserOtp();

          user = await users.create({
            name: "Guest User",
            phone: DUMMY_PHONE,
            email: null,
            photo: null,
            password: null,
            points: 0,
            status: "ACTIVE",
            user_otp: uniqueUserOtp,
          });

          await ModelHasRoles.create({
            role_id: 4,
            model_type: "App\\Models\\User",
            model_id: user.id,
          });
        } else {
          if (user.status === "BANNED") {
            return res
              .status(403)
              .json({ success: false, message: "Account is banned" });
          }
          if (user.status === "INACTIVE") {
            await user.update({ status: "ACTIVE" });
          }
        }

        const tokens = generateTokens(user);
        const userResponse = await formatUserResponse(user);

        return res.status(200).json({
          success: true,
          message: "OTP verified (Guest Mode)",
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: userResponse,
          created,
          isGuest: true,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP for guest login",
        });
      }
    }

    const { data } = await axios.get(verifyOtpUrl(sessionId, code), {
      timeout: 10000,
    });
    const ok =
      data && data.Status === "Success" && /matched/i.test(data.Details);
    if (!ok)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    let user = await users.findOne({ where: { phone } });
    let created = false;

    if (!user) {
      created = true;

      const uniqueUserOtp = await generateUniqueUserOtp();

      user = await users.create({
        name: "user_tmp",
        phone,
        email: null,
        photo: null,
        password: null,
        points: 0,
        status: "ACTIVE",
        user_otp: uniqueUserOtp,
      });

      const width = Math.max(3, String(user.id).length);
      await user.update({
        name: `user${String(user.id).padStart(width, "0")}`,
      });

      await ModelHasRoles.create({
        role_id: 4,
        model_type: "App\\Models\\User",
        model_id: user.id,
      });
    } else {
      if (user.status === "BANNED") {
        return res
          .status(403)
          .json({ success: false, message: "Account is banned" });
      }
      if (user.status === "INACTIVE") {
        await user.update({ status: "ACTIVE" });
      }

      if (!/^user\d+$/i.test(user.name)) {
        const width = Math.max(3, String(user.id).length);
        await user.update({
          name: `user${String(user.id).padStart(width, "0")}`,
        });
      }
    }

    const tokens = generateTokens(user);
    const userResponse = await formatUserResponse(user);

    return res.status(200).json({
      success: true,
      message: "OTP verified",
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userResponse,
      created,
      isGuest: false,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: err.message,
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(400)
        .json({ success: false, message: "Refresh token is required" });
    }

    const token = refreshToken.startsWith("Bearer ")
      ? refreshToken.slice(7)
      : refreshToken;

    const decoded = jwt.verify(token, REFRESH_SECRET);

    const user = await users.findByPk(decoded.uid);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.status === "BANNED") {
      return res
        .status(403)
        .json({ success: false, message: "Account is banned" });
    }

    if (user.status === "INACTIVE") {
      return res
        .status(403)
        .json({ success: false, message: "Account is inactive" });
    }

    const tokens = generateTokens(user);
    const userResponse = await formatUserResponse(user);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userResponse,
      isGuest: isDummyPhone(user.phone),
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired refresh token" });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to refresh token",
      error: err.message,
    });
  }
};

exports.authGuard = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token)
      return res.status(401).json({ success: false, message: "Missing token" });

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid/expired token" });
  }
};

exports.sendOtpForPhoneUpdate = async (req, res) => {
  try {
    const { newPhone } = req.body;
    const userId = req.user.uid;

    if (!newPhone) {
      return res.status(400).json({
        success: false,
        message: "New phone number is required",
      });
    }

    const normalizedPhone = normalizePhone(newPhone);

    if (isDummyPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Cannot update to guest phone number",
      });
    }

    const existingUser = await users.findOne({
      where: {
        phone: normalizedPhone,
        id: { [require("sequelize").Op.ne]: userId },
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This phone number is already registered with another account",
      });
    }

    const { data } = await axios.get(sendOtpUrl(normalizedPhone), {
      timeout: 10000,
    });

    if (!data || data.Status !== "Success" || !data.Details) {
      return res.status(500).json({
        success: false,
        message: data?.Details || "Failed to send OTP to new phone number",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to new phone number",
      sessionId: data.Details,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP for phone update",
      error: err.message,
    });
  }
};

exports.verifyOtpAndUpdatePhone = async (req, res) => {
  try {
    const { newPhone, otp, sessionId } = req.body;
    const userId = req.user.uid;

    if (!newPhone || !otp || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "New phone number, OTP, and session ID are required",
      });
    }

    const normalizedPhone = normalizePhone(newPhone);

    if (isDummyPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Cannot update to guest phone number",
      });
    }

    const { data } = await axios.get(verifyOtpUrl(sessionId, otp), {
      timeout: 10000,
    });

    const isValidOtp =
      data && data.Status === "Success" && /matched/i.test(data.Details);

    if (!isValidOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const existingUser = await users.findOne({
      where: {
        phone: normalizedPhone,
        id: { [require("sequelize").Op.ne]: userId },
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This phone number is already registered with another account",
      });
    }

    const user = await users.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldPhone = user.phone;

    await user.update({ phone: normalizedPhone });

    const tokens = generateTokens(user);
    const userResponse = await formatUserResponse(user);

    return res.status(200).json({
      success: true,
      message: "Phone number updated successfully",
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userResponse,
      oldPhone: oldPhone,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to update phone number",
      error: err.message,
    });
  }
};

exports.guestLogin = async (req, res) => {
  try {
    let user = await users.findOne({ where: { phone: DUMMY_PHONE } });
    let created = false;

    if (!user) {
      created = true;
      const uniqueUserOtp = await generateUniqueUserOtp();

      user = await users.create({
        name: "Guest User",
        phone: DUMMY_PHONE,
        email: null,
        photo: null,
        password: null,
        points: 0,
        status: "ACTIVE",
        user_otp: uniqueUserOtp,
      });
    } else {
      if (user.status === "INACTIVE") {
        await user.update({ status: "ACTIVE" });
      }
    }

    const tokens = generateTokens(user);
    const userResponse = await formatUserResponse(user);

    return res.status(200).json({
      success: true,
      message: "Guest login successful",
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userResponse,
      created,
      isGuest: true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to login as guest",
      error: err.message,
    });
  }
};

exports.staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await users.findOne({ 
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.status === "BANNED") {
      return res.status(403).json({
        success: false,
        message: "Account is banned",
      });
    }

    if (user.status === "INACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    let isPasswordValid = false;
    
    if (user.password.startsWith('$2y$')) {
      const bcryptPassword = user.password.replace('$2y$', '$2a$');
      isPasswordValid = await bcrypt.compare(password, bcryptPassword);
    } else {
      isPasswordValid = await bcrypt.compare(password, user.password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const userRoles = await ModelHasRoles.findAll({
      where: {
        model_id: user.id,
        model_type: 'App\\Models\\User'
      },
      include: [{
        model: Roles,
        as: 'role',
        where: { name: 'staff' }
      }]
    });

    const hasStaffRole = userRoles.length > 0;

    if (!hasStaffRole) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Staff role required",
      });
    }

    const tokens = generateTokens(user);
    const userResponse = await formatUserResponse(user);

    return res.status(200).json({
      success: true,
      message: "Staff login successful",
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userResponse,
      isStaff: true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to login",
      error: err.message,
    });
  }
};