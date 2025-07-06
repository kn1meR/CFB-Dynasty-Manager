// src/utils/enhanced-ocr.ts
import Tesseract from 'tesseract.js';
import { Player } from '@/types';

async function preprocessImage(imageFile: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Enhanced preprocessing
      for (let i = 0; i < data.length; i += 4) {
        // Get RGB values
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate grayscale using weighted method
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Apply threshold with error diffusion
        const threshold = 128;
        const bw = gray > threshold ? 255 : 0;
        
        // Apply stronger contrast
        const contrast = 1.5; // Increase contrast
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        const color = factor * (bw - 128) + 128;
        
        // Set the pixel values
        data[i] = color;     // R
        data[i + 1] = color; // G
        data[i + 2] = color; // B
        // Alpha remains unchanged
      }
      
      // Put the modified image data back
      ctx.putImageData(imageData, 0, 0);
      
      // Scale up the image to improve OCR
      const scaledCanvas = document.createElement('canvas');
      const scaledCtx = scaledCanvas.getContext('2d')!;
      
      const scale = 2; // Scale factor
      scaledCanvas.width = canvas.width * scale;
      scaledCanvas.height = canvas.height * scale;
      
      // Use better scaling algorithm
      scaledCtx.imageSmoothingEnabled = false;
      scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
      
      resolve(scaledCanvas);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(imageFile);
  });
}

export async function recognizeText(image: File): Promise<string> {
  try {
    const preprocessedImage = await preprocessImage(image);
    
    const result = await Tesseract.recognize(
      preprocessedImage,
      'eng',
      {
        logger: m => console.log(m)
      }
    );
    
    return result.data.text;
  } catch (error) {
    console.error("Error during image recognition:", error);
    throw error;
  }
}

export function parsePlayerData(text: string): Omit<Player, 'id' | 'devTrait' | 'notes' | 'jerseyNumber'>[] {
  const players: Omit<Player, 'id' | 'devTrait' | 'notes' | 'jerseyNumber'>[] = [];
  
  // Split into lines
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .filter(line => !line.includes('PLAYER MANAGEMENT')) // Filter header
    .filter(line => !line.includes('Select')); // Filter footer
    
  // Process each line
  for (const line of lines) {
    // Log each line for debugging
    console.log('Processing line:', line);
    
    // Look for a pattern that matches: Initial. Lastname followed by digits
    const matches = line.match(/([A-Z]\.\s*[A-Za-z]+).*?(\d{2})/g);
    
    if (matches) {
      console.log('Found matches:', matches);
      
      // Extract name and rating
      const nameMatch = line.match(/([A-Z]\.\s*[A-Za-z]+)/);
      const ratingMatch = line.match(/\d{2}/);
      
      if (nameMatch && ratingMatch) {
        const name = nameMatch[1].trim();
        const rating = ratingMatch[0];
        const numericRating = parseInt(rating);
        
        // Validate rating is in reasonable range
        if (numericRating >= 40 && numericRating <= 99) {
          players.push({
            name: name.trim(),
            position: '', // We'll expand this later
            year: '',
            rating: rating
          });
          
          console.log('Added player:', name, rating);
        }
      }
    }
  }
  
  console.log("Final parsed players:", players);
  return players;
}
