# Todo Manager - Requirements & Design Documentation

## 1. Project Overview

A minimalist daily task management application designed as a quick note-taking style todo list. The app supports nested task structures and provides performance tracking through statistics.

**Target Platform**: Tauri Desktop Application  
**Design Philosophy**: Minimalist, distraction-free, fast and functional

---

## 2. Core Features

### 2.1 Task Management

#### Two Task Types:
1. **Daily Tasks**: Regular day-to-day tasks
2. **Must-Do Daily Tasks**: Priority tasks with reminder notifications

#### Task Properties:
- `id`: Unique identifier (timestamp + random)
- `text`: Task description (string)
- `completed`: Completion status (boolean)
- `subtasks`: Array of nested tasks (recursive structure)
- `expanded`: UI state for showing/hiding subtasks (boolean)

#### Nested Task Structure:
- Tasks can contain unlimited levels of subtasks
- Each subtask can have its own subtasks (task in task in task...)
- Visual hierarchy with indentation and border lines

### 2.2 Task Completion Logic

**Auto-completion Rules:**
1. When all subtasks are completed → parent task automatically completes
2. When parent task is checked → all subtasks automatically complete
3. When parent task is unchecked → only parent unchecks (subtasks remain as-is)
4. Recursive checking through all levels

**Visual Indicators:**
- Completion counter: `3/5` (3 out of 5 subtasks done)
- Strikethrough text for completed tasks
- Checkbox: filled circle (black/white) when complete, empty circle when incomplete

### 2.3 History & Daily Reset

**Daily History System:**
1. App detects new day at midnight
2. Previous day's tasks automatically saved to history
3. History stores: date, tasks array (with full structure), completed count, total count

**Auto Carry-Over Feature:**
- **Enabled**: Incomplete tasks automatically move to new day
- **Disabled**: Each day starts with empty task list
- User configurable in settings

**Data Persistence:**
- All data stored in localStorage
- Keys: `dailyTasks`, `mustDoTasks`, `taskHistory`, `lastDate`, `autoCarryOver`

### 2.4 Notifications (Must-Do Tasks)

**Reminder System:**
- Configurable interval (default: 3 hours)
- Browser alert if Must-Do tasks incomplete
- Only triggers for Must-Do tab
- User configurable in settings

### 2.5 Statistics & Analytics

**Summary Cards:**
- Total tasks (all-time)
- Total completed tasks
- Completion rate percentage

**Visualizations:**
1. **Line Chart**: Completion trend (30 days)
   - Completed vs Total tasks over time
2. **Bar Chart**: Daily completion rate (%)
3. **Pie Chart**: Task distribution (completed vs incomplete)
4. **Streak Tracking**:
   - Current streak (consecutive days with 100% completion)
   - Longest streak

**Task History:**
- Shows last 10 days
- Each day displays full task tree with completion status
- Expandable cards with date, task list, and completion count

---

## 3. UI/UX Design System

### 3.1 Design Principles

1. **Minimalism**: No unnecessary backgrounds, colors, or decorations
2. **Clarity**: Clear hierarchy through spacing and borders only
3. **Speed**: Fast input, keyboard shortcuts, inline editing
4. **Focus**: Distraction-free environment like a paper notebook

### 3.2 Color Palette

**Light Mode:**
- Background: `#FFFFFF` (white)
- Text: `#000000` (black)
- Borders: `#E5E7EB` (gray-200)
- Subtle borders: `#F3F4F6` (gray-100)
- Muted text: opacity 50%

**Dark Mode:**
- Background: `#000000` (black)
- Text: `#FFFFFF` (white)
- Borders: `#1F2937` (gray-800)
- Subtle borders: `#374151` (gray-700)
- Muted text: opacity 50%

**Interactive States:**
- Default: opacity 30-40%
- Hover: opacity 50%
- Active: opacity 100%
- Checkboxes: Solid black/white when checked

### 3.3 Typography

- **Font**: System default, light weight (300-400)
- **Sizes**:
  - Title: `text-xl` (20px)
  - Subtitles: `text-lg` (18px)
  - Body: `text-base` (16px)
  - Small: `text-sm` (14px)
  - Tiny: `text-xs` (12px)

### 3.4 Spacing & Layout

- **Container**: Max-width 600px (task view), 800px (stats view)
- **Padding**: Consistent 24px (`p-6`)
- **Gap between elements**: 12px (`gap-3`)
- **Task indent per level**: 24px (`ml-6`)
- **Vertical spacing**: 8-12px between tasks

### 3.5 Component Specifications

#### Header Bar
```
┌─────────────────────────────────────────────┐
│ Todo              [📊] [🌙/☀️] [⚙️]         │
└─────────────────────────────────────────────┘
```
- Height: Auto (padding-based)
- Border-bottom: 1px
- Icons: 20px, opacity 50%, hover 100%

#### Tab Navigation
```
┌─────────────────────────────────────────────┐
│ Daily (active)    Must-Do                   │
└─────────────────────────────────────────────┘
```
- Border-bottom: 2px when active
- Opacity: 100% active, 40% inactive
- No background colors

