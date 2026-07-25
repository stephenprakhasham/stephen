export const MONTHLY_SCHEDULE = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  const themes = [
    { name: "Mindfulness Monday", category: "Meditation & Focus", icon: "🧘‍♂️" },
    { name: "Asana Tuesday", category: "Physical Strength & Posture", icon: "🤸‍♀️" },
    { name: "Pranayama Wednesday", category: "Breathwork & Energy", icon: "🌬️" },
    { name: "Therapeutic Thursday", category: "Healing & Flexibility", icon: "🌱" },
    { name: "Flexibility Friday", category: "Core & Mobility", icon: "⚡" },
    { name: "Wisdom Saturday", category: "Yoga Philosophy & Lifestyle", icon: "📜" },
    { name: "Self-Care Sunday", category: "Restoration & Peace", icon: "☀️" }
  ];
  
  const theme = themes[(day - 1) % 7];
  
  const quotes = [
    {
      en: "Yoga is the journey of the self, through the self, to the self. Start your morning with a quiet breath.",
      ta: "யோகா என்பது உங்களை நீங்கள் உணரும் இனிய பயணம். இந்த காலை பொழுதை அமைதியான மூச்சுப் பயிற்சியுடன் தொடங்குங்கள்.",
      asana: "Surya Namaskar (Sun Salutations)",
      benefit: "Boosts blood circulation & vital energy",
      gradient: "linear-gradient(135deg, #FF7E5F 0%, #FEB47B 100%)",
      themeStyle: "Sunrise Gold"
    },
    {
      en: "Inhale courage, exhale stress. Align your posture and conquer your day with grace.",
      ta: "நம்பிக்கையை உள்வாங்குங்கள், மன அழுத்தத்தை வெளியேற்றுங்கள். நல்ல உடல் நிலையுடன் இன்றைய நாளை வெற்றிகரமாக தொடங்குங்கள்.",
      asana: "Vrikshasana (Tree Pose)",
      benefit: "Enhances neuromuscular coordination & focus",
      gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      themeStyle: "Forest Zen"
    },
    {
      en: "Control your breath, master your mind. 10 minutes of Pranayama in the morning transforms your vitality.",
      ta: "மூச்சை கட்டுப்படுத்துங்கள், மனதை வெல்லுங்கள். தினமும் 10 நிமிடம் பிராணாயாமம் உங்கள் ஆற்றலை அதிகரிக்கும்.",
      asana: "Anulom Vilom (Nadi Shodhana)",
      benefit: "Purifies energy channels & calms the nervous system",
      gradient: "linear-gradient(135deg, #6A11CB 0%, #2575FC 100%)",
      themeStyle: "Deep Lotus"
    },
    {
      en: "Peace comes from within. Do not seek it without. A gentle stretch opens heart and mind.",
      ta: "அமைதி உங்களின் உள்ளே இருக்கிறது. காலை உடற்பயிற்சி உங்கள் இதயத்தையும் மனதையும் புத்துணர்ச்சியாக்கும்.",
      asana: "Bhujangasana (Cobra Pose)",
      benefit: "Strengthens spine & relieves back stiffness",
      gradient: "linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)",
      themeStyle: "Royal Violet"
    },
    {
      en: "Flexibility is key to longevity. Nurture your spine every sunrise for lifelong vitality.",
      ta: "நெகிழ்வுத்தன்மையே ஆரோக்கியமான வாழ்வின் ரகசியம். உங்கள் முதுகெலும்பை தினமும் பாதுகாக்கவும்.",
      asana: "Adho Mukha Svanasana (Downward Dog)",
      benefit: "Energizes brain & stretches hamstrings",
      gradient: "linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)",
      themeStyle: "Sunset Amber"
    }
  ];

  const q = quotes[(day - 1) % quotes.length];
  
  // Status cycle: days 1-5 published, day 6 scheduled, rest queued/draft
  let status = "scheduled";
  if (day <= 5) status = "published";
  if (day === 6) status = "scheduled";
  if (day > 6) status = "draft";

  return {
    id: day,
    dayNumber: day,
    dateString: `July ${day}, 2026`,
    targetTime: "06:00 AM",
    themeName: theme.name,
    category: theme.category,
    icon: theme.icon,
    quoteEn: q.en,
    quoteTa: q.ta,
    asanaName: q.asana,
    healthBenefit: q.benefit,
    bgGradient: q.gradient,
    bgStyleName: q.themeStyle,
    status: status,
    channels: {
      whatsappGroup: true,
      whatsappStatus: true,
      instagram: true,
      facebook: true
    },
    hashtags: "#YagasMart #Sendurai #SenduraiWellness #GoodMorningYoga #SuryaNamaskar #Mindfulness"
  };
});
