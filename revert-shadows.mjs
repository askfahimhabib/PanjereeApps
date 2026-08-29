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
  if (file.includes('Dashboard.tsx') || file.includes('MainLayout.tsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = content
    .replace(/shadow-lg border border-zinc-100/g, 'shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-zinc-200')
    .replace(/shadow-md border border-zinc-100/g, 'shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-zinc-200')
    .replace(/shadow-\[0_8px_30px_rgb\(0,0,0,0\.08\)\] border border-zinc-100/g, 'shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-zinc-200')
    .replace(/shadow-\[0_8px_30px_rgb\(0,0,0,0\.08\)\] border border-zinc-200/g, 'shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-zinc-200')
    .replace(/shadow-lg border-zinc-100/g, 'shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200')
    .replace(/shadow-md border-zinc-100/g, 'shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFilesCount++;
  }
});

console.log(`Reverted card shadows in ${changedFilesCount} files.`);
