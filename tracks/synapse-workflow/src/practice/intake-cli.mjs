import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {createIntake} from '../investigation/intake.mjs';
import {outputDirectory} from '../investigation/output-path.mjs';
import {readLocalJson} from '../investigation/local-input.mjs';
try{
  const args=process.argv.slice(2),options={};
  for(let i=0;i<args.length;i+=2){if(!['--url','--out','--context'].includes(args[i])||!args[i+1]||options[args[i]])throw new Error('Usage: npm run synapse:intake -- --url URL [--context JSON_FILE] [--out NEW_DIRECTORY]');options[args[i]]=args[i+1];}
  let context={};
  if(options['--context'])context=await readLocalJson(options['--context']);
  if(!context||typeof context!=='object'||Array.isArray(context))throw new Error('Context object required');
  const intake=createIntake({...context,url:options['--url']});
  await mkdir('runs',{recursive:true});const root=await outputDirectory(options['--out']||join('runs',`intake-${randomUUID()}`));await mkdir(root,{recursive:false});
  await writeFile(join(root,'intake.json'),JSON.stringify(intake,null,2)+'\n',{flag:'wx'});
  console.log(`Intake saved: ${join(root,'intake.json')}\nNo target was contacted. Execution authority remains pending.`);
}catch(error){console.error(error.message);process.exitCode=1;}
