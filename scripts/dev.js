#!/usr/bin/env node

/**
 * Development server script with enhanced logging
 * Provides better developer experience with clear startup information
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🚀 Starting Contact Book Development Server...\n');

const viteProcess = spawn('npx', ['vite', '--host'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

viteProcess.on('close', (code) => {
  console.log(`\n📦 Development server exited with code ${code}`);
});

process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down development server...');
  viteProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Shutting down development server...');
  viteProcess.kill('SIGTERM');
});