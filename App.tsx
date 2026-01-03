import React, { useState, useEffect, useCallback } from 'react';
import AccumulatorDisplay from './components/AccumulatorDisplay';
import SessionLogger from './components/SessionLogger';
import HistorySection from './components/HistorySection';
import Navigation from './components/Navigation';
import TimerView from './views/TimerView';
import GlobeView from './views/GlobeView';
import { STORAGE_KEY } from './utils';
import { Session, MeditationState } from './types';

// 탭 종류 정의
type Tab = 'home' | 'history' | 'timer' | 'globe';

// 리플(파동) 타입 정의
interface Ripple {
  id: number;
  gradient: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Ripple State (이전 방식 복구: HSL 그라디언트 저장)
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // History Tab Highlight State
  const [highlightHistory, setHighlightHistory] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
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
  }, []);

  // 데이터 저장
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ totalMinutes, sessions }));
    }
  }, [totalMinutes, sessions, mounted]);

  // 이전에 알려드린 랜덤 HSL 그라디언트 로직
  const triggerRipple = useCallback(() => {
    const id = Date.now();
    // 0~360도 색상환에서 랜덤 선택
    const h1 = Math.floor(Math.random() * 360);
    const h2 = (h1 + 60) % 360; // 유사색 조합
    
    const c1 = `hsl(${h1}, 70%, 60%)`;
    const c2 = `hsl(${h2}, 80%, 60%)`;
    
    // 원형 그라디언트 생성
    const gradient = `radial-gradient(circle, ${c1}, ${c2}, transparent 70%)`;
    
    setRipples(prev => [...prev, { id, gradient }]);

    // 1.5초 후 제거 (애니메이션 시간과 맞춤)
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 1500);
  }, []);

  const handleAddMinutes = useCallback((minutes: number) => {
    if (minutes > 0) {
      // 1. 양수 시간(추가)일 때만 세션 기록 및 시각적 효과 발생
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
      // 2. 음수 시간(감소) 처리 - History에도 반영되도록 세션 추가
      // 단, 0분 미만으로 내려가지 않도록 실제 차감 가능한 시간만 기록
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

  if (!mounted) return <div className="min-h-screen bg-zen-bg" />;

  return (
    <div className="flex flex-col h-[100dvh] bg-zen-bg text-zen-text font-sans overflow-hidden relative">
      
      {/* Background Ripples Layer (Overlay) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
        {ripples.map(ripple => (
            <div
                key={ripple.id}
                // animate-ripple 클래스가 index.html의 tailwind 설정에 있어야 함
                className="absolute top-1/2 left-1/2 w-[100vw] h-[100vw] -ml-[50vw] -mt-[50vw] rounded-full opacity-0 animate-ripple origin-center mix-blend-screen blur-xl"
                style={{ background: ripple.gradient }}
            />
        ))}
      </div>

      {/* 메인 콘텐츠 영역 (스크롤 가능) - z-index 10 */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar z-10">
        {activeTab === 'home' && (
          <div className="h-full flex flex-col justify-center animate-fade-in relative">
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