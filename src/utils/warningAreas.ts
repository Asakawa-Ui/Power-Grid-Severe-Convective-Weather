export type WarningLevel = 'red' | 'orange' | 'yellow';

export interface WarningArea {
  id: string;
  name: string;
  level: WarningLevel;
  region: string;
  polygon: [number, number][]; // outer ring
}

export const warningAreas: WarningArea[] = [
  {
    id: 'wa-1',
    name: '襄阳-十堰橙色预警区',
    level: 'orange',
    region: '湖北地块',
    polygon: [
      [110.0, 32.5],
      [111.5, 32.8],
      [112.5, 32.0],
      [112.0, 31.5],
      [110.5, 31.8],
      [110.0, 32.5]
    ]
  },
  {
    id: 'wa-2',
    name: '武汉周边红色预警区',
    level: 'red',
    region: '湖北地块',
    polygon: [
      [113.8, 30.5],
      [114.5, 31.0],
      [115.0, 30.6],
      [114.6, 29.8],
      [113.9, 30.0],
      [113.8, 30.5]
    ]
  },
  {
    id: 'wa-3',
    name: '恩施黄色预警区',
    level: 'yellow',
    region: '湖北地块',
    polygon: [
      [108.8, 30.2],
      [109.8, 30.5],
      [110.3, 29.8],
      [109.5, 29.2],
      [108.7, 29.6],
      [108.8, 30.2]
    ]
  }
];
