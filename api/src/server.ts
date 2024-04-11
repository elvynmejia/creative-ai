import dotenv from "dotenv";
dotenv.config();

import express, { type Express, type Request, type Response } from "express";

import morgan from "morgan";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";

import generateImageToVideoHandler from "./api/v1/images/generate_to_video";
import statusHandler from "./api/v1/images/status";
import getVideoHandler from "./api/v1/images/get";
import getVideosHandler from "./api/v1/images/list";
import deleteVideoHandler from "./api/v1/images/delete";

import ImageToVideoWebhookHandler from "./api/v1/webhooks";

import setAnonUserHandler from "./api/v1/users/anon/create";

import anonUserMiddleware from "./middleware/anon_user";

const app: Express = express();

const corsOptions = {
  credentials: true,
  origin: process.env.FRONTEND_URL,
};

app.use(cookieParser());

app.use(cors(corsOptions));

app.use(express.json());
app.use(morgan("common"));
app.use(express.urlencoded({ extended: false }));

app.get("/api/v1/test", (req: Request, res: Response) => {
  res.status(200).send("OK");
});
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.post("/api/v1/users/anon", setAnonUserHandler);

// must check for anonUser cookie from here on the following routes
app.use(anonUserMiddleware);

app.post("/api/v1/videos", generateImageToVideoHandler);
app.get("/api/v1/videos", getVideosHandler);
app.get("/api/v1/videos/:id/status", statusHandler);
app.get("/api/v1/videos/:id", getVideoHandler);
app.delete("/api/v1/videos/:id", deleteVideoHandler);

app.post("/api/v1/webhooks/videos", ImageToVideoWebhookHandler);

const port = process.env.PORT || 5000;

app.set("port", port);

const server = http.createServer(app);

server.listen(port, () => {
  const logger = console;
  logger.info(`Listening on port: ${port}`);
});

export default server;
