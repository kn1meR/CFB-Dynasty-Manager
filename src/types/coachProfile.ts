export interface CoachProfile {
    coachName: string;
    schoolName: string;
    // Add the optional conference field
    conference?: string; 
    schoolColors?: {
        primary: string;
        secondary: string;
        accent: string;
    };
}
