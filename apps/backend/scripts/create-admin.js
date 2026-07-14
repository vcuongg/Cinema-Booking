require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../src/models/User");

async function run() {
  const email = process.env.ADMIN_EMAIL || "admin@cinemabooking";
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "Admin@123";
  const name = process.env.ADMIN_NAME || "System Admin";

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Please create apps/backend/.env first.");
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
  });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.findOneAndUpdate(
    {
      $or: [{ email }, { username }],
    },
    {
      $set: {
        name,
        email,
        username,
        password: hashedPassword,
        role: "admin",
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  console.log("ADMIN_ACCOUNT_READY");
  console.log(`email=${email}`);
  console.log(`username=${username}`);
  console.log(`password=${password}`);
  console.log(`role=${user.role}`);
  console.log(`id=${user._id.toString()}`);

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("SEED_ADMIN_ERROR:", error.message);

  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect errors
  }

  process.exit(1);
});
