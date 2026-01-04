'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signUp } from '@/app/actions/auth';

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timezone, setTimezone] = useState('America/New_York');
  
  // Detect user's timezone on mount
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(detected);
    } catch {
      // Keep default timezone
    }
  }, []);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    formData.set('timezone', timezone);
    
    const result = await signUp(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Begin Your Journey</h1>
        <p className="auth-subtitle">50 words a day. Forge your weapon.</p>
        
        {error && (
          <div style={{ 
            color: '#ef4444', 
            fontSize: '14px', 
            marginBottom: '16px',
            textAlign: 'center' 
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            className="auth-input"
            placeholder="Email"
            required
          />
          <input
            type="password"
            name="password"
            className="auth-input"
            placeholder="Password (min 6 characters)"
            minLength={6}
            required
          />
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '13px', 
              color: 'var(--text-muted)',
              marginBottom: '6px' 
            }}>
              Your Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="auth-input"
              style={{ marginBottom: 0 }}
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Shanghai">Shanghai (CST)</option>
              <option value="Asia/Kolkata">India (IST)</option>
              <option value="Australia/Sydney">Sydney (AEDT)</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Start Journey'}
          </button>
        </form>
        
        <p className="auth-link">
          Already have an account? <Link href="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}


