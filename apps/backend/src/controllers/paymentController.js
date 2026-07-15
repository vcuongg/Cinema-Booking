const Booking = require("../models/Booking");
const generateTicketCode = require("../utils/ticketCode");
const {
  confirmWebhookUrl,
  verifyWebhookSignature,
} = require("../services/payosService");

const isPayosSuccess = (payload) =>
  payload.success === true &&
  payload.code === "00" &&
  payload.data &&
  payload.data.code === "00";

const handlePayosWebhook = async (req, res) => {
  const payload = req.body;

  try {
    const isValidSignature = verifyWebhookSignature({
      data: payload.data,
      signature: payload.signature,
    });

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid PayOS webhook signature",
      });
    }

    const orderCode = payload.data && payload.data.orderCode;

    if (!orderCode) {
      return res.status(200).json({
        success: true,
        message: "PayOS webhook ignored: missing orderCode",
      });
    }

    const booking = await Booking.findOne({ payosOrderCode: orderCode });

    if (!booking) {
      return res.status(200).json({
        success: true,
        message: "PayOS webhook received, but booking was not found",
      });
    }

    booking.payosStatus = payload.data.desc || payload.desc || "";
    booking.paymentReference = payload.data.reference || booking.paymentReference;
    booking.payosPaymentLinkId =
      payload.data.paymentLinkId || booking.payosPaymentLinkId;

    if (isPayosSuccess(payload)) {
      booking.paymentStatus = "paid";
      booking.bookingStatus = "confirmed";
      booking.ticketCode = booking.ticketCode || generateTicketCode();
      booking.paidAt = booking.paidAt || new Date();
    } else {
      booking.paymentStatus = "failed";
      booking.bookingStatus = "cancelled";
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "PayOS webhook processed",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const handlePayosWebhookCheck = (req, res) =>
  res.status(200).json({
    success: true,
    message: "PayOS webhook endpoint is ready",
  });

const handlePayosReturn = (req, res) =>
  res.status(200).json({
    success: true,
    message: "Payment return received. Please check booking status.",
    query: req.query,
  });

const handlePayosCancel = (req, res) =>
  res.status(200).json({
    success: true,
    message: "Payment was cancelled.",
    query: req.query,
  });

const buildWebhookUrl = (req) => {
  if (process.env.PAYOS_WEBHOOK_URL) {
    return process.env.PAYOS_WEBHOOK_URL;
  }

  if (process.env.API_PUBLIC_URL) {
    return `${process.env.API_PUBLIC_URL.replace(/\/$/, "")}/api/payments/payos/webhook`;
  }

  return `${req.protocol}://${req.get("host")}/api/payments/payos/webhook`;
};

const confirmPayosWebhook = async (req, res) => {
  if (!["admin", "staff"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Only admin or staff can update PayOS webhook",
    });
  }

  const webhookUrl = req.body.webhookUrl || buildWebhookUrl(req);

  if (!webhookUrl) {
    return res.status(400).json({
      success: false,
      message: "webhookUrl is required",
    });
  }

  try {
    const data = await confirmWebhookUrl(webhookUrl);

    return res.status(200).json({
      success: true,
      message: "PayOS webhook confirmed",
      webhookUrl,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  confirmPayosWebhook,
  handlePayosCancel,
  handlePayosReturn,
  handlePayosWebhookCheck,
  handlePayosWebhook,
};
