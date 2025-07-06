// Enhanced src/types/coachProfile.ts
export interface CoachProfile {
    coachName: string;
    schoolName: string;
    schoolColors?: {
        primary: string;
        secondary: string;
        accent: string;
    };
}