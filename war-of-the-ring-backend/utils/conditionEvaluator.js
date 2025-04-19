/**
 * Condition Evaluator for War of the Ring
 * Provides advanced condition evaluation with support for complex logical operations,
 * array operations, and mathematical expressions
 */

const { getValueAtPath } = require('./stateTransaction');
const { mapToObject } = require('./stateUtils');

/**
 * Evaluate a condition against a game state
 * @param {Object} condition - Condition to evaluate
 * @param {Object} gameState - Game state to evaluate against
 * @param {Object} context - Additional context for variable substitution
 * @returns {Boolean} - Whether the condition is met
 */
function evaluateCondition(condition, gameState, context = {}) {
  // Handle null or undefined condition
  if (condition === null || condition === undefined) {
    return true;
  }
  
  // Convert gameState Maps to Objects for easier access
  const state = mapToObject(gameState);
  
  // Handle different condition types
  if (typeof condition === 'boolean') {
    return condition;
  } else if (typeof condition === 'object') {
    return evaluateObjectCondition(condition, state, context);
  } else {
    // For primitive values, return truthiness
    return !!condition;
  }
}

/**
 * Evaluate an object condition
 * @param {Object} condition - Condition object to evaluate
 * @param {Object} state - Game state to evaluate against
 * @param {Object} context - Additional context for variable substitution
 * @returns {Boolean} - Whether the condition is met
 */
function evaluateObjectCondition(condition, state, context) {
  // Handle logical operators
  if ('$and' in condition) {
    return evaluateAndCondition(condition.$and, state, context);
  } else if ('$or' in condition) {
    return evaluateOrCondition(condition.$or, state, context);
  } else if ('$not' in condition) {
    return !evaluateCondition(condition.$not, state, context);
  } else if ('$xor' in condition) {
    return evaluateXorCondition(condition.$xor, state, context);
  }
  
  // Handle array operators
  if ('$contains' in condition) {
    return evaluateContainsCondition(condition.$contains, state, context);
  } else if ('$containsAll' in condition) {
    return evaluateContainsAllCondition(condition.$containsAll, state, context);
  } else if ('$containsAny' in condition) {
    return evaluateContainsAnyCondition(condition.$containsAny, state, context);
  } else if ('$size' in condition) {
    return evaluateArraySizeCondition(condition, state, context);
  }
  
  // Handle comparison operators
  if ('$eq' in condition) {
    return evaluateEqualityCondition(condition, state, context);
  } else if ('$ne' in condition) {
    return evaluateInequalityCondition(condition, state, context);
  } else if ('$gt' in condition || '$gte' in condition || '$lt' in condition || '$lte' in condition) {
    return evaluateComparisonCondition(condition, state, context);
  }
  
  // Handle mathematical expressions
  if ('$calc' in condition) {
    return evaluateMathExpression(condition.$calc, state, context);
  }
  
  // Handle property conditions (default case)
  return evaluatePropertyConditions(condition, state, context);
}

/**
 * Evaluate an $and condition
 * @param {Array} conditions - Array of conditions to AND together
 * @param {Object} state - Game state to evaluate against
 * @param {Object} context - Additional context for variable substitution
 * @returns {Boolean} - Whether all conditions are met
 */
function evaluateAndCondition(conditions, state, context) {
  if (!Array.isArray(conditions)) {
    return false;
  }
  
  return conditions.every(condition => evaluateCondition(condition, state, context));
}

/**
 * Evaluate an $or condition
 * @param {Array} conditions - Array of conditions to OR together
 * @param {Object} state - Game state to evaluate against
 * @param {Object} context - Additional context for variable substitution
 * @returns {Boolean} - Whether any condition is met
 */
function evaluateOrCondition(conditions, state, context) {
  if (!Array.isArray(conditions)) {
    return false;
  }
  
  return conditions.some(condition => evaluateCondition(condition, state, context));
}

/**
 * Evaluate an $xor condition
 * @param {Array} conditions - Array of conditions to XOR together
 * @param {Object} state - Game state to evaluate against
 * @param {Object} context - Additional context for variable substitution
 * @returns {Boolean} - Whether exactly one condition is met
 */
