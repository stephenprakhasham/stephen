import React, { useState } from 'react';
import { Sparkles, X, Key, Check, Wand2 } from 'lucide-react';
import { generateYogaPost } from '../services/geminiService';

export default function GeminiGeneratorModal({ 
  isOpen, 
  onClose, 
  apiKey, 
  onSaveApiKey, 
  selectedDay, 
  onApplyGeneratedContent 
}) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [language, setLanguage] = useState('bilingual');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    const day = selectedDay ? selectedDay.dayNumber : 1;
    const theme = selectedDay ? selectedDay.themeName : "Surya Namaskar Morning";
    const category = selectedDay ? selectedDay.category : "Morning Yoga";

    const generated = await generateYogaPost(keyInput, day, theme, category, language);
    setResult(generated);
    setLoading(false);
  };

  const handleApply = () => {
    if (result && selectedDay) {
      onApplyGeneratedContent(selectedDay.id, result);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '24px', position: 'relative', background: '#ffffff' }}>
        
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Sparkles color="var(--accent-gold)" /> Google Gemini AI Post Generator
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Generate customized morning yoga quotes, Tamil adaptations, asana tips, and social media captions for Yaga's Mart, Sendurai.
        </p>

        {/* Gemini API Key Field */}
        <div style={{ marginBottom: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--accent-gold)' }}>
            <Key size={14} /> Google Gemini API Key:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="password" 
              placeholder="Paste your Gemini API Key (Optional - Demo mode active)"
              value={keyInput}
              onChange={(e) => { setKeyInput(e.target.value); onSaveApiKey(e.target.value); }}
              style={{
                flex: 1,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#0f172a',
                fontSize: '12px'
              }}
            />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            If left empty, system uses Yaga's Mart's built-in intelligent wellness prompts.
          </span>
        </div>

        {/* Target Day Info */}
        <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: '700' }}>
            Generating for: Day {selectedDay ? selectedDay.dayNumber : 1} ({selectedDay ? selectedDay.themeName : 'Surya Namaskar'})
          </div>
        </div>

        {/* Language Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Language Preference:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['bilingual', 'english', 'tamil'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: language === lang ? '1.5px solid var(--accent-gold)' : '1px solid #cbd5e1',
                  background: language === lang ? '#fffbeb' : '#f8fafc',
                  color: language === lang ? 'var(--accent-gold)' : '#334155',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  cursor: 'pointer'
                }}
              >
                {lang === 'bilingual' ? 'Bilingual (Tamil + EN)' : lang}
              </button>
            ))}
          </div>
        </div>

        {/* Result Preview */}
        {result && (
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: '700', marginBottom: '6px' }}>
              ✓ Generated AI Response:
            </div>
            <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '6px', color: '#0f172a' }}>"{result.quoteEn}"</p>
            <p style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: '600', marginBottom: '6px' }}>"{result.quoteTa}"</p>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              🧘 Asana: {result.asanaName} • Benefit: {result.healthBenefit}
            </div>
          </div>
        )}

        {/* Modal Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          
          {!result ? (
            <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
              <Wand2 size={16} /> {loading ? "Generating..." : "Generate with Gemini"}
            </button>
          ) : (
            <button className="btn-primary" onClick={handleApply}>
              <Check size={16} /> Apply to Schedule
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