#### Task Input
```
┌─────────────────────────────────────────────┐
│ Thêm task...                            [+] │
└─────────────────────────────────────────────┘
```
- Border-bottom only (no sides/top)
- Focus: border changes from gray to black/white
- Button: + icon, opacity transitions

#### Task Item Structure
```
┌─────────────────────────────────────────────┐
│ [>] [○] Task name (2/5)           [+] [🗑]  │
├─────────────────────────────────────────────┤
│   ├─ [○] Subtask 1                          │
│   ├─ [●] Subtask 2 (completed)              │
│   └─ [>] [○] Subtask 3 (1/2)     [+] [🗑]   │
│       └─ [○] Sub-subtask                    │
└─────────────────────────────────────────────┘
```

**Elements:**
1. **Expand arrow**: `>` / `v` - only if has subtasks
2. **Checkbox**: Circle (5x5px), filled when complete
3. **Task text**: Line-through when complete, opacity 40%
4. **Counter**: `(2/5)` - shows completed/total subtasks
5. **Add button**: `+` icon, opacity 30% → 100% on hover
6. **Delete button**: Trash icon, opacity 30% → 100% on hover

**Nested Indicators:**
- Vertical line (border-left) connecting subtasks
- 24px indent per level
- Line opacity: 10-20%

#### Inline Subtask Input
```
└─ [○] Parent task                    [X] [🗑]
    ┌──────────────────────────────────────┐
    │ Tên subtask...                   [✓] │
    └──────────────────────────────────────┘
```
- Appears when + is clicked
- Auto-focus on input
- Border-bottom style
- Confirm with Enter or ✓ button
- Cancel with X button (replaces +)

#### Settings Modal
```
┌─────────────────────────────────────────┐
│ Cài đặt                             [X] │
├─────────────────────────────────────────┤
│                                         │
│ Nhắc nhở Must-Do (giờ)                  │
│ ┌─────────────────────────────────────┐ │
│ │ [3]                                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ───────────────────────────────────────│
│                                         │
│ Tự động chuyển task        [●──────]   │
│ Task chưa xong tự động sang ngày mới   │
│                                         │
└─────────────────────────────────────────┘
```
- Center overlay with backdrop (50% opacity black)
- Border: 1px, no shadow
- Toggle switch: Circle slides on track
- Input: Border-bottom style

#### Statistics Page Layout
```
┌─────────────────────────────────────────────┐
│ ← Quay lại                          [🌙/☀️] │
├─────────────────────────────────────────────┤
│                                             │
│ Thống kê                                    │
│                                             │
│ ┌───────────┬───────────┬───────────┐      │
│ │   1,234   │    987    │    80%    │      │
│ │ Tổng task │ Hoàn thành│  Tỷ lệ    │      │
│ └───────────┴───────────┴───────────┘      │
│                                             │
│ Xu hướng hoàn thành                         │
│ [Line Chart - 30 days]                      │
│                                             │
│ Tỷ lệ hoàn thành                            │
│ [Bar Chart - percentage]                    │
│                                             │
│ ┌───────────────┬───────────────┐          │
│ │  Pie Chart    │    Streak     │          │
│ │  Distribution │   🔥 5 ngày   │          │
│ │               │   ⭐ 12 ngày  │          │
│ └───────────────┴───────────────┘          │
│                                             │
│ Lịch sử                                     │
│ ┌─────────────────────────────────────┐    │
│ │ Thứ Hai, 7 Tháng 10          [5/5] │    │
│ ├─────────────────────────────────────┤    │
│ │ [●] Completed task                  │    │
│ │ [●] Another task                    │    │
│ │   ├─ [●] Subtask 1                  │    │
│ │   └─ [●] Subtask 2                  │    │
│ └─────────────────────────────────────┘    │
│ [More history cards...]                     │
└─────────────────────────────────────────────┘
```

**Chart Colors:**
- Line/Bar: Black (light mode) / White (dark mode)
- Secondary line: Gray, dashed
- Grid: Gray with low opacity

---

## 4. Data Structure

### 4.1 Task Object Schema
```typescript
interface Task {
  id: number;           // Date.now() + Math.random()
  text: string;         // Task description
  completed: boolean;   // Completion status
  subtasks: Task[];     // Nested tasks (recursive)
  expanded: boolean;    // UI state for collapse/expand
}
```

### 4.2 History Entry Schema
```typescript
interface HistoryEntry {
  date: string;         // Date string (toDateString())
  tasks: Task[];        // Full task tree
  completed: number;    // Count of completed root tasks
  total: number;        // Count of total root tasks
}
```

### 4.3 LocalStorage Schema
```typescript
{
  "dailyTasks": Task[],
  "mustDoTasks": Task[],
  "taskHistory": {
    [dateString]: HistoryEntry
  },
  "lastDate": string,
  "autoCarryOver": boolean,
  "notifyInterval": number  // hours
}
```

---

## 5. User Interactions & Flows

