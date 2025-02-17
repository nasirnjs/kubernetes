// server.js
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connect } from "mongoose";
import { router } from "./routes/user.js";
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

// Register User
app.use("/api/users", router);

const PORT = process.env.PORT || 5000;
// MongoDB Connection
//
// Mongo Public cluster via .env file
// connect(process.env.MONGODB_URI)
//
// Mongo DB Connection from pod service

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:supersecret@mongo-sts-0.mongodb-svc.default.svc.cluster.local:27017/testdatabase?retryWrites=true&w=majority&authSource=admin';
connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, (err) => {
      if (err) {
        console.error("❌ Server failed to start:", err);
      } else {
        console.log(`🚀 Server running on port ${PORT}`);
      }
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
