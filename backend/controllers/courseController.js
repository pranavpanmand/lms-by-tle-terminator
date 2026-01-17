import uploadOnCloudinary, { uploadMediaWithAudio, uploadFileToCloudinary } from "../configs/cloudinary.js";
import Course from "../models/courseModel.js";
import Lecture from "../models/lectureModel.js";
import User from "../models/userModel.js";

// ==========================================
// COURSE CONTROLLERS
// ==========================================

export const createCourse = async (req, res) => {
    try {
        const { title, category } = req.body;
        if (!title || !category) {
            return res.status(400).json({ message: "Title and category are required" });
        }
        const course = await Course.create({
            title,
            category,
            creator: req.userId
        });
        return res.status(201).json(course);
    } catch (error) {
        return res.status(500).json({ message: `Failed to create course: ${error.message}` });
    }
};

export const getPublishedCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true }).populate("lectures reviews");
        if (!courses) {
            return res.status(404).json({ message: "No courses found" });
        }
        return res.status(200).json(courses);
    } catch (error) {
        return res.status(500).json({ message: `Failed to get published courses: ${error.message}` });
    }
};

export const getCreatorCourses = async (req, res) => {
    try {
        const userId = req.userId;
        const courses = await Course.find({ creator: userId });
        if (!courses) {
            return res.status(404).json({ message: "No courses found" });
        }
        return res.status(200).json(courses);
    } catch (error) {
        return res.status(500).json({ message: `Failed to get creator courses: ${error.message}` });
    }
};

export const editCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, subTitle, description, category, level, price, isPublished } = req.body;
        let thumbnail;

        if (req.file) {
            thumbnail = await uploadOnCloudinary(req.file.path);
        }

        let course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const updateData = { title, subTitle, description, category, level, price, isPublished, thumbnail };
        course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });
        return res.status(201).json(course);
    } catch (error) {
        return res.status(500).json({ message: `Failed to update course: ${error.message}` });
    }
};

export const getCourseById = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId).populate("lectures");
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        return res.status(200).json(course);
    } catch (error) {
        return res.status(500).json({ message: `Failed to get course: ${error.message}` });
    }
};

export const removeCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        await course.deleteOne();
        return res.status(200).json({ message: "Course Removed Successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: `Failed to remove course: ${error.message}` });
    }
};

// ==========================================
// LECTURE CONTROLLERS
// ==========================================

export const createLecture = async (req, res) => {
    try {
        const { lectureTitle } = req.body;
        const { courseId } = req.params;

        if (!lectureTitle || !courseId) {
            return res.status(400).json({ message: "Lecture Title required" });
        }

        const lecture = await Lecture.create({ lectureTitle });
        const course = await Course.findById(courseId);

        if (course) {
            course.lectures.push(lecture._id);
            await course.save();
        }
        
        await course.populate("lectures");
        return res.status(201).json({ lecture, course });
    } catch (error) {
        return res.status(500).json({ message: `Failed to Create Lecture: ${error.message}` });
    }
};

export const getCourseLecture = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        await course.populate("lectures");
        return res.status(200).json(course);
    } catch (error) {
        return res.status(500).json({ message: `Failed to get Lectures: ${error.message}` });
    }
};

// ✅ FIXED EDIT LECTURE (Handles memory storage buffers)
// ✅ FIXED EDIT LECTURE (Handles memory storage buffers)
export const editLecture = async (req, res) => {
    try {
        const {lectureId} = req.params
        const {isPreviewFree , lectureTitle} = req.body
        const lecture = await Lecture.findById(lectureId)
          if(!lecture){
            return res.status(404).json({message:"Lecture not found"})
        }
        const mediaResult = await uploadMediaWithAudio(req.file.buffer);
        // console.log("Media Result:", mediaResult);

        if (mediaResult) {
          lecture.videoUrl = mediaResult.videoUrl;
          lecture.audioUrl = mediaResult.audioUrl;
        }
        if(lectureTitle){
            lecture.lectureTitle = lectureTitle
        }
        lecture.isPreviewFree = isPreviewFree
        
        await lecture.save()
        
        return res.status(200).json({
            success: true,
            message: "Lecture updated successfully",
            lecture: updatedLecture,
        });
    } catch (error) {
        console.error("❌ Edit Lecture Controller Error:", error);
        console.error("❌ Error stack:", error.stack);
        return res.status(500).json({ 
            message: `Failed to edit Lecture: ${error.message}`,
            error: error.stack 
        });
    }
};

export const removeLecture = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const lecture = await Lecture.findByIdAndDelete(lectureId);
        if (!lecture) {
            return res.status(404).json({ message: "Lecture not found" });
        }
        await Course.updateOne(
            { lectures: lectureId },
            { $pull: { lectures: lectureId } }
        );
        return res.status(200).json({ message: "Lecture Removed Successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Failed to remove Lecture: ${error.message}` });
    }
};

// ==========================================
// USER / CREATOR CONTROLLERS
// ==========================================

export const getCreatorById = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ message: "get Creator error" });
    }
};