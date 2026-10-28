$(function () {
  "use strict";

  const STORAGE_KEY = "daily-edit-tasks-v1";
  const THEME_KEY = "daily-edit-soft-mode";
  const initialTasks = [
    { id: "starter-1", title: "Take a slow morning walk", category: "Wellbeing", completed: false, createdAt: Date.now() - 3000 },
    { id: "starter-2", title: "Make a little progress on the big thing", category: "Work", completed: false, createdAt: Date.now() - 2000 },
    { id: "starter-3", title: "Pick up something lovely for dinner", category: "Errands", completed: false, createdAt: Date.now() - 1000 }
  ];

  let tasks = loadTasks();
  let activeFilter = "all";
  let activeView = "today";
  let toastTimer;

  function loadTasks() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === null) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTasks));
        return initialTasks.slice();
      }
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) throw new Error("Saved tasks are not a list.");
      return parsed.filter(function (task) {
        return task && typeof task.id === "string" && typeof task.title === "string" &&
          typeof task.completed === "boolean" && typeof task.category === "string";
      });
    } catch (error) {
      console.error("Could not load saved tasks.", error);
      showToast("Your saved list could not be loaded.");
      return initialTasks.slice();
    }
  }

  function saveTasks() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Could not save tasks.", error);
      showToast("Changes could not be saved in this browser.");
    }
  }

  function showToast(message) {
    const $toast = $("#toast");
    $toast.text(message).addClass("visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      $toast.removeClass("visible");
    }, 2600);
  }

  function updateDateAndClock() {
    const now = new Date();
    const dateText = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(now);
    $("#today-date").text(dateText.toUpperCase());
    $("#stamp-day").text(now.getDate());
    $("#stamp-month").text(new Intl.DateTimeFormat(undefined, { month: "short" }).format(now));
    $("#clock").text(new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(now));
  }

  function visibleTasks() {
    let result = tasks.slice();
    if (activeView === "completed" || activeFilter === "done") {
      result = result.filter(function (task) { return task.completed; });
    } else if (activeFilter === "active") {
      result = result.filter(function (task) { return !task.completed; });
    }
    if (activeView === "upcoming") result = result.filter(function (task) { return !task.completed; });
    const query = $("#search-input").val().trim().toLowerCase();
    if (query) {
      result = result.filter(function (task) {
        return task.title.toLowerCase().includes(query) || task.category.toLowerCase().includes(query);
      });
    }
    return result.sort(function (a, b) { return a.completed - b.completed || a.createdAt - b.createdAt; });
  }

  function escapeHtml(value) {
    return $("<div>").text(String(value)).html()
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderTasks() {
    const $list = $("#task-list").empty();
    const shown = visibleTasks();
    const completed = tasks.filter(function (task) { return task.completed; }).length;
    const pending = tasks.length - completed;
    const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

    $("#nav-count").text(pending);
    $("#task-total").text(activeView === "completed" ? completed : pending);
    $("#all-count").text(tasks.length);
    $("#progress-value").text(percent + "%");
    $("#progress-ring").attr("aria-label", percent + " percent complete");
    $("#progress-bar").css("width", percent + "%");
    $("#progress-label").text(tasks.length ? (pending ? pending + " little thing" + (pending === 1 ? "" : "s") + " to go" : "Look at you, all done") : "A clean slate");
    $("#progress-caption").text(tasks.length ? completed + " of " + tasks.length + " taken care of" : "One thing at a time");
    $("#clear-completed").prop("hidden", completed === 0);

    if (!shown.length) {
      const hasTasks = tasks.length > 0;
      const message = $("#search-input").val().trim() ? "No little things found" : (activeView === "completed" || activeFilter === "done" ? "Nothing checked off just yet" : "A little space to begin");
      const detail = $("#search-input").val().trim() ? "Try another search, or add that task to your list." : (hasTasks ? "Try another filter to see the rest of your list." : "Add a task above, or bring in a few ideas to get started.");
      $list.append('<div class="empty-state"><span class="empty-mark" aria-hidden="true">✳</span><strong>' + message + '</strong><p>' + detail + '</p></div>');
    } else {
      shown.forEach(function (task) {
        const categoryClass = task.category.toLowerCase().replace(/[^a-z]/g, "");
        const checked = task.completed ? " checked" : "";
        const completedClass = task.completed ? " completed" : "";
        const row = '<article class="task-row' + completedClass + '" data-id="' + escapeHtml(task.id) + '">' +
          '<input class="task-check" type="checkbox" aria-label="Complete ' + escapeHtml(task.title) + '"' + checked + '>' +
          '<div class="task-copy"><div class="task-title">' + escapeHtml(task.title) + '</div>' +
          '<div class="task-meta"><span class="category-tag ' + categoryClass + '">' + escapeHtml(task.category) + '</span><span>' + (task.completed ? "Done for today" : "Whenever you're ready") + '</span></div></div>' +
          '<div class="task-actions"><button class="task-action edit" type="button" aria-label="Edit ' + escapeHtml(task.title) + '" title="Edit task">✎</button>' +
          '<button class="task-action delete" type="button" aria-label="Delete ' + escapeHtml(task.title) + '" title="Delete task">×</button></div></article>';
        $list.append(row);
      });
    }
    $("#task-footer-text").text(pending ? "You've got this. One step at a time." : "Small steps, lovely things.");
  }

  function setView(view) {
    activeView = view;
    activeFilter = "all";
    $(".nav-item").removeClass("active").filter('[data-view="' + view + '"]').addClass("active");
    $(".filter-button").removeClass("active").filter('[data-filter="all"]').addClass("active");
    const titles = {
      today: { breadcrumb: "MY DAY", title: 'Make today <em>count.</em>', kicker: "YOUR PRIORITIES", list: "Today's list", subtitle: "A little progress is still progress. Start wherever you are." },
      upcoming: { breadcrumb: "UPCOMING", title: 'Keep a little <em>room.</em>', kicker: "ON YOUR HORIZON", list: "Coming up", subtitle: "Your unfinished plans, without the rush." },
      completed: { breadcrumb: "COMPLETED", title: 'Look what you <em>did.</em>', kicker: "LITTLE WINS", list: "Things you've done", subtitle: "Every checked box is a small promise kept." }
    };
    const copy = titles[view];
    $("#breadcrumb-view").text(copy.breadcrumb);
    $("#page-title").html(copy.title);
    $("#list-kicker").text(copy.kicker);
    $("#tasks-heading").contents().first()[0].textContent = copy.list + " ";
    $("#page-subtitle").text(copy.subtitle);
    renderTasks();
  }

  $("#task-form").on("submit", function (event) {
    event.preventDefault();
    const $input = $("#task-input");
    const title = $input.val().trim();
    if (!title) {
      $input.trigger("focus");
      showToast("Write a little task first.");
      return;
    }
    tasks.unshift({
      id: "task-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      title: title,
      category: $("#task-category").val(),
      completed: false,
      createdAt: Date.now()
    });
    saveTasks();
    $input.val("");
    if (activeView !== "today") setView("today");
    else renderTasks();
    $input.trigger("focus");
    showToast("Added to your day.");
  });

  $("#task-list").on("change", ".task-check", function () {
    const id = $(this).closest(".task-row").data("id");
    const task = tasks.find(function (item) { return item.id === id; });
    if (!task) return;
    task.completed = this.checked;
    saveTasks();
    renderTasks();
  });

  $("#task-list").on("click", ".delete", function () {
    const id = $(this).closest(".task-row").data("id");
    tasks = tasks.filter(function (task) { return task.id !== id; });
    saveTasks();
    renderTasks();
    showToast("Task tucked away.");
  });

  $("#task-list").on("click", ".edit", function () {
    const id = $(this).closest(".task-row").data("id");
    const task = tasks.find(function (item) { return item.id === id; });
    if (!task) return;
    const updated = window.prompt("Give this task a new name:", task.title);
    if (updated === null) return;
    if (!updated.trim()) {
      showToast("A task needs a little name.");
      return;
    }
    task.title = updated.trim().slice(0, 120);
    saveTasks();
    renderTasks();
  });

  $(".filter-button").on("click", function () {
    activeFilter = $(this).data("filter");
    $(".filter-button").removeClass("active");
    $(this).addClass("active");
    renderTasks();
  });

  $(".nav-item").on("click", function () {
    setView($(this).data("view"));
  });

  $("#search-input").on("input", renderTasks);

  $("#clear-completed").on("click", function () {
    tasks = tasks.filter(function (task) { return !task.completed; });
    saveTasks();
    renderTasks();
    showToast("A little more breathing room.");
  });

  $("#import-button").on("click", function () {
    const $button = $(this);
    if ($button.prop("disabled")) return;
    $button.prop("disabled", true).html('<span aria-hidden="true">↻</span> Finding ideas…');
    $.ajax({
      url: "https://jsonplaceholder.typicode.com/todos?_limit=6",
      method: "GET",
      dataType: "json",
      timeout: 10000
    }).done(function (results) {
      if (!Array.isArray(results)) {
        showToast("The idea list came back in an unexpected format.");
        return;
      }
      const knownTitles = new Set(tasks.map(function (task) { return task.title.toLowerCase(); }));
      const additions = results
        .filter(function (item) { return item && typeof item.title === "string" && !knownTitles.has(item.title.toLowerCase()); })
        .map(function (item, index) {
          return {
            id: "import-" + Date.now() + "-" + index,
            title: item.title.charAt(0).toUpperCase() + item.title.slice(1),
            category: "Personal",
            completed: false,
            createdAt: Date.now() + index
          };
        });
      tasks = additions.concat(tasks);
      saveTasks();
      setView("today");
      showToast(additions.length ? additions.length + " fresh ideas added." : "Your list already has those ideas.");
    }).fail(function (xhr, status) {
      if (status === "timeout") showToast("The idea list took too long. Try again in a moment.");
      else showToast("Couldn't reach the idea list. Check your connection and try again.");
      console.error("Could not import demo tasks.", status, xhr.status);
    }).always(function () {
      $button.prop("disabled", false).html('<span aria-hidden="true">↻</span> Import ideas');
    });
  });

  $("#theme-button").on("click", function () {
    $("body").toggleClass("soft-mode");
    try {
      window.localStorage.setItem(THEME_KEY, $("body").hasClass("soft-mode") ? "true" : "false");
    } catch (error) {
      console.error("Could not save the color preference.", error);
    }
  });

  try {
    if (window.localStorage.getItem(THEME_KEY) === "true") $("body").addClass("soft-mode");
  } catch (error) {
    console.error("Could not load the color preference.", error);
  }

  updateDateAndClock();
  window.setInterval(updateDateAndClock, 30000);
  renderTasks();
});
