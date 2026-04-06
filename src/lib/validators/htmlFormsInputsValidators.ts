/**
 * HTML Forms & Inputs — Exercise Validators
 * Steps for the html-forms-inputs tutorial.
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const htmlFormsInputsValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 1: Form Structure ────────────────────────────────────────

  "html-forms-step-01": {
    "has-form-attrs": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const form = iframeWindow.document.querySelector("form");
      if (!form) return false;
      return (
        form.getAttribute("action") === "/login" &&
        form.getAttribute("method")?.toLowerCase() === "post"
      );
    },
    "has-username-input": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.querySelector(
        'input[name="username"]'
      );
      if (!input) return false;
      return input.getAttribute("type") === "text";
    },
    "has-submit-btn": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const btn = iframeWindow.document.querySelector('button[type="submit"]');
      return btn !== null && btn.textContent?.trim() === "Log In";
    },
  },

  // ── Step 2: Text Inputs ───────────────────────────────────────────

  "html-forms-step-02": {
    "has-email-input": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.querySelector(
        'input[type="email"][name="email"]'
      );
      return input !== null;
    },
    "has-password-input": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.querySelector(
        'input[type="password"][name="pass"]'
      );
      return input !== null;
    },
    "has-tel-input": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.querySelector(
        'input[type="tel"][name="phone"]'
      );
      return input !== null;
    },
  },

  // ── Step 3: Labels and IDs ────────────────────────────────────────

  "html-forms-step-03": {
    "label-fullname": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const label = iframeWindow.document.querySelector(
        'label[for="fullname"]'
      );
      if (!label) return false;
      const input = iframeWindow.document.getElementById("fullname");
      return (
        input !== null &&
        label.textContent?.trim().includes("Full Name") === true
      );
    },
    "input-fullname-type": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "fullname"
      ) as HTMLInputElement | null;
      return input !== null && input.getAttribute("type") === "text";
    },
    "label-age": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const label = iframeWindow.document.querySelector('label[for="age"]');
      if (!label) return false;
      const input = iframeWindow.document.getElementById(
        "age"
      ) as HTMLInputElement | null;
      return (
        input !== null &&
        input.getAttribute("type") === "number" &&
        label.textContent?.trim().includes("Age") === true
      );
    },
  },

  // ── Step 4: Numbers and Dates ─────────────────────────────────────

  "html-forms-step-04": {
    "has-number-input": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.querySelector(
        'input[type="number"]'
      ) as HTMLInputElement | null;
      if (!input) return false;
      return (
        input.getAttribute("min") === "1" && input.getAttribute("max") === "99"
      );
    },
    "number-has-name": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.querySelector(
        'input[type="number"][name="qty"]'
      );
      return input !== null;
    },
    "has-date-input": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.querySelector(
        'input[type="date"][name="delivery"]'
      );
      return input !== null;
    },
  },

  // ── Step 5: Radios and Checkboxes ─────────────────────────────────

  "html-forms-step-05": {
    "has-fieldset-legend": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const legend = iframeWindow.document.querySelector("fieldset legend");
      return (
        legend !== null && legend.textContent?.trim().includes("Size") === true
      );
    },
    "three-radios": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const radios = iframeWindow.document.querySelectorAll(
        'input[type="radio"][name="size"]'
      );
      return radios.length === 3;
    },
    "radio-values": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const radios = iframeWindow.document.querySelectorAll(
        'input[type="radio"][name="size"]'
      );
      const values = Array.from(radios).map((r) => r.getAttribute("value"));
      return (
        values.includes("s") && values.includes("m") && values.includes("l")
      );
    },
  },

  // ── Step 6: Select Dropdowns ──────────────────────────────────────

  "html-forms-step-06": {
    "has-select": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return (
        iframeWindow.document.querySelector('select[name="role"]') !== null
      );
    },
    "placeholder-option": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const select = iframeWindow.document.querySelector('select[name="role"]');
      if (!select) return false;
      const firstOption = select.querySelector("option");
      return firstOption !== null && firstOption.getAttribute("value") === "";
    },
    "three-role-options": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const options = iframeWindow.document.querySelectorAll(
        'select[name="role"] option'
      );
      // At least 4 total: 1 placeholder + 3 real options
      if (options.length < 4) return false;
      const values = Array.from(options).map((o) => o.getAttribute("value"));
      return (
        values.includes("admin") &&
        values.includes("editor") &&
        values.includes("viewer")
      );
    },
  },

  // ── Step 7: Textarea and File Uploads ─────────────────────────────

  "html-forms-step-07": {
    "has-textarea": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const ta = iframeWindow.document.querySelector(
        'textarea[name="comments"]'
      );
      return ta !== null && ta.getAttribute("rows") === "5";
    },
    "textarea-label": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const label = iframeWindow.document.querySelector(
        'label[for="comments"]'
      );
      const ta = iframeWindow.document.getElementById("comments");
      return label !== null && ta !== null && ta.tagName === "TEXTAREA";
    },
    "has-file-input": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return (
        iframeWindow.document.querySelector(
          'input[type="file"][name="attachment"]'
        ) !== null
      );
    },
  },

  // ── Step 8: Built-in Validation ───────────────────────────────────

  "html-forms-step-08": {
    "username-validation": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.querySelector(
        'input[name="username"]'
      ) as HTMLInputElement | null;
      if (!input) return false;
      return (
        input.hasAttribute("required") &&
        input.getAttribute("minlength") === "3" &&
        input.getAttribute("maxlength") === "20"
      );
    },
    "email-validation": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.querySelector(
        'input[type="email"][name="email"]'
      ) as HTMLInputElement | null;
      return input !== null && input.hasAttribute("required");
    },
    "has-submit": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return (
        iframeWindow.document.querySelector('button[type="submit"]') !== null
      );
    },
  },

  // ── Step 9: Accessible Forms ──────────────────────────────────────

  "html-forms-step-09": {
    "has-aria-describedby": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const input = iframeWindow.document.getElementById(
        "email"
      ) as HTMLInputElement | null;
      return (
        input !== null &&
        input.getAttribute("aria-describedby") === "email-help"
      );
    },
    "has-help-div": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const div = iframeWindow.document.getElementById("email-help");
      return (
        div !== null &&
        div.textContent?.trim().toLowerCase().includes("never share") === true
      );
    },
    "label-connected-email": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const label = iframeWindow.document.querySelector('label[for="email"]');
      const input = iframeWindow.document.getElementById("email");
      return (
        label !== null &&
        input !== null &&
        label.textContent?.trim().includes("Email") === true
      );
    },
  },

  // ── Step 10: Contact Form Challenge ───────────────────────────────

  "html-forms-step-10": {
    "form-attrs": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const form = iframeWindow.document.querySelector("form");
      if (!form) return false;
      return (
        form.getAttribute("action") === "/contact" &&
        form.getAttribute("method")?.toLowerCase() === "post"
      );
    },
    "identity-fields": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const nameInput = iframeWindow.document.querySelector(
        'input[type="text"][id="name"]'
      ) as HTMLInputElement | null;
      const emailInput = iframeWindow.document.querySelector(
        'input[type="email"][id="email"]'
      ) as HTMLInputElement | null;
      const nameLabel =
        iframeWindow.document.querySelector('label[for="name"]');
      const emailLabel =
        iframeWindow.document.querySelector('label[for="email"]');
      return (
        nameInput !== null &&
        nameInput.hasAttribute("required") &&
        nameLabel !== null &&
        emailInput !== null &&
        emailInput.hasAttribute("required") &&
        emailLabel !== null
      );
    },
    "topic-select": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const select = iframeWindow.document.querySelector('select[id="topic"]');
      if (!select) return false;
      const options = select.querySelectorAll("option");
      return options.length >= 3;
    },
    "message-textarea": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const ta = iframeWindow.document.querySelector(
        'textarea[id="message"]'
      ) as HTMLTextAreaElement | null;
      const label = iframeWindow.document.querySelector('label[for="message"]');
      return (
        ta !== null &&
        ta.getAttribute("rows") === "4" &&
        ta.hasAttribute("required") &&
        label !== null
      );
    },
  },
};
