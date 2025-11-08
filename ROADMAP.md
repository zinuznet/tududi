# Tududi - Product Roadmap

## Current Status: Core MVP Development

This roadmap outlines future features and enhancements planned for Tududi, an ADHD-friendly task management system.

---

## COMPLETED FEATURES ✅

### Sprint 1-8: Time Tracking Foundation
- Database migrations for time tracking (projects, tasks, users tables)
- Core timer API endpoints (start, stop, entries, manual)
- Task splitting with time entry preservation
- Project calculations and budget tracking
- Task serialization with actual_hours
- UI components (timer widgets, time entry history)
- Project dashboard with health metrics
- Today view integration with active timer

### Sprint 9: ADHD-Focused Features
- Timer settings in user profile (auto-pause threshold, reminder intervals, notifications)
- CRON job for auto-pausing inactive timers (forgiveness feature)
- Browser notification service for timer awareness
- Integration with timer widgets
- Periodic reminders to maintain focus

### Sprint 10: Time Reporting & Export
- Time report API endpoint with date range filtering
- CSV and JSON export functionality
- Comprehensive summary statistics
- Budget health calculations
- Recent entries preview in project metrics tab

---

## IN PROGRESS 🚧

### Sprint 11: Project Sections & Manual Ordering
**Timeline:** Next
**Effort:** 10-12h
**Priority:** High

Organize tasks within projects using collapsible sections with manual ordering capabilities.

**Features:**
- Create/edit/delete project sections
- Drag & drop tasks between sections
- Manual task ordering within sections
- Collapse/expand sections for focus
- "No section" group for unorganized tasks
- Section reordering
- Persistent collapsed state

**ADHD Benefits:**
- Reduces cognitive load by chunking long task lists
- Visual organization matches mental models
- Flexibility to arrange tasks by current context

---

### Sprint 12: Subtask Templates
**Timeline:** After Sprint 11
**Effort:** 8-10h
**Priority:** High

Reusable templates for common subtask workflows.

**Features:**
- Create/edit/delete subtask templates
- Template categories and search
- Apply template to task (replace or append)
- Preview before applying
- Recently used templates
- Example templates: "Code Review", "Deploy Feature", "Write Blog Post"

**ADHD Benefits:**
- Eliminates decision fatigue
- Prevents forgetting steps in routine tasks
- Reduces planning overhead
- Quick wins through standardized workflows

---

### Sprint 13: Full Pomodoro Timer Implementation
**Timeline:** Priority sprint
**Effort:** 12-15h
**Priority:** Critical (ADHD)

Complete Pomodoro Technique integration with customizable settings.

**Features:**
- Circular progress timer with MM:SS display
- Work/break phase management (configurable durations)
- Session counter (e.g., 4 sessions until long break)
- Auto-transition between phases with countdown
- Browser notifications for phase changes
- Gentle sound alerts (optional)
- Local storage persistence (survives refresh)
- Pomodoro vs Simple Timer mode toggle
- Session history tracking
- Daily/weekly pomodoro statistics

**User Settings:**
- Work duration (default: 25 min, range: 1-60)
- Short break duration (default: 5 min, range: 1-30)
- Long break duration (default: 15 min, range: 5-60)
- Sessions until long break (default: 4, range: 2-10)

**ADHD Benefits:**
- Short, manageable work blocks prevent overwhelm
- Forced breaks prevent burnout and hyperfocus exhaustion
- Gamification aspect (session counting) provides dopamine hits
- External structure for time awareness
- Proven technique for ADHD productivity

---

### Sprint 14: Work Schedule Configuration
**Timeline:** After Sprint 13
**Effort:** 8-10h
**Priority:** High

Realistic time estimation based on actual working hours and availability.

**Features:**
- Configure work days (checkbox for each day of week)
- Set work hours per day (e.g., 4h for part-time)
- Define work start/end times
- Presets: Full-time, Part-time, Freelance
- Work schedule calculator service
- Estimated completion dates based on work schedule
- "Working days remaining" vs calendar days
- Overcommitment warnings

**API Features:**
- `calculateWorkingHoursBetween(startDate, endDate)` - actual available hours
- `estimateCompletionDate(hoursNeeded, startDate)` - realistic deadline
- `getAvailableHours(dateRange)` - capacity planning

**ADHD Benefits:**
- Realistic planning prevents discouragement
- Accounts for actual productive hours (not idealized 8h/day)
- Clear visibility into capacity
- Reduces overcommitment stress

---

