// src/utils/weekUtils.ts

export const getWeekDisplayName = (weekNumber: number): string => {
  switch (weekNumber) {
    case 15:
      return 'Conf. Champ';
    case 16:
      return 'Army-Navy'; // Standardized name
    case 17:
      return 'Bowl Week 1';
    case 18:
      return 'Bowl Week 2';
    case 19:
      return 'Bowl Week 3';
    case 20:
      return 'Bowl Week 4';
    case 21:
      return 'Final Poll'; // Added Final Poll
    default:
      return `Week ${weekNumber}`;
  }
};