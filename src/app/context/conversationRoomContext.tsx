"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ConversationRoom {
    id: number;
    roomType: string | null;
    name: string | null;
}

interface ConversationRoomContextType {
  currentRoom: ConversationRoom | null;
  setCurrentRoom: (room: ConversationRoom | null) => void;
}

const ConversationRoomContext = createContext<ConversationRoomContextType | undefined>(undefined);

export const ConversationRoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState<ConversationRoom | null>(null);

  const value = {
    currentRoom,
    setCurrentRoom,
  };

  return (
    <ConversationRoomContext.Provider value={value}>
      {children}
    </ConversationRoomContext.Provider>
  );
};

export const useConversationRoom = (): ConversationRoomContextType => {
  const context = useContext(ConversationRoomContext);
  if (!context) {
    throw new Error('useConversationRoom must be used within a ConversationRoomProvider');
  }
  return context;
};
