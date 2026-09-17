const THEME_KEY = "js-lab-theme";
const FONT_SIZE_KEY = "js-lab-font-size";
const USERNAME_KEY = "js-lab-username";
const DEFAULT_THEME = "light";
const DEFAULT_FONT_SIZE = "medium";
const themeInputs = document.querySelectorAll('input[name="theme"]');
const fontSizeInputs = document.querySelectorAll('input[name="font-size"]');
const storedTheme = document.querySelector("#stored-theme");
const storedFontSize = document.querySelector("#stored-font-size");
const storedUsername = document.querySelector("#stored-username");
const status = document.querySelector("#status");
const usernameInput = document.querySelector("#username");
const welcomeMessage = document.querySelector("#welcome-message");

function isTheme(value) {
  return value === "light" || value === "dark";
}

function setTheme(theme) {
  const selectedTheme = isTheme(theme) ? theme : DEFAULT_THEME;
  document.documentElement.dataset.theme = selectedTheme;
  storedTheme.textContent = selectedTheme[0].toUpperCase() + selectedTheme.slice(1);
  themeInputs.forEach((input) => {
    input.checked = input.value === selectedTheme;
  });
}

function isFontSize(value) {
  return value === "small" || value === "medium" || value === "large";
}

function setFontSize(fontSize) {
  const selectedFontSize = isFontSize(fontSize) ? fontSize : DEFAULT_FONT_SIZE;
  document.documentElement.dataset.fontSize = selectedFontSize;
  storedFontSize.textContent = selectedFontSize[0].toUpperCase() + selectedFontSize.slice(1);
  fontSizeInputs.forEach((input) => {
    input.checked = input.value === selectedFontSize;
  });
}

function loadPreferences() {
  // localStorage keeps these preferences after the browser is closed.
  const savedTheme = localStorage.getItem(THEME_KEY);
  const savedFontSize = localStorage.getItem(FONT_SIZE_KEY);
  setTheme(savedTheme);
  setFontSize(savedFontSize);

  // sessionStorage keeps the username while this tab's session is active.
  const savedUsername = sessionStorage.getItem(USERNAME_KEY);
  updateSessionUI(savedUsername);
}

function updateSessionUI(username) {
  if (username) {
    storedUsername.textContent = username;
    welcomeMessage.textContent = `Welcome, ${username}!`;
    usernameInput.value = username;
    return;
  }

  storedUsername.textContent = "None";
  welcomeMessage.textContent = "No active session exists.";
  usernameInput.value = "";
}

document.querySelector("#save-preferences").addEventListener("click", () => {
  const theme = document.querySelector('input[name="theme"]:checked').value;
  const fontSize = document.querySelector('input[name="font-size"]:checked').value;

  // Save the selected theme and font size in localStorage.
  localStorage.setItem(THEME_KEY, theme);
  localStorage.setItem(FONT_SIZE_KEY, fontSize);
  setTheme(theme);
  setFontSize(fontSize);
  status.textContent = "Preferences saved in localStorage.";
});

document.querySelector("#reset-preferences").addEventListener("click", () => {
  // Remove only the saved preferences; the current session stays active.
  localStorage.removeItem(THEME_KEY);
  localStorage.removeItem(FONT_SIZE_KEY);
  setTheme(DEFAULT_THEME);
  setFontSize(DEFAULT_FONT_SIZE);
  status.textContent = "Preferences reset to Light theme and Medium font size.";
});

document.querySelector("#session-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const username = usernameInput.value.trim();
  if (!username) {
    welcomeMessage.textContent = "Please enter a username to start your session.";
    usernameInput.focus();
    return;
  }

  // Store the username only for the current browser tab session.
  sessionStorage.setItem(USERNAME_KEY, username);
  updateSessionUI(username);
});

document.querySelector("#clear-session").addEventListener("click", () => {
  // Remove the session username from sessionStorage.
  sessionStorage.removeItem(USERNAME_KEY);
  updateSessionUI(null);
});

themeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    setTheme(input.value);
    status.textContent = "Theme preview updated. Click Save preferences to remember it.";
  });
});

fontSizeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    setFontSize(input.value);
    status.textContent = "Font size preview updated. Click Save preferences to remember it.";
  });
});

loadPreferences();
