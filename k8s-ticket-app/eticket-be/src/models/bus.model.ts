import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBusDetails extends Document {
  busName: string;
  busType: "ac" | "non_ac";
  numberOfSeat: number;
  isAvailableForTrip?: boolean;
  isTripBooked?: boolean;
}
export type TBus = "ac" | "non_ac";

const busSchema: Schema<IBusDetails> = new mongoose.Schema({
  busName: {
    type: String,
    required: [true, "Please provide bus name."],
  },
  busType: {
    type: String,
    required: [true, "Please provide bus type."],
  },
  numberOfSeat: {
    type: Number,
    required: [true, "Please provide number of seat"],
  },
  isAvailableForTrip: {
    type: Boolean,
    default: true,
  },
  isTripBooked: {
    type: Boolean,
    default: false,
  },
});

const busModel: Model<IBusDetails> = mongoose.model<IBusDetails>(
  "bus",
  busSchema
);
export default busModel;
