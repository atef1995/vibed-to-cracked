import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "../../../src/generated/client";

let prisma: InstanceType<typeof PrismaClient> | null = null;

function getPrismaClient() {
  if (!prisma) {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/vibed_to_cracked',
    });
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

export async function seedReactQuizzes(customPrisma?: InstanceType<typeof PrismaClient>) {
  const client = customPrisma || getPrismaClient();
  console.log("⚛️ Seeding React quizzes...");

  try {
    // Find the React tutorials
    const whatIsReactTutorial = await client.tutorial.findUnique({
      where: { slug: "what-is-react" },
    });

    if (!whatIsReactTutorial) {
      console.warn("⚠️ Tutorial 'what-is-react' not found. Run seedReactTutorials first.");
      return;
    }

    // Quiz 1: What is React and Why Should You Care?
    const whatIsReactQuiz = await client.quiz.upsert({
      where: { slug: "what-is-react-quiz" },
      update: {
        title: "What is React Quiz",
        questions: [
          {
            id: 1,
            question: "What type of library is React?",
            options: [
              "A backend framework for building APIs",
              "A JavaScript library for building user interfaces",
              "A database management system",
              "A CSS framework for styling",
            ],
            correct: 1,
            explanation:
              "React is a JavaScript library specifically designed for building user interfaces, particularly single-page applications where you need dynamic, interactive UIs.",
            difficulty: "easy",
          },
          {
            id: 2,
            question: "What programming paradigm does React use that differs from vanilla JavaScript DOM manipulation?",
            options: [
              "Imperative programming",
              "Procedural programming",
              "Declarative programming",
              "Object-oriented programming",
            ],
            correct: 2,
            explanation:
              "React uses declarative programming - you describe WHAT your UI should look like based on your data, rather than HOW to update the DOM step by step (imperative).",
            difficulty: "medium",
          },
          {
            id: 3,
            question: "What is a React component?",
            options: [
              "A CSS stylesheet",
              "A JavaScript function that returns JSX",
              "An HTML template file",
              "A database table",
            ],
            correct: 1,
            explanation:
              "A React component is a JavaScript function that returns JSX (which looks like HTML). Components are reusable building blocks for your UI.",
            difficulty: "easy",
          },
          {
            id: 4,
            question: "What is JSX?",
            options: [
              "A new programming language",
              "A syntax extension that looks like HTML but compiles to JavaScript",
              "A CSS preprocessor",
              "A database query language",
            ],
            correct: 1,
            explanation:
              "JSX is a syntax extension for JavaScript that looks like HTML. It gets transformed into React.createElement() calls during compilation, making it easier to write UI code.",
            difficulty: "easy",
          },
          {
            id: 5,
            question: "What is the Virtual DOM in React?",
            options: [
              "A virtual reality feature for 3D rendering",
              "A JavaScript representation of the UI that React uses to efficiently update the real DOM",
              "A browser extension for React",
              "A testing framework for DOM manipulation",
            ],
            correct: 1,
            explanation:
              "The Virtual DOM is a lightweight JavaScript representation of the real DOM. React uses it to calculate the minimum changes needed, then updates only those parts of the real DOM for better performance.",
            difficulty: "medium",
          },
          {
            id: 6,
            question: "What does 'state' represent in React?",
            options: [
              "The geographic location of the server",
              "Data that can change and triggers UI updates when it does",
              "The CSS styling of a component",
              "The HTML structure of the page",
            ],
            correct: 1,
            explanation:
              "State is data that can change over time. When state changes, React automatically re-renders the component to reflect the new data in the UI.",
            difficulty: "easy",
          },
          {
            id: 7,
            question: "Which hook is used to manage state in a functional React component?",
            options: [
              "useEffect",
              "useRef",
              "useState",
              "useCallback",
            ],
            correct: 2,
            explanation:
              "useState is the hook used to add state to functional components. It returns an array with the current state value and a function to update it: const [value, setValue] = useState(initialValue).",
            difficulty: "easy",
          },
          {
            id: 8,
            question: "What is a major advantage of React components?",
            options: [
              "They can only be used once per application",
              "They are reusable and can be used in multiple places with different props",
              "They automatically connect to databases",
              "They replace the need for JavaScript",
            ],
            correct: 1,
            explanation:
              "React components are highly reusable. You can create a component once and use it throughout your application with different props, reducing code duplication and improving maintainability.",
            difficulty: "easy",
          },
          {
            id: 9,
            question: "How does React's Virtual DOM improve performance?",
            options: [
              "It makes the browser faster",
              "It compares changes and updates only the parts of the real DOM that changed",
              "It stores data in the cloud",
              "It compresses HTML files",
            ],
            correct: 1,
            explanation:
              "React's Virtual DOM compares (diffs) the previous and new versions of the UI, then calculates and applies only the minimal set of changes to the real DOM. This is much faster than re-rendering everything.",
            difficulty: "medium",
          },
          {
            id: 10,
            question: "In JSX, how do you embed JavaScript expressions?",
            options: [
              "Using double quotes: \"expression\"",
              "Using curly braces: {expression}",
              "Using parentheses: (expression)",
              "Using angle brackets: <expression>",
            ],
            correct: 1,
            explanation:
              "In JSX, you embed JavaScript expressions inside curly braces {}. For example: <h1>{userName}</h1> or <p>{2 + 2}</p>.",
            difficulty: "easy",
          },
          {
            id: 11,
            question: "What happens when you call setState in React?",
            options: [
              "The entire page reloads",
              "Only the component with changed state re-renders",
              "All components in the app re-render",
              "Nothing happens until you refresh",
            ],
            correct: 1,
            explanation:
              "When you call setState, React schedules a re-render of the component. React's reconciliation algorithm then efficiently updates only the DOM elements that actually changed.",
            difficulty: "medium",
          },
          {
            id: 12,
            question: "What is the main problem React solves compared to vanilla JavaScript?",
            options: [
              "Making websites load faster by default",
              "Automatically styling HTML elements",
              "Managing complex UI updates and keeping data in sync with the view",
              "Replacing HTML and CSS entirely",
            ],
            correct: 2,
            explanation:
              "React solves the problem of manually keeping your UI in sync with your data. Instead of writing imperative code to update the DOM every time something changes, React handles it automatically when state changes.",
            difficulty: "medium",
          },
        ],
        isPremium: false,
        requiredPlan: "FREE",
      },
      create: {
        slug: "what-is-react-quiz",
        tutorialId: whatIsReactTutorial.id,
        title: "What is React Quiz",
        questions: [
          {
            id: 1,
            question: "What type of library is React?",
            options: [
              "A backend framework for building APIs",
              "A JavaScript library for building user interfaces",
              "A database management system",
              "A CSS framework for styling",
            ],
            correct: 1,
            explanation:
              "React is a JavaScript library specifically designed for building user interfaces, particularly single-page applications where you need dynamic, interactive UIs.",
            difficulty: "easy",
          },
          {
            id: 2,
            question: "What programming paradigm does React use that differs from vanilla JavaScript DOM manipulation?",
            options: [
              "Imperative programming",
              "Procedural programming",
              "Declarative programming",
              "Object-oriented programming",
            ],
            correct: 2,
            explanation:
              "React uses declarative programming - you describe WHAT your UI should look like based on your data, rather than HOW to update the DOM step by step (imperative).",
            difficulty: "medium",
          },
          {
            id: 3,
            question: "What is a React component?",
            options: [
              "A CSS stylesheet",
              "A JavaScript function that returns JSX",
              "An HTML template file",
              "A database table",
            ],
            correct: 1,
            explanation:
              "A React component is a JavaScript function that returns JSX (which looks like HTML). Components are reusable building blocks for your UI.",
            difficulty: "easy",
          },
          {
            id: 4,
            question: "What is JSX?",
            options: [
              "A new programming language",
              "A syntax extension that looks like HTML but compiles to JavaScript",
              "A CSS preprocessor",
              "A database query language",
            ],
            correct: 1,
            explanation:
              "JSX is a syntax extension for JavaScript that looks like HTML. It gets transformed into React.createElement() calls during compilation, making it easier to write UI code.",
            difficulty: "easy",
          },
          {
            id: 5,
            question: "What is the Virtual DOM in React?",
            options: [
              "A virtual reality feature for 3D rendering",
              "A JavaScript representation of the UI that React uses to efficiently update the real DOM",
              "A browser extension for React",
              "A testing framework for DOM manipulation",
            ],
            correct: 1,
            explanation:
              "The Virtual DOM is a lightweight JavaScript representation of the real DOM. React uses it to calculate the minimum changes needed, then updates only those parts of the real DOM for better performance.",
            difficulty: "medium",
          },
          {
            id: 6,
            question: "What does 'state' represent in React?",
            options: [
              "The geographic location of the server",
              "Data that can change and triggers UI updates when it does",
              "The CSS styling of a component",
              "The HTML structure of the page",
            ],
            correct: 1,
            explanation:
              "State is data that can change over time. When state changes, React automatically re-renders the component to reflect the new data in the UI.",
            difficulty: "easy",
          },
          {
            id: 7,
            question: "Which hook is used to manage state in a functional React component?",
            options: [
              "useEffect",
              "useRef",
              "useState",
              "useCallback",
            ],
            correct: 2,
            explanation:
              "useState is the hook used to add state to functional components. It returns an array with the current state value and a function to update it: const [value, setValue] = useState(initialValue).",
            difficulty: "easy",
          },
          {
            id: 8,
            question: "What is a major advantage of React components?",
            options: [
              "They can only be used once per application",
              "They are reusable and can be used in multiple places with different props",
              "They automatically connect to databases",
              "They replace the need for JavaScript",
            ],
            correct: 1,
            explanation:
              "React components are highly reusable. You can create a component once and use it throughout your application with different props, reducing code duplication and improving maintainability.",
            difficulty: "easy",
          },
          {
            id: 9,
            question: "How does React's Virtual DOM improve performance?",
            options: [
              "It makes the browser faster",
              "It compares changes and updates only the parts of the real DOM that changed",
              "It stores data in the cloud",
              "It compresses HTML files",
            ],
            correct: 1,
            explanation:
              "React's Virtual DOM compares (diffs) the previous and new versions of the UI, then calculates and applies only the minimal set of changes to the real DOM. This is much faster than re-rendering everything.",
            difficulty: "medium",
          },
          {
            id: 10,
            question: "In JSX, how do you embed JavaScript expressions?",
            options: [
              "Using double quotes: \"expression\"",
              "Using curly braces: {expression}",
              "Using parentheses: (expression)",
              "Using angle brackets: <expression>",
            ],
            correct: 1,
            explanation:
              "In JSX, you embed JavaScript expressions inside curly braces {}. For example: <h1>{userName}</h1> or <p>{2 + 2}</p>.",
            difficulty: "easy",
          },
          {
            id: 11,
            question: "What happens when you call setState in React?",
            options: [
              "The entire page reloads",
              "Only the component with changed state re-renders",
              "All components in the app re-render",
              "Nothing happens until you refresh",
            ],
            correct: 1,
            explanation:
              "When you call setState, React schedules a re-render of the component. React's reconciliation algorithm then efficiently updates only the DOM elements that actually changed.",
            difficulty: "medium",
          },
          {
            id: 12,
            question: "What is the main problem React solves compared to vanilla JavaScript?",
            options: [
              "Making websites load faster by default",
              "Automatically styling HTML elements",
              "Managing complex UI updates and keeping data in sync with the view",
              "Replacing HTML and CSS entirely",
            ],
            correct: 2,
            explanation:
              "React solves the problem of manually keeping your UI in sync with your data. Instead of writing imperative code to update the DOM every time something changes, React handles it automatically when state changes.",
            difficulty: "medium",
          },
        ],
        isPremium: false,
        requiredPlan: "FREE",
      },
    });

    console.log(`✅ Quiz: ${whatIsReactQuiz.title} (${(whatIsReactQuiz.questions as any[]).length} questions)`);

    // Find JSX Syntax tutorial
    const jsxSyntaxTutorial = await client.tutorial.findUnique({
      where: { slug: "jsx-syntax" },
    });

    if (!jsxSyntaxTutorial) {
      console.warn("⚠️ Tutorial 'jsx-syntax' not found. Skipping quiz.");
    } else {
      // Quiz 2: JSX Syntax
      const jsxSyntaxQuiz = await client.quiz.upsert({
        where: { slug: "jsx-syntax-quiz" },
        update: {
          title: "JSX Syntax Quiz",
          questions: [
            {
              id: 1,
              question: "In JSX, what do you use instead of the HTML 'class' attribute?",
              options: [
                "class",
                "className",
                "cssClass",
                "htmlClass",
              ],
              correct: 1,
              explanation:
                "In JSX, you use 'className' instead of 'class' because 'class' is a reserved keyword in JavaScript.",
              difficulty: "easy",
            },
            {
              id: 2,
              question: "How do you write the HTML 'for' attribute on a label in JSX?",
              options: [
                "for",
                "htmlFor",
                "labelFor",
                "forId",
              ],
              correct: 1,
              explanation:
                "'for' is a reserved word in JavaScript (used in loops), so JSX uses 'htmlFor' instead for the label attribute.",
              difficulty: "easy",
            },
            {
              id: 3,
              question: "Which of these is the correct way to write a self-closing tag in JSX?",
              options: [
                "<img src='photo.jpg'>",
                "<img src='photo.jpg'></img>",
                "<img src='photo.jpg' />",
                "<img src='photo.jpg' \\>",
              ],
              correct: 2,
              explanation:
                "In JSX, all tags must be properly closed. Self-closing tags like <img>, <input>, and <br> must end with ' />'.",
              difficulty: "easy",
            },
            {
              id: 4,
              question: "What do you use to embed JavaScript expressions inside JSX?",
              options: [
                "Double quotes: \"expression\"",
                "Curly braces: {expression}",
                "Parentheses: (expression)",
                "Square brackets: [expression]",
              ],
              correct: 1,
              explanation:
                "Curly braces {} are used to embed any JavaScript expression inside JSX, including variables, function calls, and calculations.",
              difficulty: "easy",
            },
            {
              id: 5,
              question: "What is a Fragment in React and when would you use it?",
              options: [
                "A broken component that needs fixing",
                "A way to group elements without adding an extra DOM node",
                "A piece of commented-out code",
                "A special type of state",
              ],
              correct: 1,
              explanation:
                "Fragments (<>...</> or <React.Fragment>) let you group multiple elements without adding an extra wrapper div to the DOM, keeping your HTML cleaner.",
              difficulty: "medium",
            },
            {
              id: 6,
              question: "Why must JSX return a single parent element?",
              options: [
                "It's just a style convention",
                "Because JSX compiles to function calls that can only return one value",
                "To improve performance",
                "HTML requires it",
              ],
              correct: 1,
              explanation:
                "JSX compiles to React.createElement() calls, and a function can only return one value. That's why you need a single parent element (or Fragment) to wrap multiple elements.",
              difficulty: "medium",
            },
            {
              id: 7,
              question: "How do you write inline styles in JSX?",
              options: [
                "style='color: red'",
                "style={{ color: 'red' }}",
                "style=[color: red]",
                "css={{ color: 'red' }}",
              ],
              correct: 1,
              explanation:
                "In JSX, the style attribute takes a JavaScript object with camelCase properties: style={{ backgroundColor: 'blue', fontSize: '16px' }}.",
              difficulty: "easy",
            },
            {
              id: 8,
              question: "Which CSS property name is correct in JSX inline styles?",
              options: [
                "background-color",
                "backgroundColor",
                "BackgroundColor",
                "background_color",
              ],
              correct: 1,
              explanation:
                "CSS properties in JSX use camelCase instead of kebab-case. So 'background-color' becomes 'backgroundColor', 'font-size' becomes 'fontSize'.",
              difficulty: "easy",
            },
            {
              id: 9,
              question: "How do you write comments inside JSX?",
              options: [
                "// This is a comment",
                "<!-- This is a comment -->",
                "{/* This is a comment */}",
                "# This is a comment",
              ],
              correct: 2,
              explanation:
                "Inside JSX, comments must be wrapped in curly braces with the JavaScript multi-line comment syntax: {/* comment */}.",
              difficulty: "easy",
            },
            {
              id: 10,
              question: "What can you NOT put inside JSX curly braces?",
              options: [
                "Variables like {userName}",
                "Function calls like {formatDate(date)}",
                "if statements like {if (x) return y}",
                "Ternary expressions like {x ? 'yes' : 'no'}",
              ],
              correct: 2,
              explanation:
                "JSX curly braces accept expressions (things that produce a value), not statements. Use ternary operators instead of if statements inside JSX.",
              difficulty: "medium",
            },
            {
              id: 11,
              question: "Which event attribute is correct in JSX?",
              options: [
                "onclick",
                "onClick",
                "on-click",
                "ONCLICK",
              ],
              correct: 1,
              explanation:
                "All event handlers in JSX use camelCase: onClick, onChange, onSubmit, onMouseEnter, etc.",
              difficulty: "easy",
            },
            {
              id: 12,
              question: "What happens when you try to render {false} or {null} in JSX?",
              options: [
                "It displays 'false' or 'null' as text",
                "It throws an error",
                "Nothing is rendered (they're ignored)",
                "It displays 0",
              ],
              correct: 2,
              explanation:
                "false, null, undefined, and true are valid children in JSX but they don't render anything. This is useful for conditional rendering.",
              difficulty: "medium",
            },
          ],
          isPremium: false,
          requiredPlan: "FREE",
        },
        create: {
          slug: "jsx-syntax-quiz",
          tutorialId: jsxSyntaxTutorial.id,
          title: "JSX Syntax Quiz",
          questions: [
            {
              id: 1,
              question: "In JSX, what do you use instead of the HTML 'class' attribute?",
              options: [
                "class",
                "className",
                "cssClass",
                "htmlClass",
              ],
              correct: 1,
              explanation:
                "In JSX, you use 'className' instead of 'class' because 'class' is a reserved keyword in JavaScript.",
              difficulty: "easy",
            },
            {
              id: 2,
              question: "How do you write the HTML 'for' attribute on a label in JSX?",
              options: [
                "for",
                "htmlFor",
                "labelFor",
                "forId",
              ],
              correct: 1,
              explanation:
                "'for' is a reserved word in JavaScript (used in loops), so JSX uses 'htmlFor' instead for the label attribute.",
              difficulty: "easy",
            },
            {
              id: 3,
              question: "Which of these is the correct way to write a self-closing tag in JSX?",
              options: [
                "<img src='photo.jpg'>",
                "<img src='photo.jpg'></img>",
                "<img src='photo.jpg' />",
                "<img src='photo.jpg' \\>",
              ],
              correct: 2,
              explanation:
                "In JSX, all tags must be properly closed. Self-closing tags like <img>, <input>, and <br> must end with ' />'.",
              difficulty: "easy",
            },
            {
              id: 4,
              question: "What do you use to embed JavaScript expressions inside JSX?",
              options: [
                "Double quotes: \"expression\"",
                "Curly braces: {expression}",
                "Parentheses: (expression)",
                "Square brackets: [expression]",
              ],
              correct: 1,
              explanation:
                "Curly braces {} are used to embed any JavaScript expression inside JSX, including variables, function calls, and calculations.",
              difficulty: "easy",
            },
            {
              id: 5,
              question: "What is a Fragment in React and when would you use it?",
              options: [
                "A broken component that needs fixing",
                "A way to group elements without adding an extra DOM node",
                "A piece of commented-out code",
                "A special type of state",
              ],
              correct: 1,
              explanation:
                "Fragments (<>...</> or <React.Fragment>) let you group multiple elements without adding an extra wrapper div to the DOM, keeping your HTML cleaner.",
              difficulty: "medium",
            },
            {
              id: 6,
              question: "Why must JSX return a single parent element?",
              options: [
                "It's just a style convention",
                "Because JSX compiles to function calls that can only return one value",
                "To improve performance",
                "HTML requires it",
              ],
              correct: 1,
              explanation:
                "JSX compiles to React.createElement() calls, and a function can only return one value. That's why you need a single parent element (or Fragment) to wrap multiple elements.",
              difficulty: "medium",
            },
            {
              id: 7,
              question: "How do you write inline styles in JSX?",
              options: [
                "style='color: red'",
                "style={{ color: 'red' }}",
                "style=[color: red]",
                "css={{ color: 'red' }}",
              ],
              correct: 1,
              explanation:
                "In JSX, the style attribute takes a JavaScript object with camelCase properties: style={{ backgroundColor: 'blue', fontSize: '16px' }}.",
              difficulty: "easy",
            },
            {
              id: 8,
              question: "Which CSS property name is correct in JSX inline styles?",
              options: [
                "background-color",
                "backgroundColor",
                "BackgroundColor",
                "background_color",
              ],
              correct: 1,
              explanation:
                "CSS properties in JSX use camelCase instead of kebab-case. So 'background-color' becomes 'backgroundColor', 'font-size' becomes 'fontSize'.",
              difficulty: "easy",
            },
            {
              id: 9,
              question: "How do you write comments inside JSX?",
              options: [
                "// This is a comment",
                "<!-- This is a comment -->",
                "{/* This is a comment */}",
                "# This is a comment",
              ],
              correct: 2,
              explanation:
                "Inside JSX, comments must be wrapped in curly braces with the JavaScript multi-line comment syntax: {/* comment */}.",
              difficulty: "easy",
            },
            {
              id: 10,
              question: "What can you NOT put inside JSX curly braces?",
              options: [
                "Variables like {userName}",
                "Function calls like {formatDate(date)}",
                "if statements like {if (x) return y}",
                "Ternary expressions like {x ? 'yes' : 'no'}",
              ],
              correct: 2,
              explanation:
                "JSX curly braces accept expressions (things that produce a value), not statements. Use ternary operators instead of if statements inside JSX.",
              difficulty: "medium",
            },
            {
              id: 11,
              question: "Which event attribute is correct in JSX?",
              options: [
                "onclick",
                "onClick",
                "on-click",
                "ONCLICK",
              ],
              correct: 1,
              explanation:
                "All event handlers in JSX use camelCase: onClick, onChange, onSubmit, onMouseEnter, etc.",
              difficulty: "easy",
            },
            {
              id: 12,
              question: "What happens when you try to render {false} or {null} in JSX?",
              options: [
                "It displays 'false' or 'null' as text",
                "It throws an error",
                "Nothing is rendered (they're ignored)",
                "It displays 0",
              ],
              correct: 2,
              explanation:
                "false, null, undefined, and true are valid children in JSX but they don't render anything. This is useful for conditional rendering.",
              difficulty: "medium",
            },
          ],
          isPremium: false,
          requiredPlan: "FREE",
        },
      });

      console.log(`✅ Quiz: ${jsxSyntaxQuiz.title} (${(jsxSyntaxQuiz.questions as any[]).length} questions)`);
    }

    // Find Components and Props tutorial
    const componentsAndPropsTutorial = await client.tutorial.findUnique({
      where: { slug: "components-and-props" },
    });

    if (!componentsAndPropsTutorial) {
      console.warn("⚠️ Tutorial 'components-and-props' not found. Skipping quiz.");
    } else {
      // Quiz 3: Components and Props (Beginner-friendly)
      const componentsAndPropsQuiz = await client.quiz.upsert({
        where: { slug: "components-and-props-quiz" },
        update: {
          title: "Components and Props Quiz",
          questions: [
            {
              id: 1,
              question: "What is a React component?",
              options: [
                "A CSS stylesheet",
                "A reusable piece of UI that returns JSX",
                "A database table",
                "A JavaScript variable",
              ],
              correct: 1,
              explanation:
                "A React component is a reusable piece of UI - it's a function that returns JSX. Think of it like a custom HTML tag that you create and can use anywhere.",
              difficulty: "easy",
            },
            {
              id: 2,
              question: "Why must React component names start with a capital letter?",
              options: [
                "It's just a style convention",
                "React uses capitalization to distinguish components from HTML elements",
                "JavaScript requires it for functions",
                "It makes the code run faster",
              ],
              correct: 1,
              explanation:
                "React uses the first letter to distinguish between HTML elements (lowercase like <div>) and custom components (uppercase like <MyComponent>).",
              difficulty: "easy",
            },
            {
              id: 3,
              question: "What are 'props' in React?",
              options: [
                "CSS properties for styling",
                "Data passed from parent to child components",
                "Browser properties for the window",
                "Database columns",
              ],
              correct: 1,
              explanation:
                "Props (short for properties) are how you pass data from a parent component to a child component. They're like function parameters for your UI.",
              difficulty: "easy",
            },
            {
              id: 4,
              question: "Which is the correct way to pass a prop to a component?",
              options: [
                "<Greeting props='Hello'>",
                "<Greeting message='Hello'>",
                "<Greeting(message='Hello')>",
                "<Greeting: message='Hello'>",
              ],
              correct: 1,
              explanation:
                "Props are passed like HTML attributes: <Greeting message='Hello' />. The prop name goes first, then equals, then the value.",
              difficulty: "easy",
            },
            {
              id: 5,
              question: "How do you access props inside a functional component?",
              options: [
                "Using this.props.name",
                "Using props.name or destructuring { name }",
                "Using getProps('name')",
                "Using props['name']",
              ],
              correct: 1,
              explanation:
                "In functional components, props are passed as the first parameter. You can use props.name or destructure them: function Greeting({ name }) { ... }",
              difficulty: "easy",
            },
            {
              id: 6,
              question: "What is the preferred way to receive props in a functional component?",
              options: [
                "function Component(props) { props.name }",
                "function Component({ name }) { name }",
                "function Component([name]) { name }",
                "function Component(name) { name }",
              ],
              correct: 1,
              explanation:
                "Destructuring props in the function parameter ({ name, age }) is the preferred pattern because it's cleaner and makes it obvious what props the component expects.",
              difficulty: "medium",
            },
            {
              id: 7,
              question: "How do you set a default value for a prop?",
              options: [
                "props.name || 'default'",
                "function Component({ name = 'default' }) { }",
                "Component.default = { name: 'default' }",
                "default(name) = 'default'",
              ],
              correct: 1,
              explanation:
                "Use JavaScript default parameters in destructuring: function Greeting({ name = 'Friend' }) { }. If name isn't passed, it defaults to 'Friend'.",
              difficulty: "medium",
            },
            {
              id: 8,
              question: "What is the 'children' prop in React?",
              options: [
                "An array of all child components in the app",
                "Content placed between a component's opening and closing tags",
                "A list of nested CSS selectors",
                "Subcomponents defined inside a component file",
              ],
              correct: 1,
              explanation:
                "The special 'children' prop contains whatever is placed between a component's opening and closing tags: <Card><p>This is children</p></Card>",
              difficulty: "easy",
            },
            {
              id: 9,
              question: "Can you change (mutate) props inside a component?",
              options: [
                "Yes, props can be changed freely",
                "No, props are read-only in React",
                "Only string props can be changed",
                "Only with the setProps function",
              ],
              correct: 1,
              explanation:
                "Props are read-only! A component must never modify its own props. This is one of React's core rules - it ensures predictable, one-way data flow.",
              difficulty: "medium",
            },
            {
              id: 10,
              question: "What is component composition in React?",
              options: [
                "Writing components in separate files",
                "Building complex UIs by combining smaller, reusable components",
                "Adding CSS to components",
                "Connecting components to a database",
              ],
              correct: 1,
              explanation:
                "Component composition is building complex UIs from simple building blocks. Instead of one giant component, you combine small ones (Avatar, Badge) into bigger ones (UserCard).",
              difficulty: "easy",
            },
            {
              id: 11,
              question: "How do you pass a number as a prop?",
              options: [
                "<Counter max='100' />",
                "<Counter max={100} />",
                "<Counter max=100 />",
                "<Counter max=(100) />",
              ],
              correct: 1,
              explanation:
                "Non-string values must be wrapped in curly braces: {100}, {true}, {myVariable}. Using quotes would pass the string '100' instead of the number 100.",
              difficulty: "easy",
            },
            {
              id: 12,
              question: "What does the spread operator do when used with props: {...user}?",
              options: [
                "Creates a copy of the user array",
                "Passes all properties of user object as individual props",
                "Spreads the user across multiple components",
                "Converts user to a string",
              ],
              correct: 1,
              explanation:
                "The spread operator {...user} takes all properties from the user object and passes them as individual props. <UserCard {...user} /> is equivalent to <UserCard name={user.name} age={user.age} />.",
              difficulty: "medium",
            },
          ],
          isPremium: false,
          requiredPlan: "FREE",
        },
        create: {
          slug: "components-and-props-quiz",
          tutorialId: componentsAndPropsTutorial.id,
          title: "Components and Props Quiz",
          questions: [
            {
              id: 1,
              question: "What is a React component?",
              options: [
                "A CSS stylesheet",
                "A reusable piece of UI that returns JSX",
                "A database table",
                "A JavaScript variable",
              ],
              correct: 1,
              explanation:
                "A React component is a reusable piece of UI - it's a function that returns JSX. Think of it like a custom HTML tag that you create and can use anywhere.",
              difficulty: "easy",
            },
            {
              id: 2,
              question: "Why must React component names start with a capital letter?",
              options: [
                "It's just a style convention",
                "React uses capitalization to distinguish components from HTML elements",
                "JavaScript requires it for functions",
                "It makes the code run faster",
              ],
              correct: 1,
              explanation:
                "React uses the first letter to distinguish between HTML elements (lowercase like <div>) and custom components (uppercase like <MyComponent>).",
              difficulty: "easy",
            },
            {
              id: 3,
              question: "What are 'props' in React?",
              options: [
                "CSS properties for styling",
                "Data passed from parent to child components",
                "Browser properties for the window",
                "Database columns",
              ],
              correct: 1,
              explanation:
                "Props (short for properties) are how you pass data from a parent component to a child component. They're like function parameters for your UI.",
              difficulty: "easy",
            },
            {
              id: 4,
              question: "Which is the correct way to pass a prop to a component?",
              options: [
                "<Greeting props='Hello'>",
                "<Greeting message='Hello'>",
                "<Greeting(message='Hello')>",
                "<Greeting: message='Hello'>",
              ],
              correct: 1,
              explanation:
                "Props are passed like HTML attributes: <Greeting message='Hello' />. The prop name goes first, then equals, then the value.",
              difficulty: "easy",
            },
            {
              id: 5,
              question: "How do you access props inside a functional component?",
              options: [
                "Using this.props.name",
                "Using props.name or destructuring { name }",
                "Using getProps('name')",
                "Using props['name']",
              ],
              correct: 1,
              explanation:
                "In functional components, props are passed as the first parameter. You can use props.name or destructure them: function Greeting({ name }) { ... }",
              difficulty: "easy",
            },
            {
              id: 6,
              question: "What is the preferred way to receive props in a functional component?",
              options: [
                "function Component(props) { props.name }",
                "function Component({ name }) { name }",
                "function Component([name]) { name }",
                "function Component(name) { name }",
              ],
              correct: 1,
              explanation:
                "Destructuring props in the function parameter ({ name, age }) is the preferred pattern because it's cleaner and makes it obvious what props the component expects.",
              difficulty: "medium",
            },
            {
              id: 7,
              question: "How do you set a default value for a prop?",
              options: [
                "props.name || 'default'",
                "function Component({ name = 'default' }) { }",
                "Component.default = { name: 'default' }",
                "default(name) = 'default'",
              ],
              correct: 1,
              explanation:
                "Use JavaScript default parameters in destructuring: function Greeting({ name = 'Friend' }) { }. If name isn't passed, it defaults to 'Friend'.",
              difficulty: "medium",
            },
            {
              id: 8,
              question: "What is the 'children' prop in React?",
              options: [
                "An array of all child components in the app",
                "Content placed between a component's opening and closing tags",
                "A list of nested CSS selectors",
                "Subcomponents defined inside a component file",
              ],
              correct: 1,
              explanation:
                "The special 'children' prop contains whatever is placed between a component's opening and closing tags: <Card><p>This is children</p></Card>",
              difficulty: "easy",
            },
            {
              id: 9,
              question: "Can you change (mutate) props inside a component?",
              options: [
                "Yes, props can be changed freely",
                "No, props are read-only in React",
                "Only string props can be changed",
                "Only with the setProps function",
              ],
              correct: 1,
              explanation:
                "Props are read-only! A component must never modify its own props. This is one of React's core rules - it ensures predictable, one-way data flow.",
              difficulty: "medium",
            },
            {
              id: 10,
              question: "What is component composition in React?",
              options: [
                "Writing components in separate files",
                "Building complex UIs by combining smaller, reusable components",
                "Adding CSS to components",
                "Connecting components to a database",
              ],
              correct: 1,
              explanation:
                "Component composition is building complex UIs from simple building blocks. Instead of one giant component, you combine small ones (Avatar, Badge) into bigger ones (UserCard).",
              difficulty: "easy",
            },
            {
              id: 11,
              question: "How do you pass a number as a prop?",
              options: [
                "<Counter max='100' />",
                "<Counter max={100} />",
                "<Counter max=100 />",
                "<Counter max=(100) />",
              ],
              correct: 1,
              explanation:
                "Non-string values must be wrapped in curly braces: {100}, {true}, {myVariable}. Using quotes would pass the string '100' instead of the number 100.",
              difficulty: "easy",
            },
            {
              id: 12,
              question: "What does the spread operator do when used with props: {...user}?",
              options: [
                "Creates a copy of the user array",
                "Passes all properties of user object as individual props",
                "Spreads the user across multiple components",
                "Converts user to a string",
              ],
              correct: 1,
              explanation:
                "The spread operator {...user} takes all properties from the user object and passes them as individual props. <UserCard {...user} /> is equivalent to <UserCard name={user.name} age={user.age} />.",
              difficulty: "medium",
            },
          ],
          isPremium: false,
          requiredPlan: "FREE",
        },
      });

      console.log(`✅ Quiz: ${componentsAndPropsQuiz.title} (${(componentsAndPropsQuiz.questions as any[]).length} questions)`);
    }

    // Find State and useState tutorial
    const stateAndUseStateTutorial = await client.tutorial.findUnique({
      where: { slug: "state-and-usestate" },
    });

    if (!stateAndUseStateTutorial) {
      console.warn("⚠️ Tutorial 'state-and-usestate' not found. Skipping quiz.");
    } else {
      // Quiz: State and useState
      const stateAndUseStateQuiz = await client.quiz.upsert({
        where: { slug: "state-and-usestate-quiz" },
        update: {
          title: "State and useState Quiz",
          questions: [
            {
              id: 1,
              question: "What is 'state' in React?",
              options: [
                "A CSS property for positioning",
                "Data that can change and triggers re-renders when updated",
                "A function that returns JSX",
                "A type of component",
              ],
              correct: 1,
              explanation:
                "State is data that belongs to a component and can change over time. When state changes, React automatically re-renders the component to reflect the new data.",
              difficulty: "easy",
            },
            {
              id: 2,
              question: "Why won't a regular JavaScript variable trigger a re-render when changed?",
              options: [
                "JavaScript variables are read-only",
                "React doesn't track regular variables - only state",
                "Variables can only hold strings",
                "The browser prevents it",
              ],
              correct: 1,
              explanation:
                "React only knows to re-render when you call a state setter function. Regular variables change in memory, but React has no way to know they changed.",
              difficulty: "easy",
            },
            {
              id: 3,
              question: "What does the useState hook return?",
              options: [
                "A single value",
                "An object with value and setter",
                "An array with [currentValue, setterFunction]",
                "A promise",
              ],
              correct: 2,
              explanation:
                "useState returns an array with exactly two elements: the current state value and a function to update it. We typically destructure this: const [count, setCount] = useState(0);",
              difficulty: "easy",
            },
            {
              id: 4,
              question: "What is the correct way to update state?",
              options: [
                "count = count + 1",
                "count++",
                "setCount(count + 1)",
                "this.setState({ count: count + 1 })",
              ],
              correct: 2,
              explanation:
                "Always use the setter function (setCount) to update state. Never modify the state variable directly - React won't know anything changed!",
              difficulty: "easy",
            },
            {
              id: 5,
              question: "When should you use the functional update form: setCount(prev => prev + 1)?",
              options: [
                "Always - it's the only correct way",
                "When the new state depends on the previous state",
                "Only for objects and arrays",
                "Never - it's deprecated",
              ],
              correct: 1,
              explanation:
                "Use functional updates (prev => prev + 1) when your new state depends on the previous state. This ensures you always have the latest value, especially during rapid updates.",
              difficulty: "medium",
            },
            {
              id: 6,
              question: "What happens when you call setCount(count + 1) three times in a row?",
              options: [
                "count increases by 3",
                "count increases by 1 (all three use the same stale value)",
                "It throws an error",
                "count increases by 2",
              ],
              correct: 1,
              explanation:
                "Without functional updates, all three calls use the same 'count' value from when the function ran. They all set count to the same value! Use setCount(prev => prev + 1) to fix this.",
              difficulty: "medium",
            },
            {
              id: 7,
              question: "How do you add an item to an array in state?",
              options: [
                "items.push(newItem); setItems(items)",
                "setItems(items.push(newItem))",
                "setItems([...items, newItem])",
                "items.add(newItem)",
              ],
              correct: 2,
              explanation:
                "Create a new array using spread: [...items, newItem]. Never mutate the existing array with push() - React won't detect the change because the array reference is the same.",
              difficulty: "medium",
            },
            {
              id: 8,
              question: "How do you update a property in an object state?",
              options: [
                "user.name = 'new'; setUser(user)",
                "setUser({ name: 'new' })",
                "setUser({ ...user, name: 'new' })",
                "setUser.name('new')",
              ],
              correct: 2,
              explanation:
                "Spread the existing object and override the property: { ...user, name: 'new' }. This creates a new object with all the old properties plus the updated one.",
              difficulty: "medium",
            },
            {
              id: 9,
              question: "When is state initialized with its initial value?",
              options: [
                "Every time the component renders",
                "Only on the first render",
                "When you call setState",
                "When the page loads",
              ],
              correct: 1,
              explanation:
                "The initial value passed to useState is only used on the FIRST render. After that, React remembers the current state value across re-renders.",
              difficulty: "easy",
            },
            {
              id: 10,
              question: "Can you read the new state value immediately after calling setState?",
              options: [
                "Yes, it updates instantly",
                "No, state updates are asynchronous - the new value is available in the next render",
                "Only if you use await",
                "Only for primitive values",
              ],
              correct: 1,
              explanation:
                "State updates are asynchronous! After calling setCount(5), the 'count' variable still holds the old value until the next render. This is a common source of bugs.",
              difficulty: "medium",
            },
            {
              id: 11,
              question: "Should you use one useState for all component data, or multiple useState calls?",
              options: [
                "Always one useState with an object",
                "Always multiple useState calls",
                "Multiple for independent values, one object for related values that change together",
                "It doesn't matter",
              ],
              correct: 2,
              explanation:
                "Use multiple useState calls for independent values (count, name, isOpen). Use a single object for related values that always change together (like form fields).",
              difficulty: "medium",
            },
            {
              id: 12,
              question: "What does this code do: setItems(items.filter(item => item.id !== id))?",
              options: [
                "Adds a new item with the given id",
                "Removes the item with the matching id",
                "Updates the item with the matching id",
                "Sorts items by id",
              ],
              correct: 1,
              explanation:
                "filter() creates a new array containing only items that pass the test. item.id !== id keeps all items EXCEPT the one with the matching id, effectively removing it.",
              difficulty: "easy",
            },
          ],
          isPremium: false,
          requiredPlan: "FREE",
        },
        create: {
          slug: "state-and-usestate-quiz",
          tutorialId: stateAndUseStateTutorial.id,
          title: "State and useState Quiz",
          questions: [
            {
              id: 1,
              question: "What is 'state' in React?",
              options: [
                "A CSS property for positioning",
                "Data that can change and triggers re-renders when updated",
                "A function that returns JSX",
                "A type of component",
              ],
              correct: 1,
              explanation:
                "State is data that belongs to a component and can change over time. When state changes, React automatically re-renders the component to reflect the new data.",
              difficulty: "easy",
            },
            {
              id: 2,
              question: "Why won't a regular JavaScript variable trigger a re-render when changed?",
              options: [
                "JavaScript variables are read-only",
                "React doesn't track regular variables - only state",
                "Variables can only hold strings",
                "The browser prevents it",
              ],
              correct: 1,
              explanation:
                "React only knows to re-render when you call a state setter function. Regular variables change in memory, but React has no way to know they changed.",
              difficulty: "easy",
            },
            {
              id: 3,
              question: "What does the useState hook return?",
              options: [
                "A single value",
                "An object with value and setter",
                "An array with [currentValue, setterFunction]",
                "A promise",
              ],
              correct: 2,
              explanation:
                "useState returns an array with exactly two elements: the current state value and a function to update it. We typically destructure this: const [count, setCount] = useState(0);",
              difficulty: "easy",
            },
            {
              id: 4,
              question: "What is the correct way to update state?",
              options: [
                "count = count + 1",
                "count++",
                "setCount(count + 1)",
                "this.setState({ count: count + 1 })",
              ],
              correct: 2,
              explanation:
                "Always use the setter function (setCount) to update state. Never modify the state variable directly - React won't know anything changed!",
              difficulty: "easy",
            },
            {
              id: 5,
              question: "When should you use the functional update form: setCount(prev => prev + 1)?",
              options: [
                "Always - it's the only correct way",
                "When the new state depends on the previous state",
                "Only for objects and arrays",
                "Never - it's deprecated",
              ],
              correct: 1,
              explanation:
                "Use functional updates (prev => prev + 1) when your new state depends on the previous state. This ensures you always have the latest value, especially during rapid updates.",
              difficulty: "medium",
            },
            {
              id: 6,
              question: "What happens when you call setCount(count + 1) three times in a row?",
              options: [
                "count increases by 3",
                "count increases by 1 (all three use the same stale value)",
                "It throws an error",
                "count increases by 2",
              ],
              correct: 1,
              explanation:
                "Without functional updates, all three calls use the same 'count' value from when the function ran. They all set count to the same value! Use setCount(prev => prev + 1) to fix this.",
              difficulty: "medium",
            },
            {
              id: 7,
              question: "How do you add an item to an array in state?",
              options: [
                "items.push(newItem); setItems(items)",
                "setItems(items.push(newItem))",
                "setItems([...items, newItem])",
                "items.add(newItem)",
              ],
              correct: 2,
              explanation:
                "Create a new array using spread: [...items, newItem]. Never mutate the existing array with push() - React won't detect the change because the array reference is the same.",
              difficulty: "medium",
            },
            {
              id: 8,
              question: "How do you update a property in an object state?",
              options: [
                "user.name = 'new'; setUser(user)",
                "setUser({ name: 'new' })",
                "setUser({ ...user, name: 'new' })",
                "setUser.name('new')",
              ],
              correct: 2,
              explanation:
                "Spread the existing object and override the property: { ...user, name: 'new' }. This creates a new object with all the old properties plus the updated one.",
              difficulty: "medium",
            },
            {
              id: 9,
              question: "When is state initialized with its initial value?",
              options: [
                "Every time the component renders",
                "Only on the first render",
                "When you call setState",
                "When the page loads",
              ],
              correct: 1,
              explanation:
                "The initial value passed to useState is only used on the FIRST render. After that, React remembers the current state value across re-renders.",
              difficulty: "easy",
            },
            {
              id: 10,
              question: "Can you read the new state value immediately after calling setState?",
              options: [
                "Yes, it updates instantly",
                "No, state updates are asynchronous - the new value is available in the next render",
                "Only if you use await",
                "Only for primitive values",
              ],
              correct: 1,
              explanation:
                "State updates are asynchronous! After calling setCount(5), the 'count' variable still holds the old value until the next render. This is a common source of bugs.",
              difficulty: "medium",
            },
            {
              id: 11,
              question: "Should you use one useState for all component data, or multiple useState calls?",
              options: [
                "Always one useState with an object",
                "Always multiple useState calls",
                "Multiple for independent values, one object for related values that change together",
                "It doesn't matter",
              ],
              correct: 2,
              explanation:
                "Use multiple useState calls for independent values (count, name, isOpen). Use a single object for related values that always change together (like form fields).",
              difficulty: "medium",
            },
            {
              id: 12,
              question: "What does this code do: setItems(items.filter(item => item.id !== id))?",
              options: [
                "Adds a new item with the given id",
                "Removes the item with the matching id",
                "Updates the item with the matching id",
                "Sorts items by id",
              ],
              correct: 1,
              explanation:
                "filter() creates a new array containing only items that pass the test. item.id !== id keeps all items EXCEPT the one with the matching id, effectively removing it.",
              difficulty: "easy",
            },
          ],
          isPremium: false,
          requiredPlan: "FREE",
        },
      });

      console.log(`✅ Quiz: ${stateAndUseStateQuiz.title} (${(stateAndUseStateQuiz.questions as any[]).length} questions)`);
    }

    // Find Conditional Rendering tutorial
    const conditionalRenderingTutorial = await client.tutorial.findUnique({
      where: { slug: "conditional-rendering" },
    });

    if (!conditionalRenderingTutorial) {
      console.warn("⚠️ Tutorial 'conditional-rendering' not found. Skipping quiz.");
    } else {
      // Quiz 4: Conditional Rendering
      const conditionalRenderingQuiz = await client.quiz.upsert({
        where: { slug: "conditional-rendering-quiz" },
        update: {
          title: "Conditional Rendering Quiz",
          questions: [
            {
              id: 1,
              question: "Which is the correct way to conditionally render content using the ternary operator?",
              options: [
                "if (isLoggedIn) { <Welcome /> }",
                "{isLoggedIn ? <Welcome /> : <Login />}",
                "<isLoggedIn ? Welcome : Login />",
                "{if isLoggedIn then <Welcome />}",
              ],
              correct: 1,
              explanation:
                "The ternary operator (condition ? trueResult : falseResult) works inside JSX curly braces and is perfect for toggling between two pieces of content.",
              difficulty: "easy",
            },
            {
              id: 2,
              question: "What does this JSX render: {count > 0 && <Badge>{count}</Badge>}",
              options: [
                "Always renders the Badge",
                "Renders Badge only when count is greater than 0",
                "Renders 'true' or 'false'",
                "This syntax is invalid",
              ],
              correct: 1,
              explanation:
                "The logical AND (&&) operator renders the right side only when the left side is truthy. It's perfect for 'show something or nothing' conditions.",
              difficulty: "easy",
            },
            {
              id: 3,
              question: "When should you use the ternary operator vs && for conditional rendering?",
              options: [
                "Always use ternary, && is deprecated",
                "Ternary for 'show A or B', && for 'show A or nothing'",
                "&& is faster than ternary",
                "They do the exact same thing",
              ],
              correct: 1,
              explanation:
                "Use ternary (? :) when you need to choose between two different things to render. Use && when you want to show something or nothing at all.",
              difficulty: "medium",
            },
            {
              id: 4,
              question: "What is 'early return' in React components?",
              options: [
                "Returning from a component before the render completes",
                "Using return statements before the main JSX to handle special cases",
                "Returning early from useEffect",
                "A performance optimization technique",
              ],
              correct: 1,
              explanation:
                "Early return means handling special cases (loading, error, empty) with return statements at the top of your component, keeping the main JSX clean and unindented.",
              difficulty: "medium",
            },
            {
              id: 5,
              question: "What happens when you try to render {0 && <Component />}?",
              options: [
                "Nothing renders",
                "The number 0 appears on screen",
                "The Component renders",
                "It throws an error",
              ],
              correct: 1,
              explanation:
                "Gotcha! 0 is falsy but JSX renders it as text. Use {count > 0 && <Component />} or {!!count && <Component />} to avoid accidentally showing 0.",
              difficulty: "medium",
            },
            {
              id: 6,
              question: "How do you handle loading states in React?",
              options: [
                "React automatically shows a loading state",
                "Use conditional rendering based on an isLoading state",
                "Loading states aren't possible in React",
                "Only class components can have loading states",
              ],
              correct: 1,
              explanation:
                "Use an isLoading state variable and conditionally render a loading spinner or skeleton: {isLoading ? <Spinner /> : <Content />}",
              difficulty: "easy",
            },
            {
              id: 7,
              question: "What is a common pattern for handling error states?",
              options: [
                "Use try/catch in JSX",
                "Early return with error UI when error state exists",
                "Errors automatically display in React",
                "Use console.error()",
              ],
              correct: 1,
              explanation:
                "Use an error state variable and early return: if (error) return <ErrorMessage message={error} />. This keeps error handling separate from main content.",
              difficulty: "easy",
            },
            {
              id: 8,
              question: "What renders when this expression evaluates: {null}",
              options: [
                "The word 'null'",
                "Nothing - null is ignored by React",
                "An error",
                "An empty string",
              ],
              correct: 1,
              explanation:
                "null, undefined, false, and true are valid JSX but render nothing. This is useful for conditional rendering - you can return null to hide a component.",
              difficulty: "easy",
            },
            {
              id: 9,
              question: "How do you render different content based on multiple conditions (like user roles)?",
              options: [
                "Nested ternary operators only",
                "Multiple early returns or switch-like patterns",
                "Multiple if statements in JSX",
                "It's not possible",
              ],
              correct: 1,
              explanation:
                "For multiple conditions, use early returns for each case, or create a mapping object/switch statement. Avoid deeply nested ternaries - they're hard to read.",
              difficulty: "medium",
            },
            {
              id: 10,
              question: "What does this render: {showTitle && <h1>{title}</h1>}",
              options: [
                "Always renders the h1",
                "Renders h1 only when showTitle is truthy",
                "Renders 'true' or 'false'",
                "This is invalid syntax",
              ],
              correct: 1,
              explanation:
                "This is the && pattern - the h1 only renders when showTitle is truthy. If showTitle is false/null/undefined, nothing renders.",
              difficulty: "easy",
            },
            {
              id: 11,
              question: "Why is early return better than deeply nested ternaries?",
              options: [
                "It's faster to execute",
                "It's more readable and handles edge cases at the top",
                "It uses less memory",
                "React requires it",
              ],
              correct: 1,
              explanation:
                "Early returns make code more readable by handling special cases (loading, error, empty) first, keeping the main render logic clean and at the base indentation level.",
              difficulty: "medium",
            },
            {
              id: 12,
              question: "What is the pattern for showing empty states?",
              options: [
                "if (items.length === 0) in JSX",
                "Early return or && with items.length === 0 check",
                "Empty states aren't handled in React",
                "Use CSS to hide empty content",
              ],
              correct: 1,
              explanation:
                "Handle empty states with early return: if (items.length === 0) return <EmptyState />; or inline: {items.length === 0 && <EmptyState />}.",
              difficulty: "easy",
            },
          ],
          isPremium: false,
          requiredPlan: "FREE",
        },
        create: {
          slug: "conditional-rendering-quiz",
          tutorialId: conditionalRenderingTutorial.id,
          title: "Conditional Rendering Quiz",
          questions: [
            {
              id: 1,
              question: "Which is the correct way to conditionally render content using the ternary operator?",
              options: [
                "if (isLoggedIn) { <Welcome /> }",
                "{isLoggedIn ? <Welcome /> : <Login />}",
                "<isLoggedIn ? Welcome : Login />",
                "{if isLoggedIn then <Welcome />}",
              ],
              correct: 1,
              explanation:
                "The ternary operator (condition ? trueResult : falseResult) works inside JSX curly braces and is perfect for toggling between two pieces of content.",
              difficulty: "easy",
            },
            {
              id: 2,
              question: "What does this JSX render: {count > 0 && <Badge>{count}</Badge>}",
              options: [
                "Always renders the Badge",
                "Renders Badge only when count is greater than 0",
                "Renders 'true' or 'false'",
                "This syntax is invalid",
              ],
              correct: 1,
              explanation:
                "The logical AND (&&) operator renders the right side only when the left side is truthy. It's perfect for 'show something or nothing' conditions.",
              difficulty: "easy",
            },
            {
              id: 3,
              question: "When should you use the ternary operator vs && for conditional rendering?",
              options: [
                "Always use ternary, && is deprecated",
                "Ternary for 'show A or B', && for 'show A or nothing'",
                "&& is faster than ternary",
                "They do the exact same thing",
              ],
              correct: 1,
              explanation:
                "Use ternary (? :) when you need to choose between two different things to render. Use && when you want to show something or nothing at all.",
              difficulty: "medium",
            },
            {
              id: 4,
              question: "What is 'early return' in React components?",
              options: [
                "Returning from a component before the render completes",
                "Using return statements before the main JSX to handle special cases",
                "Returning early from useEffect",
                "A performance optimization technique",
              ],
              correct: 1,
              explanation:
                "Early return means handling special cases (loading, error, empty) with return statements at the top of your component, keeping the main JSX clean and unindented.",
              difficulty: "medium",
            },
            {
              id: 5,
              question: "What happens when you try to render {0 && <Component />}?",
              options: [
                "Nothing renders",
                "The number 0 appears on screen",
                "The Component renders",
                "It throws an error",
              ],
              correct: 1,
              explanation:
                "Gotcha! 0 is falsy but JSX renders it as text. Use {count > 0 && <Component />} or {!!count && <Component />} to avoid accidentally showing 0.",
              difficulty: "medium",
            },
            {
              id: 6,
              question: "How do you handle loading states in React?",
              options: [
                "React automatically shows a loading state",
                "Use conditional rendering based on an isLoading state",
                "Loading states aren't possible in React",
                "Only class components can have loading states",
              ],
              correct: 1,
              explanation:
                "Use an isLoading state variable and conditionally render a loading spinner or skeleton: {isLoading ? <Spinner /> : <Content />}",
              difficulty: "easy",
            },
            {
              id: 7,
              question: "What is a common pattern for handling error states?",
              options: [
                "Use try/catch in JSX",
                "Early return with error UI when error state exists",
                "Errors automatically display in React",
                "Use console.error()",
              ],
              correct: 1,
              explanation:
                "Use an error state variable and early return: if (error) return <ErrorMessage message={error} />. This keeps error handling separate from main content.",
              difficulty: "easy",
            },
            {
              id: 8,
              question: "What renders when this expression evaluates: {null}",
              options: [
                "The word 'null'",
                "Nothing - null is ignored by React",
                "An error",
                "An empty string",
              ],
              correct: 1,
              explanation:
                "null, undefined, false, and true are valid JSX but render nothing. This is useful for conditional rendering - you can return null to hide a component.",
              difficulty: "easy",
            },
            {
              id: 9,
              question: "How do you render different content based on multiple conditions (like user roles)?",
              options: [
                "Nested ternary operators only",
                "Multiple early returns or switch-like patterns",
                "Multiple if statements in JSX",
                "It's not possible",
              ],
              correct: 1,
              explanation:
                "For multiple conditions, use early returns for each case, or create a mapping object/switch statement. Avoid deeply nested ternaries - they're hard to read.",
              difficulty: "medium",
            },
            {
              id: 10,
              question: "What does this render: {showTitle && <h1>{title}</h1>}",
              options: [
                "Always renders the h1",
                "Renders h1 only when showTitle is truthy",
                "Renders 'true' or 'false'",
                "This is invalid syntax",
              ],
              correct: 1,
              explanation:
                "This is the && pattern - the h1 only renders when showTitle is truthy. If showTitle is false/null/undefined, nothing renders.",
              difficulty: "easy",
            },
            {
              id: 11,
              question: "Why is early return better than deeply nested ternaries?",
              options: [
                "It's faster to execute",
                "It's more readable and handles edge cases at the top",
                "It uses less memory",
                "React requires it",
              ],
              correct: 1,
              explanation:
                "Early returns make code more readable by handling special cases (loading, error, empty) first, keeping the main render logic clean and at the base indentation level.",
              difficulty: "medium",
            },
            {
              id: 12,
              question: "What is the pattern for showing empty states?",
              options: [
                "if (items.length === 0) in JSX",
                "Early return or && with items.length === 0 check",
                "Empty states aren't handled in React",
                "Use CSS to hide empty content",
              ],
              correct: 1,
              explanation:
                "Handle empty states with early return: if (items.length === 0) return <EmptyState />; or inline: {items.length === 0 && <EmptyState />}.",
              difficulty: "easy",
            },
          ],
          isPremium: false,
          requiredPlan: "FREE",
        },
      });

      console.log(`✅ Quiz: ${conditionalRenderingQuiz.title} (${(conditionalRenderingQuiz.questions as any[]).length} questions)`);
    }

    // Find Lists and Keys tutorial
    const listsAndKeysTutorial = await client.tutorial.findUnique({
      where: { slug: "lists-and-keys" },
    });

    if (!listsAndKeysTutorial) {
      console.warn("⚠️ Tutorial 'lists-and-keys' not found. Skipping quiz.");
    } else {
      // Quiz 5: Lists and Keys
      const listsAndKeysQuiz = await client.quiz.upsert({
        where: { slug: "lists-and-keys-quiz" },
        update: {
          title: "Lists and Keys Quiz",
          questions: [
            {
              id: 1,
              question: "What array method do you use to render a list of elements in React?",
              options: [
                "forEach()",
                "map()",
                "filter()",
                "reduce()",
              ],
              correct: 1,
              explanation:
                "The map() method transforms each item in an array into JSX. Unlike forEach(), map() returns a new array which React can render.",
              difficulty: "easy",
            },
            {
              id: 2,
              question: "Why is the 'key' prop important when rendering lists?",
              options: [
                "It's required for CSS styling",
                "It helps React efficiently identify which items changed, added, or removed",
                "It determines the order of items",
                "It's optional and just for documentation",
              ],
              correct: 1,
              explanation:
                "Keys help React's reconciliation algorithm identify which items have changed. Without proper keys, React might update the wrong elements or do unnecessary re-renders.",
              difficulty: "easy",
            },
            {
              id: 3,
              question: "What's the best practice for key values when rendering lists?",
              options: [
                "Always use the array index",
                "Use a unique identifier like an ID from your data",
                "Use random numbers",
                "Keys aren't necessary if the list is small",
              ],
              correct: 1,
              explanation:
                "Using a unique, stable identifier (like a database ID) is best practice. Using array index can cause bugs when items are reordered, added, or removed.",
              difficulty: "medium",
            },
            {
              id: 4,
              question: "When is it okay to use array index as a key?",
              options: [
                "Never - it's always wrong",
                "When the list is static and items won't be reordered, added, or removed",
                "Only when the list has less than 10 items",
                "Always - it's the recommended approach",
              ],
              correct: 1,
              explanation:
                "Using index as key is acceptable only for static lists that never change. If items can be reordered, added, or removed, use unique IDs to avoid rendering bugs.",
              difficulty: "medium",
            },
            {
              id: 5,
              question: "What does this code do: {users.filter(u => u.active).map(u => <User key={u.id} {...u} />)}",
              options: [
                "Shows all users, then filters them",
                "First filters to only active users, then renders them",
                "This syntax is invalid",
                "Shows active users twice",
              ],
              correct: 1,
              explanation:
                "This chains filter() and map() - first filtering the array to only active users, then mapping each active user to a User component. It's a common pattern!",
              difficulty: "medium",
            },
            {
              id: 6,
              question: "What happens if you forget to add keys to list items?",
              options: [
                "The app crashes",
                "React shows a warning and may have performance issues",
                "Nothing - React handles it automatically",
                "The list renders in reverse order",
              ],
              correct: 1,
              explanation:
                "React will show a warning in the console and may have issues with component state and performance when updating the list. Always add keys!",
              difficulty: "easy",
            },
            {
              id: 7,
              question: "How do you render an empty state when a list has no items?",
              options: [
                "React automatically shows 'Empty' text",
                "Check array.length before mapping and conditionally render empty state",
                "Use a special 'empty' key",
                "Empty arrays cause errors",
              ],
              correct: 1,
              explanation:
                "Check the array length: {items.length === 0 ? <EmptyState /> : items.map(...)}. Or use early return: if (items.length === 0) return <EmptyState />;",
              difficulty: "easy",
            },
            {
              id: 8,
              question: "What does this code return: {[].map(item => <div>{item}</div>)}",
              options: [
                "An error",
                "Nothing - an empty array maps to nothing",
                "A single empty div",
                "The word 'undefined'",
              ],
              correct: 1,
              explanation:
                "Mapping over an empty array returns an empty array, which React renders as nothing. This is why you need to explicitly handle empty states.",
              difficulty: "easy",
            },
            {
              id: 9,
              question: "How do you sort a list before rendering?",
              options: [
                "Use the sort prop on the list",
                "Chain .sort() before .map(), like items.sort((a,b) => a.name.localeCompare(b.name)).map(...)",
                "React sorts lists automatically",
                "Sorting isn't possible with map()",
              ],
              correct: 1,
              explanation:
                "Chain array methods: items.sort(...).map(...). Remember that sort() mutates the original array, so you might want to use [...items].sort(...) to avoid mutations.",
              difficulty: "medium",
            },
            {
              id: 10,
              question: "Where should the key prop be placed when rendering lists?",
              options: [
                "On the innermost element",
                "On the outermost element returned from map()",
                "On the array itself",
                "Keys can go anywhere",
              ],
              correct: 1,
              explanation:
                "The key prop should be on the outermost element returned from map(). If you return a fragment, use <React.Fragment key={id}> instead of the shorthand <>.",
              difficulty: "medium",
            },
            {
              id: 11,
              question: "Can you use objects as keys in React?",
              options: [
                "Yes, objects work well as keys",
                "No, keys must be strings or numbers",
                "Only with special configuration",
                "Only in class components",
              ],
              correct: 1,
              explanation:
                "Keys must be strings or numbers. If you try to use an object, React will convert it to '[object Object]' which won't be unique!",
              difficulty: "medium",
            },
            {
              id: 12,
              question: "What's the output of: {['a', 'b', 'c'].map((letter, index) => <span key={index}>{letter}</span>)}",
              options: [
                "abc (three separate spans)",
                "An error because index is not unique",
                "['a', 'b', 'c']",
                "A single span with 'abc'",
              ],
              correct: 0,
              explanation:
                "This renders three separate <span> elements containing 'a', 'b', and 'c'. Using index as key works here but isn't ideal if the list can change.",
              difficulty: "easy",
            },
          ],
          isPremium: false,
          requiredPlan: "FREE",
        },
        create: {
          slug: "lists-and-keys-quiz",
          tutorialId: listsAndKeysTutorial.id,
          title: "Lists and Keys Quiz",
          questions: [
            {
              id: 1,
              question: "What array method do you use to render a list of elements in React?",
              options: [
                "forEach()",
                "map()",
                "filter()",
                "reduce()",
              ],
              correct: 1,
              explanation:
                "The map() method transforms each item in an array into JSX. Unlike forEach(), map() returns a new array which React can render.",
              difficulty: "easy",
            },
            {
              id: 2,
              question: "Why is the 'key' prop important when rendering lists?",
              options: [
                "It's required for CSS styling",
                "It helps React efficiently identify which items changed, added, or removed",
                "It determines the order of items",
                "It's optional and just for documentation",
              ],
              correct: 1,
              explanation:
                "Keys help React's reconciliation algorithm identify which items have changed. Without proper keys, React might update the wrong elements or do unnecessary re-renders.",
              difficulty: "easy",
            },
            {
              id: 3,
              question: "What's the best practice for key values when rendering lists?",
              options: [
                "Always use the array index",
                "Use a unique identifier like an ID from your data",
                "Use random numbers",
                "Keys aren't necessary if the list is small",
              ],
              correct: 1,
              explanation:
                "Using a unique, stable identifier (like a database ID) is best practice. Using array index can cause bugs when items are reordered, added, or removed.",
              difficulty: "medium",
            },
            {
              id: 4,
              question: "When is it okay to use array index as a key?",
              options: [
                "Never - it's always wrong",
                "When the list is static and items won't be reordered, added, or removed",
                "Only when the list has less than 10 items",
                "Always - it's the recommended approach",
              ],
              correct: 1,
              explanation:
                "Using index as key is acceptable only for static lists that never change. If items can be reordered, added, or removed, use unique IDs to avoid rendering bugs.",
              difficulty: "medium",
            },
            {
              id: 5,
              question: "What does this code do: {users.filter(u => u.active).map(u => <User key={u.id} {...u} />)}",
              options: [
                "Shows all users, then filters them",
                "First filters to only active users, then renders them",
                "This syntax is invalid",
                "Shows active users twice",
              ],
              correct: 1,
              explanation:
                "This chains filter() and map() - first filtering the array to only active users, then mapping each active user to a User component. It's a common pattern!",
              difficulty: "medium",
            },
            {
              id: 6,
              question: "What happens if you forget to add keys to list items?",
              options: [
                "The app crashes",
                "React shows a warning and may have performance issues",
                "Nothing - React handles it automatically",
                "The list renders in reverse order",
              ],
              correct: 1,
              explanation:
                "React will show a warning in the console and may have issues with component state and performance when updating the list. Always add keys!",
              difficulty: "easy",
            },
            {
              id: 7,
              question: "How do you render an empty state when a list has no items?",
              options: [
                "React automatically shows 'Empty' text",
                "Check array.length before mapping and conditionally render empty state",
                "Use a special 'empty' key",
                "Empty arrays cause errors",
              ],
              correct: 1,
              explanation:
                "Check the array length: {items.length === 0 ? <EmptyState /> : items.map(...)}. Or use early return: if (items.length === 0) return <EmptyState />;",
              difficulty: "easy",
            },
            {
              id: 8,
              question: "What does this code return: {[].map(item => <div>{item}</div>)}",
              options: [
                "An error",
                "Nothing - an empty array maps to nothing",
                "A single empty div",
                "The word 'undefined'",
              ],
              correct: 1,
              explanation:
                "Mapping over an empty array returns an empty array, which React renders as nothing. This is why you need to explicitly handle empty states.",
              difficulty: "easy",
            },
            {
              id: 9,
              question: "How do you sort a list before rendering?",
              options: [
                "Use the sort prop on the list",
                "Chain .sort() before .map(), like items.sort((a,b) => a.name.localeCompare(b.name)).map(...)",
                "React sorts lists automatically",
                "Sorting isn't possible with map()",
              ],
              correct: 1,
              explanation:
                "Chain array methods: items.sort(...).map(...). Remember that sort() mutates the original array, so you might want to use [...items].sort(...) to avoid mutations.",
              difficulty: "medium",
            },
            {
              id: 10,
              question: "Where should the key prop be placed when rendering lists?",
              options: [
                "On the innermost element",
                "On the outermost element returned from map()",
                "On the array itself",
                "Keys can go anywhere",
              ],
              correct: 1,
              explanation:
                "The key prop should be on the outermost element returned from map(). If you return a fragment, use <React.Fragment key={id}> instead of the shorthand <>.",
              difficulty: "medium",
            },
            {
              id: 11,
              question: "Can you use objects as keys in React?",
              options: [
                "Yes, objects work well as keys",
                "No, keys must be strings or numbers",
                "Only with special configuration",
                "Only in class components",
              ],
              correct: 1,
              explanation:
                "Keys must be strings or numbers. If you try to use an object, React will convert it to '[object Object]' which won't be unique!",
              difficulty: "medium",
            },
            {
              id: 12,
              question: "What's the output of: {['a', 'b', 'c'].map((letter, index) => <span key={index}>{letter}</span>)}",
              options: [
                "abc (three separate spans)",
                "An error because index is not unique",
                "['a', 'b', 'c']",
                "A single span with 'abc'",
              ],
              correct: 0,
              explanation:
                "This renders three separate <span> elements containing 'a', 'b', and 'c'. Using index as key works here but isn't ideal if the list can change.",
              difficulty: "easy",
            },
          ],
          isPremium: false,
          requiredPlan: "FREE",
        },
      });

      console.log(`✅ Quiz: ${listsAndKeysQuiz.title} (${(listsAndKeysQuiz.questions as any[]).length} questions)`);
    }

    console.log(`✅ Successfully seeded React quizzes`);
  } catch (error) {
    console.error("❌ Error seeding React quizzes:", error);
    throw error;
  }
}

// Allow running as standalone script
seedReactQuizzes()
  .then(() => {
    console.log("🎉 React quiz seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed React quizzes:", error);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) await prisma.$disconnect();
  });
