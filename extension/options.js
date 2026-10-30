const button = document.getElementById("clear-history");
button.addEventListener("click", async () => {
  button.disabled = true;
  const status = document.getElementById("clear-status");
  try {
    const result = await chrome.runtime.sendMessage({ type: "WOKRA_CLEAR" });
    if (!result?.ok) throw new Error("Failed");
    status.textContent = "L’historique local a été effacé.";
  } catch { status.textContent = "Effacement indisponible. Réessayez."; }
  finally { button.disabled = false; }
});
