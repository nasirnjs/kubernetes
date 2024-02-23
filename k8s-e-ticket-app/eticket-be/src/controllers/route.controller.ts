import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import routeLocationModel from "../models/routeLocatoin.mode";
import ErrorHandler from "../utils/ErrorHandler";
import tripModel from "../models/trip.model";

// export const getRoutes = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//     } catch (err: any) {
//       return next(new ErrorHandler(err.message, 400));
//     }
//   }
// );

interface ILocationName {
  name: string;
}
export const createRoute = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body as ILocationName;

      //chk is route is already avaiable
      const getRoute = await routeLocationModel.findOne({
        locationName: name.toLocaleLowerCase(),
      });

      if (getRoute) {
        return res
          .status(400)
          .json({ success: false, message: "Route already available" });
      }

      await routeLocationModel.create({
        locationName: name.toLocaleLowerCase(),
      });

      const routeDoc = await routeLocationModel.find();

      return res.status(201).json({ success: true, response: routeDoc });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

export const updateRoute = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { routeId, updatedName } = req.body;

      //is available the route
      const routeDoc = await routeLocationModel.findOne({ _id: routeId });
      if (!routeDoc) {
        return res
          .status(400)
          .json({ success: false, message: "Route not found" });
      }

      routeDoc.locationName = updatedName;
      await routeDoc.save();

      const newRouteDoc = await routeLocationModel.find();
      return res.status(200).json({ success: true, response: newRouteDoc });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

export const deleteRoute = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { routeId } = req.params;

      // is this route is available
      const getRoute = await routeLocationModel.findOne({ _id: routeId });
      if (!getRoute) {
        return res
          .status(400)
          .json({ success: false, message: "Route not found" });
      }

      // is this route is selected for trip
      const tripDoc = await tripModel.findOne({
        $or: [{ from: routeId }, { to: routeId }],
      });

      if (tripDoc)
        return res.status(400).json({
          success: false,
          message: "This location is already is in used for trip",
        });

      // delete the route
      await routeLocationModel.deleteOne({ _id: routeId });
      const newRouteDoc = await routeLocationModel.find();

      return res.status(200).json({
        success: true,
        response: newRouteDoc,
      });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

export const getRoutes = CatchAsyncError(
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const getRoutes = await routeLocationModel.find();
      res.status(200).json({ success: true, getRoutes });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

export const getRoute = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { routeName } = req.params;
      if (routeName === "undefined") {
        const getAllRoutes = await routeLocationModel.find();
        return res.status(200).json({ success: true, response: getAllRoutes });
      }
      const getRoutes = await routeLocationModel.find({
        locationName: { $regex: routeName, $options: "i" },
      });
      return res.status(200).json({ success: true, response: getRoutes });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

export const getAllRoutes = CatchAsyncError(
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const routesDoc = await routeLocationModel.find();
      return res.status(200).json({ success: true, response: routesDoc });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);
