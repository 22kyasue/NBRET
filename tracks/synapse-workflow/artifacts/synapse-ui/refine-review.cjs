const fs=require('fs'),p=__dirname+'/report.html';
let s=fs.readFileSync(p,'utf8');
s=s.replace('<button data-mode="brief">','<button data-mode="brief">');
s=s.replace('<span>Report concepts</span>','<span>Choose a report direction</span>');
s=s.replace('A customer account retrieved two invoices from another company. Order approval remains an open question.','A customer account retrieved two invoices from another company. This is significant because billing data crossed a company boundary; wider reach is not established. Order approval remains an open question.');
s=s.replace('<div class="map-bottom"><button data-modal="repair">','<div class="map-summary"><p><b>Significance:</b> Billing data crossed a company boundary. Wider reach is not established.</p><p><b>Also investigated:</b> Order approval after an edit remains an unconfirmed lead.</p></div><div class="map-bottom"><button data-modal="repair">');
s=s.replace('Billing details crossed a company boundary in the sample. A valid customer account was enough; payment modification was not demonstrated.','This is significant because billing details crossed a company boundary. A valid customer account was enough; wider reach and payment modification were not demonstrated.');
s=s.replace('</style>','.map-summary{margin-top:20px;padding:17px 20px;border:1px solid #e0e7f3;border-radius:9px;background:#fff}.map-summary p{font-size:11px;line-height:1.7}.map-summary p+p{margin-top:7px}.map-summary b{font-weight:500;color:#536f9a}</style>');
fs.writeFileSync(p,s);
