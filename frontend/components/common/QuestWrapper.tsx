'use client';

import React, { useState } from 'react';
import QuestCompletionPopup from './QuestCompletionPopup';

interface QuestWrapperProps {
  children: React.ReactNode;
  onQuestComplete: () => void;
  xpReward?: number;
  questTitle: string;
}

// Create an interface for children components
interface QuestComponentProps {
  onQuestComplete?: () => void;
  [key: string]: any; // Allow any other props
}

const QuestWrapper: React.FC<QuestWrapperProps> = ({
  children,
  onQuestComplete,
  xpReward = 0,
  questTitle
}) => {
  const [showCompletionPopup, setShowCompletionPopup] = useState<boolean>(false);

  const handleQuestComplete = () => {
    setShowCompletionPopup(true);
  };

  const handlePopupClose = () => {
    setShowCompletionPopup(false);
    onQuestComplete();
  };

  // Clone the child component and pass it a modified onQuestComplete prop
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // Cast the child element to have the QuestComponentProps
      return React.cloneElement(child as React.ReactElement<QuestComponentProps>, {
        onQuestComplete: handleQuestComplete,
      });
    }
    return child;
  });

  return (
    <>
      {childrenWithProps}
      
      <QuestCompletionPopup
        isOpen={showCompletionPopup}
        onClose={handlePopupClose}
        xpReward={xpReward}
        questTitle={questTitle}
      />
    </>
  );
};

export default QuestWrapper; 