import { GoogleGenAI, Chat, Type, Schema } from "@google/genai";

// Initialize Gemini Client
const getClient = () => {
    // In Vite/React, use import.meta.env.VITE_API_KEY if available, otherwise process.env
    // For this specific environment setup, we'll check both.
    const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY;
    if (!apiKey) {
        console.warn("Gemini API Key is missing.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export interface Flashcard {
    front: string;
    back: string;
}

export const geminiService = {
  createChatSession: (context: string, initialHistory?: {role: string, parts: {text: string}[]}[]): Chat | null => {
    const client = getClient();
    if (!client) return null;

    return client.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are an expert academic tutor for the UniMaster platform. 
        Your goal is to help students understand concepts related to: "${context}".
        
        Key Behaviors:
        1. Be concise, encouraging, and use bullet points where helpful.
        2. If the user provides a "Material Context" (e.g. "I am studying X file"), prioritize that specific content in your answers.
        3. Explain complex topics simply (ELI5 when asked).
        4. If asked about specific files, you can explain concepts based on the titles/descriptions provided.
        
        Style:
        - Use Markdown for formatting (bold, lists, code blocks).
        - Keep answers structured and readable.
        `
      },
      history: initialHistory as any
    });
  },

  sendMessage: async (chat: Chat, message: string): Promise<string> => {
    try {
      const response = await chat.sendMessage({ message });
      return response.text || "I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Sorry, I encountered an error connecting to the AI tutor. Please check your connection or API key.";
    }
  },

  generateFlashcards: async (topic: string): Promise<Flashcard[]> => {
      const client = getClient();
      if (!client) return []; 

      const schema: Schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING, description: "The concept, question, or term." },
            back: { type: Type.STRING, description: "The concise definition, answer, or explanation." }
          },
          required: ["front", "back"]
        }
      };

      try {
          const response = await client.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `Generate 10 high-quality, academic study flashcards for the university course topic: "${topic}". 
              Focus on key definitions, important dates, formulas, or core concepts. 
              Ensure the 'back' is concise and easy to memorize.`,
              config: {
                  responseMimeType: "application/json",
                  responseSchema: schema
              }
          });
          
          if (response.text) {
              return JSON.parse(response.text);
          }
          return [];
      } catch (error) {
          console.error("Flashcard generation failed:", error);
          return [];
      }
  },

  generateStudySummary: async (title: string, description: string): Promise<string> => {
      const client = getClient();
      if (!client) return "AI unavailable.";

      try {
          const response = await client.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `I am about to study a document titled "${title}". Description: "${description}".
              Provide a brief 2-sentence summary of what I might expect to learn, and list 3 key thought-provoking questions I should keep in mind while reading.
              Format:
              **Summary:** ...
              
              **Key Questions:**
              1. ...
              2. ...
              3. ...`
          });
          return response.text || "";
      } catch (e) {
          return "";
      }
  }
};