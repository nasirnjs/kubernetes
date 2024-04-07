import mongoose, { Document, Model, Schema } from "mongoose";
import jwt, { Secret } from "jsonwebtoken";
import bcrypt from "bcryptjs";
require("dotenv").config();

const emailRegExpPattern: RegExp =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    publicId: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      validate: {
        validator: (value: string) => emailRegExpPattern.test(value),
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [6, "Password must be at least 6 character"],
      select: false,
    },
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//methods

//sign access token
userSchema.methods.SignAccessToken = async function () {
  return jwt.sign({ id: this._id }, (process.env.ACCESS_TOKEN as Secret) || "");
};

//sign refresh token
userSchema.methods.SignRefreshToken = async function () {
  return jwt.sign(
    { id: this._id },
    (process.env.REFRESH_TOKEN as Secret) || ""
  );
};

userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const userModel: Model<IUser> = mongoose.model<IUser>("user", userSchema);
export default userModel;
