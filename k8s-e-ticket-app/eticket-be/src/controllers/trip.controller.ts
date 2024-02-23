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
import tripModel, { IPassengers, ITrip } from "../models/trip.model";
import busModel from "../models/bus.model";
import routeLocationModel from "../models/routeLocatoin.mode";
import sendMail from "../utils/sendmail";
import dayjs from "dayjs";

export const createTrip = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { busId, fromId, toId, departure_time, price } = req.body as ITrip;

      // check is bus is free for trip and is fit
      const selectedBusInfo = await busModel.findOne({
        _id: busId,
      });
      if (!selectedBusInfo)
        return res
          .status(400)
          .json({ success: false, message: "Bus not found" });

      if (!selectedBusInfo.isAvailableForTrip)
        return res
          .status(400)
          .json({ success: false, message: "Bus is not fit" });

      if (selectedBusInfo.isTripBooked)
        return res
          .status(400)
          .json({ success: false, message: "Bus is already booked for trip" });

      // check from  and to is available
      const getFrom = await routeLocationModel.findOne({ _id: fromId });
      const getTo = await routeLocationModel.findOne({ _id: toId });

      if (!getFrom || !getTo) {
        return res
          .status(400)
          .json({ success: false, message: "Route not found" });
      }

      const createTrip = await tripModel.create({
        busId,
        fromId,
        toId,
        busName: selectedBusInfo.busName,
        from: getFrom.locationName,
        to: getTo.locationName,
        busType: selectedBusInfo.busType,
        numberOfSeat: selectedBusInfo.numberOfSeat,
        price,
        departure_time,
      });

      await busModel.findByIdAndUpdate(
        { _id: busId },
        { $set: { isTripBooked: true } }
      );

      res.status(201).json({ success: true, createTrip });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

// change bus
export const updateTrip = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { busId: newBusId, fromId, toId, departure_time, price } = req.body;
      const { tripId } = req.params;

      //is trip id is available
      const getTrip = await tripModel.findOne({ _id: tripId });
      if (!getTrip)
        return res
          .status(400)
          .json({ success: false, message: "Trip not found" });

      if (getTrip.busId !== newBusId && newBusId) {
        const selectedOldBusInfo = await busModel.findOne({
          _id: getTrip.busId,
        });
        if (!selectedOldBusInfo)
          return res
            .status(400)
            .json({ success: false, message: "Bus not found" });

        const selectedNewBusInfo = await busModel.findOne({
          _id: newBusId,
        });
        if (!selectedNewBusInfo)
          return res
            .status(400)
            .json({ success: false, message: "New bus not found" });

        if (!selectedNewBusInfo.isAvailableForTrip)
          return res
            .status(400)
            .json({ success: false, message: "New bus is not fit" });

        if (selectedNewBusInfo.isTripBooked)
          return res.status(400).json({
            success: false,
            message: "New bus is already booked for trip",
          });
        getTrip.busName = selectedNewBusInfo.busName;
      }

      //is route id is available
      if (fromId && fromId !== getTrip.fromId) {
        const fromDoc = await routeLocationModel.findOne({ _id: fromId });
        if (!fromDoc) {
          return res.status(400).json({
            success: false,
            message: "Source Location not in database.",
          });
        } else {
          getTrip.from = fromDoc.locationName;
          getTrip.fromId = fromDoc._id;
        }
      }

      if (toId && toId !== getTrip.toId) {
        const toDoc = await routeLocationModel.findOne({ _id: toId });
        if (!toDoc) {
          return res.status(400).json({
            success: false,
            message: "Source Location not in database.",
          });
        } else {
          getTrip.to = toDoc.locationName;
          getTrip.toId = toDoc._id;
        }
      }

      await busModel.findByIdAndUpdate(
        { _id: newBusId },
        { $set: { isTripBooked: true } }
      );

      await busModel.findByIdAndUpdate(
        { _id: getTrip.busId },
        { $set: { isTripBooked: false } }
      );

      getTrip.busId = newBusId;
      if (departure_time) getTrip.departure_time = departure_time;
      if (price) getTrip.price = price;
      const tripDoc = await getTrip.save();

      return res.status(200).json({ success: true, tripDoc });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

