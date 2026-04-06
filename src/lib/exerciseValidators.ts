/**
 * Exercise Validators Registry
 * Contains all validation functions for coding exercises
 */

import { cssLayoutFlexboxValidators } from "./validators/cssLayoutFlexboxValidators";
import { cssGridLayoutValidators } from "./validators/cssGridLayoutValidators";
import { cssPositioningZIndexValidators } from "./validators/cssPositioningZIndexValidators";
import { cssTransformsTransitionsValidators } from "./validators/cssTransformsTransitionsValidators";
import { cssAnimationsValidators } from "./validators/cssAnimationsValidators";
import { cssResponsiveDesignValidators } from "./validators/cssResponsiveDesignValidators";
import { cssAdvancedSelectorsValidators } from "./validators/cssAdvancedSelectorsValidators";
import { cssVariablesValidators } from "./validators/cssVariablesValidators";
import { cssTypographyFontsValidators } from "./validators/cssTypographyFontsValidators";
import { cssArchitectureValidators } from "./validators/cssArchitectureValidators";
import { cssModernFeaturesValidators } from "./validators/cssModernFeaturesValidators";
import { htmlBasicsValidators } from "./validators/htmlBasicsValidators";
import { htmlFormsInputsValidators } from "./validators/htmlFormsInputsValidators";
import { htmlMultimediaValidators } from "./validators/htmlMultimediaValidators";
import { htmlSemanticElementsValidators } from "./validators/htmlSemanticElementsValidators";
import { htmlAccessibilityValidators } from "./validators/htmlAccessibilityValidators";
import { htmlTablesDataValidators } from "./validators/htmlTablesDataValidators";
import { htmlLinksNavigationValidators } from "./validators/htmlLinksNavigationValidators";
import { htmlListsOrganizationValidators } from "./validators/htmlListsOrganizationValidators";
import { htmlDocumentHeadValidators } from "./validators/htmlDocumentHeadValidators";
import { htmlResponsiveBasicsValidators } from "./validators/htmlResponsiveBasicsValidators";

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
        const display = win.document.getElementById(
          "display"
        ) as HTMLInputElement;
        return display && parseFloat(display.value) === 8;
      } catch (e) {
        console.error(e);
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
        const display = win.document.getElementById(
          "display"
        ) as HTMLInputElement;
        return display && parseFloat(display.value) === 6;
      } catch (e) {
        console.error(e);
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
        const display = win.document.getElementById(
          "display"
        ) as HTMLInputElement;
        return display && parseFloat(display.value) === 42;
      } catch (e) {
        console.error(e);
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
        const display = win.document.getElementById(
          "display"
        ) as HTMLInputElement;
        return display && parseFloat(display.value) === 5;
      } catch (e) {
        console.error(e);
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
        const displayAfter = (
          win.document.getElementById("display") as HTMLInputElement
        )?.value;
        // Display should either show error message or remain unchanged (not show Infinity or NaN)
        return (
          displayAfter !== "Infinity" &&
          displayAfter !== "NaN" &&
          !displayAfter?.includes("Infinity")
        );
      } catch (e) {
        console.error(e);
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
        const display = win.document.getElementById(
          "display"
        ) as HTMLInputElement;
        return display && display.value.includes(".");
      } catch (e) {
        console.error(e);
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
        const display = win.document.getElementById(
          "display"
        ) as HTMLInputElement;
        return display && display.value === "";
      } catch (e) {
        console.error(e);
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
    activeClass: (html, css) =>
      css.includes(".active") || css.includes("active"),
  },

  "javascript-dom-manipulation": {
    addTaskFunction: (html, css, js) => js.includes("function addTask"),
    getElementById: (html, css, js) => js.includes("getElementById"),
    createElement: (html, css, js) => js.includes("createElement"),
    deleteTaskFunction: (html, css, js) => js.includes("deleteTask"),
  },

  // Example exercises
  "example-html-button": {
    hasButton: (html) => html.toLowerCase().includes("<button"),
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
      css.includes("32px") || css.includes("32") || css.includes("font-size"),
  },

  "example-css-layout": {
    containerFlex: (html, css) =>
      css.includes("display: flex") || css.includes("display:flex"),
    containerJustifyContent: (html, css) =>
      css.includes("justify-content") ||
      css.includes("space-around") ||
      css.includes("space-between"),
    containerGap: (html, css) => css.includes("gap") || css.includes("margin"),
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
      js.includes("++") || js.includes("--") || js.includes("count ="),
    eventListeners: (html, css, js) =>
      js.includes("addEventListener") ||
      js.includes("querySelector") ||
      js.includes("getElementById"),
  },

  "dom-selectors-traversal-step-01": {
    "selects-cards": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return iframeWindow.document.querySelectorAll(".card").length === 3;
    },
    "updates-second": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const cards = iframeWindow.document.querySelectorAll(".card");
      return cards[1]?.textContent === "Updated";
    },
    "others-unchanged": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const cards = iframeWindow.document.querySelectorAll(".card");
      return (
        cards[0]?.textContent === "First" && cards[2]?.textContent === "Third"
      );
    },
  },

  "dom-selectors-traversal-step-02": {
    "required-placeholders": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const required = iframeWindow.document.querySelectorAll("[required]");
      return (
        required.length > 0 &&
        Array.from(required).every(
          (el) => (el as HTMLInputElement).placeholder === "Required field"
        )
      );
    },
    "password-value": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const pw = iframeWindow.document.querySelector(
        '[type="password"]'
      ) as HTMLInputElement;
      return pw?.value === "secret";
    },
    "optional-unchanged": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const text = iframeWindow.document.querySelector(
        '[type="text"]'
      ) as HTMLInputElement;
      const pw = iframeWindow.document.querySelector(
        '[type="password"]'
      ) as HTMLInputElement;
      return text?.placeholder === "Username" && pw?.placeholder === "Password";
    },
  },

  "dom-selectors-traversal-step-03": {
    "third-selected": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const third = iframeWindow.document.querySelector("li:nth-child(3)");
      return third?.textContent === "Selected";
    },
    "not-first-dimmed": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const items = iframeWindow.document.querySelectorAll(
        "li:not(:first-child)"
      );
      return (
        items.length > 0 &&
        Array.from(items).every((el) => el.classList.contains("dimmed"))
      );
    },
    "first-no-dimmed": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const first = iframeWindow.document.querySelector("li:first-child");
      return first !== null && !first.classList.contains("dimmed");
    },
  },

  "dom-selectors-traversal-step-04": {
    "direct-children-blue": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const ps = iframeWindow.document.querySelectorAll(".wrapper > p");
      return (
        ps.length > 0 &&
        Array.from(ps).every((el) => (el as HTMLElement).style.color === "blue")
      );
    },
    "after-h3-bold": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const p = iframeWindow.document.querySelector(
        "h3 + p"
      ) as HTMLElement | null;
      return p?.style.fontWeight === "bold";
    },
    "nested-not-blue": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const nested = iframeWindow.document.querySelector(
        ".inner p"
      ) as HTMLElement | null;
      return nested !== null && nested.style.color !== "blue";
    },
  },

  "dom-selectors-traversal-step-05": {
    "parent-bg": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const start = iframeWindow.document.getElementById("start");
      return start?.parentElement?.style.backgroundColor === "lightblue";
    },
    "closest-found": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const section = iframeWindow.document.getElementById("wrapper");
      return section?.classList.contains("found") === true;
    },
    "start-unchanged": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const start = iframeWindow.document.getElementById("start");
      return start !== null && start.style.backgroundColor !== "lightblue";
    },
  },

  "dom-selectors-traversal-step-06": {
    "next-updated": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const middle = iframeWindow.document.getElementById("middle");
      return middle?.nextElementSibling?.textContent === "Next Found";
    },
    "prev-updated": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const middle = iframeWindow.document.getElementById("middle");
      return middle?.previousElementSibling?.textContent === "Prev Found";
    },
    "middle-unchanged": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const middle = iframeWindow.document.getElementById("middle");
      return middle?.textContent === "Three";
    },
  },

  "dom-selectors-traversal-step-07": {
    "visible-shown": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const visible = iframeWindow.document.querySelectorAll(
        '[data-visible="true"]'
      );
      return (
        visible.length > 0 &&
        Array.from(visible).every((el) => el.classList.contains("shown"))
      );
    },
    "count-doubled": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const counter = iframeWindow.document.getElementById("counter");
      return (counter as HTMLElement)?.dataset?.count === "10";
    },
    "hidden-unchanged": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const hidden = iframeWindow.document.querySelector(
        '[data-visible="false"]'
      );
      return hidden !== null && !hidden.classList.contains("shown");
    },
  },

  "dom-selectors-traversal-step-08": {
    "sale-prices": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const available = iframeWindow.document.querySelectorAll(
        ".product:not(.sold-out) .price"
      );
      return (
        available.length > 0 &&
        Array.from(available).every((el) =>
          el.textContent?.startsWith("SALE: ")
        )
      );
    },
    "sold-out-unchanged": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const soldOut = iframeWindow.document.querySelector(".sold-out .price");
      return soldOut !== null && !soldOut.textContent?.startsWith("SALE: ");
    },
    "parent-promoted": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const featured = iframeWindow.document.getElementById("featured");
      return featured?.parentElement?.classList.contains("promoted") === true;
    },
    "correct-count": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const allPrices = iframeWindow.document.querySelectorAll(".price");
      const saleCount = Array.from(allPrices).filter((el) =>
        el.textContent?.startsWith("SALE: ")
      ).length;
      return saleCount === 2;
    },
  },

  "dom-events-deep-dive-step-01": {
    "message-changed": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const btn = iframeWindow.document.getElementById("toggle-btn");
      if (btn) btn.click();
      const msg = iframeWindow.document.getElementById("message");
      return msg?.textContent === "Toggled";
    },
    "button-active": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const btn = iframeWindow.document.getElementById("toggle-btn");
      if (btn) btn.click();
      return btn?.classList.contains("active") === true;
    },
    "uses-add-event": (html, css, js): boolean => {
      return js.includes("addEventListener");
    },
  },

  "dom-events-deep-dive-step-02": {
    "result-parent": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const child = iframeWindow.document.getElementById("child");
      if (child) child.click();
      const result = iframeWindow.document.getElementById("result");
      return result?.textContent === "parent";
    },
    "parent-listener": (html, css, js): boolean => {
      return js.includes("parent") && js.includes("addEventListener");
    },
    "child-listener": (html, css, js): boolean => {
      return js.includes("child") && js.includes("addEventListener");
    },
  },

  "dom-events-deep-dive-step-03": {
    "btn-stopped": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const btn = iframeWindow.document.getElementById("inner-btn");
      if (btn) btn.click();
      const output = iframeWindow.document.getElementById("output");
      return output?.textContent === "stopped";
    },
    "form-prevented": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const form = iframeWindow.document.getElementById("myform");
      if (form) form.dispatchEvent(new Event("submit", { cancelable: true }));
      const output = iframeWindow.document.getElementById("output");
      return output?.textContent === "prevented";
    },
    "uses-stop": (html, css, js): boolean => {
      return js.includes("stopPropagation");
    },
  },

  "dom-events-deep-dive-step-04": {
    "click-red": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const buttons = iframeWindow.document.querySelectorAll(
        "#button-group button"
      );
      const red = Array.from(buttons).find((b) => b.textContent === "Red") as
        | HTMLElement
        | undefined;
      if (red) red.click();
      const result = iframeWindow.document.getElementById("result");
      return result?.textContent === "Red";
    },
    "click-blue": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const buttons = iframeWindow.document.querySelectorAll(
        "#button-group button"
      );
      const blue = Array.from(buttons).find((b) => b.textContent === "Blue") as
        | HTMLElement
        | undefined;
      if (blue) blue.click();
      const result = iframeWindow.document.getElementById("result");
      return result?.textContent === "Blue";
    },
    "single-listener": (html, css, js): boolean => {
      return (
        js.includes("button-group") &&
        js.includes("addEventListener") &&
        js.includes("event.target")
      );
    },
  },

  "dom-events-deep-dive-step-05": {
    "display-updated": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const btn = iframeWindow.document.getElementById("notify-btn");
      if (btn) btn.click();
      const display = iframeWindow.document.getElementById("display");
      return display?.textContent !== "idle";
    },
    "shows-alert": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const btn = iframeWindow.document.getElementById("notify-btn");
      if (btn) btn.click();
      const display = iframeWindow.document.getElementById("display");
      return display?.textContent === "alert";
    },
    "uses-custom-event": (html, css, js): boolean => {
      return js.includes("CustomEvent");
    },
  },

  "dom-events-deep-dive-step-06": {
    "status-updates": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const search = iframeWindow.document.getElementById(
        "search"
      ) as HTMLInputElement | null;
      if (!search) return false;
      // Simulate typing by setting value and dispatching input
      search.value = "test";
      search.dispatchEvent(new Event("input"));
      // Fast-forward timers
      const status = iframeWindow.document.getElementById("status");
      // Can't truly wait for setTimeout in sync validator — check code instead
      return js.includes("setTimeout") && js.includes("status");
    },
    "includes-value": (html, css, js): boolean => {
      return (
        js.includes("searched:") ||
        js.includes("searched: ") ||
        (js.includes("search") && js.includes(".value"))
      );
    },
    "uses-timeout": (html, css, js): boolean => {
      return js.includes("setTimeout") && js.includes("clearTimeout");
    },
  },

  "dom-events-deep-dive-step-07": {
    "enter-submits": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "input-box"
      ) as HTMLInputElement | null;
      if (!input) return false;
      input.value = "hello";
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
      );
      const output = iframeWindow.document.getElementById("output");
      return output?.textContent === "hello";
    },
    "escape-clears": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "input-box"
      ) as HTMLInputElement | null;
      if (!input) return false;
      input.value = "something";
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
      );
      const output = iframeWindow.document.getElementById("output");
      return output?.textContent === "cleared";
    },
    "input-emptied": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "input-box"
      ) as HTMLInputElement | null;
      if (!input) return false;
      input.value = "test";
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
      );
      return input.value === "";
    },
  },

  "dom-events-deep-dive-step-08": {
    "task-added": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "task-input"
      ) as HTMLInputElement | null;
      if (!input) return false;
      input.value = "Test task";
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
      );
      const list = iframeWindow.document.getElementById("task-list");
      return (list?.children.length ?? 0) > 0;
    },
    "task-done": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "task-input"
      ) as HTMLInputElement | null;
      if (!input) return false;
      input.value = "Done task";
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
      );
      const task = iframeWindow.document.querySelector(
        "#task-list .task"
      ) as HTMLElement | null;
      if (task) task.click();
      return task?.classList.contains("done") === true;
    },
    "custom-dispatched": (html, css, js): boolean => {
      return (
        js.includes("CustomEvent") &&
        js.includes("tasksChanged") &&
        js.includes("dispatchEvent")
      );
    },
    "input-cleared": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "task-input"
      ) as HTMLInputElement | null;
      if (!input) return false;
      input.value = "Clear test";
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
      );
      return input.value === "";
    },
  },
  // ─── dom-manipulation steps ────────────────────────────────────

  "dom-manipulation-step-01": {
    "selects-by-id": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.getElementById("main-title");
      return el !== null;
    },
    "selects-by-class": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".subtitle");
      return el?.textContent === "Found it!";
    },
    "original-title-unchanged": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.getElementById("main-title");
      return el?.textContent === "Hello DOM";
    },
  },

  "dom-manipulation-step-02": {
    "selects-all-items": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const items = iframeWindow.document.querySelectorAll(".item");
      return items.length === 4;
    },
    "all-items-updated": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const items = iframeWindow.document.querySelectorAll(".item");
      return Array.from(items).every((el) =>
        el.textContent?.startsWith("Item: ")
      );
    },
    "uses-foreach": (html, css, js): boolean => {
      return js.includes("forEach");
    },
  },

  "dom-manipulation-step-03": {
    "heading-updated": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const h1 = iframeWindow.document.querySelector("h1");
      return h1?.textContent === "DOM Mastered";
    },
    "paragraph-updated": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const p = iframeWindow.document.querySelector("#info");
      return p?.textContent === "Text updated via JavaScript";
    },
    "span-unchanged": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const span = iframeWindow.document.querySelector(".badge");
      return span?.textContent === "v1";
    },
  },

  "dom-manipulation-step-04": {
    "container-has-html": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const box = iframeWindow.document.getElementById("output");
      return (box?.children.length ?? 0) >= 1;
    },
    "has-strong-or-em": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const box = iframeWindow.document.getElementById("output");
      if (!box) return false;
      return (
        box.querySelector("strong") !== null || box.querySelector("em") !== null
      );
    },
    "has-list": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const box = iframeWindow.document.getElementById("output");
      if (!box) return false;
      return (
        box.querySelector("ul") !== null || box.querySelector("ol") !== null
      );
    },
  },

  "dom-manipulation-step-05": {
    "box-color-changed": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const box = iframeWindow.document.querySelector(".box");
      if (!box) return false;
      const color = (box as HTMLElement).style.backgroundColor;
      return color !== "" && color !== undefined;
    },
    "box-padding-set": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const box = iframeWindow.document.querySelector(".box");
      if (!box) return false;
      return (box as HTMLElement).style.padding !== "";
    },
    "box-border-set": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const box = iframeWindow.document.querySelector(".box");
      if (!box) return false;
      return (box as HTMLElement).style.border !== "";
    },
  },

  "dom-manipulation-step-06": {
    "highlight-added": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const card = iframeWindow.document.querySelector("#feature-card");
      return card?.classList.contains("highlight") === true;
    },
    "dim-removed": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const card = iframeWindow.document.querySelector("#feature-card");
      return card?.classList.contains("dim") === false;
    },
    "active-toggled": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const card = iframeWindow.document.querySelector("#feature-card");
      return card?.classList.contains("active") === true;
    },
  },

  "dom-manipulation-step-07": {
    "new-element-exists": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const list = iframeWindow.document.getElementById("task-list");
      if (!list) return false;
      return list.children.length === 4;
    },
    "new-element-has-text": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const list = iframeWindow.document.getElementById("task-list");
      if (!list) return false;
      const last = list.lastElementChild;
      return last?.textContent === "Learn the DOM";
    },
    "uses-create-element": (html, css, js): boolean => {
      return js.includes("createElement");
    },
  },

  "dom-manipulation-step-08": {
    "banner-removed": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return iframeWindow.document.getElementById("old-banner") === null;
    },
    "other-elements-intact": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return (
        iframeWindow.document.getElementById("main") !== null &&
        iframeWindow.document.getElementById("footer") !== null
      );
    },
    "uses-remove": (html, css, js): boolean => {
      return js.includes(".remove()");
    },
  },

  "dom-manipulation-step-09": {
    "message-changed": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const btn = iframeWindow.document.getElementById("action-btn");
      const msg = iframeWindow.document.getElementById("message");
      if (!btn || !msg) return false;
      btn.click();
      return msg.textContent !== "Waiting...";
    },
    "button-disabled": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const btn = iframeWindow.document.getElementById(
        "action-btn"
      ) as HTMLButtonElement | null;
      if (!btn) return false;
      btn.click();
      return btn.disabled === true;
    },
    "uses-add-event-listener": (html, css, js): boolean => {
      return js.includes("addEventListener");
    },
  },

  "dom-manipulation-step-10": {
    "item-added": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "item-input"
      ) as HTMLInputElement | null;
      const addBtn = iframeWindow.document.getElementById("add-btn");
      if (!input || !addBtn) return false;
      input.value = "Test item";
      addBtn.click();
      const list = iframeWindow.document.getElementById("item-list");
      return (list?.children.length ?? 0) > 0;
    },
    "item-removed": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "item-input"
      ) as HTMLInputElement | null;
      const addBtn = iframeWindow.document.getElementById("add-btn");
      if (!input || !addBtn) return false;
      input.value = "Remove me";
      addBtn.click();
      const list = iframeWindow.document.getElementById("item-list");
      const count = list?.children.length ?? 0;
      const removeBtn = list?.querySelector("button");
      if (removeBtn) removeBtn.click();
      return (list?.children.length ?? 0) < count;
    },
    "input-cleared": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "item-input"
      ) as HTMLInputElement | null;
      const addBtn = iframeWindow.document.getElementById("add-btn");
      if (!input || !addBtn) return false;
      input.value = "Clear test";
      addBtn.click();
      return input.value === "";
    },
    "empty-rejected": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "item-input"
      ) as HTMLInputElement | null;
      const addBtn = iframeWindow.document.getElementById("add-btn");
      const list = iframeWindow.document.getElementById("item-list");
      if (!input || !addBtn || !list) return false;
      const before = list.children.length;
      input.value = "   ";
      addBtn.click();
      return list.children.length === before;
    },
  },
  // ── form-handling-validation ──────────────────────────────────
  "form-handling-step-01": {
    "reads-name": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "name-input"
      ) as HTMLInputElement | null;
      const output = iframeWindow.document.getElementById("output");
      if (!input || !output) return false;
      input.value = "Alice";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return output.textContent?.includes("Alice") ?? false;
    },
    "reads-email": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "email-input"
      ) as HTMLInputElement | null;
      const output = iframeWindow.document.getElementById("output");
      if (!input || !output) return false;
      input.value = "a@b.com";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return output.textContent?.includes("a@b.com") ?? false;
    },
    "output-updates-live": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const nameIn = iframeWindow.document.getElementById(
        "name-input"
      ) as HTMLInputElement | null;
      const emailIn = iframeWindow.document.getElementById(
        "email-input"
      ) as HTMLInputElement | null;
      const output = iframeWindow.document.getElementById("output");
      if (!nameIn || !emailIn || !output) return false;
      nameIn.value = "Bob";
      nameIn.dispatchEvent(new Event("input", { bubbles: true }));
      emailIn.value = "bob@test.io";
      emailIn.dispatchEvent(new Event("input", { bubbles: true }));
      const text = output.textContent ?? "";
      return text.includes("Bob") && text.includes("bob@test.io");
    },
  },
  "form-handling-step-02": {
    "prevents-reload": (html, css, js): boolean => {
      return js.includes("preventDefault") && js.includes("addEventListener");
    },
    "shows-data": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const nameIn = iframeWindow.document.getElementById(
        "name"
      ) as HTMLInputElement | null;
      const emailIn = iframeWindow.document.getElementById(
        "email"
      ) as HTMLInputElement | null;
      const result = iframeWindow.document.getElementById("result");
      const form = iframeWindow.document.getElementById(
        "signup-form"
      ) as HTMLFormElement | null;
      if (!nameIn || !emailIn || !result || !form) return false;
      nameIn.value = "Test";
      emailIn.value = "test@test.com";
      form.dispatchEvent(
        new Event("submit", {
          bubbles: true,
          cancelable: true,
        })
      );
      const text = result.textContent ?? "";
      return text.includes("Test") && text.includes("test@test.com");
    },
    "result-not-empty": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const nameIn = iframeWindow.document.getElementById(
        "name"
      ) as HTMLInputElement | null;
      const emailIn = iframeWindow.document.getElementById(
        "email"
      ) as HTMLInputElement | null;
      const form = iframeWindow.document.getElementById(
        "signup-form"
      ) as HTMLFormElement | null;
      const result = iframeWindow.document.getElementById("result");
      if (!nameIn || !emailIn || !form || !result) return false;
      nameIn.value = "Ada";
      emailIn.value = "ada@dev.io";
      form.dispatchEvent(
        new Event("submit", {
          bubbles: true,
          cancelable: true,
        })
      );
      return (result.innerHTML?.trim().length ?? 0) > 0;
    },
  },
  "form-handling-step-03": {
    "tracks-input": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "username"
      ) as HTMLInputElement | null;
      const log = iframeWindow.document.getElementById("event-log");
      if (!input || !log) return false;
      input.value = "hi";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return (log.textContent ?? "").length > 0;
    },
    "tracks-focus": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "username"
      ) as HTMLInputElement | null;
      const log = iframeWindow.document.getElementById("event-log");
      if (!input || !log) return false;
      input.dispatchEvent(new Event("focus", { bubbles: true }));
      return (log.textContent ?? "").toLowerCase().includes("focus");
    },
    "tracks-blur": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "username"
      ) as HTMLInputElement | null;
      const log = iframeWindow.document.getElementById("event-log");
      if (!input || !log) return false;
      input.dispatchEvent(new Event("blur", { bubbles: true }));
      return (log.textContent ?? "").toLowerCase().includes("blur");
    },
  },
  "form-handling-step-04": {
    "empty-rejected": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "req-name"
      ) as HTMLInputElement | null;
      const btn = iframeWindow.document.getElementById("validate-btn");
      const msg = iframeWindow.document.getElementById("error-msg");
      if (!input || !btn || !msg) return false;
      input.value = "";
      btn.click();
      return (msg.textContent ?? "").length > 0;
    },
    "short-rejected": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "req-name"
      ) as HTMLInputElement | null;
      const btn = iframeWindow.document.getElementById("validate-btn");
      const msg = iframeWindow.document.getElementById("error-msg");
      if (!input || !btn || !msg) return false;
      input.value = "ab";
      btn.click();
      return (msg.textContent ?? "").length > 0;
    },
    "valid-accepted": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "req-name"
      ) as HTMLInputElement | null;
      const btn = iframeWindow.document.getElementById("validate-btn");
      const msg = iframeWindow.document.getElementById("error-msg");
      if (!input || !btn || !msg) return false;
      input.value = "Alice";
      btn.click();
      const text = (msg.textContent ?? "").toLowerCase();
      return text.includes("valid") || text.includes("pass") || text === "";
    },
  },
  "form-handling-step-05": {
    "age-below-rejected": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "age-input"
      ) as HTMLInputElement | null;
      const btn = iframeWindow.document.getElementById("check-age-btn");
      const msg = iframeWindow.document.getElementById("age-msg");
      if (!input || !btn || !msg) return false;
      input.value = "10";
      btn.click();
      const text = (msg.textContent ?? "").toLowerCase();
      return text.length > 0 && !text.includes("welcome");
    },
    "age-valid-accepted": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "age-input"
      ) as HTMLInputElement | null;
      const btn = iframeWindow.document.getElementById("check-age-btn");
      const msg = iframeWindow.document.getElementById("age-msg");
      if (!input || !btn || !msg) return false;
      input.value = "25";
      btn.click();
      const text = (msg.textContent ?? "").toLowerCase();
      return (
        text.includes("welcome") ||
        text.includes("valid") ||
        text.includes("pass")
      );
    },
    "non-numeric-rejected": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "age-input"
      ) as HTMLInputElement | null;
      const btn = iframeWindow.document.getElementById("check-age-btn");
      const msg = iframeWindow.document.getElementById("age-msg");
      if (!input || !btn || !msg) return false;
      input.value = "abc";
      btn.click();
      const text = (msg.textContent ?? "").toLowerCase();
      return text.length > 0 && !text.includes("welcome");
    },
  },
  "form-handling-step-06": {
    "error-on-empty": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "live-email"
      ) as HTMLInputElement | null;
      const feedback = iframeWindow.document.getElementById("email-feedback");
      if (!input || !feedback) return false;
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      const text = (feedback.textContent ?? "").toLowerCase();
      return text.length > 0;
    },
    "error-on-invalid": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "live-email"
      ) as HTMLInputElement | null;
      const feedback = iframeWindow.document.getElementById("email-feedback");
      if (!input || !feedback) return false;
      input.value = "notanemail";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      const text = (feedback.textContent ?? "").toLowerCase();
      return (
        text.includes("invalid") || text.includes("@") || text.includes("error")
      );
    },
    "success-on-valid": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "live-email"
      ) as HTMLInputElement | null;
      const feedback = iframeWindow.document.getElementById("email-feedback");
      if (!input || !feedback) return false;
      input.value = "user@example.com";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      const text = (feedback.textContent ?? "").toLowerCase();
      return (
        text.includes("valid") ||
        text.includes("good") ||
        text.includes("ok") ||
        text === ""
      );
    },
  },
  "form-handling-step-07": {
    "uses-formdata": (html, css, js): boolean => {
      return js.includes("FormData") && js.includes("new FormData");
    },
    "displays-entries": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const form = iframeWindow.document.getElementById(
        "data-form"
      ) as HTMLFormElement | null;
      const nameIn = iframeWindow.document.getElementById(
        "fd-name"
      ) as HTMLInputElement | null;
      const colorIn = iframeWindow.document.getElementById(
        "fd-color"
      ) as HTMLInputElement | null;
      const output = iframeWindow.document.getElementById("fd-output");
      if (!form || !nameIn || !colorIn || !output) return false;
      nameIn.value = "Sam";
      colorIn.value = "blue";
      form.dispatchEvent(
        new Event("submit", {
          bubbles: true,
          cancelable: true,
        })
      );
      const text = output.textContent ?? "";
      return text.includes("Sam") && text.includes("blue");
    },
    "prevents-default": (html, css, js): boolean => {
      return js.includes("preventDefault");
    },
  },
  "form-handling-step-08": {
    "name-validated": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const nameIn = iframeWindow.document.getElementById(
        "reg-name"
      ) as HTMLInputElement | null;
      const btn = iframeWindow.document.getElementById("reg-submit");
      const errors = iframeWindow.document.getElementById("reg-errors");
      if (!nameIn || !btn || !errors) return false;
      nameIn.value = "";
      btn.click();
      return (errors.textContent ?? "").length > 0;
    },
    "email-validated": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const emailIn = iframeWindow.document.getElementById(
        "reg-email"
      ) as HTMLInputElement | null;
      const btn = iframeWindow.document.getElementById("reg-submit");
      const errors = iframeWindow.document.getElementById("reg-errors");
      if (!emailIn || !btn || !errors) return false;
      const nameIn = iframeWindow.document.getElementById(
        "reg-name"
      ) as HTMLInputElement | null;
      if (nameIn) nameIn.value = "Valid Name";
      emailIn.value = "bad";
      btn.click();
      return (errors.textContent ?? "").toLowerCase().includes("email");
    },
    "success-on-valid": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const nameIn = iframeWindow.document.getElementById(
        "reg-name"
      ) as HTMLInputElement | null;
      const emailIn = iframeWindow.document.getElementById(
        "reg-email"
      ) as HTMLInputElement | null;
      const passIn = iframeWindow.document.getElementById(
        "reg-password"
      ) as HTMLInputElement | null;
      const btn = iframeWindow.document.getElementById("reg-submit");
      const result = iframeWindow.document.getElementById("reg-result");
      if (!nameIn || !emailIn || !passIn || !btn || !result) return false;
      nameIn.value = "Jane Doe";
      emailIn.value = "jane@example.com";
      passIn.value = "securePass1";
      btn.click();
      const text = (result.textContent ?? "").toLowerCase();
      return (
        text.includes("success") ||
        text.includes("welcome") ||
        text.includes("jane")
      );
    },
  },
  // ── browser-object-model ──────────────────────────────────────
  "bom-step-01": {
    "shows-width": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const output = iframeWindow.document.getElementById("output");
      if (!output) return false;
      const text = output.textContent ?? "";
      return /\d{2,}/.test(text);
    },
    "shows-height": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const output = iframeWindow.document.getElementById("output");
      if (!output) return false;
      const text = output.textContent ?? "";
      const numbers = text.match(/\d+/g);
      return (numbers?.length ?? 0) >= 2;
    },
    "uses-window": (html, css, js): boolean => {
      return js.includes("innerWidth") && js.includes("innerHeight");
    },
  },
  "bom-step-02": {
    "text-changes": (
      html,
      css,
      js,
      iframeWindow
    ): boolean | Promise<boolean> => {
      if (!iframeWindow) return false;
      const msg = iframeWindow.document.getElementById("message");
      if (!msg) return false;
      const before = msg.textContent;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(msg.textContent !== before);
        }, 2200);
      });
    },
    "uses-settimeout": (html, css, js): boolean => {
      return js.includes("setTimeout");
    },
    "delay-is-reasonable": (html, css, js): boolean => {
      const match = js.match(/setTimeout\s*\([^,]+,\s*(\d+)/);
      if (!match) return false;
      const delay = Number(match[1]);
      return delay >= 500 && delay <= 5000;
    },
  },
  "bom-step-03": {
    "counter-starts": (
      html,
      css,
      js,
      iframeWindow
    ): boolean | Promise<boolean> => {
      if (!iframeWindow) return false;
      const display = iframeWindow.document.getElementById("timer-display");
      if (!display) return false;
      return new Promise((resolve) => {
        setTimeout(() => {
          const val = Number(display.textContent);
          resolve(!isNaN(val));
        }, 1500);
      });
    },
    "uses-setinterval": (html, css, js): boolean => {
      return js.includes("setInterval");
    },
    "stop-works": (html, css, js, iframeWindow): boolean | Promise<boolean> => {
      if (!iframeWindow) return false;
      const stopBtn = iframeWindow.document.getElementById("stop-btn");
      const display = iframeWindow.document.getElementById("timer-display");
      if (!stopBtn || !display) return false;
      return new Promise((resolve) => {
        setTimeout(() => {
          stopBtn.click();
          const frozenVal = display.textContent;
          setTimeout(() => {
            resolve(display.textContent === frozenVal);
          }, 1200);
        }, 1500);
      });
    },
  },
  "bom-step-04": {
    "shows-user-agent": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const output = iframeWindow.document.getElementById("nav-output");
      if (!output) return false;
      const text = output.textContent ?? "";
      return (
        text.toLowerCase().includes("mozilla") ||
        text.toLowerCase().includes("chrome")
      );
    },
    "shows-language": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const output = iframeWindow.document.getElementById("nav-output");
      if (!output) return false;
      const text = output.textContent ?? "";
      return /[a-z]{2}(-[A-Z]{2})?/.test(text);
    },
    "uses-navigator": (html, css, js): boolean => {
      return js.includes("navigator.");
    },
  },
  "bom-step-05": {
    "parses-hostname": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const output = iframeWindow.document.getElementById("url-output");
      if (!output) return false;
      return (output.textContent ?? "").includes("example.com");
    },
    "parses-pathname": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const output = iframeWindow.document.getElementById("url-output");
      if (!output) return false;
      return (output.textContent ?? "").includes("/products");
    },
    "uses-url-constructor": (html, css, js): boolean => {
      return js.includes("new URL");
    },
  },
  "bom-step-06": {
    "shows-time": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const output = iframeWindow.document.getElementById("clock");
      if (!output) return false;
      const text = output.textContent ?? "";
      return /\d{1,2}:\d{2}/.test(text);
    },
    "uses-date": (html, css, js): boolean => {
      return js.includes("new Date") || js.includes("Date()");
    },
    "updates-live": (
      html,
      css,
      js,
      iframeWindow
    ): boolean | Promise<boolean> => {
      if (!iframeWindow) return false;
      const output = iframeWindow.document.getElementById("clock");
      if (!output) return false;
      const first = output.textContent;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(output.textContent !== first);
        }, 1500);
      });
    },
  },
  "bom-step-07": {
    "checks-query": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const output = iframeWindow.document.getElementById("mq-output");
      if (!output) return false;
      return (output.textContent ?? "").length > 0;
    },
    "uses-matchmedia": (html, css, js): boolean => {
      return js.includes("matchMedia");
    },
    "shows-result": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const output = iframeWindow.document.getElementById("mq-output");
      if (!output) return false;
      const text = (output.textContent ?? "").toLowerCase();
      return (
        text.includes("true") ||
        text.includes("false") ||
        text.includes("matches") ||
        text.includes("narrow") ||
        text.includes("wide")
      );
    },
  },
  "bom-step-08": {
    "has-clock": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const clock = iframeWindow.document.getElementById("dash-clock");
      if (!clock) return false;
      return /\d{1,2}:\d{2}/.test(clock.textContent ?? "");
    },
    "has-dimensions": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const dims = iframeWindow.document.getElementById("dash-dims");
      if (!dims) return false;
      return /\d+/.test(dims.textContent ?? "");
    },
    "has-browser-info": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const info = iframeWindow.document.getElementById("dash-browser");
      if (!info) return false;
      const text = (info.textContent ?? "").toLowerCase();
      return (
        text.includes("mozilla") || text.includes("chrome") || text.length > 5
      );
    },
    "auto-updates": (
      html,
      css,
      js,
      iframeWindow
    ): boolean | Promise<boolean> => {
      if (!iframeWindow) return false;
      const clock = iframeWindow.document.getElementById("dash-clock");
      if (!clock) return false;
      const first = clock.textContent;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(clock.textContent !== first);
        }, 1500);
      });
    },
  },

  // ── CSS Fundamentals Steps ──────────────────────────────────────────

  "css-fundamentals-step-01": {
    "color-crimson": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector("h2");
      if (!el) return false;
      const c = iframeWindow.getComputedStyle(el).color;
      return c === "rgb(220, 20, 60)";
    },
    "font-size-24": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector("h2");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).fontSize === "24px";
    },
    "p-not-crimson": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector("p");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).color !== "rgb(220, 20, 60)";
    },
  },

  "css-fundamentals-step-02": {
    "h1-color": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector("h1");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).color === "rgb(44, 62, 80)";
    },
    "h1-font-size": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector("h1");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).fontSize === "28px";
    },
    "p-line-height": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("1.8")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector("p");
      if (!el) return false;
      const lh = iframeWindow.getComputedStyle(el).lineHeight;
      return lh === "28.8px" || lh === "1.8";
    },
  },

  "css-fundamentals-step-03": {
    "uses-class-selector": (html, css): boolean => {
      return /\.warning\s*\{/.test(css);
    },
    "bg-color": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".warning");
      if (!el) return false;
      return (
        iframeWindow.getComputedStyle(el).backgroundColor ===
        "rgb(248, 215, 218)"
      );
    },
    "text-color": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".warning");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).color === "rgb(114, 28, 36)";
    },
  },

  "css-fundamentals-step-04": {
    "uses-id-selector": (html, css): boolean => {
      return /#banner\s*\{/.test(css);
    },
    "bg-applied": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.getElementById("banner");
      if (!el) return false;
      return (
        iframeWindow.getComputedStyle(el).backgroundColor === "rgb(26, 26, 46)"
      );
    },
    "text-centered": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.getElementById("banner");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).textAlign === "center";
    },
  },

  "css-fundamentals-step-05": {
    "heading-font-size": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".heading");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).fontSize === "26px";
    },
    "heading-bold": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("bold")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".heading");
      if (!el) return false;
      const fw = iframeWindow.getComputedStyle(el).fontWeight;
      return fw === "700" || fw === "bold";
    },
    "subtitle-centered": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".subtitle");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).textAlign === "center";
    },
  },

  "css-fundamentals-step-06": {
    "has-padding": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("padding")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".card");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).paddingTop === "20px";
    },
    "has-border": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("border")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".card");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).borderStyle !== "none";
    },
    "has-margin": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("margin")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".card");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).marginTop === "16px";
    },
    "has-box-sizing": (html, css): boolean => {
      return css.includes("border-box");
    },
  },

  "css-fundamentals-step-07": {
    "container-pct": (html, css): boolean => {
      return /\.container\s*\{[^}]*width\s*:\s*80%/s.test(css);
    },
    "container-rem": (html, css): boolean => {
      return /\.container\s*\{[^}]*padding\s*:\s*1\.5rem/s.test(css);
    },
    "heading-rem": (html, css): boolean => {
      return /\.heading\s*\{[^}]*font-size\s*:\s*2rem/s.test(css);
    },
  },

  "css-fundamentals-step-08": {
    "badge-inline-block": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("inline-block")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".badge");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).display === "inline-block";
    },
    "badge-bg": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".badge");
      if (!el) return false;
      return (
        iframeWindow.getComputedStyle(el).backgroundColor !== "rgba(0, 0, 0, 0)"
      );
    },
    "secret-hidden": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("none")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".secret");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).display === "none";
    },
  },

  "css-fundamentals-step-09": {
    "uses-id": (html, css): boolean => {
      return /#important\s*\{/.test(css);
    },
    "color-teal": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.getElementById("important");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).color === "rgb(0, 128, 128)";
    },
    "keeps-existing": (html, css): boolean => {
      return css.includes("color: red") && css.includes("color: blue");
    },
  },

  "css-fundamentals-step-10": {
    "card-border-radius": (html, css, js, iframeWindow): boolean => {
      if (!css.includes("border-radius")) return false;
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".card");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).borderRadius === "8px";
    },
    "header-bg": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".card-header");
      if (!el) return false;
      return (
        iframeWindow.getComputedStyle(el).backgroundColor === "rgb(9, 132, 227)"
      );
    },
    "header-centered": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".card-header");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).textAlign === "center";
    },
    "title-font-size": (html, css, js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const el = iframeWindow.document.querySelector(".card-title");
      if (!el) return false;
      return iframeWindow.getComputedStyle(el).fontSize === "20px";
    },
  },

  // ── CSS Layout Flexbox (separate file) ─────────────────────────────
  ...cssLayoutFlexboxValidators,

  // ── CSS Grid Layout (separate file) ────────────────────────────────
  ...cssGridLayoutValidators,

  // ── CSS Positioning & Z-Index (separate file) ─────────────────────
  ...cssPositioningZIndexValidators,

  // ── CSS Transforms & Transitions (separate file) ──────────────────
  ...cssTransformsTransitionsValidators,

  // ── CSS Animations (separate file) ────────────────────────────────
  ...cssAnimationsValidators,

  // ── CSS Responsive Design (separate file) ─────────────────────────
  ...cssResponsiveDesignValidators,

  // ── CSS Advanced Selectors (separate file) ────────────────────────
  ...cssAdvancedSelectorsValidators,

  // ── CSS Variables (separate file) ─────────────────────────────────
  ...cssVariablesValidators,

  // ── CSS Typography & Fonts (separate file) ────────────────────────
  ...cssTypographyFontsValidators,

  // ── CSS Architecture (separate file) ─────────────────────────────
  ...cssArchitectureValidators,

  // ── CSS Modern Features (separate file) ──────────────────────────
  ...cssModernFeaturesValidators,

  // ── HTML Basics (separate file) ─────────────────────────────────
  ...htmlBasicsValidators,

  // ── HTML Forms & Inputs (separate file) ─────────────────────────
  ...htmlFormsInputsValidators,

  // ── HTML Multimedia (separate file) ───────────────────────────
  ...htmlMultimediaValidators,

  // ── HTML Semantic Elements (separate file) ────────────────────
  ...htmlSemanticElementsValidators,

  // ── HTML Accessibility (separate file) ────────────────────────
  ...htmlAccessibilityValidators,

  // ── HTML Tables & Data (separate file) ────────────────────────
  ...htmlTablesDataValidators,

  // ── HTML Links & Navigation (separate file) ───────────────────
  ...htmlLinksNavigationValidators,

  // ── HTML Lists & Organization (separate file) ─────────────────
  ...htmlListsOrganizationValidators,

  // ── HTML Document Head (separate file) ─────────────────────────
  ...htmlDocumentHeadValidators,

  // ── HTML Responsive Basics (separate file) ─────────────────────
  ...htmlResponsiveBasicsValidators,
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
