import React from 'react';
import { Calendar, Eye, RefreshCw, Send, CheckCircle, Sparkles, MessageCircle, Instagram, Facebook } from 'lucide-react';

export default function CalendarGrid({ 
  schedule, 
  selectedDay, 
  onSelectDay, 
  onRegenerateDay,
  onPublishNow,
  onOpenStudio
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
      {schedule.map((item) => {
        const isSelected = selectedDay?.id === item.id;
        
        return (
          <div 
            key={item.id} 
            className="glass-card"
            style={{
              padding: '18px',
              cursor: 'pointer',
              border: isSelected ? '2px solid var(--accent-gold)' : '1px solid #e2e8f0',
              background: isSelected ? '#fffbeb' : '#ffffff',
              boxShadow: isSelected ? '0 6px 20px rgba(245, 158, 11, 0.15)' : '0 2px 8px rgba(0,0,0,0.03)'
            }}
            onClick={() => onSelectDay(item)}
          >
            {/* Top row: Day # and Status Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--accent-gold)',
                  fontWeight: '800',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '13px'
                }}>
                  DAY {item.dayNumber}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.dateString}</span>
              </div>

              <span className={`badge badge-${item.status}`}>
                {item.status === 'published' && '✓ Sent 06:00 AM'}
                {item.status === 'scheduled' && '⏱️ Next (Tomorrow)'}
                {item.status === 'draft' && 'Queue'}
              </span>
            </div>

            {/* Theme & Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{item.themeName}</div>
                <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: '600' }}>{item.category}</div>
              </div>
            </div>

            {/* English Quote Preview */}
            <p style={{
              fontSize: '12px',
              lineHeight: '1.5',
              color: '#334155',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontStyle: 'italic',
              marginBottom: '10px'
            }}>
              "{item.quoteEn}"
            </p>

            {/* Tamil Translation Preview */}
            <p style={{
              fontSize: '11px',
              lineHeight: '1.4',
              color: 'var(--accent-gold)',
              fontWeight: '600',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginBottom: '14px'
            }}>
              {item.quoteTa}
            </p>

            {/* Asana Recommendation */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginBottom: '14px',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center'
            }}>
              <span>🧘 Asana: <strong style={{ color: '#0f172a' }}>{item.asanaName}</strong></span>
            </div>

            {/* Bottom Channels & Quick Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span title="WhatsApp Group & Status" style={{ color: '#25D366' }}><MessageCircle size={14} /></span>
                <span title="Instagram Page" style={{ color: '#E1306C' }}><Instagram size={14} /></span>
                <span title="Facebook Page" style={{ color: '#1877F2' }}><Facebook size={14} /></span>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  className="btn-secondary" 
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                  onClick={(e) => { e.stopPropagation(); onRegenerateDay(item.id); }}
                  title="Regenerate with Gemini AI"
                >
                  <Sparkles size={12} color="var(--accent-gold)" /> AI
                </button>
                <button 
                  className="btn-secondary" 
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                  onClick={(e) => { e.stopPropagation(); onOpenStudio(item); }}
                  title="View Poster Card"
                >
                  <Eye size={12} /> Studio
                </button>
                <button 
                  className="btn-primary" 
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                  onClick={(e) => { e.stopPropagation(); onPublishNow(item); }}
                  title="Dispatch Now"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}
