export function gate({
  storageKey,
  expectedKey,
  nextDefault,
  formId = "gate-form",
  inputId = "gate-key",
  errorId = "gate-error",
} = {}) {
  // If already unlocked, go straight through
  try {
    if (localStorage.getItem(storageKey) === "1") {
      window.location.replace(nextDefault);
      return;
    }
  } catch {}

  const form = document.getElementById(formId);
  const input = document.getElementById(inputId);
  const err = document.getElementById(errorId);

  const setErr = (m) => { if (err) err.textContent = m || ""; };
  setErr("");

  if (!form || !input) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    setErr("");

    const v = String(input.value || "").trim();
    if (v !== String(expectedKey)) {
      setErr("Incorrect key.");
      return;
    }

    try { localStorage.setItem(storageKey, "1"); } catch {}
    window.location.assign(nextDefault);
  });
}
