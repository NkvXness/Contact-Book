#!/usr/bin/env node

/**
 * Production build script with enhanced validation and reporting
 * Ensures code quality before building for production
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🏗️  Starting Contact Book Production Build...\n');

// Check if source files exist
if (!existsSync(join(rootDir, 'src'))) {
  console.error('❌ Source directory not found!');
  process.exit(1);
}

// Step 1: Lint code
console.log('🔍 Running ESLint...');
const lintProcess = spawn('npx', ['eslint', 'src', '--ext', '.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

lintProcess.on('close', (lintCode) => {
  if (lintCode !== 0) {
    console.error('❌ ESLint found issues. Fix them before building.');
    process.exit(1);
  }

  console.log('✅ ESLint passed!\n');

  // Step 2: Check formatting
  console.log('💅 Checking code formatting...');
  const formatCheckProcess = spawn('npx', ['prettier', '--check', 'src/**/*.{js,css,html}'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });

  formatCheckProcess.on('close', (formatCode) => {
    if (formatCode !== 0) {
      console.log('⚠️  Code formatting issues found. Run "npm run format" to fix them.');
    } else {
      console.log('✅ Code formatting is good!\n');
    }

    // Step 3: Build
    console.log('📦 Building for production...');
    const buildProcess = spawn('npx', ['vite', 'build'], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true
    });

    buildProcess.on('close', (buildCode) => {
      if (buildCode === 0) {
        console.log('\n🎉 Build completed successfully!');
        console.log('📁 Output: dist/ directory');
      } else {
        console.error('\n❌ Build failed!');
        process.exit(1);
      }
    });
  });
});