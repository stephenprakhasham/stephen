package com.yagasmart.controller;

import com.yagasmart.model.ContentPayloadRecord;
import com.yagasmart.model.YogaScheduleItem;
import com.yagasmart.service.AiContentGenerator;
import com.yagasmart.service.PosterRenderer;
import com.yagasmart.service.impl.MultiChannelDispatchFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

/**
 * Single Responsibility (SRP) & Dependency Inversion (DIP) compliant REST Controller.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final AiContentGenerator aiGenerator;
    private final PosterRenderer posterRenderer;
    private final MultiChannelDispatchFacade dispatchFacade;

    public DashboardController(AiContentGenerator aiGenerator, PosterRenderer posterRenderer, MultiChannelDispatchFacade dispatchFacade) {
        this.aiGenerator = aiGenerator;
        this.posterRenderer = posterRenderer;
        this.dispatchFacade = dispatchFacade;
    }

    @GetMapping("/schedule")
    public List<YogaScheduleItem> getSchedule() {
        List<YogaScheduleItem> schedule = new ArrayList<>();
        String[] themes = {
            "Mindfulness Monday", "Asana Tuesday", "Pranayama Wednesday", 
            "Therapeutic Thursday", "Flexibility Friday", "Wisdom Saturday", "Self-Care Sunday"
        };
        String[] categories = {
            "Meditation & Focus", "Physical Strength", "Breathwork & Energy",
            "Healing & Flexibility", "Core & Mobility", "Yoga Philosophy", "Restoration & Peace"
        };
        String[] icons = {"🧘‍♂️", "🤸‍♀️", "🌬️", "🌱", "⚡", "📜", "☀️"};

        for (int i = 1; i <= 31; i++) {
            int themeIdx = (i - 1) % 7;
            String status = i <= 5 ? "published" : (i == 6 ? "scheduled" : "draft");
            schedule.add(new YogaScheduleItem(
                (long) i,
                i,
                "July " + i + ", 2026",
                "06:00 AM",
                themes[themeIdx],
                categories[themeIdx],
                icons[themeIdx],
                "Welcome morning sun with gratitude. Day " + i + " brings clarity and vitality.",
                "சூரிய உதயத்தை நன்றியுடன் வரவேற்போம். யோகா தினம் " + i + " மனதிற்கு தெளிவு தரும்.",
                "Surya Namaskar (Sun Salutation)",
                "Boosts blood circulation & vital energy",
                "linear-gradient(135deg, #FF7E5F 0%, #FEB47B 100%)",
                "Sunrise Gold",
                status,
                "#YagasMart #Sendurai #SenduraiWellness #GoodMorningYoga"
            ));
        }
        return schedule;
    }

    @PostMapping("/generate-ai")
    public ResponseEntity<ContentPayloadRecord> generateAiQuote(
            @RequestParam(defaultValue = "6") int dayNumber,
            @RequestParam(defaultValue = "Pranayama Wednesday") String theme,
            @RequestParam(defaultValue = "Breathwork") String category,
            @RequestParam(defaultValue = "bilingual") String language) {

        ContentPayloadRecord payload = aiGenerator.generateYogaPost(dayNumber, theme, category, language);
        return ResponseEntity.ok(payload);
    }

    @PostMapping("/trigger-now")
    public ResponseEntity<String> triggerManualExecution(@RequestParam(defaultValue = "6") int dayNumber) {
        try {
            ContentPayloadRecord payload = aiGenerator.generateYogaPost(dayNumber, "Pranayama Wednesday", "Breathwork & Energy", "bilingual");
            File feedPoster = posterRenderer.generateAndSavePoster(dayNumber, "Pranayama Wednesday", payload.quoteEn(), payload.quoteTa(), payload.asanaName(), payload.healthBenefit(), "feed");
            File statusPoster = posterRenderer.generateAndSavePoster(dayNumber, "Pranayama Wednesday", payload.quoteEn(), payload.quoteTa(), payload.asanaName(), payload.healthBenefit(), "status");
            
            dispatchFacade.dispatchToAllChannels(payload, feedPoster);
            return ResponseEntity.ok("Successfully generated poster and dispatched to WhatsApp, Instagram, and Facebook via SOLID architecture!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error executing manual trigger: " + e.getMessage());
        }
    }
}
