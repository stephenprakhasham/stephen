package com.yagasmart.model;

import java.time.LocalDate;

/**
 * Java 24 Record representing a daily schedule entry.
 */
public record YogaScheduleItem(
    Long id,
    int dayNumber,
    String dateString,
    String targetTime,
    String themeName,
    String category,
    String icon,
    String quoteEn,
    String quoteTa,
    String asanaName,
    String healthBenefit,
    String bgGradient,
    String bgStyleName,
    String status,
    String hashtags
) {}
