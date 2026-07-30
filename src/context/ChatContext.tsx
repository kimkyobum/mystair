import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  isStreaming?: boolean;
}

interface ChatContextType {
  chatActive: boolean;
  setChatActive: (active: boolean) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  inputValue: string;
  setInputValue: (value: string) => void;
  initialMessage: string;
  setInitialMessage: (value: string) => void;
  clearChat: () => void;
  showAliens: boolean;
  setShowAliens: (show: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const getStorageKey = (key: string) => {
    const uid = user?.uid || 'guest';
    return `${key}_${uid}`;
  };

  const [chatActive, setChatActive] = useState<boolean>(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [initialMessage, setInitialMessage] = useState<string>('');
  const [showAliens, setShowAliens] = useState<boolean>(true);

  // Load user-specific data when user changes
  useEffect(() => {
    const savedMessages = sessionStorage.getItem(getStorageKey('mystair_chat_messages'));
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([]);
    }

    const savedInput = sessionStorage.getItem(getStorageKey('mystair_chat_input_value'));
    setInputValue(savedInput || '');

    const savedInitial = sessionStorage.getItem(getStorageKey('mystair_chat_initial_message'));
    setInitialMessage(savedInitial || '');

    const savedActive = sessionStorage.getItem(getStorageKey('mystair_chat_active'));
    setChatActive(savedActive === 'true');

    const savedAliens = localStorage.getItem(`mystair_show_aliens_${user?.uid || 'guest'}`);
    setShowAliens(savedAliens !== 'false');
  }, [user?.uid]);

  // Save to storage on change
  useEffect(() => {
    sessionStorage.setItem(getStorageKey('mystair_chat_active'), String(chatActive));
  }, [chatActive, user?.uid]);

  useEffect(() => {
    sessionStorage.setItem(getStorageKey('mystair_chat_messages'), JSON.stringify(messages));
  }, [messages, user?.uid]);

  useEffect(() => {
    sessionStorage.setItem(getStorageKey('mystair_chat_input_value'), inputValue);
  }, [inputValue, user?.uid]);

  useEffect(() => {
    sessionStorage.setItem(getStorageKey('mystair_chat_initial_message'), initialMessage);
  }, [initialMessage, user?.uid]);

  useEffect(() => {
    localStorage.setItem(`mystair_show_aliens_${user?.uid || 'guest'}`, String(showAliens));
  }, [showAliens, user?.uid]);

  const clearChat = () => {
    setMessages([]);
    setChatActive(false);
    setInputValue('');
    setInitialMessage('');
    sessionStorage.removeItem(getStorageKey('mystair_chat_active'));
    sessionStorage.removeItem(getStorageKey('mystair_chat_messages'));
    sessionStorage.removeItem(getStorageKey('mystair_chat_input_value'));
    sessionStorage.removeItem(getStorageKey('mystair_chat_initial_message'));
  };

  return (
    <ChatContext.Provider value={{
      chatActive,
      setChatActive,
      messages,
      setMessages,
      inputValue,
      setInputValue,
      initialMessage,
      setInitialMessage,
      clearChat,
      showAliens,
      setShowAliens
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};
