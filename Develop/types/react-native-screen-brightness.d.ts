declare module 'react-native-screen-brightness' {
          export function setBrightness(brightness: number): void;
          export function getBrightness(): Promise<number>;
}