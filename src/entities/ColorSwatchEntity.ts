import { ColorFormat } from './ColorRampEntity';

export interface ColorSwatch {
  color: string;
  colorFormat: ColorFormat;
  index: number;
  locked?: boolean;
} 