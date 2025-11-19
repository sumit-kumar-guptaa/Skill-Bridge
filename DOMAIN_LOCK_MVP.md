# 🎯 MVP Feature: Domain-Locked Progression System

## 📋 Overview
**Core Concept**: Users must complete ALL assignments in their chosen domain before unlocking other domains. This creates focused learning paths and prevents users from jumping between domains without mastery.

## 🔒 How It Works

### 1. **First-Time User Experience**
- User logs in and navigates to Assignments page
- Beautiful modal appears showing 4 domain choices:
  - 📊 **SDE Track** (20 problems)
  - 🤖 **ML Track** (20 problems)
  - 🧠 **AI Track** (20 problems)
  - ⚙️ **DevOps Track** (20 problems)
- User must select ONE domain to start

### 2. **Domain Selection**
- User clicks on their chosen domain
- System stores: `selectedDomain`, `domainStartedAt`, `completedDomains: []`
- Modal closes, assignments page loads with ONLY that domain's problems visible
- Other domain tabs are **LOCKED** 🔒 with disabled state

### 3. **Locked Learning Path**
- User can ONLY solve problems from their selected domain
- Attempting to click on other domain tabs shows:
  ```
  🔒 [Domain] is locked! Complete all [Current Domain] assignments first.
  ```
- Progress bar shows: `Solved / Total Required (X%)`
- Real-time progress tracking

### 4. **Completion & Unlocking**
- When user solves ALL 20 problems in their domain:
  - Domain is marked as complete
  - Added to `completedDomains` array
  - `selectedDomain` is cleared
  - **🎉 +500 Bonus Credits Awarded!**
- User can now select a NEW domain
- Previously completed domains remain accessible

### 5. **Multi-Domain Mastery**
- User can repeat the process for all 4 domains
- Each domain completion = 500 bonus credits
- Total mastery = 2000 bonus credits + all problem credits
- `completedDomains` array tracks the journey

## 🗄️ Database Schema Changes

### User Model
```prisma
model User {
  // ... existing fields
  
  // Domain Lock System (MVP Feature)
  selectedDomain    String?  @map("selected_domain") // Current active domain
  domainStartedAt   DateTime? @map("domain_started_at") // When user picked this domain
  completedDomains  String[] @default([]) @map("completed_domains") // ["SDE", "ML"] etc.
}
```

### Problem Model
```prisma
model Problem {
  // ... existing fields
  
  domain           String   @default("SDE") @db.VarChar(20) // SDE, ML, AI, DevOps
}
```

## 🔌 API Endpoints

### 1. **POST /api/domain/select**
**Purpose**: Select a new domain

**Request**:
```json
{
  "domain": "SDE" // or ML, AI, DevOps
}
```

**Success Response** (200):
```json
{
  "success": true,
  "domain": "SDE",
  "message": "Domain SDE selected! Complete all assignments to unlock other domains."
}
```

**Error Response** (400):
```json
{
  "error": "You already have an active domain. Complete all assignments before switching.",
  "currentDomain": "ML"
}
```

**Validation**:
- User must not have an active `selectedDomain`
- Domain must be one of: SDE, ML, AI, DevOps

---

### 2. **GET /api/domain/status**
**Purpose**: Get user's domain lock status

**Success Response** (200):
```json
{
  "hasSelectedDomain": true,
  "selectedDomain": "SDE",
  "domainStartedAt": "2025-11-19T09:30:00Z",
  "completedDomains": ["ML"],
  "lockedDomains": ["AI", "DevOps"],
  "availableDomains": ["ML"], // Previously completed
  "currentProgress": {
    "solved": 15,
    "required": 20,
    "percentage": 75,
    "isComplete": false
  },
  "canSwitchDomain": false
}
```

**First-Time User Response**:
```json
{
  "hasSelectedDomain": false,
  "selectedDomain": null,
  "completedDomains": [],
  "availableDomains": ["SDE", "ML", "AI", "DevOps"],
  "message": "Please select a domain to start your learning journey"
}
```

