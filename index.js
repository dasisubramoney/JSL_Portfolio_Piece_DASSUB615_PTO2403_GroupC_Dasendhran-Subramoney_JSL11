// TASK: import helper functions from utils\
import { getTasks,createNewTask,patchTask,putTask,deleteTask } from "./utils/taskFunctions.js"; 

// TASK: import initialData
import { initialData } from "./initialData.js";
//console.log("Data:",initialData); // Check if the data is correctly imported

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}


// TASK: Get elements from the DOM
const elements = {

  headerBoardName: document.getElementById('header-board-name'),
  columnDivs: document.querySelectorAll('.column-div'),
  filterDiv: document.getElementById('filterDiv'),
  editTaskModal: document.getElementById('edit-task-modal-window'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  createNewTaskBtn: document.getElementById('add-new-task-btn'), // Works 
  modalWindow: document.getElementById('new-task-modal-window')
}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();

  //console.log("tasks:", tasks); // Check if tasks are retrieved correctly

  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];

  //console.log("Boards:", boards); // Check if boards are correctly extracted
  
  // Added Check for boards 
  if (boards.length === 0) {
    console.error("No boards to display.");
    return;
  }

  displayBoards(boards);
    // Changed ; to :
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container

  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");

    // Changed click event listener 
    boardElement.addEventListener("click", () => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard)
    });

    boardsContainer.appendChild(boardElement);
  });

}

// Store ID as a global variable 
let StoreClickedID;
// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  //console.log("board name:",boardName)
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");

    //console.log("Status",status);

    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    // Changed = to ===
    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;

      //console.log("Task Titles:",task.title);

      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      // Changed click event listener 
      taskElement.addEventListener("click", () => {
        console.log('TASK ID:',task.id)
        StoreClickedID = task.id;
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
  document.getElementById('title-input').placeholder = 'e.g. Take a little break';
  document.getElementById('desc-input').placeholder = "e.g. Pet your dog, have a cup of coffee, dance to your favourite song and come back to conquer this challenge. 💪🏾";
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    // Added classlist 
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  // Changed '' to ``
  const column = document.querySelector(`.column-div[data-status = "${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  // Changed click
  cancelEditBtn.addEventListener("click", () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  // Changed click
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

// Task: Fix bugs
// Changed => to :
function toggleEditModal(show, modal = elements.editTaskModal) {
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/


function addTask(event) {
  event.preventDefault(); 

    //Assign user input to the task object
    const selectElement = document.getElementById('select-status');
    const selectDescption = document.getElementById('desc-input');
    const selecttitle = document.getElementById('title-input');
    //console.log("task status", selectElement);

    // STore values in an object from add task modal 
  const task = {
    title: selecttitle.value,
    description: selectDescption.value,
    status: selectElement.value,
    board: activeBoard
  };

  //console.log("new task status", task.status);

    // Create new task adn call functions
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
    
    //console.log("new task", newTask);
}


function toggleSidebar(show) {
  // Get the sidebar element
  const sidebarDiv = document.getElementById('side-bar-div');

  if (show) {
    // Show the sidebar
    sidebarDiv.style.display = 'block'; 
  } else {
    // Hide the sidebar
    sidebarDiv.style.display = 'none';
  }

}

function toggleTheme() {

  const body = document.body; // Get the body element
    const themeSwitch = document.getElementById('switch'); // Get the theme switch

    // Check the current theme and toggle it
    if (themeSwitch.checked) {
        // If the switch is checked, apply dark theme
        body.classList.add('dark-theme'); // Add the dark theme class
        body.classList.remove('light-theme'); // Remove the light theme class
    } else {
        // If the switch is unchecked, apply light theme
        body.classList.add('light-theme'); // Add the light theme class
        body.classList.remove('dark-theme'); // Remove the dark theme class
    } 
 
}

function openEditTaskModal(task) {
  // Set task details in modal inputs
  const modalTitleInput = document.getElementById('edit-task-title-input');
  const modalDescInput = document.getElementById('edit-task-desc-input');
  const modalStatusSelect = document.getElementById('edit-select-status');
  
  // Set the modal inputs with the task data
  modalTitleInput.value = task.title;
  modalDescInput.value = task.description;
  modalStatusSelect.value = task.status;

  toggleEditModal(true); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get task ID from the modal attribute
  //const taskId = elements.editTaskModal.getAttribute('data-task-id');
  taskId = StoreClickedID
  
  // Get new user inputs from the modal
  const updatedTitle = document.getElementById('edit-task-title-input').value;
  const updatedDesc = document.getElementById('edit-task-desc-input').value;
  const updatedStatus = document.getElementById('edit-select-status').value;

  // Create an object with the updated task details
  const updatedTask = {
    id: StoreClickedID, // Keep the original task ID
    title: updatedTitle,
    description: updatedDesc,
    status: updatedStatus,
    board: activeBoard // Keep the original board
  };

  // Update task using the helper function
  patchTask(taskId,updatedTask);

  // Close the modal and refresh the UI to reflect the changes
  toggleEditModal(false);

  refreshTasksUI();
}

function deleteTaskFromUI(taskId) {
  // Get task ID from the modal attribute
  //const taskId = elements.editTaskModal.getAttribute('data-task-id');
  taskId = StoreClickedID
  
  // Delete the task using the helper function
  deleteTask(taskId);

  // Close the modal and refresh the UI
  toggleEditModal(false);

  refreshTasksUI(); // Update the task display to show the deletion
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  //localStorage.clear();
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  // Attach the toggleTheme function to the switch event
  document.getElementById('switch').addEventListener('change', toggleTheme);

  fetchAndDisplayBoardsAndTasks(activeBoard); // Initial display of boards and tasks

  // Add the details of the new task to local storage on the click event
  document.getElementById('create-task-btn').addEventListener('click', addTask);

  // Save Changes event listener
  document.getElementById('save-task-changes-btn').addEventListener("click", saveTaskChanges);
  // Delete Task event listener
  const deleteTaskBtn = document.getElementById('delete-task-btn');
  deleteTaskBtn.addEventListener("click",deleteTaskFromUI);

 // console.log('Stored changes ID', StoreClickedID);



}