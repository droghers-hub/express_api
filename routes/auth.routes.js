const router = require("express").Router();
const auth = require("../controllers/AuthController");

router.post("/send-otp", auth.sendOTP);
router.post("/verify-otp", auth.verifyOtp);
router.post("/refresh", auth.refreshToken);

module.exports = router;