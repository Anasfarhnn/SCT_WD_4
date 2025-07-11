
    // Task Manager Application
    class TaskManager {
      constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.categories = JSON.parse(localStorage.getItem('categories')) || [
          { name: 'Work', icon: 'briefcase' },
          { name: 'Personal', icon: 'user' },
          { name: 'Shopping', icon: 'shopping-cart' }
        ];
        this.currentFilter = null;
        this.init();
      }

      init() {
        // Set today's date
        const today = new Date();
        document.getElementById('todayDate').textContent = today.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        // Set min date for date input
        document.getElementById('taskDate').min = today.toISOString().split('T')[0];
        
        // Load initial data
        this.renderTasks();
        this.renderCategories();
        
        // Set up event listeners
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleAddTask(e));
        document.getElementById('categoryForm').addEventListener('submit', (e) => this.handleAddCategory(e));
      }

      saveData() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        localStorage.setItem('categories', JSON.stringify(this.categories));
      }

      handleAddTask(e) {
        e.preventDefault();
        
        const title = document.getElementById('taskTitle').value.trim();
        const category = document.getElementById('taskCategory').value.trim();
        const date = document.getElementById('taskDate').value;
        
        if (!title || !category || !date) {
          alert('Please fill in all required fields');
          return;
        }
        
        // Add task with default "active" status
        this.tasks.push({
          id: Date.now(),
          title,
          category,
          date,
          status: 'active',
          createdAt: new Date().toISOString()
        });
        
        // Check if category exists, if not add it
        if (!this.categories.some(c => c.name.toLowerCase() === category.toLowerCase())) {
          this.categories.push({
            name: category,
            icon: 'tag'
          });
        }
        
        // Reset form
        document.getElementById('taskForm').reset();
        
        // Update UI
        this.saveData();
        this.renderTasks();
        this.renderCategories();
      }

      handleAddCategory(e) {
        e.preventDefault();
        
        const name = document.getElementById('newCategoryName').value.trim();
        
        if (!name) {
          alert('Please enter a category name');
          return;
        }
        
        // Check if category already exists
        if (this.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
          alert('Category already exists');
          return;
        }
        
        // Add category
        this.categories.push({
          name,
          icon: 'tag'
        });
        
        // Reset form and close modal
        document.getElementById('categoryForm').reset();
        this.closeCategoryModal();
        
        // Update UI
        this.saveData();
        this.renderCategories();
      }

      deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
          this.tasks = this.tasks.filter(task => task.id !== taskId);
          this.saveData();
          this.renderTasks();
          this.renderCategories();
        }
      }

      editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Fill form with task data
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskCategory').value = task.category;
        document.getElementById('taskDate').value = task.date;
        
        // Remove the task
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveData();
        
        // Scroll to form
        document.getElementById('taskTitle').focus();
      }

      toggleTaskStatus(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Toggle between active and completed
        if (task.status === 'active') {
          task.status = 'completed';
        } else {
          task.status = 'active';
        }
        
        this.saveData();
        this.renderTasks();
      }

      filterByCategory(categoryName) {
        this.currentFilter = categoryName;
        this.renderTasks();
        this.renderCategories();
        
        // Update UI
        document.getElementById('tasksHeader').style.display = 'none';
        document.getElementById('filterHeader').style.display = 'flex';
        document.getElementById('filterTitle').textContent = `Tasks in ${categoryName}`;
      }

      clearCategoryFilter() {
        this.currentFilter = null;
        this.renderTasks();
        this.renderCategories();
        
        // Update UI
        document.getElementById('tasksHeader').style.display = 'block';
        document.getElementById('filterHeader').style.display = 'none';
      }

      renderTasks() {
        const today = new Date().toISOString().split('T')[0];
        let filteredTasks = this.tasks;
        
        // Apply date filter (show today's tasks)
        filteredTasks = filteredTasks.filter(task => task.date === today);
        
        // Apply category filter if set
        if (this.currentFilter) {
          filteredTasks = filteredTasks.filter(task => task.category === this.currentFilter);
        }
        
        // Clear task lists
        document.getElementById('activeTasks').innerHTML = '';
        document.getElementById('completedTasks').innerHTML = '';
        
        // Count tasks by status
        let activeCount = 0;
        let completedCount = 0;
        
        // Render tasks
        filteredTasks.forEach(task => {
          const taskElement = document.createElement('div');
          taskElement.className = `task-item ${task.status === 'completed' ? 'completed-task' : ''}`;
          taskElement.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.status === 'completed' ? 'checked' : ''} 
                   onclick="taskManager.toggleTaskStatus(${task.id})">
            <div class="task-header">
              <div class="task-title">${task.title}</div>
              <div class="task-actions">
                <button class="task-btn" onclick="taskManager.editTask(${task.id})">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="task-btn delete" onclick="taskManager.deleteTask(${task.id})">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div class="task-meta">
              <span class="task-category">${task.category}</span>
              <span class="task-date">
                <i class="far fa-calendar"></i> ${new Date(task.date).toLocaleDateString()}
              </span>
              <span class="status-badge ${task.status === 'completed' ? 'badge-completed' : 'badge-active'}">
                ${task.status}
              </span>
            </div>
          `;
          
          // Add to appropriate column
          if (task.status === 'active') {
            document.getElementById('activeTasks').appendChild(taskElement);
            activeCount++;
          } else {
            document.getElementById('completedTasks').appendChild(taskElement);
            completedCount++;
          }
        });
        
        // Update counts
        document.getElementById('activeCount').textContent = activeCount;
        document.getElementById('completedCount').textContent = completedCount;
        
        // Show empty states if no tasks
        if (activeCount === 0) {
          document.getElementById('activeTasks').innerHTML = '<div class="empty-state">No active tasks</div>';
        }
        if (completedCount === 0) {
          document.getElementById('completedTasks').innerHTML = '<div class="empty-state">No completed tasks</div>';
        }
      }

      renderCategories() {
        const categoryList = document.getElementById('categoryList');
        const categorySuggestions = document.getElementById('categorySuggestions');
        
        // Clear existing
        categoryList.innerHTML = '';
        categorySuggestions.innerHTML = '';
        
        // Count tasks per category
        const categoryCounts = {};
        this.tasks.forEach(task => {
          categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
        });
        
        // Render category cards
        this.categories.forEach(category => {
          // Add to category list
          const categoryCard = document.createElement('div');
          categoryCard.className = `category-card ${this.currentFilter === category.name ? 'active' : ''}`;
          categoryCard.innerHTML = `
            <div class="category-icon">
              <i class="fas fa-${category.icon}"></i>
            </div>
            <div class="category-name">${category.name}</div>
            <div class="category-count">${categoryCounts[category.name] || 0} tasks</div>
          `;
          categoryCard.addEventListener('click', () => {
            this.filterByCategory(category.name);
          });
          categoryList.appendChild(categoryCard);
          
          // Add to datalist for suggestions
          const option = document.createElement('option');
          option.value = category.name;
          categorySuggestions.appendChild(option);
        });
        
        // Render existing categories in modal
        const existingCategories = document.getElementById('existingCategories');
        existingCategories.innerHTML = '';
        this.categories.forEach(category => {
          const badge = document.createElement('div');
          badge.className = 'status-badge';
          badge.style.backgroundColor = 'var(--gray-light)';
          badge.style.color = 'var(--dark)';
          badge.innerHTML = `
            ${category.name} <i class="fas fa-times" onclick="taskManager.deleteCategory('${category.name}')"></i>
          `;
          existingCategories.appendChild(badge);
        });
      }

      deleteCategory(categoryName) {
        if (confirm(`Delete category "${categoryName}"? Tasks in this category will not be deleted.`)) {
          this.categories = this.categories.filter(c => c.name !== categoryName);
          this.saveData();
          this.renderCategories();
        }
      }

      openCategoryModal() {
        document.getElementById('categoryModal').classList.add('active');
        document.getElementById('newCategoryName').focus();
      }

      closeCategoryModal() {
        document.getElementById('categoryModal').classList.remove('active');
      }
    }

    // Initialize the application
    const taskManager = new TaskManager();

    // Global functions for HTML event handlers
    function openCategoryModal() {
      taskManager.openCategoryModal();
    }

    function closeCategoryModal() {
      taskManager.closeCategoryModal();
    }

    function clearCategoryFilter() {
      taskManager.clearCategoryFilter();
    }
  