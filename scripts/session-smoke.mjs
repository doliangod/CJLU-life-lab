import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true,...(existsSync(chromium.executablePath())?{}:{channel:'chrome'})});
const page=await browser.newPage({viewport:{width:1366,height:768}}),url=process.env.COURSE_URL??'http://127.0.0.1:5173';
const key='university-life-lab.progress.v1';
const wait=()=>page.waitForTimeout(600);
const progress=()=>page.locator('.overall-progress span').innerText();
try {
 await page.goto(url);
 // Walk to the first multi-select, with confirmed participation and role choices.
 for(let n=1;n<11;n++){
  await wait();
  if(await page.locator('.audience-options').count())await page.locator('.audience-options button').first().click();
  await page.getByRole('button',{name:'下一阶段',exact:true}).click();
 }
 await wait();
 await page.locator('.audience-options button').nth(0).click();await page.locator('.audience-options button').nth(2).click();
 await page.keyboard.press('t');await page.waitForTimeout(1200);
 const savedBefore=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
 assert.equal(savedBefore.selections['chapter-03/priorities'].length,2);
 await page.reload();await wait();
 assert.match(await page.getByRole('dialog').innerText(),/继续上次的课程/);
 await page.keyboard.press('ArrowRight');await page.keyboard.press('1');assert.equal(await progress(),'1 / 33');
 await page.getByRole('button',{name:'从头开始',exact:true}).click();
 await page.keyboard.press('Escape');assert.match(await page.getByRole('dialog').innerText(),/继续上次的课程/);
 await page.getByRole('button',{name:'继续上次课程',exact:true}).click();await wait();
 assert.equal(await progress(),'11 / 33');assert.equal(await page.locator('.audience-options .selected').count(),2);
 assert.equal(await page.getByRole('button',{name:'下一阶段',exact:true}).isDisabled(),true);
 assert.match(await page.locator('.floating-timer').innerText(),/已暂停/);
 const timer=await page.locator('.floating-timer b').innerText();await page.waitForTimeout(1100);assert.equal(await page.locator('.floating-timer b').innerText(),timer);
 await page.getByRole('button',{name:'继续计时',exact:true}).click();await page.waitForTimeout(1100);assert.notEqual(await page.locator('.floating-timer b').innerText(),timer);
 await page.getByRole('button',{name:'隐藏计时器',exact:true}).click();
 await page.waitForTimeout(1100);await page.getByRole('button',{name:'显示计时器',exact:true}).click();
 assert.match(await page.locator('.floating-timer').innerText(),/计时中/);
 await page.getByRole('button',{name:'暂停计时',exact:true}).click();
 await page.locator('.audience-options button').nth(4).click();await page.keyboard.press('Enter');
 const saved=await page.evaluate(key=>localStorage.getItem(key),key);
 await page.keyboard.press('r');await page.keyboard.press('r');assert.equal(await progress(),'11 / 33');
 // Enter activates the default safe action: Cancel.
 await page.keyboard.press('Enter');assert.equal(await page.getByRole('dialog').count(),0);
 assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),saved);
 await page.getByRole('button',{name:'重置课程',exact:true}).click();await page.getByRole('button',{name:'取消',exact:true}).click();
 assert.equal(await progress(),'11 / 33');
 await page.keyboard.press('r');await page.getByRole('button',{name:'确认重新开始',exact:true}).click();await wait();
 assert.equal(await progress(),'1 / 33');assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),null);
 await page.reload();assert.equal(await page.getByRole('dialog').count(),0);
 await page.evaluate(key=>localStorage.setItem(key,'{broken'),key);await page.reload();await wait();
 assert.equal(await progress(),'1 / 33');assert.match(await page.locator('.session-status').innerText(),/无法恢复/);
 const isolated=await browser.newContext();
 await isolated.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new DOMException('blocked','SecurityError');};});
 const noStorage=await isolated.newPage();await noStorage.goto(url);await noStorage.getByRole('button',{name:'下一阶段',exact:true}).click();await noStorage.waitForTimeout(500);
 assert.equal(await noStorage.locator('.overall-progress span').innerText(),'2 / 33');assert.match(await noStorage.locator('.session-status').innerText(),/无法保存/);
 await isolated.close();
 console.log('通过：浏览器刷新恢复、草稿保留、计时暂停/继续、重置取消/确认、损坏存档和存储不可用降级。');
} finally {await browser.close();}
