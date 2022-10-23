#!/usr/bin/env node

import readline from 'readline';
import meow from 'meow';
import { Papago, languages } from 'papago';

const papago = new Papago({
  NAVER_CLIENT_ID: process.env.NAVER_CLIENT_ID,
  NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET,
});

const autoCorrect = (lang) => {
  if (typeof lang !== 'string') return null;
  if (languages[lang]) return lang;
  lang = lang.toLowerCase();
  if (lang === 'zh-cn') return 'zh-CN';
  if (lang === 'zh-tw') return 'zh-TW';
  if (lang === 'cn') return 'zh-CN';
  if (lang === 'tw') return 'zh-TW';
  if (lang === 'jp') return 'ja';
  if (lang === 'kr') return 'ko';
  return lang;
};

const koRegex = /[\uac00-\ud7af]|[\u1100-\u11ff]|[\u3130-\u318f]|[\ua960-\ua97f]|[\ud7b0-\ud7ff]/;

const main = async () => {
  const cli = meow(
    `
  Usage
    $ papago [options] <text>

  Options
    --source,    -s  Source language (default: auto)
    --target,    -t  Target language (default: ko/en)
    --formal,    -f  Use formal language (default: false)
    --noNewLine, -n  Do not print new line (default: false)

  Examples
    $ papago -t ko 'What are you doing?'
    뭐하고 있어?

    $ papago -s en -t ko 'What are you doing?'
    뭐하고 있어?

    $ papago -s en -t ko 'What are you doing?'
    뭐하고 있어요?
`,
    {
      importMeta: import.meta,
      flags: {
        source: {
          alias: 's',
          default: 'auto',
          type: 'string',
        },
        target: {
          alias: 't',
          default: 'ko',
          type: 'string',
        },
        formal: {
          alias: 'f',
          type: 'boolean',
        },
        help: {
          alias: 'h',
          type: 'boolean',
        },
        noNewLine: {
          alias: 'n',
          type: 'boolean',
        },
      },
    }
  );

  const pasrse = (text = '') => {
    text = text?.trim();

    let source = autoCorrect(cli.flags.source ?? null);
    let target = autoCorrect(cli.flags.target ?? null);
    
    if (source === 'auto' || !source) {
      source = koRegex.test(text) ? 'ko' : source;
    }

    if (source === target) {
      target = source === 'ko' ? 'en' : 'ko';
    }

    return {
      text,
      source: source ?? (target === 'en' ? 'ko' : 'en'),
      target: target ?? (source === 'en' ? 'ko' : 'en'),
      honorific: cli.flags.formal ?? false,
    }
  }

  
  if (cli.input.length > 0) {
    const { text, source, target, honorific } = pasrse(cli.input.join(' '));
    const result = await papago.translate(text, { source, target, honorific });
    if (cli.flags.noNewLine) process.stdout.write(result);
    else process.stdout.write(result + '\n');
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  for await (const line of rl) {
    const { text, source, target, honorific } = pasrse(line);
    const result = await papago.translate(text, { source, target, honorific });
    if (cli.flags.noNewLine) process.stdout.write(result);
    else process.stdout.write(result + '\n');
  }

  rl.close();
};

main().catch((error) => {
  console.error('Error:', error?.message || error);
});
