import express, { NextFunction, Request, Response } from "express";
export const app = express();
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import ErrorMiddleware from "./middleware/error";
import userRouter from "./routes/user.route";
import routeRouter from "./routes/routeLocation.router";
import busRouter from "./routes/bus.route";
import tripRouter from "./routes/trip.router";

//body parser
app.use(express.json({ limit: "50mb" }));
//cookies parser
app.use(cookieParser());
// cors origin
// app.use(cors({ origin: process.env.ORIGIN }));
// ["http://localhost:3000", "http://192.168.0.106:3000"];

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://192.168.0.106:3000",
    "https://e-ticket-frontend-one.vercel.app/",
  ],
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

// app.use((_req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");

//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//   );

//   res.setHeader("Access-Control-Allow-Headers", "*");

//   next();
// });

app.use(cors(corsOptions));

//testing api
app.get("/test", (req: Request, res: Response) => {
  res.cookie("ac", "hi bro");
  res.status(200).json({
    success: true,
    message: "Api is working well",
  });
});

//routes
app.use("/api/v1", userRouter);
app.use("/api/v1/route", routeRouter);
app.use("/api/v1/bus", busRouter);
app.use("/api/v1/trip", tripRouter);

//unknown route
app.all("*", (req: Request, _res: Response, next: NextFunction) => {
  const err = new Error(`${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);
