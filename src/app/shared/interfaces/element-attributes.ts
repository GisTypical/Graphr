export default interface ElementAttributes {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  borderRadius: number;
  color: string;
  bgColor: string;
  hasFill: boolean;
  opacity: number;
  zIndex: number;
  // Border Attributes
  borderColor: string;
  borderStyle: string;
  hasBorder: boolean;
  borderWidth: number;
  // Shadow attributes
  hasBoxShadow: boolean;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowColor: string;
  shadowOpacity: string;
  shadowAlpha: number;
  // Blur
  hasBlur: boolean;
  blur: number;
}
