const router = require("express").Router();
const auth = require("../controllers/AuthController");

router.post("/send-otp", auth.sendOTP);
router.post("/verify-otp", auth.verifyOtp);
router.post("/refresh", auth.refreshToken);

router.post("/user/send-otp", auth.authGuard, auth.sendOtpForPhoneUpdate);
router.post("/user/verify-otp", auth.authGuard, auth.verifyOtpAndUpdatePhone);

router.post("/delivery/login", auth.staffLogin);
module.exports = router;
