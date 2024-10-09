import { env } from "@/common/utils/envConfig";
import { app, logger } from "@/server";
import mongoose from "mongoose";

const uri: string = process.env.MONGO_URI || '';

// Async function to connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(uri, );
    logger.info('Connected to MongoDB using Mongoose');
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    throw new Error('Database connection failed');
  }
}

// Immediately invoke the function to connect to the database
connectToDatabase().catch((err) => logger.error(err));

// Start the server
const server = app.listen(env.PORT, () => {
  const { NODE_ENV, HOST, PORT } = env;
  logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
});

// Handle graceful shutdown
const onCloseSignal = () => {
  logger.info("SIGINT received, shutting down");

  // Close the server and disconnect from the database
  server.close(() => {
    logger.info("Server closed");
    mongoose.disconnect()
      .then(() => {
        logger.info("Disconnected from MongoDB");
        process.exit();
      })
      .catch((error) => {
        logger.error("Error during MongoDB disconnect:", error);
        process.exit(1);
      });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
