// Global variables for DOM access
const textInput = document.getElementById('textInput');
const checkBtn = document.getElementById('checkBtn');
const clearBtn = document.getElementById('clearBtn');
const resultBox = document.getElementById('resultBox');
const checkCountText = document.getElementById('checkCount');
const themeToggle = document.getElementById('themeToggle');

const setTheme = (theme) => {
  const isDark = theme === 'dark';
  document.body.dataset.theme = isDark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-checked', String(isDark));
  themeToggle.querySelector('.theme-toggle-label').textContent = isDark ? 'Dark' : 'Light';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

setTheme(localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');

themeToggle.addEventListener('click', () => {
  setTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark');
});

// Function declaration: used to normalize text before checking
function normalizeText(input) {
  return input.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Function declaration: checks if the normalized text is a palindrome
function isPalindrome(text) {
  const normalized = normalizeText(text);
  const reversed = normalized.split('').reverse().join('');
  return normalized === reversed;
}

// Arrow function: updates the result box and toggles CSS classes
const updateResult = (message, type) => {
  resultBox.textContent = message;
  resultBox.className = `result-box show ${type}`;
};

// Closure: remembers how many palindrome checks have been performed
const createCounter = () => {
  let count = 0;

  return () => {
    count += 1;
    return count;
  };
};

const countChecks = createCounter();

// Anonymous function event listener for clicking the Check button
checkBtn.addEventListener('click', function () {
  try {
    const userInput = textInput.value;

    // Local variable within this function scope
    const trimmedInput = userInput.trim();

    // Closure-based counter updates each time the user tries a check
    const totalChecks = countChecks();

    if (trimmedInput.length === 0) {
      throw new Error('Please enter a word or sentence before checking.');
    }

    const isValidPalindrome = isPalindrome(trimmedInput);

    if (isValidPalindrome) {
      updateResult('✅ It is a Palindrome!', 'success');
    } else {
      updateResult('❌ It is Not a Palindrome!', 'error');
    }

    checkCountText.textContent = `Total checks: ${totalChecks}`;
  } catch (error) {
    updateResult(`⚠️ ${error.message}`, 'error');
    checkCountText.textContent = `Total checks: ${countChecks()}`;
  }
});

// Enter key support for quick checking
textInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    checkBtn.click();
  }
});

// Clear button logic using an arrow function
clearBtn.addEventListener('click', () => {
  textInput.value = '';
  resultBox.className = 'result-box';
  resultBox.textContent = '';
});
