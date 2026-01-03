import React from 'react';

interface LoginViewProps {
  onLogin: (provider: 'google' | 'apple' | 'guest') => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 animate-fade-in relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zen-surface/20 via-zen-bg to-zen-bg pointer-events-none" />

      {/* Brand Section */}
      <div className="z-10 flex flex-col items-center mb-16 space-y-4">
        <h1 className="text-6xl font-extralight tracking-tighter text-zen-text">suma</h1>
        <p className="text-zen-muted text-sm tracking-widest uppercase opacity-60">
          No guidance. No music. Just being.
        </p>
      </div>

      {/* Auth Buttons */}
      <div className="z-10 w-full max-w-xs space-y-4 animate-slide-up">
        
        {/* Apple Login */}
        <button
          onClick={() => onLogin('apple')}
          className="w-full h-12 flex items-center justify-center gap-3 bg-white text-black rounded-xl font-medium text-sm hover:bg-white/90 transition-all active:scale-95 shadow-lg shadow-black/20"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.02 3.8-1.02.66 0 1.95.26 2.8 1.5-.15.1-.9 1.05-.9 3.05 0 2.43 2.12 3.23 2.2 3.27-.01.03-.41 1.45-1.38 2.87-.66.96-1.36 1.93-2.6 1.93v.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.17 2.21-2 4.38-3.74 4.25z"/>
          </svg>
          Continue with Apple
        </button>

        {/* Google Login */}
        <button
          onClick={() => onLogin('google')}
          className="w-full h-12 flex items-center justify-center gap-3 bg-zen-surface border border-white/5 text-zen-text rounded-xl font-medium text-sm hover:bg-zen-surface/80 hover:border-white/10 transition-all active:scale-95"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        {/* Guest Login (Dev Only) */}
        <div className="pt-4 flex justify-center">
             <button 
                onClick={() => onLogin('guest')}
                className="text-xs text-zen-muted/40 hover:text-zen-muted hover:underline transition-colors"
             >
                 [Dev] Skip Login (Guest)
             </button>
        </div>

      </div>

      <div className="absolute bottom-8 text-xs text-zen-muted/30 font-light">
        Protected by reCAPTCHA
      </div>
    </div>
  );
};

export default LoginView;