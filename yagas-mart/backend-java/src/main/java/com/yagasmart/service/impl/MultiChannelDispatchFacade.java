package com.yagasmart.service.impl;

import com.yagasmart.model.ContentPayloadRecord;
import com.yagasmart.publisher.SocialChannelPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.List;

/**
 * Open/Closed Principle (OCP) & Dependency Inversion Principle (DIP) compliant Dispatcher Facade.
 * Spring automatically injects all beans implementing SocialChannelPublisher.
 */
@Service
public class MultiChannelDispatchFacade {

    private static final Logger log = LoggerFactory.getLogger(MultiChannelDispatchFacade.class);

    private final List<SocialChannelPublisher> publishers;

    public MultiChannelDispatchFacade(List<SocialChannelPublisher> publishers) {
        this.publishers = publishers;
        log.info("MultiChannelDispatchFacade initialized with {} channel publishers (OCP & DIP compliant).", publishers.size());
    }

    public void dispatchToAllChannels(ContentPayloadRecord payload, File posterFile) {
        log.info("Starting multi-channel dispatch across {} registered publisher beans...", publishers.size());

        for (SocialChannelPublisher publisher : publishers) {
            if (publisher.isEnabled()) {
                try {
                    boolean success = publisher.publish(payload, posterFile);
                    log.info("Publisher [{}] status: {}", publisher.getChannelName(), success ? "SUCCESS" : "FAILED");
                } catch (Exception e) {
                    log.error("Error publishing to [{}]", publisher.getChannelName(), e);
                }
            } else {
                log.info("Publisher [{}] is currently disabled.", publisher.getChannelName());
            }
        }
    }
}
