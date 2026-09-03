import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

interface HslColor {
  hue: number;
  saturation: number;
  lightness: number;
}

const stylesheetPath = fileURLToPath(new URL('./index.css', import.meta.url));
const stylesheet = fs.readFileSync(stylesheetPath, 'utf8');
const semanticTextTokens = [
  'text-primary',
  'text-secondary',
  'text-muted',
  'accent',
  'success',
  'error',
  'warning',
  'running',
] as const;
const surfaceTokens = ['bg-base', 'bg-surface', 'bg-elevated', 'bg-inset'] as const;

function cssBlock(selector: string): string {
  const match = stylesheet.match(new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\n\\}`));
  if (!match) throw new Error(`Missing CSS block: ${selector}`);
  return match[1];
}

function cssHsl(block: string, token: string): HslColor {
  const match = block.match(
    new RegExp(`--${token}:\\s*hsl\\(\\s*([\\d.]+),\\s*([\\d.]+)%?,\\s*([\\d.]+)%?\\s*\\)`)
  );
  if (!match) throw new Error(`Missing HSL token: --${token}`);
  return {
    hue: Number(match[1]),
    saturation: Number(match[2]),
    lightness: Number(match[3]),
  };
}

function hslToRgb({ hue, saturation, lightness }: HslColor): [number, number, number] {
  const h = ((hue % 360) + 360) % 360 / 360;
  const s = saturation / 100;
  const l = lightness / 100;
  if (s === 0) return [l, l, l];

  const hueToRgb = (p: number, q: number, t: number): number => {
    let normalized = t;
    if (normalized < 0) normalized += 1;
    if (normalized > 1) normalized -= 1;
    if (normalized < 1 / 6) return p + (q - p) * 6 * normalized;
    if (normalized < 1 / 2) return q;
    if (normalized < 2 / 3) return p + (q - p) * (2 / 3 - normalized) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hueToRgb(p, q, h + 1 / 3), hueToRgb(p, q, h), hueToRgb(p, q, h - 1 / 3)];
}

function relativeLuminance(color: HslColor): number {
  const channels = hslToRgb(color).map((channel) => (
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  ));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground: HslColor, background: HslColor): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

describe('semantic accessibility tokens', () => {
  it('keeps normal text tokens at WCAG AA across every theme surface', () => {
    const themes = {
      dark: cssBlock(':root'),
      light: cssBlock('html\\.light'),
    };

    for (const [theme, block] of Object.entries(themes)) {
      const surfaces = surfaceTokens.map((token) => cssHsl(block, token));
      for (const token of semanticTextTokens) {
        const minimumRatio = Math.min(...surfaces.map((surface) => contrastRatio(cssHsl(block, token), surface)));
        expect(minimumRatio, `${theme} --${token}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('uses a theme-aware primary-button foreground with AA contrast', () => {
    const buttonBlock = stylesheet.match(/\.btn-primary\s*\{([\s\S]*?)\n\s*\}/)?.[1] || '';
    expect(buttonBlock).toContain('background: var(--accent)');
    expect(buttonBlock).toContain('color: var(--bg-base)');

    for (const selector of [':root', 'html\\.light']) {
      const block = cssBlock(selector);
      expect(contrastRatio(cssHsl(block, 'bg-base'), cssHsl(block, 'accent'))).toBeGreaterThanOrEqual(4.5);
    }
  });
});
