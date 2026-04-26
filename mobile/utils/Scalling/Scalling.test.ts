import { Dimensions } from 'react-native';
import Size from './Scaling';

const setDimensions = (width: number, height: number) => {
  jest.spyOn(Dimensions, 'get').mockReturnValue({
    width,
    height,
    scale: 1,
    fontScale: 1,
  });
};

describe('Size Utility - Responsive Scaling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('scaleSize (Width-based Scaling)', () => {
    it('should scale correctly in Portrait mode (iPhone 11/13 base)', () => {
      setDimensions(390, 844);
      
      const input = 100;
      const expected = (100 / 375) * 390;

      expect(Size.scaleSize(input)).toBeCloseTo(expected);
    });

    it('should maintain consistent size in Landscape mode (No stretching)', () => {
      setDimensions(844, 390);
      
      const input = 100;
      const expected = (100 / 375) * 390;
      
      expect(Size.scaleSize(input)).toBe(Size.scaleSize(input));
      expect(Size.scaleSize(input)).toBeCloseTo(expected);
    });
  });

  describe('scaleHeight', () => {
    it('should scale based on long dimension in Portrait', () => {
      setDimensions(375, 812);

      const input = 100;
      const expected = (100 / 812) * 812;
      
      expect(Size.scaleHeight(input)).toBe(100);
    });

    it('should use the long side in Landscape', () => {
      setDimensions(812, 375);

      const input = 100;
      
      expect(Size.scaleHeight(input)).toBe(100);
    });
  });

  describe('scaleFont', () => {
    it('should apply moderate scaling (factor 0.5)', () => {
      setDimensions(750, 1334);
      
      const fontSize = 16;

      expect(Size.scaleFont(fontSize)).toBe(24);
    });
  });
});