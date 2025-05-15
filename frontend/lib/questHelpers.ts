/**
 * Helper functions for consistent quest implementation across the platform
 */
import { updateQuestCompletion } from './questStorage';

/**
 * Initialize quest state and props for a consistent implementation pattern
 */
export interface BaseQuestState {
  showSuccessAnimation: boolean;
  isCompleting: boolean;
  hasReadContent?: boolean;
  step?: number;
}

export interface BaseQuestProps {
  onQuestComplete: () => void;
  title?: string;
  xpReward?: number;
}

/**
 * Get initial quest state object with consistent properties
 */
export const getInitialQuestState = (): BaseQuestState => ({
  showSuccessAnimation: false,
  isCompleting: false,
  hasReadContent: false,
  step: 0
});

/**
 * Handle quest completion with consistent animation timing
 * 
 * @param pathKey - Path identifier for the quest
 * @param questId - ID of the quest being completed
 * @param callbacks - Callback functions for state updates and completion
 */
export const handleQuestCompletion = (
  callbacks: {
    setIsCompleting: (value: boolean) => void;
    setShowSuccessAnimation: (value: boolean) => void;
    onQuestComplete: () => void;
  }
) => {
  const { setIsCompleting, setShowSuccessAnimation, onQuestComplete } = callbacks;
  
  // Start completion process
  setIsCompleting(true);
  
  // Simulate completion delay
  setTimeout(() => {
    setIsCompleting(false);
    setShowSuccessAnimation(true);
    
    // Wait for animation before notifying completion
    setTimeout(() => {
      onQuestComplete();
    }, 2000);
  }, 1000);
};

/**
 * Validate if a quest is ready to be marked complete
 * 
 * @param conditions - Object with condition checks that all must be true
 * @returns boolean indicating if all conditions are met
 */
export const canCompleteQuest = (conditions: Record<string, boolean>): boolean => {
  return Object.values(conditions).every(condition => condition === true);
}; 