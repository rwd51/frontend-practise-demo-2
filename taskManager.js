class TaskManager {
    constructor() {
        this.tasks = [];
        this.loadTasks();
        this.initializeEventListeners();
    }
 
    loadTasks() {
        try {
            const storedTasks = localStorage.getItem('tasks');
            this.tasks = storedTasks ? JSON.parse(storedTasks) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.tasks = [];
        }
    }
 
    saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    }
 
    generateId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
 
    addTask(title, description, priority, dueDate) {
        try {
            if (!title.trim()) {
                throw new Error('Task title is required');
            }
 
            if (this.tasks.some(task => task.title === title.trim())) {
                throw new Error('A task with this title already exists');
            }
 
            const task = {
                id: this.generateId(),
                title: title.trim(),
                description: description.trim(),
                priority,
                dueDate,
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
 
            this.tasks.push(task);
            this.saveTasks();
            this.renderTasks();
            return task;
        } catch (error) {
            console.error('Error adding task:', error);
            throw error;
        }
    }
 
    deleteTask(taskId) {
        try {
            const index = this.tasks.findIndex(task => task.id === taskId);
            if (index !== -1) {
                this.tasks.splice(index, 1);
                this.saveTasks();
                this.renderTasks();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }
 
    updateTask(taskId, updates) {
        try {
            const task = this.tasks.find(task => task.id === taskId);
            if (task) {
                Object.assign(task, {
                    ...updates,
                    updatedAt: new Date().toISOString()
                });
                this.saveTasks();
                this.renderTasks();
            }
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }
 
    toggleTaskCompletion(taskId) {
        try {
            const task = this.tasks.find(task => task.id === taskId);
            if (task) {
                task.completed = !task.completed;
                task.updatedAt = new Date().toISOString();
                this.saveTasks();
                this.renderTasks();
            }
        } catch (error) {
            console.error('Error toggling task completion:', error);
            throw error;
        }
    }
 
    sortTasks(sortBy = 'dueDate') {
        try {
            const sortedTasks = [...this.tasks].sort((a, b) => {
                let comparison = 0;
                switch (sortBy) {
                    case 'dueDate':
                        const dateA = a.dueDate ? new Date(a.dueDate) : new Date(9999, 11, 31);
                        const dateB = b.dueDate ? new Date(b.dueDate) : new Date(9999, 11, 31);
                        comparison = dateA - dateB;
                        break;
                    case 'priority':
                        const priorityOrder = { high: 3, medium: 2, low: 1 };
                        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
                        break;
                    case 'title':
                        comparison = a.title.localeCompare(b.title);
                        break;
                    default:
                        comparison = new Date(b.createdAt) - new Date(a.createdAt);
                }
                return comparison;
            });
            this.tasks = sortedTasks;
            this.renderTasks();
        } catch (error) {
            console.error('Error sorting tasks:', error);
        }
    }
 
    isTaskOverdue(dueDate) {
        if (!dueDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(dueDate) < today;
    }
 
    renderTasks() {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;
 
        taskList.innerHTML = '';
        this.tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'task-completed' : ''}`;
            
            const formattedDueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
            const isOverdue = this.isTaskOverdue(task.dueDate) && !task.completed;
            
            taskElement.innerHTML = `
                <div class="task-content">
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                    <div class="task-meta">
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                        <span class="task-due-date ${isOverdue ? 'task-overdue' : ''}">${formattedDueDate}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="complete-btn" onclick="taskManager.toggleTaskCompletion('${task.id}')">
                        ${task.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button class="delete-btn" onclick="taskManager.deleteTask('${task.id}')">
                        Delete
                    </button>
                </div>
            `;
            taskList.appendChild(taskElement);
        });
    }
 
    initializeEventListeners() {
        const taskForm = document.getElementById('taskForm');
        const sortSelect = document.getElementById('sortTasks');
 
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('taskTitle').value;
                const description = document.getElementById('taskDescription').value;
                const priority = document.getElementById('taskPriority').value;
                const dueDate = document.getElementById('taskDueDate').value;
 
                try {
                    this.addTask(title, description, priority, dueDate);
                    taskForm.reset();
                } catch (error) {
                    alert(error.message);
                }
            });
        }
 
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortTasks(e.target.value);
            });
        }
    }
 }
 
 const taskManager = new TaskManager();