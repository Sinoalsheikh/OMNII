const Workflow = require('../models/Workflow');
const Agent = require('../models/Agent');
const { openai } = require('../config/openai');

class WorkflowService {
  async createWorkflow(workflowData, userId) {
    try {
      const workflow = new Workflow({
        ...workflowData,
        owner: userId
      });
      
      await workflow.save();
      return workflow;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }

  async getWorkflows(userId, filters = {}) {
    try {
      const query = { owner: userId };

      // Apply filters
      if (filters.status) query.status = filters.status;
      if (filters.category) query.category = filters.category;
      if (filters.agent) query.agents = filters.agent;

      const workflows = await Workflow.find(query)
        .populate('agents', 'name role')
        .sort({ updatedAt: -1 });

      return workflows;
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }
  }

  async getWorkflowById(workflowId, userId) {
    try {
      const workflow = await Workflow.findOne({
        _id: workflowId,
        owner: userId
      }).populate('agents', 'name role');

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      return workflow;
    } catch (error) {
      console.error('Error fetching workflow:', error);
      throw error;
    }
  }

  async updateWorkflow(workflowId, userId, updates) {
    try {
      const workflow = await Workflow.findOneAndUpdate(
        { _id: workflowId, owner: userId },
        { ...updates, version: { $inc: 1 } },
        { new: true, runValidators: true }
      ).populate('agents', 'name role');

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      return workflow;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  }

  async deleteWorkflow(workflowId, userId) {
    try {
      const workflow = await Workflow.findOneAndDelete({
        _id: workflowId,
        owner: userId
      });

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      return workflow;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  }

  async executeWorkflow(workflowId, userId, context = {}) {
    try {
      const workflow = await this.getWorkflowById(workflowId, userId);
      return await workflow.execute(context);
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  }

  async generateWorkflowSuggestions(description) {
    try {
      const prompt = `Generate a workflow suggestion based on this description: ${description}
      
      Format the response as a JSON object with the following structure:
      {
        "name": "Suggested workflow name",
        "description": "Detailed description",
        "triggers": [
          {
            "event": "event_type",
            "conditions": {}
          }
        ],
        "actions": [
          {
            "type": "action_type",
            "parameters": {}
          }
        ],
        "category": "workflow_category"
      }`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      });

      const suggestion = JSON.parse(completion.choices[0].message.content);
      return suggestion;
    } catch (error) {
      console.error('Error generating workflow suggestions:', error);
      throw error;
    }
  }

  async analyzeWorkflowPerformance(workflowId, userId, dateRange = {}) {
    try {
      const workflow = await this.getWorkflowById(workflowId, userId);
      
      const metrics = {
        executionStats: {
          total: workflow.metrics.totalExecutions,
          successful: workflow.metrics.successfulExecutions,
          failed: workflow.metrics.failedExecutions,
          successRate: workflow.metrics.totalExecutions > 0 
            ? (workflow.metrics.successfulExecutions / workflow.metrics.totalExecutions) * 100 
            : 0
        },
        timing: {
          averageExecutionTime: workflow.metrics.averageExecutionTime,
          lastExecution: workflow.metrics.lastExecutionTime
        },
        recommendations: await this.generateOptimizationRecommendations(workflow)
      };

      return metrics;
    } catch (error) {
      console.error('Error analyzing workflow performance:', error);
      throw error;
    }
  }

  async generateOptimizationRecommendations(workflow) {
    try {
      const prompt = `Analyze this workflow and suggest optimizations:
      Workflow Name: ${workflow.name}
      Category: ${workflow.category}
      Current Success Rate: ${(workflow.metrics.successfulExecutions / workflow.metrics.totalExecutions) * 100}%
      Average Execution Time: ${workflow.metrics.averageExecutionTime}ms
      
      Triggers: ${JSON.stringify(workflow.triggers)}
      Actions: ${JSON.stringify(workflow.actions)}
      
      Provide specific recommendations to improve:
      1. Reliability
      2. Performance
      3. Error handling
      4. Resource usage`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating optimization recommendations:', error);
      return 'Unable to generate optimization recommendations at this time.';
    }
  }

  async cloneWorkflow(workflowId, userId, newName) {
    try {
      const sourceWorkflow = await this.getWorkflowById(workflowId, userId);
      
      const clonedData = sourceWorkflow.toObject();
      delete clonedData._id;
      delete clonedData.createdAt;
      delete clonedData.updatedAt;
      
      clonedData.name = newName || `${sourceWorkflow.name} (Clone)`;
      clonedData.status = 'draft';
      clonedData.metrics = {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageExecutionTime: 0
      };
      clonedData.version = 1;

      return await this.createWorkflow(clonedData, userId);
    } catch (error) {
      console.error('Error cloning workflow:', error);
      throw error;
    }
  }

  async validateWorkflow(workflowData) {
    try {
      // Create a temporary workflow instance for validation
      const workflow = new Workflow(workflowData);
      await workflow.validate();

      // Additional custom validations
      const validationResults = {
        isValid: true,
        errors: [],
        warnings: []
      };

      // Check for potential infinite loops
      if (this.hasCircularDependencies(workflowData.actions)) {
        validationResults.warnings.push('Potential circular dependencies detected in actions');
      }

      // Check for resource-intensive operations
      if (this.hasResourceIntensiveOperations(workflowData.actions)) {
        validationResults.warnings.push('Workflow contains resource-intensive operations');
      }

      // Validate trigger-action compatibility
      const incompatiblePairs = this.validateTriggerActionCompatibility(
        workflowData.triggers,
        workflowData.actions
      );
      if (incompatiblePairs.length > 0) {
        validationResults.errors.push(
          `Incompatible trigger-action pairs detected: ${incompatiblePairs.join(', ')}`
        );
        validationResults.isValid = false;
      }

      return validationResults;
    } catch (error) {
      return {
        isValid: false,
        errors: [error.message],
        warnings: []
      };
    }
  }

  hasCircularDependencies(actions) {
    // Implement circular dependency detection logic
    return false;
  }

  hasResourceIntensiveOperations(actions) {
    const resourceIntensiveTypes = ['api_call', 'generate_report'];
    return actions.some(action => resourceIntensiveTypes.includes(action.type));
  }

  validateTriggerActionCompatibility(triggers, actions) {
    const incompatiblePairs = [];
    
    // Define compatibility rules
    const compatibilityRules = {
      message_received: ['send_message', 'create_task', 'notify_user'],
      schedule_time: ['generate_report', 'api_call', 'update_data'],
      customer_action: ['send_message', 'create_task', 'notify_user', 'escalate_issue']
    };

    triggers.forEach(trigger => {
      actions.forEach(action => {
        if (!compatibilityRules[trigger.event]?.includes(action.type)) {
          incompatiblePairs.push(`${trigger.event}-${action.type}`);
        }
      });
    });

    return incompatiblePairs;
  }
}

module.exports = new WorkflowService();
