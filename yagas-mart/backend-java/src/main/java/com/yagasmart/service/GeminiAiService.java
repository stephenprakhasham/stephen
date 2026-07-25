package com.yagasmart.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yagasmart.model.ContentPayloadRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class GeminiAiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiService.class);
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${spring.ai.google.genai.api-key:demo_key}")
    private String apiKey;

    public GeminiAiService(ObjectMapper objectMapper) {
        this.restClient = RestClient.create();
        this.objectMapper = objectMapper;
    }

    public ContentPayloadRecord generateYogaPost(int dayNumber, String theme, String category, String language) {
        if (apiKey == null || apiKey.equals("demo_key") || apiKey.isBlank()) {
            log.info("Gemini API key is not configured. Utilizing Yaga's Mart fallback dataset.");
            return getFallbackPayload(dayNumber);
        }

        try {
            String promptText = """
                You are the lead Yoga Instructor and Social Media Specialist for "Yaga's Mart" in Sendurai.
                Generate a morning Good Morning post payload for Day %d.
                Theme: %s (%s).
                Language requested: %s.

                Please reply ONLY with a valid JSON object matching this schema:
                {
                  "quoteEn": "Inspiring English quote for morning 6 AM",
                  "quoteTa": "Uplifting Tamil translation/adaptation",
                  "asanaName": "Recommended Asana for the day",
                  "healthBenefit": "Key benefit",
                  "hashtags": "#YagasMart #Sendurai"
                }
                """.formatted(dayNumber, theme, category, language);

            String requestUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(Map.of("text", promptText)))
                )
            );

            Map response = restClient.post()
                    .uri(requestUrl)
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("candidates")) {
                List candidates = (List) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map firstCandidate = (Map) candidates.get(0);
                    Map content = (Map) firstCandidate.get("content");
                    List parts = (List) content.get("parts");
                    Map firstPart = (Map) parts.get(0);
                    String rawText = (String) firstPart.get("text");

                    String cleanedText = rawText.replaceAll("```json", "").replaceAll("```", "").trim();
                    return objectMapper.readValue(cleanedText, ContentPayloadRecord.class);
                }
            }

        } catch (Exception e) {
            log.error("Error calling Gemini API: {}. Falling back to default payload.", e.getMessage());
        }

        return getFallbackPayload(dayNumber);
    }

    private ContentPayloadRecord getFallbackPayload(int dayNumber) {
        return new ContentPayloadRecord(
            "Welcome the rising sun with gratitude. Day " + dayNumber + " brings clarity to your mind and agility to your body with Yaga's Mart, Sendurai.",
            "சூரிய உதயத்தை நன்றியுடன் வரவேற்போம். யோகா தினம் " + dayNumber + " உங்கள் மனதிற்கு தெளிவையும் உடலுக்கு சுறுசுறுப்பையும் தரும்.",
            "Tadasana (Mountain Pose)",
            "Improves posture & grounds nervous energy",
            "#YagasMart #Sendurai #GoodMorningSendurai #Day" + dayNumber + "Yoga"
        );
    }
}
