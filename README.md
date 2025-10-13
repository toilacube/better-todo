# Better Todo

A minimalist, cross-platform todo application built with React, TypeScript, and Tauri.

## Features

- **Two Task Types**: Organize tasks into Daily Tasks and Must-Do Tasks
- **Nested Subtasks**: Create unlimited levels of subtasks with expand/collapse
- **Smart Completion**: Parent tasks auto-complete when all subtasks are done
- **Daily History**: Automatic day transitions at midnight with completion tracking
- **Auto Carry-Over**: Incomplete tasks automatically move to the next day (configurable)
- **Smart Reminders**: Get notified about Must-Do tasks at configurable intervals
- **Statistics Dashboard**: Track your productivity with charts, streaks, and completion rates
- **Dark Mode**: Toggle between light and dark themes
- **Debug Tools**: Advanced JSON editor with validation for power users
- **Persistent Storage**: All data automatically saved locally

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Rust](https://www.rust-lang.org/tools/install) (for Tauri)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/better-todo.git
cd better-todo
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run tauri dev
```

### Build

Build distributable packages for your platform:

```bash
npm run tauri build
```

Installers will be available in `src-tauri/target/release/bundle/`

## Usage

### Adding Tasks

- Type your task in the input field and press Enter
- Switch between "Today" and "Must-Do" tabs to choose task type
- Use Tab key to create a subtask under the current task

### Managing Tasks

- Click checkboxes to mark tasks as complete
- Click the arrow icon to expand/collapse subtasks
- Click the trash icon to delete a task

### Settings

Click the settings icon in the header to configure:
- **Auto Carry-Over**: Move incomplete tasks to the next day
- **Reminder Interval**: How often to show Must-Do notifications (in minutes)
- **Dark Mode**: Toggle theme
- **Auto Start**: Launch app on system startup

### Statistics

View your productivity metrics including:
- Completion rate charts
- Streak tracking
- Historical task data
- Daily summaries

### Debug Mode

Access advanced features via the debug icon:
- View complete store data
- Edit JSON directly with validation
- Inspect task structure and settings

## Tech Stack

- **Frontend**: React + TypeScript
- **Desktop Framework**: Tauri
- **Icons**: Lucide React
- **Charts**: Recharts
- **Storage**: Tauri Plugin Store
- **Notifications**: Tauri Plugin Notification

## Project Structure

```
src/
├── components/      # React components
├── hooks/          # Custom React hooks
├── store/          # Storage layer
├── utils/          # Helper functions
├── types.ts        # TypeScript interfaces
└── App.tsx         # Main application
```