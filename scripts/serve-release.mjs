import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(process.env.COURSE_SITE_DIR??path.join(path.dirname(fileURLToPath(import.meta.url)),'site'));
const port=Number(process.env.PORT??4173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon'};
const server=createServer(async(request,response)=>{
 try {
  if(!['GET','HEAD'].includes(request.method)){response.writeHead(405);response.end();return;}
  const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);
  let file=path.resolve(root,`.${pathname}`);
  if(file!==root&&!file.startsWith(root+path.sep)){response.writeHead(403);response.end();return;}
  if((await stat(file)).isDirectory())file=path.join(file,'index.html');
  const bytes=await readFile(file);
  response.writeHead(200,{'Content-Type':mime[path.extname(file)]??'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
  response.end(request.method==='HEAD'?undefined:bytes);
 } catch {response.writeHead(404);response.end('Not found');}
});
server.on('error',error=>{console.error(`无法启动课件：${error.message}\n请确认端口 ${port} 未被占用。`);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`大学四年人生实验室\n浏览器打开：http://127.0.0.1:${port}\n授课时保留此窗口；结束后按 Ctrl+C 关闭。`));
