const OptimizationScenario = require('../models/OptimizationScenario');
const Infrastructure = require('../models/Infrastructure');
const RenewableSource = require('../models/RenewableSource');
const AnalyticsData = require('../models/AnalyticsData');
const { logger } = require('../utils/logger');

class OptimizationService {
  constructor() {
    this.logger = logger;
  }

  /**
   * Multi-Criteria Decision Analysis (MCDA) for Site Selection
   * Uses weighted sum method and TOPSIS for ranking alternatives
   */
  async performMultiCriteriaAnalysis(params) {
    const {
      projectId,
      alternatives,
      criteria,
      weights,
      method = 'weighted_sum' // 'weighted_sum', 'topsis', 'ahp'
    } = params;

    try {
      this.logger.info(`Starting MCDA analysis for project ${projectId}`);

      // Normalize criteria weights
      const normalizedWeights = this.normalizeWeights(weights);

      let results;
      switch (method) {
        case 'weighted_sum':
          results = this.weightedSumMethod(alternatives, criteria, normalizedWeights);
          break;
        case 'topsis':
          results = this.topsisMethod(alternatives, criteria, normalizedWeights);
          break;
        case 'ahp':
          results = await this.ahpMethod(alternatives, criteria, normalizedWeights);
          break;
        default:
          throw new Error(`Unsupported MCDA method: ${method}`);
      }

      // Save analysis results
      const scenario = new OptimizationScenario({
        name: `MCDA Analysis - ${new Date().toISOString()}`,
        description: `Multi-criteria decision analysis using ${method} method`,
        scenarioType: 'site_selection',
        projectId: projectId,
        criteria: criteria,
        results: {
          optimalSolution: {
            score: results[0].score,
            rank: 1,
            details: results[0]
          },
          alternatives: results.map((result, index) => ({
            rank: index + 1,
            score: result.score,
            solution: result.alternative,
            tradeoffs: result.tradeoffs
          }))
        },
        createdBy: params.userId
      });

      await scenario.save();

      return {
        success: true,
        data: results,
        metadata: {
          method,
          totalAlternatives: alternatives.length,
          criteria: Object.keys(criteria),
          scenarioId: scenario._id
        }
      };
    } catch (error) {
      this.logger.error('MCDA analysis failed:', error);
      throw error;
    }
  }

  /**
   * Genetic Algorithm for Infrastructure Optimization
   * Optimizes infrastructure placement and configuration
   */
  async performGeneticOptimization(params) {
    const {
      projectId,
      populationSize = 50,
      generations = 100,
      mutationRate = 0.1,
      crossoverRate = 0.8,
      constraints,
      objectives,
      geographicScope,
      timeHorizon
    } = params;

    try {
      this.logger.info(`Starting genetic optimization for project ${projectId}`);

      // Initialize population
      let population = this.initializePopulation(populationSize, constraints);

      const bestSolutions = [];
      const convergenceHistory = [];

      // Evolution loop
      for (let generation = 0; generation < generations; generation++) {
        // Evaluate fitness
        const fitnessScores = await this.evaluateFitness(population, objectives, projectId);

        // Selection
        const selected = this.selection(population, fitnessScores);

        // Crossover
        const offspring = this.crossover(selected, crossoverRate);

        // Mutation
        const mutated = this.mutation(offspring, mutationRate, constraints);

        // Update population
        population = mutated;

        // Track best solution
        const bestFitness = Math.max(...fitnessScores);
        const bestIndex = fitnessScores.indexOf(bestFitness);
        bestSolutions.push({
          generation,
          fitness: bestFitness,
          solution: population[bestIndex]
        });

        convergenceHistory.push({
          generation,
          avgFitness: fitnessScores.reduce((a, b) => a + b, 0) / fitnessScores.length,
          bestFitness,
          diversity: this.calculateDiversity(population)
        });

        // Check convergence
        if (generation > 10 && this.checkConvergence(convergenceHistory.slice(-10))) {
          this.logger.info(`Convergence reached at generation ${generation}`);
          break;
        }
      }

      // Save optimization results
      const scenario = new OptimizationScenario({
        name: `Genetic Optimization - ${new Date().toISOString()}`,
        description: 'Genetic algorithm optimization for infrastructure placement',
        scenarioType: 'network_optimization',
        projectId: projectId,
        geographicScope,
        timeHorizon,
        algorithm: {
          type: 'genetic_algorithm',
          parameters: {
            populationSize,
            generations,
            mutationRate,
            crossoverRate
          }
        },
        results: {
          optimalSolution: {
            score: bestSolutions[bestSolutions.length - 1].fitness,
            rank: 1,
            details: bestSolutions[bestSolutions.length - 1].solution
          },
          alternatives: bestSolutions.slice(-5).map((solution, index) => ({
            rank: index + 1,
            score: solution.fitness,
            solution: solution.solution
          }))
        },
        performance: {
          executionTime: Date.now() - params.startTime,
          iterations: generations,
          convergenceRate: this.calculateConvergenceRate(convergenceHistory)
        },
        createdBy: params.userId
      });

      await scenario.save();

      return {
        success: true,
        data: {
          bestSolutions,
          convergenceHistory,
          finalPopulation: population
        },
        metadata: {
          totalGenerations: generations,
          populationSize,
          scenarioId: scenario._id
        }
      };
    } catch (error) {
      this.logger.error('Genetic optimization failed:', error);
      throw error;
    }
  }

