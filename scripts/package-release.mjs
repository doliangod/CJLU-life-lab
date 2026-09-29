import assert from 'node:assert/strict';
import { cpSync,existsSync,mkdirSync,readFileSync,writeFileSync,chmodSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { directoryHash,fileList } from './release-utils.mjs';
const pkg=JSON.parse(readFileSync('package.json','utf8')),version=pkg.version;
const root=path.resolve('release'),name=`大学四年人生实验室-v${version}`;
const teaching=path.join(root,`${name}-教学发布包`),source=path.join(root,`${name}-源码包`),web=path.join(root,`${name}-网页部署包`);
for(const target of [teaching,source,web])assert.ok(!existsSync(target),`发布目录已存在，先移走旧版本再重新打包：${target}`);
const pdf='output/pdf/大学四年人生实验室-课程预览.pdf';
const pdfManifest=JSON.parse(readFileSync('output/pdf/export-manifest.json','utf8'));
assert.equal(pdfManifest.version,version);assert.equal(pdfManifest.pages,33);
assert.equal(pdfManifest.buildHash,directoryHash('dist'),'PDF不是当前构建导出的版本');
mkdirSync(root,{recursive:true});mkdirSync(teaching);mkdirSync(source);
cpSync('dist',path.join(teaching,'site'),{recursive:true});cpSync('dist',web,{recursive:true});
cpSync('scripts/serve-release.mjs',path.join(teaching,'serve.mjs'));
cpSync('docs/教师使用说明.md',path.join(teaching,'教师使用说明.md'));
cpSync(pdf,path.join(teaching,'课程预览.pdf'));
writeFileSync(path.join(teaching,'启动课件-Windows.cmd'),'@echo off\r\ncd /d "%~dp0"\r\nwhere node >nul 2>nul\r\nif errorlevel 1 (\r\n  echo Please install Node.js 24 or newer, then run this file again.\r\n  pause\r\n  exit /b 1\r\n)\r\necho Open http://127.0.0.1:4173 in your browser.\r\nnode serve.mjs\r\npause\r\n');
writeFileSync(path.join(teaching,'启动课件-macOS.command'),'#!/bin/sh\ncd "$(dirname "$0")" || exit 1\nif ! command -v node >/dev/null 2>&1; then\n  echo "Please install Node.js 24 or newer, then try again."\n  read -r reply\n  exit 1\nfi\nnode serve.mjs\n');
chmodSync(path.join(teaching,'启动课件-macOS.command'),0o755);
const licenses=[];
for(const dependency of ['react','react-dom','scheduler','framer-motion','motion-dom','motion-utils','lucide-react','zustand']){
 const directory=path.join('node_modules',dependency);
 if(!existsSync(directory))continue;
 const info=JSON.parse(readFileSync(path.join(directory,'package.json'),'utf8'));
 const license=['LICENSE','LICENSE.md','LICENSE.txt'].find(file=>existsSync(path.join(directory,file)));
 assert.ok(license,`未找到 ${dependency} 的许可文件`);
 licenses.push(`${dependency} ${info.version}\n${readFileSync(path.join(directory,license),'utf8')}`);
}
writeFileSync(path.join(teaching,'第三方许可.txt'),licenses.join('\n\n--------------------------------\n\n'));
cpSync(path.join(teaching,'第三方许可.txt'),path.join(web,'第三方许可.txt'));
const sources=['src','scripts','docs','public','package.json','package-lock.json','README.md','index.html','vite.config.ts','eslint.config.js','tsconfig.json','tsconfig.app.json','tsconfig.node.json','.gitignore'];
for(const file of sources)if(existsSync(file))cpSync(file,path.join(source,file),{recursive:true});
const manifest={version,generatedAt:new Date().toISOString(),pages:33,interactions:7,suggestedMinutes:22,buildHash:pdfManifest.buildHash,
 pdfSha256:createHash('sha256').update(readFileSync(pdf)).digest('hex')};
for(const directory of [teaching,web,source]){
 writeFileSync(path.join(directory,'VERSION.json'),JSON.stringify(manifest,null,2)+'\n');
 const hashes=fileList(directory).map(file=>`${createHash('sha256').update(readFileSync(path.join(directory,file))).digest('hex')}  ${file.replaceAll(path.sep,'/')}`);
 writeFileSync(path.join(directory,'SHA256SUMS.txt'),hashes.join('\n')+'\n');
 const archive=`${directory}.zip`;
 if(process.platform==='win32'){
  const quote=value=>`'${value.replaceAll("'","''")}'`;
  execFileSync('powershell',['-NoProfile','-Command',`Compress-Archive -Path ${quote(path.join(directory,'*'))} -DestinationPath ${quote(archive)}`]);
 } else {
  execFileSync('zip',['-qr',archive,'.'],{cwd:directory});
  // macOS zip writes UTF-8 names without the UTF-8 flag. Mark both headers
  // so Windows and standard ZIP readers preserve Chinese filenames.
  const bytes=readFileSync(archive);
  let end=bytes.length-22;
  while(end>=0&&bytes.readUInt32LE(end)!==0x06054b50)end--;
  assert.ok(end>=0,'ZIP目录缺失');
  let offset=bytes.readUInt32LE(end+16);
  const entries=bytes.readUInt16LE(end+10);
  for(let index=0;index<entries;index++){
   assert.equal(bytes.readUInt32LE(offset),0x02014b50);
   const length=bytes.readUInt16LE(offset+28);
   const filename=bytes.subarray(offset+46,offset+46+length);
   assert.ok(Buffer.from(filename.toString('utf8')).equals(filename),'ZIP文件名不是UTF-8');
   bytes.writeUInt16LE(bytes.readUInt16LE(offset+8)|0x800,offset+8);
   const local=bytes.readUInt32LE(offset+42);
   assert.equal(bytes.readUInt32LE(local),0x04034b50);
   bytes.writeUInt16LE(bytes.readUInt16LE(local+6)|0x800,local+6);
   offset+=46+length+bytes.readUInt16LE(offset+30)+bytes.readUInt16LE(offset+32);
  }
  writeFileSync(archive,bytes);
 }
 console.log(archive);
}
writeFileSync(path.join(root,'发布清单.json'),JSON.stringify(manifest,null,2)+'\n');
