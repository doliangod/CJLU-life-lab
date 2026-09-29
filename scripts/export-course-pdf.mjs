import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { directoryHash } from './release-utils.mjs';
import { PDFDocument } from 'pdf-lib';

const url=process.env.COURSE_URL??'http://127.0.0.1:4173';
const output=path.resolve('output/pdf/大学四年人生实验室-课程预览.pdf');
const imageDir=path.resolve('tmp/pdfs/course-pages');
mkdirSync(path.dirname(output),{recursive:true});mkdirSync(imageDir,{recursive:true});
const browser=await chromium.launch({headless:true,...(existsSync(chromium.executablePath())?{}:{channel:'chrome'})});
const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
// A fresh browser context isolates the sample route from the teacher's saved progress.
const answers={participation:[1],'campus-role':[0],priorities:[0,2,3],crisis:[2],interest:[2],'initial-tasks':[0,3],'problem-solving':[0,3,4]};
const manifest=[];
const buildHash=directoryHash(path.resolve('dist'));
try {
 const response=await page.goto(url,{waitUntil:'networkidle'});
 assert.equal(await response.text(),readFileSync('dist/index.html','utf8'),'请从本次dist构建提供PDF导出页面');
 await page.waitForTimeout(1200);
 assert.equal(await page.getByRole('dialog').count(),0,'导出环境不应包含历史授课进度');
 const total=Number((await page.locator('.overall-progress span').innerText()).split('/')[1]);
 for(let number=1;number<=total;number++){
  assert.equal(await page.locator('.overall-progress span').innerText(),`${number} / ${total}`);
  await page.waitForTimeout(1200);
  const classes=(await page.locator('.lab-shell').getAttribute('class')).split(' ');
  const id=classes.find(name=>name.startsWith('page-')).slice(5);
  const title=await page.locator('.step-copy h1').count()?await page.locator('.step-copy h1').innerText():id;
  const file=path.join(imageDir,`page-${String(number).padStart(2,'0')}.png`);
  // Capture choices before answering, while later pages show the stated sample route.
  await page.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();});
  await page.screenshot({path:file});
  manifest.push({page:number,id,title,file:path.basename(file)});
  console.log(`PDF ${number}/${total}: ${id}`);
  if(answers[id]){
   for(const index of answers[id])await page.locator('.audience-options button:not(.confirm-choice)').nth(index).click();
   if(await page.locator('.confirm-choice').count())await page.locator('.confirm-choice').click();
  }
  if(number<total)await page.getByRole('button',{name:'下一阶段',exact:true}).click();
 }
 assert.deepEqual(errors,[]);
 const pdf=await PDFDocument.create();
 pdf.setTitle('大学四年人生实验室 · 计测学院示例 · v1.1.0');
 pdf.setSubject('33页静态预览；互动采用使用说明中列出的示例路线，不代表全部选择组合。');
 for(const entry of manifest){
  const image=await pdf.embedPng(readFileSync(path.join(imageDir,entry.file)));
  pdf.addPage([960,540]).drawImage(image,{x:0,y:0,width:960,height:540});
 }
 const bytes=await pdf.save();
 assert.equal((await PDFDocument.load(bytes)).getPageCount(),total);
 assert.equal(directoryHash(path.resolve('dist')),buildHash,'导出过程中构建发生变化');
 writeFileSync(`${output}.tmp`,bytes);renameSync(`${output}.tmp`,output);
 writeFileSync(path.join(imageDir,'pages.json'),JSON.stringify(manifest,null,2)+'\n');
 writeFileSync(path.join(path.dirname(output),'export-manifest.json'),JSON.stringify({version:'1.1.0',pages:total,buildHash,generatedAt:new Date().toISOString()},null,2)+'\n');
 console.log(`完成：${output}（${total}页）`);
} finally {await browser.close();}
