import { StreamClient } from "@stream-io/node-sdk";
import { LiveLecture } from "../models/liveLectureModel.js";
import Course from "../models/courseModel.js"; 
import { v2 as cloudinary } from 'cloudinary'; 
import dotenv from "dotenv";
dotenv.config();

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const streamClient = new StreamClient(process.env.STREAM_API_KEY, process.env.STREAM_SECRET_KEY);

export const createLiveLecture = async (req, res) => {
  try {
    const { courseId, topic, description, startTime, duration } = req.body;
    const instructorId = req.userId; 
    const meetingId = `live-${courseId}-${Date.now()}`;

    const newLecture = await LiveLecture.create({
      courseId,
      instructorId,
      topic,
      description,
      startTime,
      duration,
      meetingId,
      isActive: true
    });

    await Course.findByIdAndUpdate(courseId, {
      $push: { liveSchedule: newLecture._id }
    });

    res.status(201).json({ success: true, lecture: newLecture });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLectures = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lectures = await LiveLecture.find({ courseId }).sort({ startTime: 1 });
    res.status(200).json({ success: true, lectures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStreamToken = async (req, res) => {
  try {
    const userId = req.userId.toString();
    const token = streamClient.generateUserToken({ user_id: userId, validity_in_seconds: 86400 });
    res.status(200).json({ success: true, token, apiKey: process.env.STREAM_API_KEY });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const endLiveLecture = async (req, res) => {
  try {
    const { meetingId } = req.body;
    const lecture = await LiveLecture.findOneAndUpdate(
      { meetingId },
      { isActive: false },
      { new: true }
    );
    if (!lecture) return res.status(404).json({ success: false, message: "Lecture not found" });
    res.status(200).json({ success: true, message: "Class ended" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// === FIXED SYNC FUNCTION (Instance Method) ===
export const syncRecording = async (req, res) => {
  try {
    const { meetingId } = req.body;
    const lecture = await LiveLecture.findOne({ meetingId });

    if (!lecture) return res.status(404).json({ success: false, message: "Lecture not found" });
    if (lecture.recordingUrl) return res.status(200).json({ success: true, message: "Already has recording", url: lecture.recordingUrl });

    console.log(`[Sync] Checking recordings for call: default:${meetingId}`);

    // 1. GET CALL INSTANCE
    const call = streamClient.video.call('default', meetingId);
    
    // 2. QUERY RECORDINGS FROM CALL DIRECTLY
    const { recordings } = await call.queryRecordings();

    // 3. FIND VALID RECORDING
    const validRecording = recordings.find(r => r.url && r.end_time);

    if (!validRecording) {
        console.log(`[Sync] No finished recordings found. Count: ${recordings.length}`);
        return res.status(200).json({ success: false, message: "Processing... Try again in 2 mins." });
    }

    console.log(`[Sync] Found URL: ${validRecording.url}. Uploading to Cloudinary...`);

    // 4. UPLOAD TO CLOUDINARY
    const uploadResponse = await cloudinary.uploader.upload(validRecording.url, {
        resource_type: "video",
        public_id: `lecture_${meetingId}`,
        folder: "lms_recordings",
        eager: [
            { width: 300, height: 300, crop: "pad", audio_codec: "none" }
        ],                                  
    });

    // 5. SAVE
    lecture.recordingUrl = uploadResponse.secure_url;
    await lecture.save();
    
    console.log("[Sync] Success!");

    res.status(200).json({ success: true, message: "Synced successfully!", url: lecture.recordingUrl });

  } catch (error) {
    console.error("[Sync Error]:", error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

// === FIXED GET ALL LECTURES (Instance Method) ===
export const getAllLectures = async (req, res) => {
  try {
    let lectures = await LiveLecture.find()
      .populate('courseId', 'title thumbnail')
      .populate('instructorId', 'name photoUrl')
      .sort({ startTime: -1 });

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const updates = lectures.map(async (lecture) => {
      // Check if finished, no URL, and recently ended
      if (!lecture.isActive && !lecture.recordingUrl && new Date(lecture.startTime) > oneDayAgo) {
        try {
          // Use Instance Method
          const call = streamClient.video.call('default', lecture.meetingId);
          const { recordings } = await call.queryRecordings();
          
          const validRecording = recordings.find(r => r.url && r.end_time);
          
          if (validRecording) {
            lecture.recordingUrl = validRecording.url;
            await lecture.save();
          }
        } catch (err) {
           // Silent fail
        }
      }
      return lecture;
    });

    await Promise.all(updates);

    res.status(200).json({ success: true, lectures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};