package com.yagasmart.model;

/**
 * Java 24 Record for bilingual quote payload.
 */
public record ContentPayloadRecord(
    String quoteEn,
    String quoteTa,
    String asanaName,
    String healthBenefit,
    String hashtags
) {}
