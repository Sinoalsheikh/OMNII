const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  personalInfo: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    address: String,
    phone: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  employmentDetails: {
    position: String,
    department: String,
    startDate: Date,
    salary: Number,
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'intern']
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  performance: {
    reviews: [{
      date: Date,
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: Number,
      comments: String,
      goals: [String]
    }],
    skills: [{
      name: String,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert']
      },
      verified: Boolean
    }]
  },
  attendance: {
    leaves: [{
      type: {
        type: String,
        enum: ['sick', 'vacation', 'personal', 'other']
      },
      startDate: Date,
      endDate: Date,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected']
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    timeEntries: [{
      date: Date,
      checkIn: Date,
      checkOut: Date,
      totalHours: Number
    }]
  },
  documents: [{
    type: {
      type: String,
      enum: ['contract', 'id', 'certificate', 'other']
    },
    name: String,
    url: String,
    uploadDate: Date,
    expiryDate: Date
  }],
  training: [{
    courseName: String,
    provider: String,
    startDate: Date,
    completionDate: Date,
    certificateUrl: String,
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'expired']
    }
  }],
  benefits: {
    healthInsurance: {
      provider: String,
      policyNumber: String,
      coverage: String,
      startDate: Date,
      endDate: Date
    },
    retirement: {
      plan: String,
      contribution: Number,
      startDate: Date
    },
    additionalBenefits: [{
      name: String,
      details: String,
      startDate: Date,
      endDate: Date
    }]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ 'personalInfo.firstName': 1, 'personalInfo.lastName': 1 });
employeeSchema.index({ 'employmentDetails.department': 1 });
employeeSchema.index({ 'attendance.leaves.status': 1 });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
