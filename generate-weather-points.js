const fs = require('fs');

const substations = [
  { coord: [110.4, 32.7], name: '十堰变电站' },
  { coord: [112.0, 31.2], name: '襄阳变电站' },
  { coord: [113.5, 30.8], name: '荆门变电站' },
  { coord: [114.5, 30.2], name: '武汉北变电站' },
  { coord: [109.5, 29.8], name: '恩施变电站' },
  { coord: [111.2, 30.6], name: '宜昌变电站' },
  { coord: [112.4, 30.3], name: '荆州变电站' },
  { coord: [114.1, 29.6], name: '咸宁变电站' }
];

const types = ['rocket', 'gun'];
const mobilities = ['fixed', 'temporary', 'mobile'];
const statuses = ['none', 'ready', 'operating', 'completed', 'canceled'];

const points = [];

// Generate 20 points around substations
for (let i = 0; i < 20; i++) {
  const sub = substations[i % substations.length];
  // Add some random offset (approx 5-20km, roughly 0.05 to 0.2 degrees)
  const angle = Math.random() * Math.PI * 2;
  const distance = 0.05 + Math.random() * 0.15;
  const coord = [
    sub.coord[0] + Math.cos(angle) * distance,
    sub.coord[1] + Math.sin(angle) * distance
  ];
  
  const type = types[Math.floor(Math.random() * types.length)];
  const mobility = mobilities[Math.floor(Math.random() * mobilities.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  points.push({
    id: `wp-${i+1}`,
    name: `${sub.name.replace('变电站', '')}周边${mobility === 'fixed' ? '固定' : (mobility === 'temporary' ? '临时' : '移动')}${type === 'rocket' ? '火箭' : '高炮'}点`,
    coord: [Math.round(coord[0]*10000)/10000, Math.round(coord[1]*10000)/10000],
    type,
    mobility,
    status
  });
}

// Add 1 mobile vehicle
const sub = substations[Math.floor(Math.random() * substations.length)];
points.push({
  id: `wp-vehicle-1`,
  name: `${sub.name.replace('变电站', '')}移动作业车`,
  coord: [
    Math.round((sub.coord[0] + 0.1) * 10000) / 10000, 
    Math.round((sub.coord[1] - 0.1) * 10000) / 10000
  ],
  type: 'vehicle',
  mobility: 'mobile',
  status: 'operating'
});

const tsContent = `export type WeatherPointStatus = 'none' | 'ready' | 'operating' | 'completed' | 'canceled';
export type WeatherPointType = 'rocket' | 'gun' | 'vehicle';
export type WeatherPointMobility = 'fixed' | 'temporary' | 'mobile';

export interface WeatherPoint {
  id: string;
  name: string;
  coord: [number, number];
  type: WeatherPointType;
  mobility: WeatherPointMobility;
  status: WeatherPointStatus;
}

export const weatherPoints: WeatherPoint[] = ${JSON.stringify(points, null, 2)};
`;

fs.writeFileSync('src/utils/weatherPoints.ts', tsContent);
console.log('done');
