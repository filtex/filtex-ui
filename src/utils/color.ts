const toRGB = (hex: string): string => {
    hex = hex?.replace(/^#/, '');

    const isValidHex = /^[0-9A-Fa-f]{6}$/.test(hex) || /^[0-9A-Fa-f]{3}$/.test(hex);
    if (!isValidHex) {
        return '';
    }

    if (hex.length === 3) {
        const r = hex.substring(0, 1);
        const g = hex.substring(1, 2);
        const b = hex.substring(2, 3);

        const red = parseInt(r + r, 16);
        const green = parseInt(g + g, 16);
        const blue = parseInt(b + b, 16);

        return `${red},${green},${blue}`;
    } else if (hex.length === 6) {
        const red = parseInt(hex.substring(0, 2), 16);
        const green = parseInt(hex.substring(2, 4), 16);
        const blue = parseInt(hex.substring(4, 6), 16);

        return `${red},${green},${blue}`;
    } else {
        return '';
    }
};

export { toRGB };
