import React, { useState, useEffect, useCallback } from 'react';
import { signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

import AccumulatorDisplay from './components/AccumulatorDisplay';
import SessionLogger from './components/SessionLogger';
import HistorySection from './components/HistorySection';
import Navigation from './components/Navigation';
import TimerView from './views/TimerView';
import GlobeView from './views/GlobeView';
import LoginView from './views/LoginView';
import { STORAGE_KEY } from './utils';
import { Session, MeditationState } from './types';
import { LogOut } from 'lucide-react';

// 탭 종류 정의
type Tab = 'home' | 'history' | 'timer' | 'globe';

// 리플(파동) 타입 정의
interface Ripple {
  id: number;
  gradient: string;
}

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false); // Dev: Guest mode state
  const [authLoading, setAuthLoading] = useState(true);

  // App State
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Ripple State
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // History Tab Highlight State
  const [highlightHistory, setHighlightHistory] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (providerName: 'google' | 'apple' | 'guest') => {
      if (providerName === 'guest') {
          // Dev: Enable guest mode
          setIsGuest(true);
          return;
      }

      if (providerName === 'google') {
          try {
              await signInWithPopup(auth, googleProvider);
              // onAuthStateChanged will handle the state update
          } catch (error) {
              console.error("Login Failed", error);
              // In a real app, you would show a toast/error message here
          }
      } else {
          alert("Apple Login is coming soon.");
      }
  };

  const handleLogout = async () => {
      if (isGuest) {
          setIsGuest(false);
          return;
      }

      try {
          await signOut(auth);
      } catch (error) {
          console.error("Logout Failed", error);
      }
  };

  // 초기 데이터 로드 (Only if logged in or guest)
  useEffect(() => {
    if (!currentUser && !isGuest) return;

    // TODO: In the future, load from Firestore using currentUser.uid
    // For now, we still use local storage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: MeditationState = JSON.parse(stored);
        setTotalMinutes(parsed.totalMinutes || 0);
        setSessions(parsed.sessions || []);
      } catch (e) {
        console.error("Data load failed", e);
      }
    }
    setMounted(true);
  }, [currentUser, isGuest]);

  // 데이터 저장
  useEffect(() => {
    if (mounted && (currentUser || isGuest)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ totalMinutes, sessions }));
    }
  }, [totalMinutes, sessions, mounted, currentUser, isGuest]);

  const triggerRipple = useCallback(() => {
    const id = Date.now();
    const h1 = Math.floor(Math.random() * 360);
    const h2 = (h1 + 60) % 360; 
    
    const c1 = `hsl(${h1}, 70%, 60%)`;
    const c2 = `hsl(${h2}, 80%, 60%)`;
    
    const gradient = `radial-gradient(circle, ${c1}, ${c2}, transparent 70%)`;
    
    setRipples(prev => [...prev, { id, gradient }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 1500);
  }, []);

  const handleAddMinutes = useCallback((minutes: number) => {
    if (minutes > 0) {
      const newSession: Session = {
          id: Date.now(),
          date: new Date().toISOString(),
          duration: minutes
      };
      setSessions(prev => [newSession, ...prev]);
      setTotalMinutes(prev => prev + minutes);
      
      triggerRipple();
      setHighlightHistory(true);
      setTimeout(() => setHighlightHistory(false), 350);
    } else if (minutes < 0) {
      const actualSubtraction = (totalMinutes + minutes < 0) ? -totalMinutes : minutes;
      
      if (actualSubtraction !== 0) {
          const newSession: Session = {
              id: Date.now(),
              date: new Date().toISOString(),
              duration: actualSubtraction
          };
          setSessions(prev => [newSession, ...prev]);
          setTotalMinutes(prev => prev + actualSubtraction);
      }
    }
  }, [totalMinutes, triggerRipple]);

  // Loading Screen (Splash)
  if (authLoading) {
      return <div className="min-h-screen bg-zen-bg flex items-center justify-center text-zen-muted animate-pulse"></div>;
  }

  // Login Screen (Check for both user and guest mode)
  if (!currentUser && !isGuest) {
      return (
          <div className="h-[100dvh] bg-zen-bg text-zen-text font-sans">
              <LoginView onLogin={handleLogin} />
          </div>
      );
  }

  if (!mounted) return <div className="min-h-screen bg-zen-bg" />;

  return (
    <div className="flex flex-col h-[100dvh] bg-zen-bg text-zen-text font-sans overflow-hidden relative">
      
      {/* Background Ripples Layer (Overlay) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
        {ripples.map(ripple => (
            <div
                key={ripple.id}
                className="absolute top-1/2 left-1/2 w-[100vw] h-[100vw] -ml-[50vw] -mt-[50vw] rounded-full opacity-0 animate-ripple origin-center mix-blend-screen blur-xl"
                style={{ background: ripple.gradient }}
            />
        ))}
      </div>

      {/* 메인 콘텐츠 영역 (스크롤 가능) - z-index 10 */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar z-10">
        {activeTab === 'home' && (
          <div className="h-full flex flex-col justify-center animate-fade-in relative">
             
             {/* Logout Button (Temporary placement) */}
             <div className="absolute top-4 right-4 z-50">
                <button 
                  onClick={handleLogout}
                  className="p-2 text-zen-muted hover:text-zen-text transition-colors opacity-50 hover:opacity-100 flex items-center gap-2"
                  aria-label="Logout"
                >
                  {isGuest && <span className="text-[10px] uppercase tracking-wider text-zen-muted/50 border border-zen-muted/20 px-1 rounded">Dev</span>}
                  <LogOut size={16} />
                </button>
             </div>

             <div className="flex-1 flex items-center justify-center">
                <AccumulatorDisplay totalMinutes={totalMinutes} />
             </div>
             <div className="pb-8 relative z-20">
                <SessionLogger onAddMinutes={handleAddMinutes} />
             </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-fade-in pt-10">
            <HistorySection sessions={sessions} />
          </div>
        )}

        {activeTab === 'timer' && (
          <TimerView onFinish={handleAddMinutes} />
        )}

        {activeTab === 'globe' && (
          <GlobeView />
        )}
      </main>

      {/* 하단 내비게이션 바 */}
      <div className="z-20 relative bg-zen-bg">
          <Navigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            highlightHistory={highlightHistory}
          />
      </div>
    </div>
  );
};

export default App;