@import "tailwindcss";

/* ===== CSS RESET ===== */
/* *, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
} */

/* ❌ No, it's not strictly necessary to include
 * { margin: 0; padding: 0; box-sizing: border-box; } 
 in your global CSS when using Tailwind CSS — 
because Tailwind already includes a smart CSS reset out of the box, 
via Preflight. */

/* Root Variables for Design System */
:root {
  /* Colors */
  --primary-color: #2563eb;
  --primary-dark: #1d4ed8;
  --primary-light: #3b82f6;
  --secondary-color: #64748b;
  --accent-color: #f59e0b;

  /* Neutral Colors */
  --white: #ffffff;
  --black: #000000;
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;

  /* Status Colors */
  --success: #10b981;
  --success-light: #d1fae5;
  --warning: #f59e0b;
  --warning-light: #fef3c7;
  --error: #ef4444;
  --error-light: #fee2e2;
  --info: #3b82f6;
  --info-light: #dbeafe;

  /* Typography */
  --font-family-primary: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, sans-serif;
  --font-family-secondary: "Poppins", sans-serif;
  --font-family-mono: "Fira Code", "JetBrains Mono", Consolas, monospace;
}

/* HTML & Body */
html {
  font-size: 16px;
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body {
  font-family: var(--font-family-primary);
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
  /* color: #0f172a; */
  /* background-color: #ffffff; */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ===== TYPOGRAPHY ===== */
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "Playfair Display", sans-serif;
  font-weight: 700;
  line-height: 1.25;
  /* color: #0f172a; */
}

h1 {
  font-size: 4rem;
}
h2 {
  font-size: 2.5rem;
}
h3 {
  font-size: 2rem;
}
h4 {
  font-size: 1.75rem;
}
h5 {
  font-size: 1.5rem;
}
h6 {
  font-size: 1.25rem;
}

p {
  margin-bottom: 1rem;
  line-height: 1.7;
  font-family: "Poppins", sans-serif; 
}

/* ===== LINKS ===== */
a {
  /* color: #2563eb; */
  text-decoration: none;
  transition: color 150ms ease;
}

/* ===== IMAGES ===== */
img {
  max-width: 100%;
  height: auto;
  border-radius: 0.25rem;
  display: block;
}

/* ===== FORMS ===== */
input,
textarea,
select,
button {
  font-family: inherit;
  line-height: inherit;
}

input,
textarea,
select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: #ffffff;
  transition: border 150ms ease;
}

input:focus,
textarea:focus,
select:focus {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  outline: none;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

/* ===== BUTTONS ===== */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  /* background-color: #2563eb; */
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 150ms ease, transform 150ms ease;
}

.button:hover {
  /* background-color: #1d4ed8; */
  transform: translateY(-1px);
}

.button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.button:disabled {
  /* background-color: #cbd5e1; */
  color: #64748b;
  cursor: not-allowed;
}

/* ===== UTILITIES ===== */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ===== DARK MODE SUPPORT ===== */
@media (prefers-color-scheme: dark) {
  /* body {
    background-color: #18181b;
    color: #fafafa;
  } */
  input,
  textarea,
  select {
    background-color: #27272a;
    color: #fafafa;
    border-color: #3f3f46;
  }
}



/* Media quiers for container */
.container,
.container-fluid,
.container-xxl,
.container-xl,
.container-lg,
.container-md,
.container-sm {
  --bs-gutter-x: 1.875rem;
  --bs-gutter-y: 0;
  width: 100%;
  padding-right: calc(var(--bs-gutter-x) * 0.5);
  padding-left: calc(var(--bs-gutter-x) * 0.5);
  margin-right: auto;
  margin-left: auto;
}

@media (min-width: 576px) {
  .container-sm,
  .container {
    max-width: 96%;
  }
}

@media (min-width: 768px) {
  .container-md,
  .container-sm,
  .container {
    max-width: 94%;
  }
}

@media (min-width: 992px) {
  .container-lg,
  .container-md,
  .container-sm,
  .container {
    max-width: 94%;
  }
}

@media (min-width: 1200px) {
  .container-xl,
  .container-lg,
  .container-md,
  .container-sm,
  .container {
    max-width: 1140px;
  }
}

@media (min-width: 1400px) {
  .container-xxl,
  .container-xl,
  .container-lg,
  .container-md,
  .container-sm,
  .container {
    max-width: 1200px;
  }
}