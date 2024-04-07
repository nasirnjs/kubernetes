import express from "express";
import {
  createRoute,
  deleteRoute,
  getAllRoutes,
  getRoute,
  getRoutes,
  updateRoute,
} from "../controllers/route.controller";
// import { isAuthenticated } from "../middleware/auth";

const routeRouter = express.Router();

routeRouter.post("/create", createRoute);
routeRouter.put("/update", updateRoute);
routeRouter.get("/all-routes", getAllRoutes);
routeRouter.get("/get-route/:routeName", getRoute);
routeRouter.delete("/delete/:routeId", deleteRoute);
routeRouter.get("/route-list", getRoutes);
export default routeRouter;
