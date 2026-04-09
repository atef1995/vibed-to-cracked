export interface GlossaryTerm {
  term: string;
  slug: string;
  definition: string;
  category:
    | "javascript"
    | "html"
    | "css"
    | "react"
    | "dsa"
    | "web"
    | "typescript"
    | "tooling";
  example?: string;
  relatedTutorials?: string[]; // category slugs
  seeAlso?: string[]; // other glossary term slugs
}

export const glossaryTerms: GlossaryTerm[] = [
  // JavaScript fundamentals
  {
    term: "Variable",
    slug: "variable",
    definition:
      "A named container that stores a value in memory. JavaScript uses `let`, `const`, and `var` to declare variables. `let` and `const` are block-scoped, while `var` is function-scoped.",
    category: "javascript",
    example: `let name = "Alice";\nconst age = 25;\nvar legacy = true;`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["hoisting", "scope", "const-vs-let-vs-var"],
  },
  {
    term: "Hoisting",
    slug: "hoisting",
    definition:
      "JavaScript's behavior of moving variable and function declarations to the top of their scope before code execution. `var` declarations are hoisted and initialized to `undefined`, while `let` and `const` are hoisted but not initialized (temporal dead zone).",
    category: "javascript",
    example: `console.log(x); // undefined (var is hoisted)\nvar x = 5;\n\nconsole.log(y); // ReferenceError (let has TDZ)\nlet y = 10;`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["variable", "scope", "temporal-dead-zone"],
  },
  {
    term: "Closure",
    slug: "closure",
    definition:
      "A function that retains access to variables from its outer (enclosing) scope even after the outer function has returned. Closures are created every time a function is created in JavaScript.",
    category: "javascript",
    example: `function counter() {\n  let count = 0;\n  return function() {\n    return ++count;\n  };\n}\nconst inc = counter();\ninc(); // 1\ninc(); // 2`,
    relatedTutorials: ["fundamentals", "advanced"],
    seeAlso: ["scope", "iife", "higher-order-function"],
  },
  {
    term: "Scope",
    slug: "scope",
    definition:
      "The region of code where a variable is accessible. JavaScript has global scope, function scope, and block scope. Block scope was introduced with `let` and `const` in ES6.",
    category: "javascript",
    example: `function example() {\n  let blockScoped = "only here";\n  if (true) {\n    let inner = "block only";\n  }\n  // inner is not accessible here\n}`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["closure", "hoisting", "variable"],
  },
  {
    term: "Callback",
    slug: "callback",
    definition:
      "A function passed as an argument to another function, to be executed later. Callbacks are the foundation of asynchronous JavaScript and are used extensively in event handling and array methods.",
    category: "javascript",
    example: `setTimeout(function() {\n  console.log("Runs after 1 second");\n}, 1000);\n\n[1, 2, 3].forEach(function(n) {\n  console.log(n);\n});`,
    relatedTutorials: ["fundamentals", "async"],
    seeAlso: ["promise", "async-await", "higher-order-function"],
  },
  {
    term: "Promise",
    slug: "promise",
    definition:
      "An object representing the eventual completion or failure of an asynchronous operation. A Promise is in one of three states: pending, fulfilled, or rejected. Promises can be chained with `.then()` and `.catch()`.",
    category: "javascript",
    example: `const fetchData = new Promise((resolve, reject) => {\n  setTimeout(() => resolve("Done!"), 1000);\n});\n\nfetchData\n  .then(result => console.log(result))\n  .catch(error => console.error(error));`,
    relatedTutorials: ["async"],
    seeAlso: ["async-await", "callback", "event-loop"],
  },
  {
    term: "Async/Await",
    slug: "async-await",
    definition:
      "Syntactic sugar built on top of Promises that makes asynchronous code look and behave like synchronous code. `async` functions always return a Promise, and `await` pauses execution until a Promise resolves.",
    category: "javascript",
    example: `async function getData() {\n  try {\n    const response = await fetch("/api/data");\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error("Failed:", error);\n  }\n}`,
    relatedTutorials: ["async"],
    seeAlso: ["promise", "event-loop", "try-catch"],
  },
  {
    term: "Event Loop",
    slug: "event-loop",
    definition:
      "The mechanism that allows JavaScript to perform non-blocking operations despite being single-threaded. It continuously checks if the call stack is empty, then moves tasks from the callback queue to the call stack for execution.",
    category: "javascript",
    example: `console.log("1"); // Call stack\nsetTimeout(() => console.log("2"), 0); // Task queue\nPromise.resolve().then(() => console.log("3")); // Microtask queue\nconsole.log("4");\n// Output: 1, 4, 3, 2`,
    relatedTutorials: ["async", "advanced"],
    seeAlso: ["promise", "callback", "async-await"],
  },
  {
    term: "Prototype",
    slug: "prototype",
    definition:
      "Every JavaScript object has a hidden internal property called `[[Prototype]]` that links to another object. When a property is accessed on an object and not found, JavaScript walks up the prototype chain to find it. This is the basis of JavaScript's inheritance model.",
    category: "javascript",
    example: `function Dog(name) {\n  this.name = name;\n}\nDog.prototype.bark = function() {\n  return this.name + " says woof!";\n};\nconst rex = new Dog("Rex");\nrex.bark(); // "Rex says woof!"`,
    relatedTutorials: ["oop"],
    seeAlso: ["class", "inheritance", "this-keyword"],
  },
  {
    term: "Class",
    slug: "class",
    definition:
      "ES6 syntactic sugar over JavaScript's prototype-based inheritance. Classes provide a cleaner way to create objects and implement inheritance using `extends` and `super`.",
    category: "javascript",
    example: `class Animal {\n  constructor(name) {\n    this.name = name;\n  }\n  speak() {\n    return this.name + " makes a sound";\n  }\n}\nclass Dog extends Animal {\n  speak() {\n    return this.name + " barks";\n  }\n}`,
    relatedTutorials: ["oop"],
    seeAlso: ["prototype", "inheritance", "constructor"],
  },
  {
    term: "Arrow Function",
    slug: "arrow-function",
    definition:
      "A compact function syntax introduced in ES6. Arrow functions do not have their own `this`, `arguments`, or `super` bindings, making them ideal for callbacks and methods that need to preserve the outer `this` context.",
    category: "javascript",
    example: `const add = (a, b) => a + b;\nconst greet = name => \`Hello, \${name}\`;\nconst getUser = () => ({ name: "Alice", age: 25 });`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["this-keyword", "callback", "higher-order-function"],
  },
  {
    term: "Destructuring",
    slug: "destructuring",
    definition:
      "A syntax for extracting values from arrays or properties from objects into distinct variables. Destructuring simplifies code and is commonly used in function parameters, imports, and React hooks.",
    category: "javascript",
    example: `const [first, second] = [1, 2, 3];\nconst { name, age } = { name: "Alice", age: 25 };\nfunction greet({ name, age }) {\n  return \`\${name} is \${age}\`;\n}`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["spread-operator", "rest-parameters"],
  },
  {
    term: "Spread Operator",
    slug: "spread-operator",
    definition:
      "The `...` syntax that expands an iterable (array, string, object) into individual elements. Used for copying arrays/objects, merging, and passing multiple arguments to functions.",
    category: "javascript",
    example: `const arr1 = [1, 2, 3];\nconst arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]\n\nconst obj1 = { a: 1, b: 2 };\nconst obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["rest-parameters", "destructuring"],
  },
  {
    term: "Rest Parameters",
    slug: "rest-parameters",
    definition:
      "The `...` syntax used in function parameters to collect all remaining arguments into an array. Unlike the `arguments` object, rest parameters produce a real array.",
    category: "javascript",
    example: `function sum(...numbers) {\n  return numbers.reduce((total, n) => total + n, 0);\n}\nsum(1, 2, 3, 4); // 10`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["spread-operator", "destructuring"],
  },
  {
    term: "Template Literal",
    slug: "template-literal",
    definition:
      "Strings delimited by backticks that allow embedded expressions via `${expression}` syntax. Template literals support multi-line strings and tagged templates for custom string processing.",
    category: "javascript",
    example:
      'const name = "World";\nconst greeting = `Hello, ${name}!`;\nconst multiline = `Line 1\nLine 2\nLine 3`;',
    relatedTutorials: ["fundamentals"],
    seeAlso: ["string-methods"],
  },
  {
    term: "This Keyword",
    slug: "this-keyword",
    definition:
      "A special keyword that refers to the object a function is called on. Its value depends on how a function is invoked: in a method, `this` refers to the owner object; in a regular function, it defaults to `globalThis` (or `undefined` in strict mode).",
    category: "javascript",
    example: `const user = {\n  name: "Alice",\n  greet() {\n    return "Hi, " + this.name;\n  }\n};\nuser.greet(); // "Hi, Alice"`,
    relatedTutorials: ["oop", "fundamentals"],
    seeAlso: ["arrow-function", "class", "prototype"],
  },
  {
    term: "Higher-Order Function",
    slug: "higher-order-function",
    definition:
      "A function that either takes one or more functions as arguments, returns a function, or both. Common examples include `map`, `filter`, `reduce`, and `forEach`.",
    category: "javascript",
    example: `const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconst evens = numbers.filter(n => n % 2 === 0);\nconst sum = numbers.reduce((acc, n) => acc + n, 0);`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["callback", "closure", "arrow-function"],
  },
  {
    term: "IIFE",
    slug: "iife",
    definition:
      "Immediately Invoked Function Expression — a function that runs immediately after being defined. IIFEs create a private scope and are used to avoid polluting the global namespace.",
    category: "javascript",
    example: `(function() {\n  const secret = "hidden";\n  console.log(secret);\n})();\n// secret is not accessible here`,
    relatedTutorials: ["advanced"],
    seeAlso: ["closure", "scope", "module"],
  },
  {
    term: "Module",
    slug: "module",
    definition:
      "A self-contained unit of code that exports specific values (functions, objects, classes) and imports what it needs from other modules. ES modules use `import`/`export` syntax.",
    category: "javascript",
    example: `// math.js\nexport const add = (a, b) => a + b;\nexport const multiply = (a, b) => a * b;\n\n// app.js\nimport { add, multiply } from './math.js';`,
    relatedTutorials: ["advanced"],
    seeAlso: ["iife", "scope"],
  },
  {
    term: "Temporal Dead Zone",
    slug: "temporal-dead-zone",
    definition:
      "The period between entering a scope and the point where a `let` or `const` variable is declared. Accessing the variable during this period throws a ReferenceError. This prevents bugs caused by using variables before they are initialized.",
    category: "javascript",
    example: `// This throws ReferenceError\n{\n  console.log(x); // TDZ - cannot access before initialization\n  let x = 5;\n}`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["hoisting", "scope", "variable"],
  },
  {
    term: "Truthy and Falsy",
    slug: "truthy-and-falsy",
    definition:
      "In JavaScript, every value is either truthy or falsy when evaluated in a boolean context. Falsy values are: `false`, `0`, `''`, `null`, `undefined`, `NaN`, and `0n`. Everything else is truthy, including empty arrays and objects.",
    category: "javascript",
    example: `if ("hello") console.log("truthy");\nif (0) console.log("never runs");\n\n// Common pattern\nconst name = userInput || "default";`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["type-coercion", "nullish-coalescing"],
  },
  {
    term: "Type Coercion",
    slug: "type-coercion",
    definition:
      "JavaScript's automatic conversion of values from one type to another during operations. Implicit coercion happens with operators like `==`, `+`, and in boolean contexts. Explicit coercion uses functions like `Number()`, `String()`, `Boolean()`.",
    category: "javascript",
    example: `"5" + 3;    // "53" (string concatenation)\n"5" - 3;    // 2 (numeric subtraction)\n"5" == 5;   // true (loose equality coerces)\n"5" === 5;  // false (strict equality, no coercion)`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["truthy-and-falsy", "strict-equality"],
  },
  {
    term: "Strict Equality",
    slug: "strict-equality",
    definition:
      "The `===` operator that checks both value and type without type coercion. Unlike `==` (loose equality), strict equality does not convert operands before comparing. Always prefer `===` over `==`.",
    category: "javascript",
    example: `5 === 5;      // true\n5 === "5";    // false (different types)\n5 == "5";     // true (loose equality coerces)\nnull === undefined; // false\nnull == undefined;  // true`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["type-coercion", "truthy-and-falsy"],
  },
  {
    term: "Nullish Coalescing",
    slug: "nullish-coalescing",
    definition:
      "The `??` operator that returns the right-hand operand when the left-hand operand is `null` or `undefined`. Unlike `||`, it does not treat `0`, `''`, or `false` as nullish, making it safer for default values.",
    category: "javascript",
    example: `const count = 0;\ncount || 10;  // 10 (0 is falsy)\ncount ?? 10;  // 0 (0 is not null/undefined)\n\nconst name = null;\nname ?? "Anonymous"; // "Anonymous"`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["truthy-and-falsy", "optional-chaining"],
  },
  {
    term: "Optional Chaining",
    slug: "optional-chaining",
    definition:
      "The `?.` operator that safely accesses deeply nested object properties without throwing if an intermediate value is `null` or `undefined`. Returns `undefined` instead of throwing a TypeError.",
    category: "javascript",
    example: `const user = { address: { city: "NYC" } };\nuser?.address?.city;    // "NYC"\nuser?.phone?.number;   // undefined (no error)\nuser?.getName?.();     // undefined if getName doesn't exist`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["nullish-coalescing", "destructuring"],
  },
  {
    term: "Map",
    slug: "map-data-structure",
    definition:
      "A built-in collection that stores key-value pairs where keys can be any type (not just strings). Maps maintain insertion order and provide O(1) lookup. Unlike plain objects, Maps don't have prototype pollution concerns.",
    category: "javascript",
    example: `const map = new Map();\nmap.set("name", "Alice");\nmap.set(42, "answer");\nmap.get("name"); // "Alice"\nmap.size; // 2`,
    relatedTutorials: ["data-structures"],
    seeAlso: ["set", "object"],
  },
  {
    term: "Set",
    slug: "set",
    definition:
      "A built-in collection that stores unique values of any type. Duplicate values are automatically ignored. Sets provide O(1) add/delete/has operations and are useful for deduplication.",
    category: "javascript",
    example: `const set = new Set([1, 2, 3, 3, 3]);\nset.size; // 3\nset.add(4);\nset.has(2); // true\n\n// Deduplicate an array\nconst unique = [...new Set([1, 1, 2, 3, 3])]; // [1, 2, 3]`,
    relatedTutorials: ["data-structures"],
    seeAlso: ["map-data-structure", "array-methods"],
  },
  {
    term: "Array Methods",
    slug: "array-methods",
    definition:
      "Built-in methods on the Array prototype for transforming and querying arrays. Key methods include `map` (transform each element), `filter` (select elements), `reduce` (accumulate), `find` (first match), `some`/`every` (boolean tests), and `sort`.",
    category: "javascript",
    example: `const nums = [3, 1, 4, 1, 5];\nnums.map(n => n * 2);       // [6, 2, 8, 2, 10]\nnums.filter(n => n > 2);    // [3, 4, 5]\nnums.find(n => n > 3);      // 4\nnums.reduce((a, b) => a + b, 0); // 14`,
    relatedTutorials: ["fundamentals", "data-structures"],
    seeAlso: ["higher-order-function", "spread-operator"],
  },
  {
    term: "String Methods",
    slug: "string-methods",
    definition:
      "Built-in methods on the String prototype for searching, transforming, and extracting parts of strings. Common methods include `includes`, `startsWith`, `endsWith`, `slice`, `split`, `trim`, `replace`, and `toLowerCase`.",
    category: "javascript",
    example: `const str = "  Hello, World!  ";\nstr.trim();              // "Hello, World!"\nstr.includes("World");   // true\nstr.split(", ");         // ["  Hello", "World!  "]\nstr.replace("World", "JS"); // "  Hello, JS!  "`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["template-literal", "array-methods"],
  },
  {
    term: "Try/Catch",
    slug: "try-catch",
    definition:
      "A statement for handling runtime errors gracefully. Code in the `try` block is executed, and if it throws an error, execution jumps to the `catch` block. The `finally` block runs regardless of success or failure.",
    category: "javascript",
    example: `try {\n  const data = JSON.parse(invalidJson);\n} catch (error) {\n  console.error("Parse failed:", error.message);\n} finally {\n  console.log("Always runs");\n}`,
    relatedTutorials: ["fundamentals", "async"],
    seeAlso: ["async-await", "promise"],
  },
  {
    term: "Constructor",
    slug: "constructor",
    definition:
      "A special method inside a class that is called when a new instance is created with the `new` keyword. It initializes the object's properties and sets up its initial state.",
    category: "javascript",
    example: `class User {\n  constructor(name, email) {\n    this.name = name;\n    this.email = email;\n  }\n}\nconst user = new User("Alice", "alice@example.com");`,
    relatedTutorials: ["oop"],
    seeAlso: ["class", "prototype", "this-keyword"],
  },
  {
    term: "Inheritance",
    slug: "inheritance",
    definition:
      "A mechanism where a class (child) derives properties and methods from another class (parent). In JavaScript, inheritance is achieved through the prototype chain or the `extends` keyword with ES6 classes.",
    category: "javascript",
    example: `class Animal {\n  constructor(name) { this.name = name; }\n  speak() { return \`\${this.name} makes a sound\`; }\n}\nclass Dog extends Animal {\n  speak() { return \`\${this.name} barks\`; }\n}\nnew Dog("Rex").speak(); // "Rex barks"`,
    relatedTutorials: ["oop"],
    seeAlso: ["class", "prototype", "polymorphism"],
  },
  {
    term: "Polymorphism",
    slug: "polymorphism",
    definition:
      "The ability for different classes to respond to the same method call in different ways. In JavaScript, polymorphism is achieved through method overriding in subclasses and duck typing.",
    category: "javascript",
    example: `class Shape {\n  area() { return 0; }\n}\nclass Circle extends Shape {\n  constructor(r) { super(); this.r = r; }\n  area() { return Math.PI * this.r ** 2; }\n}\nclass Square extends Shape {\n  constructor(s) { super(); this.s = s; }\n  area() { return this.s ** 2; }\n}`,
    relatedTutorials: ["oop"],
    seeAlso: ["inheritance", "class", "encapsulation"],
  },
  {
    term: "Encapsulation",
    slug: "encapsulation",
    definition:
      "The practice of bundling data and methods that operate on that data within a single unit, while restricting direct access to some of the object's internals. JavaScript uses closures and private class fields (`#`) for encapsulation.",
    category: "javascript",
    example: `class BankAccount {\n  #balance = 0; // private field\n  deposit(amount) {\n    if (amount > 0) this.#balance += amount;\n  }\n  get balance() { return this.#balance; }\n}`,
    relatedTutorials: ["oop"],
    seeAlso: ["closure", "class", "polymorphism"],
  },
  // DOM
  {
    term: "DOM",
    slug: "dom",
    definition:
      "Document Object Model — a tree-structured representation of an HTML document that allows JavaScript to read and manipulate page content, structure, and styles. Every HTML element becomes a node in the DOM tree.",
    category: "javascript",
    example: `const heading = document.querySelector("h1");\nheading.textContent = "New Title";\nheading.style.color = "blue";\n\nconst newEl = document.createElement("p");\nnewEl.textContent = "Added dynamically";\ndocument.body.appendChild(newEl);`,
    relatedTutorials: ["dom"],
    seeAlso: ["event-listener", "query-selector"],
  },
  {
    term: "Event Listener",
    slug: "event-listener",
    definition:
      "A function attached to a DOM element that executes when a specific event (click, keypress, submit, etc.) occurs on that element. Added with `addEventListener` and removed with `removeEventListener`.",
    category: "javascript",
    example: `const button = document.querySelector("button");\nbutton.addEventListener("click", (event) => {\n  console.log("Clicked!", event.target);\n});\n\n// Remove listener\nbutton.removeEventListener("click", handler);`,
    relatedTutorials: ["dom"],
    seeAlso: ["dom", "event-bubbling", "callback"],
  },
  {
    term: "Event Bubbling",
    slug: "event-bubbling",
    definition:
      "The DOM event propagation pattern where an event triggered on a child element propagates upward through its ancestors. This allows event delegation — attaching a single listener to a parent to handle events on its children.",
    category: "javascript",
    example: `// Event delegation pattern\ndocument.querySelector("ul").addEventListener("click", (e) => {\n  if (e.target.tagName === "LI") {\n    console.log("Clicked:", e.target.textContent);\n  }\n});`,
    relatedTutorials: ["dom"],
    seeAlso: ["event-listener", "dom"],
  },
  {
    term: "Query Selector",
    slug: "query-selector",
    definition:
      "`document.querySelector()` returns the first element matching a CSS selector. `querySelectorAll()` returns all matching elements as a NodeList. These are the modern replacements for `getElementById` and `getElementsByClassName`.",
    category: "javascript",
    example: `const main = document.querySelector("#main");\nconst buttons = document.querySelectorAll(".btn");\nconst first = document.querySelector("nav > a:first-child");`,
    relatedTutorials: ["dom"],
    seeAlso: ["dom", "event-listener"],
  },
  // HTML
  {
    term: "Semantic HTML",
    slug: "semantic-html",
    definition:
      "Using HTML elements that convey meaning about the content they contain, rather than just presentation. Elements like `<article>`, `<nav>`, `<header>`, `<main>`, and `<section>` improve accessibility, SEO, and code readability.",
    category: "html",
    example: `<header>\n  <nav>...</nav>\n</header>\n<main>\n  <article>\n    <h1>Title</h1>\n    <p>Content...</p>\n  </article>\n  <aside>Sidebar</aside>\n</main>\n<footer>...</footer>`,
    relatedTutorials: ["html"],
    seeAlso: ["accessibility", "dom"],
  },
  {
    term: "Accessibility",
    slug: "accessibility",
    definition:
      "The practice of making web content usable by everyone, including people using screen readers, keyboards, or other assistive technologies. Key practices include semantic HTML, ARIA attributes, alt text, focus management, and color contrast.",
    category: "html",
    example: `<button aria-label="Close menu" aria-expanded="false">\n  <span aria-hidden="true">&times;</span>\n</button>\n\n<img src="chart.png" alt="Sales increased 40% in Q4 2024">`,
    relatedTutorials: ["html"],
    seeAlso: ["semantic-html"],
  },
  // CSS
  {
    term: "Flexbox",
    slug: "flexbox",
    definition:
      "A CSS layout model for one-dimensional arrangements (row or column). Flexbox distributes space among items and handles alignment, even when sizes are dynamic. Set `display: flex` on the container and control children with properties like `justify-content`, `align-items`, and `flex-grow`.",
    category: "css",
    example: `.container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 1rem;\n}`,
    relatedTutorials: ["css"],
    seeAlso: ["css-grid", "box-model"],
  },
  {
    term: "CSS Grid",
    slug: "css-grid",
    definition:
      "A CSS layout model for two-dimensional layouts with rows and columns. Grid gives precise control over placement and sizing of elements. More powerful than Flexbox for complex page layouts.",
    category: "css",
    example: `.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-template-rows: auto 1fr auto;\n  gap: 1rem;\n}`,
    relatedTutorials: ["css"],
    seeAlso: ["flexbox", "responsive-design"],
  },
  {
    term: "Box Model",
    slug: "box-model",
    definition:
      "Every HTML element is a rectangular box consisting of content, padding, border, and margin. `box-sizing: border-box` makes width/height include padding and border, which simplifies layout calculations.",
    category: "css",
    example: `.element {\n  box-sizing: border-box;\n  width: 200px;   /* includes padding + border */\n  padding: 20px;\n  border: 2px solid #333;\n  margin: 10px;\n}`,
    relatedTutorials: ["css"],
    seeAlso: ["flexbox", "css-grid"],
  },
  {
    term: "Responsive Design",
    slug: "responsive-design",
    definition:
      "An approach to web design that makes pages look good on all screen sizes. Responsive design uses fluid grids, flexible images, and CSS media queries to adapt layouts from mobile to desktop.",
    category: "css",
    example: `.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 0 1rem;\n}\n@media (max-width: 768px) {\n  .grid { grid-template-columns: 1fr; }\n}`,
    relatedTutorials: ["css"],
    seeAlso: ["flexbox", "css-grid", "media-query"],
  },
  {
    term: "Media Query",
    slug: "media-query",
    definition:
      "A CSS feature that applies styles conditionally based on the device's characteristics (width, height, orientation, color scheme). Media queries are the foundation of responsive design.",
    category: "css",
    example: `/* Mobile-first approach */\n.sidebar { display: none; }\n\n@media (min-width: 768px) {\n  .sidebar { display: block; }\n}\n\n@media (prefers-color-scheme: dark) {\n  body { background: #1a1a1a; color: #fff; }\n}`,
    relatedTutorials: ["css"],
    seeAlso: ["responsive-design"],
  },
  // DSA
  {
    term: "Big O Notation",
    slug: "big-o-notation",
    definition:
      "A mathematical notation that describes the upper bound of an algorithm's time or space complexity as input size grows. Common complexities from fastest to slowest: O(1), O(log n), O(n), O(n log n), O(n^2), O(2^n).",
    category: "dsa",
    example: `// O(1) - Constant\narray[0];\n\n// O(n) - Linear\narray.find(x => x === target);\n\n// O(n^2) - Quadratic\nfor (let i = 0; i < n; i++)\n  for (let j = 0; j < n; j++) { }`,
    relatedTutorials: ["data-structures"],
    seeAlso: ["linked-list", "hash-map", "binary-search"],
  },
  {
    term: "Linked List",
    slug: "linked-list",
    definition:
      "A linear data structure where each element (node) contains a value and a pointer to the next node. Unlike arrays, linked lists don't require contiguous memory and allow O(1) insertions at the head, but have O(n) random access.",
    category: "dsa",
    example: `class Node {\n  constructor(value) {\n    this.value = value;\n    this.next = null;\n  }\n}\nclass LinkedList {\n  constructor() { this.head = null; }\n  prepend(value) {\n    const node = new Node(value);\n    node.next = this.head;\n    this.head = node;\n  }\n}`,
    relatedTutorials: ["data-structures"],
    seeAlso: ["big-o-notation", "stack", "queue"],
  },
  {
    term: "Stack",
    slug: "stack",
    definition:
      "A Last-In-First-Out (LIFO) data structure where elements are added and removed from the same end (the top). The JavaScript call stack is a stack. Common operations: push (add to top), pop (remove from top), peek (view top).",
    category: "dsa",
    example: `class Stack {\n  #items = [];\n  push(item) { this.#items.push(item); }\n  pop() { return this.#items.pop(); }\n  peek() { return this.#items[this.#items.length - 1]; }\n  get size() { return this.#items.length; }\n}`,
    relatedTutorials: ["data-structures"],
    seeAlso: ["queue", "linked-list", "recursion"],
  },
  {
    term: "Queue",
    slug: "queue",
    definition:
      "A First-In-First-Out (FIFO) data structure where elements are added at the back and removed from the front. Used in BFS, task scheduling, and message queues. Common operations: enqueue (add), dequeue (remove), peek (view front).",
    category: "dsa",
    example: `class Queue {\n  #items = [];\n  enqueue(item) { this.#items.push(item); }\n  dequeue() { return this.#items.shift(); }\n  peek() { return this.#items[0]; }\n  get size() { return this.#items.length; }\n}`,
    relatedTutorials: ["data-structures"],
    seeAlso: ["stack", "linked-list", "binary-tree"],
  },
  {
    term: "Hash Map",
    slug: "hash-map",
    definition:
      "A data structure that maps keys to values using a hash function for O(1) average-case lookups, insertions, and deletions. In JavaScript, plain objects and the `Map` class serve as hash maps.",
    category: "dsa",
    example: `// Using Map\nconst map = new Map();\nmap.set("name", "Alice");\nmap.get("name"); // "Alice" - O(1)\n\n// Frequency counter pattern\nfunction charCount(str) {\n  const freq = {};\n  for (const ch of str) freq[ch] = (freq[ch] || 0) + 1;\n  return freq;\n}`,
    relatedTutorials: ["data-structures"],
    seeAlso: ["map-data-structure", "big-o-notation", "set"],
  },
  {
    term: "Binary Tree",
    slug: "binary-tree",
    definition:
      "A hierarchical data structure where each node has at most two children (left and right). A Binary Search Tree (BST) maintains the property that left children are smaller and right children are larger than the parent.",
    category: "dsa",
    example: `class TreeNode {\n  constructor(value) {\n    this.value = value;\n    this.left = null;\n    this.right = null;\n  }\n}\n// BST insert\nfunction insert(root, val) {\n  if (!root) return new TreeNode(val);\n  if (val < root.value) root.left = insert(root.left, val);\n  else root.right = insert(root.right, val);\n  return root;\n}`,
    relatedTutorials: ["data-structures"],
    seeAlso: ["recursion", "big-o-notation", "graph"],
  },
  {
    term: "Graph",
    slug: "graph",
    definition:
      "A data structure consisting of nodes (vertices) connected by edges. Graphs can be directed or undirected, weighted or unweighted. Used to model networks, social connections, maps, and dependencies.",
    category: "dsa",
    example: `class Graph {\n  constructor() { this.adjacencyList = new Map(); }\n  addVertex(v) { this.adjacencyList.set(v, []); }\n  addEdge(v1, v2) {\n    this.adjacencyList.get(v1).push(v2);\n    this.adjacencyList.get(v2).push(v1);\n  }\n}`,
    relatedTutorials: ["data-structures"],
    seeAlso: ["binary-tree", "recursion", "big-o-notation"],
  },
  {
    term: "Recursion",
    slug: "recursion",
    definition:
      "A technique where a function calls itself to solve smaller instances of the same problem. Every recursive function needs a base case (stopping condition) and a recursive case. Common in tree traversals, divide-and-conquer algorithms, and mathematical computations.",
    category: "dsa",
    example: `function factorial(n) {\n  if (n <= 1) return 1; // base case\n  return n * factorial(n - 1); // recursive case\n}\nfactorial(5); // 120`,
    relatedTutorials: ["data-structures", "advanced"],
    seeAlso: ["binary-tree", "stack", "big-o-notation"],
  },
  {
    term: "Binary Search",
    slug: "binary-search",
    definition:
      "An efficient O(log n) search algorithm that works on sorted arrays by repeatedly dividing the search interval in half. Compare the target to the middle element and eliminate half the remaining elements each step.",
    category: "dsa",
    example: `function binarySearch(arr, target) {\n  let low = 0, high = arr.length - 1;\n  while (low <= high) {\n    const mid = Math.floor((low + high) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) low = mid + 1;\n    else high = mid - 1;\n  }\n  return -1;\n}`,
    relatedTutorials: ["data-structures"],
    seeAlso: ["big-o-notation", "recursion"],
  },
  {
    term: "Sorting Algorithm",
    slug: "sorting-algorithm",
    definition:
      "An algorithm that arranges elements in a specific order. Common algorithms include Bubble Sort O(n^2), Merge Sort O(n log n), and Quick Sort O(n log n) average. JavaScript's built-in `Array.sort()` uses Timsort.",
    category: "dsa",
    example: `// Quick sort\nfunction quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  const pivot = arr[0];\n  const left = arr.slice(1).filter(x => x <= pivot);\n  const right = arr.slice(1).filter(x => x > pivot);\n  return [...quickSort(left), pivot, ...quickSort(right)];\n}`,
    relatedTutorials: ["data-structures"],
    seeAlso: ["big-o-notation", "recursion", "array-methods"],
  },
  // Web / General
  {
    term: "API",
    slug: "api",
    definition:
      "Application Programming Interface — a set of rules and endpoints that allow different software systems to communicate. Web APIs typically use HTTP methods (GET, POST, PUT, DELETE) to exchange data in JSON format.",
    category: "web",
    example: `// Fetch API\nconst response = await fetch("https://api.example.com/users");\nconst users = await response.json();\n\n// POST request\nawait fetch("/api/users", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ name: "Alice" })\n});`,
    relatedTutorials: ["async"],
    seeAlso: ["rest", "json", "fetch"],
  },
  {
    term: "REST",
    slug: "rest",
    definition:
      "Representational State Transfer — an architectural style for designing networked APIs. RESTful APIs use HTTP methods to perform CRUD operations on resources identified by URLs. Responses are typically JSON.",
    category: "web",
    example: `// RESTful endpoints\nGET    /api/users      // List users\nGET    /api/users/1    // Get user 1\nPOST   /api/users      // Create user\nPUT    /api/users/1    // Update user 1\nDELETE /api/users/1    // Delete user 1`,
    relatedTutorials: ["async"],
    seeAlso: ["api", "json", "http-methods"],
  },
  {
    term: "JSON",
    slug: "json",
    definition:
      "JavaScript Object Notation — a lightweight text format for data exchange. JSON supports strings, numbers, booleans, null, objects, and arrays. It's the standard format for API responses and configuration files.",
    category: "web",
    example: `const data = {\n  name: "Alice",\n  age: 25,\n  skills: ["JavaScript", "React"]\n};\n\nconst json = JSON.stringify(data);\nconst parsed = JSON.parse(json);`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["api", "rest", "fetch"],
  },
  {
    term: "Fetch",
    slug: "fetch",
    definition:
      "The modern browser API for making HTTP requests. `fetch()` returns a Promise that resolves to the Response object. It replaces the older XMLHttpRequest (XHR) and works with async/await.",
    category: "web",
    example: `async function getUsers() {\n  const res = await fetch("/api/users");\n  if (!res.ok) throw new Error("Request failed");\n  return res.json();\n}`,
    relatedTutorials: ["async"],
    seeAlso: ["api", "promise", "async-await"],
  },
  {
    term: "HTTP Methods",
    slug: "http-methods",
    definition:
      "Standard request methods that indicate the desired action on a resource. GET retrieves data, POST creates, PUT/PATCH updates, DELETE removes. Each method has semantics about safety and idempotency.",
    category: "web",
    example: `// GET - safe, idempotent\nfetch("/api/users");\n\n// POST - not safe, not idempotent\nfetch("/api/users", { method: "POST", body: data });\n\n// DELETE - not safe, idempotent\nfetch("/api/users/1", { method: "DELETE" });`,
    relatedTutorials: ["async"],
    seeAlso: ["rest", "api", "fetch"],
  },
  {
    term: "CORS",
    slug: "cors",
    definition:
      "Cross-Origin Resource Sharing — a security mechanism that controls which domains can make requests to your server. Browsers block cross-origin requests by default; servers must include `Access-Control-Allow-Origin` headers to permit them.",
    category: "web",
    example: `// Server response headers\nAccess-Control-Allow-Origin: https://myapp.com\nAccess-Control-Allow-Methods: GET, POST\nAccess-Control-Allow-Headers: Content-Type`,
    relatedTutorials: ["async"],
    seeAlso: ["api", "fetch", "http-methods"],
  },
  {
    term: "JWT",
    slug: "jwt",
    definition:
      "JSON Web Token — a compact, URL-safe token format for securely transmitting information between parties. A JWT has three parts: header, payload, and signature. Commonly used for authentication in APIs.",
    category: "web",
    example: `// JWT structure\n// header.payload.signature\n// eyJhbGc...\n\n// Sending JWT with requests\nfetch("/api/data", {\n  headers: {\n    Authorization: "Bearer " + token\n  }\n});`,
    seeAlso: ["api", "rest"],
  },
  {
    term: "Local Storage",
    slug: "local-storage",
    definition:
      "A web browser API for storing key-value pairs persistently (survives browser restarts). Limited to ~5MB per origin, stores strings only. Use `JSON.stringify`/`JSON.parse` for objects. Session Storage is similar but clears when the tab closes.",
    category: "web",
    example: `// Store data\nlocalStorage.setItem("theme", "dark");\nlocalStorage.setItem("user", JSON.stringify({ name: "Alice" }));\n\n// Retrieve data\nconst theme = localStorage.getItem("theme");\nconst user = JSON.parse(localStorage.getItem("user"));`,
    seeAlso: ["json"],
  },
  // React
  {
    term: "Component",
    slug: "component",
    definition:
      "A reusable, self-contained piece of UI in React. Components accept inputs (props) and return JSX describing what should appear on screen. Can be functions (recommended) or classes.",
    category: "react",
    example: `function Greeting({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}\n\n// Usage\n<Greeting name="Alice" />`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["jsx", "props", "state"],
  },
  {
    term: "JSX",
    slug: "jsx",
    definition:
      "A syntax extension for JavaScript that looks like HTML and is used to describe UI in React. JSX is compiled to `React.createElement()` calls. It supports JavaScript expressions inside curly braces `{}`.",
    category: "react",
    example: `const element = (\n  <div className="card">\n    <h2>{title}</h2>\n    <p>{isActive ? "Active" : "Inactive"}</p>\n    {items.map(item => <li key={item.id}>{item.name}</li>)}\n  </div>\n);`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["component", "virtual-dom"],
  },
  {
    term: "Props",
    slug: "props",
    definition:
      "Short for properties — the mechanism for passing data from parent to child components in React. Props are read-only and flow downward (one-way data flow). Destructure props in function parameters for clean code.",
    category: "react",
    example: `function UserCard({ name, email, isAdmin }) {\n  return (\n    <div>\n      <h2>{name}</h2>\n      <p>{email}</p>\n      {isAdmin && <span>Admin</span>}\n    </div>\n  );\n}`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["component", "state", "destructuring"],
  },
  {
    term: "State",
    slug: "state",
    definition:
      "Data that a component manages internally and can change over time. When state updates, React re-renders the component. Use `useState` for simple state and `useReducer` for complex state logic.",
    category: "react",
    example: `function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(c => c + 1)}>\n      Clicked {count} times\n    </button>\n  );\n}`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["props", "use-effect", "component"],
  },
  {
    term: "useEffect",
    slug: "use-effect",
    definition:
      "A React hook for performing side effects in function components — fetching data, setting up subscriptions, or manually updating the DOM. Runs after every render by default; use the dependency array to control when it runs.",
    category: "react",
    example: `useEffect(() => {\n  const fetchData = async () => {\n    const res = await fetch("/api/data");\n    setData(await res.json());\n  };\n  fetchData();\n  return () => { /* cleanup */ };\n}, [dependency]);`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["state", "component", "use-memo"],
  },
  {
    term: "useMemo",
    slug: "use-memo",
    definition:
      "A React hook that memoizes the result of an expensive computation, recomputing only when its dependencies change. Use it to optimize performance by avoiding unnecessary recalculations on every render.",
    category: "react",
    example: `const sortedItems = useMemo(() => {\n  return items.slice().sort((a, b) => a.name.localeCompare(b.name));\n}, [items]);`,
    relatedTutorials: ["advanced"],
    seeAlso: ["use-effect", "state"],
  },
  {
    term: "Virtual DOM",
    slug: "virtual-dom",
    definition:
      "An in-memory representation of the real DOM that React uses to optimize updates. When state changes, React creates a new virtual DOM tree, diffs it against the previous one, and applies only the minimum necessary changes to the real DOM.",
    category: "react",
    example: `// React handles this automatically:\n// 1. State changes -> new virtual DOM tree\n// 2. Diff old vs new virtual DOM\n// 3. Batch minimal real DOM updates\n// This is why direct DOM manipulation is discouraged in React`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["component", "state", "dom"],
  },
  // TypeScript
  {
    term: "TypeScript",
    slug: "typescript",
    definition:
      "A typed superset of JavaScript that adds static type checking at compile time. TypeScript catches type errors before runtime, provides better IDE support (autocompletion, refactoring), and compiles to plain JavaScript.",
    category: "typescript",
    example: `interface User {\n  name: string;\n  age: number;\n  email?: string; // optional\n}\n\nfunction greet(user: User): string {\n  return \`Hello, \${user.name}\`;\n}`,
    relatedTutorials: ["advanced"],
    seeAlso: ["interface", "generic"],
  },
  {
    term: "Interface",
    slug: "interface",
    definition:
      "A TypeScript construct that defines the shape of an object — what properties and methods it must have. Interfaces support extension, optional properties, and readonly modifiers. They're erased at compile time.",
    category: "typescript",
    example: `interface Product {\n  readonly id: string;\n  name: string;\n  price: number;\n  description?: string;\n}\n\ninterface DigitalProduct extends Product {\n  downloadUrl: string;\n}`,
    relatedTutorials: ["advanced"],
    seeAlso: ["typescript", "generic"],
  },
  {
    term: "Generic",
    slug: "generic",
    definition:
      "A TypeScript feature that lets you write reusable code that works with multiple types. Generics use type parameters (like `<T>`) that are specified when the function or class is used.",
    category: "typescript",
    example: `function first<T>(arr: T[]): T | undefined {\n  return arr[0];\n}\n\nfirst<number>([1, 2, 3]); // number\nfirst<string>(["a", "b"]); // string`,
    relatedTutorials: ["advanced"],
    seeAlso: ["typescript", "interface"],
  },
  // Tooling
  {
    term: "npm",
    slug: "npm",
    definition:
      "Node Package Manager — the default package manager for Node.js. npm manages project dependencies, runs scripts, and publishes packages. The `package.json` file lists dependencies and the `node_modules` folder stores them.",
    category: "tooling",
    example: `npm init -y          # Create package.json\nnpm install react    # Add dependency\nnpm install -D jest  # Add dev dependency\nnpm run build        # Run script`,
    seeAlso: ["module", "json"],
  },
  {
    term: "Git",
    slug: "git",
    definition:
      "A distributed version control system that tracks changes to files over time. Git allows multiple developers to work on the same codebase, create branches for features, and merge changes back together.",
    category: "tooling",
    example: `git init              # Initialize repo\ngit add .             # Stage changes\ngit commit -m "feat"  # Commit\ngit branch feature    # Create branch\ngit merge feature     # Merge branch`,
    seeAlso: ["npm"],
  },
  {
    term: "Const vs Let vs Var",
    slug: "const-vs-let-vs-var",
    definition:
      "`const` declares a block-scoped, read-only reference (the value itself can still be mutated for objects/arrays). `let` declares a block-scoped, reassignable variable. `var` declares a function-scoped, hoisted variable. Prefer `const` by default, `let` when reassignment is needed, avoid `var`.",
    category: "javascript",
    example: `const PI = 3.14;          // Cannot reassign\nlet counter = 0;          // Can reassign\ncounter = 1;              // OK\n\nconst arr = [1, 2, 3];\narr.push(4);              // OK - mutating, not reassigning\n// arr = [5, 6];          // Error - cannot reassign const`,
    relatedTutorials: ["fundamentals"],
    seeAlso: ["variable", "hoisting", "scope"],
  },
];

export function getTermBySlug(slug: string): GlossaryTerm | undefined {
  return glossaryTerms.find((t) => t.slug === slug);
}

export function getTermsByCategory(
  category: GlossaryTerm["category"]
): GlossaryTerm[] {
  return glossaryTerms.filter((t) => t.category === category);
}

export function getTermsGroupedByLetter(): Record<string, GlossaryTerm[]> {
  const grouped: Record<string, GlossaryTerm[]> = {};
  for (const term of glossaryTerms) {
    const letter = term.term[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(term);
  }
  // Sort terms within each letter
  for (const letter of Object.keys(grouped)) {
    grouped[letter].sort((a, b) => a.term.localeCompare(b.term));
  }
  return grouped;
}

export function getAllSlugs(): string[] {
  return glossaryTerms.map((t) => t.slug);
}

export const categoryLabels: Record<GlossaryTerm["category"], string> = {
  javascript: "JavaScript",
  html: "HTML",
  css: "CSS",
  react: "React",
  dsa: "Data Structures & Algorithms",
  web: "Web Development",
  typescript: "TypeScript",
  tooling: "Developer Tools",
};
