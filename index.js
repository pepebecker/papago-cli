#!/usr/bin/env node
const fs = require('fs');
const readline = require('readline');
const minimist = require('minimist');
const Papago = require('papago');

const papago = new Papago({
  NAVER_CLIENT_ID: process.env.NAVER_CLIENT_ID,
  NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET,
});

const argv = minimist(process.argv.slice(2), { boolean: true });

const main = async () => {
  const enko = argv.enko || argv.e;

  if (argv._.length > 0) {
    const term = argv._.join(' ')?.trim();
    const result = await papago.translate(term, enko);
    process.stdout.write(result + '\n');
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  for await (const line of rl) {
    const result = await papago.translate(line?.trim(), enko);
    process.stdout.write(result);
  }

  rl.close();
};

main().catch(error => {
  console.error('Error:', error?.message || error);
});
