export interface ComparisonItem {
  name: string;
  features: Record<string, string>;
}

export interface Comparison {
  slug: string;
  title: string;
  description: string;
  items: ComparisonItem[];
  verdict: string;
  codeExample?: string;
  relatedGlossary?: string[];
  relatedTutorials?: string[];
}

export const comparisons: Comparison[] = [
  {
    slug: "var-vs-let-vs-const",
    title: "var vs let vs const",
    description:
      "The three ways to declare variables in JavaScript. Understanding their differences in scope, hoisting, and reassignment is fundamental to writing modern JS.",
    items: [
      {
        name: "var",
        features: {
          Scope: "Function-scoped",
          Hoisting: "Hoisted and initialized to undefined",
          Reassignment: "Yes",
          Redeclaration: "Yes (in same scope)",
          "Temporal Dead Zone": "No",
          "When to use": "Never (legacy code only)",
        },
      },
      {
        name: "let",
        features: {
          Scope: "Block-scoped",
          Hoisting: "Hoisted but not initialized (TDZ)",
          Reassignment: "Yes",
          Redeclaration: "No (in same scope)",
          "Temporal Dead Zone": "Yes",
          "When to use": "When the value needs to change",
        },
      },
      {
        name: "const",
        features: {
          Scope: "Block-scoped",
          Hoisting: "Hoisted but not initialized (TDZ)",
          Reassignment: "No",
          Redeclaration: "No (in same scope)",
          "Temporal Dead Zone": "Yes",
          "When to use": "Default choice for all declarations",
        },
      },
    ],
    verdict:
      "Use const by default. Use let only when you need to reassign. Never use var in modern code.",
    codeExample: `// const - default choice\nconst API_URL = "/api/users";\nconst user = { name: "Alice" };\nuser.name = "Bob"; // OK - mutating, not reassigning\n\n// let - when reassignment needed\nlet count = 0;\ncount++; // OK\n\n// var - avoid\nvar x = 1; // function-scoped, hoisted, confusing`,
    relatedGlossary: ["variable", "hoisting", "scope", "const-vs-let-vs-var"],
    relatedTutorials: ["fundamentals"],
  },
  {
    slug: "double-equals-vs-triple-equals",
    title: "== vs === in JavaScript",
    description:
      "The difference between loose equality (==) and strict equality (===). One of the most common sources of bugs for JavaScript beginners.",
    items: [
      {
        name: "== (Loose)",
        features: {
          "Type coercion": "Yes, converts types before comparing",
          "null == undefined": "true",
          '"5" == 5': "true",
          "0 == false": "true",
          '"" == false': "true",
          "Predictability": "Low (many edge cases)",
          Recommendation: "Avoid except for null checks",
        },
      },
      {
        name: "=== (Strict)",
        features: {
          "Type coercion": "No, compares value AND type",
          "null === undefined": "false",
          '"5" === 5': "false",
          "0 === false": "false",
          '"" === false': "false",
          "Predictability": "High (no surprises)",
          Recommendation: "Always use this",
        },
      },
    ],
    verdict:
      "Always use === (strict equality). The only acceptable use of == is checking for null/undefined with val == null.",
    codeExample: `// Strict equality - predictable\n5 === 5;       // true\n5 === "5";     // false\nnull === undefined; // false\n\n// Loose equality - surprising\n"" == false;   // true\n0 == "";       // true\nnull == undefined; // true\n\n// The one valid == use case\nif (value == null) {\n  // catches both null and undefined\n}`,
    relatedGlossary: ["strict-equality", "type-coercion", "truthy-and-falsy"],
    relatedTutorials: ["fundamentals"],
  },
  {
    slug: "map-vs-foreach",
    title: "map() vs forEach() in JavaScript",
    description:
      "Both iterate over arrays, but they serve different purposes. Understanding when to use each is key to writing clean functional JavaScript.",
    items: [
      {
        name: "map()",
        features: {
          "Return value": "New array with transformed elements",
          "Original array": "Not modified",
          Chainable: "Yes (.map().filter().reduce())",
          "Use case": "Transforming data",
          Performance: "Slightly slower (creates new array)",
          "Side effects": "Should not have side effects",
        },
      },
      {
        name: "forEach()",
        features: {
          "Return value": "undefined",
          "Original array": "Not modified",
          Chainable: "No (returns undefined)",
          "Use case": "Performing side effects per element",
          Performance: "Slightly faster (no new array)",
          "Side effects": "Expected to have side effects",
        },
      },
    ],
    verdict:
      "Use map() when you need to transform data into a new array. Use forEach() when you need to perform side effects (logging, DOM updates, API calls) for each element.",
    codeExample: `const numbers = [1, 2, 3, 4, 5];\n\n// map - transform and return new array\nconst doubled = numbers.map(n => n * 2);\n// [2, 4, 6, 8, 10]\n\n// forEach - side effects only\nnumbers.forEach(n => {\n  console.log(n); // side effect\n});\n// returns undefined`,
    relatedGlossary: ["array-methods", "higher-order-function", "callback"],
    relatedTutorials: ["fundamentals"],
  },
  {
    slug: "arrow-functions-vs-regular-functions",
    title: "Arrow Functions vs Regular Functions",
    description:
      "ES6 arrow functions are not just shorter syntax. They have fundamental differences in how they handle this, arguments, and constructors.",
    items: [
      {
        name: "Arrow Function",
        features: {
          Syntax: "const fn = () => {}",
          "this binding": "Inherits from enclosing scope (lexical)",
          "arguments object": "Not available",
          "Can be constructor": "No (cannot use new)",
          Hoisting: "Not hoisted (expression)",
          "Best for": "Callbacks, short functions, methods needing outer this",
        },
      },
      {
        name: "Regular Function",
        features: {
          Syntax: "function fn() {}",
          "this binding": "Dynamic (depends on how called)",
          "arguments object": "Available",
          "Can be constructor": "Yes (can use new)",
          Hoisting: "Yes (declaration form)",
          "Best for": "Methods, constructors, when you need dynamic this",
        },
      },
    ],
    verdict:
      "Use arrow functions for callbacks and when you need lexical this. Use regular functions for object methods, constructors, and when you need the arguments object or hoisting.",
    codeExample: `// Arrow - inherits this\nconst timer = {\n  seconds: 0,\n  start() {\n    setInterval(() => {\n      this.seconds++; // 'this' is timer\n    }, 1000);\n  }\n};\n\n// Regular - own this\nfunction Dog(name) {\n  this.name = name; // works as constructor\n}\nconst rex = new Dog("Rex");`,
    relatedGlossary: ["arrow-function", "this-keyword", "hoisting", "closure"],
    relatedTutorials: ["fundamentals"],
  },
  {
    slug: "null-vs-undefined",
    title: "null vs undefined in JavaScript",
    description:
      "Two distinct primitive types that both represent absence of value, but with different semantics and use cases.",
    items: [
      {
        name: "null",
        features: {
          Type: "object (historical bug in JS)",
          Meaning: "Intentional absence of value",
          "Set by": "Developer explicitly",
          "typeof null": '"object"',
          "JSON support": 'JSON.stringify(null) = "null"',
          "Default value": "Not a default for anything",
        },
      },
      {
        name: "undefined",
        features: {
          Type: "undefined",
          Meaning: "Variable declared but not assigned",
          "Set by": "JavaScript engine (usually)",
          "typeof undefined": '"undefined"',
          "JSON support": "Omitted from JSON.stringify",
          "Default value": "Default for unset variables, missing params, missing properties",
        },
      },
    ],
    verdict:
      "Use null when you want to explicitly indicate no value. Let undefined be JavaScript's default for uninitialized values. Check both with == null or the ?? operator.",
    codeExample: `let x;              // undefined (no assignment)\nlet y = null;       // null (explicit no value)\n\nconst obj = { a: 1 };\nobj.b;              // undefined (missing property)\n\n// Check for both\nif (value == null) { } // catches null AND undefined\nconst result = value ?? "default"; // nullish coalescing`,
    relatedGlossary: ["nullish-coalescing", "truthy-and-falsy", "optional-chaining"],
    relatedTutorials: ["fundamentals"],
  },
  {
    slug: "promise-then-vs-async-await",
    title: "Promise .then() vs async/await",
    description:
      "Two ways to handle asynchronous operations in JavaScript. async/await is built on Promises but offers cleaner syntax for sequential async flows.",
    items: [
      {
        name: ".then() chains",
        features: {
          Syntax: "promise.then(fn).catch(fn)",
          "Error handling": ".catch() at end of chain",
          Readability: "Can get messy with nested chains",
          "Parallel execution": "Natural with Promise.all()",
          Debugging: "Stack traces can be confusing",
          "Best for": "Simple chains, parallel operations",
        },
      },
      {
        name: "async/await",
        features: {
          Syntax: "const result = await promise",
          "Error handling": "try/catch blocks",
          Readability: "Reads like synchronous code",
          "Parallel execution": "Need explicit Promise.all()",
          Debugging: "Clear stack traces",
          "Best for": "Sequential async flows, complex logic",
        },
      },
    ],
    verdict:
      "Use async/await for most async code — it is more readable and easier to debug. Use .then() for simple one-off chains or when you need the composability of promise chains.",
    codeExample: `// .then() chain\nfetch("/api/user")\n  .then(res => res.json())\n  .then(user => fetch(\`/api/posts/\${user.id}\`))\n  .then(res => res.json())\n  .catch(err => console.error(err));\n\n// async/await - same logic, clearer\nasync function getUserPosts() {\n  try {\n    const res = await fetch("/api/user");\n    const user = await res.json();\n    const postsRes = await fetch(\`/api/posts/\${user.id}\`);\n    return postsRes.json();\n  } catch (err) {\n    console.error(err);\n  }\n}`,
    relatedGlossary: ["promise", "async-await", "callback", "try-catch"],
    relatedTutorials: ["async"],
  },
  {
    slug: "flexbox-vs-grid",
    title: "CSS Flexbox vs Grid",
    description:
      "Two complementary CSS layout systems. Flexbox handles one-dimensional layouts while Grid handles two-dimensional layouts.",
    items: [
      {
        name: "Flexbox",
        features: {
          Dimension: "One-dimensional (row OR column)",
          "Content-driven": "Yes, items size based on content",
          Alignment: "Great for centering and distributing space",
          "Learning curve": "Easier to start with",
          "Browser support": "Excellent",
          "Best for": "Navigation bars, card rows, centering, small layouts",
        },
      },
      {
        name: "CSS Grid",
        features: {
          Dimension: "Two-dimensional (rows AND columns)",
          "Content-driven": "No, layout-driven (explicit tracks)",
          Alignment: "Precise control over placement",
          "Learning curve": "More concepts to learn",
          "Browser support": "Excellent",
          "Best for": "Page layouts, dashboards, galleries, complex grids",
        },
      },
    ],
    verdict:
      "Use Flexbox for one-dimensional layouts (navbars, card rows, alignment). Use Grid for two-dimensional layouts (page structure, dashboards). They work great together.",
    codeExample: `/* Flexbox - navigation bar */\n.nav {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n/* Grid - page layout */\n.page {\n  display: grid;\n  grid-template-columns: 250px 1fr;\n  grid-template-rows: auto 1fr auto;\n  gap: 1rem;\n  min-height: 100vh;\n}`,
    relatedGlossary: ["flexbox", "css-grid", "responsive-design"],
    relatedTutorials: ["css"],
  },
  {
    slug: "for-loop-vs-for-of-vs-for-in",
    title: "for vs for...of vs for...in",
    description:
      "Three loop constructs in JavaScript. Each is designed for different iteration scenarios.",
    items: [
      {
        name: "for loop",
        features: {
          Syntax: "for (let i = 0; i < n; i++)",
          "Iterates over": "Index-based (any countable range)",
          "Works on": "Arrays, strings, any indexed structure",
          "Can break/continue": "Yes",
          "Best for": "When you need the index, or non-standard iteration",
        },
      },
      {
        name: "for...of",
        features: {
          Syntax: "for (const item of iterable)",
          "Iterates over": "Values of iterable objects",
          "Works on": "Arrays, strings, Maps, Sets, generators",
          "Can break/continue": "Yes",
          "Best for": "Iterating array values, most general-purpose loops",
        },
      },
      {
        name: "for...in",
        features: {
          Syntax: "for (const key in object)",
          "Iterates over": "Enumerable property names (keys)",
          "Works on": "Objects (avoid on arrays)",
          "Can break/continue": "Yes",
          "Best for": "Iterating object keys (use Object.keys/entries instead)",
        },
      },
    ],
    verdict:
      "Use for...of for arrays and iterables. Use Object.entries() or Object.keys() with for...of for objects. Use classic for loops when you need the index. Avoid for...in on arrays.",
    codeExample: `const arr = ["a", "b", "c"];\n\n// for...of - values\nfor (const val of arr) console.log(val); // a, b, c\n\n// for - when you need index\nfor (let i = 0; i < arr.length; i++) {\n  console.log(i, arr[i]);\n}\n\n// for...in - object keys\nconst obj = { x: 1, y: 2 };\nfor (const key in obj) console.log(key); // x, y\n\n// Better: Object.entries\nfor (const [k, v] of Object.entries(obj)) {\n  console.log(k, v);\n}`,
    relatedGlossary: ["array-methods", "higher-order-function"],
    relatedTutorials: ["fundamentals"],
  },
  {
    slug: "localstorage-vs-sessionstorage-vs-cookies",
    title: "localStorage vs sessionStorage vs Cookies",
    description:
      "Three client-side storage mechanisms with different lifetimes, size limits, and use cases.",
    items: [
      {
        name: "localStorage",
        features: {
          Lifetime: "Permanent (until manually cleared)",
          "Size limit": "~5-10 MB",
          "Sent with requests": "No",
          "Accessible from": "Same origin",
          API: "setItem/getItem/removeItem",
          "Best for": "User preferences, theme, cached data",
        },
      },
      {
        name: "sessionStorage",
        features: {
          Lifetime: "Until tab/window closes",
          "Size limit": "~5-10 MB",
          "Sent with requests": "No",
          "Accessible from": "Same origin, same tab",
          API: "setItem/getItem/removeItem",
          "Best for": "Form data, temporary state per tab",
        },
      },
      {
        name: "Cookies",
        features: {
          Lifetime: "Configurable (expires/max-age)",
          "Size limit": "~4 KB per cookie",
          "Sent with requests": "Yes (every HTTP request)",
          "Accessible from": "Configurable (domain, path, SameSite)",
          API: "document.cookie (awkward)",
          "Best for": "Authentication tokens, server-readable state",
        },
      },
    ],
    verdict:
      "Use localStorage for persistent client-side data. Use sessionStorage for per-tab temporary data. Use cookies only for data the server needs to read (auth tokens). Never store sensitive data in any of these without encryption.",
    codeExample: `// localStorage\nlocalStorage.setItem("theme", "dark");\nconst theme = localStorage.getItem("theme");\n\n// sessionStorage\nsessionStorage.setItem("formDraft", JSON.stringify(data));\n\n// Cookies\ndocument.cookie = "token=abc123; max-age=86400; SameSite=Strict";`,
    relatedGlossary: ["local-storage", "json", "jwt"],
    relatedTutorials: ["fundamentals"],
  },
  {
    slug: "spread-vs-rest",
    title: "Spread (...) vs Rest (...) Operator",
    description:
      "Same syntax (...), completely different purposes. Spread expands elements, Rest collects them.",
    items: [
      {
        name: "Spread (...)",
        features: {
          Context: "Array literals, object literals, function calls",
          Purpose: "Expand/unpack elements",
          Direction: "One to many",
          Position: "Anywhere in array/object",
          "Use case": "Copying, merging, passing arguments",
        },
      },
      {
        name: "Rest (...)",
        features: {
          Context: "Function parameters, destructuring",
          Purpose: "Collect remaining elements",
          Direction: "Many to one",
          Position: "Must be last parameter",
          "Use case": "Variadic functions, extracting remaining items",
        },
      },
    ],
    verdict:
      "Spread expands an iterable into individual elements (used in calls and literals). Rest collects multiple elements into an array (used in function params and destructuring).",
    codeExample: `// SPREAD - expand elements\nconst arr = [1, 2, 3];\nconst copy = [...arr, 4, 5]; // [1, 2, 3, 4, 5]\n\nconst obj = { ...user, role: "admin" };\nMath.max(...arr); // 3\n\n// REST - collect elements\nfunction sum(...numbers) {\n  return numbers.reduce((a, b) => a + b, 0);\n}\nsum(1, 2, 3, 4); // 10\n\nconst [first, ...others] = [1, 2, 3];\n// first = 1, others = [2, 3]`,
    relatedGlossary: ["spread-operator", "rest-parameters", "destructuring"],
    relatedTutorials: ["fundamentals"],
  },
];

export function getComparisonBySlug(slug: string): Comparison | undefined {
  return comparisons.find((c) => c.slug === slug);
}

export function getAllComparisonSlugs(): string[] {
  return comparisons.map((c) => c.slug);
}
