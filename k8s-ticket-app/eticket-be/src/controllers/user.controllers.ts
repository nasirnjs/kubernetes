import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import userModel from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import ErrorHandler from "../utils/ErrorHandler";
import sendMail from "../utils/sendmail";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import { getUserById } from "../services/user.services";
dotenv.config();

//registration user
interface IActivationToken {
  token: string;
  activationCode: string;
}
export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: "5m",
    }
  );
  return { token, activationCode };
};

interface IRegistration {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}
export const registrationUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, password } = req.body as IRegistration;
      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exist", 400));
      }
      const user: IRegistration = {
        name,
        email,
        password,
      };

      const activationToken = createActivationToken(user);
      const activationCode = activationToken.activationCode;

      const data = {
        username: user.name,
        activationCode,
      };

      await sendMail({
        email: user.email,
        subject: "Activation code",
        template: "activation-email.ejs",
        data,
      });

      res.status(200).json({
        success: true,
        message: "Please check your email for active your email",
        activationToken: activationToken.token,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 404));
    }
  }
);

interface IActivationRequest {
  activationToken: string;
  activationCode: string;
}
export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activationCode, activationToken } =
        req.body as IActivationRequest;
      const newUser: any = jwt.verify(
        activationToken,
        process.env.ACTIVATION_SECRET as string
      );
      if (newUser.activationCode !== activationCode) {
        return next(new ErrorHandler("Invalid Activation Code", 400));
      }

      const { name, email, password } = newUser.user;
      const isExistUser = await userModel.findOne({ email });
      if (isExistUser) {
        return new ErrorHandler("User already exist.", 400);
      }
      const user = await userModel.create({
        name,
        email,
        password,
      });
      res.status(200).json({ success: true, user });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

//Login user
interface ILogin {
  email: string;
  password: string;
}

export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILogin;

      //will add yup validator later
      if (!email || !password) {
        return next(new ErrorHandler("Please input email or password", 400));
      }

      const user = await userModel.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("Invalid email or password", 400));
      }
      // const isPasswordMatch = await user.comparePassword(password);
      // if (!isPasswordMatch) {
      //   return next(new ErrorHandler("Invalid email or password", 400));
      // }

      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//logout user
export const logoutUser = CatchAsyncError(
  (req: Request, res: Response, next: NextFunction) => {
    res.cookie("access-token", "", { maxAge: 1 });
    res.cookie("refresh-token", "", { maxAge: 1 });

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
    try {
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//regenerate access token
export const updateAccessToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refresh_token as string;

      const decode: any = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN as string
      );
      if (!decode) {
        return next(new ErrorHandler("Invalid refresh token", 400));
      }

      // const session = await redis.get(decode.id as string);
      const session = ""
      if (!session) {
        return next(new ErrorHandler("User not found", 400));
      }
      const user = JSON.parse(session);
      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN as string,
        {
          expiresIn: "5m",
        }
      );
      const newRefreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN as string,
        {
          expiresIn: "3d",
        }
      );

      req.user = user;
      res.cookie("access_token", accessToken, accessTokenOptions);
      res.cookie("refresh_token", newRefreshToken, refreshTokenOptions);

      res.status(200).json({
        success: true,
        accessToken,
      });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

//get user info
export const getUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      getUserById(userId, res);
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

// social auth
// tested ok
export const socialAuth = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, avatar } = req.body;
      const user = await userModel.findOne({ email });
      if (!user) {
        const newUser = await userModel.create({
          email,
          name,
          avatar,
        });
        sendToken(newUser, 200, res);
      }
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

// update user info
export const updateUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name } = req.body;
      const userId = req.user?._id;
      const user: any = userModel.findById(userId);
      if (email && user) {
        const isEmailExist = await userModel.findOne({ email });
        if (isEmailExist) {
          return next(new ErrorHandler("Email already exist", 400));
        }
        user.email = email;
      }
      if (name && user) {
        user.name = name;
      }
      user?.save();

      res.status(201).json({
        success: "true",
        user,
      });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

// change password
export const changePassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } = req.body;
    const email = req.user?.email;
    const user = await userModel.findOne({ email }).select("password");
    const isOldPasswordIsValid = await bcrypt.compare(
      oldPassword,
      user?.password || ""
    );
    if (isOldPasswordIsValid) {
      const generateNewHashPassword = await bcrypt.hash(newPassword, 10);
      await userModel.findOneAndUpdate(
        { email },
        { $set: { password: generateNewHashPassword } }
      );
      return res.status(201).json({
        success: true,
        message: "Password changed successfully.",
      });
    } else {
      return next(new ErrorHandler("Current password is wrong", 400));
    }
  }
);

