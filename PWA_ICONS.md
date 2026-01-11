# PWA Icons Setup

The app is configured for PWA with icon support. You'll need to add the following icon files to the `public` directory:

## Required Icons

- `pwa-192x192.png` - 192x192 pixels (for Android)
- `pwa-512x512.png` - 512x512 pixels (for Android and iOS)

## Creating Icons

You can create these icons using any image editor or online tool:

1. Create a square image (192x192 and 512x512)
2. Use the app's theme color (#2563eb - primary blue)
3. Include the app name "Occam's Protocol" or a simple icon/logo
4. Save as PNG files
5. Place them in the `public` directory

## Quick Icon Generation

You can use online tools like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- https://favicon.io/

Or create simple placeholder icons using ImageMagick or similar tools.

The app will work without these icons, but they're required for a proper PWA installation experience.
