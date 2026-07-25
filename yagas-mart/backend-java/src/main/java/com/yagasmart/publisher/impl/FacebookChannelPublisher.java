package com.yagasmart.publisher.impl;

import com.yagasmart.model.ContentPayloadRecord;
import com.yagasmart.publisher.SocialChannelPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.File;

/**
 * Single Responsibility Principle (SRP): Responsible ONLY for Facebook Page dispatches.
 */
@Component
public class FacebookChannelPublisher implements SocialChannelPublisher {

    private static final Logger log = LoggerFactory.getLogger(FacebookChannelPublisher.class);

    @Override
    public String getChannelName() {
        return "Facebook Page API";
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean publish(ContentPayloadRecord payload, File mediaFile) {
        log.info("[Facebook Publisher - SRP] Publishing photo post to Facebook Page (Yaga's Mart, Sendurai) via Meta Graph API.");
        return true;
    }
}
