import { toRGB } from "../../src/utils";

describe('toRGB', () => {
    it('should convert a short hex code to RGB', () => {
      const result = toRGB('#abc');
      expect(result).toBe('170,187,204');
    });
  
    it('should convert a long hex code to RGB', () => {
      const result = toRGB('#aabbcc');
      expect(result).toBe('170,187,204');
    });
  
    it('should handle uppercase hex code', () => {
      const result = toRGB('#AABBCC');
      expect(result).toBe('170,187,204');
    });
  
    it('should handle hex code without # prefix', () => {
      const result = toRGB('aabbcc');
      expect(result).toBe('170,187,204');
    });
  
    it('should handle empty string input', () => {
      const result = toRGB('');
      expect(result).toBe('');
    });
  
    it('should handle invalid hex code format', () => {
      const result = toRGB('invalid');
      expect(result).toBe('');
    });
  
    it('should handle undefined input', () => {
      const result = toRGB(undefined as any);
      expect(result).toBe('');
    });
  });