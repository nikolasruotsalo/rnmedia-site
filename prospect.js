#!/usr/bin/env node
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk/index.js';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function ask(rl, question) {
  const answer = (await rl.question(question)).trim();
  if (!answer) { console.error('Pakollinen kenttä, yritä uudelleen.'); process.exit(1); }
  return answer;
}

async function main() {
  // Accept args from CLI or prompt interactively
  let [businessName, igHandle] = process.argv.slice(2);

  if (!businessName || !igHandle) {
    const rl = readline.createInterface({ input, output });
    if (!businessName) businessName = await ask(rl, 'Yrityksen nimi: ');
    if (!igHandle)     igHandle     = await ask(rl, 'Instagram-tili (@...): ');
    rl.close();
  }

  // Normalise handle
  if (!igHandle.startsWith('@')) igHandle = '@' + igHandle;

  console.log(`\nTutkitaan ${businessName} (${igHandle})…\n`);

  const prompt = `Olet Nikolas Ruotsalo, RN Median perustaja. RN Media on suomalainen sosiaalisen median markkinointitoimisto (rnmedia.fi).

Tehtäväsi: kirjoita lyhyt, henkilökohtainen suomenkielinen yhteydenottosähköposti potentiaaliselle asiakkaalle.

Kohde:
- Yritys: ${businessName}
- Instagram: ${igHandle}

Ohjeet:
1. Aloita analysoimalla, millainen yritys tämä todennäköisesti on (toimiala, koko, tyyli) Instagram-tilin nimen perusteella.
2. Kirjoita sähköposti joka:
   - On max 120 sanaa
   - Alkaa heidän nimellään / yrityksen nimellä, ei "Hei" tai "Hyvä"
   - Mainitsee jonkin yrityksen Instagram-tiliin liittyvän spesifin havainnon (arvaile realistisesti profiilin nimen perusteella)
   - Tarjoaa konkreettisen arvon: miten RN Media voisi auttaa juuri heitä kasvattamaan näkyvyyttä somessa
   - Loppuu selkeään kutsuun: "Soitetaanko nopea 15 minuutin puhelu ensi viikolla?"
   - Allekirjoitettu: Nikolas Ruotsalo / RN Media / 040 XXX XXXX / rnmedia.fi
3. Älä käytä liikaa adjektiiveja tai ylistyssanoja. Pysy asiallisena ja suorana.

Palauta VAIN sähköpostin teksti — ei selityksiä, ei otsikkoa "Analyysi:", pelkkä valmis viesti.`;

  const message = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const email = message.content[0].text.trim();

  console.log('─'.repeat(60));
  console.log(email);
  console.log('─'.repeat(60));
  console.log(`\nTokenit käytetty: ${message.usage.input_tokens} in / ${message.usage.output_tokens} out\n`);
}

main().catch(err => {
  console.error('Virhe:', err.message);
  process.exit(1);
});
