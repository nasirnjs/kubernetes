import { app } from "./app";
import dotenv from "dotenv";
import { connectDb } from "./utils/db";
import logger from "./utils/logger";

dotenv.config();

app.listen(process.env.PORT, () => {
  // console.log("server is running on port ", process.env.PORT);
  logger.info(`server is running on port: ${process.env.PORT}`);
  connectDb();
});
