import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PUBLIC_DIR = './public';
const SRC_DIR = './src';
const TRASH_DIR = './_trash';
const CODE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.vue'];

function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

if (!fs.existsSync(TRASH_DIR)) {
    fs.mkdirSync(TRASH_DIR);
}

console.log('Scanning assets...');

const publicFiles = getAllFiles(PUBLIC_DIR);
const srcFiles = getAllFiles(SRC_DIR);

let combinedSourceCode = '';
srcFiles.forEach(file => {
    if (CODE_EXTENSIONS.includes(path.extname(file))) {
        combinedSourceCode += fs.readFileSync(file, 'utf-8');
    }
});

let movedCount = 0;

publicFiles.forEach(assetPath => {
    const filename = path.basename(assetPath);
    
    if (!combinedSourceCode.includes(filename)) {
        const targetPath = path.join(TRASH_DIR, filename);
        
        if (fs.existsSync(targetPath)) {
            const timestamp = Date.now();
            const ext = path.extname(filename);
            const name = path.basename(filename, ext);
            fs.renameSync(assetPath, path.join(TRASH_DIR, `${name}_${timestamp}${ext}`));
        } else {
            fs.renameSync(assetPath, targetPath);
        }
        
        console.log(`Moved unused file: ${filename}`);
        movedCount++;
    }
});

console.log(`\nOperation complete. Moved ${movedCount} files to ${TRASH_DIR}`);