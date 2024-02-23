import { IUser } from "../models/user.model";
import { Response } from "express";
import jwt, { Secret } from "jsonwebtoken";

require("dotenv").config();
interface ITokenOption {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite?: "lax" | "strict";
  secure?: boolean;
}

// parse environment variable integrate with fallback value
export const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "300",
  10
);

export const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "1200",
  10
);

//options for cookies
export const accessTokenOptions: ITokenOption = {
  expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
  maxAge: accessTokenExpire * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const refreshTokenOptions: ITokenOption = {
  expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = jwt.sign(
    { id: user._id },
    (process.env.ACCESS_TOKEN as Secret) || "",
    { expiresIn: "5m" }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    (process.env.REFRESH_TOKEN as Secret) || "",
    { expiresIn: "3d" }
  );

  //only set secure to true in production
  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
  }

  return res
    .cookie("access_token", accessToken, accessTokenOptions)
    .cookie("refresh_token", refreshToken, refreshTokenOptions)
    .status(statusCode)
    .json({
      success: true,
      user,
      accessToken,
    });
};
