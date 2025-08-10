// controllers/authController.js
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { users } = require("../models"); // matches your model export
require("dotenv").config();

const { TWOFACTOR_API_KEY, JWT_SECRET = "a3f4e32a2f28639ce75d24a3b7dcaa5a7b27becdd077c5f4ee6ea2af50b27b231aa8a89b2d7e10eb567bf375b3999941ec4b7d1809dbf387d41a36ad91d76109" } = process.env;

// --- Helpers ---
const normalizePhone = (raw) => {
  if (!raw) return null;
  const p = String(raw).trim();
  // If starts with +, keep; if 10 digits, assume India and prefix 91; else pass through
  if (/^\+/.test(p)) return p;
  if (/^\d{10}$/.test(p)) return `+91${p}`;
  return p;
};

const sendOtpUrl = (phone) =>
  `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/${encodeURIComponent(phone)}/AUTOGEN`;

const verifyOtpUrl = (sessionId, code) =>
  `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/VERIFY/${encodeURIComponent(sessionId)}/${encodeURIComponent(code)}`;

// --- Send OTP ---
exports.sendOTP = async (req, res) => {
  try {
    const phoneRaw = req.body.phone;
    const phone = normalizePhone(phoneRaw);
    if (!phone) {
      return res.status(400).json({ success: false, message: "phone is required" });
    }

    const { data } = await axios.get(sendOtpUrl(phone), { timeout: 10000 });
    // Expect: { Status: "Success", Details: "<session_id>" }
    if (!data || data.Status !== "Success" || !data.Details) {
      return res.status(500).json({ success: false, message: data?.Details || "Failed to send OTP" });
    }

    // NOTE: we don't need to persist sessionId server-side (client will send it back on /verify-otp)
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

// --- Verify OTP ---
exports.verifyOtp = async (req, res) => {
  try {
    const { sessionId, code, phone: phoneRaw } = req.body;
    if (!sessionId || !code || !phoneRaw) {
      return res.status(400).json({ success: false, message: "sessionId, code and phone are required" });
    }

    const phone = normalizePhone(phoneRaw);

    // 1) Verify OTP with 2Factor
    const { data } = await axios.get(verifyOtpUrl(sessionId, code), { timeout: 10000 });
    const ok = data && data.Status === "Success" && /matched/i.test(data.Details);
    if (!ok) return res.status(400).json({ success: false, message: "Invalid OTP" });

    // 2) Find existing or create new user
    let user = await users.findOne({ where: { phone } });
    let created = false;

    if (!user) {
      created = true;
      // create with temp name (name NOT NULL) then rename to userXXX based on id
      user = await users.create({
        name: "user_tmp",
        phone,
        email: null,
        photo: null,
        password: null,
        points: 0,
        status: "ACTIVE",
      });

      const width = Math.max(3, String(user.id).length);
      await user.update({ name: `user${String(user.id).padStart(width, "0")}` });
    } else {
      if (user.status === "BANNED") {
        return res.status(403).json({ success: false, message: "Account is banned" });
      }
      if (user.status === "INACTIVE") {
        await user.update({ status: "ACTIVE" });
      }
      // normalize legacy names (e.g., "Guest") once
      if (!/^user\d+$/i.test(user.name)) {
        const width = Math.max(3, String(user.id).length);
        await user.update({ name: `user${String(user.id).padStart(width, "0")}` });
      }
    }

    // 3) JWT
    const token = jwt.sign({ uid: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: "24h" });

    return res.status(200).json({
      success: true,
      message: "OTP verified",
      token: `Bearer ${token}`,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        photo: user.photo,
        points: user.points,
        status: user.status,
      },
      created,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to verify OTP", error: err.message });
  }
};

// --- Optional: JWT auth middleware for protected routes ---
exports.authGuard = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: "Missing token" });

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { uid, phone, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid/expired token" });
  }
};
