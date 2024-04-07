// export const getRoutes = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//     } catch (err: any) {
//       return next(new ErrorHandler(err.message, 400));
//     }
//   }
// );

import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import busModel, { IBusDetails } from "../models/bus.model";
import tripModel from "../models/trip.model";

export const createBus = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { busName, busType, numberOfSeat } = req.body as IBusDetails;

      const createdBus = await busModel.create({
        busName,
        busType,
        numberOfSeat,
      });

      return res.status(201).json({ success: true, createdBus });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

export const toggleBusIsAvailableForTrip = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { busId } = req.params;

      const getBus = await busModel.findOne({ _id: busId });

      if (!getBus)
        return res
          .status(400)
          .json({ success: false, message: "Bus not found" });

      // if bus is in trip, we should cancel the trip
      const tripDoc = await tripModel.findOne({ busId });
      if (tripDoc) {
        return res.status(400).json({
          success: false,
          message: "Cannot possible toggle while bus is in trip",
        });
      }

      getBus.isAvailableForTrip = !getBus.isAvailableForTrip;
      getBus.save();
      return res.status(200).json({ success: true, message: "Success" });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

export const updateBus = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { busName, busType, numberOfSeat } = req.body;
      const { busId } = req.params;
      
      const getBus = await busModel.findOne({ _id: busId });

      if (!getBus)
        return res
          .status(400)
          .json({ success: false, message: "Bus not found" });

      getBus.busName = busName;
      getBus.busType = busType;
      getBus.numberOfSeat = numberOfSeat;

      getBus.save();

      return res
        .status(200)
        .json({ success: true, message: "successfully updated" });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

export const deleteBus = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { busId } = req.params;
      const getBus = await busModel.findOne({ _id: busId });

      if (!getBus)
        return res
          .status(400)
          .json({ success: false, message: "Bus not found" });

      //if bus is in trip
      const getTrip = await tripModel.findOne({ busId });
      if (!!getTrip)
        return res
          .status(400)
          .json({ success: false, message: "Bus is already in trip" });

      await busModel.findOneAndDelete({ _id: busId });
      return res
        .status(200)
        .json({ success: false, message: "Successfully deleted" });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

export const getBuses = CatchAsyncError(
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const getBuses = await busModel.find();
      return res.status(200).json({ success: true, getBuses });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);
