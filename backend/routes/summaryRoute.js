import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { askDoubt, generateSummary } from "../controllers/summaryController.js";

let summaryRouter = express.Router();

summaryRouter.post("/generate-summary", isAuth, generateSummary);
summaryRouter.post("/askdoubt", isAuth, askDoubt);


export default summaryRouter;
