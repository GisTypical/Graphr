/**
 * Function that transforms RGB color format to HEX format,
 * because input type="color" accepts only the prior
 *
 * @param rgb RGB string obtained from the element
 * @returns a string in HEX color format
 */
const rgb2hex = (rgb: string) => {
  // Choose correct separator
  const sep = rgb.indexOf(',') > -1 ? ',' : ' ';
  // Turn "rgb(r,g,b)" into [r,g,b]
  let rgbArray = rgb.substring(4).split(')')[0].split(sep);

  // Turn values of the array into numbers, then parse
  // them to hex and add ceros if lower than 2 chars
  rgbArray = rgbArray.map((color) => (+color).toString(16).padStart(2, '0'));

  return `#${rgbArray.join('')}`;
};

export default rgb2hex;