---

### 3. **POST /api/domain/complete**
**Purpose**: Mark current domain as completed (auto-triggered when all problems solved)

**Success Response** (200):
```json
{
  "success": true,
  "completedDomain": "SDE",
  "completedDomains": ["ML", "SDE"],
  "bonusCredits": 500,
  "message": "🎉 Congratulations! You've mastered SDE! +500 bonus credits!",
  "nextAction": "Select your next domain to continue learning"
}
```

**Error Response** (400):
```json
{
  "error": "You need to solve 5 more problems to complete this domain",
  "solved": 15,
  "required": 20
}
```

## 🎨 UI Components

### Domain Selector Modal
**Trigger**: Shows automatically when `!hasSelectedDomain`

**Features**:
- 4 beautiful gradient cards for each domain
- Animated pulse effect
- Hover scale animations
- Disabled state during loading
- Error message display
- Clear MVP rules explanation
- Bonus credits teaser

**Visual Design**:
- Full-screen overlay with backdrop blur
- Gradient border (cyan → purple)
- Domain cards with unique colors:
  - SDE: Orange → Red gradient
  - ML: Blue → Cyan gradient
  - AI: Purple → Pink gradient
  - DevOps: Green → Teal gradient

### Domain Lock Indicators

**Tab State**:
```tsx
// Unlocked (current)
<button className="bg-orange-500 text-white">📊 SDE Sheet</button>

// Locked
<button className="bg-gray-900 opacity-50 cursor-not-allowed" disabled>
  🔒 🤖 ML Engineer
</button>

// Completed (available)
<button className="text-gray-400 hover:bg-gray-800">🧠 AI Engineer</button>
```

### Progress Bar
**Location**: Below category tabs

**Display**:
```
SDE Progress: 15/20       75%
[████████████████░░░░░░░░]
```

**Colors**:
- Background: Gray-800
- Fill: Cyan-500 → Purple-500 gradient
- Text: Cyan-400

## 🔄 User Flow Examples

### Scenario 1: New User
1. Opens `/assignments` → Domain Selector Modal appears
2. Clicks "SDE Track" → Domain selected
3. Modal closes → SDE assignments load
4. Tries clicking "ML" tab → Alert: "🔒 ML is locked!"
5. Solves all 20 SDE problems → +500 credits
6. Domain Selector Modal reappears → Picks ML
7. Repeats for all domains

### Scenario 2: Returning User (Mid-Progress)
1. Opens `/assignments` → No modal (already has active domain)
2. Sees progress: "SDE Progress: 15/20 (75%)"
3. ML, AI, DevOps tabs are locked 🔒
4. Continues solving SDE problems
5. Completes domain → Modal appears for next selection

### Scenario 3: Multi-Domain Master
1. Completed domains: ["SDE", "ML", "AI"]
2. Currently on: DevOps (18/20 completed)
3. Can switch between SDE, ML, AI (all unlocked)
4. DevOps tab is active (current domain)
5. Completes DevOps → +500 credits
6. All 4 domains unlocked
7. Can freely switch between any domain

## 🎁 Reward System

### Per Problem Credits
- Winner (competition): 100 credits
- Non-winner (correct): 50 credits
- Solo solve: Variable based on difficulty

### Domain Completion Bonus
- **500 credits per domain**
- Total possible: 2000 credits (4 domains × 500)
- Triggers: When `solved === required` (20/20 problems)

### Total Earnings Potential
```
4 domains × 20 problems × 50 credits (average) = 4,000 credits
4 domains × 500 bonus = 2,000 credits
Grand Total = 6,000+ credits possible
```

## 🚀 Implementation Details

### Frontend Logic
**File**: `app/assignments/page.tsx`

