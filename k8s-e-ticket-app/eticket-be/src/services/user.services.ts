import { Response } from "express";

// get user by id
export const getUserById = async (id: string, res: Response) => {
  // const user = await redis.get(id);
  const user = ""
  if (user) {
    res.status(200).json({
      status: "success",
      user: JSON.parse(user),
    });
  }
};
