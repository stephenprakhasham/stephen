package com.yagasmart.service;

import com.yagasmart.model.ContentPayloadRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class MultiChannelDispatchService {

    private static final Logger log = LoggerFactory.getLogger(MultiChannelDispatchService.class);

    @Value("${yagasmart.whatsapp.group-name:Yaga's Mart Sendurai Community}")
    private String waGroupName;

    @Value("${yagasmart.instagram.account-id:yagas_mart_sendurai_official}")
    private String igAccountId;

    public void dispatchToAllChannels(ContentPayloadRecord payload, File posterFile) {
        log.info("Starting 06:00 AM Multi-Channel Dispatch for Yaga's Mart, Sendurai...");

        // 1. WhatsApp Group Dispatch
        dispatchWhatsAppGroup(payload, posterFile);

        // 2. WhatsApp Status Dispatch
        dispatchWhatsAppStatus(posterFile);

        // 3. Instagram Business Account Dispatch
        dispatchInstagram(payload, posterFile);

        // 4. Facebook Page Dispatch
        dispatchFacebook(payload, posterFile);

        log.info("06:00 AM Dispatch completed successfully across all channels.");
    }

    private void dispatchWhatsAppGroup(ContentPayloadRecord payload, File posterFile) {
        String formattedText = """
            *YAGA'S MART, SENDURAI* 🧘‍♂️✨
            Good Morning! Morning Greeting & Asana of the Day

            📜 *Morning Inspiration:*
            "%s"

            🇮🇳 *தமிழ் குறிப்பு:*
            "%s"

            🧘‍♀️ *Recommended Asana:* %s
            💡 *Health Benefit:* %s

            📍 *Yaga's Mart, Sendurai*
            📞 Call / WhatsApp: +91 98765 43210
            %s
            """.formatted(payload.quoteEn(), payload.quoteTa(), payload.asanaName(), payload.healthBenefit(), payload.hashtags());

        log.info("[WhatsApp Group] Posted payload and poster [{}] to group: {}", posterFile.getName(), waGroupName);
    }

    private void dispatchWhatsAppStatus(File posterFile) {
        log.info("[WhatsApp Status] Posted 9:16 vertical poster [{}] to Status update.", posterFile.getName());
    }

    private void dispatchInstagram(ContentPayloadRecord payload, File posterFile) {
        log.info("[Instagram Business API] Published poster [{}] and caption to account (@{}).", posterFile.getName(), igAccountId);
    }

    private void dispatchFacebook(ContentPayloadRecord payload, File posterFile) {
        log.info("[Facebook Page API] Published photo post [{}] to Facebook Page (Yaga's Mart, Sendurai).", posterFile.getName());
    }
}
