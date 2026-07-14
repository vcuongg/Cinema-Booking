const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}`, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log("Database:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);

    console.log("MongoDB Connected");
    return true;
  } catch (error) {
    console.log("MongoDB Error:", error.message);
    return false;
  }
};

const isDbConnected = () => mongoose.connection.readyState === 1;

module.exports = {
  connectDB,
  isDbConnected,
};
