import { Dimensions } from "react-native";

const baseDevice = {
  width: 375,
  height: 812,
};


const _getDimensions = () => {
  const { width, height } = Dimensions.get("window");
  return {
    width,
    height,
    shortDimension: width < height ? width : height,
    longDimension: width > height ? width : height,
  };
};

/**
 * scaleSize
 *
 * @param {number} size - size
 * @returns {number} number of scaleSize
 */
export const scaleSize = (size: number): number => {
  const { shortDimension } = _getDimensions();
  return (size / baseDevice.width) * shortDimension;
};


/**
 * scaleHeight
 *
 * @param {number} size - size
 * @returns {number} number of scaleHeight
 */
export const scaleHeight = (size: number): number => {
  const { longDimension } = _getDimensions();
  return (size / baseDevice.height) * longDimension;
};

/**
 * scaleFont
 *
 * @param {number} size - size
 * @returns {number} number of scaleFont
 */
export const scaleFont = (size: number): number => {
  const { shortDimension } = _getDimensions();
  const scale = shortDimension / baseDevice.width;
  const factor = 0.5;
  return size + (scale * size - size) * factor;
};

export default {
  scaleSize,
  scaleHeight,
  scaleFont,
};