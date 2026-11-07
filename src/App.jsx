import { useState } from 'react';
import './App.css';
import {
  calculateEntropy,
  estimateCrackTime,
  checkCommonPatterns,
  generateSecurePassword
} from './utils/entropy';

export default function App() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains a number', met: /[0-9]/.test(password) },
    { label: 'Contains a special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const patternWarning = checkCommonPatterns(password);
  let entropy = calculateEntropy(password);

  // Downgrade entropy score if predictable dictionary patterns or sequences exist
  if (patternWarning && entropy > 25) {
    entropy = Math.min(entropy, 25);
  }

  const crackTime = patternWarning ? 'Seconds (Pattern match)' : estimateCrackTime(password);

  const getStrengthTier = (bits) => {
    if (bits === 0) return { label: '', color: '#333', pct: 0 };
    if (bits < 40) return { label: 'Very Weak', color: '#ef4444', pct: 20 };
    if (bits < 60) return { label: 'Weak', color: '#f97316', pct: 40 };
    if (bits < 80) return { label: 'Moderate', color: '#eab308', pct: 65 };
    if (bits < 100) return { label: 'Strong', color: '#3b82f6', pct: 85 };
    return { label: 'Very Strong', color: '#22c55e', pct: 100 };
  };

  const strength = getStrengthTier(entropy);

  const handleGenerate = () => {
    const generated = generateSecurePassword(16);
    setPassword(generated);
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Password Strength Analyzer</h2>
        <p className="subtitle">Real-time entropy, threat model & pattern checks</p>

        {/* Input Bar */}
        <div className="input-group">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type your password..."
            autoComplete="off"
          />
          <button
            type="button"
            className="toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* CSPRNG Generator Button */}
        <button type="button" className="action-btn" onClick={handleGenerate}>
          {copied ? '✓ Copied to Clipboard!' : '⚡ Generate Secure Password (16 chars)'}
        </button>

        {/* Heuristic Warning Box */}
        {patternWarning && (
          <div className="warning-box">
            ⚠️ {patternWarning}
          </div>
        )}

        {/* Real-time Math Metrics */}
        {password && (
          <div className="metrics-grid">
            <div className="metric-box">
              <span className="metric-title">Entropy</span>
              <span className="metric-value">{entropy} bits</span>
            </div>
            <div className="metric-box">
              <span className="metric-title">Est. Crack Time</span>
              <span className="metric-value">{crackTime}</span>
            </div>
          </div>
        )}

        {/* Animated Strength Gauge */}
        {password && (
          <div className="meter-section">
            <div className="meter-label">
              <span>Strength:</span>
              <strong style={{ color: strength.color }}>{strength.label}</strong>
            </div>
            <div className="meter-track">
              <div
                className="meter-bar"
                style={{
                  width: `${strength.pct}%`,
                  backgroundColor: strength.color,
                }}
              />
            </div>
          </div>
        )}

        {/* Rule-Based Checklist */}
        <ul className="checklist">
          {checks.map((rule, idx) => (
            <li key={idx} className={rule.met ? 'met' : 'unmet'}>
              <span className="icon">{rule.met ? '✓' : '○'}</span>
              <span>{rule.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}