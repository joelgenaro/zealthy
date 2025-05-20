import React, { createContext, useContext, useState, ReactNode } from 'react';

type MessageContextProps = {
  selectedMessageId: number | null;
  setSelectedMessageId: React.Dispatch<React.SetStateAction<number | null>>;
};

const MessageContext = createContext<MessageContextProps | undefined>(
  undefined
);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(
    null
  );

  return (
    <MessageContext.Provider
      value={{ selectedMessageId, setSelectedMessageId }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessageContext must be used within a MessageProvider');
  }
  return context;
};
