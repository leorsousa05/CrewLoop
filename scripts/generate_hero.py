from PIL import Image, ImageDraw, ImageFont

def main():
    src = Image.open('assets/screenshots/dashboard-overview.png')
    W, H = 1200, 400

    src_ratio = src.width / src.height
    target_ratio = W / H
    if src_ratio > target_ratio:
        new_height = H
        new_width = int(new_height * src_ratio)
    else:
        new_width = W
        new_height = int(new_width / src_ratio)

    bg = src.resize((new_width, new_height), Image.Resampling.LANCZOS)
    left = (bg.width - W) // 2
    top = (bg.height - H) // 2
    bg = bg.crop((left, top, left + W, top + H))

    overlay = Image.new('RGBA', (W, H), (10, 10, 30, 160))
    bg = Image.alpha_composite(bg.convert('RGBA'), overlay)

    draw = ImageDraw.Draw(bg)
    dots = ['#01579B', '#E65100', '#6A1B9A', '#1B5E20', '#B71C1C', '#00695C']
    start_x = 80
    for i, color in enumerate(dots):
        x = start_x + i * 34
        draw.ellipse([x, 90, x + 24, 114], fill=color)

    try:
        title_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 64)
        tag_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 24)
        cta_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
    except Exception:
        title_font = ImageFont.load_default()
        tag_font = ImageFont.load_default()
        cta_font = ImageFont.load_default()

    title = 'CrewLoop'
    tagline = 'An AI agent crew that runs the complete software development flow.'
    # Draw a clean, rounded pill background for the CTA area
    cta = 'npm install -g @archznn/crewloop-cli'
    temp_draw = ImageDraw.Draw(Image.new('RGBA', (1, 1)))
    bbox = temp_draw.textbbox((0, 0), cta, font=cta_font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    pill_x = 80
    pill_y = 280
    padding_x = 22
    padding_y = 16
    pill_w = text_w + padding_x * 2
    pill_h = text_h + padding_y * 2

    # Local dark overlay behind CTA for clean readability
    overlay_cta = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay_cta)
    corner_radius = 16
    overlay_draw.rounded_rectangle(
        [pill_x - 12, pill_y - 12, pill_x + pill_w + 12, pill_y + pill_h + 12],
        radius=corner_radius,
        fill=(20, 20, 35, 200)
    )
    bg = Image.alpha_composite(bg, overlay_cta)

    # Redraw text and colored dots on top of the composite
    # Keep only the localized dark overlay; no colored pill
    draw = ImageDraw.Draw(bg)
    draw.text((80, 140), title, font=title_font, fill='#FFFFFF')
    draw.text((80, 220), tagline, font=tag_font, fill='#E5E7EB')

    # CTA as plain text over the dark overlay area
    cta = 'npm install -g @archznn/crewloop-cli'
    draw.text((pill_x + padding_x, pill_y + padding_y - 2), cta, font=cta_font, fill='#FFFFFF')

    bg.convert('RGB').save('assets/images/crewloop-hero.png', 'PNG')
    print('Saved assets/images/crewloop-hero.png')

if __name__ == '__main__':
    main()
