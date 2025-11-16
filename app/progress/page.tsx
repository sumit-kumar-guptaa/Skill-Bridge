'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { progressTracker, ProblemAttempt } from '@/lib/progressTracker';
import {
  Trophy,
  Target,
  Flame,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  Code,
  CheckCircle,
  BarChart3,
  ArrowLeft,
  Loader2,
  Star,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function ProgressPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [recentAttempts, setRecentAttempts] = useState<ProblemAttempt[]>([]);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/');
      return;
    }

    if (userId) {
      loadProgress();
    }
  }, [isLoaded, userId, router]);

  const loadProgress = async () => {
    if (!userId) return;
    
    const userProgress = await progressTracker.getProgress(userId);
    const userStats = progressTracker.getStats(userId);
    
    setProgress(userProgress);
    setStats(userStats);
    
    // Get last 10 attempts
    const recent = userProgress.problemsAttempted
      .slice(-10)
      .reverse();
    setRecentAttempts(recent);
  };

  // Calculate data for charts
  const getChartData = () => {
    if (!progress) return { languageData: [], difficultyData: [] };

    const attempts = progress.problemsAttempted.filter((a: ProblemAttempt) => a.passed);
    
    // Language distribution
    const languageCounts: { [key: string]: number } = {};
    attempts.forEach((a: ProblemAttempt) => {
      languageCounts[a.language] = (languageCounts[a.language] || 0) + 1;
    });
    
    const languageData = Object.entries(languageCounts).map(([lang, count]) => ({
      name: lang,
      value: count,
      percentage: attempts.length > 0 ? (count / attempts.length * 100).toFixed(1) : '0'
    }));

    // Difficulty distribution (mock data - would need to be tracked)
    // For now, approximate from problem IDs
    const difficultyData = [
      { name: 'Easy', value: attempts.filter((a: ProblemAttempt) => a.problemId <= 8).length, color: '#10b981' },
      { name: 'Medium', value: attempts.filter((a: ProblemAttempt) => a.problemId > 8 && a.problemId <= 17).length, color: '#f59e0b' },
      { name: 'Hard', value: attempts.filter((a: ProblemAttempt) => a.problemId > 17).length, color: '#ef4444' }
    ];

    return { languageData, difficultyData };
  };

  const { languageData, difficultyData } = getChartData();

  const achievementData = [
    { id: 'first_solve', name: 'First Blood', description: 'Solved your first problem', icon: '🎯' },
    { id: 'solver_10', name: 'Problem Solver', description: 'Solved 10 problems', icon: '💪' },
    { id: 'solver_50', name: 'Code Master', description: 'Solved 50 problems', icon: '🏆' },
    { id: 'solver_100', name: 'Legend', description: 'Solved 100 problems', icon: '👑' },
    { id: 'week_streak', name: 'Consistent', description: '7 day streak', icon: '🔥' },
    { id: 'month_streak', name: 'Unstoppable', description: '30 day streak', icon: '⚡' },
  ];

  if (!isLoaded || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] to-[#1a1f3a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] to-[#1a1f3a] text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0a0e27]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/assignments">
                <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
                <h1 className="text-2xl font-bold">Your Progress</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Solved */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-green-400">{stats.totalProblemsSolved}</span>
            </div>
            <p className="text-sm text-gray-300">Problems Solved</p>
            <p className="text-xs text-gray-500 mt-1">Success Rate: {stats.successRate}%</p>
          </div>

          {/* Credits */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-yellow-400" />
              <span className="text-3xl font-bold text-yellow-400">{progress?.credits || 0}</span>
            </div>
            <p className="text-sm text-gray-300">Credits</p>
            <p className="text-xs text-gray-500 mt-1">+10 per problem, +5 streak</p>
          </div>

          {/* Current Streak */}
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-8 h-8 text-orange-400" />
              <span className="text-3xl font-bold text-orange-400">{stats.currentStreak}</span>
            </div>
            <p className="text-sm text-gray-300">Day Streak</p>
            <p className="text-xs text-gray-500 mt-1">Longest: {stats.longestStreak} days</p>
          </div>

          {/* Total Attempts */}
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-blue-400">{stats.totalAttempts}</span>
            </div>
            <p className="text-sm text-gray-300">Total Attempts</p>
            <p className="text-xs text-gray-500 mt-1">Recent: {stats.recentActivity} this week</p>
          </div>

          {/* Achievements */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-purple-400">{stats.achievements}</span>
            </div>
            <p className="text-sm text-gray-300">Achievements</p>
            <p className="text-xs text-gray-500 mt-1">Language: {stats.favoriteLanguage}</p>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-[#1a1f3a] border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-400" />
            Achievements
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {achievementData.map((achievement) => {
              const unlocked = progress?.achievements?.includes(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`relative p-4 rounded-lg border transition-all ${
                    unlocked
                      ? 'bg-yellow-500/20 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                      : 'bg-gray-800/50 border-gray-700 opacity-50'
                  }`}
                >
                  <div className="text-4xl mb-2 text-center">{achievement.icon}</div>
                  <p className="text-xs font-semibold text-center mb-1">{achievement.name}</p>
                  <p className="text-[10px] text-gray-400 text-center">{achievement.description}</p>
                  {unlocked && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart - Problems by Difficulty */}
          <div className="bg-[#1a1f3a] border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
              Problems by Difficulty
            </h2>
            <div className="space-y-4">
              {difficultyData.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-400">{item.value} solved</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stats.totalProblemsSolved > 0 ? (item.value / stats.totalProblemsSolved * 100) : 0}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {stats.totalProblemsSolved === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No data yet. Start solving problems!
              </div>
            )}
          </div>

          {/* Pie Chart - Languages Used */}
          <div className="bg-[#1a1f3a] border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Code className="w-6 h-6 text-purple-400" />
              Language Distribution
            </h2>
            {languageData.length > 0 ? (
              <div className="space-y-3">
                {languageData.map((item, idx) => {
                  const colors = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];
                  const color = colors[idx % colors.length];
                  return (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-sm font-medium capitalize">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-cyan-400">{item.percentage}%</span>
                        <span className="text-xs text-gray-500 ml-2">({item.value})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No data yet. Start solving problems!
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1a1f3a] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-cyan-400" />
            Recent Activity
          </h2>
          
          {recentAttempts.length === 0 ? (
            <div className="text-center py-12">
              <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No activity yet</p>
              <Link href="/assignments">
                <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-colors">
                  Start Solving Problems
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAttempts.map((attempt, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-[#0a0e27] border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      attempt.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {attempt.passed ? <CheckCircle className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold">{attempt.problemTitle}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Code className="w-3 h-3" />
                          {attempt.language}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.floor(attempt.timeSpent / 60)}m
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(attempt.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(attempt.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