### Sprint 15: Subtask Manual Ordering
**Timeline:** After Sprint 14
**Effort:** 3-4h
**Priority:** Medium

Drag & drop ordering for subtasks within a task.

**Features:**
- Drag handle for each subtask
- Smooth animations
- Touch support for mobile
- "Move to top/bottom" buttons for accessibility

**ADHD Benefits:**
- Control over task sequence
- Order by energy level or logical flow
- Visual feedback for clear organization

---

## UPCOMING FEATURES - PHASE 2 📋

### Sprint 16: Visual & Productivity Enhancements
**Effort:** 10-12h
**Priority:** Medium-High

**Tag Colors (3-4h):**
- Color picker for tags
- Colored badges throughout UI
- Visual categorization for quick recognition

**Completed Tasks View (3-4h):**
- Dedicated page/view for completed tasks
- Date range filtering
- Search functionality
- Motivation stats: "47 tasks this week! 🎉"

**Task Notes Enhancement (4-5h):**
- Markdown editor with preview
- Formatting toolbar
- Link support with preview
- Rich text capabilities

---

### Sprint 17: ADHD Smart Features
**Effort:** 5-8h
**Priority:** Medium

**"When" Quick Picker (2-3h):**
- One-click date setting: Today, Tomorrow, This Weekend, Next Week, Someday
- Things3-inspired quick entry
- Reduces friction in task creation

**Energy Levels (3-4h):**
- Tag tasks with required energy: Low 🔋, Medium 🔋🔋, High 🔋🔋🔋
- Filter tasks by energy level
- "Show low-energy tasks" when tired
- Match tasks to current mental state

---

### Sprint 18: Productivity Rituals
**Effort:** 6-8h
**Priority:** Medium

**"Start My Day" (3-4h):**
- Morning review of Today Plan
- AI-suggested tasks based on due dates, priority, available time
- Drag tasks to Today view
- Intention setting ritual

**"Evening Review" (3-4h):**
- End-of-day reflection
- Show completed tasks and time tracked
- "Move unfinished tasks to tomorrow?" prompt
- Optional reflection notes
- Closure ritual for ADHD brain

---

## FUTURE FEATURES - PHASE 3 🔮

### Focus Mode (6-8h)
**Priority:** Medium

Full-screen, distraction-free task view.

**Features:**
- Full-screen single task display
- Shows: timer, notes, subtasks, essential info only
- Hide sidebar and navigation
- Keyboard shortcut (F11 or custom)
- Minimalist, calm UI
- Exit with Esc

**ADHD Benefits:**
- Supports hyperfocus by removing distractions
- Clean visual environment reduces overwhelm
- Single-task focus combats task-switching

---

### Gentle Reminders (3-4h)
**Priority:** Medium

Task-based notification system.

**Features:**
- Set reminder time for tasks
- Browser notifications (gentle, not aggressive)
- "You planned to work on X today" messages
- Snooze/dismiss options
- Non-intrusive nudges

**ADHD Benefits:**
- External memory support
- Gentle accountability
- Time blindness compensation

---

### Smart Lists / Saved Filters (6-8h)
**Priority:** Medium

Custom views for different contexts and mental states.

**Features:**
- Create custom filtered views
- Examples:
  - "High priority + Due this week"
  - "Unassigned to project"
  - "No estimated hours"
  - "Overdue tasks"
  - "Waiting for someone"
- Save as sidebar items
- Quick context switching

**ADHD Benefits:**
- Different views for different mental states
- Reduces decision fatigue
- Pre-organized contexts ready when needed

---

### Comprehensive Keyboard Shortcuts (6-8h)
**Priority:** Medium

Full keyboard navigation and shortcuts.

**Navigation:**
- `j/k` - Move up/down
- `Enter` - Open task
- `Esc` - Close/cancel
- `/` - Focus search

**Actions:**
- `c` - Mark complete
- `e` - Edit
- `d` - Delete
- `n` - New task
- `t` - Add to today

**Other:**
- `?` - Show help overlay with all shortcuts
- Customizable shortcuts

**ADHD Benefits:**
- Speed reduces friction
- No mouse requirement for flow state
- Muscle memory reduces cognitive load

---

### Daily/Weekly Stats Dashboard (8-10h)
**Priority:** Low-Medium

Analytics and gamification for motivation.

**Metrics:**
- Tasks completed today/this week/this month
- Completion streak counter ("5 days in a row! 🔥")
- Pomodoros completed
- Time tracked by project/tag
- Project progress overview
- Charts and visualizations (recharts)

