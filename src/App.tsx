import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Starfield from './components/Starfield';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Certificates from './pages/Certificates';
import MBTI from './pages/MBTI';
import Holland from './pages/Holland';

export default function App() {
  return (
    <BrowserRouter>
      <div className="h-screen bg-black text-white font-sans overflow-hidden selection:bg-purple-500/30 flex relative">
        <Sidebar />
        <Starfield />
        <div className="flex-1 h-full pl-14 relative flex flex-col min-w-0 overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/mbti" element={<MBTI />} />
            <Route path="/holland" element={<Holland />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
