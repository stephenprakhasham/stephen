package com.yagasmart.service.impl;

import com.yagasmart.service.PosterRenderer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

/**
 * Single Responsibility (SRP) & Liskov Substitution (LSP) compliant Java2D Poster Renderer.
 */
@Service
public class Java2DPosterRenderer implements PosterRenderer {

    private static final Logger log = LoggerFactory.getLogger(Java2DPosterRenderer.class);

    @Value("${yagasmart.poster.output-dir:C:/YagasMartPosters}")
    private String outputDir;

    @Override
    public File generateAndSavePoster(int dayNumber, String themeName, String quoteEn, String quoteTa, String asanaName, String benefit, String aspectRatio) throws IOException {
        int width = 1080;
        int height = aspectRatio.equals("status") ? 1920 : 1080;

        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = image.createGraphics();

        // High quality rendering hints
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        // Sunrise Gold Background Gradient
        GradientPaint gradient = new GradientPaint(0, 0, new Color(255, 126, 95), width, height, new Color(254, 180, 123));
        g2d.setPaint(gradient);
        g2d.fillRect(0, 0, width, height);

        // Top Branding
        g2d.setColor(Color.WHITE);
        g2d.setFont(new Font("SansSerif", Font.BOLD, 42));
        g2d.drawString("🧘‍♂️ YAGA'S MART", 80, 110);
        g2d.setFont(new Font("SansSerif", Font.PLAIN, 24));
        g2d.drawString("SENDURAI • DAY " + dayNumber, 80, 150);

        // Theme Badge
        g2d.setColor(new Color(0, 0, 0, 80));
        g2d.fillRoundRect(80, 190, 450, 50, 25, 25);
        g2d.setColor(Color.WHITE);
        g2d.setFont(new Font("SansSerif", Font.BOLD, 22));
        g2d.drawString("☀️ " + themeName, 100, 223);

        // English Quote
        g2d.setFont(new Font("Serif", Font.ITALIC, 34));
        drawWrappedText(g2d, "\"" + quoteEn + "\"", 80, 340, width - 160);

        // Tamil Quote Box
        int taY = aspectRatio.equals("status") ? 650 : 560;
        g2d.setColor(new Color(0, 0, 0, 60));
        g2d.fillRoundRect(80, taY, width - 160, 140, 20, 20);
        g2d.setColor(new Color(251, 191, 36)); // Gold accent border line
        g2d.fillRect(80, taY, 10, 140);
        g2d.setColor(Color.WHITE);
        g2d.setFont(new Font("Dialog", Font.BOLD, 26));
        drawWrappedText(g2d, quoteTa, 110, taY + 50, width - 220);

        // Today's Asana Recommendation Card
        int asanaY = aspectRatio.equals("status") ? 1000 : 760;
        g2d.setColor(new Color(255, 255, 255, 60));
        g2d.fillRoundRect(80, asanaY, width - 160, 160, 24, 24);
        g2d.setColor(Color.WHITE);
        g2d.setFont(new Font("SansSerif", Font.BOLD, 20));
        g2d.drawString("TODAY'S ASANA", 110, asanaY + 45);
        g2d.setFont(new Font("SansSerif", Font.BOLD, 30));
        g2d.drawString("🧘 " + asanaName, 110, asanaY + 95);
        g2d.setFont(new Font("SansSerif", Font.PLAIN, 22));
        g2d.drawString("✨ " + benefit, 110, asanaY + 135);

        // Footer Contact Line
        int footerY = height - 60;
        g2d.setFont(new Font("SansSerif", Font.BOLD, 20));
        g2d.drawString("YAGA'S MART, SENDURAI • DAILY 06:00 AM MOTIVATION", 180, footerY);

        g2d.dispose();

        // Save file to C:\YagasMartPosters\
        File directory = new File(outputDir);
        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            if (created) log.info("[Java2D Renderer] Created poster folder: {}", outputDir);
        }

        String fileName = String.format("YagasMart_Day%02d_%s.png", dayNumber, aspectRatio);
        File outputFile = new File(directory, fileName);
        ImageIO.write(image, "PNG", outputFile);

        log.info("[Java2D Renderer] Saved rendered poster to: {}", outputFile.getAbsolutePath());
        return outputFile;
    }

    private void drawWrappedText(Graphics2D g2d, String text, int x, int y, int maxWidth) {
        FontMetrics metrics = g2d.getFontMetrics();
        String[] words = text.split(" ");
        StringBuilder currentLine = new StringBuilder();

        int currentY = y;
        for (String word : words) {
            if (metrics.stringWidth(currentLine + " " + word) < maxWidth) {
                currentLine.append(word).append(" ");
            } else {
                g2d.drawString(currentLine.toString(), x, currentY);
                currentLine = new StringBuilder(word).append(" ");
                currentY += metrics.getHeight();
            }
        }
        if (!currentLine.isEmpty()) {
            g2d.drawString(currentLine.toString(), x, currentY);
        }
    }
}
