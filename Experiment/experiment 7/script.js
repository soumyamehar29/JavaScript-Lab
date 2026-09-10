const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const taskCount = document.querySelector('#task-count');

function updateBoardState() {
  const totalTasks = taskList.children.length;
  taskCount.textContent = totalTasks;
  emptyState.hidden = totalTasks > 0;
}

function createTask(taskText) {
  const taskItem = document.createElement('li');
  taskItem.className = 'task-item';
  taskItem.innerHTML = `
    <span class="task-label" tabindex="0"></span>
    <div class="task-actions">
      <button class="icon-button edit-button" type="button" aria-label="Edit task">EDIT</button>
      <button class="icon-button delete-button" type="button" aria-label="Delete task">DELETE</button>
    </div>
  `;
  taskItem.querySelector('.task-label').textContent = taskText;
  taskList.append(taskItem);
  updateBoardState();
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const taskText = taskInput.value.trim();
  if (!taskText) return;

  createTask(taskText);
  taskForm.reset();
  taskInput.focus();
});

taskList.addEventListener('click', (event) => {
  const clickedButton = event.target.closest('button');
  if (!clickedButton) return;

  const taskItem = clickedButton.closest('.task-item');
  const taskLabel = taskItem.querySelector('.task-label');

  if (clickedButton.classList.contains('delete-button')) {
    taskItem.remove();
  }

  if (clickedButton.classList.contains('edit-button')) {
    const editInput = document.createElement('input');
    editInput.className = 'edit-input';
    editInput.value = taskLabel.textContent;
    editInput.setAttribute('aria-label', 'Edit task text');
    taskLabel.replaceWith(editInput);
    editInput.focus();
    editInput.select();
    let editingFinished = false;

    const finishEditing = () => {
      if (editingFinished) return;
      editingFinished = true;
      const updatedText = editInput.value.trim();
      if (updatedText) {
        taskLabel.textContent = updatedText;
      }
      editInput.replaceWith(taskLabel);
    };

    editInput.addEventListener('blur', finishEditing, { once: true });
    editInput.addEventListener('keydown', (keyEvent) => {
      if (keyEvent.key === 'Enter') finishEditing();
      if (keyEvent.key === 'Escape') {
        editInput.value = taskLabel.textContent;
        finishEditing();
      }
    });
  }

  updateBoardState();
});

updateBoardState();
