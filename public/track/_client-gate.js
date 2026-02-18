export function gate(opts) {
  const {
    storageKey,
    expectedKey,
    nextDefault,
    formId,
    inputId,
    errorId,
  } = opts;

  const form = document.getElementById(formId);
  const input = document.getElementById(inputId);
  const err = document.getElementById(errorId);

  if (!form || !input) return;

  // If already unlocked, go forward immediately
  try {
    if (localStorage.getItem(storageKey) === "1") {
      window.location.replace(nextDefault);
      return;
    }
  } catch {}

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (err) err.textContent = "";

    const value = (input.value || "").trim();

    if (value !== expectedKey) {
      if (err) err.textContent = "Wrong key.";
      input.value = "";
      input.focus();
      return;
    }

    try {
      localStorage.setItem(storageKey, "1");
    } catch {}

    window.location.replace(nextDefault);
  });
}
