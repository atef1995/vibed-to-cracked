# 🔒 vm2 Alternatives: Secure JavaScript Execution Options

## Current Issue with vm2

⚠️ **Important**: vm2 is no longer actively maintained (last update 2021) and has known security vulnerabilities. Here are modern, secure alternatives:

---

## 1. **isolated-vm** ⭐ RECOMMENDED

### Overview

- **Actively maintained** V8 isolate-based sandbox
- **True isolation** using V8's built-in security model
- **Best security** for untrusted code execution
- **Production-ready** used by major platforms

### Implementation

```javascript
// backend/code-runner/isolated-vm-runner.js
const ivm = require("isolated-vm");

class IsolatedCodeRunner {
  constructor() {
    this.timeLimit = 5000; // 5 seconds
    this.memoryLimit = 64; // 64MB
  }

  async executeCode(code, testCases = []) {
    // Create new isolate
    const isolate = new ivm.Isolate({ memoryLimit: this.memoryLimit });

    try {
      const context = await isolate.createContext();
      const jail = context.global;

      // Set up safe console
      await jail.set("console", {
        log: (...args) => this.captureOutput("log", args),
        error: (...args) => this.captureOutput("error", args),
      });

      // Execute with timeout
      const result = await context.eval(code, { timeout: this.timeLimit });

      return { success: true, result, output: this.output };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      isolate.dispose();
    }
  }
}

module.exports = IsolatedCodeRunner;
```

### Pros

- ✅ True V8 isolation
- ✅ Active maintenance
- ✅ Best security model
- ✅ Memory isolation
- ✅ Transfer objects between isolates

### Cons

- ❌ More complex setup
- ❌ Higher memory usage
- ❌ C++ dependencies (compilation required)

---

## 2. **WebContainers (StackBlitz)** 🌐 MODERN APPROACH

### Overview

- **Browser-based** Node.js runtime
- **No backend needed** - runs in browser
- **Zero security risk** to server
- **Full Node.js API** support

### Implementation

```typescript
// components/CodeRunner.tsx
import { WebContainer } from "@webcontainer/api";

class WebContainerRunner {
  private webcontainer: WebContainer | null = null;

  async init() {
    this.webcontainer = await WebContainer.boot();
  }

  async executeCode(code: string) {
    if (!this.webcontainer) await this.init();

    // Write code to virtual file system
    await this.webcontainer!.fs.writeFile("/script.js", code);

    // Execute with timeout
    const process = await this.webcontainer!.spawn("node", ["script.js"]);

    let output = "";
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          output += data;
        },
      })
    );

    const exitCode = await process.exit;

    return {
      success: exitCode === 0,
      output,
      error: exitCode !== 0 ? "Execution failed" : null,
    };
  }
}
```

### Pros

- ✅ Zero server security risk
- ✅ Full Node.js environment
- ✅ No backend infrastructure
- ✅ Modern, actively developed
- ✅ Perfect for education platforms

### Cons

- ❌ Browser-only (no server-side)
- ❌ Requires modern browsers
- ❌ Larger initial bundle size
- ❌ Still in beta

---

## 3. **Docker Containers** 🐳 ENTERPRISE SOLUTION

### Overview

- **Complete isolation** via containerization
- **Resource limits** built-in
- **Scalable** for high-traffic
- **Industry standard** for code execution platforms

### Implementation

```javascript
// backend/code-runner/docker-runner.js
const Docker = require("dockerode");
const docker = new Docker();

class DockerCodeRunner {
  async executeCode(code) {
    const container = await docker.createContainer({
      Image: "node:18-alpine",
      Cmd: ["node", "-e", code],
      WorkingDir: "/tmp",
      Memory: 67108864, // 64MB
      CpuShares: 512,
      NetworkMode: "none", // No network access
      AttachStdout: true,
      AttachStderr: true,
    });

    await container.start();

    // Set timeout
    const timeout = setTimeout(async () => {
      await container.kill();
    }, 5000);

    const stream = await container.attach({
      stream: true,
      stdout: true,
      stderr: true,
    });

    let output = "";
    stream.on("data", (chunk) => {
      output += chunk.toString();
    });

    const exitCode = await container.wait();
    clearTimeout(timeout);

    await container.remove();

    return {
      success: exitCode.StatusCode === 0,
      output,
      error: exitCode.StatusCode !== 0 ? "Execution failed" : null,
    };
  }
}
```

### Pros

- ✅ Maximum security
- ✅ Resource limits
- ✅ Scalable
- ✅ Language agnostic

### Cons

- ❌ Complex infrastructure
- ❌ Higher resource usage
- ❌ Requires Docker setup
- ❌ Slower startup times

---

## 4. **Web Workers + Restricted Environment** 🔧 LIGHTWEIGHT

### Overview

- **Browser-based** isolation
- **No server needed** for basic JS
- **Good for simple cases**
- **Fast and lightweight**

### Implementation

