const form = document.getElementById("admissionForm");
const formStatus = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

const fields = {
  fullName: document.getElementById("fullName"),
  age: document.getElementById("age"),
  phone: document.getElementById("phone"),
  email: document.getElementById("email"),
  membership: document.getElementById("membership"),
  feesDue: document.getElementById("feesDue"),
  feesPaid: document.getElementById("feesPaid"),
  emergency: document.getElementById("emergency"),
  emergencyPhone: document.getElementById("emergencyPhone"),
  terms: document.getElementById("terms"),
};

const PLAN_FEES = {
  monthly: 1500,
  quarterly: 4000,
  yearly: 12000,
};

const namePattern = /^[A-Za-z][A-Za-z\s.'-]{1,48}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^[6-9]\d{9}$/;

function setHint(id, message, type) {
  const hint = document.getElementById(id + "Hint");
  hint.textContent = message;
  hint.className = "hint" + (type ? " " + type : "");
}

function markField(el, isValid) {
  el.classList.remove("valid", "invalid");
  if (el.value === "" && el.type !== "checkbox") return;
  if (el.type === "checkbox" && !el.checked) return;
  el.classList.add(isValid ? "valid" : "invalid");
}

function validateFullName() {
  const value = fields.fullName.value.trim();
  if (!value) {
    setHint("fullName", "Full name is required.", "error");
    markField(fields.fullName, false);
    return false;
  }
  if (!namePattern.test(value)) {
    setHint("fullName", "Use letters only (2–50 characters).", "error");
    markField(fields.fullName, false);
    return false;
  }
  setHint("fullName", "Looks good.", "success");
  markField(fields.fullName, true);
  return true;
}

function validateAge() {
  const raw = fields.age.value.trim();
  if (!raw) {
    setHint("age", "Age is required.", "error");
    markField(fields.age, false);
    return false;
  }
  const age = Number(raw);
  if (!Number.isInteger(age) || age < 16 || age > 65) {
    setHint("age", "Members must be 16–65 years old.", "error");
    markField(fields.age, false);
    return false;
  }
  setHint("age", "Eligible age.", "success");
  markField(fields.age, true);
  return true;
}

function validatePhone() {
  const value = fields.phone.value.trim();
  if (!value) {
    setHint("phone", "Phone number is required.", "error");
    markField(fields.phone, false);
    return false;
  }
  if (!phonePattern.test(value)) {
    setHint("phone", "Enter a valid 10-digit mobile number.", "error");
    markField(fields.phone, false);
    return false;
  }
  setHint("phone", "Valid number.", "success");
  markField(fields.phone, true);
  return true;
}

function validateEmail() {
  const value = fields.email.value.trim();
  if (!value) {
    setHint("email", "Email is required.", "error");
    markField(fields.email, false);
    return false;
  }
  if (!emailPattern.test(value)) {
    setHint("email", "Enter a valid email address.", "error");
    markField(fields.email, false);
    return false;
  }
  setHint("email", "Valid email.", "success");
  markField(fields.email, true);
  return true;
}

function updateFeesDue() {
  const plan = fields.membership.value;
  if (PLAN_FEES[plan] != null) {
    fields.feesDue.value = PLAN_FEES[plan];
  } else {
    fields.feesDue.value = "";
  }
  validateFeesDue();
  validateFeesPaid();
}

function validateMembership() {
  if (!fields.membership.value) {
    setHint("membership", "Please choose a membership plan.", "error");
    markField(fields.membership, false);
    return false;
  }
  setHint("membership", "Plan selected.", "success");
  markField(fields.membership, true);
  return true;
}

function validateFeesDue() {
  const raw = fields.feesDue.value.trim();
  if (!raw) {
    setHint("feesDue", "Select a plan to set fees.", "error");
    markField(fields.feesDue, false);
    return false;
  }
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount <= 0) {
    setHint("feesDue", "Fees must be greater than 0.", "error");
    markField(fields.feesDue, false);
    return false;
  }
  setHint("feesDue", "Total fees for selected plan.", "success");
  markField(fields.feesDue, true);
  return true;
}

