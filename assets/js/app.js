const todoForm = document.getElementById("todoForm");
const spinner = document.getElementById("spinner");
const updateTodoBtn = document.getElementById("updateTodoBtn");

const baseTodoUrl = `https://posts-crud-c2796-default-rtdb.firebaseio.com`;
const todoUrl = `${baseTodoUrl}/todo.json`


function snackBar(msg, icon) {
    Swal.fire({
        text: msg,
        icon: icon,
        timer: 3000
    })
}

const localState = {
    todoArray: [],
    editId: null
}

function handleSpinner(flag) {
    if (flag) {
        spinner.classList.remove("d-none");
    } else {
        spinner.classList.add("d-none");
    }
}

function convertObjToArr(obj) {
    for (let key in obj) {
        obj[key].id = key;
        localState.todoArray.unshift(obj[key]);
    }
}


//Generic function for api call 
function makeApiRequest(url, method = "GET", body = null) {
    body = body ? JSON.stringify(body) : null;
    return fetch(url, {
        method: method,
        body: body,
        headers: {
            "Content-Type": "application/json",
            "security": "JWT Token"
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP Error : ${res.status}`);
            }
            return res.json();
        })
}



//raad 
function fetchTodos() {
    handleSpinner(true)
    makeApiRequest(todoUrl, "GET")
        .then(data => {
            convertObjToArr(data);
            createTodos(localState.todoArray)
        })
        .catch(err => {
            snackBar(err, "error");
        })
        .finally(() => {
            handleSpinner();
        })
}

fetchTodos();

function createTodos(arr) {
    const todoContainer = document.getElementById("todoContainer");
    let res = "";
    arr.forEach(todo => {
        res += `
            <li class="list-group-item d-flex justify-content-between" id="${todo.id}">
                <strong>${todo.todoItem}</strong>
                <div>
                    <button onclick="onEdit(this)" class="btn btn-sm btn-outline-info mr-2">Edit</button>
                    <button onclick="onDelete(this)" class="btn btn-sm btn-outline-danger">Remove</button>
                </div>
            </li>
        `
    });
    todoContainer.innerHTML = res;
}

function onTodoCreate(event) {
    const todoInputCntr = document.getElementById("todoInput");
    const todoContainer = document.getElementById("todoContainer");
    event.preventDefault();
    const todoObj = {
        todoItem: todoInputCntr.value
    }
    handleSpinner(true)
    makeApiRequest(todoUrl, "POST", todoObj)
        .then(data => {
            todoForm.reset()
            todoObj.id = data.name;
            localState.todoArray.unshift(todoObj);
            let newLi = document.createElement("li");
            newLi.className = "list-group-item d-flex justify-content-between";
            newLi.innerHTML = `
                <strong>${todoObj.todoItem}</strong>
                <div>
                    <button onclick="onEdit(this)" class="btn btn-sm btn-outline-info mr-2">Edit</button>
                    <button onclick="onDelete(this)" class="btn btn-sm btn-outline-danger">Remove</button>
                </div>
        `;
            todoContainer.prepend(newLi);
            snackBar(`New Tod with id : ${todoObj.id} is added successfylly...`, "success");
        })
        .catch(err => {
            snackBar(err, "error");
        })
        .finally(() => {
            handleSpinner();
        })

}


function onDelete(ele) {
    const deleteId = ele.closest("li").id;
    const deleteUrl = `${baseTodoUrl}/todo/${deleteId}.json`;
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            handleSpinner(true)
            makeApiRequest(deleteUrl, "DELETE")
                .then(res => {
                    const deleteIndex = localState.todoArray.findIndex(e => e.id === deleteId);
                    localState.todoArray.splice(deleteIndex, 1);
                    ele.closest("li").remove();
                    snackBar(`Todo with id ${deleteId} is deleted successfully....`, "success");
                })
                .catch(err => {
                    snackBar(err, "error");
                })
                .finally(() => {
                    handleSpinner();
                })
        }
    });
}

function onEdit(ele) {
    const todoInputCntr = document.getElementById("todoInput");
    const addTodoBtn = document.getElementById("addTodoBtn");
    const editId = ele.closest("li").id;
    localState.editId = editId;
    const editObj = localState.todoArray.find(e => e.id === editId);
    todoInputCntr.value = editObj.todoItem;
    addTodoBtn.classList.add("d-none");
    updateTodoBtn.classList.remove("d-none");
}

function onTodoUpdate() {
    const todoInputCntr = document.getElementById("todoInput");
    const addTodoBtn = document.getElementById("addTodoBtn");
    const updateId = localState.editId;
    localState.editId = null;
    const updateUrl = `${baseTodoUrl}/todo/${updateId}.json`;
    const updatedTodo = {
        todoItem: todoInputCntr.value,
        id: updateId
    }
    handleSpinner(true)
    makeApiRequest(updateUrl, "PATCH", updatedTodo)
        .then(res => {
            todoForm.reset();
            const udpateIndex = localState.todoArray.findIndex(e => e.id === updateId);
            localState.todoArray[udpateIndex] = updatedTodo;
            let updateLi = document.getElementById(updateId);
            updateLi.querySelector("strong").innerText = updatedTodo.todoItem;
            snackBar(`Todo with id : ${updateId} is updated successfully...`, "success");
            addTodoBtn.classList.remove("d-none");
            updateTodoBtn.classList.add("d-none");
        })
        .catch(err => {
            snackBar(err, "error");
            console.log(err);
        })
        .finally(() => {
            handleSpinner();
        })
}
todoForm.addEventListener("submit", onTodoCreate);
updateTodoBtn.addEventListener("click", onTodoUpdate)