```typescript
// utils/worker-runner.ts
class WorkerCodeRunner {
  async executeCode(
    code: string
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    return new Promise((resolve) => {
      // Create restricted code environment
      const restrictedCode = `
        // Remove dangerous globals
        delete fetch;
        delete XMLHttpRequest;
        delete WebSocket;
        delete importScripts;
        
        // Override console
        const console = {
          log: (...args) => self.postMessage({type: 'log', data: args}),
          error: (...args) => self.postMessage({type: 'error', data: args})
        };
        
        try {
          const result = (function() {
            ${code}
          })();
          self.postMessage({type: 'result', data: result});
        } catch (error) {
          self.postMessage({type: 'error', data: error.message});
        }
      `;

      const blob = new Blob([restrictedCode], {
        type: "application/javascript",
      });
      const worker = new Worker(URL.createObjectURL(blob));

      const timeout = setTimeout(() => {
        worker.terminate();
        resolve({ success: false, error: "Timeout" });
      }, 5000);

      worker.onmessage = (event) => {
        const { type, data } = event.data;

        if (type === "result") {
          clearTimeout(timeout);
          worker.terminate();
          resolve({ success: true, result: data });
        } else if (type === "error") {
          clearTimeout(timeout);
          worker.terminate();
          resolve({ success: false, error: data });
        }
      };
    });
  }
}
```

### Pros

- ✅ No server infrastructure
- ✅ Fast execution
- ✅ Good browser support
- ✅ Simple implementation

### Cons

- ❌ Limited security (can be bypassed)
- ❌ Browser-only
- ❌ No file system access
- ❌ Limited to basic JavaScript

---

## 5. **Deno Deploy / Edge Runtime** ⚡ SERVERLESS

### Overview

- **V8 isolates** in serverless environment
- **Built-in security** model
- **No cold starts** for small functions
- **TypeScript support**

### Implementation

```typescript
// api/execute-code.ts (Vercel Edge Runtime)
export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  const { code } = await req.json();

  try {
    // Execute in secure V8 isolate
    const result = eval(code);

    return new Response(
      JSON.stringify({
        success: true,
        result,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
```

### Pros

- ✅ Serverless scaling
- ✅ Built-in V8 isolation
- ✅ Fast execution
- ✅ No infrastructure management

### Cons

- ❌ Limited runtime APIs
- ❌ Vendor lock-in
- ❌ Cost at scale
- ❌ Less control over environment

---

## **Recommendation Matrix**

| Solution          | Security   | Ease of Use | Cost       | Scalability | Best For                    |
| ----------------- | ---------- | ----------- | ---------- | ----------- | --------------------------- |
| **isolated-vm**   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐      | ⭐⭐⭐⭐   | ⭐⭐⭐⭐    | **Production apps**         |
| **WebContainers** | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐      | **Educational platforms**   |
| **Docker**        | ⭐⭐⭐⭐⭐ | ⭐⭐        | ⭐⭐       | ⭐⭐⭐⭐⭐  | **Enterprise/High-traffic** |
| **Web Workers**   | ⭐⭐       | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐      | **Simple JS execution**     |
| **Edge Runtime**  | ⭐⭐⭐⭐   | ⭐⭐⭐⭐    | ⭐⭐⭐     | ⭐⭐⭐⭐⭐  | **Serverless apps**         |

---

## **For Your Project: Recommended Approach**

### 🎯 **Primary Recommendation: WebContainers**

**Why it's perfect for "Vibed to Cracked":**

1. **Educational Focus**: Designed specifically for learning platforms
2. **Zero Security Risk**: No server-side execution
3. **Full JavaScript Environment**: Students can learn real JavaScript
4. **Mobile Friendly**: Works in mobile browsers
5. **Cost Effective**: No backend infrastructure needed

### 🔄 **Fallback Option: isolated-vm**

For server-side execution when WebContainers aren't supported:

```typescript
// lib/code-execution.ts
class HybridCodeRunner {
  async executeCode(code: string) {
    // Try WebContainers first (client-side)
    if (typeof window !== "undefined" && "WebContainer" in window) {
      return this.executeWithWebContainers(code);
    }

    // Fallback to server-side isolated-vm
    return this.executeWithIsolatedVM(code);
  }
}
```

### 📋 **Implementation Plan**

**Phase 1**: Implement WebContainers for modern browsers
**Phase 2**: Add isolated-vm fallback for server-side execution
**Phase 3**: Consider Docker for enterprise scaling

---

## **Migration from vm2**

### Step-by-Step Migration

1. **Install new dependency**:

```bash
npm uninstall vm2
npm install @webcontainer/api
# OR
npm install isolated-vm
```

2. **Update code runner interface**:

```typescript
interface CodeRunnerResult {
  success: boolean;
  result?: any;
  output?: string;
  error?: string;
  executionTime?: number;
}
```

3. **Implement new runner** following examples above

4. **Update API endpoints** to use new runner

5. **Test thoroughly** with various code samples

**The WebContainers approach is revolutionary for educational platforms - it's what StackBlitz and CodeSandbox use. For your use case, it's likely the best choice!**
