require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./config/db");

const MONGODB_URI = process.env.MONGODB_URI;
const requestedPort = Number(process.env.PORT || 5001);
const fallbackPort = 5002;

async function startServer() {
  try {

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    if (!MONGODB_URI) {
      console.warn("MONGODB_URI is not defined. Starting without database.");
    }

    const connected = MONGODB_URI
      ? await connectDB()
      : false;

    if (!connected) {
      console.warn("Starting in degraded mode: MongoDB unavailable");
    } else {
      console.log("Connected to MongoDB");
    }

    const listen = (port) => {
      const server = app.listen(port, "0.0.0.0", () => {
        console.log(
          `Server is running at http://0.0.0.0:${port}`,
        );
      });

      server.on("error", (error) => {
        if (error && error.code === "EADDRINUSE") {
          const nextPort = port === requestedPort ? fallbackPort : null;

          if (nextPort) {
            console.warn(`Port ${port} is busy, trying ${nextPort}`);
            server.close();
            listen(nextPort);
            return;
          }
        }

        console.error("Failed to start server:", error.message);
        process.exit(1);
      });
    };

    listen(requestedPort);
  } catch (error) {
    console.error("Failed to start server:", error.message);
  }
}

startServer();