const STORAGE_KEY = "daybook-classes";

function toLocalDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function createStarterClasses() {
  const now = new Date();
  const firstClass = new Date(now.getTime() + 28 * 60 * 1000);
  firstClass.setSeconds(0, 0);
  const secondClass = new Date(now.getTime() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000);
  secondClass.setSeconds(0, 0);
  const thirdClass = new Date(now.getTime() + 4 * 60 * 60 * 1000 + 5 * 60 * 1000);
  thirdClass.setSeconds(0, 0);

  return [
    {
      id: crypto.randomUUID(),
      title: "Foundations of design",
      subject: "Creative practice",
      location: "Studio 04",
      startsAt: toLocalDateTime(firstClass),
    },
    {
      id: crypto.randomUUID(),
      title: "The art of storytelling",
      subject: "Literature",
      location: "Room 208",
      startsAt: toLocalDateTime(secondClass),
    },
    {
      id: crypto.randomUUID(),
      title: "Ways of seeing",
      subject: "Art history",
      location: "East wing",
      startsAt: toLocalDateTime(thirdClass),
    },
  ];
}

export function loadSchedule() {
  const storedClasses = localStorage.getItem(STORAGE_KEY);
  if (storedClasses === null) {
    const starterClasses = createStarterClasses();
    saveSchedule(starterClasses);
    return starterClasses;
  }

  try {
    const parsedClasses = JSON.parse(storedClasses);
    if (!Array.isArray(parsedClasses)) {
      throw new Error("Saved schedule is not a list.");
    }

    return parsedClasses.filter((item) =>
      item &&
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      typeof item.subject === "string" &&
      typeof item.startsAt === "string" &&
      !Number.isNaN(new Date(item.startsAt).getTime())
    );
  } catch (error) {
    console.error("Could not read the saved class schedule.", error);
    throw new Error("Your saved schedule could not be loaded. Please clear this site's stored data and refresh.");
  }
}

export function saveSchedule(classes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
}

export function sortClasses(classes) {
  return [...classes].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
}

export function formatTime(date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(date, options = { weekday: "long", month: "long", day: "numeric" }) {
  return new Intl.DateTimeFormat(undefined, options).format(date);
}

export function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0"));
}

export function localDateInputValue(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
