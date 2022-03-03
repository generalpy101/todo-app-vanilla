"use strict";

const todoListUL = document.querySelector(".todo-list");
const todoListULCompleted = document.querySelector(".todo-list-completed");
const todoItemAddForm = document.querySelector("#add-todo-form");
const todoEntryInput = document.querySelector("#todo-entry-input");

const todoContainer = document.querySelector(".todo-container");

const emptyListElement = "<p class='msg msg-info'>Todo List is empty add something first.</p>";

let todoList = new Map(JSON.parse(localStorage.getItem("todo")));
let lastId;
let completed = false;

let change = false;
let saveTimeOut = 5000;
let autoSaveTimer;

const isListEmpty = function () {
  return todoList.size === 0;
};

const createTodoEntryElement = function (id, item) {
  return `<li class="todo-entry ${
    item.status ? "task-finished" : "task-unfinished"
  }">
    <input type="checkbox" class="todo-check" ${
      item.status ? "checked" : ""
    } data-id="${id}" />
    ${item.entry}
    <button class="btn btn-trash" data-id="${id}">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="trash-icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
    </button>
  </li>`;
};

const fillTodoList = function () {
  todoListUL.innerHTML = "";
  todoListULCompleted.innerHTML = "";
  if (isListEmpty()) {
    todoListUL.insertAdjacentHTML("afterbegin", emptyListElement);
    todoListULCompleted.insertAdjacentHTML("afterbegin", emptyListElement);
    return;
  }
  for (const [key, value] of todoList.entries()) {
    if (value.status === false) {
      todoListUL.insertAdjacentHTML(
        "beforeend",
        createTodoEntryElement(key, value)
      );
    } else {
      completed = true;
      todoListULCompleted.insertAdjacentHTML(
        "beforeend",
        createTodoEntryElement(key, value)
      );
    }
  }
  if (!completed) {
    todoListULCompleted.insertAdjacentHTML("beforeend", emptyListElement);
  }
};

const writeToStorage = function () {
  if (!change) return;
  localStorage.setItem("todo", JSON.stringify(Array.from(todoList.entries())));
  console.log("saved to storage");
  change = false;
};

const init = function () {
  if (isListEmpty()) {
    lastId = 1;
  } else {
    lastId = Math.max(...todoList.keys());
  }
  fillTodoList();
  autoSaveTimer = setInterval(writeToStorage, saveTimeOut);
};

init();

todoItemAddForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const todoEntryText = todoEntryInput.value;
  if (!todoEntryText) return;
  if (isListEmpty()) todoListUL.innerHTML = "";
  lastId++;
  const todoEntry = {
    entry: todoEntryText,
    status: false,
  };
  todoListUL.insertAdjacentHTML(
    "beforeend",
    createTodoEntryElement(lastId, todoEntry)
  );
  todoEntryInput.value = "";
  todoList.set(lastId, todoEntry);
  change = true;
});

todoContainer.addEventListener("click", (e) => {
  const clickedBtn = e.target.closest(".btn-trash");
  if (!clickedBtn) return;
  const id = Number(clickedBtn.dataset.id);
  todoList.delete(id);
  fillTodoList();
  change = true;
});

todoContainer.addEventListener("click", (e) => {
  const clickedBox = e.target.closest(".todo-check");
  if (!clickedBox) return;
  const id = Number(clickedBox.dataset.id);
  if (clickedBox.checked) {
    const old = todoList.get(id);
    old.status = true;
    todoList.set(id, old);
    change = true;
  }
  fillTodoList();
});

window.addEventListener("beforeunload", writeToStorage);
