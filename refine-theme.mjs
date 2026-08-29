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
    // General softening
    .replace(/border-slate-200/g, 'border-slate-100')
    .replace(/text-slate-700/g, 'text-slate-600')
    .replace(/border-slate-300/g, 'border-slate-200')
    .replace(/hover:bg-slate-100/g, 'hover:bg-slate-50')
    
    // Now target the specific patterns that were just converted
    .replace(/bg-slate-50 border border-slate-100 rounded-xl/g, 'bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 rounded-2xl')
    .replace(/bg-slate-50 border border-slate-100/g, 'bg-white border border-slate-100')
    .replace(/bg-white border border-slate-100 rounded-lg/g, 'bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-lg')
    .replace(/bg-slate-100 border-slate-200 text-slate-800/g, 'bg-white shadow-sm border-slate-200 text-slate-800');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFilesCount++;
  }
});

console.log(`Refined ${changedFilesCount} files to eye-soothing light theme.`);
