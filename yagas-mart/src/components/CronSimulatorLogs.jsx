import React from 'react';
import { Terminal, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';

export default function CronSimulatorLogs({ logs, onClearLogs, onRunManualTrigger }) {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal color="var(--accent-gold)" /> Daily 06:00 AM Cron Execution Logs
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Live status stream of daily Gemini prompt call, image rendering, WhatsApp Group/Status dispatch, IG, and FB posting.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={onClearLogs}>
            Clear Logs
          </button>
          <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={onRunManualTrigger}>
            <Zap size={14} /> Simulate 06:00 AM Execution Now
          </button>
        </div>
      </div>

      {/* Terminal Log Console */}
      <div style={{
        background: '#090d16',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '16px',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxHeight: '400px',
        overflowY: 'auto',
        lineHeight: '1.6'
      }}>
        {logs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
            No logs generated yet. Click "Simulate 06:00 AM Execution Now" to test the pipeline.
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '6px', display: 'flex', gap: '10px' }}>
              <span style={{ color: 'var(--text-muted)' }}>[{log.timestamp}]</span>
              <span style={{
                color: log.type === 'success' ? '#34d399' : log.type === 'warning' ? '#fbbf24' : '#818cf8',
                fontWeight: '600'
              }}>
                {log.type === 'success' && '✓ SUCCESS:'}
                {log.type === 'warning' && '⚠️ WARN:'}
                {log.type === 'info' && 'ℹ️ INFO:'}
              </span>
              <span style={{ color: '#e2e8f0' }}>{log.message}</span>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
