#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const clientPath = join(process.cwd(), 'src/generated/client.ts');

try {
  let content = readFileSync(clientPath, 'utf-8');
  
  // Replace all .js imports with no extension
  content = content.replace(/from ['"]([^'"]+)\.js['"]/g, "from '$1'");
  
  writeFileSync(clientPath, content, 'utf-8');
  console.log('✓ Fixed Prisma client imports');
} catch (error) {
  console.error('Error fixing Prisma imports:', error.message);
  process.exit(1);
}