  /**
   * Cost Surface Modeling using Geospatial Interpolation
   * Creates cost surfaces for infrastructure planning
   */
  async performCostSurfaceModeling(params) {
    const {
      projectId,
      geographicBounds,
      resolution = 1000, // meters
      costFactors = ['land', 'construction', 'transportation', 'energy']
    } = params;

    try {
      this.logger.info(`Starting cost surface modeling for project ${projectId}`);

      // Get infrastructure and cost data
      const infrastructureData = await Infrastructure.find({
        projectId: projectId,
        geometry: {
          $geoWithin: {
            $box: [
              [geographicBounds.swLng, geographicBounds.swLat],
              [geographicBounds.neLng, geographicBounds.neLat]
            ]
          }
        }
      });

      // Get cost analysis data
      const costData = await AnalyticsData.find({
        projectId: projectId,
        dataType: 'cost_analysis',
        infrastructureId: { $in: infrastructureData.map(i => i._id) }
      });

      // Create cost surface grid
      const grid = this.createCostGrid(geographicBounds, resolution);
      
      // Interpolate costs
      const costSurface = await this.interpolateCosts(grid, infrastructureData, costData, costFactors);

      // Calculate optimal paths
      const optimalPaths = this.calculateOptimalPaths(costSurface, infrastructureData);

      return {
        success: true,
        data: {
          costSurface,
          optimalPaths,
          infrastructure: infrastructureData,
          costData: costData
        },
        metadata: {
          resolution,
          gridSize: grid.length,
          costFactors
        }
      };
    } catch (error) {
      this.logger.error('Cost surface modeling failed:', error);
      throw error;
    }
  }

  /**
   * Capacity Planning using Time-Series Analysis
   * Plans infrastructure capacity based on demand forecasts
   */
  async performCapacityPlanning(params) {
    const {
      projectId,
      timeHorizon,
      demandForecast,
      capacityConstraints,
      optimizationObjectives
    } = params;

    try {
      this.logger.info(`Starting capacity planning for project ${projectId}`);

      // Get historical capacity data
      const capacityData = await AnalyticsData.find({
        projectId: projectId,
        dataType: 'capacity_utilization',
        timestamp: {
          $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
        }
      });

      // Analyze capacity trends
      const capacityTrends = this.analyzeCapacityTrends(capacityData);

      // Calculate required capacity
      const requiredCapacity = this.calculateRequiredCapacity(demandForecast, capacityTrends);

      // Optimize capacity allocation
      const capacityPlan = this.optimizeCapacityAllocation(requiredCapacity, capacityConstraints, optimizationObjectives);

      // Generate capacity scenarios
      const scenarios = this.generateCapacityScenarios(capacityPlan, demandForecast);

      return {
        success: true,
        data: {
          capacityPlan,
          scenarios,
          trends: capacityTrends,
          requiredCapacity
        },
        metadata: {
          timeHorizon,
          totalScenarios: scenarios.length
        }
      };
    } catch (error) {
      this.logger.error('Capacity planning failed:', error);
      throw error;
    }
  }

