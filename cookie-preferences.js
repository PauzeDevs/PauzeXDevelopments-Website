/*
  PauzeX Developments — cookie and privacy preferences.
  No analytics or advertising cookies are currently installed. The consent choice
  is saved in localStorage so the notice does not reappear on every visit.
*/
(() => {
  "use strict";
  const STORAGE_KEY = "pauzex-privacy-preferences-v1";
  const banner = document.getElementById("cookie-banner");
  const dialog = document.getElementById("cookie-dialog");
  const settingsButtons = document.querySelectorAll("[data-cookie-settings]");
  const closeButton = document.getElementById("cookie-close");
  const closeBottomButton = document.getElementById("cookie-close-bottom");
  const saveButton = document.getElementById("cookie-save");
  const acceptButton = document.getElementById("cookie-accept");
  if (!banner || !dialog) return;

  const readChoice = () => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  };
  const saveChoice = choice => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, analytics: false, choice, savedAt: new Date().toISOString() })); } catch {}
    banner.hidden = true;
    closeDialog();
  };
  const openDialog = () => {
    dialog.hidden = false;
    document.body.classList.add("cookie-dialog-open");
    closeButton?.focus();
  };
  function closeDialog() {
    dialog.hidden = true;
    document.body.classList.remove("cookie-dialog-open");
  }

  if (!readChoice()) banner.hidden = false;
  settingsButtons.forEach(button => button.addEventListener("click", openDialog));
  closeButton?.addEventListener("click", closeDialog);
  closeBottomButton?.addEventListener("click", closeDialog);
  dialog.addEventListener("click", event => { if (event.target === dialog) closeDialog(); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !dialog.hidden) closeDialog();
  });
  acceptButton?.addEventListener("click", () => saveChoice("acknowledged"));
  saveButton?.addEventListener("click", () => saveChoice("custom"));
})();
