import Lecture from "../models/lectureModel.js";
import AIEmbedding from "../models/AIEmbedding.js";
import { extractPdfTextFromUrl } from "../utils/pdfToText.js";
import { embedText } from "../utils/embeddings.js";

export const indexLectureNotes = async (lectureId, courseId) => {
  console.log("🧠 indexLectureNotes CALLED");
  console.log("lectureId:", lectureId);
  console.log("courseId:", courseId);

  const lecture = await Lecture.findById(lectureId);
  if (!lecture?.notesUrl) {
    console.log("❌ No notesUrl, skipping indexing");
    return;
  }

  const text = await extractPdfTextFromUrl(lecture.notesUrl);
  console.log("📄 Extracted text length:", text.length);

  const chunks = text.match(/.{1,500}/g) || [];
  console.log("📦 Total chunks:", chunks.length);

  for (const chunk of chunks) {
    const embedding = await embedText(chunk);

    await AIEmbedding.create({
      courseId,
      lectureId,
      chunk,
      embedding,
    });
  }

  console.log("✅ EMBEDDINGS SAVED");
};