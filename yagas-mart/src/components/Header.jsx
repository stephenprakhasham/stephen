import React from 'react';
import { Sparkles, Play, Settings, Clock, CheckCircle2, Share2 } from 'lucide-react';

export default function Header({ 
  stats, 
  onTriggerNow, 
  onOpenSettings, 
  onOpenGenerator,
  activeTab,
  setActiveTab
}) {
  return (
    <header className="glass-panel" style={{ padding: '20px 28px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
          }}>
            🧘
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                YAGA'S MART <span style={{ color: 'var(--accent-gold)' }}>SENDURAI</span>
              </h1>
              <span className="badge badge-published" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Daily 06:00 AM Cron Active
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
              Automated Good Morning Post Pipeline • WhatsApp Group/Status • Instagram • Facebook Page
            </p>
          </div>
        </div>

        {/* Stats Badges */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 14px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Published</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#059669' }}>{stats.published} / 31</div>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 14px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scheduled</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#4f46e5' }}>{stats.scheduled}</div>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 14px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Channels</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#d97706' }}>4 Active</div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={onOpenGenerator}>
            <Sparkles size={16} color="var(--accent-gold)" /> Gemini Generator
          </button>
          <button className="btn-primary" onClick={onTriggerNow}>
            <Play size={16} /> Test 06:00 AM Trigger
          </button>
          <button className="btn-secondary" onClick={onOpenSettings}>
            <Settings size={16} /> API Setup
          </button>
        </div>

      </div>

      {/* Nav Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <button 
          onClick={() => setActiveTab('calendar')}
          style={{
            background: activeTab === 'calendar' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            color: activeTab === 'calendar' ? 'var(--accent-gold)' : 'var(--text-muted)',
            border: activeTab === 'calendar' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          📅 31-Day Content Calendar
        </button>

        <button 
          onClick={() => setActiveTab('preview')}
          style={{
            background: activeTab === 'preview' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            color: activeTab === 'preview' ? 'var(--accent-gold)' : 'var(--text-muted)',
            border: activeTab === 'preview' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          🖼️ Poster Card Studio (Feed & Status)
        </button>

        <button 
          onClick={() => setActiveTab('logs')}
          style={{
            background: activeTab === 'logs' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            color: activeTab === 'logs' ? 'var(--accent-gold)' : 'var(--text-muted)',
            border: activeTab === 'logs' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          ⚡ Live 6:00 AM Dispatch Logs
        </button>
      </div>

    </header>
  );
}