**ADHD Benefits:**
- Gamification provides dopamine hits
- Visual progress combats "I never get anything done" feeling
- Streak counter builds consistency
- Motivation through visible achievement

---

### Recurring Tasks - Improvements (6-7h)
**Priority:** Medium

Enhanced flexibility for recurring tasks.

**Features:**
- "Skip this occurrence" button
- "Reschedule next occurrence"
- "Stop recurring" (end series)
- History of completions (last 5)
- Flexible modification

**ADHD Benefits:**
- Forgiveness when life happens
- No guilt for skipping
- Adaptability to changing routines

---

### Task Dependencies / Blocking (8-10h)
**Priority:** Low

Task relationships and sequencing.

**Features:**
- Task A "blocks" Task B
- Visual dependency indicators (🔒 icon)
- Cannot complete blocked tasks
- Dependency graph visualization
- Critical path analysis

**ADHD Benefits:**
- Clear sequencing eliminates "what do I do first?" paralysis
- External structure for task order
- Prevents starting tasks that can't be completed yet

---

### Time Blocking / Calendar View (10-12h)
**Priority:** Low-Medium

Visual time allocation on calendar.

**Features:**
- Day/week calendar view
- Drag tasks onto calendar to create time blocks
- Timeline visualization
- Show estimated duration on calendar
- Optional Google Calendar integration

**ADHD Benefits:**
- Visual schedule for time awareness
- Time blindness compensation
- See when things actually fit in day

---

### Habits Tracking (8-10h)
**Priority:** Low

Build consistency through habit tracking.

**Features:**
- Mark recurring tasks as "habits"
- Calendar heatmap visualization
- Streak counter
- Habit statistics
- Examples: Exercise, Meditate, Inbox Zero

**ADHD Benefits:**
- Visual reinforcement of consistency
- Gamification through streaks
- Building routines for ADHD brain
- Dopamine hits from completion

---

## COLLABORATION FEATURES (Future - Multi-User) 👥

*Note: Currently designed for solo use. These features planned for team/collaboration scenarios.*

### Task Comments & Activity (6-8h)
**Priority:** Low (future)

**Features:**
- Comments on shared tasks
- @mentions with notifications
- Activity log ("Alice completed subtask X")
- Real-time updates (WebSocket)
- User avatars

### Advanced Permissions (4-5h)
**Priority:** Low (future)

**Features:**
- Granular permission levels beyond r/rw
- Project-specific roles
- Task assignment
- Notification preferences per shared project

### Team Dashboard (8-10h)
**Priority:** Low (future)

**Features:**
- Team capacity view
- Who's working on what
- Shared time tracking reports
- Team velocity metrics

---

## ADVANCED INTEGRATIONS 🔌

### File Attachments (6-8h)
**Priority:** Low (future)

**Features:**
- Upload files to tasks/notes (images, PDFs, docs)
- File preview (images, PDFs in browser)
- Storage management (quotas, cleanup)
- Download links
- Image galleries

**Why Deferred:**
- Task notes currently sufficient for most use cases
- File storage adds complexity (storage backend, quotas, security)
- Can be added when collaboration features are needed

---

### Google Calendar Integration (10-12h)
**Priority:** Low (future)

**Features:**
- OAuth authentication
- Two-way sync (tasks ↔ calendar events)
- iCal import/export
- Time block sync
- Deadline sync

---

### Email to Task (6-8h)
**Priority:** Low (future)

**Features:**
- Unique email address per user
- Forward emails to create tasks
- Subject becomes task name
- Body becomes note
- Attachments preserved

---

### Zapier Integration (12-15h)
**Priority:** Low (future)

**Features:**
- Zapier app integration
- Triggers: Task completed, Project updated, etc.
- Actions: Create task, Update task, etc.
- Pre-built Zap templates

---

### GitHub Issues Sync (10-12h)
**Priority:** Low (future)

**Features:**
- Link project to GitHub repo
- Import issues as tasks
- Two-way sync for status
- Comment sync
- Label mapping to tags

---

## MOBILE & OFFLINE 📱

### Progressive Web App Enhancement (10-12h)
**Priority:** Medium (future)

**Features:**
- Better offline mode (service workers)
- Background sync when online
- Install prompts
- App-like experience
- Push notifications on desktop
- Offline task creation (sync when online)

---

### Native Mobile App (40-60h)
**Priority:** Low (future)

**Platform:** React Native

