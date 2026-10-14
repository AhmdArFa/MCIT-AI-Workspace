import PptxGenJS from 'pptxgenjs';

export interface SlideData {
  bullets: string[];
  id: string;
  notes?: string;
  subtitle?: string;
  title: string;
}

export const exportToPptx = async (
  deckTitle: string,
  slides: SlideData[],
  theme: 'mcit' | 'dark' | 'corporate' = 'mcit',
) => {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  const themeColors = {
    mcit: {
      bg: '0F172A',
      title: 'E2B857', // Egyptian Gold
      subtitle: '94A3B8',
      text: 'F8FAFC',
      accent: '1E293B',
      cardBg: '1E293B',
    },
    dark: {
      bg: '18181B',
      title: 'FAFAFA',
      subtitle: 'A1A1AA',
      text: 'F4F4F5',
      accent: '27272A',
      cardBg: '27272A',
    },
    corporate: {
      bg: 'FFFFFF',
      title: '0F172A',
      subtitle: '475569',
      text: '334155',
      accent: 'F1F5F9',
      cardBg: 'F8FAFC',
    },
  }[theme];

  // 1. Cover Slide
  const cover = pptx.addSlide();
  cover.background = { color: themeColors.bg };

  // Decorative top border bar
  cover.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.15,
    fill: { color: themeColors.title },
  });

  cover.addText(deckTitle || 'MCIT Executive Presentation', {
    x: 1.0,
    y: 2.2,
    w: 11.3,
    h: 1.6,
    fontSize: 38,
    bold: true,
    color: themeColors.title,
    align: 'left',
    fontFace: 'Arial',
  });

  cover.addText('Ministry of Communications and Information Technology &bull; MCIT AI Studio', {
    x: 1.0,
    y: 3.9,
    w: 11.3,
    h: 0.6,
    fontSize: 16,
    color: themeColors.subtitle,
    align: 'left',
    fontFace: 'Arial',
  });

  // Footer on cover
  cover.addText(
    `Prepared by MCIT AI Studio | Lead Developer: Eng Ahmed Arfa | ${new Date().toLocaleDateString()}`,
    {
      x: 1.0,
      y: 6.2,
      w: 11.3,
      h: 0.4,
      fontSize: 11,
      color: themeColors.subtitle,
      fontFace: 'Arial',
    },
  );

  // 2. Content Slides
  slides.forEach((slide, idx) => {
    const s = pptx.addSlide();
    s.background = { color: themeColors.bg };

    // Slide Header
    s.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.08,
      fill: { color: themeColors.title },
    });

    s.addText(slide.title || `Slide ${idx + 1}`, {
      x: 0.8,
      y: 0.5,
      w: 10.5,
      h: 0.8,
      fontSize: 26,
      bold: true,
      color: themeColors.title,
      fontFace: 'Arial',
    });

    if (slide.subtitle) {
      s.addText(slide.subtitle, {
        x: 0.8,
        y: 1.3,
        w: 10.5,
        h: 0.4,
        fontSize: 14,
        color: themeColors.subtitle,
        fontFace: 'Arial',
      });
    }

    // Slide content card
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.8,
      w: 11.7,
      h: 4.6,
      fill: { color: themeColors.cardBg },
      line: { color: themeColors.accent, width: 1 },
      rectRadius: 0.1,
    });

    // Bullets inside card
    const bulletText = (slide.bullets || []).map((b) => ({
      text: b,
      options: {
        bullet: true,
        fontSize: 16,
        color: themeColors.text,
        paraSpaceAfter: 12,
        fontFace: 'Arial',
      },
    }));

    if (bulletText.length > 0) {
      s.addText(bulletText, {
        x: 1.2,
        y: 2.1,
        w: 10.9,
        h: 4.0,
        valign: 'top',
      });
    }

    // Slide footer
    s.addText(`MCIT AI &bull; Slide ${idx + 1} of ${slides.length}`, {
      x: 0.8,
      y: 6.7,
      w: 6.0,
      h: 0.3,
      fontSize: 10,
      color: themeColors.subtitle,
      fontFace: 'Arial',
    });

    if (slide.notes) {
      s.addNotes(slide.notes);
    }
  });

  const fileName = `${(deckTitle || 'MCIT_Presentation').replace(/[^a-z0-9_-]/gi, '_')}.pptx`;
  await pptx.writeFile({ fileName });
};
