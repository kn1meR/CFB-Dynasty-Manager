// src/utils/validationUtils.ts
import { positions } from "@/types/playerTypes";

export const validateScore = (score: string): boolean => {
    // Score should be in the format "0-0" or "00-00" or "000-000"
    const scoreRegex = /^\d{1,3}-\d{1,3}$/;
    return scoreRegex.test(score);
  };
  
  export const validateYear = (year: number): boolean => {
    const currentYear = new Date().getFullYear();
    return year >= 1869 && year <= currentYear + 100; // Assuming no dynasties more than 100 years in the future
  };
  
  export const validateName = (name: string): boolean => {
    return name.trim().length > 0 && name.length <= 100; // Assuming no names longer than 100 characters
  };
  
  export const validateRating = (rating: string): boolean => {
    const ratingNumber = parseInt(rating, 10);
    return !isNaN(ratingNumber) && ratingNumber >= 0 && ratingNumber <= 99; // Assuming ratings are between 0 and 99
  };
  
  export const validatePosition = (position: string): boolean => {
    return positions.includes(position);
  };