document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    Utils.redirectIfNotAuthenticated();
    
    // Load user data
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
        document.getElementById('userName').textContent = userData.name;
        document.getElementById('userRole').textContent = userData.role === 'admin' ? 'Administrateur' : 'Membre';
        
        // Show admin section if user is admin
        if (userData.role === 'admin') {
            document.getElementById('adminSection').style.display = 'block';
            document.getElementById('adminContent').style.display = 'block';
            document.getElementById('memberContent').style.display = 'none';
        }
    }
    
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show corresponding tab content
            const tabId = button.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}Tab`).classList.add('active');
            
            // Load data for the tab
            if (tabId === 'users') {
                loadUsers();
            } else if (tabId === 'all-tasks') {
                loadAllTasks();
            }
        });
    });
    
    // Task modal
    const taskModal = document.getElementById('taskModal');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const closeModal = document.getElementById('closeModal');
    const cancelTaskBtn = document.getElementById('cancelTaskBtn');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const taskForm = document.getElementById('taskForm');
    
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            taskForm.reset();
            document.getElementById('modalTitle').textContent = 'Ajouter une tâche';
            taskModal.classList.add('active');
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            taskModal.classList.remove('active');
        });
    }
    
    if (cancelTaskBtn) {
        cancelTaskBtn.addEventListener('click', () => {
            taskModal.classList.remove('active');
        });
    }
    
    if (saveTaskBtn) {
        saveTaskBtn.addEventListener('click', async () => {
            const taskData = {
                title: taskForm.title.value,
                description: taskForm.description.value,
                status: taskForm.status.value,
                due_date: taskForm.due_date.value
            };
            
            try {
                let response;
                const taskId = taskForm.taskId.value;
                
                if (taskId) {
                    // Update existing task
                    response = await Utils.fetchWithAuth(`/api/tasks/${taskId}`, {
                        method: 'PUT',
                        body: JSON.stringify(taskData)
                    });
                    Utils.showNotification('Tâche mise à jour avec succès', 'success');
                } else {
                    // Create new task
                    response = await Utils.fetchWithAuth('/api/tasks', {
                        method: 'POST',
                        body: JSON.stringify(taskData)
                    });
                    Utils.showNotification('Tâche créée avec succès', 'success');
                }
                
                taskModal.classList.remove('active');
                loadTasks();
            } catch (error) {
                console.error('Task save error:', error);
            }
        });
    }
    
    // Confirm modal
    const confirmModal = document.getElementById('confirmModal');
    const closeConfirmModal = document.getElementById('closeConfirmModal');
    const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    
    if (closeConfirmModal) {
        closeConfirmModal.addEventListener('click', () => {
            confirmModal.classList.remove('active');
        });
    }
    
    if (cancelConfirmBtn) {
        cancelConfirmBtn.addEventListener('click', () => {
            confirmModal.classList.remove('active');
        });
    }
    
    // Initial data loading
    if (userData?.role === 'admin') {
        loadUsers();
    } else {
        loadTasks();
    }
    
    // Filter tasks
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', loadTasks);
    }
    
    // Add first task button
    const addFirstTaskBtn = document.getElementById('addFirstTaskBtn');
    if (addFirstTaskBtn) {
        addFirstTaskBtn.addEventListener('click', () => {
            if (addTaskBtn) addTaskBtn.click();
        });
    }
});

// Load tasks for member
async function loadTasks() {
    try {
        const statusFilter = document.getElementById('statusFilter');
        const status = statusFilter ? statusFilter.value : 'all';
        
        let url = '/api/tasks/affichertout';
        if (status !== 'all') {
            url += `?status=${status}`;
        }
        
        const tasks = await Utils.fetchWithAuth(url);
        const taskList = document.getElementById('taskList');
        
        if (tasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <p>Vous n'avez aucune tâche pour le moment</p>
                    <button class="btn btn-primary" id="addFirstTaskBtn">
                        <i class="fas fa-plus"></i>
                        <span>Créer ma première tâche</span>
                    </button>
                </div>
            `;
            
            document.getElementById('addFirstTaskBtn').addEventListener('click', () => {
                document.getElementById('addTaskBtn').click();
            });
            
            return;
        }
        
        taskList.innerHTML = '';
        document.getElementById('taskCount').textContent = `${tasks.length} tâche${tasks.length > 1 ? 's' : ''}`;
        
        tasks.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.className = 'task-card';
            taskCard.innerHTML = `
                <div class="task-header">
                    <div>
                        <h3 class="task-title">${task.title}</h3>
                        <span class="task-status status-${task.status}">${getStatusText(task.status)}</span>
                    </div>
                    <div class="task-actions">
                        <button class="task-btn edit" data-id="${task._id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="task-btn delete" data-id="${task._id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="task-description">${task.description || 'Aucune description'}</p>
                <div class="task-footer">
                    <span class="task-due">
                        <i class="far fa-calendar-alt"></i>
                        ${task.due_date ? Utils.formatDate(task.due_date) : 'Aucune date limite'}
                    </span>
                </div>
            `;
            
            taskList.appendChild(taskCard);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.task-btn.edit').forEach(btn => {
            btn.addEventListener('click', () => editTask(btn.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.task-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => confirmDeleteTask(btn.getAttribute('data-id')));
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Load users for admin
async function loadUsers() {
    try {
        const users = await Utils.fetchWithAuth('/api/users');
        const tableBody = document.getElementById('usersTableBody');
        
        tableBody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role === 'admin' ? 'Administrateur' : 'Membre'}</td>
                <td>${user.taskCount || 0}</td>
                <td>
                    <button class="btn btn-icon delete-user" data-id="${user._id}" ${user.role === 'admin' ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', () => confirmDeleteUser(btn.getAttribute('data-id')));
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load all tasks for admin
async function loadAllTasks() {
    try {
        const tasks = await Utils.fetchWithAuth('/api/users/all-tasks');
        const tableBody = document.getElementById('allTasksTableBody');
        
        tableBody.innerHTML = '';
        
        tasks.forEach(task => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${task.title}</td>
                <td>${task.description || 'Aucune description'}</td>
                <td><span class="task-status status-${task.status}">${getStatusText(task.status)}</span></td>
                <td>${task.user?.name || 'Utilisateur inconnu'}</td>
                <td>${task.due_date ? Utils.formatDate(task.due_date) : '-'}</td>
                <td>
                    <button class="btn btn-icon delete-task" data-id="${task._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', () => confirmDeleteTask(btn.getAttribute('data-id')));
        });
    } catch (error) {
        console.error('Error loading all tasks:', error);
    }
}

// Edit task
async function editTask(taskId) {
    try {
        const task = await Utils.fetchWithAuth(`/api/tasks/${taskId}`);
        const taskForm = document.getElementById('taskForm');
        
        document.getElementById('modalTitle').textContent = 'Modifier la tâche';
        document.getElementById('taskId').value = task._id;
        taskForm.title.value = task.title;
        taskForm.description.value = task.description || '';
        taskForm.status.value = task.status;
        taskForm.due_date.value = task.due_date ? task.due_date.split('T')[0] : '';
        
        document.getElementById('taskModal').classList.add('active');
    } catch (error) {
        console.error('Error editing task:', error);
    }
}

// Confirm delete task
function confirmDeleteTask(taskId) {
    const confirmModal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    
    confirmMessage.textContent = 'Êtes-vous sûr de vouloir supprimer cette tâche?';
    confirmActionBtn.onclick = () => deleteTask(taskId);
    confirmModal.classList.add('active');
}

// Delete task
async function deleteTask(taskId) {
    try {
        await Utils.fetchWithAuth(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        Utils.showNotification('Tâche supprimée avec succès', 'success');
        document.getElementById('confirmModal').classList.remove('active');
        loadTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

// Confirm delete user
function confirmDeleteUser(userId) {
    const confirmModal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    
    confirmMessage.textContent = 'Êtes-vous sûr de vouloir supprimer cet utilisateur?';
    confirmActionBtn.onclick = () => deleteUser(userId);
    confirmModal.classList.add('active');
}

// Delete user
async function deleteUser(userId) {
    try {
        await Utils.fetchWithAuth(`/api/users/${userId}`, {
            method: 'DELETE'
        });
        
        Utils.showNotification('Utilisateur supprimé avec succès', 'success');
        document.getElementById('confirmModal').classList.remove('active');
        loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

// Helper function to get status text
function getStatusText(status) {
    const statusMap = {
        'pending': 'En attente',
        'in_progress': 'En cours',
        'completed': 'Terminée'
    };
    
    return statusMap[status] || status;
}