**Key State**:
```tsx
const [domainStatus, setDomainStatus] = useState<any>(null);
const [showDomainSelector, setShowDomainSelector] = useState(false);
const [loadingDomain, setLoadingDomain] = useState(true);
const [domainError, setDomainError] = useState('');
```

**Key Functions**:
```tsx
// Fetch domain status on load
const fetchDomainStatus = async () => { ... }

// Handle domain selection
const handleDomainSelect = async (domain: string) => { ... }

// Prevent switching to locked domains
const handleCategoryChange = (newCategory) => {
  if (domainStatus.lockedDomains?.includes(newCategory)) {
    alert(`🔒 ${newCategory} is locked!`);
    return;
  }
  setCategory(newCategory);
}
```

### Backend Logic
**Files**: 
- `app/api/domain/select/route.ts`
- `app/api/domain/status/route.ts`
- `app/api/domain/complete/route.ts`

**Problem Counts Configuration**:
```typescript
const DOMAIN_PROBLEM_COUNTS = {
  'SDE': 20,
  'ML': 20,
  'AI': 20,
  'DevOps': 20
};
```

**Validation Logic**:
```typescript
// Check if user can select new domain
if (existingUser?.selectedDomain) {
  return error("Already have active domain");
}

// Check if domain is complete
const solvedCount = await prisma.userProgress.count({
  where: { userId, problem: { domain } }
});

if (solvedCount < requiredCount) {
  return error(`Need to solve ${requiredCount - solvedCount} more`);
}
```

## 🔍 Testing Checklist

- [ ] New user sees domain selector modal on first load
- [ ] Selecting a domain closes modal and loads that domain's problems
- [ ] Other domain tabs show 🔒 lock icon and are disabled
- [ ] Clicking locked domain shows alert message
- [ ] Progress bar updates as problems are solved
- [ ] Completing all 20 problems awards 500 credits
- [ ] Completing domain clears selectedDomain and shows modal
- [ ] Completed domains are added to completedDomains array
- [ ] Previously completed domains remain accessible (not locked)
- [ ] User can select new domain after completing previous one
- [ ] All 4 domains can be completed independently
- [ ] Domain status persists across page refreshes
- [ ] Multiple users have independent domain states

## 📊 Analytics to Track

1. **Most Popular First Domain**: Which domain do users choose first?
2. **Completion Rate**: What % of users complete their first domain?
3. **Average Time to Complete**: How long does it take to finish 20 problems?
4. **Domain Order Patterns**: Do users follow predictable paths? (SDE → ML → AI → DevOps?)
5. **Drop-off Points**: At which problem count do users abandon a domain?

## 🎯 MVP Success Criteria

✅ **User can only access ONE domain at a time**
✅ **Other domains are visually locked and non-clickable**
✅ **Progress tracking shows X/20 completed**
✅ **Domain completion awards bonus credits**
✅ **User must complete ALL 20 to unlock others**
✅ **Completed domains remain accessible**
✅ **Clean, intuitive UI with clear messaging**
✅ **Database persistence across sessions**

## 🚀 Future Enhancements

1. **Streak System**: Solve 1 problem/day for bonus credits
2. **Domain Challenges**: Time-limited special problem sets
3. **Domain Leaderboards**: Rank users within each domain
4. **Difficulty Progression**: Unlock harder problems as you progress
5. **Domain Certificates**: Generate shareable certificates on completion
6. **Cross-Domain Problems**: Unlocked after completing all 4 domains
7. **Mentor Mode**: Help others in completed domains
8. **Domain Recommendations**: AI suggests next domain based on career goals

---

## 🎉 Result

**Complete MVP Implementation**: 
- ✅ Domain-locked progression system
- ✅ 4 distinct learning tracks
- ✅ Progress tracking & visualization
- ✅ Bonus credit rewards
- ✅ Beautiful UI with lock/unlock states
- ✅ Full database persistence
- ✅ API endpoints for domain management
- ✅ Comprehensive user flow

**This is your competitive differentiator!** 🚀
