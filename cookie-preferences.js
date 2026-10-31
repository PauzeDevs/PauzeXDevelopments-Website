/*
  PauzeX Developments — cookie and privacy preferences.
  No analytics or advertising cookies are currently installed. The notice is
  intentionally shown on every visit so visitors can review their choices.
*/
(() => {
  "use strict";
  const STORAGE_KEY = "pauzex-privacy-preferences-v1";
  const banner = document.getElementById("cookie-banner");
  const dialog = document.getElementById("cookie-dialog");
  const settingsButtons = [...document.querySelectorAll("[data-cookie-settings]")];
  const closeButton = document.getElementById("cookie-close");
  const closeBottomButton = document.getElementById("cookie-close-bottom");
  const saveButton = document.getElementById("cookie-save");
  const acceptButton = document.getElementById("cookie-accept");
  if (!banner || !dialog) return;

  let lastFocused = null;
  const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const readChoice = () => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  };
  function closeDialog() {
    if (dialog.hidden) return;
    dialog.hidden = true;
    document.body.classList.remove("cookie-dialog-open");
    settingsButtons.forEach(button => button.setAttribute("aria-expanded", "false"));
    const target = lastFocused;
    lastFocused = null;
    if (target?.isConnected && !target.closest("[hidden]") && !target.closest("[inert]")) {
      target.focus({ preventScroll: true });
    }
  }
  const saveChoice = choice => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        essential: true,
        analytics: false,
        advertising: false,
        choice,
        savedAt: new Date().toISOString()
      }));
    } catch {}
    banner.hidden = true;
    closeDialog();
  };
  const openDialog = () => {
    if (!dialog.hidden) return;
    lastFocused = document.activeElement;
    dialog.hidden = false;
    document.body.classList.add("cookie-dialog-open");
    settingsButtons.forEach(button => button.setAttribute("aria-expanded", "true"));
    closeButton?.focus();
  };

  // Show the consent notice on every page visit, even when a previous choice exists.
  // The saved choice remains available for the preferences UI, but never suppresses the notice.
  banner.hidden = false;
  settingsButtons.forEach(button => button.addEventListener("click", openDialog));
  closeButton?.addEventListener("click", closeDialog);
  closeBottomButton?.addEventListener("click", closeDialog);
  dialog.addEventListener("click", event => {
    if (event.target === dialog) closeDialog();
  });
  document.addEventListener("keydown", event => {
    if (dialog.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...dialog.querySelectorAll(focusableSelector)]
      .filter(element => !element.closest("[hidden]") && element.getClientRects().length > 0);
    if (!focusable.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  acceptButton?.addEventListener("click", () => saveChoice("acknowledged"));
  saveButton?.addEventListener("click", () => saveChoice("custom"));
})();
