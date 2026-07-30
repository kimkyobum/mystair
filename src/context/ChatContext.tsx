import React, { createContext, useContext, useState, useEffect } from 'react';

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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatActive, setChatActive] = useState<boolean>(() => {
    return sessionStorage.getItem('mystair_chat_active') === 'true';
  });
  
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = sessionStorage.getItem('mystair_chat_messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [inputValue, setInputValue] = useState<string>(() => {
    return sessionStorage.getItem('mystair_chat_input_value') || '';
  });

  const [initialMessage, setInitialMessage] = useState<string>(() => {
    return sessionStorage.getItem('mystair_chat_initial_message') || '';
  });

  useEffect(() => {
    sessionStorage.setItem('mystair_chat_active', String(chatActive));
  }, [chatActive]);

  useEffect(() => {
    sessionStorage.setItem('mystair_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem('mystair_chat_input_value', inputValue);
  }, [inputValue]);

  useEffect(() => {
    sessionStorage.setItem('mystair_chat_initial_message', initialMessage);
  }, [initialMessage]);

  const clearChat = () => {
    setMessages([]);
    setChatActive(false);
    setInputValue('');
    setInitialMessage('');
    sessionStorage.removeItem('mystair_chat_active');
    sessionStorage.removeItem('mystair_chat_messages');
    sessionStorage.removeItem('mystair_chat_input_value');
    sessionStorage.removeItem('mystair_chat_initial_message');
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
      clearChat
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
