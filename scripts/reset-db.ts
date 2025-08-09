#!/usr/bin/env ts-node
import { resetDatabase } from "../lib/phraseDb";

const countArg = Number(process.argv[2]);
const count = Number.isFinite(countArg) ? countArg : 300;

resetDatabase(count)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log(`Reset phrase database with ${count} phrases.`);
    process.exit(0);
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to reset database:", err);
    process.exit(1);
  });
