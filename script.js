/*
  Portfolio project JavaScript.
  Demo admin PIN: 2468. Change it before presenting.
  Optional Google Apps Script endpoint: paste the deployed /exec URL below.
*/
const ADMIN_PIN = "2468";
const STORAGE_KEY = "portfolioMessages";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz4CWar-AnF2rq5dzUIb96fXpzkzZV6lPZviipyI_MxcCajYkU3MVQp0eVxDY6yKxl7ow/exec"; // Example: https://script.google.com/macros/s/DEPLOYMENT_ID/exec

const $ = (selector) => document.querySelector(selector);
const contactForm = $("#contactForm");
const formStatus = $("#formStatus");
const adminForm = $("#adminForm");
const adminStatus = $("#adminStatus");
const adminLoginPanel = $("#adminLoginPanel");
const responsesPanel = $("#responsesPanel");
const responsesList = $("#responsesList");

function getLocalMessages() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch (error) { console.error("Could not read saved messages:", error); return []; }
}
function saveLocalMessage(message) {
  const messages = getLocalMessages();
  messages.push(message);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

// Apps Script JSONP avoids a browser CORS preflight for this learning demo.
// The data is sent in a URL, so keep message length limited and do not use this
// pattern for sensitive information. Local storage remains available as fallback.
function callAppsScript(params) {
  return new Promise((resolve, reject) => {
    if (!APPS_SCRIPT_URL) return reject(new Error("Google Sheets endpoint is not configured."));
    const callbackName = "appsScriptCallback_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
    const script = document.createElement("script");
    const timeout = setTimeout(() => finish(new Error("Google Sheets request timed out.")), 12000);
    function finish(error, data) {
      clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
      error ? reject(error) : resolve(data);
    }
    window[callbackName] = (data) => finish(null, data);
    const query = new URLSearchParams({ ...params, callback: callbackName });
    script.src = APPS_SCRIPT_URL + (APPS_SCRIPT_URL.includes("?") ? "&" : "?") + query.toString();
    script.onerror = () => finish(new Error("Could not connect to Google Sheets."));
    document.body.appendChild(script);
  });
}

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = {
    id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
    name: $("#senderName").value.trim(),
    email: $("#senderEmail").value.trim(),
    message: $("#senderMessage").value.trim(),
    timestamp: new Date().toISOString()
  };
  if (!message.name || !message.email || !message.message) {
    formStatus.textContent = "Please complete every field.";
    return;
  }
  const submitButton = contactForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  formStatus.textContent = "Sending your message...";
  try {
    if (APPS_SCRIPT_URL) {
      const result = await callAppsScript({ action: "submit", data: JSON.stringify(message) });
      if (!result || !result.success) throw new Error((result && result.error) || "Submission failed.");
      // Keep a local copy for convenience; Google Sheets remains the configured source.
      saveLocalMessage(message);
      formStatus.textContent = "Thanks! Your message was received.";
    } else {
      saveLocalMessage(message);
      formStatus.textContent = "Thanks! Message saved in this browser. Configure Apps Script to use Google Sheets.";
    }
    contactForm.reset();
  } catch (error) {
    console.error(error);
    saveLocalMessage(message);
    formStatus.textContent = "Saved locally because the Sheets service was unavailable. Check the Apps Script setup.";
  } finally {
    submitButton.disabled = false;
  }
});

adminForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if ($("#adminPin").value !== ADMIN_PIN) {
    adminStatus.textContent = "That PIN is not correct. Please try again.";
    return;
  }
  adminStatus.textContent = "";
  adminLoginPanel.hidden = true;
  responsesPanel.hidden = false;
  await renderResponses();
});

$("#logoutButton").addEventListener("click", () => {
  responsesPanel.hidden = true;
  adminLoginPanel.hidden = false;
  $("#adminPin").value = "";
});
$("#refreshResponses").addEventListener("click", renderResponses);

async function renderResponses() {
  let messages = getLocalMessages();
  if (APPS_SCRIPT_URL) {
    try {
      const result = await callAppsScript({ action: "list" });
      if (result && result.success && Array.isArray(result.messages)) messages = result.messages;
    } catch (error) { console.warn("Using local responses:", error); }
  }
  messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  if (!messages.length) {
    responsesList.innerHTML = '<div class="response-card">No responses have been received yet.</div>';
    return;
  }
  responsesList.innerHTML = messages.map((item) => `
    <article class="response-card">
      <h4>${escapeHtml(item.name || "Unknown sender")}</h4>
      <div class="response-meta">${escapeHtml(item.email || "")} · ${escapeHtml(item.timestamp ? new Date(item.timestamp).toLocaleString() : "Time not available")}</div>
      <p>${escapeHtml(item.message || "")}</p>
    </article>`).join("");
}

$("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("portfolioTheme", isDark ? "dark" : "light");
  $("#themeToggle").textContent = isDark ? "☀ Light" : "☾ Theme";
});
if (localStorage.getItem("portfolioTheme") === "dark") {
  document.body.classList.add("dark");
  $("#themeToggle").textContent = "☀ Light";
}
$("#menuButton").addEventListener("click", () => {
  const open = $("#navLinks").classList.toggle("open");
  $("#menuButton").setAttribute("aria-expanded", String(open));
});
document.querySelectorAll("#navLinks a").forEach((link) => link.addEventListener("click", () => {
  $("#navLinks").classList.remove("open");
  $("#menuButton").setAttribute("aria-expanded", "false");
}));
