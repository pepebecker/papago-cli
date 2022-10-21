#!/usr/bin/env node

const readline = require('readline');
const minimist = require('minimist');
const { Papago, languages } = require('papago');

const papago = new Papago({
  NAVER_CLIENT_ID: process.env.NAVER_CLIENT_ID,
  NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET,
});

const argv = minimist(process.argv.slice(2), { boolean: true });

const autoCorrect = (lang) => {
  if (typeof lang !== 'string') return null;
  if (languages[lang]) return lang;
  lang = lang.toLowerCase()
  if (lang === 'zh-cn') return 'zh-CN';
  if (lang === 'zh-tw') return 'zh-TW';
  if (lang === 'cn') return 'zh-CN';
  if (lang === 'tw') return 'zh-TW';
  if (lang === 'jp') return 'ja';
  if (lang === 'kr') return 'ko';
  return lang;
}

const main = async () => {
  let source = autoCorrect(argv.source ?? argv.s ?? null)
  let target = autoCorrect(argv.target ?? argv.t ?? null)
  let honorific = argv.formal ?? argv.f ?? false

  if (source === null) {
    // en -> *
    if (argv.enes) source = 'en'    // en -> es
    if (argv.enja) source = 'en'    // en -> ja
    if (argv.enko) source = 'en'    // en -> ko
    if (argv.entw) source = 'en'    // en -> tw
    if (argv.encn) source = 'en'    // en -> cn
    
    // ja -> *
    if (argv.jaen) source = 'ja'    // ja -> en
    if (argv.jaes) source = 'ja'    // ja -> es
    if (argv.jako) source = 'ja'    // ja -> ko
    if (argv.jatw) source = 'ja'    // ja -> tw
    if (argv.jacn) source = 'ja'    // ja -> cn
    
    // ko -> *
    if (argv.koen) source = 'ko'    // ko -> en
    if (argv.koes) source = 'ko'    // ko -> es
    if (argv.koja) source = 'ko'    // ko -> ja
    if (argv.kotw) source = 'ko'    // ko -> tw
    if (argv.kocn) source = 'ko'    // ko -> cn
    
    // cn -> *
    if (argv.cnen) source = 'zh-CN' // cn -> en
    if (argv.cnes) source = 'zh-CN' // cn -> es
    if (argv.cnja) source = 'zh-CN' // cn -> ja
    if (argv.cnko) source = 'zh-CN' // cn -> ko
    if (argv.cntw) source = 'zh-CN' // cn -> tw

    // tw -> *
    if (argv.twen) source = 'zh-TW' // tw -> en
    if (argv.twen) source = 'zh-TW' // tw -> es
    if (argv.twja) source = 'zh-TW' // tw -> ja
    if (argv.twko) source = 'zh-TW' // tw -> ko
    if (argv.twcn) source = 'zh-TW' // tw -> cn
  }

  if (target === null) {
    // en -> *
    if (argv.enes) target = 'es'    // en -> es
    if (argv.enja) target = 'ja'    // en -> ja
    if (argv.enko) target = 'ko'    // en -> ko
    if (argv.entw) target = 'zh-TW' // en -> tw
    if (argv.encn) target = 'zh-CN' // en -> cn

    // ja -> *
    if (argv.jaen) target = 'en'    // ja -> en
    if (argv.jaes) target = 'es'    // ja -> es
    if (argv.jako) target = 'ko'    // ja -> ko
    if (argv.jatw) target = 'zh-TW' // ja -> tw
    if (argv.jacn) target = 'zh-CN' // ja -> cn

    // ko -> *
    if (argv.koen) target = 'en'    // ko -> en
    if (argv.koes) target = 'es'    // ko -> es
    if (argv.koja) target = 'ja'    // ko -> ja
    if (argv.kotw) target = 'zh-TW' // ko -> tw
    if (argv.kocn) target = 'zh-CN' // ko -> cn

    // cn -> *
    if (argv.cnen) target = 'en'    // cn -> en
    if (argv.cnes) target = 'es'    // cn -> es
    if (argv.cnja) target = 'ja'    // cn -> ja
    if (argv.cnko) target = 'ko'    // cn -> ko
    if (argv.cntw) target = 'zh-TW' // cn -> tw

    // tw -> *
    if (argv.twen) target = 'en'    // tw -> en
    if (argv.twen) target = 'es'    // tw -> es
    if (argv.twja) target = 'ja'    // tw -> ja
    if (argv.twko) target = 'ko'    // tw -> ko
    if (argv.twcn) target = 'zh-CN' // tw -> cn
  }

  source = source ?? (target === 'en' ? 'ko' : 'en')
  target = target ?? (source === 'en' ? 'ko' : 'en')

  if (argv._.length > 0) {
    const term = argv._.join(' ')?.trim();
    const result = await papago.translate(term, { source, target, honorific });
    process.stdout.write(result + '\n');
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  for await (const line of rl) {
    const result = await papago.translate(line?.trim(), { source, target, honorific });
    if (argv.n) process.stdout.write(result);
    else process.stdout.write(result + '\n');
  }

  rl.close();
};

main().catch(error => {
  console.error('Error:', error?.message || error);
});