function evaluateXorCondition(conditions, state, context) {
  if (!Array.isArray(conditions)) {
    return false;
  }
  
  let trueCount = 0;
  for (const condition of conditions) {
    if (evaluateCondition(condition, state, context)) {
      trueCount++;
    }
    if (trueCount > 1) {
      return false;
    }
  }
  
  return trueCount === 1;
}

/**
 * Evaluate a $contains condition
 * @param {Object} condition - Contains condition
 * @param {Object} state - Game state to evaluate against
 * @param {Object} context - Additional context for variable substitution
 * @returns {Boolean} - Whether the array contains an item matching the condition
 */
function evaluateContainsCondition(condition, state, context) {
  const { path, value } = condition;
  
  // Get the array from the state
  const array = getValueAtPath(state, path);
  
  if (!Array.isArray(array)) {
    return false;
  }
  
  // Check if the array contains the value
  return array.some(item => {
    if (typeof value === 'object' && value !== null) {
      // If value is an object, check if any item matches all properties
      return Object.entries(value).every(([key, val]) => {
        const substitutedVal = substituteVariables(val, context);
        return item[key] === substitutedVal;
      });
    } else {
      // Otherwise, check for direct equality
      const substitutedValue = substituteVariables(value, context);
      return item === substitutedValue;
    }
  });
}

/**
 * Evaluate a $containsAll condition
 * @param {Object} condition - ContainsAll condition
 * @param {Object} state - Game state to evaluate against
 * @param {Object} context - Additional context for variable substitution
 * @returns {Boolean} - Whether the array contains all items matching the condition
 */
function evaluateContainsAllCondition(condition, state, context) {
  const { path, values } = condition;
  
  // Get the array from the state
  const array = getValueAtPath(state, path);
  
  if (!Array.isArray(array) || !Array.isArray(values)) {
    return false;
  }
  
  // Check if the array contains all values
  return values.every(value => {
    const substitutedValue = substituteVariables(value, context);
    
    return array.some(item => {
      if (typeof substitutedValue === 'object' && substitutedValue !== null) {
        // If value is an object, check if any item matches all properties
        return Object.entries(substitutedValue).every(([key, val]) => {
          return item[key] === val;
        });
      } else {
        // Otherwise, check for direct equality
        return item === substitutedValue;
      }
    });
  });
}

/**
 * Evaluate a $containsAny condition
 * @param {Object} condition - ContainsAny condition
 * @param {Object} state - Game state to evaluate against
 * @param {Object} context - Additional context for variable substitution
 * @returns {Boolean} - Whether the array contains any item matching the condition
 */
function evaluateContainsAnyCondition(condition, state, context) {
  const { path, values } = condition;
  
  // Get the array from the state
  const array = getValueAtPath(state, path);
  
  if (!Array.isArray(array) || !Array.isArray(values)) {
    return false;
  }
  
  // Check if the array contains any of the values
  return values.some(value => {
    const substitutedValue = substituteVariables(value, context);
    
    return array.some(item => {
      if (typeof substitutedValue === 'object' && substitutedValue !== null) {
        // If value is an object, check if any item matches all properties
        return Object.entries(substitutedValue).every(([key, val]) => {
          return item[key] === val;
        });
      } else {
        // Otherwise, check for direct equality
        return item === substitutedValue;
      }
    });
  });
}

/**
 * Evaluate an array size condition
 * @param {Object} condition - Size condition
 * @param {Object} state - Game state to evaluate against
 * @param {Object} context - Additional context for variable substitution
 * @returns {Boolean} - Whether the array size meets the condition
 */
function evaluateArraySizeCondition(condition, state, context) {
  const { path, $size } = condition;
  
  // Get the array from the state
  const array = getValueAtPath(state, path);
  
  if (!Array.isArray(array)) {
    return false;
  }
  
  // If $size is a number, check for exact size
  if (typeof $size === 'number') {
    return array.length === $size;
  }
  
  // If $size is an object, check for comparison
  if (typeof $size === 'object' && $size !== null) {
    if ('$eq' in $size) {
      return array.length === substituteVariables($size.$eq, context);
    } else if ('$ne' in $size) {
      return array.length !== substituteVariables($size.$ne, context);
    } else if ('$gt' in $size) {
      return array.length > substituteVariables($size.$gt, context);
    } else if ('$gte' in $size) {
      return array.length >= substituteVariables($size.$gte, context);
    } else if ('$lt' in $size) {
      return array.length < substituteVariables($size.$lt, context);
    } else if ('$lte' in $size) {
      return array.length <= substituteVariables($size.$lte, context);
    }
  }
  
  return false;
}

