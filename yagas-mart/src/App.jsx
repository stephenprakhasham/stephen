import React, { useState } from 'react';
import Header from './components/Header';
import CalendarGrid from './components/CalendarGrid';
import PostCardPreview from './components/PostCardPreview';
import MultiChannelConfig from './components/MultiChannelConfig';
import CronSimulatorLogs from './components/CronSimulatorLogs';
import GeminiGeneratorModal from './components/GeminiGeneratorModal';
import { MONTHLY_SCHEDULE } from './data/yogaSchedule';

export default function App() {
  const [schedule, setSchedule] = useState(MONTHLY_SCHEDULE);
  const [selectedDay, setSelectedDay] = useState(schedule[5]); // Default Day 6
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'preview' | 'logs' | 'settings'
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const [channelConfig, setChannelConfig] = useState({
    waGroupName: 'Yaga\'s Mart Sendurai Community',
    waStatusEnabled: true,
    igAccountId: 'yagas_mart_sendurai_official',
    fbPageToken: '',
    cronTime: '06:00'
  });

  const [logs, setLogs] = useState([
    { timestamp: '05:45:00 AM', type: 'info', message: 'Cron Engine awakened. Fetching scheduled item for Day 6 (Pranayama Wednesday).' },
    { timestamp: '05:45:02 AM', type: 'info', message: 'Calling Google Gemini API to generate English & Tamil quotes...' },
    { timestamp: '05:45:04 AM', type: 'success', message: 'Gemini payload generated: Anulom Vilom breathwork asana & Tamil adaptation.' },
    { timestamp: '06:00:01 AM', type: 'success', message: 'Dispatched poster card & text payload to WhatsApp Group "Yaga\'s Mart Sendurai Community".' },
    { timestamp: '06:00:03 AM', type: 'success', message: 'Published vertical 1080x1920 poster card to WhatsApp Status.' },
    { timestamp: '06:00:05 AM', type: 'success', message: 'Posted feed image and caption to Instagram Page (@yagas_mart_sendurai_official).' },
    { timestamp: '06:00:07 AM', type: 'success', message: 'Posted feed image to Facebook Page (Yaga\'s Mart, Sendurai).' }
  ]);

  // Statistics
  const publishedCount = schedule.filter(s => s.status === 'published').length;
  const scheduledCount = schedule.filter(s => s.status === 'scheduled').length;

  // Handlers
  const handleUpdateItem = (updatedItem) => {
    setSchedule(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    setSelectedDay(updatedItem);
  };

  const handleApplyGeneratedContent = (dayId, aiContent) => {
    setSchedule(prev => prev.map(item => {
      if (item.id === dayId) {
        return {
          ...item,
          quoteEn: aiContent.quoteEn,
          quoteTa: aiContent.quoteTa,
          asanaName: aiContent.asanaName,
          healthBenefit: aiContent.healthBenefit,
          hashtags: aiContent.hashtags || item.hashtags
        };
      }
      return item;
    }));

    // Update selected day if active
    if (selectedDay.id === dayId) {
      setSelectedDay(prev => ({
        ...prev,
        quoteEn: aiContent.quoteEn,
        quoteTa: aiContent.quoteTa,
        asanaName: aiContent.asanaName,
        healthBenefit: aiContent.healthBenefit
      }));
    }
  };

  const handleTriggerNow = (itemToPublish = selectedDay) => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Add logs
    const newLogs = [
      { timestamp: timeStr, type: 'info', message: `MANUAL TRIGGER INITIATED for Day ${itemToPublish.dayNumber} (${itemToPublish.themeName}).` },
      { timestamp: timeStr, type: 'info', message: `Building 1080x1080 Feed & 1080x1920 Status poster cards...` },
      { timestamp: timeStr, type: 'success', message: `Posted payload to WhatsApp Group "${channelConfig.waGroupName}"!` },
      { timestamp: timeStr, type: 'success', message: `Posted vertical poster to WhatsApp Status.` },
      { timestamp: timeStr, type: 'success', message: `Published to Instagram Page (@${channelConfig.igAccountId}) via Meta Graph API.` },
      { timestamp: timeStr, type: 'success', message: `Published to Facebook Page via Meta Graph API.` }
    ];

    setLogs(prev => [...newLogs, ...prev]);

    // Mark as published
    handleUpdateItem({ ...itemToPublish, status: 'published' });
    setActiveTab('logs');
  };

  const handleOpenStudio = (item) => {
    setSelectedDay(item);
    setActiveTab('preview');
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Header Bar */}
      <Header 
        stats={{ published: publishedCount, scheduled: scheduledCount }}
        onTriggerNow={() => handleTriggerNow(selectedDay)}
        onOpenSettings={() => setActiveTab('settings')}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Tab Content */}
      <main>
        {activeTab === 'calendar' && (
          <CalendarGrid 
            schedule={schedule}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            onRegenerateDay={(dayId) => {
              const target = schedule.find(s => s.id === dayId);
              setSelectedDay(target);
              setIsGeneratorOpen(true);
            }}
            onPublishNow={(item) => handleTriggerNow(item)}
            onOpenStudio={handleOpenStudio}
          />
        )}

        {activeTab === 'preview' && (
          <PostCardPreview 
            item={selectedDay}
            onUpdateItem={handleUpdateItem}
          />
        )}

        {activeTab === 'logs' && (
          <CronSimulatorLogs 
            logs={logs}
            onClearLogs={() => setLogs([])}
            onRunManualTrigger={() => handleTriggerNow(selectedDay)}
          />
        )}

        {activeTab === 'settings' && (
          <MultiChannelConfig 
            config={channelConfig}
            onSaveConfig={setChannelConfig}
          />
        )}
      </main>

      {/* Gemini AI Modal */}
      <GeminiGeneratorModal 
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={setApiKey}
        selectedDay={selectedDay}
        onApplyGeneratedContent={handleApplyGeneratedContent}
      />

      {/* Footer */}
      <footer style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px', color: 'var(--text-muted)', fontSize: '12px' }}>
        Yaga's Mart, Sendurai • Automated Daily 06:00 AM Post Dispatch System • Google Gemini AI Powered
      </footer>

    </div>
  );
}
