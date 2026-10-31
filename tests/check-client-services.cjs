const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {loadSiteData} = require('./validate-site-data.cjs');
const data = loadSiteData('site-data.js');
const window = {TANEM_SITE_DATA:data};
vm.runInNewContext(fs.readFileSync('site-services.js','utf8'),{window});
const view = window.TANEM_SERVICES;
assert.equal(view.normalizePrice('от 500 до 1 000 ₽'), '500–1 000 ₽');
assert.equal(view.normalizePrice('от 500 ₽'), 'от 500 ₽');
assert.equal(view.duration('90 мин','ru'),'1,5 ч');
const service = {id:'test',title:{ru:'Маникюр /обрезной/'},price:{ru:'600 ₽'},description:{ru:'Мастер: 600 ₽; ТОП мастер: 600 ₽; Индивидуальный уход.'},variants:[{label:{ru:'Мастер'},price:{ru:'600 ₽'}},{label:{ru:'ТОП мастер'},price:{ru:'600 ₽'}}]};
assert.equal(view.description(service,'ru'),'Индивидуальный уход.');
for (const layout of ['desktop','mobile']) {
  const html=view.render(service,layout,'ru');
  assert.equal((html.match(/<dt>/g)||[]).length,2);
  assert.equal((html.match(/<dd>/g)||[]).length,2);
  assert.match(html,/is-tariff-description/);
  assert.match(html,/hidden>Индивидуальный уход\./);
  assert.match(html,/tanem-service-price">/);
  assert.doesNotMatch(html,/Мастер: 600 ₽/);
  for (const item of data.services) {
    const rendered=view.render(item,layout,'ru');
    assert.ok(rendered.includes('tanem-service-book'));
    assert.ok(!rendered.includes('undefined'));
  }
}
console.log('PASS: client service ranges, tariff deduplication, prose preservation and both renderers');
