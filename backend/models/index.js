const User = require('./User');
const Agent = require('./Agent');
const HR = require('./HR');
const Finance = require('./Finance');
const Sales = require('./Sales');
const Marketing = require('./Marketing');
const Operations = require('./Operations');
const RnD = require('./RnD');
const CustomerService = require('./CustomerService');

module.exports = {
  // User Management
  User,
  
  // AI Agents
  Agent,
  
  // Department Models
  HR,
  Finance,
  Sales,
  Marketing,
  Operations,
  RnD,
  CustomerService,
  
  // Model Groups
  HRModels: {
    Employee: HR
  },
  
  FinanceModels: {
    Transaction: Finance.Transaction,
    Budget: Finance.Budget,
    Invoice: Finance.Invoice,
    Report: Finance.Report,
    Forecast: Finance.Forecast
  },
  
  SalesModels: {
    Customer: Sales.Customer,
    Opportunity: Sales.Opportunity,
    Product: Sales.Product,
    Campaign: Sales.Campaign,
    Quotation: Sales.Quotation
  },
  
  MarketingModels: {
    MarketingCampaign: Marketing.MarketingCampaign,
    Content: Marketing.Content,
    Analytics: Marketing.Analytics
  },
  
  OperationsModels: {
    Project: Operations.Project,
    Task: Operations.Task,
    Resource: Operations.Resource,
    Workflow: Operations.Workflow
  },
  
  RnDModels: {
    ResearchProject: RnD.ResearchProject,
    Innovation: RnD.Innovation,
    Experiment: RnD.Experiment,
    Publication: RnD.Publication
  },
  
  CustomerServiceModels: {
    Ticket: CustomerService.Ticket,
    KnowledgeBase: CustomerService.KnowledgeBase,
    ChatSession: CustomerService.ChatSession,
    Feedback: CustomerService.Feedback
  }
};
