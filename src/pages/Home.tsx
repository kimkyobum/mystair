import { useState } from 'react';
import ChatInput from '../components/ChatInput';
import ChatInterface from '../components/ChatInterface';
import Header from '../components/Header';
import TopBanner from '../components/TopBanner';

export default function Home() {
  const [chatActive, setChatActive] = useState(false);
  const [initialMessage, setInitialMessage] = useState('');

  const handleStartChat = (message: string) => {
    setInitialMessage(message);
    setChatActive(true);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <TopBanner />
      <Header />
      <main className={`relative z-10 flex flex-col w-full flex-1 min-h-0 ${!chatActive ? 'items-center justify-start pb-32 overflow-y-auto overflow-x-hidden' : 'p-4 sm:p-6 overflow-x-hidden'}`}>
        {!chatActive ? (
          <ChatInput onStartChat={handleStartChat} />
        ) : (
          <ChatInterface initialMessage={initialMessage} />
        )}
      </main>
    </div>
  );
}