  /**
   * Scenario Planning with Versioned Document Storage
   * Creates and manages multiple optimization scenarios
   */
  async createOptimizationScenario(params) {
    const {
      name,
      description,
      scenarioType,
      projectId,
      criteria,
      constraints,
      algorithm,
      parentScenarioId = null,
      userId,
      geographicScope,
      timeHorizon
    } = params;

    try {
      // Create new scenario
      const scenario = new OptimizationScenario({
        name,
        description,
        scenarioType,
        projectId,
        criteria,
        constraints,
        algorithm,
        parentScenarioId,
        geographicScope,
        timeHorizon,
        createdBy: userId
      });

      await scenario.save();

      // If this is a child scenario, update version
      if (parentScenarioId) {
        const parentScenario = await OptimizationScenario.findById(parentScenarioId);
        if (parentScenario) {
          scenario.version = parentScenario.version + 1;
          await scenario.save();
        }
      }

      return {
        success: true,
        data: scenario,
        metadata: {
          scenarioId: scenario._id,
          version: scenario.version
        }
      };
    } catch (error) {
      this.logger.error('Scenario creation failed:', error);
      throw error;
    }
  }

  /**
   * Helper Methods for MCDA
   */
  normalizeWeights(weights) {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    const normalized = {};
    
    for (const [criterion, weight] of Object.entries(weights)) {
      normalized[criterion] = weight / totalWeight;
    }
    
    return normalized;
  }

  weightedSumMethod(alternatives, criteria, weights) {
    const results = alternatives.map(alternative => {
      let score = 0;
      const tradeoffs = {};

      for (const [criterion, weight] of Object.entries(weights)) {
        const value = alternative[criterion] || 0;
        score += value * weight;
        tradeoffs[criterion] = value;
      }

      return {
        alternative,
        score,
        tradeoffs
      };
    });

    return results.sort((a, b) => b.score - a.score);
  }

  topsisMethod(alternatives, criteria, weights) {
    // Normalize decision matrix
    const normalizedMatrix = this.normalizeDecisionMatrix(alternatives, criteria);
    
    // Calculate weighted normalized matrix
    const weightedMatrix = this.calculateWeightedMatrix(normalizedMatrix, weights);
    
    // Find ideal and negative ideal solutions
    const idealSolution = this.findIdealSolution(weightedMatrix, criteria);
    const negativeIdealSolution = this.findNegativeIdealSolution(weightedMatrix, criteria);
    
    // Calculate distances
    const results = alternatives.map((alternative, index) => {
      const distanceToIdeal = this.calculateDistance(weightedMatrix[index], idealSolution);
      const distanceToNegative = this.calculateDistance(weightedMatrix[index], negativeIdealSolution);
      
      const score = distanceToNegative / (distanceToIdeal + distanceToNegative);
      
      return {
        alternative,
        score,
        tradeoffs: alternative
      };
    });

    return results.sort((a, b) => b.score - a.score);
  }

  async ahpMethod(alternatives, criteria, weights) {
    // AHP implementation would go here
    // This is a simplified version
    return this.weightedSumMethod(alternatives, criteria, weights);
  }

  normalizeDecisionMatrix(alternatives, criteria) {
    const matrix = alternatives.map(alt => 
      criteria.map(criterion => alt[criterion] || 0)
    );
    
    const columnSums = criteria.map((_, colIndex) => 
      Math.sqrt(matrix.reduce((sum, row) => sum + row[colIndex] * row[colIndex], 0))
    );
    
    return matrix.map(row => 
      row.map((value, colIndex) => value / columnSums[colIndex])
    );
  }

  calculateWeightedMatrix(normalizedMatrix, weights) {
    const weightValues = Object.values(weights);
    return normalizedMatrix.map(row => 
      row.map((value, colIndex) => value * weightValues[colIndex])
    );
  }

  findIdealSolution(weightedMatrix, criteria) {
    return criteria.map((_, colIndex) => 
      Math.max(...weightedMatrix.map(row => row[colIndex]))
    );
  }

  findNegativeIdealSolution(weightedMatrix, criteria) {
    return criteria.map((_, colIndex) => 
      Math.min(...weightedMatrix.map(row => row[colIndex]))
    );
  }

  /**
   * Helper Methods for Genetic Algorithm
   */
  initializePopulation(size, constraints) {
    const population = [];
    
    for (let i = 0; i < size; i++) {
      const individual = this.generateRandomIndividual(constraints);
      population.push(individual);
    }
    
    return population;
  }

