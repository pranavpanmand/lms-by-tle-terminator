import express from "express";
import multer from "multer";
import { 
  createLiveLecture, 
  getLectures, 
  getStreamToken, 
  endLiveLecture, 
  getAllLectures,
  uploadRecording,
  updateRecording,
  uploadNotes,
  deleteNotes,
  downloadNotes  // Added this import
} from "../controllers/liveController.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max file size for videos
  }
});

const uploadNotesMulter = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size for notes
  }
});

// Lecture management routes
router.post("/create", isAuth, createLiveLecture);
router.get("/course/:courseId", isAuth, getLectures);
router.get("/get-token", isAuth, getStreamToken);
router.get("/all", isAuth, getAllLectures);
router.post("/end", isAuth, endLiveLecture);

// Recording routes
router.post("/upload-recording", isAuth, upload.single('video'), uploadRecording);
router.post("/update-recording", isAuth, upload.single('video'), updateRecording);

// Notes routes
router.post("/upload-notes", isAuth, uploadNotesMulter.single('notes'), uploadNotes);
router.post("/delete-notes", isAuth, deleteNotes);
router.get("/download-notes/:meetingId", isAuth, downloadNotes); // Added download route

export default router;