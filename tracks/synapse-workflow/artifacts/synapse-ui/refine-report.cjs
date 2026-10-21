const fs=require('fs'),p=__dirname+'/report.html';
let s=fs.readFileSync(p,'utf8');
s=s.replace("let chapters=['What we examined'","let chapters=['Assessment summary'")
 .replace('We examined the boundary between customer accounts.','Invoice access crosses company boundaries.')
 .replace('The assessment followed invoice access and order approval using supplied customer roles.','A customer account retrieved two invoices from another company. Order approval remains an open question.');
s=s.replace('</style>',`p{color:#67778f}small{color:#7b8ca5}.fine{color:#8596af}.chapter-nav button{color:#8092ae}.screen .datarow{color:#7d92b0}.invoice .who{color:#8599b6}.mapcanvas-inner{position:relative;width:100%;height:100%}.insight .pill{align-self:flex-start}@media(max-width:760px){.mapcanvas-inner{width:520px;height:340px}.mapcanvas .edge{top:174px!important}}@media(min-width:1600px){.mapnode.n0,.mapnode.n1{top:145px}.mapnode.n2{top:60px}.mapnode.n3{top:260px}}</style>`);
fs.writeFileSync(p,s);