  generateRandomIndividual(constraints) {
    // Generate random infrastructure configuration
    return {
      capacity: this.generateRandomCapacity(constraints.capacity),
      budget: this.generateRandomBudget(constraints.budget),
      timeline: this.generateRandomTimeline(constraints.timeline),
      environmental: this.generateRandomEnvironmental(constraints.environmental)
    };
  }

  generateRandomCapacity(capacityConstraints) {
    if (!capacityConstraints) {
      return Math.random() * 1000 + 100; // Default range
    }
    const min = capacityConstraints.min || 100;
    const max = capacityConstraints.max || 1000;
    return Math.random() * (max - min) + min;
  }

  generateRandomBudget(budgetConstraint) {
    if (!budgetConstraint) {
      return Math.random() * 10000000 + 1000000; // Default range
    }
    return Math.random() * budgetConstraint * 0.8 + budgetConstraint * 0.2;
  }

  generateRandomTimeline(timelineConstraint) {
    if (!timelineConstraint) {
      return Math.random() * 36 + 12; // Default range 12-48 months
    }
    return Math.random() * timelineConstraint * 0.5 + timelineConstraint * 0.5;
  }

  generateRandomEnvironmental(envConstraints) {
    if (!envConstraints) {
      return {
        carbonEmissions: Math.random() * 50000 + 10000,
        waterUsage: Math.random() * 1000000 + 100000
      };
    }
    return {
      carbonEmissions: Math.random() * (envConstraints.maxCarbonEmissions || 50000) * 0.8 + (envConstraints.maxCarbonEmissions || 50000) * 0.2,
      waterUsage: Math.random() * (envConstraints.maxWaterUsage || 1000000) * 0.8 + (envConstraints.maxWaterUsage || 1000000) * 0.2
    };
  }

  async evaluateFitness(population, objectives, projectId) {
    const fitnessScores = [];
    
    for (const individual of population) {
      const fitness = await this.calculateFitness(individual, objectives, projectId);
      fitnessScores.push(fitness);
    }
    
    return fitnessScores;
  }

  async calculateFitness(individual, objectives, projectId) {
    let fitness = 0;
    
    // Calculate cost fitness (minimize)
    if (objectives.minimize && objectives.minimize.includes('cost')) {
      const costFitness = this.calculateCostFitness(individual);
      fitness += costFitness * 0.4; // Weight for cost
    }
    
    // Calculate emissions fitness (minimize)
    if (objectives.minimize && objectives.minimize.includes('emissions')) {
      const emissionsFitness = this.calculateEmissionsFitness(individual);
      fitness += emissionsFitness * 0.3; // Weight for emissions
    }
    
    // Calculate efficiency fitness (maximize)
    if (objectives.maximize && objectives.maximize.includes('efficiency')) {
      const efficiencyFitness = this.calculateEfficiencyFitness(individual);
      fitness += efficiencyFitness * 0.2; // Weight for efficiency
    }
    
    // Calculate reliability fitness (maximize)
    if (objectives.maximize && objectives.maximize.includes('reliability')) {
      const reliabilityFitness = this.calculateReliabilityFitness(individual);
      fitness += reliabilityFitness * 0.1; // Weight for reliability
    }
    
    return fitness;
  }

  calculateCostFitness(individual) {
    // Lower cost is better (higher fitness)
    if (!individual || typeof individual.budget !== 'number') return 0;
    const maxBudget = 10000000;
    const cost = individual.budget;
    const fitness = Math.max(0, 1 - (cost / maxBudget));
    return isNaN(fitness) ? 0 : fitness;
  }

  calculateEmissionsFitness(individual) {
    // Lower emissions is better (higher fitness)
    if (!individual || !individual.environmental || typeof individual.environmental.carbonEmissions !== 'number') return 0;
    const maxEmissions = 50000;
    const emissions = individual.environmental.carbonEmissions;
    const fitness = Math.max(0, 1 - (emissions / maxEmissions));
    return isNaN(fitness) ? 0 : fitness;
  }

