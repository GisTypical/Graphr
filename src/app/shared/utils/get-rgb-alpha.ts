const getRgbAlpha = (rgba: string) => {
  // eslint-disable-next-line prefer-const
  let [r, g, b, alpha] = rgba.match(/\d+\.?\d*/gm);

  const rgb = `rgb(${r}, ${g}, ${b})`;
  alpha = alpha ?? '1';

  return [rgb, alpha];
};

export default getRgbAlpha;
