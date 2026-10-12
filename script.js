const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const emptyMessage = document.querySelector("#empty-message");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll(".filter");

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem("student-todo-tasks") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem("student-todo-tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.replaceChildren();
  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.text} as ${task.completed ? "pending" : "completed"}`);
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, text, deleteButton);
    taskList.append(item);
  });

  const remaining = tasks.filter(task => !task.completed).length;
  taskCount.textContent = `${remaining} task${remaining === 1 ? "" : "s"} remaining`;
  emptyMessage.hidden = visibleTasks.length > 0;
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.unshift({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, text, completed: false });
  saveTasks();
  input.value = "";
  currentFilter = "all";
  updateFilters();
  renderTasks();
  input.focus();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    updateFilters();
    renderTasks();
  });
});

function updateFilters() {
  filterButtons.forEach(button => {
    const active = button.dataset.filter === currentFilter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();
updateFilters();
