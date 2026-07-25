package com.yagasmart.service;

import com.yagasmart.model.ContentPayloadRecord;

/**
 * Interface Segregation & Dependency Inversion Principle compliant interface.
 */
public interface AiContentGenerator {
    ContentPayloadRecord generateYogaPost(int dayNumber, String theme, String category, String language);
}
