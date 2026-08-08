/**
 * FAA figure images extracted from Jeppesen Private Pilot Test Guide (Appendix 2).
 * Maps figure number -> resolved asset URL (handled by Vite at build time).
 */

const modules = import.meta.glob<{ default: string }>('./*.jpg', { eager: true });

const figureImages: Record<number, string> = {};
for (const [path, mod] of Object.entries(modules)) {
    const match = path.match(/figure_(\d+)\.jpg$/);
    if (match) {
        figureImages[parseInt(match[1], 10)] = mod.default;
    }
}

export default figureImages;
