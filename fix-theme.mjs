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
    // Backgrounds
    .replace(/bg-slate-900\/\d+/g, 'bg-white')
    .replace(/bg-slate-900/g, 'bg-white')
    .replace(/bg-slate-800\/\d+/g, 'bg-slate-50')
    .replace(/bg-slate-800/g, 'bg-slate-50')
    .replace(/bg-slate-700\/\d+/g, 'bg-slate-100')
    .replace(/bg-slate-700/g, 'bg-slate-100')
    
    // Borders
    .replace(/border-slate-800\/\d+/g, 'border-slate-100')
    .replace(/border-slate-800/g, 'border-slate-100')
    .replace(/border-slate-700\/\d+/g, 'border-slate-200')
    .replace(/border-slate-700/g, 'border-slate-200')
    .replace(/border-slate-600\/\d+/g, 'border-slate-300')
    .replace(/border-slate-600/g, 'border-slate-300')
    .replace(/border-slate-500/g, 'border-slate-300')
    
    // Hover Borders
    .replace(/hover:border-slate-600/g, 'hover:border-slate-400')
    
    // Text colors
    .replace(/text-slate-100/g, 'text-slate-800')
    .replace(/text-slate-200/g, 'text-slate-700')
    .replace(/text-slate-300/g, 'text-slate-600')
    .replace(/text-slate-400/g, 'text-slate-500')
    
    // Hover Backgrounds
    .replace(/hover:bg-slate-800\/\d+/g, 'hover:bg-slate-100')
    .replace(/hover:bg-slate-800/g, 'hover:bg-slate-100')
    .replace(/hover:bg-slate-700/g, 'hover:bg-slate-200')
    
    // Even/Odd rows in tables
    .replace(/even:bg-slate-800\/\d+/g, 'even:bg-slate-50')
    .replace(/even:bg-slate-800/g, 'even:bg-slate-50')
    .replace(/odd:bg-slate-800\/\d+/g, 'odd:bg-slate-50')
    .replace(/odd:bg-slate-800/g, 'odd:bg-slate-50');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFilesCount++;
  }
});

console.log(`Updated ${changedFilesCount} files to light theme.`);
