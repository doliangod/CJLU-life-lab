import { readdirSync,readFileSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
export function fileList(root,relative='') {
 return readdirSync(path.join(root,relative),{withFileTypes:true}).flatMap(entry=>{
  const name=path.join(relative,entry.name);return entry.isDirectory()?fileList(root,name):[name];
 }).sort();
}
export function directoryHash(root) {
 const hash=createHash('sha256');for(const file of fileList(root))hash.update(file.replaceAll(path.sep,'/')).update(readFileSync(path.join(root,file)));return hash.digest('hex');
}