/**
 * Evaluate an equality condition
 * @param {Object} condition - Equality condition
 * @param {Object} state - Game state to evaluate against
 * @param {Object} context - Additional context for variable substitution
 * @returns {Boolean} - Whether the values are equal
 */
function evaluateEqualityCondition(condition, state, context) {
  const { path, $eq } = condition;
  
  // Get the value from the state
  const value = path ? getValueAtPath(state, path) : undefined;
  
  // Substitute variables in the expected value
  const expectedValue = substituteVariables($eq, context);
  
  // Compare values
  return value === expectedValue;
}

/**
 * Evaluate an inequality condition
 * @param {Object} condition - Inequality condition
 * @param {Object} state - Game state to evaluate against
 * @param {Object} context - Additional context for variable substitution
 * @returns {Boolean} - Whether the values are not equal
 */
function evaluateInequalityCondition(condition, state, context) {
  const { path, $ne } = condition;
  
  // Get the value from the state
  const value = path ? getValueAtPath(state, path) : undefined;
  
  // Substitute variables in the expected value
  const expectedValue = substituteVariables($ne, context);
  
  // Compare values
  return value !== expectedValue;
}

/**
 * Evaluate a comparison condition
 * @param {Object} condition - Comparison condition
 * @param {Object} state - Game state to evaluate against
 * @param {Object} context - Additional context for variable substitution
 * @returns {Boolean} - Whether the comparison is true
 */
function evaluateComparisonCondition(condition, state, context) {
  const { path } = condition;
  
  // Get the value from the state
  const value = path ? getValueAtPath(state, path) : undefined;
  
  // Check each comparison operator
  if ('$gt' in condition) {
    const compareValue = substituteVariables(condition.$gt, context);
    return Number(value) > Number(compareValue);
  } else if ('$gte' in condition) {
    const compareValue = substituteVariables(condition.$gte, context);
    return Number(value) >= Number(compareValue);
  } else if ('$lt' in condition) {
    const compareValue = substituteVariables(condition.$lt, context);
    return Number(value) < Number(compareValue);
  } else if ('$lte' in condition) {
    const compareValue = substituteVariables(condition.$lte, context);
    return Number(value) <= Number(compareValue);
  }
  
  return false;
}

/**
 * Evaluate a mathematical expression
 * @param {Object} expression - Mathematical expression
 * @param {Object} state - Game state to evaluate against
 * @param {Object} context - Additional context for variable substitution
 * @returns {Boolean} - Whether the expression evaluates to true
 */
function evaluateMathExpression(expression, state, context) {
  const { operator, operands, compareWith, comparison = '$eq' } = expression;
  
  if (!operator || !operands || !Array.isArray(operands)) {
    return false;
  }
  
  // Calculate the result of the expression
  let result;
  switch (operator) {
    case 'add':
      result = operands.reduce((sum, operand) => {
        const value = getOperandValue(operand, state, context);
        return sum + (Number(value) || 0);
      }, 0);
      break;
    case 'subtract':
      if (operands.length < 2) return false;
      result = getOperandValue(operands[0], state, context);
      for (let i = 1; i < operands.length; i++) {
        result -= getOperandValue(operands[i], state, context);
      }
      break;
    case 'multiply':
      result = operands.reduce((product, operand) => {
        const value = getOperandValue(operand, state, context);
        return product * (Number(value) || 1);
      }, 1);
      break;
    case 'divide':
      if (operands.length < 2) return false;
      result = getOperandValue(operands[0], state, context);
      for (let i = 1; i < operands.length; i++) {
        const divisor = getOperandValue(operands[i], state, context);
        if (divisor === 0) return false;
        result /= divisor;
      }
      break;
    case 'min':
      result = Math.min(...operands.map(operand => getOperandValue(operand, state, context)));
      break;
    case 'max':
      result = Math.max(...operands.map(operand => getOperandValue(operand, state, context)));
      break;
    default:
      return false;
  }
  
  // If compareWith is not provided, just check if result is truthy
  if (compareWith === undefined) {
    return !!result;
  }
  
  // Compare the result with the expected value
  const compareValue = substituteVariables(compareWith, context);
  
  switch (comparison) {
    case '$eq':
      return result === compareValue;
    case '$ne':
      return result !== compareValue;
    case '$gt':
      return result > compareValue;
    case '$gte':
      return result >= compareValue;
    case '$lt':
      return result < compareValue;
    case '$lte':
      return result <= compareValue;
    default:
      return false;
  }
}

