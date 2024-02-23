import express from "express";
import {
  createBus,
  deleteBus,
  getBuses,
  toggleBusIsAvailableForTrip,
  updateBus,
} from "../controllers/bus.controller";
const busRouter = express.Router();

busRouter.post("/create", createBus);
busRouter.patch("/toggle-available/:busId", toggleBusIsAvailableForTrip);
busRouter.put("/update/:busId", updateBus);
busRouter.delete("/delete/:busId", deleteBus);
busRouter.get("/get-buses", getBuses);
export default busRouter;
