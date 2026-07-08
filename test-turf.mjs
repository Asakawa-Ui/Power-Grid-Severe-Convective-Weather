import * as turf from '@turf/turf';
const p = turf.polygon([[[0,0],[0,1],[1,1],[1,0],[0,0]]]);
const m = turf.mask(p);
console.log(m.geometry.coordinates.length);
