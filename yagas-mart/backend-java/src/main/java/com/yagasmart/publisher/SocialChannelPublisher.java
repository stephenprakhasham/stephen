package com.yagasmart.publisher;

import com.yagasmart.model.ContentPayloadRecord;
import java.io.File;

/**
 * Open/Closed Principle (OCP) and Liskov Substitution Principle (LSP) compliant interface.
 */
public interface SocialChannelPublisher {
    String getChannelName();
    boolean isEnabled();
    boolean publish(ContentPayloadRecord payload, File mediaFile);
}
