package com.yagasmart.scheduler;

import com.yagasmart.model.ContentPayloadRecord;
import com.yagasmart.service.AiContentGenerator;
import com.yagasmart.service.PosterRenderer;
import com.yagasmart.service.impl.MultiChannelDispatchFacade;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.File;

/**
 * Single Responsibility (SRP) & Dependency Inversion (DIP) compliant Scheduler.
 * Depends ONLY on interface abstractions (AiContentGenerator, PosterRenderer).
 */
@Component
public class MorningDispatchScheduler {

    private static final Logger log = LoggerFactory.getLogger(MorningDispatchScheduler.class);

    private final AiContentGenerator aiGenerator;
    private final PosterRenderer posterRenderer;
    private final MultiChannelDispatchFacade dispatchFacade;

    public MorningDispatchScheduler(AiContentGenerator aiGenerator, PosterRenderer posterRenderer, MultiChannelDispatchFacade dispatchFacade) {
        this.aiGenerator = aiGenerator;
        this.posterRenderer = posterRenderer;
        this.dispatchFacade = dispatchFacade;
    }

    /**
     * Pre-generate Gemini payload & poster image at 05:45 AM using Java 24 Virtual Threads.
     */
    @Scheduled(cron = "${yagasmart.cron.pre-generate-time:0 45 5 * * ?}")
    public void executePreGeneration() {
        Thread.ofVirtual().name("yagasmart-pregen-virtual-thread").start(() -> {
            try {
                log.info("05:45 AM Pre-generation awaken on Virtual Thread: {}", Thread.currentThread());
                ContentPayloadRecord payload = aiGenerator.generateYogaPost(6, "Pranayama Wednesday", "Breathwork & Energy", "bilingual");
                File feedPoster = posterRenderer.generateAndSavePoster(6, "Pranayama Wednesday", payload.quoteEn(), payload.quoteTa(), payload.asanaName(), payload.healthBenefit(), "feed");
                File statusPoster = posterRenderer.generateAndSavePoster(6, "Pranayama Wednesday", payload.quoteEn(), payload.quoteTa(), payload.asanaName(), payload.healthBenefit(), "status");
                log.info("05:45 AM Pre-generation finished. Feed poster: {}, Status poster: {}", feedPoster.getName(), statusPoster.getName());
            } catch (Exception e) {
                log.error("Error during 05:45 AM pre-generation: ", e);
            }
        });
    }

    /**
     * Dispatch poster & payload across WhatsApp, Instagram, Facebook at 06:00 AM using Java 24 Virtual Threads.
     */
    @Scheduled(cron = "${yagasmart.cron.dispatch-time:0 0 6 * * ?}")
    public void executeMorningDispatch() {
        Thread.ofVirtual().name("yagasmart-dispatch-virtual-thread").start(() -> {
            try {
                log.info("06:00 AM Dispatch awakened on Virtual Thread: {}", Thread.currentThread());
                ContentPayloadRecord payload = aiGenerator.generateYogaPost(6, "Pranayama Wednesday", "Breathwork & Energy", "bilingual");
                File posterFile = new File("C:/YagasMartPosters/YagasMart_Day06_feed.png");
                dispatchFacade.dispatchToAllChannels(payload, posterFile);
            } catch (Exception e) {
                log.error("Error during 06:00 AM morning dispatch: ", e);
            }
        });
    }
}
