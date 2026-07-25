import React, { useState, useRef } from 'react';
import { Download, Copy, Share2, Check, Smartphone, Square, Sparkles, MessageCircle } from 'lucide-react';

export default function PostCardPreview({ item, onUpdateItem }) {
  const [aspectRatio, setAspectRatio] = useState('feed'); // 'feed' | 'status'
  const [themeStyle, setThemeStyle] = useState(item ? item.bgStyleName : 'Sunrise Gold');
  const [copiedPayload, setCopiedPayload] = useState(false);
  const posterRef = useRef(null);

  if (!item) return null;

  const gradients = {
    'Sunrise Gold': 'linear-gradient(135deg, #FF7E5F 0%, #FEB47B 100%)',
    'Deep Lotus': 'linear-gradient(135deg, #6A11CB 0%, #2575FC 100%)',
    'Forest Zen': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    'Sunset Amber': 'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)',
    'Royal Violet': 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
    'Minimalist Dark': 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
  };

  const selectedGradient = gradients[themeStyle] || item.bgGradient;

  const fullWhatsAppText = `*YAGA'S MART, SENDURAI* 🧘‍♂️✨
Good Morning! Morning Greeting & Asana of the Day

☀️ *Day ${item.dayNumber}: ${item.themeName}* (${item.category})

📜 *Morning Inspiration:*
"${item.quoteEn}"

🇮🇳 *தமிழ் குறிப்பு:*
"${item.quoteTa}"

🧘‍♀️ *Recommended Asana:* ${item.asanaName}
💡 *Health Benefit:* ${item.healthBenefit}

📍 *Yaga's Mart, Sendurai*
📞 Call / WhatsApp: +91 98765 43210

${item.hashtags}`;

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(fullWhatsAppText);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
      
      {/* LEFT COLUMN: Visual Poster Renderer */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Aspect Ratio Switcher */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setAspectRatio('feed')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: aspectRatio === 'feed' ? 'var(--accent-gold)' : 'transparent',
              color: aspectRatio === 'feed' ? '#000' : 'var(--text-muted)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px'
            }}
          >
            <Square size={14} /> Feed (1:1 Square)
          </button>

          <button
            onClick={() => setAspectRatio('status')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: aspectRatio === 'status' ? 'var(--accent-gold)' : 'transparent',
              color: aspectRatio === 'status' ? '#000' : 'var(--text-muted)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px'
            }}
          >
            <Smartphone size={14} /> WhatsApp Status (9:16)
          </button>
        </div>

        {/* Live Canvas Poster Card */}
        <div 
          ref={posterRef}
          style={{
            width: aspectRatio === 'feed' ? '340px' : '300px',
            height: aspectRatio === 'feed' ? '340px' : '533px',
            background: selectedGradient,
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Subtle Background Lotus Pattern Overlay */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            fontSize: '140px',
            opacity: 0.12,
            userSelect: 'none'
          }}>
            🧘
          </div>

          {/* Header Branding */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '22px' }}>🧘‍♂️</span>
              <div>
                <div style={{ fontWeight: '900', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  YAGA'S MART
                </div>
                <div style={{ fontSize: '10px', opacity: 0.8, fontWeight: '600' }}>SENDURAI</div>
              </div>
            </div>
            <span style={{
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '10px',
              fontWeight: '700',
              backdropFilter: 'blur(4px)'
            }}>
              DAY {item.dayNumber}
            </span>
          </div>

          {/* Center Quote Block */}
          <div style={{ zIndex: 2, margin: '16px 0' }}>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: aspectRatio === 'feed' ? '15px' : '17px',
              fontWeight: '600',
              lineHeight: '1.4',
              marginBottom: '12px',
              textShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}>
              "{item.quoteEn}"
            </div>

            <div style={{
              fontSize: aspectRatio === 'feed' ? '12px' : '13px',
              lineHeight: '1.4',
              fontWeight: '500',
              color: '#fff',
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '10px 12px',
              borderRadius: '10px',
              backdropFilter: 'blur(6px)',
              borderLeft: '3px solid #fbbf24'
            }}>
              {item.quoteTa}
            </div>
          </div>

          {/* Asana Recommendation Box */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            padding: '10px 14px',
            zIndex: 2,
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.85, fontWeight: '700' }}>
              TODAY'S ASANA
            </div>
            <div style={{ fontWeight: '800', fontSize: '13px', marginTop: '2px' }}>{item.asanaName}</div>
            <div style={{ fontSize: '10px', opacity: 0.9, marginTop: '2px' }}>✨ {item.healthBenefit}</div>
          </div>

          {/* Footer Contact Info */}
          <div style={{
            fontSize: '9px',
            textAlign: 'center',
            opacity: 0.8,
            fontWeight: '600',
            letterSpacing: '0.5px',
            marginTop: '8px',
            zIndex: 2
          }}>
            YAGA'S MART, SENDURAI • DAILY 06:00 AM MOTIVATION
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: Content Editor & Payload Exporter */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        
        <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📝 Content & Background Theme
        </h3>

        {/* Theme Picker */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Select Visual Background Theme:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.keys(gradients).map((styleName) => (
              <button
                key={styleName}
                onClick={() => setThemeStyle(styleName)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: themeStyle === styleName ? '1.5px solid var(--accent-gold)' : '1px solid #cbd5e1',
                  background: themeStyle === styleName ? '#fffbeb' : '#f8fafc',
                  color: themeStyle === styleName ? 'var(--accent-gold)' : '#334155',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {styleName}
              </button>
            ))}
          </div>
        </div>

        {/* English Quote Input */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            English Morning Quote:
          </label>
          <textarea
            value={item.quoteEn}
            onChange={(e) => onUpdateItem({ ...item, quoteEn: e.target.value })}
            rows={2}
            style={{
              width: '100%',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#0f172a',
              fontSize: '13px',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Tamil Quote Input */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Tamil Quote (தமிழ் உரை):
          </label>
          <textarea
            value={item.quoteTa}
            onChange={(e) => onUpdateItem({ ...item, quoteTa: e.target.value })}
            rows={2}
            style={{
              width: '100%',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#0f172a',
              fontSize: '13px',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Asana & Benefit Input */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Asana Name:
            </label>
            <input
              type="text"
              value={item.asanaName}
              onChange={(e) => onUpdateItem({ ...item, asanaName: e.target.value })}
              style={{
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 10px',
                color: '#0f172a',
                fontSize: '12px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Health Benefit:
            </label>
            <input
              type="text"
              value={item.healthBenefit}
              onChange={(e) => onUpdateItem({ ...item, healthBenefit: e.target.value })}
              style={{
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 10px',
                color: '#0f172a',
                fontSize: '12px'
              }}
            />
          </div>
        </div>

        {/* WhatsApp & Social Media Dispatch Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button className="btn-primary" onClick={handleCopyPayload} style={{ flex: 1 }}>
            {copiedPayload ? <Check size={16} /> : <Copy size={16} />}
            {copiedPayload ? "Copied WhatsApp Text!" : "Copy WhatsApp Payload"}
          </button>
        </div>

      </div>

    </div>
  );
}
