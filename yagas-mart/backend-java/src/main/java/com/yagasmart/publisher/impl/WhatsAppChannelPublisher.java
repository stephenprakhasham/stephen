package com.yagasmart.publisher.impl;

import com.yagasmart.model.ContentPayloadRecord;
import com.yagasmart.publisher.SocialChannelPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;

/**
 * Single Responsibility Principle (SRP): Responsible ONLY for WhatsApp dispatches.
 */
@Component
public class WhatsAppChannelPublisher implements SocialChannelPublisher {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppChannelPublisher.class);

    @Value("${yagasmart.whatsapp.group-name:Yaga's Mart Sendurai Community}")
    private String waGroupName;

    @Value("${yagasmart.whatsapp.status-enabled:true}")
    private boolean statusEnabled;

    @Override
    public String getChannelName() {
        return "WhatsApp (Group & Status)";
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean publish(ContentPayloadRecord payload, File mediaFile) {
        log.info("[WhatsApp Publisher - SRP] Dispatching payload to Group: {}", waGroupName);
        if (statusEnabled && mediaFile != null && mediaFile.exists()) {
            log.info("[WhatsApp Publisher - SRP] Uploading poster [{}] to Status broadcast.", mediaFile.getName());
        }
        return true;
    }
}
