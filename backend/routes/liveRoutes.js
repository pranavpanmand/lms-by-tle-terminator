import express from "express";
import { 
     createLiveLecture,
     getLectures, 
     getStreamToken, 
     endLiveLecture ,
    getAllLectures 
} from "../controllers/liveController.js";

import isAuth from "../middlewares/isAuth.js"; 

const router = express.Router();

router.post("/create", isAuth, createLiveLecture);
router.get("/course/:courseId", isAuth, getLectures);
router.get("/get-token", isAuth, getStreamToken);
router.post("/end", isAuth, endLiveLecture);
router.get("/all", isAuth, getAllLectures);

export default router;