// src/utils/logoUtils.ts
import { fbsTeams } from './fbsTeams';

// Logo cache to prevent redundant requests
const logoCache = new Map<string, string>();
const failedLogos = new Set<string>();

/**
 * Test if an image path exists and loads successfully
 */
function testImagePath(path: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = path;
    
    // Add timeout to prevent hanging
    setTimeout(() => resolve(false), 3000);
  });
}

/**
 * Optimized function that stops searching after first successful logo
 */
export async function getOptimizedTeamLogoPath(teamName: string): Promise<string> {
  // Check cache first
  const cacheKey = teamName.toLowerCase();
  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey)!;
  }

  const team = fbsTeams.find(t => 
    t.name === teamName || 
    t.name.toLowerCase() === teamName.toLowerCase() ||
    t.abbrev === teamName
  );
  
  let logoPaths: string[];
  
  if (!team) {
    // Fallback for custom teams
    const sanitizedName = teamName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    logoPaths = [
      `/logos/${sanitizedName}_300x300.png`,
      `/logos/${sanitizedName}_logo_300x300.png`,
      `/logos/${teamName.replace(/\s+/g, '_')}-300x300.png`
    ];
  } else {
    const schoolName = team.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_&]/g, '');
    const teamNickname = team.nickName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_&]/g, '');
    
    logoPaths = [
      `/logos/${schoolName}_${teamNickname}_300x300.png`,
      `/logos/${schoolName}_${teamNickname}_logo_300x300.png`,
      `/logos/${team.name.replace(/\s+/g, '_')}_${team.nickName.replace(/\s+/g, '_')}_300x300.png`
    ];
  }

  // Test each path and return the first successful one
  for (const logoPath of logoPaths) {
    if (failedLogos.has(logoPath)) {
      continue; // Skip known failed paths
    }

    try {
      const isValid = await testImagePath(logoPath);
      if (isValid) {
        logoCache.set(cacheKey, logoPath);
        return logoPath;
      } else {
        failedLogos.add(logoPath);
      }
    } catch (error) {
      failedLogos.add(logoPath);
    }
  }

  // If all paths fail, return the first one as fallback
  const fallbackPath = logoPaths[0];
  logoCache.set(cacheKey, fallbackPath);
  return fallbackPath;
}

/**
 * Converts team name to the logo file naming convention
 * Handles both formats: "SchoolName_TeamName_logo-300x300.png" and "SchoolName_TeamName-300x300.png"
 */
export function getTeamLogoPath(teamName: string): string {
  // Handle special cases and find the team data
  const team = fbsTeams.find(t => 
    t.name === teamName || 
    t.name.toLowerCase() === teamName.toLowerCase() ||
    t.abbrev === teamName
  );
  
  if (!team) {
    // Fallback for custom teams or unknown teams - try both formats
    const sanitizedName = teamName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    // Return an array of possible paths to try
    return `/logos/${sanitizedName}_300x300.png`;
  }
  
  // Create the logo filename using the naming convention
  const schoolName = team.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_&]/g, '');
  const teamNickname = team.nickName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_&]/g, '');
  
  // Return the primary format (without "logo")
  return `/logos/${schoolName}_${teamNickname}_300x300.png`;
}

/**
 * Gets multiple possible logo paths to try in order of preference
 */
export function getTeamLogoPaths(teamName: string): string[] {
  const team = fbsTeams.find(t => 
    t.name === teamName || 
    t.name.toLowerCase() === teamName.toLowerCase() ||
    t.abbrev === teamName
  );
  
  if (!team) {
    // Fallback for custom teams or unknown teams
    const sanitizedName = teamName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_&]/g, '');
    return [
      `/logos/${sanitizedName}_300x300.png`,
      `/logos/${sanitizedName}_logo_300x300.png`,
      `/logos/${teamName.replace(/\s+/g, '_')}-300x300.png`
    ];
  }
  
  const schoolName = team.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_&]/g, '');
  const teamNickname = team.nickName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_&]/g, '');
  
  // Return possible paths in order of preference
  return [
    `/logos/${schoolName}_${teamNickname}_300x300.png`,
    `/logos/${schoolName}_${teamNickname}_logo_300x300.png`,
    `/logos/${team.name.replace(/\s+/g, '_')}_${team.nickName.replace(/\s+/g, '_')}_300x300.png`
  ];
}

/**
 * Gets conference logo path
 */
export function getConferenceLogoPath(conference: string): string {
  const sanitizedConference = conference.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  return `/logos/conferences/${sanitizedConference}_logo_300x300.png`;
}

/**
 * Gets team data including logo paths
 */
export function getTeamWithLogo(teamName: string) {
  const team = fbsTeams.find(t => 
    t.name === teamName || 
    t.name.toLowerCase() === teamName.toLowerCase() ||
    t.abbrev === teamName
  );
  
  if (!team) {
    return {
      name: teamName,
      nickName: '',
      conference: '',
      logoPath: getTeamLogoPath(teamName),
      conferenceLogo: ''
    };
  }
  
  return {
    ...team,
    logoPath: getTeamLogoPath(team.name),
    conferenceLogo: getConferenceLogoPath(team.conference)
  };
}

/**
 * Clear logo cache when needed (useful for development or resetting)
 */
export function clearLogoCache(): void {
  logoCache.clear();
  failedLogos.clear();
}

/**
 * Get cache statistics for debugging
 */
export function getLogoCacheStats() {
  return {
    cachedLogos: logoCache.size,
    failedLogos: failedLogos.size,
    totalAttempts: logoCache.size + failedLogos.size
  };
}