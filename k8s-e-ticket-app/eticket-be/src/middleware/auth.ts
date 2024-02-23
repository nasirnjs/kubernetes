import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt from "jsonwebtoken";
require("dotenv").config();

//authenticate user
export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
      return next(new ErrorHandler("User is not authenticated", 400));
    }
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN as string
    ) as any;

    if (!decoded) {
      return next(new ErrorHandler("Access token is not valid", 400));
    }
    const user = ""

    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }
    req.user = JSON.parse(user);
    next();
  }
);

//authenticate user role
export const authRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role:${req.user?.role} is not allowed to access this content`,
          400
        )
      );
    }
    next();
  };
};
