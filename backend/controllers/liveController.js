import { StreamClient } from "@stream-io/node-sdk";
import { LiveLecture } from "../models/liveLectureModel.js";
import Course from "../models/courseModel.js"; 
import dotenv from "dotenv";
dotenv.config();

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

// === CLEANED UP END LECTURE ===
export const endLiveLecture = async (req, res) => {
  try {
    const { meetingId } = req.body;
    
    // We only update the database. 
    // Recording stopping is handled by the frontend or auto-stopped by Stream when call ends.
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

// ... existing imports
// Update the getAllLectures function with this one:

export const getAllLectures = async (req, res) => {
  try {
    let lectures = await LiveLecture.find()
      .populate('courseId', 'title thumbnail')
      .populate('instructorId', 'name photoUrl')
      .sort({ startTime: -1 });

    // Sync recordings for finished classes
    const updates = lectures.map(async (lecture) => {
      // Only check if it's inactive and missing the URL
      if (!lecture.isActive && !lecture.recordingUrl) {
        try {
          // Query Stream for ALL recordings for this meeting ID
          const { recordings } = await streamClient.queryRecordings({ 
            call_cid: `default:${lecture.meetingId}` 
          });
          
          if (recordings && recordings.length > 0) {
            // Get the processed recording (usually the last one in the list is the full one)
            const validRecording = recordings.find(r => r.url && r.end_time);
            
            if (validRecording) {
                lecture.recordingUrl = validRecording.url;
                await lecture.save();
                console.log(`✅ Recording found for ${lecture.meetingId}`);
            }
          }
        } catch (err) {
           // It's normal for some to fail if they were just test calls with no recording
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