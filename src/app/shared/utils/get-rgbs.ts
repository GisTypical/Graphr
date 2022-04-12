import rgb2hex from './rgb2hex';

/**
 * Function that return the two colors of the linear gradient
 *
 * @param linearGradient linear gradient
 * @returns An array of rgb strings
 */
const getRgbs = (linearGradient: string) => {
  const rgbArray = linearGradient.match(/rgb(a)?\(\d{1,3}, \d{1,3}, \d{1,3}(, \d+\.?\d*)?\)/gm);

  return rgbArray;
};

export default getRgbs;
