import dotenv from "dotenv";
import Course from "../models/courseModel.js";
import User from "../models/userModel.js";
import { ai } from "../configs/ai.js";
dotenv.config();



export const searchWithAi = async (req,res) => {

    try {
         const { input } = req.body;
     
    if (!input) {
      return res.status(400).json({ message: "Search query is required" });
    }

const prompt=`You are an intelligent assistant for an LMS platform. A user will type any query about what they want to learn. Your task is to understand the intent and return one **most relevant keyword** from the following list of course categories and levels:

- App Development  
- AI/ML  
- AI Tools  
- Data Science  
- Data Analytics  
- Ethical Hacking  
- UI UX Designing  
- Web Development  
- Others  
- Beginner  
- Intermediate  
- Advanced  

Only reply with one single keyword from the list above that best matches the query. Do not explain anything. No extra text.

Query: ${input}
`

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:prompt,
  });
  const keyword=response.text



    const courses = await Course.find({
      isPublished: true,
     $or: [
    { title: { $regex: input, $options: 'i' } },
    { subTitle: { $regex: input, $options: 'i' } },
    { description: { $regex: input, $options: 'i' } },
    { category: { $regex: input, $options: 'i' } },
    { level: { $regex: input, $options: 'i' } }
  ]
    });

    if(courses.length>0){
    return res.status(200).json(courses);
    }else{
       const courses = await Course.find({
      isPublished: true,
     $or: [
    { title: { $regex: keyword, $options: 'i' } },
    { subTitle: { $regex: keyword, $options: 'i' } },
    { description: { $regex: keyword, $options: 'i' } },
    { category: { $regex: keyword, $options: 'i' } },
    { level: { $regex: keyword, $options: 'i' } }
  ]
    });
       return res.status(200).json(courses);
    }


    } catch (error) {
        console.log(error)
    }
}


export const getCareerGuidance = async (req,res) => {
    try {
        const userId = req.userId;
        // console.log("UserID for career guidance:", userId);
        if(!userId){
            return res.status(401).json({message:"Unauthorized"})
        }

        

        const user = await User.findById(userId);
        // console.log(user)
        const userSkills = user.skills?.length > 0 ? user.skills.join(", ") : "Not specified yet";
        const userInterests = user.interests?.length > 0 ? user.interests.join(", ") : "Not specified yet";
        const userFields = user.preferredFields?.length > 0 ? user.preferredFields.join(", ") : "Not specified yet";

        const prompt = `
        You are an expert Career Counselor. Based on the following user profile, 
            provide a detailed career guidance report.
            
            USER PROFILE:
            - Name: ${user.name}
            - Bio: ${user.description}
            - Role: ${user.role}
            - Skills: ${userSkills}
            - Interests: ${userInterests}
            - Preferred Fields: ${userFields}
            
            STRICT FORMATTING RULES:
            - Use ONLY short bullet points.
            - Max 3-4 bullets per section.
            - No long paragraphs.
            - Use Markdown headers.
            - Use emojis in section headers.
            - Give proper spacing between sections.

            SECTIONS:
            ## 🎯 Recommended Career Paths
            (List top 3 paths with a 1-sentence 'Why')

            ## 🏫 Top Certifications/Colleges
            (List specific high-value names)

            ## 🛠️ Skill Gap Analysis
            (List specific tools/languages the user is missing)

            ## 🗺️ 6-Month High-Level Roadmap
            (Briefly: Month 1-2, Month 3-4, Month 5-6)

            Provide actionable advice and resources wherever possible.
            
            Keep the tone encouraging, professional, and data-driven.
        `;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents:prompt,
        })

        return res.status(200).json({guidance:response.text})

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({message:"Error generating career guidance"})
    }
  }

  export const getFollowUpGuidance = async (req, res) => {
    try {
      const { previousGuidance, question } = req.body;
      const user = await User.findById(req.userId);

      if (!question)
        return res.status(400).json({ message: "Question is required" });

      if(!previousGuidance){
        previousGuidance="No previous guidance provided.";
      }

      const userSkills = user.skills?.length > 0 ? user.skills.join(", ") : "Not specified yet";
      const userInterests = user.interests?.length > 0 ? user.interests.join(", ") : "Not specified yet";

      const chatPrompt = `
            You are a Career Counselor. You previously gave this advice to ${
              user.name
            }:
            ---
            ${previousGuidance}
            ---
            The user has a follow-up question: "${question}"
            
            Based on their profile (Skills: ${userSkills}, Interests: ${userInterests}), 
            provide a short, helpful answer in bullet points.
        `;

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents:chatPrompt,
      })

      return res.status(200).json({ answer: result.text });


    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Error answering question" });
    }
  };