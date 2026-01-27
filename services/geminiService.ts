import { GoogleGenAI, Type } from "@google/genai";
import { Panel } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY || '';
  // In a real app, we might handle missing keys more gracefully in the UI
  return new GoogleGenAI({ apiKey });
};

export const generateComicScript = async (idea: string, genre: string): Promise<string> => {
  if (!process.env.API_KEY) return "Error: API Key not found.";

  const ai = getClient();
  try {
    const prompt = `
    Create a detailed comic book script based on the following idea: "${idea}".
    Genre: ${genre}.
    
    Format the output clearly with:
    - Scene Headings (e.g., SCENE 1 - INT. COFFEE SHOP - DAY)
    - Panel Descriptions
    - Character Names and Dialogue
    
    Keep it engaging and ready for an artist to interpret.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Fast generation
      }
    });

    return response.text || "No script generated.";
  } catch (error) {
    console.error("Gemini Script Generation Error:", error);
    return "Failed to generate script. Please check your API key and try again.";
  }
};

export const breakdownScriptToPanels = async (scriptText: string): Promise<Panel[]> => {
  if (!process.env.API_KEY) return [];

  const ai = getClient();
  try {
    const prompt = `
    Analyze the following comic script and break it down into a list of panels.
    For each panel, extract:
    1. A visual description for the artist.
    2. The dialogue (if any).
    3. Characters present.
    
    Script:
    ${scriptText.substring(0, 30000)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              panelNumber: { type: Type.INTEGER },
              description: { type: Type.STRING },
              dialogue: { type: Type.STRING },
              characters: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["panelNumber", "description", "dialogue", "characters"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Panel[];
    }
    return [];
  } catch (error) {
    console.error("Gemini Breakdown Error:", error);
    return [];
  }
};