### 5.1 Adding Tasks
1. User types in input field
2. Press Enter or click + button
3. Task appears in list immediately
4. Input clears, ready for next task

### 5.2 Adding Subtasks
1. Click + button next to any task
2. + changes to X, inline input appears below
3. Type subtask name
4. Press Enter or click ✓
5. Subtask appears indented under parent
6. Parent auto-expands if collapsed

### 5.3 Completing Tasks
1. Click checkbox next to task
2. If checking parent → all subtasks check
3. If checking subtask → check propagates up if all siblings done
4. Visual feedback: filled circle, strikethrough text
5. Counter updates: `(3/5)` → `(4/5)`

### 5.4 Expanding/Collapsing
1. Click arrow (>) next to tasks with subtasks
2. Arrow rotates: > to v
3. Subtasks slide in/out
4. State persists in memory (not localStorage)

### 5.5 Deleting Tasks
1. Click trash icon
2. Task and all subtasks removed immediately
3. No confirmation dialog (keeps UX fast)
4. Parent completion recalculated

### 5.6 Day Transition
1. App loads, checks current date vs lastDate
2. If different day detected:
   - Save yesterday's dailyTasks to history
   - If autoCarryOver: filter incomplete → new dailyTasks
   - If not: clear dailyTasks
   - Update lastDate
3. History entry includes full task tree

### 5.7 Viewing Statistics
1. Click 📊 icon in header
2. Navigate to stats page
3. View charts and metrics
4. Click "← Quay lại" to return

---

## 6. Technical Requirements

### 6.1 For Tauri Implementation

**Framework:** Use Tauri with web frontend (React/HTML recommended)

**Key Considerations:**
1. **No Browser APIs**: Replace localStorage with Tauri's store
2. **Notifications**: Use Tauri notification API instead of browser alerts
3. **Window Management**: Minimize to tray, show on reminder
4. **Auto-start**: Optional system startup
5. **Keyboard Shortcuts**: Global hotkeys for quick add

**Recommended Tauri APIs:**
```rust
// Storage
tauri::api::path::app_data_dir()
serde_json for serialization

// Notifications
tauri::api::notification

// System tray
tauri::SystemTray

// Window control
tauri::Window::show()
tauri::Window::hide()
```

### 6.2 Performance Targets
- App launch: < 1 second
- Task add/delete: < 50ms
- Day transition check: < 100ms
- Statistics page load: < 300ms

### 6.3 Cross-Platform
- Windows: .exe installer
- macOS: .dmg or .app bundle
- Linux: .AppImage or .deb

---

## 7. Future Enhancements (Out of Scope)

- Task search/filter
- Tags or categories
- Due dates/reminders per task
- Cloud sync
- Export/import (JSON/CSV)
- Task templates
- Pomodoro timer integration
- Collaborative tasks

---

## 8. Assets & Resources

### 8.1 Icons Needed
All icons from Lucide React (or equivalent):
- `Plus` - Add task/subtask
- `Trash2` - Delete
- `Check` - Complete/Confirm
- `X` - Cancel/Close
- `ChevronRight/Down` - Expand/Collapse
- `Settings` - Settings
- `Moon/Sun` - Dark mode toggle
- `BarChart3` - Statistics

### 8.2 Fonts
- System default font stack
- Weight: 300 (light) to 400 (regular)

---

## 9. Testing Checklist

- [ ] Add/delete tasks at multiple levels
- [ ] Auto-completion of parent tasks
- [ ] Complete all subtasks → parent completes
- [ ] Day transition at midnight
- [ ] Auto carry-over toggle
- [ ] History saves correctly
- [ ] Statistics calculations accurate
- [ ] Dark/light mode toggle
- [ ] Must-Do reminders trigger
- [ ] Data persists after app restart
- [ ] Keyboard shortcuts work
- [ ] Mobile-friendly (if web preview)
- [ ] No memory leaks on long usage

---

## 10. Development Notes

### 10.1 State Management
- Use React hooks (useState, useEffect)
- No localStorage in web artifacts → use Tauri store
- State updates trigger re-renders efficiently

### 10.2 Code Structure Suggestions
```
src/
├── components/
│   ├── TaskItem.tsx
│   ├── TaskInput.tsx
│   ├── Header.tsx
│   ├── Statistics.tsx
│   └── Settings.tsx
├── hooks/
│   ├── useTasks.ts
│   ├── useHistory.ts
│   └── useSettings.ts
├── utils/
│   ├── taskHelpers.ts
│   └── dateHelpers.ts
├── store/
│   └── storage.ts (Tauri store wrapper)
└── App.tsx
```

### 10.3 Critical Functions to Implement
1. `toggleTask(taskId)` - with auto-completion logic
2. `addSubtask(parentId, text)` - recursive insert
3. `deleteTask(taskId)` - recursive delete
4. `checkDayTransition()` - save history, carry over
5. `autoCompleteParent(tasks)` - traverse tree, check completion
6. `calculateStats(history)` - aggregate metrics

---

## End of Documentation

**Version:** 1.0  
**Last Updated:** 2025-10-11  
