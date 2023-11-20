import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
dotenv.config();

import * as middlewares from "./middlewares";
import MessageResponse from "./types/MessageResponse";
import auth from "./routes/auth";
import chat from "./routes/chat";
import profile from "./routes/profile";
import question from "./routes/question";
import { getMongoUri } from "./util";


require("dotenv").config();

const app = express();
//lib middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req: Request, res: Response, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers");
  next();
});

//session middleware
app.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});
//routes
app.use("/api/auth", auth);
app.use("/api/chat", chat);
app.use("/api/profile", profile);
app.use("/api/question", question);

//custom middleware
app.use(middlewares.errorHandler);
app.use(middlewares.notFound);
//mongodb connection

// const uri = process.env.ATLAS_URI;
const uri = getMongoUri();

if (uri) {
  mongoose.connect(uri);
} else {
  console.log("process.env.ATLAS_URI is empty");
}

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Connected Database Successfully");
});

export default app;
