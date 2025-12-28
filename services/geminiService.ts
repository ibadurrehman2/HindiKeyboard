
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const refineHindiText = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Improve and correct this Hindi text for grammar, punctuation, and better vocabulary while keeping the same meaning: "${text}"`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });
    return response.text || text;
  } catch (error) {
    console.error("Gemini Refining Error:", error);
    return text;
  }
};

export const transliterateText = async (englishText: string): Promise<string[]> => {
  // Using the public Google Input Tools API for real-time transliteration
  // Note: This is a client-side call to a public endpoint.
  try {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(englishText)}&itc=hi-t-i0-und&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`;
    const res = await fetch(url);
    const data = await res.json();
    if (data[0] === 'SUCCESS') {
      return data[1][0][1];
    }
    return [englishText];
  } catch (err) {
    console.error("Transliteration service failed", err);
    return [englishText];
  }
};
