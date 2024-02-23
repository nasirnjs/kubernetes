import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";

const ErrorMiddleware = (
  err: any,
  _: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error.";

  // wrong mongo id error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)[0]} entered`;
    err = new ErrorHandler(message, 400);
  }

  // wrong jwt error
  if (err.name === "JsonWebTokenError") {
    const message = `Json web token is invalid, try again`;
    err = new ErrorHandler(message, 400);
  }

  // jwt expire error
  if (err.name === "TokenExpiredError") {
    const message = `json web token is expired, try again`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });

  // Call next to pass the error to the default error handler
  next();
};

export default ErrorMiddleware;
