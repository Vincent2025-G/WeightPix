declare module 'react-native-echarts-wrapper' {
  import * as React from 'react';
  import { ViewStyle } from 'react-native';

  export interface EChartsProps {
    option: object;
    backgroundColor?: string;
    onData?: (data: any) => void;
    onLoadEnd?: () => void;
    onPress?: () => void;
    onLayout?: () => void;
    style?: ViewStyle;
  }
  
  const ECharts: React.FC<EChartsProps>;
  export default ECharts;
}