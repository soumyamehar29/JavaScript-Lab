const form = document.querySelector('#application-form');
const message = document.querySelector('#message');
const characterCount = document.querySelector('#character-count');
const resumeInput = document.querySelector('#resume');
const fileLabel = document.querySelector('#file-label');
const successMessage = document.querySelector('#success-message');

message.addEventListener('input', () => {
  characterCount.textContent = `${message.value.length} / 500`;
});

resumeInput.addEventListener('change', () => {
  fileLabel.textContent = resumeInput.files[0]?.name || 'Choose a PDF, DOC, or DOCX file';
});

function setError(fieldId, errorText) {
  const field = document.querySelector(`#${fieldId}`);
  const error = document.querySelector(`#${fieldId}-error`);
  field.classList.toggle('invalid', Boolean(errorText));
  field.setAttribute('aria-invalid', Boolean(errorText));
  error.textContent = errorText;
}

function validateForm() {
  let isValid = true;
  const name = document.querySelector('#full-name');
  const email = document.querySelector('#email');
  const role = document.querySelector('#role');
  const note = document.querySelector('#message');
  const consent = document.querySelector('#consent');

  setError('full-name', name.value.trim() ? '' : 'Please enter your full name.');
  setError('email', email.validity.valid ? '' : 'Please enter a valid email address.');
  setError('role', role.value ? '' : 'Please select a role.');
  setError('resume', resumeInput.files.length ? '' : 'Please attach your resume.');
  setError('message', note.value.trim() ? '' : 'Please add a short note.');
  setError('consent', consent.checked ? '' : 'Please agree before submitting.');

  isValid = form.querySelectorAll('.invalid').length === 0;
  return isValid;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  successMessage.hidden = true;

  if (!validateForm()) {
    form.querySelector('.invalid')?.focus();
    return;
  }

  successMessage.hidden = false;
  successMessage.focus();
  form.reset();
  fileLabel.textContent = 'Choose a PDF, DOC, or DOCX file';
  characterCount.textContent = '0 / 500';
});
