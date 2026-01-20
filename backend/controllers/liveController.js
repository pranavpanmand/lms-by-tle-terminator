import { StreamClient } from "@stream-io/node-sdk";
import { LiveLecture } from "../models/liveLectureModel.js";
import Course from "../models/courseModel.js"; 
import { v2 as cloudinary } from 'cloudinary'; 
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';
dotenv.config();

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Initialize Stream client only if credentials exist
let streamClient = null;
if (process.env.STREAM_API_KEY && process.env.STREAM_SECRET_KEY) {
  streamClient = new StreamClient(
    process.env.STREAM_API_KEY, 
    process.env.STREAM_SECRET_KEY
  );
} else {
  console.warn("[Live] Stream credentials not configured. Using fallback mode.");
}

export const createLiveLecture = async (req, res) => {
  try {
    const { courseId, topic, description, startTime, duration } = req.body;
    const instructorId = req.userId; 
    const meetingId = `live-${courseId}-${Date.now()}`;

    console.log(`[Create Lecture] Creating lecture: ${meetingId}`);

    const newLecture = await LiveLecture.create({
      courseId,
      instructorId,
      topic,
      description,
      startTime,
      duration,
      meetingId,
      isActive: true,
    });

    await Course.findByIdAndUpdate(courseId, {
      $push: { liveSchedule: newLecture._id }
    });

    console.log(`[Create Lecture] Lecture created: ${newLecture._id}`);
    
    res.status(201).json({ 
      success: true, 
      lecture: newLecture,
      message: "Live lecture created successfully."
    });
  } catch (error) {
    console.error(`[Create Lecture Error]:`, error);
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
    
    // Check if Stream is configured
    if (!streamClient) {
      return res.status(200).json({ 
        success: true, 
        token: "no-stream-token",
        apiKey: "no-stream-key",
        userId,
        mode: "fallback",
        message: "Stream not configured. Using fallback mode."
      });
    }
    
    const token = streamClient.generateUserToken({ 
      user_id: userId, 
      validity_in_seconds: 86400 
    });
    
    console.log(`[Get Token] Generated token for user: ${userId}`);
    
    res.status(200).json({ 
      success: true, 
      token, 
      apiKey: process.env.STREAM_API_KEY,
      userId,
      mode: "stream"
    });
  } catch (error) {
    console.error(`[Get Token Error]:`, error);
    
    // Return fallback token even if Stream fails
    res.status(200).json({ 
      success: true, 
      token: "fallback-token-" + Date.now(),
      apiKey: "fallback-key",
      userId: req.userId.toString(),
      mode: "fallback",
      message: "Using fallback mode due to Stream error."
    });
  }
};

