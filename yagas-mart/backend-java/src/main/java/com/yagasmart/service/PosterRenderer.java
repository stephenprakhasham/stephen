package com.yagasmart.service;

import java.io.File;
import java.io.IOException;

/**
 * Interface for poster image rendering engines (Java2D, Headless Chrome, SVG, etc.).
 */
public interface PosterRenderer {
    File generateAndSavePoster(int dayNumber, String themeName, String quoteEn, String quoteTa, String asanaName, String benefit, String aspectRatio) throws IOException;
}
