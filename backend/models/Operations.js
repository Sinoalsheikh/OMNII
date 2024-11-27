const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  timeline: {
    startDate: Date,
    endDate: Date,
    milestones: [{
      name: String,
      dueDate: Date,
      status: String,
      deliverables: [String]
    }]
  },
  team: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    assignments: [{
      task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
      },
      startDate: Date,
      endDate: Date
    }]
  }],
  budget: {
    allocated: Number,
    spent: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  risks: [{
    description: String,
    impact: String,
    probability: String,
    mitigation: String,
    status: String
  }],
  documents: [{
    name: String,
    type: String,
    url: String,
    version: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadDate: Date
  }]
});

const taskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
    unique: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'completed'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timeline: {
    startDate: Date,
    dueDate: Date,
    completedDate: Date
  },
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: String
  }],
  progress: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastUpdated: Date
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadDate: Date
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    timestamp: Date,
    attachments: [{
      name: String,
      url: String
    }]
  }]
});

const resourceSchema = new mongoose.Schema({
  resourceId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['equipment', 'software', 'facility', 'vehicle', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'in_use', 'maintenance', 'retired'],
    default: 'available'
  },
  details: {
    manufacturer: String,
    model: String,
    serialNumber: String,
    purchaseDate: Date,
    warranty: {
      startDate: Date,
      endDate: Date,
      provider: String
    }
  },
  location: {
    building: String,
    floor: String,
    room: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  maintenance: [{
    type: String,
    date: Date,
    description: String,
    cost: Number,
    provider: String,
    nextScheduled: Date
  }],
  assignments: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startDate: Date,
    endDate: Date
  }],
  costs: {
    purchase: Number,
    maintenance: Number,
    operational: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  }
});

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['approval', 'review', 'notification', 'automation'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  steps: [{
    name: String,
    type: String,
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    actions: [{
      type: String,
      parameters: mongoose.Schema.Types.Mixed
    }],
    conditions: [{
      field: String,
      operator: String,
      value: mongoose.Schema.Types.Mixed
    }],
    timeout: {
      duration: Number,
      action: String
    }
  }],
  triggers: [{
    event: String,
    conditions: mongoose.Schema.Types.Mixed
  }],
  metrics: {
    averageCompletionTime: Number,
    successRate: Number,
    activeInstances: Number
  }
});

// Create indexes
projectSchema.index({ status: 1, 'timeline.startDate': 1, 'timeline.endDate': 1 });
taskSchema.index({ status: 1, 'timeline.dueDate': 1 });
resourceSchema.index({ type: 1, status: 1 });
workflowSchema.index({ type: 1, status: 1 });

// Create models
const Project = mongoose.model('Project', projectSchema);
const Task = mongoose.model('Task', taskSchema);
const Resource = mongoose.model('Resource', resourceSchema);
const Workflow = mongoose.model('Workflow', workflowSchema);

module.exports = {
  Project,
  Task,
  Resource,
  Workflow
};
