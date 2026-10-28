import {
  formatCountdown,
  formatDate,
  formatTime,
  loadSchedule,
  localDateInputValue,
  saveSchedule,
  sortClasses,
} from "./schedule.js";

const elements = {
  todayLabel: document.querySelector("#today-label"),
  footerClock: document.querySelector("#footer-clock"),
  scheduleDateLabel: document.querySelector("#schedule-date-label"),
  scheduleEyebrow: document.querySelector("#schedule-eyebrow"),
  scheduleFooterLabel: document.querySelector("#schedule-footer-label"),
  previousDayButton: document.querySelector("#previous-day-button"),
  nextDayButton: document.querySelector("#next-day-button"),
  scheduleCount: document.querySelector("#schedule-count"),
  scheduleList: document.querySelector("#schedule-list"),
  emptyState: document.querySelector("#empty-state"),
  countdown: document.querySelector("#countdown"),
  timerCaption: document.querySelector("#timer-caption"),
  countdownNote: document.querySelector("#countdown-note"),
  nextSubject: document.querySelector("#next-subject"),
  nextTitle: document.querySelector("#next-title"),
  nextMeta: document.querySelector("#next-meta"),
  classDateChip: document.querySelector("#class-date-chip"),
  dialog: document.querySelector("#class-dialog"),
  form: document.querySelector("#class-form"),
  formError: document.querySelector("#form-error"),
  toast: document.querySelector("#toast"),
};

let classes;
let toastTimeout;
let selectedDayOffset = 0;
let lastRenderedScheduleKey = "";

try {
  classes = loadSchedule();
} catch (error) {
  document.querySelector("main").setAttribute("aria-describedby", "schedule-load-error");
  const errorNotice = document.createElement("p");
  errorNotice.id = "schedule-load-error";
  errorNotice.className = "form-error";
  errorNotice.textContent = error.message;
  document.querySelector("main").prepend(errorNotice);
  classes = [];
}

function getSelectedDate() {
  const date = new Date();
  date.setDate(date.getDate() + selectedDayOffset);
  return date;
}

function getSelectedClasses() {
  const selectedDate = localDateInputValue(getSelectedDate());
  return sortClasses(classes).filter((item) => item.startsAt.slice(0, 10) === selectedDate);
}

function getSelectedDateLabel() {
  if (selectedDayOffset === 0) return "Today";
  if (selectedDayOffset === 1) return "Tomorrow";
  if (selectedDayOffset === -1) return "Yesterday";
  return formatDate(getSelectedDate(), { month: "short", day: "numeric", year: "numeric" });
}

function getLocationSuffix(item) {
  const isAlreadyInSubject = item.subject
    .split(" · ")
    .some((part) => part.trim().toLowerCase() === item.location?.trim().toLowerCase());
  return item.location && !isAlreadyInSubject ? ` · ${item.location}` : "";
}

function updateDateAndClock() {
  const now = new Date();
  const selectedDateLabel = getSelectedDateLabel();
  elements.todayLabel.textContent = formatDate(now);
  elements.scheduleDateLabel.textContent = selectedDateLabel;
  elements.scheduleEyebrow.textContent = `MAKE ${selectedDateLabel.toUpperCase()} COUNT`;
  elements.scheduleFooterLabel.textContent = selectedDayOffset >= -1 && selectedDayOffset <= 1
    ? `SHOWING ${selectedDateLabel.toUpperCase()}'S CLASSES`
    : `SHOWING CLASSES FOR ${selectedDateLabel.toUpperCase()}`;
  elements.footerClock.textContent = `LOCAL TIME · ${formatTime(now)}`;
}

function getUpcomingClass(dayClasses, now) {
  return dayClasses.find((item) => new Date(item.startsAt).getTime() > now.getTime());
}

function updateCountdown() {
  const now = new Date();
  const dayClasses = getSelectedClasses();
  const nextClass = getUpcomingClass(dayClasses, now);
  const timerParts = elements.countdown.querySelectorAll(".timer-part strong");

  if (!nextClass) {
    const isToday = selectedDayOffset === 0;
    const hasPassedClasses = dayClasses.length > 0;
    elements.nextSubject.textContent = hasPassedClasses ? "That’s a wrap" : "A fresh page";
    elements.nextTitle.textContent = hasPassedClasses && isToday ? "You’re all done for today." : "Your day is yours.";
    elements.nextMeta.textContent = hasPassedClasses && isToday ? "Enjoy the rest of your day" : "Add a class whenever you’re ready";
    elements.timerCaption.textContent = hasPassedClasses && isToday ? "NO MORE CLASSES" : "NO CLASSES SCHEDULED";
    elements.countdownNote.textContent = hasPassedClasses && isToday
      ? "The rest of the day is yours to enjoy."
      : `Nothing planned for ${getSelectedDateLabel().toLowerCase()} yet.`;
    elements.classDateChip.textContent = getSelectedDateLabel().toUpperCase();
    timerParts.forEach((part) => {
      part.textContent = "00";
    });
    return;
  }

  const start = new Date(nextClass.startsAt);
  const [hours, minutes, seconds] = formatCountdown(start.getTime() - now.getTime());
  const subject = nextClass.subject || "Class";
  const location = getLocationSuffix(nextClass);

  elements.nextSubject.textContent = subject;
  elements.nextTitle.textContent = nextClass.title;
  elements.nextMeta.textContent = `${formatTime(start)}${location}`;
  elements.timerCaption.textContent = "TIME UNTIL CLASS";
  elements.countdownNote.textContent = `Take a breath. ${formatTime(start)} is closer than it feels.`;
  elements.classDateChip.textContent = getSelectedDateLabel().toUpperCase();
  [hours, minutes, seconds].forEach((value, index) => {
    timerParts[index].textContent = value;
  });
}

