// ============================================================
// Campus Feedback Portal – script.js
// Security focus: input validation + safe output (textContent)
// ============================================================
"use strict";

// ---- 1. Validation rules (defined limits) ----
const NAME_MIN = 2;
const NAME_MAX = 50;
const FEEDBACK_MIN = 10;
const FEEDBACK_MAX = 500;
const EMAIL_MAX = 100;

// Name: letters, spaces, dot, apostrophe, hyphen only
const NAME_PATTERN = /^[A-Za-z\s.'-]+$/;

// Email: something@something.domain (no spaces, one @, a dot + 2+ letters)
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

// ---- 2. Get references to page elements ----
const form          = document.getElementById("feedbackForm");
const nameInput     = document.getElementById("name");
const emailInput    = document.getElementById("email");
const feedbackInput = document.getElementById("feedback");

const nameError     = document.getElementById("nameError");
const emailError    = document.getElementById("emailError");
const feedbackError = document.getElementById("feedbackError");

const charCounter   = document.getElementById("charCounter");
const formMessage   = document.getElementById("formMessage");
const feedbackList  = document.getElementById("feedbackList");
const emptyState    = document.getElementById("emptyState");

// ---- 3. Helper functions to show / clear errors ----
// SAFE: messages are written with textContent, never innerHTML
function showFieldError(input, errorElement, message) {
  input.classList.add("invalid");
  errorElement.textContent = message;
}

function clearFieldError(input, errorElement) {
  input.classList.remove("invalid");
  errorElement.textContent = "";
}

function showFormMessage(message, type) {
  formMessage.textContent = message;                 // SAFE
  formMessage.className = "form-message " + type;    // "success" or "error-msg"
}

// ---- 4. Individual validation functions ----
// Each returns true (valid) or false (invalid)

function validateName() {
  const value = nameInput.value.trim();   // trim() removes extra spaces

  if (value === "") {
    showFieldError(nameInput, nameError, "Name is required.");
    return false;
  }
  if (value.length < NAME_MIN || value.length > NAME_MAX) {
    showFieldError(nameInput, nameError,
      `Name must be between ${NAME_MIN} and ${NAME_MAX} characters.`);
    return false;
  }
  if (!NAME_PATTERN.test(value)) {
    showFieldError(nameInput, nameError,
      "Name can contain only letters, spaces, dots, apostrophes and hyphens.");
    return false;
  }
  clearFieldError(nameInput, nameError);
  return true;
}

function validateEmail() {
  const value = emailInput.value.trim();

  if (value === "") {
    showFieldError(emailInput, emailError, "Email is required.");
    return false;
  }
  if (value.length > EMAIL_MAX || !EMAIL_PATTERN.test(value)) {
    showFieldError(emailInput, emailError,
      "Please enter a valid email address (e.g. student@college.edu).");
    return false;
  }
  clearFieldError(emailInput, emailError);
  return true;
}

function validateFeedback() {
  const value = feedbackInput.value.trim();

  if (value === "") {
    showFieldError(feedbackInput, feedbackError, "Feedback is required.");
    return false;
  }
  if (value.length < FEEDBACK_MIN) {
    showFieldError(feedbackInput, feedbackError,
      `Feedback must be at least ${FEEDBACK_MIN} characters (currently ${value.length}).`);
    return false;
  }
  if (value.length > FEEDBACK_MAX) {
    showFieldError(feedbackInput, feedbackError,
      `Feedback must not exceed ${FEEDBACK_MAX} characters.`);
    return false;
  }
  clearFieldError(feedbackInput, feedbackError);
  return true;
}

// ---- 5. SAFE OUTPUT: display submitted feedback ----
// We build elements with createElement() and fill them with textContent.
// textContent treats the input as plain text, so something like
// <script>alert("test")</script> is SHOWN as characters, never EXECUTED.
// We deliberately do NOT use innerHTML for user-provided data.
function renderFeedback(name, email, feedback) {
  if (emptyState) {
    emptyState.remove();
  }

  const item = document.createElement("div");
  item.className = "feedback-item";

  const meta = document.createElement("p");
  meta.className = "meta";

  const nameEl = document.createElement("strong");
  nameEl.textContent = name;                        // SAFE

  const emailEl = document.createElement("span");
  emailEl.textContent = " (" + email + ") · " + new Date().toLocaleString();  // SAFE

  meta.appendChild(nameEl);
  meta.appendChild(emailEl);

  const textEl = document.createElement("p");
  textEl.className = "text";
  textEl.textContent = feedback;                    // SAFE – key XSS protection

  item.appendChild(meta);
  item.appendChild(textEl);

  // Newest feedback at the top
  feedbackList.prepend(item);
}

// ---- 6. Live character counter ----
feedbackInput.addEventListener("input", function () {
  const length = feedbackInput.value.length;
  charCounter.textContent = `${length} / ${FEEDBACK_MAX}`;
});

// Clear a field's error as soon as the user starts fixing it
nameInput.addEventListener("input", () => clearFieldError(nameInput, nameError));
emailInput.addEventListener("input", () => clearFieldError(emailInput, emailError));
feedbackInput.addEventListener("input", () => clearFieldError(feedbackInput, feedbackError));

// ---- 7. Form submit handler ----
form.addEventListener("submit", function (event) {
  event.preventDefault();   // stop the page from reloading

  // Run ALL validations so every error is shown at once
  const isNameValid     = validateName();
  const isEmailValid    = validateEmail();
  const isFeedbackValid = validateFeedback();

  if (!isNameValid || !isEmailValid || !isFeedbackValid) {
    showFormMessage("❌ Please correct the highlighted errors and try again.", "error-msg");
    return;
  }

  const name     = nameInput.value.trim();
  const email    = emailInput.value.trim();
  const feedback = feedbackInput.value.trim();

  renderFeedback(name, email, feedback);
  showFormMessage(`✅ Thank you, ${name}! Your feedback has been submitted successfully.`, "success");

  form.reset();
  charCounter.textContent = `0 / ${FEEDBACK_MAX}`;
});