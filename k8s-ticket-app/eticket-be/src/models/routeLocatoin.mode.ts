import mongoose, { Model, Schema } from "mongoose";

const routeLocationSchema: Schema<{ locationName: string }> =
  new mongoose.Schema({
    locationName: {
      type: String,
      required: true,
    },
  });

const routeLocationModel: Model<{ locationName: string }> = mongoose.model<{
  locationName: string;
}>("route", routeLocationSchema);

export default routeLocationModel;
