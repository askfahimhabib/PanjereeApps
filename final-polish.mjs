import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) { 
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('./src');
let changedFilesCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = content
    // Shadows
    .replace(/shadow-\[0_8px_30px_rgb\(0,0,0,0\.08\)\]/g, 'shadow-lg border-zinc-100')
    .replace(/shadow-\[0_2px_10px_-4px_rgba\(0,0,0,0\.02\)\]/g, 'shadow-md border-zinc-100')
    
    // Lists & HR lines (make them lighter)
    .replace(/divide-slate-700\/\d+/g, 'divide-zinc-100')
    .replace(/divide-slate-200/g, 'divide-zinc-100')
    .replace(/divide-slate-100/g, 'divide-zinc-50')
    
    // Borders (Lighter)
    .replace(/border-slate-200/g, 'border-zinc-100')
    .replace(/border-slate-100/g, 'border-zinc-100')
    
    // Matte Black text (Zinc)
    .replace(/text-slate-800/g, 'text-zinc-900')
    .replace(/text-slate-700/g, 'text-zinc-800')
    .replace(/text-slate-600/g, 'text-zinc-600')
    .replace(/text-slate-500/g, 'text-zinc-500')
    .replace(/text-slate-400/g, 'text-zinc-400')
    
    // Backgrounds (Zinc)
    .replace(/bg-slate-50/g, 'bg-zinc-50')
    .replace(/bg-slate-100/g, 'bg-zinc-100');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFilesCount++;
  }
});

console.log(`Applied final polish in ${changedFilesCount} files.`);
