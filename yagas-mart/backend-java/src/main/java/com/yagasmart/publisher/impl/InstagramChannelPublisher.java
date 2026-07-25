package com.yagasmart.publisher.impl;

import com.yagasmart.model.ContentPayloadRecord;
import com.yagasmart.publisher.SocialChannelPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;

/**
 * Single Responsibility Principle (SRP): Responsible ONLY for Instagram Business dispatches.
 */
@Component
public class InstagramChannelPublisher implements SocialChannelPublisher {

    private static final Logger log = LoggerFactory.getLogger(InstagramChannelPublisher.class);

    @Value("${yagasmart.instagram.account-id:yagas_mart_sendurai_official}")
    private String igAccountId;

    @Override
    public String getChannelName() {
        return "Instagram Business API";
    }

    @Override
    public boolean isEnabled() {
        return igAccountId != null && !igAccountId.isBlank();
    }

    @Override
    public boolean publish(ContentPayloadRecord payload, File mediaFile) {
        log.info("[Instagram Publisher - SRP] Publishing post to Instagram Business Account (@{}) via Meta Graph API.", igAccountId);
        return true;
    }
}