/**
 * Get the value of an operand
 * @param {*} operand - Operand to get value of
 * @param {Object} state - Game state to evaluate against
 * @param {Object} context - Additional context for variable substitution
 * @returns {*} - Value of the operand
 */
function getOperandValue(operand, state, context) {
  if (typeof operand === 'object' && operand !== null) {
    if ('path' in operand) {
      return getValueAtPath(state, operand.path);
    } else if ('value' in operand) {
      return substituteVariables(operand.value, context);
    } else if ('$calc' in operand) {
      return evaluateMathExpression(operand.$calc, state, context);
    }
  } else if (typeof operand === 'string' && operand.startsWith('$')) {
    return substituteVariables(operand, context);
  }
  
  return operand;
}

/**
 * Evaluate property conditions
 * @param {Object} conditions - Property conditions
 * @param {Object} state - Game state to evaluate against
 * @param {Object} context - Additional context for variable substitution
 * @returns {Boolean} - Whether all property conditions are met
 */
function evaluatePropertyConditions(conditions, state, context) {
  return Object.entries(conditions).every(([key, value]) => {
    // Get actual value from state
    const actualValue = getValueAtPath(state, key);
    
    // Substitute variables in expected value
    const expectedValue = substituteVariables(value, context);
    
    // If expected value is an object, recursively evaluate it
    if (typeof expectedValue === 'object' && expectedValue !== null && !Array.isArray(expectedValue)) {
      return evaluateObjectCondition(expectedValue, { [key]: actualValue }, context);
    }
    
    // Otherwise, compare values directly
    return actualValue === expectedValue;
  });
}

/**
 * Substitute variables in a value
 * @param {*} value - Value to substitute variables in
 * @param {Object} context - Context with variable values
 * @returns {*} - Value with variables substituted
 */
function substituteVariables(value, context) {
  // If value is not a string or doesn't start with $, return as is
  if (typeof value !== 'string' || !value.startsWith('$')) {
    return value;
  }
  
  // Handle special variables
  if (value === '$playerId') {
    return context.playerId;
  }
  
  if (value === '$playerTeam') {
    // Support both context.team and context.playerTeam for backward compatibility
    return context.playerTeam || context.team;
  }
  
  if (value === '$fellowshipRegion') {
    return context.fellowshipRegion;
  }
  
  if (value === '$character.level') {
    return context.character?.level || 0;
  }
  
  // Handle characterId variable for companion checks
  if (value === '$characterId') {
    return context.characterId;
  }
  
  // For other variables, try to get from context
  const path = value.substring(1).split('.');
  let result = context;
  
  for (const part of path) {
    if (result === undefined || result === null) {
      return value; // Return original value if path is invalid
    }
    result = result[part];
  }
  
  return result !== undefined ? result : value;
}

module.exports = {
  evaluateCondition,
  evaluateObjectCondition,
  evaluateAndCondition,
  evaluateOrCondition,
  evaluateXorCondition,
  evaluateContainsCondition,
  evaluateContainsAllCondition,
  evaluateContainsAnyCondition,
  evaluateArraySizeCondition,
  evaluateEqualityCondition,
  evaluateInequalityCondition,
  evaluateComparisonCondition,
  evaluateMathExpression,
  evaluatePropertyConditions,
  substituteVariables
};
