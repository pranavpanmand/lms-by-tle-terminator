import { StreamClient } from "@stream-io/node-sdk";
import { LiveLecture } from "../models/liveLectureModel.js";
import Course from "../models/courseModel.js"; 
import dotenv from "dotenv";
dotenv.config();

const streamClient = new StreamClient(process.env.STREAM_API_KEY, process.env.STREAM_SECRET_KEY);

export const createLiveLecture = async (req, res) => {
  try {
    const { courseId, topic, description, startTime, duration } = req.body;
    
    // FIX: Use req.userId (set by your isAuth middleware)
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
      isActive: true // Ensure it starts as active
    });

    await Course.findByIdAndUpdate(courseId, {
      $push: { liveSchedule: newLecture._id }
    });

    res.status(201).json({ success: true, lecture: newLecture });
  } catch (error) {
    console.log(error); // Log error for debugging
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLectures = async (req, res) => {
  try {
    const { courseId } = req.params;
    // Only return lectures that are active or scheduled
    const lectures = await LiveLecture.find({ courseId }).sort({ startTime: 1 });
    res.status(200).json({ success: true, lectures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStreamToken = async (req, res) => {
  try {
    // FIX: Use req.userId instead of req.user._id
    const userId = req.userId.toString();
    
    // Stream requires user IDs to be strings. 
    // You can optionally add a name/image here if you want pre-populated users in Stream dashboard
    const token = streamClient.generateUserToken({ user_id: userId });
    
    res.status(200).json({ success: true, token, apiKey: process.env.STREAM_API_KEY });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const endLiveLecture = async (req, res) => {
  try {
    const { meetingId } = req.body;
    
    // Find and update the lecture to inactive
    const lecture = await LiveLecture.findOneAndUpdate(
      { meetingId },
      { isActive: false }, // This stops it from showing on the student page
      { new: true }
    );

    if (!lecture) {
      return res.status(404).json({ success: false, message: "Lecture not found" });
    }

    res.status(200).json({ success: true, message: "Class ended successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getAllLectures = async (req, res) => {
  try {
    // Fetch all lectures, populate Course and Instructor details
    const lectures = await LiveLecture.find()
      .populate('courseId', 'title thumbnail')
      .populate('instructorId', 'name photoUrl')
      .sort({ startTime: -1 }); // Newest first

    res.status(200).json({ success: true, lectures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

