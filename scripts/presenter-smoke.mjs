import assert from 'node:assert/strict';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.COURSE_URL ?? 'http://127.0.0.1:5173';
const screenshots = mkdtempSync(path.join(tmpdir(), 'life-lab-presenter-'));
const browser = await chromium.launch({ headless: true, ...(existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' }) });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
page.setDefaultTimeout(6000);
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const progress = () => page.locator('.overall-progress span').innerText();
const settle = () => page.waitForTimeout(650);
const gotoStep = async id => {
  const target = await page.evaluate(async id => {
    const { course } = await import('/src/data/course.ts');
    return course.flatMap(unit => unit.subSteps).findIndex(step => step.id === id) + 1;
  }, id);
  assert.ok(target > 0, `Unknown scene: ${id}`);
  const current = Number((await progress()).split('/')[0].trim());
  for (let count = 0; count < Math.abs(target - current); count++) {
    await page.keyboard.press(target > current ? 'ArrowRight' : 'ArrowLeft');
  }
  await settle();
  assert.equal(await progress(), `${target} / 33`);
};
const option = index => page.locator('.audience-options button:not(.confirm-choice)').nth(index);
const next = async () => { await page.getByRole('button', { name: '下一阶段', exact: true }).click(); await settle(); };
const screenshot = async name => page.screenshot({ path: path.join(screenshots, `${name}.png`) });
try {
  await page.goto(baseUrl);
  assert.equal(await page.getByRole('button',{name:'上一步',exact:true}).isDisabled(),true);
  // Observe transition frames, not just screenshots after animations settle.
  await page.evaluate(() => {
    window.transitionErrors = [];
    const inspect = () => {
      const shell = document.querySelector('.lab-shell');
      if (shell) {
        const id = [...shell.classList].find(name => name.startsWith('page-'))?.slice(5);
        const stages = [...shell.querySelectorAll('.step-stage')];
        if (stages.length !== 1 || stages[0]?.getAttribute('data-step-id') !== id) {
          window.transitionErrors.push({id, stages: stages.map(stage => stage.getAttribute('data-step-id'))});
        }
      }
      requestAnimationFrame(inspect);
    };
    requestAnimationFrame(inspect);
  });
  await next();
  await page.keyboard.press('ArrowRight'); await settle();
  assert.equal(await progress(), '3 / 33', '鼠标翻页后方向键失效');
  await page.keyboard.press('Space'); await settle();
  assert.equal(await progress(), '4 / 33', '焦点按钮导致空格重复翻页或失效');
  await page.keyboard.press('p');
  assert.equal(await page.locator('.speaker-notes').count(), 1);
  assert.match(await page.locator('.speaker-notes').innerText(), /按 Space 进入2026/);
  await page.keyboard.press('ArrowRight'); await settle();
  assert.match(await page.locator('.speaker-notes').innerText(), /陌生阶段/);
  await page.getByRole('button', { name: '关闭讲师提示', exact: true }).click();
  await page.getByRole('button', { name: '讲师提示', exact: true }).click();
  assert.equal(await page.locator('.speaker-notes').count(), 1);
  await page.keyboard.press('p');
  assert.equal(await page.locator('.speaker-notes').count(), 0);

  await page.getByRole('button', { name: '快捷键帮助', exact: true }).click();
  const beforeHelp = await progress();
  for (const key of ['ArrowLeft', 'ArrowRight', '1', 'r', 'p', 't']) await page.keyboard.press(key);
  assert.equal(await progress(), beforeHelp, '帮助弹窗穿透操作');
  assert.equal(await page.getByRole('dialog').count(), 1);
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), '关闭帮助');
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.keyboard.press('h');
  await page.keyboard.press('Space'); // Native activation closes the focused close button only.
  assert.equal(await progress(), beforeHelp);
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.keyboard.press('r');
  await page.getByRole('button',{name:'确认重新开始',exact:true}).click(); await settle();

  const choices = { participation:[1], 'campus-role':[0], priorities:[0,2,3], crisis:[0], interest:[0], 'initial-tasks':[0,3], 'problem-solving':[0,3,4] };
  for (let current = 1; current <= 33; current++) {
    assert.equal(await progress(), `${current} / 33`);
    const classes = (await page.locator('.lab-shell').getAttribute('class')).split(' ');
    for (const [id, indices] of Object.entries(choices)) if (classes.includes(`page-${id}`)) {
      for (const index of indices) await option(index).click();
      if (await page.locator('.confirm-choice').count()) {
        await page.keyboard.press('Enter'); // Must confirm even after clicking an option.
        assert.equal(await page.locator('.confirm-choice').count(), 0);
      }
      await settle();
      if (id === 'participation') {
        await page.getByRole('button', { name:'重新选择', exact:true }).click();
        assert.equal(await page.getByRole('button',{name:'下一阶段',exact:true}).isDisabled(),true);
        await page.keyboard.press('4');
        assert.match(await page.locator('.audience-options .selected').innerText(), /暂时不参加/);
      }
      if (id === 'crisis') {
        const timeline = await page.locator('.crisis-timeline').innerText();
        assert.match(timeline,/18:50/); assert.match(timeline,/18:40/);
        assert.doesNotMatch(timeline,/原计划开始/);
      }
    }
    if (classes.includes('page-recap')) assert.match(await page.locator('.lead-lines').innerText(),/沟通、协调、表达、时间管理/);
    if (classes.includes('page-solution')) {
      assert.deepEqual(await page.locator('.chosen-methods [data-choice]').evaluateAll(elements => elements.map(e => e.dataset.choice)), ['repeat','teacher','team']);
      assert.doesNotMatch(await page.locator('.chosen-methods').innerText(),/AI/);
      await screenshot('chosen-route');
      await page.getByRole('button',{name:'查看教师参考方法',exact:true}).click();
      assert.match(await page.locator('.personal-solution').innerText(),/不代表你已经选择/);
      assert.match(await page.locator('.reference-methods').innerText(),/AI/);
      await screenshot('reference-route');
      await page.getByRole('button',{name:'返回本次选择',exact:true}).click();
    }
    if (classes.includes('page-project-recap')) assert.doesNotMatch(await page.locator('.project-recap-grid').innerText(),/AI/);
    if (classes.includes('page-countdown')) {
      assert.match(await page.locator('.countdown-scene').innerText(),/1460/);
      assert.match(await page.locator('.countdown-scene').innerText(),/秋招求职简历生成中/);
      assert.equal(await page.locator('.current-year').innerText(),'2029');
      await page.waitForFunction(()=>getComputedStyle(document.querySelector('.current-year')).opacity==='1');
      assert.equal(await page.locator('.current-year').evaluate(el=>Number(getComputedStyle(el).opacity)),1);
      await screenshot('countdown');
    }
    if (classes.includes('page-resume')) assert.doesNotMatch(await page.locator('.learning-resume').innerText(),/AI/);
    if(current===33){assert.equal(await page.getByRole('button',{name:'下一阶段',exact:true}).isDisabled(),true);assert.equal(await page.locator('.closing-actions article').count(),4);}
    if (current < 33) await next();
  }
  // Revise a completed multi-select using real clicks, then inspect its later pages.
  await gotoStep('problem-solving');
  await page.getByRole('button',{name:'重新选择',exact:true}).click();
  for (const index of [0,3,4]) await option(index).click();
  for (const index of [1,2,5]) await option(index).click();
  await page.keyboard.press('Enter'); await page.keyboard.press('Space'); await settle();
  assert.match(await page.locator('.chosen-methods').innerText(), /AI/);
  assert.match(await page.locator('.project-bridge').innerText(), /不表示你的换题方案已实施/);
  await next();
  assert.match(await page.locator('.project-bridge').innerText(), /换题/);
  await gotoStep('resume');
  const resume = await page.locator('.learning-resume').innerText();
  assert.match(resume,/AI/); assert.match(resume,/重新评估题目/); assert.doesNotMatch(resume,/重复实验确认/);

  // Check the changed scenes at both supported classroom resolutions.
  for (const [width,height] of [[1366,768],[1920,1080]]) {
    await page.setViewportSize({width,height});
    for (const id of ['dorm','recap','interest','solution','formation','project-recap','countdown','resume','back-to-2026','thirty-days']) {
      await gotoStep(id);
      const overflow = await page.locator('.step-stage').evaluate(stage=>{
        const top=document.querySelector('.lab-header').getBoundingClientRect().bottom;
        const bottom=document.querySelector('.lab-footer').getBoundingClientRect().top;
        return [...stage.querySelectorAll('h1,p,button,strong,small,span')].filter(el=>{
          const r=el.getBoundingClientRect();return r.width&&r.height&&(r.top<top-1||r.bottom>bottom+1||r.left<0||r.right>innerWidth+1);
        }).map(el=>el.textContent.slice(0,60));
      });
      assert.deepEqual(overflow,[], `${width} ${id} 内容越界`);
      if(id==='resume')assert.ok(await page.locator('.learning-resume').evaluate(el=>el.scrollHeight<=el.clientHeight+1),`${width} 简历正文被裁切`);
      await screenshot(`${width}-${id}`);
    }
  }
  assert.deepEqual(errors,[],'浏览器运行错误');
  assert.deepEqual(await page.evaluate(() => window.transitionErrors), [], '翻页期间旧内容残留或页面布局与正文不同步');
  console.log(`通过：33页、鼠标与键盘混用、讲师提示、帮助隔离、单选/多选改选、过程与简历一致、两种大屏尺寸。截图：${screenshots}`);
} finally {
  await browser.close();
}
