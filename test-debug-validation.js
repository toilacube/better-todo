// Simple test to verify the JSON validation works correctly
// This simulates the validation logic from the Debug component

const validateTask = (task) => {
  return (
    task &&
    typeof task === "object" &&
    typeof task.id === "number" &&
    typeof task.text === "string" &&
    typeof task.completed === "boolean" &&
    Array.isArray(task.subtasks) &&
    typeof task.expanded === "boolean"
  );
};

const validateStoreData = (data) => {
  const errors = [];

  if (!data || typeof data !== "object") {
    errors.push("Data must be a valid object");
    return errors;
  }

  // Check required fields
  const requiredFields = [
    "todayTasks",
    "mustDoTasks",
    "taskHistory",
    "lastDate",
    "settings",
  ];
  requiredFields.forEach((field) => {
    if (!(field in data)) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate todayTasks
  if (data.todayTasks && !Array.isArray(data.todayTasks)) {
    errors.push("todayTasks must be an array");
  } else if (data.todayTasks) {
    data.todayTasks.forEach((task, index) => {
      if (!validateTask(task)) {
        errors.push(`Invalid task at todayTasks[${index}]`);
      }
    });
  }

  // Validate mustDoTasks
  if (data.mustDoTasks && !Array.isArray(data.mustDoTasks)) {
    errors.push("mustDoTasks must be an array");
  } else if (data.mustDoTasks) {
    data.mustDoTasks.forEach((task, index) => {
      if (!validateTask(task)) {
        errors.push(`Invalid task at mustDoTasks[${index}]`);
      }
    });
  }

  // Validate taskHistory
  if (data.taskHistory && typeof data.taskHistory !== "object") {
    errors.push("taskHistory must be an object");
  }

  // Validate lastDate
  if (data.lastDate && typeof data.lastDate !== "string") {
    errors.push("lastDate must be a string");
  }

  // Validate settings
  if (data.settings) {
    if (typeof data.settings !== "object") {
      errors.push("settings must be an object");
    } else {
      const settingsFields = [
        "autoCarryOver",
        "notifyInterval",
        "darkMode",
        "autoStart",
      ];
      settingsFields.forEach((field) => {
        if (!(field in data.settings)) {
          errors.push(`Missing required settings field: ${field}`);
        }
      });

      if (typeof data.settings.autoCarryOver !== "boolean") {
        errors.push("settings.autoCarryOver must be a boolean");
      }
      if (typeof data.settings.notifyInterval !== "number") {
        errors.push("settings.notifyInterval must be a number");
      }
      if (typeof data.settings.darkMode !== "boolean") {
        errors.push("settings.darkMode must be a boolean");
      }
      if (typeof data.settings.autoStart !== "boolean") {
        errors.push("settings.autoStart must be a boolean");
      }
    }
  }

  return errors;
};

// Test cases
console.log("=== Testing JSON Validation ===\n");

// Test 1: Valid data
const validData = {
  todayTasks: [
    {
      id: 1,
      text: "Test task",
      completed: false,
      subtasks: [],
      expanded: false,
    },
  ],
  mustDoTasks: [],
  taskHistory: {},
  lastDate: "2025-10-13",
  settings: {
    autoCarryOver: true,
    notifyInterval: 3,
    darkMode: false,
    autoStart: false,
  },
};

console.log("Test 1 - Valid data:");
const errors1 = validateStoreData(validData);
console.log(errors1.length === 0 ? "✅ PASSED" : "❌ FAILED");
if (errors1.length > 0) console.log("Errors:", errors1);

// Test 2: Missing required field
const invalidData1 = {
  todayTasks: [],
  mustDoTasks: [],
  // Missing taskHistory, lastDate, settings
};

console.log("\nTest 2 - Missing required fields:");
const errors2 = validateStoreData(invalidData1);
console.log(errors2.length > 0 ? "✅ PASSED" : "❌ FAILED");
console.log("Errors:", errors2);

// Test 3: Invalid task structure
const invalidData2 = {
  todayTasks: [
    {
      id: "1", // should be number
      text: "Test",
      completed: false,
      subtasks: [],
      expanded: false,
    },
  ],
  mustDoTasks: [],
  taskHistory: {},
  lastDate: "2025-10-13",
  settings: {
    autoCarryOver: true,
    notifyInterval: 3,
    darkMode: false,
    autoStart: false,
  },
};

console.log("\nTest 3 - Invalid task structure:");
const errors3 = validateStoreData(invalidData2);
console.log(errors3.length > 0 ? "✅ PASSED" : "❌ FAILED");
console.log("Errors:", errors3);

// Test 4: Invalid settings
const invalidData3 = {
  todayTasks: [],
  mustDoTasks: [],
  taskHistory: {},
  lastDate: "2025-10-13",
  settings: {
    autoCarryOver: "true", // should be boolean
    notifyInterval: 3,
    darkMode: false,
    autoStart: false,
  },
};

console.log("\nTest 4 - Invalid settings:");
const errors4 = validateStoreData(invalidData3);
console.log(errors4.length > 0 ? "✅ PASSED" : "❌ FAILED");
console.log("Errors:", errors4);

console.log("\n=== All tests completed ===");