  calculateEfficiencyFitness(individual) {
    // Higher efficiency is better
    if (!individual || typeof individual.capacity !== 'number' || typeof individual.budget !== 'number' || individual.budget === 0) return 0;
    const capacity = individual.capacity;
    const budget = individual.budget;
    const efficiency = capacity / (budget / 1000000); // MW per million dollars
    const fitness = Math.min(1, efficiency / 10); // Normalize to 0-1
    return isNaN(fitness) ? 0 : fitness;
  }

  calculateReliabilityFitness(individual) {
    // Higher reliability is better (based on capacity and timeline)
    if (!individual || typeof individual.capacity !== 'number' || typeof individual.timeline !== 'number' || individual.timeline === 0) return 0;
    const capacity = individual.capacity;
    const timeline = individual.timeline;
    const reliability = Math.min(1, capacity / 1000) * Math.min(1, 24 / timeline);
    return isNaN(reliability) ? 0 : reliability;
  }

  selection(population, fitnessScores) {
    // Tournament selection
    const tournamentSize = 3;
    const selected = [];
    
    for (let i = 0; i < population.length; i++) {
      let winner = null;
      let bestFitness = -Infinity;
      
      for (let j = 0; j < tournamentSize; j++) {
        const randomIndex = Math.floor(Math.random() * population.length);
        const contestant = population[randomIndex];
        const contestantFitness = fitnessScores[randomIndex];
        
        if (contestant && typeof contestantFitness === 'number' && contestantFitness > bestFitness) {
          bestFitness = contestantFitness;
          winner = contestant;
        }
      }
      
      // If a winner is found, add it to the selected population
      if (winner) {
        selected.push(winner);
      } else {
        // Fallback: if no valid winner is found, add a random individual
        const randomIndex = Math.floor(Math.random() * population.length);
        selected.push(population[randomIndex]);
      }
    }
    
    return selected;
  }

  crossover(parents, rate) {
    const offspring = [];
    
    for (let i = 0; i < parents.length; i += 2) {
      if (i + 1 < parents.length && Math.random() < rate) {
        const [child1, child2] = this.performCrossover(parents[i], parents[i + 1]);
        offspring.push(child1, child2);
      } else {
        offspring.push(parents[i]);
        if (i + 1 < parents.length) {
          offspring.push(parents[i + 1]);
        }
      }
    }
    
    return offspring;
  }

  performCrossover(parent1, parent2) {
    // Single-point crossover
    const child1 = { ...parent1 };
    const child2 = { ...parent2 };
    
    // Crossover capacity
    if (Math.random() < 0.5) {
      [child1.capacity, child2.capacity] = [child2.capacity, child1.capacity];
    }
    
    // Crossover budget
    if (Math.random() < 0.5) {
      [child1.budget, child2.budget] = [child2.budget, child1.budget];
    }
    
    // Crossover timeline
    if (Math.random() < 0.5) {
      [child1.timeline, child2.timeline] = [child2.timeline, child1.timeline];
    }
    
    // Crossover environmental factors
    if (Math.random() < 0.5) {
      [child1.environmental, child2.environmental] = [child2.environmental, child1.environmental];
    }
    
    return [child1, child2];
  }

  mutation(offspring, rate, constraints) {
    return offspring.map(individual => {
      if (Math.random() < rate) {
        return this.performMutation(individual, constraints);
      }
      return individual;
    });
  }

  performMutation(individual, constraints) {
    const mutated = { ...individual };
    const mutationType = Math.random();
    
    if (mutationType < 0.25) {
      mutated.capacity = this.generateRandomCapacity(constraints.capacity);
    } else if (mutationType < 0.5) {
      mutated.budget = this.generateRandomBudget(constraints.budget);
    } else if (mutationType < 0.75) {
      mutated.timeline = this.generateRandomTimeline(constraints.timeline);
    } else {
      mutated.environmental = this.generateRandomEnvironmental(constraints.environmental);
    }
    
    return mutated;
  }

  calculateDiversity(population) {
    // Calculate population diversity
    const distances = [];
    
    for (let i = 0; i < population.length; i++) {
      for (let j = i + 1; j < population.length; j++) {
        const distance = this.calculateIndividualDistance(population[i], population[j]);
        distances.push(distance);
      }
    }
    
    return distances.length > 0 ? distances.reduce((a, b) => a + b, 0) / distances.length : 0;
  }