function validateFeesPaid() {
  const raw = fields.feesPaid.value.trim();
  const due = Number(fields.feesDue.value);

  if (!raw) {
    setHint("feesPaid", "Enter amount paid at registration.", "error");
    markField(fields.feesPaid, false);
    return false;
  }

  const paid = Number(raw);
  if (!Number.isFinite(paid) || paid < 0 || !Number.isInteger(paid)) {
    setHint("feesPaid", "Enter a valid whole-rupee amount.", "error");
    markField(fields.feesPaid, false);
    return false;
  }

  if (!Number.isFinite(due) || due <= 0) {
    setHint("feesPaid", "Select a plan first.", "error");
    markField(fields.feesPaid, false);
    return false;
  }

  if (paid === 0) {
    setHint("feesPaid", "At least some fees must be paid now.", "error");
    markField(fields.feesPaid, false);
    return false;
  }

  if (paid > due) {
    setHint("feesPaid", "Paid amount cannot exceed fees due.", "error");
    markField(fields.feesPaid, false);
    return false;
  }

  const balance = due - paid;
  if (balance === 0) {
    setHint("feesPaid", "Fully paid. No balance left.", "success");
  } else {
    setHint("feesPaid", "Balance remaining: ₹" + balance + ".", "success");
  }
  markField(fields.feesPaid, true);
  return true;
}

function validateEmergency() {
  const value = fields.emergency.value.trim();
  if (!value) {
    setHint("emergency", "Emergency contact is required.", "error");
    markField(fields.emergency, false);
    return false;
  }
  if (!namePattern.test(value)) {
    setHint("emergency", "Enter a valid contact name.", "error");
    markField(fields.emergency, false);
    return false;
  }
  setHint("emergency", "Looks good.", "success");
  markField(fields.emergency, true);
  return true;
}

function validateEmergencyPhone() {
  const value = fields.emergencyPhone.value.trim();
  if (!value) {
    setHint("emergencyPhone", "Emergency number is required.", "error");
    markField(fields.emergencyPhone, false);
    return false;
  }
  if (!phonePattern.test(value)) {
    setHint("emergencyPhone", "Enter a valid 10-digit mobile number.", "error");
    markField(fields.emergencyPhone, false);
    return false;
  }
  if (value === fields.phone.value.trim()) {
    setHint("emergencyPhone", "Must differ from member phone.", "error");
    markField(fields.emergencyPhone, false);
    return false;
  }
  setHint("emergencyPhone", "Valid number.", "success");
  markField(fields.emergencyPhone, true);
  return true;
}

function validateTerms() {
  if (!fields.terms.checked) {
    setHint("terms", "You must agree before submitting.", "error");
    return false;
  }
  setHint("terms", "Agreed.", "success");
  return true;
}

const validators = {
  fullName: validateFullName,
  age: validateAge,
  phone: validatePhone,
  email: validateEmail,
  membership: validateMembership,
  feesDue: validateFeesDue,
  feesPaid: validateFeesPaid,
  emergency: validateEmergency,
  emergencyPhone: validateEmergencyPhone,
  terms: validateTerms,
};

function validateAll() {
  return Object.values(validators).every((fn) => fn());
}

function clearStatus() {
  formStatus.textContent = "";
  formStatus.className = "form-status";
}

/* Live checks: input / change / blur */
fields.fullName.addEventListener("input", validateFullName);
fields.fullName.addEventListener("blur", validateFullName);

fields.age.addEventListener("input", validateAge);
fields.age.addEventListener("blur", validateAge);

fields.phone.addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "").slice(0, 10);
  validatePhone();
  if (fields.emergencyPhone.value) validateEmergencyPhone();
});
fields.phone.addEventListener("blur", validatePhone);

fields.email.addEventListener("input", validateEmail);
fields.email.addEventListener("blur", validateEmail);

fields.membership.addEventListener("change", function () {
  validateMembership();
  updateFeesDue();
});
fields.membership.addEventListener("blur", validateMembership);

fields.feesPaid.addEventListener("input", validateFeesPaid);
fields.feesPaid.addEventListener("blur", validateFeesPaid);

fields.emergency.addEventListener("input", validateEmergency);
fields.emergency.addEventListener("blur", validateEmergency);

fields.emergencyPhone.addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "").slice(0, 10);
  validateEmergencyPhone();
});
fields.emergencyPhone.addEventListener("blur", validateEmergencyPhone);

fields.terms.addEventListener("change", validateTerms);

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const ok = validateAll();

  if (!ok) {
    formStatus.textContent = "Please fix the highlighted fields.";
    formStatus.className = "form-status error";
    return;
  }

  const due = Number(fields.feesDue.value);
  const paid = Number(fields.feesPaid.value);
  const balance = due - paid;
  const balanceMsg =
    balance === 0
      ? " Fees fully paid."
      : " Balance due: ₹" + balance + ".";

  formStatus.textContent =
    "Application submitted successfully. Welcome to FitForge!" + balanceMsg;
  formStatus.className = "form-status success";
  submitBtn.disabled = true;
});

form.addEventListener("reset", function () {
  submitBtn.disabled = false;
  clearStatus();

  Object.keys(fields).forEach(function (key) {
    fields[key].classList.remove("valid", "invalid");
    setHint(key, "", "");
  });
});
