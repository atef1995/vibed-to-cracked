# 🔍 Technical Deep Dive: Architecture Validation

## Code Execution Security Analysis

### ⚠️ UPDATED: Modern Secure Code Execution

**vm2 is deprecated** - using modern alternatives for better security:

#### Primary: WebContainers (Recommended for Educational Platforms)

````typescript
// lib/code-execution/webcontainer-runner.ts
import { WebContainer } from '@webcontainer/api';

class WebContainerRunner {
  private webcontainer: WebContainer | null = null;

  async init() {
    this.webcontainer = await WebContainer.boot();
  }

  async executeCode(code: string) {
    if (!this.webcontainer) await this.init();

    // Write code to virtual file system
    await this.webcontainer!.fs.writeFile('/script.js', code);

    // Execute with timeout
    const process = await this.webcontainer!.spawn('node', ['script.js']);

    let output = '';
    process.output.pipeTo(new WritableStream({
      write(data) { output += data; }
    }));

    // 5-second timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 5000)
    );

    try {
      const exitCode = await Promise.race([process.exit, timeoutPromise]);
      return {
        success: exitCode === 0,
        output,
        error: exitCode !== 0 ? 'Execution failed' : null
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

#### Fallback: isolated-vm (Server-side)

```javascript
// backend/code-runner/isolated-vm-runner.js
const ivm = require('isolated-vm');

class IsolatedCodeRunner {
  async executeCode(code) {
    const isolate = new ivm.Isolate({ memoryLimit: 64 });

    try {
      const context = await isolate.createContext();
      const jail = context.global;

      await jail.set('console', {
        log: (...args) => this.captureOutput('log', args)
      });

      const result = await context.eval(code, { timeout: 5000 });
      return { success: true, result, output: this.output };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      isolate.dispose();
    }
  }
}
````

### Security Advantages ✅

**WebContainers:**

- ✅ **Zero server risk** - runs entirely in browser
- ✅ **True V8 isolation** - browser security model
- ✅ **Full Node.js environment** - real JavaScript learning
- ✅ **No infrastructure** - reduces attack surface
- ✅ **Mobile compatible** - works on all devices

**isolated-vm (fallback):**

- ✅ **True V8 isolation** - separate memory space
- ✅ **Active maintenance** - security updates
- ✅ **Memory isolation** - prevents memory attacks
- ✅ **Timeout protection** - prevents infinite loops
- ✅ **Transfer control** - safe object passing

### Implementation Strategy

````typescript
// Hybrid approach for maximum compatibility
class HybridCodeRunner {
  async executeCode(code: string) {
    // Try WebContainers first (client-side, most secure)
    if (this.isWebContainerSupported()) {
      return this.webContainerRunner.execute(code);
    }

    // Fallback to isolated-vm (server-side)
    return this.isolatedVMRunner.execute(code);
  }
}

---

## Database Schema Design

```prisma
// prisma/schema.prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  image         String?
  mood          Mood     @default(CHILL)
  subscription  Plan     @default(FREE)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  progress      Progress[]
  quizAttempts  QuizAttempt[]

  @@map("users")
}

model Tutorial {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  content     String   // MDX content
  difficulty  Int      @default(1)
  order       Int
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())

  quizzes     Quiz[]
  progress    Progress[]

  @@map("tutorials")
}

model Quiz {
  id           String   @id @default(cuid())
  tutorialId   String
  question     String
  options      Json     // Array of options
  correctAnswer Int
  explanation  String?
  videoUrl     String?
  difficulty   Difficulty @default(EASY)

  tutorial     Tutorial @relation(fields: [tutorialId], references: [id])
  attempts     QuizAttempt[]

  @@map("quizzes")
}

model Progress {
  id          String   @id @default(cuid())
  userId      String
  tutorialId  String
  completed   Boolean  @default(false)
  score       Float?
  completedAt DateTime?

  user        User     @relation(fields: [userId], references: [id])
  tutorial    Tutorial @relation(fields: [tutorialId], references: [id])

  @@unique([userId, tutorialId])
  @@map("progress")
}

enum Mood {
  CHILL
  RUSH
  GRIND
}

enum Plan {
  FREE
  PAID
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}
````

---

## Performance Considerations

### Bundle Size Optimization

```javascript
// next.config.js
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  webpack: (config) => {
    // Code splitting for CodeMirror
    config.optimization.splitChunks.chunks = "all";

    // Reduce bundle size
    config.resolve.alias = {
      ...config.resolve.alias,
      "@codemirror/state": "@codemirror/state/dist/index.cjs",
    };

    return config;
  },
};
```

### Mobile Performance Strategy

1. **Lazy Loading**: Load CodeMirror only when needed
2. **Touch Optimization**: Custom mobile keyboard for code editor
3. **Offline Support**: Cache tutorials with service worker
4. **Progressive Enhancement**: Works without JavaScript for basic content

---

## Scalability Architecture

```mermaid
graph TB
    A[User] --> B[Next.js Frontend]
    B --> C[API Routes]
    C --> D[Prisma ORM]
    D --> E[PostgreSQL]

    C --> F[Code Runner Service]
    F --> G[vm2 Sandbox]

    C --> H[Stripe API]
    H --> I[Webhook Handler]

    B --> J[YouTube API]

    subgraph "Deployment"
        K[Vercel/VPS]
        L[Database Host]
        M[CDN]
    end
```

### Hosting Strategy

**Development**: Local + Vercel preview
**Production**:

- Frontend: Vercel or VPS with nginx
- Database: Railway/PlanetScale
- Code Runner: Separate Node.js service (Docker)
- CDN: Cloudflare for static assets

---

## Development Environment Setup

### Required Tools

```bash
# Core dependencies
npm install next react react-dom typescript
npm install @prisma/client prisma
npm install next-auth
npm install stripe
npm install @codemirror/basic-setup @codemirror/lang-javascript

# Code execution (choose one or both)
npm install @webcontainer/api  # Recommended: client-side
npm install isolated-vm        # Fallback: server-side

# Development dependencies
npm install -D tailwindcss autoprefixer postcss
npm install -D @types/node @types/react
npm install -D eslint prettier
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/vibed"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Code Runner
CODE_RUNNER_URL="http://localhost:3001"
```

---

## Testing Strategy

### Unit Tests

```javascript
// __tests__/code-runner.test.js
describe("Code Runner", () => {
  test("executes simple JavaScript", async () => {
    const result = await codeRunner.execute("1 + 1");
    expect(result.success).toBe(true);
    expect(result.result).toBe(2);
  });

  test("prevents infinite loops", async () => {
    const result = await codeRunner.execute("while(true) {}");
    expect(result.success).toBe(false);
    expect(result.error).toContain("timeout");
  });

  test("handles syntax errors gracefully", async () => {
    const result = await codeRunner.execute("const x = ;");
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test("captures console output", async () => {
    const result = await codeRunner.execute("console.log('Hello World')");
    expect(result.success).toBe(true);
    expect(result.output).toContain("Hello World");
  });
});
```

### Integration Tests

- Quiz submission flow
- Stripe webhook handling
- User progress tracking
- Mood system functionality

### Security Tests

- Code injection attempts
- XSS prevention
- CSRF protection
- Rate limiting validation

---

## Deployment Checklist

### Pre-Launch

- [ ] Security audit of code runner
- [ ] Performance testing (mobile)
- [ ] SEO optimization
- [ ] Analytics setup (Vercel/Google)
- [ ] Error monitoring (Sentry)
- [ ] Backup strategy
- [ ] SSL certificates
- [ ] GDPR compliance

### Launch Day

- [ ] Database migrations
- [ ] DNS configuration
- [ ] CDN setup
- [ ] Monitoring alerts
- [ ] Customer support system

### Post-Launch

- [ ] User feedback collection
- [ ] Performance monitoring
- [ ] Security monitoring
- [ ] Content updates
- [ ] Feature iteration

**Technical foundation is solid. Focus on security for code execution and mobile performance optimization.**
