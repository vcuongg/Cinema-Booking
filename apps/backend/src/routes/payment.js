const express = require("express");

const {
  confirmPayosWebhook,
  handlePayosCancel,
  handlePayosReturn,
  handlePayosWebhook,
} = require("../controllers/paymentController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/payos/webhook", handlePayosWebhook);
router.post("/payos/confirm-webhook", protect, confirmPayosWebhook);
router.get("/payos/return", handlePayosReturn);
router.get("/payos/cancel", handlePayosCancel);

module.exports = router;