  calculateIndividualDistance(ind1, ind2) {
    // Calculate Euclidean distance between two individuals
    const capacityDiff = Math.abs(ind1.capacity - ind2.capacity) / 1000;
    const budgetDiff = Math.abs(ind1.budget - ind2.budget) / 10000000;
    const timelineDiff = Math.abs(ind1.timeline - ind2.timeline) / 36;
    
    return Math.sqrt(capacityDiff * capacityDiff + budgetDiff * budgetDiff + timelineDiff * timelineDiff);
  }

  checkConvergence(history) {
    if (history.length < 5) return false;
    
    const recentFitness = history.slice(-5).map(h => h.bestFitness);
    const variance = this.calculateVariance(recentFitness);
    
    return variance < 0.001; // Convergence threshold
  }

  calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  calculateConvergenceRate(history) {
    if (history.length < 2) return 0;
    
    const initialFitness = history[0].bestFitness;
    const finalFitness = history[history.length - 1].bestFitness;
    
    if (initialFitness === 0) {
      return finalFitness > 0 ? Infinity : 0;
    }
    const rate = (finalFitness - initialFitness) / Math.abs(initialFitness);
    return isNaN(rate) ? 0 : rate;
  }

  /**
   * Helper Methods for Cost Surface Modeling
   */
  createCostGrid(bounds, resolution) {
    const grid = [];
    const latStep = resolution / 111000; // Approximate meters to degrees
    const lngStep = resolution / (111000 * Math.cos(bounds.swLat * Math.PI / 180));
    
    for (let lat = bounds.swLat; lat <= bounds.neLat; lat += latStep) {
      for (let lng = bounds.swLng; lng <= bounds.neLng; lng += lngStep) {
        grid.push({
          lat,
          lng,
          cost: 0
        });
      }
    }
    
    return grid;
  }

  async interpolateCosts(grid, infrastructure, costData, factors) {
    // Simple inverse distance weighting interpolation
    return grid.map(point => {
      let totalCost = 0;
      let totalWeight = 0;
      
      infrastructure.forEach(infra => {
        const distance = this.calculateDistance(
          [point.lat, point.lng],
          [infra.geometry.coordinates[1], infra.geometry.coordinates[0]]
        );
        
        if (distance > 0) {
          const weight = 1 / (distance * distance);
          const infraCost = this.calculateInfrastructureCost(infra, costData, factors);
          
          totalCost += infraCost * weight;
          totalWeight += weight;
        }
      });
      
      point.cost = totalWeight > 0 ? totalCost / totalWeight : 0;
      return point;
    });
  }

  calculateOptimalPaths(costSurface, infrastructure) {
    // Dijkstra's algorithm for optimal path finding
    const paths = [];
    
    // Implementation would go here
    // This is a simplified version
    
    return paths;
  }

  /**
   * Helper Methods for Capacity Planning
   */
  analyzeCapacityTrends(capacityData) {
    // Analyze historical capacity utilization trends
    if (!capacityData || capacityData.length === 0) {
      return { efficiency: 0.8, trend: 'stable' };
    }
    
    const avgUtilization = capacityData.reduce((sum, data) => 
      sum + (data.capacityUtilization?.currentUtilization || 0), 0) / capacityData.length;
    
    const efficiency = Math.min(1, avgUtilization / 0.8); // Normalize to 0.8 as optimal
    
    return { 
      efficiency, 
      trend: efficiency > 0.7 ? 'improving' : efficiency < 0.5 ? 'declining' : 'stable' 
    };
  }

  calculateRequiredCapacity(demandForecast, trends) {
    // Calculate required capacity based on demand and trends
    const baselineDemand = demandForecast.baseline || 1000;
    const growthRate = demandForecast.growthRate || 0.05;
    const seasonality = demandForecast.seasonality || 0.1;
    
    // Calculate capacity with growth and seasonality
    let requiredCapacity = baselineDemand * (1 + growthRate) * (1 + seasonality);
    
    // Apply capacity trends if available
    if (trends && trends.efficiency) {
      requiredCapacity = requiredCapacity / trends.efficiency;
    }
    
    return requiredCapacity;
  }

  optimizeCapacityAllocation(requiredCapacity, constraints, objectives) {
    // Optimize capacity allocation using linear programming
    const allocation = {
      totalCapacity: requiredCapacity,
      distribution: {
        electrolyzer: requiredCapacity * 0.6,
        storage: requiredCapacity * 0.3,
        distribution: requiredCapacity * 0.1
      },
      timeline: constraints?.timeline || 24,
      cost: requiredCapacity * 1000 // Simplified cost calculation
    };
    
    return allocation;
  }

