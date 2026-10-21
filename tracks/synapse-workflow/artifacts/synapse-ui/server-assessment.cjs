const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname;
http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 const relative=pathname.startsWith('/references/')?pathname.slice(1):'assessment.html';
 const file=path.resolve(root,relative);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found')}res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':file.endsWith('.jpg')?'image/jpeg':'image/png');res.setHeader('Cache-Control','no-store');res.end(data)})
}).listen(65192,'127.0.0.1',()=>console.log('http://127.0.0.1:65192'));
