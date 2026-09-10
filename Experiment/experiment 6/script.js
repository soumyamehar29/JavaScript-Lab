const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((item) => item.classList.remove('active'));
    panels.forEach((panel) => panel.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.panel).classList.add('active');
  });
});

const emailInput = document.getElementById('email-input');
const emailResult = document.getElementById('email-result');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail() {
  const email = emailInput.value.trim();
  emailResult.className = 'result';
  if (!email) {
    emailResult.innerHTML = '<span class="result-dot"></span><span>Enter an address to check its format.</span>';
    return;
  }
  const valid = emailPattern.test(email);
  emailResult.classList.add(valid ? 'valid' : 'invalid');
  emailResult.innerHTML = `<span class="result-dot"></span><span>${valid ? 'Looks good. This email has a valid format.' : 'That format looks incomplete. Check the address and try again.'}</span>`;
}
document.getElementById('validate-btn').addEventListener('click', validateEmail);
emailInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') validateEmail(); });

const patterns = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  url: /https?:\/\/[^\s]+/g,
  phone: /(?:\+?\d[\d\s().-]{7,}\d)/g,
  number: /\b\d+(?:\.\d+)?\b/g,
};
const extractInput = document.getElementById('extract-input');
const extractType = document.getElementById('extract-type');
const extractResult = document.getElementById('extract-result');

document.getElementById('extract-btn').addEventListener('click', () => {
  const matches = extractInput.value.match(patterns[extractType.value]) || [];
  const uniqueMatches = [...new Set(matches)];
  extractResult.innerHTML = uniqueMatches.length
    ? `<span class="muted">${uniqueMatches.length} match${uniqueMatches.length === 1 ? '' : 'es'} found</span><br>${uniqueMatches.map((match) => `<span class="match">${match}</span>`).join('')}`
    : '<span class="muted">No matches found. Try another text sample.</span>';
});

const analyzeInput = document.getElementById('analyze-input');
const charCount = document.getElementById('char-count');
const wordCount = document.getElementById('word-count');
const lineCount = document.getElementById('line-count');
const spaceCount = document.getElementById('space-count');
const analysisLine = document.getElementById('analysis-line');

function analyzeText() {
  const text = analyzeInput.value;
  const words = text.trim() ? text.trim().split(/\s+/) : [];
  charCount.textContent = text.length;
  wordCount.textContent = words.length;
  lineCount.textContent = text ? text.split(/\r?\n/).length : 0;
  spaceCount.textContent = (text.match(/\s/g) || []).length;
  analysisLine.textContent = text ? `Average word length: ${(text.replace(/\s/g, '').length / words.length || 0).toFixed(1)} characters` : 'Start typing to analyze your text.';
}
analyzeInput.addEventListener('input', analyzeText);
