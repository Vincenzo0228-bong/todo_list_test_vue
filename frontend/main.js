const API_BASE_URL = 'http://localhost:3000/api';

new Vue({
  el: '#app',
  data: {
    tasks: [],
    newTaskTitle: '',
    isLoading: false,
    isAdding: false,
    error: null,
    socket: null,
    optimisticTaskIds: new Set(),
    updatingTaskIds: new Set()
  },
  mounted() {
    // Initialize Socket
    console.log('Initializing Socket.IO connection...');
    this.socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
    
    
    // Listen for new tasks created by any client
    this.socket.on('taskCreated', (task) => {
      const existingIndex = this.tasks.findIndex(t => t._id === task._id);
      
      if (existingIndex !== -1) {
        // Task already exists - update it with server data
        this.$set(this.tasks, existingIndex, task);
      } else {
        // Check task that should be replaced
        const tempTaskIndex = this.tasks.findIndex(t => 
          t._id && typeof t._id === 'string' && t._id.startsWith('temp_')
        );
        
        if (tempTaskIndex !== -1 && this.optimisticTaskIds.has(this.tasks[tempTaskIndex]._id)) {
          const tempId = this.tasks[tempTaskIndex]._id;
          this.$set(this.tasks, tempTaskIndex, task);
          this.optimisticTaskIds.delete(tempId);
        } else {
          this.tasks.unshift(task);
        }
      }
    });

    // Listen for task updates (status changes)
    this.socket.on('taskUpdated', (task) => {
      const index = this.tasks.findIndex(t => t._id === task._id);
      if (index !== -1) {
        this.tasks.splice(index, 1, task);
        this.updatingTaskIds.delete(task._id);
      } else {
        this.tasks.unshift(task);
      }
    });

    this.fetchTasks();
  },
  methods: {
    async fetchTasks() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await axios.get(`${API_BASE_URL}/tasks`);
        this.tasks = response.data;
      } catch (error) {
        this.error = 'Failed to load tasks. Make sure the backend server is running.';
        console.error('Error fetching tasks:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async addTask() {
      // Validate input
      if (!this.newTaskTitle.trim()) {
        this.error = 'Please enter a task title';
        return;
      }

      const title = this.newTaskTitle.trim();
      this.newTaskTitle = '';
      this.error = null;

      // Optimistic UI update
      const tempId = 'temp_' + Date.now();
      const optimisticTask = {
        _id: tempId,
        title: title,
        status: 'active',
        createdAt: new Date()
      };
      
      this.tasks.unshift(optimisticTask);
      this.optimisticTaskIds.add(tempId);
      this.isAdding = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/tasks`, { title });
        const realTaskId = response.data._id;
        
        const index = this.tasks.findIndex(t => t._id === tempId);
        if (index !== -1) {
          // Check if real task already exists
          const existingRealIndex = this.tasks.findIndex(t => t._id === realTaskId);
          if (existingRealIndex !== -1 && existingRealIndex !== index) {
            this.tasks.splice(index, 1);
          } else {
            this.tasks.splice(index, 1, response.data);
          }
          this.optimisticTaskIds.delete(tempId);
        } else {
          // Temp task not found - check if real task exists
          const existingRealIndex = this.tasks.findIndex(t => t._id === realTaskId);
          if (existingRealIndex === -1) {
            this.tasks.unshift(response.data);
          }
        }
      } catch (error) {
        const index = this.tasks.findIndex(t => t._id === tempId);
        if (index !== -1) {
          this.tasks.splice(index, 1);
        }
        this.optimisticTaskIds.delete(tempId);
        this.error = error.response?.data?.error || 'Failed to add task';
        console.error('Error adding task:', error);
      } finally {
        this.isAdding = false;
      }
    },
    async toggleTaskStatus(task) {
      // Prevent multiple simultaneous updates
      if (this.updatingTaskIds.has(task._id)) {
        return;
      }

      const newStatus = task.status === 'active' ? 'completed' : 'active';
      
      // Optimistic UI update
      const originalStatus = task.status;
      task.status = newStatus;
      this.updatingTaskIds.add(task._id);

      try {
        const response = await axios.patch(`${API_BASE_URL}/tasks/${task._id}`, {
          status: newStatus
        });
        
        const index = this.tasks.findIndex(t => t._id === task._id);
        if (index !== -1) {
          this.tasks.splice(index, 1, response.data);
        }
        this.updatingTaskIds.delete(task._id);
      } catch (error) {
        task.status = originalStatus;
        this.updatingTaskIds.delete(task._id);
        this.error = error.response?.data?.error || 'Failed to update task status';
        console.error('Error updating task:', error);
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  },
  beforeDestroy() {
    // Clean up Socket.IO connection
    if (this.socket) {
      this.socket.disconnect();
    }
  }
});