export const endLiveLecture = async (req, res) => {
  try {
    const { meetingId } = req.body;
    const lecture = await LiveLecture.findOneAndUpdate(
      { meetingId },
      { 
        isActive: false, 
        endedAt: new Date()
      },
      { new: true }
    );
    
    if (!lecture) {
      return res.status(404).json({ success: false, message: "Lecture not found" });
    }
    
    console.log(`[End Lecture] Lecture ended: ${meetingId}`);
    
    res.status(200).json({ 
      success: true, 
      message: "Class ended successfully." 
    });
  } catch (error) {
    console.error(`[End Lecture Error]:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// === UPLOAD RECORDING FUNCTION ===
export const uploadRecording = async (req, res) => {
  try {
    const { meetingId } = req.body;
    const lecture = await LiveLecture.findOne({ meetingId });

    if (!lecture) {
      // Clean up uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ 
        success: false, 
        message: "Lecture not found" 
      });
    }

    // Check if video file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No video file provided" 
      });
    }

    console.log(`[Upload Recording] Processing for: ${meetingId}`);
    console.log(`[Upload Recording] File:`, req.file);

    try {
      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "video",
        public_id: `lecture_${lecture._id}_${Date.now()}`,
        folder: "lms_recordings",
        timeout: 180000
      });

      // Update lecture with recording URL
      lecture.recordingUrl = uploadResult.secure_url;
      lecture.recordingUploadedAt = new Date();
      await lecture.save();

      console.log(`[Upload Recording] Success! URL: ${lecture.recordingUrl}`);

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.status(200).json({
        success: true,
        message: "Recording uploaded successfully!",
        url: lecture.recordingUrl
      });

    } catch (uploadError) {
      // Clean up uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      throw uploadError;
    }

  } catch (error) {
    console.error(`[Upload Recording Error]:`, error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// === UPDATE RECORDING FUNCTION ===
export const updateRecording = async (req, res) => {
  try {
    const { meetingId } = req.body;
    const lecture = await LiveLecture.findOne({ meetingId });

    if (!lecture) {
      // Clean up uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ 
        success: false, 
        message: "Lecture not found" 
      });
    }

    // Check if video file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No video file provided" 
      });
    }

    console.log(`[Update Recording] Processing for: ${meetingId}`);

    try {
      // Upload new recording to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "video",
        public_id: `lecture_${lecture._id}_${Date.now()}_updated`,
        folder: "lms_recordings",
        timeout: 180000
      });

      // Update lecture with new recording URL
      const oldRecordingUrl = lecture.recordingUrl;
      lecture.recordingUrl = uploadResult.secure_url;
      lecture.recordingUpdatedAt = new Date();
      await lecture.save();

      console.log(`[Update Recording] Success! New URL: ${lecture.recordingUrl}`);

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      // TODO: Optionally delete old recording from Cloudinary
      // This would require extracting public_id from old URL

      res.status(200).json({
        success: true,
        message: "Recording updated successfully!",
        url: lecture.recordingUrl,
        oldUrl: oldRecordingUrl
      });

    } catch (uploadError) {
      // Clean up uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      throw uploadError;
    }

  } catch (error) {
    console.error(`[Update Recording Error]:`, error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// === UPLOAD NOTES FUNCTION ===
export const uploadNotes = async (req, res) => {
  try {
    const { meetingId } = req.body;
    const lecture = await LiveLecture.findOne({ meetingId });

    if (!lecture) {
      // Clean up uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ 
        success: false, 
        message: "Lecture not found" 
      });
    }

    // Check if notes file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No file provided" 
      });
    }

    console.log(`[Upload Notes] Processing for: ${meetingId}`);
    console.log(`[Upload Notes] File:`, req.file);

    try {
      // Determine resource type based on file extension
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      let resourceType = 'raw'; // Default to raw for documents
      let transformation = [];
      
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(fileExt)) {
        resourceType = 'image';
      } else if (['.pdf'].includes(fileExt)) {
        resourceType = 'raw'; // PDFs should be raw type for proper download
        transformation = { flags: 'attachment' }; // Force download for PDFs
      } else if (['.doc', '.docx', '.ppt', '.pptx', '.txt', '.xls', '.xlsx'].includes(fileExt)) {
        resourceType = 'raw';
        transformation = { flags: 'attachment' }; // Force download for documents
      }

      // Upload to Cloudinary with appropriate settings
      const uploadOptions = {
        resource_type: resourceType,
        public_id: `notes_${lecture._id}_${Date.now()}`,
        folder: "lms_notes",
        timeout: 60000,
        ...transformation
      };

      const uploadResult = await cloudinary.uploader.upload(req.file.path, uploadOptions);

      // Update lecture with notes information
      lecture.notes = {
        url: uploadResult.secure_url,
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        uploadedAt: new Date(),
        publicId: uploadResult.public_id // Store public_id for deletion
      };
      await lecture.save();

      console.log(`[Upload Notes] Success! URL: ${lecture.notes.url}`);

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.status(200).json({
        success: true,
        message: "Notes uploaded successfully!",
        notes: lecture.notes
      });

    } catch (uploadError) {
      // Clean up uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      throw uploadError;
    }

  } catch (error) {
    console.error(`[Upload Notes Error]:`, error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// === DOWNLOAD NOTES FUNCTION ===
export const downloadNotes = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const lecture = await LiveLecture.findOne({ meetingId });

    if (!lecture || !lecture.notes || !lecture.notes.url) {
      return res.status(404).json({
        success: false,
        message: "Notes not found"
      });
    }

    console.log(`[Download Notes] For: ${meetingId}`);

    // Generate Cloudinary URL with download flag
    if (lecture.notes.url.includes('cloudinary.com') && lecture.notes.publicId) {
      // Build Cloudinary URL with forced download
      const publicId = lecture.notes.publicId;
      const fileExt = path.extname(lecture.notes.name).toLowerCase();
      
      // Cloudinary URL for download
      const downloadUrl = cloudinary.url(publicId, {
        resource_type: 'raw',
        flags: 'attachment',
        attachment: lecture.notes.name || 'lecture_notes'
      });
      
      return res.redirect(downloadUrl);
    }

    // For non-Cloudinary URLs or fallback
    res.redirect(lecture.notes.url);

  } catch (error) {
    console.error(`[Download Notes Error]:`, error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// === DELETE NOTES FUNCTION ===
export const deleteNotes = async (req, res) => {
  try {
    const { meetingId } = req.body;
    const lecture = await LiveLecture.findOne({ meetingId });

    if (!lecture) {
      return res.status(404).json({ 
        success: false, 
        message: "Lecture not found" 
      });
    }

    if (!lecture.notes) {
      return res.status(200).json({ 
        success: true, 
        message: "No notes to delete" 
      });
    }

    console.log(`[Delete Notes] Deleting notes for: ${meetingId}`);

    // Delete file from Cloudinary if publicId exists
    if (lecture.notes.publicId) {
      try {
        await cloudinary.uploader.destroy(lecture.notes.publicId, {
          resource_type: 'raw'
        });
        console.log(`[Delete Notes] Cloudinary file deleted: ${lecture.notes.publicId}`);
      } catch (cloudinaryError) {
        console.warn(`[Delete Notes] Cloudinary delete failed:`, cloudinaryError.message);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Clear notes from lecture
    lecture.notes = null;
    await lecture.save();

    res.status(200).json({
      success: true,
      message: "Notes deleted successfully!"
    });

  } catch (error) {
    console.error(`[Delete Notes Error]:`, error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// === GET ALL LECTURES ===
export const getAllLectures = async (req, res) => {
  try {
    const lectures = await LiveLecture.find()
      .populate('courseId', 'title thumbnail')
      .populate('instructorId', 'name photoUrl')
      .sort({ startTime: -1 });

    res.status(200).json({ success: true, lectures });
  } catch (error) {
    console.error("[Get All Lectures Error]:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};