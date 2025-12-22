/**
 * Exercise Validators Registry
 * Contains all validation functions for coding exercises
 */

type CalculatorWindow = Window & {
  clearDisplay?: () => void;
  appendNumber?: (num: string) => void;
  appendOperator?: (op: string) => void;
  calculate?: () => void;
};

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const exerciseValidators: Record<string, Record<string, ValidateFn>> = {
  "javascript-calculator": {
    addition: (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      try {
        const win = iframeWindow as CalculatorWindow;
        if (
          !win.clearDisplay ||
          !win.appendNumber ||
          !win.appendOperator ||
          !win.calculate
        )
          return false;
        win.clearDisplay();
        win.appendNumber("5");
        win.appendOperator("+");
        win.appendNumber("3");
        win.calculate();
        const display = win.document.getElementById("display") as HTMLInputElement;
        return display && parseFloat(display.value) === 8;
      } catch (e) {
        return false;
      }
    },

    subtraction: (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      try {
        const win = iframeWindow as CalculatorWindow;
        if (
          !win.clearDisplay ||
          !win.appendNumber ||
          !win.appendOperator ||
          !win.calculate
        )
          return false;
        win.clearDisplay();
        win.appendNumber("1");
        win.appendNumber("0");
        win.appendOperator("-");
        win.appendNumber("4");
        win.calculate();
        const display = win.document.getElementById("display") as HTMLInputElement;
        return display && parseFloat(display.value) === 6;
      } catch (e) {
        return false;
      }
    },

    multiplication: (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      try {
        const win = iframeWindow as CalculatorWindow;
        if (
          !win.clearDisplay ||
          !win.appendNumber ||
          !win.appendOperator ||
          !win.calculate
        )
          return false;
        win.clearDisplay();
        win.appendNumber("6");
        win.appendOperator("*");
        win.appendNumber("7");
        win.calculate();
        const display = win.document.getElementById("display") as HTMLInputElement;
        return display && parseFloat(display.value) === 42;
      } catch (e) {
        return false;
      }
    },

    division: (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      try {
        const win = iframeWindow as CalculatorWindow;
        if (
          !win.clearDisplay ||
          !win.appendNumber ||
          !win.appendOperator ||
          !win.calculate
        )
          return false;
        win.clearDisplay();
        win.appendNumber("2");
        win.appendNumber("0");
        win.appendOperator("/");
        win.appendNumber("4");
        win.calculate();
        const display = win.document.getElementById("display") as HTMLInputElement;
        return display && parseFloat(display.value) === 5;
      } catch (e) {
        return false;
      }
    },

    divisionByZero: (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return js.includes("=== 0") || js.includes("== 0");
      try {
        const win = iframeWindow as CalculatorWindow;
        if (
          !win.clearDisplay ||
          !win.appendNumber ||
          !win.appendOperator ||
          !win.calculate
        )
          return false;
        win.clearDisplay();
        win.appendNumber("5");
        win.appendOperator("/");
        win.appendNumber("0");
        win.calculate();
        const displayAfter = (win.document.getElementById("display") as HTMLInputElement)?.value;
        // Display should either show error message or remain unchanged (not show Infinity or NaN)
        return (
          displayAfter !== "Infinity" &&
          displayAfter !== "NaN" &&
          !displayAfter?.includes("Infinity")
        );
      } catch (e) {
        return false;
      }
    },

    decimal: (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return js.includes("includes('.')");
      try {
        const win = iframeWindow as CalculatorWindow;
        if (!win.clearDisplay || !win.appendNumber) return false;
        win.clearDisplay();
        win.appendNumber("3");
        win.appendNumber(".");
        win.appendNumber("5");
        const display = win.document.getElementById("display") as HTMLInputElement;
        return display && display.value.includes(".");
      } catch (e) {
        return false;
      }
    },

    clear: (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return js.includes("clearDisplay");
      try {
        const win = iframeWindow as CalculatorWindow;
        if (!win.clearDisplay || !win.appendNumber) return false;
        win.appendNumber("5");
        win.clearDisplay();
        const display = win.document.getElementById("display") as HTMLInputElement;
        return display && display.value === "";
      } catch (e) {
        return false;
      }
    },
  },

  // Add more exercises here as needed
  "html-button-styling": {
    padding: (html, css) => css.includes("padding"),
    borderRadius: (html, css) => css.includes("border-radius"),
    backgroundColor: (html, css) => css.includes("background"),
    cursor: (html, css) => css.includes("cursor"),
  },

  "css-flexbox-layout": {
    flexDisplay: (html, css) =>
      css.includes("display: flex") || css.includes("display:flex"),
    justifyContent: (html, css) => css.includes("justify-content"),
    mediaQuery: (html, css) => css.includes("@media"),
    activeClass: (html, css) => css.includes(".active") || css.includes("active"),
  },

  "javascript-dom-manipulation": {
    addTaskFunction: (html, css, js) => js.includes("function addTask"),
    getElementById: (html, css, js) => js.includes("getElementById"),
    createElement: (html, css, js) => js.includes("createElement"),
    deleteTaskFunction: (html, css, js) => js.includes("deleteTask"),
  },

  // Example exercises
  "example-html-button": {
    hasButton: (html) =>
      html.toLowerCase().includes("<button"),
    hasButtonId: (html) =>
      html.includes('id="myButton"') || html.includes("id='myButton'"),
    hasButtonText: (html) => html.includes("Click Me!"),
  },

  "example-css-styling": {
    h1BlueColor: (html, css) =>
      css.includes("color: blue") ||
      css.includes("color:blue") ||
      css.includes("blue"),
    h1Centered: (html, css) =>
      css.includes("text-align: center") ||
      css.includes("text-align:center") ||
      css.includes("center"),
    h1FontSize: (html, css) =>
      css.includes("32px") ||
      css.includes("32") ||
      css.includes("font-size"),
  },

  "example-css-layout": {
    containerFlex: (html, css) =>
      css.includes("display: flex") || css.includes("display:flex"),
    containerJustifyContent: (html, css) =>
      css.includes("justify-content") ||
      css.includes("space-around") ||
      css.includes("space-between"),
    containerGap: (html, css) =>
      css.includes("gap") || css.includes("margin"),
    itemsWidthOrFlex: (html, css) =>
      css.includes("flex: 1") ||
      css.includes("flex:1") ||
      css.includes("width"),
  },

  "example-js-counter": {
    counterId: (html) =>
      html.includes('id="counter"') || html.includes("id='counter'"),
    incrementId: (html) =>
      html.includes('id="increment"') || html.includes("id='increment'"),
    decrementId: (html) =>
      html.includes('id="decrement"') || html.includes("id='decrement'"),
    counterLogic: (html, css, js) =>
      js.includes("++") ||
      js.includes("--") ||
      js.includes("count ="),
    eventListeners: (html, css, js) =>
      js.includes("addEventListener") ||
      js.includes("querySelector") ||
      js.includes("getElementById"),
  },
};

/**
 * Get validator function for an exercise
 */
export function getValidator(
  exerciseId: string,
  validatorKey: string
): ValidateFn | undefined {
  return exerciseValidators[exerciseId]?.[validatorKey];
}
