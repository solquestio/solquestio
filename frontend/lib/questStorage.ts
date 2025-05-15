/**
 * Utility functions to handle quest state persistence
 */

/**
 * Save quest completion state to localStorage
 * @param pathKey - Unique path identifier (e.g., 'bitcoinSolana', 'zkCompression')
 * @param completions - Object with quest IDs as keys and completion status as values
 */
export const saveQuestCompletions = (pathKey: string, completions: Record<string, boolean>): void => {
  try {
    const storageKey = `${pathKey}CompletedQuests`;
    localStorage.setItem(storageKey, JSON.stringify(completions));
  } catch (error) {
    console.error(`Error saving ${pathKey} quest completions:`, error);
  }
};

/**
 * Load quest completion state from localStorage
 * @param pathKey - Unique path identifier (e.g., 'bitcoinSolana', 'zkCompression')
 * @returns Record of quest completions or empty object if none found
 */
export const loadQuestCompletions = (pathKey: string): Record<string, boolean> => {
  try {
    const storageKey = `${pathKey}CompletedQuests`;
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error(`Error loading ${pathKey} quest completions:`, error);
    // Clear corrupted data
    localStorage.removeItem(`${pathKey}CompletedQuests`);
  }
  return {};
};

/**
 * Update a single quest completion state
 * @param pathKey - Unique path identifier (e.g., 'bitcoinSolana', 'zkCompression')
 * @param questId - ID of the quest to update
 * @param isComplete - Completion status to set
 * @returns Updated record of all quest completions
 */
export const updateQuestCompletion = (
  pathKey: string, 
  questId: string, 
  isComplete: boolean = true
): Record<string, boolean> => {
  const currentCompletions = loadQuestCompletions(pathKey);
  const updatedCompletions = { ...currentCompletions, [questId]: isComplete };
  saveQuestCompletions(pathKey, updatedCompletions);
  return updatedCompletions;
};

/**
 * Calculate total XP earned from completed quests
 * @param quests - Array of quest objects with id and xp properties
 * @param completions - Record of quest completions
 * @returns Total XP earned
 */
export const calculateEarnedXP = (
  quests: Array<{ id: string; xp?: number }>,
  completions: Record<string, boolean>
): number => {
  return quests
    .filter(quest => completions[quest.id])
    .reduce((total, quest) => total + (quest.xp || 0), 0);
}; 