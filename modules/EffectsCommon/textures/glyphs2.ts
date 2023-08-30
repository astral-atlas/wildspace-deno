export const glyph2URLs = import.meta.glob('./glyphs2/*.PNG', { eager: true, import: 'default' });

export const glyph2Names = Object.keys(glyph2URLs);