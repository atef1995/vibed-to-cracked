#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const clientPath = join(process.cwd(), "src/generated/client.ts");
const classPath = join(process.cwd(), "src/generated/internal/class.ts");

try {
  // Fix client.ts imports
  if (existsSync(clientPath)) {
    let clientContent = readFileSync(clientPath, "utf-8");
    clientContent = clientContent.replace(
      /from ['"]([^'"]+)\.js['"]/g,
      "from '$1'"
    );
    writeFileSync(clientPath, clientContent, "utf-8");
    console.log("✓ Fixed Prisma client imports");
  }

  // Fix class.ts runtime imports - add "_fast" suffix to match actual runtime files
  if (existsSync(classPath)) {
    let classContent = readFileSync(classPath, "utf-8");
    classContent = classContent.replace(
      /query_compiler_bg\.(postgresql|mysql|sqlite|sqlserver|cockroachdb)/g,
      "query_compiler_fast_bg.$1"
    );
    writeFileSync(classPath, classContent, "utf-8");
    console.log("✓ Fixed Prisma runtime imports");
  }
} catch (error) {
  console.error("Error fixing Prisma imports:", error.message);
  process.exit(1);
}
