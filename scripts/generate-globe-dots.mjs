// Samples points evenly over a sphere and keeps those that fall on land, so the
// contact globe ships a small list of coordinates instead of a world map.
//
//   node scripts/generate-globe-dots.mjs
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoContains } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const topology = require("world-atlas/land-110m.json");
const land = feature(topology, topology.objects.land);

const SAMPLES = 22000;
const golden = Math.PI * (3 - Math.sqrt(5));
const dots = [];

for (let i = 0; i < SAMPLES; i++) {
  const y = 1 - (i / (SAMPLES - 1)) * 2;
  const theta = golden * i;
  const lat = (Math.asin(y) * 180) / Math.PI;
  const lon = ((((theta * 180) / Math.PI) % 360) + 540) % 360 - 180;
  if (lat < -60) continue; // Antarctica only adds noise at the bottom of the globe.
  if (geoContains(land, [lon, lat])) dots.push(Math.round(lat * 10) / 10, Math.round(lon * 10) / 10);
}

writeFileSync(
  new URL("../components/three/globe-dots.json", import.meta.url),
  JSON.stringify(dots),
);
console.log(`${dots.length / 2} land dots`);
