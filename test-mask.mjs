import * as turf from '@turf/turf';
import fs from 'fs';
const data = JSON.parse(fs.readFileSync('public/geo/420000.json', 'utf8'));
const provinceFeature = data.features[0];
const masked = turf.mask(provinceFeature);
console.log(masked.geometry.coordinates.length);
