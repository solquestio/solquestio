# SolQuestio Quest Implementation Guide

This guide outlines the standardized approach for implementing learning path quests in the SolQuestio platform. Following these guidelines ensures a consistent user experience and proper XP tracking across all learning paths.

## Quest State Management

All quests should use the standardized state persistence system provided by the `questStorage.ts` utility:

```typescript
// In learning path component (e.g., ZkCompressionLearningPathPage)
import { loadQuestCompletions, updateQuestCompletion, calculateEarnedXP } from '@/lib/questStorage';

// Define a unique path key
const PATH_KEY = 'zkCompression';

// Load completions with the utility
const savedCompletions = loadQuestCompletions(PATH_KEY);

// Update quest completion status
const updatedCompletions = updateQuestCompletion(PATH_KEY, questId);

// Calculate earned XP
const earnedXP = calculateEarnedXP(quests, completions);
```

## Quest Component Structure

For consistent quest implementation, use the standard components and helpers:

```typescript
// In quest component (e.g., IntroToZkCompressionQuest)
import { QuestHeader, QuestCompletionAnimation } from '@/components/common/QuestHeader';
import { getInitialQuestState, handleQuestCompletion, BaseQuestProps } from '@/lib/questHelpers';

interface YourQuestProps extends BaseQuestProps {
  // Additional props specific to your quest
}

export const YourQuest: React.FC<YourQuestProps> = ({ 
  onQuestComplete, 
  title, 
  xpReward = 250  // Set your quest's default XP reward
}) => {
  // Use the standard initial state
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Handle completion with the standard helper
  const completeQuest = () => {
    handleQuestCompletion({
      setIsCompleting,
      setShowSuccessAnimation,
      onQuestComplete
    });
  };

  return (
    <div className="p-6 bg-dark-card rounded-lg shadow-lg text-gray-200 relative overflow-hidden">
      {/* Use the standard quest header */}
      <QuestHeader 
        title={title} 
        xpReward={xpReward} 
      />
      
      {/* Use the standard completion animation */}
      <QuestCompletionAnimation 
        show={showSuccessAnimation} 
        xpReward={xpReward} 
      />
      
      {/* Your quest content */}
      <div className="space-y-6">
        {/* ... */}
      </div>
      
      {/* Standard completion button */}
      <button 
        onClick={completeQuest}
        disabled={isCompleting}
        className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg"
      >
        {isCompleting ? 'Completing...' : 'Complete Quest'}
      </button>
    </div>
  );
};
```

## XP Reward System

All quests should define their XP rewards following these guidelines:

1. Quest XP is defined in the learning path component:
   ```typescript
   const quests = [
     {
       id: 'quest-1',
       title: 'Introduction',
       xp: 200,
       component: IntroQuest
     }
     // ...
   ];
   ```

2. The XP value should be passed to the quest component:
   ```typescript
   <ActiveQuestComponent 
     onQuestComplete={() => handleQuestCompletion(activeQuest.id)}
     xpReward={activeQuest.xp}
     {...activeQuest.props}
   />
   ```

3. Each quest component should display the XP reward using the `QuestHeader` component

4. Display a total progress bar using the `QuestPageLayout` component:
   ```typescript
   <QuestPageLayout
     pathTitle="Your Learning Path"
     quests={quests}
     activeQuestId={activeQuestId}
     onSelectQuest={setActiveQuestId}
     totalXP={totalXP}
     earnedXP={earnedXP}
   >
     {/* ... */}
   </QuestPageLayout>
   ```

## Learning Path Implementation Checklist

When implementing a new learning path:

- [ ] Create quest components using the standard structure
- [ ] Define quest XP values in the learning path component
- [ ] Use the questStorage utility for state persistence
- [ ] Show the XP progress bar in the QuestPageLayout
- [ ] Pass XP rewards to each quest component
- [ ] Use the common `QuestHeader` component in each quest
- [ ] Display completion animations consistently

Following these guidelines will ensure a consistent user experience across all learning paths and proper tracking of quest completion states and XP rewards. 