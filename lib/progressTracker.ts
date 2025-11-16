// Progress Tracking System with Database Integration
// Uses Neon PostgreSQL for persistent storage across devices

export interface ProblemAttempt {
  problemId: number;
  problemTitle: string;
  timestamp: number;
  passed: boolean;
  language: string;
  timeSpent: number; // in seconds
}

export interface DailyStreak {
  lastActiveDate: string; // YYYY-MM-DD
  currentStreak: number;
  longestStreak: number;
}

export interface UserProgress {
  userId: string;
  totalProblemsSolved: number;
  problemsAttempted: ProblemAttempt[];
  dailyStreak: DailyStreak;
  achievements: string[];
  skillLevels: {
    [category: string]: number; // 0-100
  };
  credits: number; // Gamification credits
}

export class ProgressTracker {
  private storageKey = 'skillbridge_progress';
  private useDatabase = typeof window !== 'undefined';

  // Get user progress from database or localStorage fallback
  async getProgress(userId: string): Promise<UserProgress> {
    if (this.useDatabase) {
      try {
        const response = await fetch(`/api/db/users?userId=${userId}`);
        if (response.ok) {
          const { user } = await response.json();
          if (user) {
            return this.dbUserToProgress(user);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch from database, using localStorage:', error);
      }
    }
    
    return this.getProgressFromLocalStorage(userId);
  }

  // Get progress from localStorage (fallback)
  private getProgressFromLocalStorage(userId: string): UserProgress {
    if (typeof window === 'undefined') return this.getDefaultProgress(userId);
    
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return this.getDefaultProgress(userId);
    
    const allProgress = JSON.parse(stored);
    return allProgress[userId] || this.getDefaultProgress(userId);
  }

  // Save problem attempt to database
  async saveProblemAttempt(userId: string, attempt: ProblemAttempt) {
    const progress = await this.getProgress(userId);
    
    // Add attempt
    progress.problemsAttempted.push(attempt);
    
    // Update total solved if passed
    let creditsEarned = 0;
    if (attempt.passed) {
      const uniqueSolved = new Set(
        progress.problemsAttempted.filter(a => a.passed).map(a => a.problemId)
      );
      const previousTotal = progress.totalProblemsSolved;
      progress.totalProblemsSolved = uniqueSolved.size;
      
      // Award credits for solving new problem
      if (progress.totalProblemsSolved > previousTotal) {
        creditsEarned += 10; // +10 credits per unique problem solved
        progress.credits += creditsEarned;
      }
    }
    
    // Update streak (awards +5 credits if streak continues)
    const streakBonus = this.updateStreak(progress);
    creditsEarned += streakBonus;
    
    // Check achievements
    this.checkAchievements(progress);
    
    // Save to database
    if (this.useDatabase) {
      try {
        // Save submission
        await fetch('/api/db/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            problem_id: attempt.problemId,
            code: '', // Code saved separately in submissions
            language: attempt.language,
            status: attempt.passed ? 'accepted' : 'failed',
            test_results: { passed: attempt.passed },
            is_accepted: attempt.passed
          })
        });

        // Update user progress
        await fetch('/api/db/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            total_solved: progress.totalProblemsSolved,
            current_streak: progress.dailyStreak.currentStreak,
            credits: progress.credits
          })
        });
      } catch (error) {
        console.warn('Failed to save to database, using localStorage:', error);
        this.saveProgressToLocalStorage(userId, progress);
      }
    } else {
      this.saveProgressToLocalStorage(userId, progress);
    }
  }

  // Update daily streak
  private updateStreak(progress: UserProgress): number {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = progress.dailyStreak.lastActiveDate;
    
    if (lastActive === today) {
      // Already active today
      return 0;
    }
    
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let bonusCredits = 0;
    if (lastActive === yesterday) {
      // Continuing streak - award bonus credits
      progress.dailyStreak.currentStreak++;
      bonusCredits = 5; // +5 credits for maintaining streak
      progress.credits += bonusCredits;
    } else if (lastActive !== today) {
      // Streak broken
      progress.dailyStreak.currentStreak = 1;
    }
    
    // Update longest streak
    if (progress.dailyStreak.currentStreak > progress.dailyStreak.longestStreak) {
      progress.dailyStreak.longestStreak = progress.dailyStreak.currentStreak;
    }
    
    progress.dailyStreak.lastActiveDate = today;
    return bonusCredits;
  }

  // Check and award achievements
  private checkAchievements(progress: UserProgress) {
    const achievements = [];
    
    // First Problem
    if (progress.totalProblemsSolved === 1 && !progress.achievements.includes('first_solve')) {
      achievements.push('first_solve');
    }
    
    // Problem milestones
    if (progress.totalProblemsSolved >= 10 && !progress.achievements.includes('solver_10')) {
      achievements.push('solver_10');
    }
    if (progress.totalProblemsSolved >= 50 && !progress.achievements.includes('solver_50')) {
      achievements.push('solver_50');
    }
    if (progress.totalProblemsSolved >= 100 && !progress.achievements.includes('solver_100')) {
      achievements.push('solver_100');
    }
    
    // Streak achievements
    if (progress.dailyStreak.currentStreak >= 7 && !progress.achievements.includes('week_streak')) {
      achievements.push('week_streak');
    }
    if (progress.dailyStreak.currentStreak >= 30 && !progress.achievements.includes('month_streak')) {
      achievements.push('month_streak');
    }
    
    // Add new achievements
    progress.achievements.push(...achievements);
  }

  // Convert database user to UserProgress format
  private dbUserToProgress(user: any): UserProgress {
    return {
      userId: user.id,
      totalProblemsSolved: user.total_solved || 0,
      problemsAttempted: [], // Load from submissions if needed
      dailyStreak: {
        lastActiveDate: user.updated_at ? new Date(user.updated_at).toISOString().split('T')[0] : '',
        currentStreak: user.current_streak || 0,
        longestStreak: user.max_streak || 0,
      },
      achievements: [], // Load from user_achievements if needed
      skillLevels: {
        Array: 0,
        'Linked List': 0,
        'Binary Search': 0,
        Stack: 0,
        'Dynamic Programming': 0,
        Graph: 0,
        Tree: 0,
        String: 0,
      },
      credits: user.credits || 0,
    };
  }

  // Save progress to localStorage (fallback)
  private saveProgressToLocalStorage(userId: string, progress: UserProgress) {
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem(this.storageKey);
    const allProgress = stored ? JSON.parse(stored) : {};
    allProgress[userId] = progress;
    localStorage.setItem(this.storageKey, JSON.stringify(allProgress));
  }

  // Get default progress structure
  private getDefaultProgress(userId: string): UserProgress {
    return {
      userId,
      totalProblemsSolved: 0,
      problemsAttempted: [],
      dailyStreak: {
        lastActiveDate: '',
        currentStreak: 0,
        longestStreak: 0,
      },
      achievements: [],
      skillLevels: {
        Array: 0,
        'Linked List': 0,
        'Binary Search': 0,
        Stack: 0,
        'Dynamic Programming': 0,
        Graph: 0,
        Tree: 0,
        String: 0,
      },
      credits: 0,
    };
  }

  // Get statistics
  async getStats(userId: string) {
    const progress = await this.getProgress(userId);
    const attempts = progress.problemsAttempted;
    
    // Calculate stats
    const totalAttempts = attempts.length;
    const successRate = totalAttempts > 0 
      ? (attempts.filter(a => a.passed).length / totalAttempts * 100).toFixed(1)
      : '0';
    
    // Get last 7 days activity
    const sevenDaysAgo = Date.now() - (7 * 86400000);
    const recentAttempts = attempts.filter(a => a.timestamp > sevenDaysAgo);
    
    // Most used language
    const languageCounts = attempts.reduce((acc, a) => {
      acc[a.language] = (acc[a.language] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    const favoriteLanguage = Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'javascript';
    
    return {
      totalProblemsSolved: progress.totalProblemsSolved,
      totalAttempts,
      successRate: parseFloat(successRate),
      currentStreak: progress.dailyStreak.currentStreak,
      longestStreak: progress.dailyStreak.longestStreak,
      recentActivity: recentAttempts.length,
      favoriteLanguage,
      achievements: progress.achievements.length,
      credits: progress.credits,
    };
  }

  // Sync localStorage to database (migration helper)
  async syncLocalToDatabase(userId: string) {
    const localProgress = this.getProgressFromLocalStorage(userId);
    
    try {
      await fetch('/api/db/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          email: `user_${userId}@temp.com`, // Replace with actual email
          username: `user_${userId}`
        })
      });

      await fetch('/api/db/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          total_solved: localProgress.totalProblemsSolved,
          current_streak: localProgress.dailyStreak.currentStreak,
          credits: localProgress.credits
        })
      });

      console.log('✅ Successfully synced localStorage to database');
    } catch (error) {
      console.error('❌ Failed to sync to database:', error);
    }
  }
}

export const progressTracker = new ProgressTracker();
