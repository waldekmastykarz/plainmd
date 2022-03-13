import * as fs from 'fs';
import * as path from 'path';
import { plainmd } from './plainmd';

const file = fs.readFileSync('./sample.md', 'utf8');
console.log(plainmd.md2plain(file, path.join(__dirname, '..')));