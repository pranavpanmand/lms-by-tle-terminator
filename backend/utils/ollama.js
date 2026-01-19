import axios from "axios";

const OLLAMA_URL = "http://127.0.0.1:11434";

export async function askOllama(prompt) {
  const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
    model: "phi3:mini",
    prompt,
    stream: false,
  });

  return res.data.response;
}