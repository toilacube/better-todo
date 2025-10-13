// Test script to validate the test-data.json
import fs from 'fs';

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

console.log("=== Validating test-data.json ===\n");

try {
  // Read the JSON file
  const jsonContent = fs.readFileSync('./test-data.json', 'utf8');
  console.log("✅ JSON file read successfully");

  // Parse JSON
  let data;
  try {
    data = JSON.parse(jsonContent);
    console.log("✅ JSON parsed successfully");
  } catch (parseError) {
    console.log("❌ JSON Parse Error:", parseError.message);
    process.exit(1);
  }

  // Validate structure
  const errors = validateStoreData(data);

  if (errors.length === 0) {
    console.log("✅ Data validation passed!");
    console.log("\nData Summary:");
    console.log(`- Today Tasks: ${data.todayTasks.length}`);
    console.log(`- Must-Do Tasks: ${data.mustDoTasks.length}`);
    console.log(`- History Entries: ${Object.keys(data.taskHistory).length}`);
    console.log(`- Last Date: ${data.lastDate}`);
    console.log(`- Settings: ${JSON.stringify(data.settings, null, 2)}`);
  } else {
    console.log("❌ Data validation failed!");
    console.log("\nValidation Errors:");
    errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
    process.exit(1);
  }
} catch (error) {
  console.log("❌ Error:", error.message);
  process.exit(1);
}

console.log("\n=== Validation Complete ===");
