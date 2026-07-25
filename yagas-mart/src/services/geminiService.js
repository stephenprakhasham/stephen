// Gemini API Service for Yaga's Mart Content Generation

export async function generateYogaPost(apiKey, dayNumber, theme, category, language = 'bilingual') {
  if (!apiKey) {
    // Simulated smart response if API key is not yet pasted in UI
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return {
      quoteEn: `Welcome the rising sun with gratitude. Day ${dayNumber} brings clarity to your mind and agility to your body with Yaga's Mart.`,
      quoteTa: `சூரிய உதயத்தை நன்றியுடன் வரவேற்போம். யோகா தினம் ${dayNumber} உங்கள் மனதிற்கு தெளிவையும் உடலுக்கு சுறுசுறுப்பையும் தரும்.`,
      asanaName: "Tadasana (Mountain Pose)",
      healthBenefit: "Improves posture & grounds nervous energy",
      hashtags: `#YagasMart #SenduraiYoga #GoodMorningSendurai #Day${dayNumber}Yoga #DailyMotivation`
    };
  }

  try {
    const prompt = `You are the lead Yoga Instructor and Social Media Specialist for "Yaga's Mart" in Sendurai.
Generate a morning Good Morning post payload for Day ${dayNumber}.
Theme: ${theme} (${category}).
Language requested: ${language}.

Please reply ONLY with a valid JSON object matching this schema:
{
  "quoteEn": "Inspiring English quote/message for morning 6 AM",
  "quoteTa": "Uplifting Tamil translation/adaptation of the morning quote",
  "asanaName": "Recommended Asana for the day",
  "healthBenefit": "Key physical/mental benefit of this asana",
  "hashtags": "#hashtags"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean JSON markdown blocks if any
    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (err) {
    console.error("Gemini API generation error:", err);
    return {
      quoteEn: `Rise, stretch, and shine! Day ${dayNumber} is your opportunity to inner peace with Yaga's Mart, Sendurai.`,
      quoteTa: `எழுங்கள், யோகா செய்யுங்கள், பிரகாசியுங்கள்! யாகாஸ் மார்ட்டுடன் உங்கள் அமைதியான பயணம் தொடங்கட்டும்.`,
      asanaName: "Paschimottanasana (Seated Forward Bend)",
      healthBenefit: "Calms brain & stretches lower back",
      hashtags: "#YagasMart #SenduraiFitness #MorningYoga"
    };
  }
}