function renderSchedule() {
  const now = new Date();
  const dayClasses = getSelectedClasses();
  const nextClass = getUpcomingClass(dayClasses, now);
  const scheduleKey = [
    localDateInputValue(getSelectedDate()),
    nextClass?.id ?? "none",
    ...dayClasses.map((item) => `${item.id}:${new Date(item.startsAt).getTime() <= now.getTime()}`),
  ].join("|");
  if (scheduleKey === lastRenderedScheduleKey) return;
  lastRenderedScheduleKey = scheduleKey;

  elements.scheduleCount.textContent = `(${dayClasses.length})`;
  elements.scheduleList.replaceChildren();
  elements.emptyState.hidden = dayClasses.length > 0;
  elements.scheduleList.hidden = dayClasses.length === 0;

  dayClasses.forEach((item) => {
    const start = new Date(item.startsAt);
    const row = document.createElement("article");
    const isNext = nextClass?.id === item.id;
    const isDone = start.getTime() <= now.getTime();
    row.className = "class-row";

    const time = document.createElement("time");
    time.className = "class-time";
    time.dateTime = item.startsAt;
    time.textContent = formatTime(start);

    const info = document.createElement("div");
    info.className = "class-info";
    const title = document.createElement("p");
    title.className = "class-title";
    title.textContent = item.title;
    const subtitle = document.createElement("p");
    subtitle.className = "class-subtitle";
    subtitle.textContent = `${item.subject}${getLocationSuffix(item)}`;
    info.append(title, subtitle);

    const status = document.createElement("span");
    status.className = `class-status${isNext ? " is-next" : ""}${isDone ? " is-done" : ""}`;
    const statusDot = document.createElement("span");
    statusDot.setAttribute("aria-hidden", "true");
    status.append(statusDot, document.createTextNode(isNext ? "Up next" : isDone ? "Passed" : "Upcoming"));

    const removeButton = document.createElement("button");
    removeButton.className = "remove-class";
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", `Remove ${item.title}`);
    removeButton.textContent = "×";
    removeButton.addEventListener("click", () => removeClass(item.id));

    row.append(time, info, status, removeButton);
    elements.scheduleList.append(row);
  });
}

function refresh() {
  updateDateAndClock();
  updateCountdown();
  renderSchedule();
}

function showToast(message) {
  window.clearTimeout(toastTimeout);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimeout = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 3200);
}

function openDialog() {
  elements.form.reset();
  elements.formError.textContent = "";
  const today = localDateInputValue();
  elements.form.elements.date.min = today;
  elements.form.elements.date.value = selectedDayOffset >= 0
    ? localDateInputValue(getSelectedDate())
    : today;
  elements.dialog.showModal();
  elements.form.elements.title.focus();
}

function removeClass(id) {
  const classToRemove = classes.find((item) => item.id === id);
  classes = classes.filter((item) => item.id !== id);
  saveSchedule(classes);
  refresh();
  if (classToRemove) showToast(`${classToRemove.title} removed from your schedule.`);
}

document.querySelector("#add-class-button").addEventListener("click", openDialog);
document.querySelector("#empty-add-button").addEventListener("click", openDialog);
document.querySelector("#close-dialog-button").addEventListener("click", () => elements.dialog.close());
elements.previousDayButton.addEventListener("click", () => {
  selectedDayOffset -= 1;
  lastRenderedScheduleKey = "";
  refresh();
});
elements.nextDayButton.addEventListener("click", () => {
  selectedDayOffset += 1;
  lastRenderedScheduleKey = "";
  refresh();
});

elements.dialog.addEventListener("click", (event) => {
  if (event.target === elements.dialog) elements.dialog.close();
});

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(elements.form);
  const startsAt = `${formData.get("date")}T${formData.get("time")}`;
  const parsedStart = new Date(startsAt);

  if (Number.isNaN(parsedStart.getTime())) {
    elements.formError.textContent = "Please enter a valid date and start time.";
    return;
  }
  if (parsedStart.getTime() <= Date.now()) {
    elements.formError.textContent = "Choose a start time that is still ahead.";
    return;
  }

  const newClass = {
    id: crypto.randomUUID(),
    title: String(formData.get("title")).trim(),
    subject: String(formData.get("subject")).trim(),
    location: String(formData.get("location")).trim(),
    startsAt,
  };

  if (!newClass.title || !newClass.subject) {
    elements.formError.textContent = "Add a class name and subject to continue.";
    return;
  }

  classes = sortClasses([...classes, newClass]);
  saveSchedule(classes);
  elements.dialog.close();
  refresh();
  showToast(`${newClass.title} added to your schedule.`);
});

refresh();
window.setInterval(refresh, 1000);
