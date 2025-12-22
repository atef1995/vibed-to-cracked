import { ValidatedExercise } from "../ui/ValidatedExercise";

// Example 1: HTML Exercise - Create a button
export function HtmlButtonExercise() {
  return (
    <ValidatedExercise
      title="Exercise 1: Create a Button"
      instructions="Create an HTML button with the text 'Click Me!' and give it an id of 'myButton'."
      initialHtml='<!-- Write your HTML here -->\n'
      showCssEditor={false}
      showJsEditor={false}
      testCases={[
        {
          description: "HTML contains a <button> element",
          validatorKey: "hasButton",
        },
        {
          description: "Button has id='myButton'",
          validatorKey: "hasButtonId",
        },
        {
          description: "Button contains text 'Click Me!'",
          validatorKey: "hasButtonText",
        },
      ]}
      hints={[
        "Use the <button> tag to create a button",
        "Add an id attribute like this: id=\"myButton\"",
        "Put the text between the opening and closing button tags",
      ]}
      solution={{
        html: '<button id="myButton">Click Me!</button>',
      }}
      exerciseId="example-html-button"
    />
  );
}

// Example 2: CSS Exercise - Style a heading
export function CssStylingExercise() {
  return (
    <ValidatedExercise
      title="Exercise 2: Style a Heading"
      instructions="Make the h1 element blue, centered, and 32px in size."
      initialHtml='<h1>Hello World</h1>'
      initialCss='/* Write your CSS here */\n'
      showJsEditor={false}
      testCases={[
        {
          description: "h1 has blue color",
          validatorKey: "h1BlueColor",
        },
        {
          description: "h1 is centered",
          validatorKey: "h1Centered",
        },
        {
          description: "h1 font-size is 32px",
          validatorKey: "h1FontSize",
        },
      ]}
      hints={[
        "Use the h1 selector to target the heading",
        "Set color: blue; for blue text",
        "Use text-align: center; to center the text",
        "Set font-size: 32px; for the size",
      ]}
      solution={{
        html: '<h1>Hello World</h1>',
        css: `h1 {
  color: blue;
  text-align: center;
  font-size: 32px;
}`,
      }}
      exerciseId="example-css-styling"
    />
  );
}

// Example 3: JavaScript Exercise - Alert on Click
export function JavaScriptClickExercise() {
  return (
    <ValidatedExercise
      title="Exercise 3: Button Click Alert"
      instructions="Add JavaScript that shows an alert saying 'Hello!' when the button is clicked."
      initialHtml='<button id="greetBtn">Greet Me</button>'
      initialJs='// Write your JavaScript here\n'
      showCssEditor={false}
      testCases={[
        {
          description: "Code selects the button by id",
          validatorKey: "incrementId",
        },
        {
          description: "Code adds a click event listener",
          validatorKey: "eventListeners",
        },
        {
          description: "Code shows an alert",
          validatorKey: "hasButtonText",
        },
      ]}
      hints={[
        "Use document.getElementById('greetBtn') to select the button",
        "Add an event listener with .addEventListener('click', function)",
        "Show an alert with alert('Hello!')",
      ]}
      solution={{
        html: '<button id="greetBtn">Greet Me</button>',
        js: `document.getElementById('greetBtn').addEventListener('click', function() {
  alert('Hello!');
});`,
      }}
      exerciseId="example-js-counter"
    />
  );
}

// Example 4: Full Stack Exercise - Counter App
export function CounterAppExercise() {
  return (
    <ValidatedExercise
      title="Exercise 4: Build a Counter App"
      instructions="Create a counter with a display and two buttons (+ and -) that increment/decrement the counter."
      initialHtml={`<div id="counter">0</div>
<button id="increment">+</button>
<button id="decrement">-</button>`}
      initialCss={`/* Style your counter */
`}
      initialJs={`// Add your JavaScript here
let count = 0;

`}
      testCases={[
        {
          description: "HTML has a counter display element with id='counter'",
          validatorKey: "counterId",
        },
        {
          description: "HTML has increment button with id='increment'",
          validatorKey: "incrementId",
        },
        {
          description: "HTML has decrement button with id='decrement'",
          validatorKey: "decrementId",
        },
        {
          description: "JavaScript declares a count variable",
          validatorKey: "counterLogic",
        },
        {
          description: "JavaScript has event listeners for both buttons",
          validatorKey: "eventListeners",
        },
      ]}
      hints={[
        "Use document.getElementById() to select elements",
        "Update the counter display with element.textContent = count",
        "Increment: count++; Decrement: count--",
        "Don't forget to update the display after each button click!",
      ]}
      solution={{
        html: `<div id="counter">0</div>
<button id="increment">+</button>
<button id="decrement">-</button>`,
        css: `#counter {
  font-size: 48px;
  font-weight: bold;
  text-align: center;
  margin: 20px;
  color: #333;
}

button {
  font-size: 24px;
  padding: 10px 20px;
  margin: 5px;
  cursor: pointer;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
}

button:hover {
  background: #45a049;
}`,
        js: `let count = 0;

const counterDisplay = document.getElementById('counter');
const incrementBtn = document.getElementById('increment');
const decrementBtn = document.getElementById('decrement');

incrementBtn.addEventListener('click', function() {
  count++;
  counterDisplay.textContent = count;
});

decrementBtn.addEventListener('click', function() {
  count--;
  counterDisplay.textContent = count;
});`,
      }}
      exerciseId="example-js-counter"
    />
  );
}