// booking seat
export const bookSeat = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tripId, passenger } = req.body;

      const getTrip = await tripModel.findOne({ _id: tripId });
      if (!getTrip)
        return res
          .status(400)
          .json({ success: false, message: "Trip not found" });
      getTrip.passengers = [...getTrip.passengers, passenger];
      getTrip.save();

      return res.status(200).json({ success: true, message: "Success" });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

//get booked seat info
export const getPassengers = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tripId } = req.body;
      const tripInfo = await tripModel.findOne({ _id: tripId });
      if (!tripInfo)
        return res
          .status(400)
          .json({ success: false, message: "Trip not found" });

      return res
        .status(200)
        .json({ success: true, passengers: tripInfo.passengers });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

// delete trip
export const deleteTrip = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tripId } = req.params;
    try {
      const getTrip = await tripModel.findOne({ _id: tripId });
      if (!getTrip)
        return res.status(400).json({
          success: false,
          message: "Trip is not available",
        });

      const busId = getTrip.busId;
      await busModel.findOneAndUpdate(
        { _id: busId },
        { $set: { isTripBooked: false } }
      );

      await tripModel.findOneAndDelete({ _id: tripId });

      return res
        .status(200)
        .json({ success: true, message: "Trip successfully removed" });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

export const getAllTrips = CatchAsyncError(
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const getTrips = await tripModel.find();
      return res.status(200).json({ getTrips });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

export const getTrips = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to } = req.params as { from: string; to: string };

      const getTrips = await tripModel.find({
        fromId: from,
        toId: to,
      });

      if (!getTrips.length)
        return next(new ErrorHandler("Trip not found", 400));

      return res.status(200).json(getTrips);
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

//confirm trip

export const confirmTrip = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tripId, name, email, phone, totalAmount, seatNumbers } = req.body;

      if (
        !name ||
        !email ||
        !phone ||
        !tripId ||
        !totalAmount ||
        !seatNumbers
      ) {
        return res.status(400).json({
          success: true,
          message: "Please provide all the information",
        });
      }

      // is trip id available
      const getTrip = await tripModel.findOne({ _id: tripId });
      if (!getTrip) {
        return res.status(400).json({
          success: true,
          message: "Trip not available",
        });
      }

      const passenger = {
        name,
        phoneNumber: phone,
        seatNumbers,
      } as IPassengers;

      getTrip.passengers = [...getTrip.passengers, passenger];
      getTrip.save();

      const sanitizeTrip = (d: string) => {
        return d.charAt(0).toUpperCase() + d.slice(1);
      };
      await sendMail({
        email,
        subject: `${getTrip.busName} bus ticket`,
        template: "bus-ticket.ejs",
        data: {
          passengerName: name,
          departureTime: dayjs(getTrip.departure_time).format("DD MMM, h:mm A"),
          seatNumber: seatNumbers?.join(", "),
          destination: `${sanitizeTrip(getTrip.from)} - ${sanitizeTrip(
            getTrip.to
          )}`,
          totalAmount: `${totalAmount} Tk`,
        },
      });

      return res.status(200).json({ success: true, getTrip });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

export const passengerTripCancel = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tripId, passengerId } = req.params;
      const { passengerData } = req.body;

      const tripDoc = await tripModel.findOne({ _id: tripId });
      if (!tripDoc) {
        return res
          .status(400)
          .json({ success: false, message: "Trip not found" });
      }

      tripDoc.passengers.forEach((passenger) => {
        const passengerDocId = JSON.stringify(passenger._id);
        if (JSON.parse(passengerDocId) === passengerId) {
          passenger.seatNumbers = passengerData;
        }
      });

      await tripDoc.save();

      return res.status(200).json({ success: true, tripDoc });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);