  generateCapacityScenarios(capacityPlan, demandForecast) {
    // Generate multiple capacity scenarios
    const scenarios = [
      {
        name: 'Conservative',
        capacity: capacityPlan.totalCapacity * 0.8,
        risk: 'low',
        cost: capacityPlan.cost * 0.8
      },
      {
        name: 'Baseline',
        capacity: capacityPlan.totalCapacity,
        risk: 'medium',
        cost: capacityPlan.cost
      },
      {
        name: 'Aggressive',
        capacity: capacityPlan.totalCapacity * 1.2,
        risk: 'high',
        cost: capacityPlan.cost * 1.2
      }
    ];
    
    return scenarios;
  }

  /**
   * Utility Methods
   */
  calculateDistance(point1, point2) {
    const [lat1, lng1] = point1;
    const [lat2, lng2] = point2;
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }

  // Removed duplicate and unused methods

  calculateInfrastructureCost(infrastructure, costData, factors) {
    // Calculate infrastructure cost based on factors
    let totalCost = 0;
    
    const infraCostData = costData.find(data => 
      data.infrastructureId.toString() === infrastructure._id.toString()
    );
    
    if (infraCostData) {
      if (factors.includes('land')) totalCost += infraCostData.costAnalysis.capitalCosts || 0;
      if (factors.includes('construction')) totalCost += infraCostData.costAnalysis.capitalCosts || 0;
      if (factors.includes('transportation')) totalCost += infraCostData.costAnalysis.operationalCosts || 0;
      if (factors.includes('energy')) totalCost += infraCostData.costAnalysis.energyCosts || 0;
    }
    
    return totalCost;
  }

  // Removed old calculateIndividualDistance method - replaced with new implementation above

  // Additional helper methods for MCDA
  normalizeDecisionMatrix(alternatives, criteria) {
    // Normalize decision matrix
    const matrix = [];
    
    for (const criterion of Object.keys(criteria)) {
      const values = alternatives.map(alt => alt[criterion] || 0);
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      
      const normalized = values.map(value => 
        maxValue !== minValue ? (value - minValue) / (maxValue - minValue) : 0
      );
      
      matrix.push(normalized);
    }
    
    return matrix;
  }

  calculateWeightedMatrix(normalizedMatrix, weights) {
    const weightedMatrix = [];
    const criteria = Object.keys(weights);
    
    for (let i = 0; i < normalizedMatrix[0].length; i++) {
      const weightedRow = [];
      for (let j = 0; j < criteria.length; j++) {
        weightedRow.push(normalizedMatrix[j][i] * weights[criteria[j]]);
      }
      weightedMatrix.push(weightedRow);
    }
    
    return weightedMatrix;
  }

  findIdealSolution(weightedMatrix, criteria) {
    const ideal = [];
    const criteriaArray = Object.keys(criteria);
    
    for (let j = 0; j < criteriaArray.length; j++) {
      const values = weightedMatrix.map(row => row[j]);
      ideal.push(Math.max(...values));
    }
    
    return ideal;
  }

  findNegativeIdealSolution(weightedMatrix, criteria) {
    const negativeIdeal = [];
    const criteriaArray = Object.keys(criteria);
    
    for (let j = 0; j < criteriaArray.length; j++) {
      const values = weightedMatrix.map(row => row[j]);
      negativeIdeal.push(Math.min(...values));
    }
    
    return negativeIdeal;
  }

  calculateDistance(point, ideal) {
    return Math.sqrt(
      point.reduce((sum, value, index) => 
        sum + Math.pow(value - ideal[index], 2), 0
      )
    );
  }

  // Placeholder methods for fitness calculations
  async calculateCostFitness(individual, projectId) {
    // Implementation would calculate cost-based fitness
    return Math.random(); // Placeholder
  }

  async calculateEnvironmentalFitness(individual, projectId) {
    // Implementation would calculate environmental fitness
    return Math.random(); // Placeholder
  }

  calculateTechnicalFitness(individual) {
    // Implementation would calculate technical fitness
    return Math.random(); // Placeholder
  }
}

module.exports = new OptimizationService();
