const crypto = require("crypto");

const PAYOS_API_BASE_URL = "https://api-merchant.payos.vn";

const sortObject = (data) =>
  Object.keys(data)
    .sort()
    .reduce((result, key) => {
      const value = data[key];

      if (value !== undefined) {
        result[key] = value === null ? "" : value;
      }

      return result;
    }, {});

const buildSignaturePayload = (data) =>
  Object.entries(sortObject(data))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

const createSignature = (data, checksumKey) =>
  crypto
    .createHmac("sha256", checksumKey)
    .update(buildSignaturePayload(data))
    .digest("hex");

const getPayosConfig = () => {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

  if (!clientId || !apiKey || !checksumKey) {
    throw new Error("PayOS is not configured. Missing client id, api key, or checksum key.");
  }

  return {
    clientId,
    apiKey,
    checksumKey,
  };
};

const createPaymentLink = async ({
  amount,
  cancelUrl,
  description,
  items,
  orderCode,
  returnUrl,
  expiredAt,
}) => {
  const { clientId, apiKey, checksumKey } = getPayosConfig();
  const signatureData = {
    amount,
    cancelUrl,
    description,
    orderCode,
    returnUrl,
  };
  const payload = {
    ...signatureData,
    ...(Array.isArray(items) && items.length > 0 ? { items } : {}),
    ...(expiredAt ? { expiredAt } : {}),
    signature: createSignature(signatureData, checksumKey),
  };

  const response = await fetch(`${PAYOS_API_BASE_URL}/v2/payment-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": clientId,
      "x-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || data.code !== "00") {
    throw new Error(data.desc || data.message || "Could not create PayOS payment link");
  }

  return data.data;
};

const confirmWebhookUrl = async (webhookUrl) => {
  const { clientId, apiKey } = getPayosConfig();
  const response = await fetch(`${PAYOS_API_BASE_URL}/confirm-webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": clientId,
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ webhookUrl }),
  });

  const data = await response.json();

  if (!response.ok || data.code !== "00") {
    throw new Error(data.desc || data.message || "Could not confirm PayOS webhook URL");
  }

  return data.data;
};

const getPaymentRequest = async (orderCode) => {
  const { clientId, apiKey } = getPayosConfig();
  const response = await fetch(
    `${PAYOS_API_BASE_URL}/v2/payment-requests/${orderCode}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": clientId,
        "x-api-key": apiKey,
      },
    },
  );

  const data = await response.json();

  if (!response.ok || data.code !== "00") {
    throw new Error(data.desc || data.message || "Could not get PayOS payment request");
  }

  return data.data;
};

const verifyWebhookSignature = ({ data, signature }) => {
  const { checksumKey } = getPayosConfig();

  if (!data || !signature) {
    return false;
  }

  const expectedSignature = createSignature(data, checksumKey);

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf8"),
      Buffer.from(signature, "utf8"),
    );
  } catch (error) {
    return false;
  }
};

module.exports = {
  buildSignaturePayload,
  confirmWebhookUrl,
  createPaymentLink,
  createSignature,
  getPaymentRequest,
  verifyWebhookSignature,
};
