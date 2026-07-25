import React, { useState } from 'react';
import { Settings, MessageCircle, Instagram, Facebook, Clock, Save, ShieldCheck } from 'lucide-react';

export default function MultiChannelConfig({ config, onSaveConfig }) {
  const [formData, setFormData] = useState(config);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Settings color="var(--accent-gold)" /> Multi-Channel Integration & 06:00 AM Cron Setup
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        Configure credentials for Meta WhatsApp Business API / Web Node Gateway, Instagram Graph API, and Facebook Page API.
      </p>

      <form onSubmit={handleSubmit}>
        
        {/* 1. WhatsApp Configuration */}
        <div style={{ background: 'rgba(37, 211, 102, 0.06)', border: '1px solid rgba(37, 211, 102, 0.25)', padding: '18px', borderRadius: '12px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', color: '#059669', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <MessageCircle size={18} /> WhatsApp Group & Status Integration
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                WhatsApp Group Name / ID:
              </label>
              <input 
                type="text" 
                value={formData.waGroupName} 
                onChange={(e) => setFormData({...formData, waGroupName: e.target.value})}
                style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', color: '#0f172a', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                WhatsApp Status Auto-Post:
              </label>
              <select 
                value={formData.waStatusEnabled} 
                onChange={(e) => setFormData({...formData, waStatusEnabled: e.target.value === 'true'})}
                style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', color: '#0f172a', fontSize: '12px' }}
              >
                <option value="true">Enabled (Post Poster Image to Status)</option>
                <option value="false">Disabled</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Instagram & Facebook Configuration */}
        <div style={{ background: 'rgba(225, 48, 108, 0.06)', border: '1px solid rgba(225, 48, 108, 0.25)', padding: '18px', borderRadius: '12px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', color: '#E1306C', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Instagram size={18} /> Meta Graph API (Instagram Page & Facebook Page)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Instagram Business Account ID:
              </label>
              <input 
                type="text" 
                value={formData.igAccountId} 
                onChange={(e) => setFormData({...formData, igAccountId: e.target.value})}
                style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', color: '#0f172a', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Facebook Page Access Token:
              </label>
              <input 
                type="password" 
                value={formData.fbPageToken} 
                onChange={(e) => setFormData({...formData, fbPageToken: e.target.value})}
                placeholder="EAA..."
                style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', color: '#0f172a', fontSize: '12px' }}
              />
            </div>
          </div>
        </div>

        {/* 3. Cron Schedule */}
        <div style={{ background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '18px', borderRadius: '12px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', color: '#4F46E5', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Clock size={18} /> Daily Dispatch Schedule
          </h3>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Cron Dispatch Time:
              </label>
              <input 
                type="time" 
                value={formData.cronTime} 
                onChange={(e) => setFormData({...formData, cronTime: e.target.value})}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', color: '#0f172a', fontSize: '14px', fontWeight: '700' }}
              />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', paddingTop: '18px' }}>
              • Generates post payload at 05:45 AM<br/>
              • Dispatches to all channels at 06:00 AM IST
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="submit" className="btn-primary">
            <Save size={16} /> {saved ? "Configuration Saved!" : "Save Channel Credentials"}
          </button>
        </div>

      </form>
    </div>
  );
}
