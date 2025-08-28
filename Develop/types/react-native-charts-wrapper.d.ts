declare module 'react-native-charts-wrapper' {
    import { Component } from 'react';
    import { ScaledSize, ViewStyle } from 'react-native';

    export interface VisibleRange {
    x?: {
      min?: number;
      max?: number;
    };
    y?: {
      min?: number;
      max?: number;
    };
  }

    
  
    interface BaseChartProps {
      style?: any;
      data?: any;
      xAxis?: any;
      yAxis?: any;
      legend?: any;
      marker?: any;
      animation?: any;
      chartDescription?: any;
      touchEnabled?: boolean;
      dragEnabled?: boolean;
      scaleEnabled?: boolean;
      scaleXEnabled?: boolean;
      scaleYEnabled?: boolean;
      pinchZoom?: boolean;
      doubleTapToZoomEnabled?: boolean;
      dragDecelerationEnabled?: boolean;
      dragDecelerationFrictionCoef?: number;
      keepPositionOnRotation?: boolean;
      onSelect?: (event: any) => void;
      onChange?: (event: any) => void;
      moveToX?: (value: number) => void;
      visibleRange?: VisibleRange;
      chartGestureListener?: any;
    }
  
    export class LineChart extends Component<BaseChartProps> {}
    export class BarChart extends Component<BaseChartProps> {}
    export class PieChart extends Component<BaseChartProps> {}
    export class RadarChart extends Component<BaseChartProps> {}
    export class BubbleChart extends Component<BaseChartProps> {}
    export class ScatterChart extends Component<BaseChartProps> {}
    export class CandleStickChart extends Component<BaseChartProps> {}
    export class CombinedChart extends Component<BaseChartProps> {}
    
  }
  