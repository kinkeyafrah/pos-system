
import { GoogleGenAI } from "@google/genai";
import { Product } from "./types";

// Fix: Initializing GoogleGenAI with mandatory named parameter and direct process.env.API_KEY usage
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartProductSuggestions = async (query: string, inventory: Product[]) => {
  if (!query || query.length < 2) return [];

  try {
    const inventoryContext = inventory.map(p => `${p.name} (${p.category}) - ${p.barcode}`).join(", ");
    // Fix: Using correct model naming and calling ai.models.generateContent directly
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User is searching for "${query}" in a grocery store POS. Based on this inventory: ${inventoryContext}, which items are most likely being searched for? Return only the barcodes of the top 3 matches separated by commas.`,
    });

    // Fix: Accessing .text as a property, not a method, and handling potential undefined state
    const resultText = response.text || "";
    const barcodes = resultText.split(",").map(s => s.trim()).filter(s => s !== "") || [];
    return inventory.filter(p => barcodes.includes(p.barcode));
  } catch (error) {
    console.error("AI Search Error:", error);
    return [];
  }
};

export const getInventoryInsights = async (transactions: any[], inventory: Product[]) => {
  try {
    const summary = inventory.filter(p => p.stock < p.lowStockThreshold).map(p => p.name).join(", ");
    // Fix: Using recommended model and direct generation call
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a grocery store manager assistant. These items are low in stock: ${summary}. Give me 3 bullet points of quick advice for ordering or promotions based on standard retail best practices.`,
    });
    // Fix: Accessing .text as a property
    return response.text;
  } catch (error) {
    return "Inventory looks stable.";
  }
};
