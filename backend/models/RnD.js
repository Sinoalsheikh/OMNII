const mongoose = require('mongoose');

const researchProjectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['proposed', 'approved', 'in_progress', 'completed', 'cancelled'],
    default: 'proposed'
  },
  category: {
    type: String,
    enum: ['product_development', 'process_improvement', 'innovation', 'market_research'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  team: [{
    researcher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    expertise: [String],
    timeAllocation: Number
  }],
  timeline: {
    startDate: Date,
    endDate: Date,
    phases: [{
      name: String,
      description: String,
      startDate: Date,
      endDate: Date,
      status: String,
      deliverables: [String]
    }]
  },
  budget: {
    allocated: Number,
    spent: Number,
    breakdown: [{
      category: String,
      amount: Number,
      notes: String
    }],
    currency: {
      type: String,
      default: 'USD'
    }
  },
  objectives: [{
    description: String,
    metrics: [String],
    status: String,
    progress: Number
  }],
  methodology: {
    approach: String,
    tools: [String],
    dataCollection: [String],
    analysis: [String]
  },
  findings: [{
    date: Date,
    description: String,
    significance: String,
    supportingData: String,
    recommendations: [String]
  }],
  risks: [{
    description: String,
    impact: String,
    probability: String,
    mitigation: String,
    status: String
  }],
  intellectualProperty: [{
    type: String,
    title: String,
    status: String,
    filingDate: Date,
    grantDate: Date,
    jurisdiction: String,
    inventors: [String]
  }]
});

const innovationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['product', 'process', 'technology', 'business_model'],
    required: true
  },
  status: {
    type: String,
    enum: ['ideation', 'evaluation', 'development', 'testing', 'implemented'],
    default: 'ideation'
  },
  description: {
    summary: String,
    problem: String,
    solution: String,
    uniqueValue: String
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  evaluation: {
    feasibility: {
      technical: Number,
      financial: Number,
      market: Number
    },
    impact: {
      revenue: Number,
      cost: Number,
      customer: Number,
      competitive: Number
    },
    risks: [{
      description: String,
      severity: Number,
      mitigation: String
    }]
  },
  development: {
    phase: String,
    milestones: [{
      description: String,
      dueDate: Date,
      status: String
    }],
    resources: [{
      type: String,
      requirement: String,
      status: String
    }]
  },
  testing: {
    methods: [String],
    results: [{
      date: Date,
      description: String,
      outcome: String,
      metrics: mongoose.Schema.Types.Mixed
    }]
  },
  marketAnalysis: {
    targetMarket: [String],
    competitors: [{
      name: String,
      strengths: [String],
      weaknesses: [String]
    }],
    marketSize: Number,
    growthPotential: Number
  }
});

const experimentSchema = new mongoose.Schema({
  experimentId: {
    type: String,
    required: true,
    unique: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResearchProject'
  },
  title: {
    type: String,
    required: true
  },
  hypothesis: String,
  methodology: {
    design: String,
    variables: [{
      name: String,
      type: String,
      measurement: String
    }],
    controls: [String],
    procedures: [String]
  },
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    duration: Number
  },
  data: [{
    timestamp: Date,
    measurements: mongoose.Schema.Types.Mixed,
    notes: String
  }],
  results: {
    summary: String,
    analysis: String,
    conclusions: [String],
    nextSteps: [String]
  },
  resources: [{
    type: String,
    quantity: Number,
    status: String
  }]
});

const publicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  authors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    affiliation: String,
    order: Number
  }],
  abstract: String,
  keywords: [String],
  type: {
    type: String,
    enum: ['journal', 'conference', 'whitepaper', 'patent', 'report'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'accepted', 'published', 'rejected'],
    default: 'draft'
  },
  publication: {
    journal: String,
    conference: String,
    volume: String,
    issue: String,
    pages: String,
    doi: String,
    publishDate: Date
  },
  citations: [{
    paper: String,
    authors: [String],
    year: Number,
    doi: String
  }],
  metrics: {
    citations: Number,
    downloads: Number,
    views: Number
  }
});

// Create indexes
researchProjectSchema.index({ status: 1, category: 1 });
innovationSchema.index({ type: 1, status: 1 });
experimentSchema.index({ status: 1, 'schedule.startDate': 1 });
publicationSchema.index({ type: 1, status: 1, 'publication.publishDate': -1 });

// Create models
const ResearchProject = mongoose.model('ResearchProject', researchProjectSchema);
const Innovation = mongoose.model('Innovation', innovationSchema);
const Experiment = mongoose.model('Experiment', experimentSchema);
const Publication = mongoose.model('Publication', publicationSchema);

module.exports = {
  ResearchProject,
  Innovation,
  Experiment,
  Publication
};
