import express from "express";
import { 
  createLiveLecture, 
  getLectures, 
  getStreamToken, 
  endLiveLecture, 
  getAllLectures,
  syncRecording // <--- IMPORT THIS
} from "../controllers/liveController.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/create", isAuth, createLiveLecture);
router.get("/course/:courseId", isAuth, getLectures);
router.get("/get-token", isAuth, getStreamToken);
router.get("/all", isAuth, getAllLectures);
router.post("/end", isAuth, endLiveLecture);

router.post("/sync", isAuth, syncRecording);


export default router;