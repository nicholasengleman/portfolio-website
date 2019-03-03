$(document).ready(function() {
	todoShow.displayTodos();
});


//Model

let editTarget;

const todoModel = {
	showMode: 1,
	todos: [],
	//function to add todos
	addTodo (todo) {
		this.todos.push({todoText: todo, complete: false});

		const json = JSON.stringify(this.todos);
		localStorage.setItem('todos', json);

	},
	deleteTodo (todo) {
		this.todos.splice(todo, 1);

		const json = JSON.stringify(this.todos);
		localStorage.setItem('todos', json);
	},
	toggleTodo (todo) {
		this.todos[todo].complete = !this.todos[todo].complete;

		const json = JSON.stringify(this.todos);
		localStorage.setItem('todos', json);
	},

	clearCompleteTodo () {
		for (let i = 0; i < this.todos.length; i++) {
			if (this.todos[i].complete) {
				this.todos.splice(i, 1);
			}
		}

		const json = JSON.stringify(this.todos);
		localStorage.setItem('todos', json);
	},

	changeTodo (todo, newtext) {
		if(this.todos[todo].complete) {
			this.todos.splice(todo, 1, {todoText: newtext, complete: true});
		}
		else {
			this.todos.splice(todo, 1, {todoText: newtext, complete: false});
		}

		const json = JSON.stringify(this.todos);
		localStorage.setItem('todos', json);
	}
};

//View
const todoShow = {
	activeCount: 0,
	completeExist: false,
	displayTodos () {
		const json = localStorage.getItem('todos');
		if (json) {
			todoModel.todos = JSON.parse(json);
		} else {
			todoModel.todos = [];
		}

		this.activeCount = 0;
		this.completeExist = false;
		let parentContainer = document.querySelector("#parentContainer");

		while (parentContainer.firstChild) {
			parentContainer.removeChild(parentContainer.lastChild);
		}
		//draw list of todos
		for (let i = 0; i < todoModel.todos.length; i++) {
			if ((todoModel.showMode === 1) ||
				((todoModel.showMode === 2) && (todoModel.todos[i].complete)) ||
				((todoModel.showMode === 3) && (!todoModel.todos[i].complete))) {

				if (!todoModel.todos[i].complete) {
					this.activeCount++;
				}
				if (todoModel.todos[i].complete) {
					this.completeExist = true;
				}

				//create todo container div
				let todoContainerDiv = document.createElement("div");
				todoContainerDiv.className = `todoContainer`;

				//create Input Container Div
				let inputContainerDiv = document.createElement("div");
				inputContainerDiv.className = `inputContainer`;
				inputContainerDiv.id = i;


				//create toggle tag
				let toggleDiv = document.createElement("div");
				toggleDiv.innerHTML = `<p onclick='handlers.toggleTodo(event)'>O</p>`;
				if (todoModel.todos[i].complete) {
					toggleDiv.className = `toggle toggle-complete`;
				} else {
					toggleDiv.className = `toggle toggle-uncomplete`;
				}
				toggleDiv.id = i;

				//create input tag
				let inputTag = document.createElement("input");
				inputTag.setAttribute("value", todoModel.todos[i].todoText);
				inputTag.id = "input"+i;
				if (todoModel.todos[i].complete) {
					inputTag.className = `todo-complete`;
				}

				//create delete tag
				let deleteDiv = document.createElement("div");
				deleteDiv.innerHTML = `<p onclick='handlers.deleteTodo(event)'>X</p>`;
				deleteDiv.className = "delete";
				deleteDiv.id = i;

				//append inputContainer Div to Container Div
				inputContainerDiv.appendChild(inputTag);
				todoContainerDiv.appendChild(toggleDiv);
				todoContainerDiv.appendChild(inputContainerDiv);
				todoContainerDiv.appendChild(deleteDiv);
				parentContainer.appendChild(todoContainerDiv);
			}
		}

		let inputContainerDivs = document.getElementsByClassName("inputContainer");

		for(let i = 0; i < inputContainerDivs.length; i++) {
			inputContainerDivs[i].addEventListener("click", function() {
				editTarget = this.id;
				document.getElementById("parentContainer").addEventListener("keypress", handlers.editTodo);
			});
		}

		this.createFooter();
	},

	createFooter () {
		//create footer div
		let footerDiv = document.createElement("div");
		footerDiv.className = "footer";

		let itemsLeftDiv = document.createElement("div");
		itemsLeftDiv.className = `itemsLeftDiv`;
		itemsLeftDiv.innerHTML = `<p>${this.activeCount} items left</p>`;

		let actionDiv = document.createElement("div");
		actionDiv.className = "actionDiv";
		actionDiv.innerHTML =
			`<button id='all' onclick='handlers.viewAll(event)'>All</button>
			 <button id='active' onclick='handlers.viewActive(event)'>Active</button>
			 <button id='completed' onclick='handlers.viewCompleted(event)'>Completed</button>`;

		let clearCompletedDiv = document.createElement("div");
		clearCompletedDiv.className = `clearCompletedDiv`;
		if (this.completeExist) {
			clearCompletedDiv.innerHTML = `<p onclick='handlers.clearCompleted()'>Clear Completed</p>`;
		}

		footerDiv.appendChild(itemsLeftDiv);
		footerDiv.appendChild(actionDiv);
		footerDiv.appendChild(clearCompletedDiv);
		parentContainer.appendChild(footerDiv);

		this.addButtonBorder();
	},

	addButtonBorder () {
		if (todoModel.showMode === 1) {
			let all = document.getElementById("all");
			all.className = `selectedButtonBorder`;
		}
		if (todoModel.showMode === 2) {
			let all = document.getElementById("completed");
			all.className = `selectedButtonBorder`;
		}
		if (todoModel.showMode === 3) {
			let all = document.getElementById("active");
			all.className = `selectedButtonBorder`;
		}
	}
};

//Controller
const handlers = {
	addTodo (e) {
		if (e.keyCode === 13) {
			let todotext = document.getElementById("addTodoTextInput");
			todoModel.addTodo(todotext.value);
			todotext.value = "";
			todoShow.displayTodos();
		}
	},

	editTodo (e) {
		if (e.keyCode === 13) {
			let todotext = document.getElementById("input"+editTarget);
			todoModel.changeTodo(editTarget, todotext.value);
			todotext.value = "";
			todoShow.displayTodos();
		}
	},

	deleteTodo (e) {
		todoModel.deleteTodo(e.currentTarget.parentNode.id);
		todoShow.displayTodos();
	},

	toggleTodo (e) {
		todoModel.toggleTodo(e.currentTarget.parentNode.id);
		todoShow.displayTodos();
	},

	viewAll () {
		todoModel.showMode = 1;
		todoShow.displayTodos();
	},

	viewCompleted () {
		todoModel.showMode = 2;
		todoShow.displayTodos();
	},

	viewActive () {
		todoModel.showMode = 3;
		todoShow.displayTodos();
	},

	clearCompleted () {
		todoModel.clearCompleteTodo();
		todoShow.displayTodos();
	}
};
