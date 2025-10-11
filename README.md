# Better Todo App

A minimalist, feature-rich todo application built with React, TypeScript, and Tauri.

## 📋 Architecture Overview

### 1. Core Structure

- **TypeScript Interfaces**: Task, HistoryEntry, Settings, and AppState in `src/types.ts`
- **Storage Wrapper**: Using localStorage in `src/store/storage.ts`
- **Task Helpers**: Utility functions in `src/utils/taskHelpers.ts`
- **Date Helpers**: Date manipulation utilities in `src/utils/dateHelpers.ts`

### 2. Custom Hooks

- `src/hooks/useTasks.ts` - Task management with CRUD operations
- `src/hooks/useHistory.ts` - History tracking and retrieval
- `src/hooks/useSettings.ts` - Settings management
- `src/hooks/useDarkMode.ts` - Dark mode toggle

### 3. UI Components

- `src/components/TaskInput.tsx` - Input field for adding new tasks
- `src/components/TaskItem.tsx` - Recursive task item with nested subtask support
- `src/components/Header.tsx` - Header with navigation icons
- `src/components/Settings.tsx` - Settings modal with toggles
- `src/components/Statistics.tsx` - Statistics page with charts and history

### 4. Main Application

- `src/App.tsx` - Main app with tab navigation, day transition logic, and Must-Do reminders
- `src/App.css` - Comprehensive CSS with dark mode support following minimalist design

### 5. Tauri Integration

- Added `tauri-plugin-store` for data persistence
- Added `tauri-plugin-notification` for Must-Do reminders
- Updated `src-tauri/src/lib.rs` with plugin initialization
- Updated `src-tauri/capabilities/default.json` with permissions

### 6. Dependencies Installed

- **lucide-react** - Icon library
- **recharts** - Charts for statistics
- **Tauri plugins** - For notifications and storage

## 🎯 Key Features Implemented

- ✅ **Two Task Types**: Daily Tasks and Must-Do Daily Tasks with separate tabs
- ✅ **Nested Task Structure**: Unlimited levels of subtasks with expand/collapse
- ✅ **Auto-completion Logic**: Parent/child task completion cascading
- ✅ **Visual Indicators**: Checkboxes, strikethrough, counters (3/5)
- ✅ **Daily History System**: Automatic day transition at midnight
- ✅ **Auto Carry-Over**: Configurable incomplete task carry-over
- ✅ **Must-Do Reminders**: Configurable interval notifications
- ✅ **Statistics Page**: Charts, streaks, completion rates, history cards
- ✅ **Dark/Light Mode**: Theme toggle with CSS variables
- ✅ **Minimalist Design**: Clean UI following the spec exactly
- ✅ **LocalStorage Persistence**: Data saved automatically

## 🚀 Running the Application

### Development Mode

```bash
npm run tauri dev
```

### Build for Production

```bash
npm run tauri build
```

## 📂 Project Structure

```
src/
├── components/         # React components
│   ├── Header.tsx
│   ├── TaskInput.tsx
│   ├── TaskItem.tsx
│   ├── Settings.tsx
│   └── Statistics.tsx
├── hooks/             # Custom React hooks
│   ├── useTasks.ts
│   ├── useHistory.ts
│   ├── useSettings.ts
│   └── useDarkMode.ts
├── store/             # Storage layer
│   └── storage.ts
├── utils/             # Helper functions
│   ├── taskHelpers.ts
│   └── dateHelpers.ts
├── types.ts           # TypeScript interfaces
├── App.tsx            # Main application
└── App.css            # Global styles
```

## ✨ Status

The application successfully compiled and is ready to use! You can now run it with `npm run tauri dev` to start developing or `npm run tauri build` to create distributable packages for Windows, macOS, and Linux.
