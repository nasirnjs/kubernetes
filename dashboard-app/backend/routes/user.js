import express from "express";
import { getAllUsers, login, register } from "../controllers/user.js";

const router = express.Router();
router.get("", getAllUsers);
router.post("/register", register);
router.post("/login", login);

export { router };