**Features:**
- iOS and Android native apps
- Offline-first with SQLite
- Push notifications
- Mobile-optimized UI
- Camera integration (scan receipts, documents)
- Widgets for Today view
- Share extension (add tasks from other apps)

---

## AI & AUTOMATION 🤖

### AI-Powered Features (20-30h)
**Priority:** Low (future exploration)

**Potential Features:**
- AI-suggested task breakdown (project → tasks → subtasks)
- Smart due date predictions based on historical data
- Priority recommendations
- Pattern recognition ("You usually do X after Y")
- Natural language task creation ("Remind me to call John tomorrow at 2pm")
- Email parsing for task extraction

**Considerations:**
- Requires LLM API integration (OpenAI, Claude, etc.)
- Privacy concerns with data sharing
- Cost considerations for API usage
- ADHD benefit: Reduces planning overhead, but must avoid over-automation

---

## TECHNICAL IMPROVEMENTS 🛠️

### Performance Optimization
- Lazy loading for large task lists
- Virtual scrolling for 1000+ tasks
- IndexedDB caching for offline mode
- Query optimization for complex filters
- Image optimization and CDN

### Testing Infrastructure
- Unit tests for critical functions
- Integration tests for API endpoints
- E2E tests for key user flows (Playwright/Cypress)
- Visual regression testing
- Performance benchmarking

### Developer Experience
- Storybook for component development
- API documentation improvements
- Development environment improvements
- Hot reload optimization
- Better error messages

---

## ACCESSIBILITY ♿

### WCAG 2.1 AA Compliance
- Keyboard navigation (in progress with Sprint 20)
- Screen reader optimization
- High contrast themes
- Font size customization
- Focus indicators
- ARIA labels
- Alternative text for images
- Color blind friendly palettes

---

## COMMUNITY & ECOSYSTEM 🌍

### Open Source Contributions
- Public roadmap (this document)
- Contribution guidelines
- Issue templates
- Pull request templates
- Community Discord/forum

### Plugins/Extensions
- Plugin API for third-party integrations
- Theme marketplace
- Template sharing (project templates, subtask templates)
- Community-contributed workflows

---

## RESEARCH & EXPLORATION 🔬

### ADHD-Specific Research
- User interviews with ADHD community
- A/B testing of ADHD-friendly features
- Collaboration with ADHD coaches/therapists
- Evidence-based feature development
- Academic partnerships for ADHD productivity research

### Experimental Features
- Gamification experiments (XP, levels, achievements)
- Social accountability features
- Body doubling mode (virtual co-working)
- Ambient sound integration (focus music)
- Distraction blocking

---

## VERSION HISTORY 📅

### v0.86-rc.2 (Current - December 2024)
- Sprints 1-10 completed
- Time tracking foundation
- ADHD timer features
- Time reporting & export

### v1.0 (Planned - Q1 2025)
- Sprints 11-17 completed
- Project sections
- Subtask templates
- Full Pomodoro implementation
- Work schedule configuration
- Enhanced task notes
- Tag colors
- Completed view

### v1.5 (Planned - Q2 2025)
- Focus mode
- Smart lists
- Productivity rituals
- Gentle reminders
- Keyboard shortcuts

### v2.0 (Planned - Q3 2025)
- Collaboration features
- Advanced analytics
- Mobile PWA improvements
- File attachments

---

## FEEDBACK & CONTRIBUTIONS 💬

This roadmap is a living document based on:
- User feedback and feature requests
- ADHD productivity research
- Technical feasibility
- Development priorities

**Priority Levels:**
- **Critical:** Core ADHD productivity features
- **High:** Significant productivity improvements
- **Medium:** Quality of life enhancements
- **Low:** Nice-to-have features

**Effort Estimates:**
- Based on full-stack development (backend + frontend)
- Include testing and documentation
- Subject to change as implementation progresses

---

## PRINCIPLES 🎯

All features are evaluated against these ADHD-first principles:

1. **Instant Visual Feedback** - Optimistic updates, no lag
2. **Undo/Redo** - Safety net for mistakes
3. **Gentle Notifications** - Not aggressive alerts
4. **Progressive Disclosure** - Don't overwhelm with options
5. **Sensible Defaults** - Works out-of-the-box
6. **Quick Wins** - Small successes build momentum
7. **Flexibility** - Multiple ways to achieve goals
8. **Forgiveness** - Easy to fix mistakes

---

**Last Updated:** December 2024
**Next Review:** After Sprint 17 completion
