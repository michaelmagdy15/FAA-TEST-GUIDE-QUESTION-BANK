import React from 'react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';

export const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <>
            <SignedIn>
                <AuthBar>{children}</AuthBar>
            </SignedIn>
            <SignedOut>
                <SignInPage />
            </SignedOut>
        </>
    );
};

const AuthBar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                padding: '0.5rem 1rem', borderBottom: '1px solid var(--glass-border)',
                background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(12px)',
                flexShrink: 0, gap: '0.75rem',
            }}>
                <UserButton afterSignOutUrl="/" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                {children}
            </div>
        </div>
    );
};

const SignInPage: React.FC = () => {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: '100vh', padding: '2rem', textAlign: 'center',
        }}>
            <div style={{
                width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'linear-gradient(135deg, #38bdf8, #a78bfa)',
                marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(56,189,248,0.3)',
            }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
            </div>
            <h1 style={{
                fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: 700, marginBottom: '0.5rem',
                background: 'linear-gradient(135deg, #38bdf8, #a78bfa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
                ATPLVector
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem', maxWidth: '400px' }}>
                Sign in to save your progress across devices and track your study journey.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '320px' }}>
                <SignInButton mode="modal">
                    <button style={{
                        width: '100%', padding: '0.875rem', borderRadius: '10px', border: 'none',
                        background: 'var(--accent-color)', color: '#fff', fontWeight: 600, fontSize: '1rem',
                        cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(56,189,248,0.4)',
                        transition: 'var(--transition)',
                    }}>
                        Sign In
                    </button>
                </SignInButton>
                <SignUpButton mode="modal">
                    <button style={{
                        width: '100%', padding: '0.875rem', borderRadius: '10px',
                        border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
                        color: 'var(--text-primary)', fontWeight: 500, fontSize: '1rem',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'var(--transition)',
                    }}>
                        Create Account
                    </button>
                </SignUpButton>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '1.5rem', opacity: 0.6 }}>
                Free · No credit card required
            </p>
        </div>
    );
};
