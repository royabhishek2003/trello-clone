import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const srcDirs = [
  'c:/Users/hp/OneDrive/Desktop/trello-clone/nextjs-trello-clone/components/ui',
  'c:/Users/hp/OneDrive/Desktop/trello-clone/nextjs-trello-clone/lib',
];

const destDirs = [
  'c:/Users/hp/OneDrive/Desktop/trello-clone/frontend/src/components/ui',
  'c:/Users/hp/OneDrive/Desktop/trello-clone/frontend/src/lib',
];

srcDirs.forEach((srcDir, i) => {
  const destDir = destDirs[i];
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(srcDir, file), 'utf8');
    const result = esbuild.transformSync(content, { loader: file.endsWith('.tsx') ? 'tsx' : 'ts', format: 'esm' });
    
    // Fix imports
    let code = result.code.replace(/@\/lib\/utils/g, '../../lib/utils');
    if (i === 1) code = result.code; // for lib/utils
    
    fs.writeFileSync(path.join(destDir, file.replace(/\.tsx?$/, file.endsWith('.tsx') ? '.jsx' : '.js')), code);
  }
});

console.log('UI components and lib files compiled to JS');
