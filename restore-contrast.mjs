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
    // Boost text contrast
    .replace(/text-slate-600/g, 'text-slate-700')
    .replace(/text-slate-500/g, 'text-slate-600')
    
    // Boost border visibility
    .replace(/border-slate-100/g, 'border-slate-200')
    
    // Boost shadows
    .replace(/shadow-\[0_4px_20px_-4px_rgba\(0,0,0,0\.05\)\]/g, 'shadow-[0_8px_30px_rgb(0,0,0,0.08)]');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFilesCount++;
  }
});

console.log(`Restored contrast in ${changedFilesCount} files.`);
