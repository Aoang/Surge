import * as build from "./src/mod.ts";

console.log(`Build start`);

await Promise.all(
  Object.entries(build).map(async ([key, val]) => {
    console.log(`Build: ${key}...`);
    await val();
  }),
);

console.log(`Build finished`);
