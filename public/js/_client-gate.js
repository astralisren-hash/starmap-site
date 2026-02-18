export function gate({
  who,
  storageKey,
  expectedKey,
  nextDefault,
  formId,
  inputId,
  errorId
}) {
  const url = new URL(window.location.href);
  const next = url.searchParams.get("next") || nextDefault;

  if (localStorage.getItem(storageKey) === "1") {
    window.location.replace(next);
    return;
  }

  const form = document.getElementById(formId);
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = (input?.value || "").trim();

    if (v && v === expectedKey) {
      localStorage.setItem(storageKey, "1");
      window.location.replace(next);
      return;
    }

    if (error) {
      error.textContent = "Key not accepted.";
      error.style.opacity = "0.9";
    }
    if (input) input.value = "";
    input?.focus();
  });
}
