import AIEmbedding from "../models/AIEmbedding.js";
import AICourseChat from "../models/AICourseChat.js";
import { embedText } from "../utils/embeddings.js";
import { cosineSimilarity } from "../utils/similarity.js";
import { askOllama } from "../utils/ollama.js";

export const askCourseAI = async (req, res) => {
  try {
    const { question, courseId } = req.body;
    const userId = req.userId;

    const qEmbedding = await embedText(question);

    const docs = await AIEmbedding.find({ courseId });
    if (!docs.length) {
      return res.json({
        answer: "This course has no notes indexed yet.",
      });
    }

    const ranked = docs
      .map(d => ({
        chunk: d.chunk,
        score: cosineSimilarity(qEmbedding, d.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const context = ranked.map(r => r.chunk).join("\n\n");

    const prompt = `
You are a course tutor.
Answer ONLY from the notes below.
If not found, say: "Not covered in course notes."

NOTES:
${context}

QUESTION:
${question}
`;

    const answer = await askOllama(prompt);

    const chat = await AICourseChat.findOneAndUpdate(
      { courseId, userId },
      {
        $push: {
          messages: [
            { role: "user", content: question },
            { role: "assistant", content: answer },
          ],
        },
      },
      { upsert: true, new: true }
    );

    res.json({ messages: chat.messages });
  } catch (err) {
    res.json({
      answer: "AI is currently unavailable",
    });
  }
};