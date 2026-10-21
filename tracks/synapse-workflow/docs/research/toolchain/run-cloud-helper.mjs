import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import path from 'node:path';
const result=await promisify(execFile)(path.resolve('.tools/toolchain/venv/Scripts/python.exe'),[path.resolve('docs/research/toolchain/cloud-helper-lab.py')],{windowsHide:true,timeout:20000,maxBuffer:1024*1024});
console.log(result.stdout);if(result.stderr)console.log(result.stderr);
