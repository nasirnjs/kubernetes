import mongoose from "mongoose";
import logger from "./logger";

require("dotenv").config();

const dbUrl: string = process.env.DB_URL || "";
export const connectDb = async () => {
  try {
    await mongoose.connect(dbUrl).then(() => {
      logger.info(`MongoDB connected.`);
    });
  } catch (err: any) {
    logger.error(err.message);
    setTimeout(() => connectDb, 5000);
  }
};
