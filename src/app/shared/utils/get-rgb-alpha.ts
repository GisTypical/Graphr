/**
 * Function that separates the Alpha channel of the RGBA string
 *
 * @param rgba rbga string
 * @returns An array of a separated RGB string and a the alpha channel
 */
const separateAlpha = (rgba: string) => {
  // eslint-disable-next-line prefer-const
  let [r, g, b, alpha] = rgba.match(/\d+\.?\d*/gm);

  const rgb = `rgb(${r}, ${g}, ${b})`;
  alpha = alpha ?? '1';

  return [rgb, alpha];
};

export default separateAlpha;
