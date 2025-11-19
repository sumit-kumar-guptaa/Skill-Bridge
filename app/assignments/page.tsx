'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import mermaid from 'mermaid';
import { progressTracker } from '@/lib/progressTracker';
import { 
  Code, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  List, 
  BookOpen,
  Zap,
  Target,
  Award,
  ChevronRight,
  Terminal,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Star,
  BarChart3,
  Lightbulb,
  Eye,
  Sparkles,
  Flame
} from 'lucide-react';

// SDE Sheet Problems (LeetCode-style)
const sdeSheetProblems = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Array',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    examples: [
      { input: '[2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {\n    // Your code here\n    \n}`,
      python: `def twoSum(nums, target):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: '[2,7,11,15], 9', expectedOutput: '[0,1]' },
      { input: '[3,2,4], 6', expectedOutput: '[1,2]' },
      { input: '[3,3], 6', expectedOutput: '[0,1]' }
    ],
    mermaidDiagram: `graph LR
    A[Input Array] --> B[Hash Map]
    B --> C{Found Complement?}
    C -->|Yes| D[Return Indices]
    C -->|No| E[Continue Loop]
    E --> B`
  },
  {
    id: 2,
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    category: 'Linked List',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    examples: [
      { input: '[1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: 'The list is reversed.' }
    ],
    constraints: [
      'The number of nodes in the list is the range [0, 5000].',
      '-5000 <= Node.val <= 5000'
    ],
    starterCode: {
      javascript: `function reverseList(head) {\n    // Your code here\n    \n}`,
      python: `def reverseList(head):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: '1->2->3->4->5', expectedOutput: '5->4->3->2->1' },
      { input: '1->2', expectedOutput: '2->1' },
      { input: '', expectedOutput: '' }
    ],
    mermaidDiagram: `graph LR
    A[1] --> B[2]
    B --> C[3]
    C --> D[4]
    D --> E[5]
    
    F[5] --> G[4]
    G --> H[3]
    H --> I[2]
    I --> J[1]`
  },
  {
    id: 3,
    title: 'Binary Search',
    difficulty: 'Easy',
    category: 'Binary Search',
    description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, return its index. Otherwise, return -1.',
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4' }
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All the integers in nums are unique.',
      'nums is sorted in ascending order.'
    ],
    starterCode: {
      javascript: `function search(nums, target) {\n    // Your code here\n    \n}`,
      python: `def search(nums, target):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public int search(int[] nums, int target) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: '[-1,0,3,5,9,12], 9', expectedOutput: '4' },
      { input: '[-1,0,3,5,9,12], 2', expectedOutput: '-1' }
    ],
    mermaidDiagram: `graph TD
    A[Start: left=0, right=n-1] --> B{left <= right?}
    B -->|Yes| C[mid = left + right / 2]
    C --> D{nums mid == target?}
    D -->|Yes| E[Return mid]
    D -->|No| F{nums mid < target?}
    F -->|Yes| G[left = mid + 1]
    F -->|No| H[right = mid - 1]
    G --> B
    H --> B
    B -->|No| I[Return -1]`
  },
  {
    id: 4,
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    examples: [
      { input: 's = "()"', output: 'true', explanation: 'The string has valid matching parentheses.' },
      { input: 's = "()[]{}"', output: 'true', explanation: 'All brackets are properly closed.' },
      { input: 's = "(]"', output: 'false', explanation: 'Mismatched brackets.' }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.'
    ],
    starterCode: {
      javascript: `function isValid(s) {\n    // Your code here\n    \n}`,
      python: `def isValid(s):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: '()', expectedOutput: 'true' },
      { input: '()[]{}', expectedOutput: 'true' },
      { input: '(]', expectedOutput: 'false' },
      { input: '([)]', expectedOutput: 'false' }
    ],
    mermaidDiagram: `graph TD
    A[Input String] --> B[Initialize Stack]
    B --> C{For each character}
    C --> D{Is opening bracket?}
    D -->|Yes| E[Push to Stack]
    D -->|No| F{Is closing bracket?}
    F -->|Yes| G{Stack empty?}
    G -->|Yes| H[Return false]
    G -->|No| I{Matches top?}
    I -->|Yes| J[Pop from Stack]
    I -->|No| H
    E --> C
    J --> C
    C --> K{End of string}
    K --> L{Stack empty?}
    L -->|Yes| M[Return true]
    L -->|No| H`
  },
  {
    id: 5,
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    category: 'Linked List',
    description: 'Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.',
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]', explanation: 'Both lists are merged into one sorted list.' }
    ],
    constraints: [
      'The number of nodes in both lists is in the range [0, 50].',
      '-100 <= Node.val <= 100',
      'Both list1 and list2 are sorted in non-decreasing order.'
    ],
    starterCode: {
      javascript: `function mergeTwoLists(list1, list2) {\n    // Your code here\n    \n}`,
      python: `def mergeTwoLists(list1, list2):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: '[1,2,4]\n[1,3,4]', expectedOutput: '[1,1,2,3,4,4]' },
      { input: '[]\n[]', expectedOutput: '[]' },
      { input: '[]\n[0]', expectedOutput: '[0]' }
    ],
    mermaidDiagram: `graph LR
    A[List1: 1→2→4] --> C[Merged]
    B[List2: 1→3→4] --> C
    C --> D[1→1→2→3→4→4]`
  },
  {
    id: 6,
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: '[4,-1,2,1] has the largest sum = 6.' }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    starterCode: {
      javascript: `function maxSubArray(nums) {\n    // Your code here\n    \n}`,
      python: `def maxSubArray(nums):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
      { input: '[1]', expectedOutput: '1' },
      { input: '[5,4,-1,7,8]', expectedOutput: '23' }
    ],
    mermaidDiagram: `graph TD
    A[Start: maxSum = nums 0] --> B[currentSum = nums 0]
    B --> C{For i=1 to n-1}
    C --> D[currentSum = max nums i, currentSum+nums i]
    D --> E[maxSum = max maxSum, currentSum]
    E --> C
    C --> F[Return maxSum]`
  },
  {
    id: 7,
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    category: 'Array',
    description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit you can achieve.',
    examples: [
      { input: '[7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' }
    ],
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4'
    ],
    starterCode: {
      javascript: `function maxProfit(prices) {\n    // Your code here\n    \n}`,
      python: `def maxProfit(prices):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public int maxProfit(int[] prices) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: '[7,1,5,3,6,4]', expectedOutput: '5' },
      { input: '[7,6,4,3,1]', expectedOutput: '0' }
    ],
    mermaidDiagram: `graph TD
    A[Start] --> B[minPrice = prices 0]
    B --> C[maxProfit = 0]
    C --> D{For each price}
    D --> E[Update minPrice]
    E --> F[Update maxProfit]
    F --> D
    D --> G[Return maxProfit]`
  },
  {
    id: 8,
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    category: 'Array',
    description: 'Given an integer array nums, return true if any value appears at least twice in the array.',
    examples: [
      { input: '[1,2,3,1]', output: 'true', explanation: 'The value 1 appears twice.' }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^9 <= nums[i] <= 10^9'
    ],
    starterCode: {
      javascript: `function containsDuplicate(nums) {\n    // Your code here\n    \n}`,
      python: `def containsDuplicate(nums):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: '[1,2,3,1]', expectedOutput: 'true' },
      { input: '[1,2,3,4]', expectedOutput: 'false' }
    ],
    mermaidDiagram: `graph LR
    A[Array] --> B[Hash Set]
    B --> C{Check Duplicates}
    C -->|Found| D[Return true]
    C -->|Not Found| E[Return false]`
  },
  {
    id: 9,
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    category: 'Array',
    description: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].',
    examples: [
      { input: '[1,2,3,4]', output: '[24,12,8,6]', explanation: 'Product of all except self at each position.' }
    ],
    constraints: [
      '2 <= nums.length <= 10^5',
      '-30 <= nums[i] <= 30'
    ],
    starterCode: {
      javascript: `function productExceptSelf(nums) {\n    // Your code here\n    \n}`,
      python: `def productExceptSelf(nums):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: '[1,2,3,4]', expectedOutput: '[24,12,8,6]' },
      { input: '[-1,1,0,-3,3]', expectedOutput: '[0,0,9,0,0]' }
    ],
    mermaidDiagram: `graph LR
    A[Left Products] --> B[Right Products]
    B --> C[Multiply Left×Right]
    C --> D[Result Array]`
  },
  {
    id: 10,
    title: '3Sum',
    difficulty: 'Medium',
    category: 'Array',
    description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
    examples: [
      { input: '[-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]', explanation: 'The distinct triplets that sum to zero.' }
    ],
    constraints: [
      '3 <= nums.length <= 3000',
      '-10^5 <= nums[i] <= 10^5'
    ],
    starterCode: {
      javascript: `function threeSum(nums) {\n    // Your code here\n    \n}`,
      python: `def threeSum(nums):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1,-1,2],[-1,0,1]]' },
      { input: '[0,1,1]', expectedOutput: '[]' }
    ],
    mermaidDiagram: `graph TD
    A[Sort Array] --> B[Fix First Element]
    B --> C[Two Pointer on Rest]
    C --> D{Sum == 0?}
    D -->|Yes| E[Add to Result]
    D -->|No| F[Move Pointers]
    F --> C`
  },
  {
    id: 11,
    title: 'Container With Most Water',
    difficulty: 'Medium',
    category: 'Two Pointers',
    description: 'Given n non-negative integers representing vertical lines, find two lines that together with the x-axis form a container with the most water.',
    examples: [
      { input: '[1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'Max area is between height 8 at index 1 and 7 at index 8.' }
    ],
    constraints: [
      'n == height.length',
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4'
    ],
    starterCode: {
      javascript: `function maxArea(height) {\n    // Your code here\n    \n}`,
      python: `def maxArea(height):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public int maxArea(int[] height) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49' },
      { input: '[1,1]', expectedOutput: '1' }
    ],
    mermaidDiagram: `graph LR
    A[Left Pointer] --> B[Right Pointer]
    B --> C[Calculate Area]
    C --> D{Move Shorter Side}
    D --> E[Update Max Area]`
  },
  {
    id: 12,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'String',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    examples: [
      { input: '"abcabcbb"', output: '3', explanation: 'The answer is "abc" with length 3.' }
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {\n    // Your code here\n    \n}`,
      python: `def lengthOfLongestSubstring(s):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: 'abcabcbb', expectedOutput: '3' },
      { input: 'bbbbb', expectedOutput: '1' },
      { input: 'pwwkew', expectedOutput: '3' }
    ],
    mermaidDiagram: `graph TD
    A[Sliding Window] --> B[Hash Set]
    B --> C{Duplicate Found?}
    C -->|Yes| D[Shrink Window]
    C -->|No| E[Expand Window]
    E --> F[Update Max Length]`
  },
  {
    id: 13,
    title: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    category: 'String',
    description: 'Given a string s, return the longest palindromic substring in s.',
    examples: [
      { input: '"babad"', output: '"bab" or "aba"', explanation: 'Both are valid palindromes.' }
    ],
    constraints: [
      '1 <= s.length <= 1000',
      's consist of only digits and English letters.'
    ],
    starterCode: {
      javascript: `function longestPalindrome(s) {\n    // Your code here\n    \n}`,
      python: `def longestPalindrome(s):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public String longestPalindrome(String s) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    string longestPalindrome(string s) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: 'babad', expectedOutput: 'bab' },
      { input: 'cbbd', expectedOutput: 'bb' }
    ],
    mermaidDiagram: `graph TD
    A[Expand Around Center] --> B{Check Odd Length}
    B --> C{Check Even Length}
    C --> D[Update Longest]
    D --> E[Move to Next Center]`
  },
  {
    id: 14,
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    description: 'You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    examples: [
      { input: '3', output: '3', explanation: 'Three ways: 1+1+1, 1+2, 2+1' }
    ],
    constraints: [
      '1 <= n <= 45'
    ],
    starterCode: {
      javascript: `function climbStairs(n) {\n    // Your code here\n    \n}`,
      python: `def climbStairs(n):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public int climbStairs(int n) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int climbStairs(int n) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: '2', expectedOutput: '2' },
      { input: '3', expectedOutput: '3' },
      { input: '5', expectedOutput: '8' }
    ],
    mermaidDiagram: `graph TD
    A[Base: n=1, n=2] --> B[DP Array]
    B --> C[dp i = dp i-1 + dp i-2]
    C --> D[Return dp n]`
  },
  {
    id: 15,
    title: 'House Robber',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description: 'You are a robber planning to rob houses along a street. Each house has a certain amount of money. Adjacent houses have security systems, so you cannot rob two adjacent houses.',
    examples: [
      { input: '[1,2,3,1]', output: '4', explanation: 'Rob house 1 (money = 1) and house 3 (money = 3).' }
    ],
    constraints: [
      '1 <= nums.length <= 100',
      '0 <= nums[i] <= 400'
    ],
    starterCode: {
      javascript: `function rob(nums) {\n    // Your code here\n    \n}`,
      python: `def rob(nums):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public int rob(int[] nums) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int rob(vector<int>& nums) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: '[1,2,3,1]', expectedOutput: '4' },
      { input: '[2,7,9,3,1]', expectedOutput: '12' }
    ],
    mermaidDiagram: `graph TD
    A[For each house] --> B{Rob or Skip?}
    B --> C[Rob: current + dp i-2]
    B --> D[Skip: dp i-1]
    C --> E[Take Maximum]
    D --> E`
  },
  {
    id: 16,
    title: 'Coin Change',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description: 'Given coins of different denominations and a total amount, compute the fewest number of coins needed to make up that amount.',
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' }
    ],
    constraints: [
      '1 <= coins.length <= 12',
      '1 <= coins[i] <= 2^31 - 1',
      '0 <= amount <= 10^4'
    ],
    starterCode: {
      javascript: `function coinChange(coins, amount) {\n    // Your code here\n    \n}`,
      python: `def coinChange(coins, amount):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public int coinChange(int[] coins, int amount) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: '[1,2,5]\n11', expectedOutput: '3' },
      { input: '[2]\n3', expectedOutput: '-1' }
    ],
    mermaidDiagram: `graph TD
    A[DP Array] --> B{For each amount}
    B --> C{Try each coin}
    C --> D[dp i = min dp i, 1+dp i-coin]
    D --> C
    C --> B`
  },
  {
    id: 17,
    title: 'Longest Increasing Subsequence',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description: 'Given an integer array nums, return the length of the longest strictly increasing subsequence.',
    examples: [
      { input: '[10,9,2,5,3,7,101,18]', output: '4', explanation: 'The longest increasing subsequence is [2,3,7,101].' }
    ],
    constraints: [
      '1 <= nums.length <= 2500',
      '-10^4 <= nums[i] <= 10^4'
    ],
    starterCode: {
      javascript: `function lengthOfLIS(nums) {\n    // Your code here\n    \n}`,
      python: `def lengthOfLIS(nums):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public int lengthOfLIS(int[] nums) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int lengthOfLIS(vector<int>& nums) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: '[10,9,2,5,3,7,101,18]', expectedOutput: '4' },
      { input: '[0,1,0,3,2,3]', expectedOutput: '4' }
    ],
    mermaidDiagram: `graph TD
    A[DP Array all 1] --> B{For each i}
    B --> C{For each j < i}
    C --> D{nums i > nums j?}
    D -->|Yes| E[dp i = max dp i, dp j+1]
    D -->|No| C`
  },
  {
    id: 18,
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    category: 'Array',
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'The elevation map traps 6 units of rain water.' },
      { input: 'height = [4,2,0,3,2,5]', output: '9', explanation: 'Water trapped between bars.' }
    ],
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5'
    ],
    starterCode: {
      javascript: `function trap(height) {\n    // Your code here\n    \n}`,
      python: `def trap(height):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public int trap(int[] height) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' },
      { input: '[4,2,0,3,2,5]', expectedOutput: '9' }
    ],
    mermaidDiagram: `graph TD
    A[Two Pointers: left, right] --> B{left < right?}
    B -->|Yes| C{leftMax < rightMax?}
    C -->|Yes| D[Water += leftMax - height[left]]
    D --> E[left++]
    C -->|No| F[Water += rightMax - height[right]]
    F --> G[right--]
    E --> B
    G --> B
    B -->|No| H[Return Water]`
  },
  {
    id: 19,
    title: 'Word Ladder',
    difficulty: 'Hard',
    category: 'Graph',
    description: 'Given two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord.',
    examples: [
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5', explanation: 'hit -> hot -> dot -> dog -> cog' },
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: '0', explanation: 'endWord not in wordList.' }
    ],
    constraints: [
      '1 <= beginWord.length <= 10',
      'endWord.length == beginWord.length',
      '1 <= wordList.length <= 5000',
      'All words have same length'
    ],
    starterCode: {
      javascript: `function ladderLength(beginWord, endWord, wordList) {\n    // Your code here\n    \n}`,
      python: `def ladderLength(beginWord, endWord, wordList):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public int ladderLength(String beginWord, String endWord, List<String> wordList) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: 'hit\ncog\n["hot","dot","dog","lot","log","cog"]', expectedOutput: '5' },
      { input: 'hit\ncog\n["hot","dot","dog","lot","log"]', expectedOutput: '0' }
    ],
    mermaidDiagram: `graph TD
    A[BFS from beginWord] --> B{Try All 1-Char Changes}
    B --> C{Word in Dictionary?}
    C -->|Yes| D[Add to Queue]
    D --> E{Reached endWord?}
    E -->|Yes| F[Return Level]
    E -->|No| B
    C -->|No| B`
  },
  {
    id: 20,
    title: 'Merge Intervals',
    difficulty: 'Medium',
    category: 'Array',
    description: 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.',
    examples: [
      { input: '[[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: 'Intervals [1,3] and [2,6] overlap.' }
    ],
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= starti <= endi <= 10^4'
    ],
    starterCode: {
      javascript: `function merge(intervals) {\n    // Your code here\n    \n}`,
      python: `def merge(intervals):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public int[][] merge(int[][] intervals) {\n        // Your code here\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        // Your code here\n        \n    }\n};`
    },
    testCases: [
      { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]' },
      { input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]' }
    ],
    mermaidDiagram: `graph TD
    A[Sort by Start] --> B[First Interval]
    B --> C{Next Interval Overlaps?}
    C -->|Yes| D[Merge Intervals]
    C -->|No| E[Add to Result]
    D --> C
    E --> C`
  }
];

// ML Engineer Problems
const mlEngineerProblems = [
  {
    id: 101,
    title: 'Linear Regression Implementation',
    difficulty: 'Easy',
    category: 'Machine Learning',
    description: 'Implement linear regression from scratch using gradient descent. Calculate predictions and mean squared error.',
    examples: [
      { input: 'X = [[1], [2], [3]], y = [2, 4, 6]', output: 'slope ≈ 2, intercept ≈ 0', explanation: 'Perfect linear relationship y = 2x' }
    ],
    constraints: [
      'X is a 2D array (n_samples, n_features)',
      'y is a 1D array (n_samples,)',
      'Use gradient descent with learning rate 0.01'
    ],
    starterCode: {
      javascript: `// Linear Regression in JavaScript
function linearRegression(X, y, learningRate = 0.01, epochs = 1000) {
    // Your code here
    
}

// Test
const X = [[1], [2], [3], [4], [5]];
const y = [2, 4, 6, 8, 10];
console.log(linearRegression(X, y));`,
      python: `import numpy as np

def linear_regression(X, y, learning_rate=0.01, epochs=1000):
    """
    Implement linear regression using gradient descent
    Returns: (weights, bias, mse)
    """
    # Your code here
    pass

# Test
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2, 4, 6, 8, 10])
weights, bias, mse = linear_regression(X, y)
print(f"Weights: {weights}, Bias: {bias}, MSE: {mse}")`,
      java: `// Java implementation
class LinearRegression {
    public static void main(String[] args) {
        // Your code here
        double[][] X = {{1}, {2}, {3}, {4}, {5}};
        double[] y = {2, 4, 6, 8, 10};
        System.out.println("Implement linear regression");
    }
}`,
      cpp: `// C++ implementation
#include <iostream>
#include <vector>
using namespace std;

int main() {
    // Your code here
    vector<vector<double>> X = {{1}, {2}, {3}, {4}, {5}};
    vector<double> y = {2, 4, 6, 8, 10};
    cout << "Implement linear regression" << endl;
    return 0;
}`
    },
    testCases: [
      { input: 'X=[[1],[2],[3]], y=[2,4,6]', expectedOutput: 'MSE < 0.01' },
      { input: 'X=[[1],[2],[3],[4]], y=[3,5,7,9]', expectedOutput: 'slope ≈ 2' }
    ],
    mermaidDiagram: `graph TD
    A[Input Data X, y] --> B[Initialize Weights]
    B --> C[Calculate Predictions]
    C --> D[Compute Loss MSE]
    D --> E[Gradient Descent]
    E --> F{Converged?}
    F -->|No| C
    F -->|Yes| G[Return Model]`
  },
  {
    id: 102,
    title: 'K-Means Clustering',
    difficulty: 'Medium',
    category: 'Machine Learning',
    description: 'Implement K-Means clustering algorithm from scratch. Assign points to clusters and update centroids iteratively.',
    examples: [
      { input: 'points = [[1,1], [2,1], [8,8], [9,9]], k=2', output: 'clusters: [[1,1],[2,1]] and [[8,8],[9,9]]', explanation: 'Two distinct clusters' }
    ],
    constraints: [
      '1 <= k <= n_samples',
      'Use Euclidean distance',
      'Max 100 iterations'
    ],
    starterCode: {
      python: `import numpy as np

def kmeans(X, k, max_iters=100):
    """
    K-Means clustering algorithm
    Returns: (cluster_labels, centroids)
    """
    # Your code here
    pass

# Test
X = np.array([[1,1], [2,1], [8,8], [9,9], [1,2]])
labels, centroids = kmeans(X, k=2)
print(f"Labels: {labels}")
print(f"Centroids: {centroids}")`,
      javascript: `function kmeans(X, k, maxIters = 100) {
    // Your code here
    
}

// Test
const X = [[1,1], [2,1], [8,8], [9,9], [1,2]];
console.log(kmeans(X, 2));`,
      java: `// Java K-Means
class KMeans {
    public static void main(String[] args) {
        // Your code here
        System.out.println("K-Means clustering");
    }
}`,
      cpp: `// C++ K-Means
#include <iostream>
using namespace std;

int main() {
    // Your code here
    cout << "K-Means clustering" << endl;
    return 0;
}`
    },
    testCases: [
      { input: 'X=[[1,1],[2,1],[8,8],[9,9]], k=2', expectedOutput: '2 clusters formed' }
    ],
    mermaidDiagram: `graph TD
    A[Initialize K Centroids] --> B[Assign Points to Nearest Centroid]
    B --> C[Update Centroids]
    C --> D{Converged?}
    D -->|No| B
    D -->|Yes| E[Return Clusters]`
  },
  {
    id: 103,
    title: 'Decision Tree Classifier',
    difficulty: 'Hard',
    category: 'Machine Learning',
    description: 'Build a decision tree classifier using information gain (entropy). Implement recursive splitting and prediction.',
    examples: [
      { input: 'Features: weather, temperature | Target: play_tennis', output: 'Tree with splits on best features', explanation: 'Maximize information gain' }
    ],
    constraints: [
      'Use entropy for impurity',
      'Max depth = 5',
      'Binary classification'
    ],
    starterCode: {
      python: `import numpy as np

class DecisionTree:
    def __init__(self, max_depth=5):
        self.max_depth = max_depth
        self.tree = None
    
    def fit(self, X, y):
        """Build decision tree"""
        # Your code here
        pass
    
    def predict(self, X):
        """Make predictions"""
        # Your code here
        pass

# Test
X = np.array([[1, 1], [1, 0], [0, 1], [0, 0]])
y = np.array([1, 0, 0, 0])
dt = DecisionTree()
dt.fit(X, y)
print(dt.predict([[1, 1]]))`,
      javascript: `class DecisionTree {
    constructor(maxDepth = 5) {
        this.maxDepth = maxDepth;
    }
    
    fit(X, y) {
        // Your code here
    }
    
    predict(X) {
        // Your code here
    }
}

// Test
const dt = new DecisionTree();
console.log(dt);`,
      java: `// Java Decision Tree
class DecisionTree {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Decision Tree");
    }
}`,
      cpp: `// C++ Decision Tree
#include <iostream>
using namespace std;

int main() {
    // Your code here
    cout << "Decision Tree" << endl;
    return 0;
}`
    },
    testCases: [
      { input: 'Binary features, binary target', expectedOutput: 'Correct splits' }
    ],
    mermaidDiagram: `graph TD
    A[Root Node] --> B{Best Split Feature?}
    B --> C[Calculate Entropy]
    C --> D[Information Gain]
    D --> E[Split Node]
    E --> F[Left Child]
    E --> G[Right Child]
    F --> H{Leaf?}
    G --> I{Leaf?}`
  }
];

// AI Engineer Problems
const aiEngineerProblems = [
  {
    id: 201,
    title: 'Neural Network Forward Pass',
    difficulty: 'Medium',
    category: 'Deep Learning',
    description: 'Implement forward propagation for a simple neural network with one hidden layer. Include activation functions.',
    examples: [
      { input: 'X = [[0.5, 0.3]], weights, bias', output: 'predictions after sigmoid activation', explanation: 'Forward pass through network' }
    ],
    constraints: [
      'Use sigmoid activation',
      'Input: (batch_size, features)',
      'Hidden layer: 4 neurons'
    ],
    starterCode: {
      python: `import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def forward_pass(X, W1, b1, W2, b2):
    """
    Forward propagation through neural network
    X: input (n_samples, n_features)
    W1: weights layer 1 (n_features, hidden_size)
    W2: weights layer 2 (hidden_size, output_size)
    Returns: (hidden_output, final_output)
    """
    # Your code here
    pass

# Test
X = np.array([[0.5, 0.3]])
W1 = np.random.randn(2, 4)
b1 = np.zeros(4)
W2 = np.random.randn(4, 1)
b2 = np.zeros(1)
hidden, output = forward_pass(X, W1, b1, W2, b2)
print(f"Output: {output}")`,
      javascript: `function sigmoid(x) {
    // Your code here
}

function forwardPass(X, W1, b1, W2, b2) {
    // Your code here
}

// Test
console.log("Implement neural network forward pass");`,
      java: `// Java Neural Network
class NeuralNetwork {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Neural Network");
    }
}`,
      cpp: `// C++ Neural Network
#include <iostream>
using namespace std;

int main() {
    // Your code here
    cout << "Neural Network" << endl;
    return 0;
}`
    },
    testCases: [
      { input: 'X shape (1,2), Output shape (1,1)', expectedOutput: 'Value between 0 and 1' }
    ],
    mermaidDiagram: `graph LR
    A[Input Layer] --> B[Hidden Layer]
    B --> C[Activation Sigmoid]
    C --> D[Output Layer]
    D --> E[Final Activation]`
  },
  {
    id: 202,
    title: 'Transformer Attention Mechanism',
    difficulty: 'Hard',
    category: 'NLP',
    description: 'Implement scaled dot-product attention mechanism used in Transformers. Calculate query, key, value matrices.',
    examples: [
      { input: 'Q, K, V matrices', output: 'Attention weights and context', explanation: 'Self-attention computation' }
    ],
    constraints: [
      'Use softmax for attention weights',
      'Scale by sqrt(d_k)',
      'd_model = 64'
    ],
    starterCode: {
      python: `import numpy as np

def scaled_dot_product_attention(Q, K, V):
    """
    Compute scaled dot-product attention
    Q: queries (batch, seq_len, d_k)
    K: keys (batch, seq_len, d_k)
    V: values (batch, seq_len, d_v)
    Returns: (context, attention_weights)
    """
    # Your code here
    pass

# Test
d_k = 64
Q = np.random.randn(1, 10, d_k)  # batch=1, seq_len=10
K = np.random.randn(1, 10, d_k)
V = np.random.randn(1, 10, d_k)
context, weights = scaled_dot_product_attention(Q, K, V)
print(f"Context shape: {context.shape}")
print(f"Attention weights shape: {weights.shape}")`,
      javascript: `function scaledDotProductAttention(Q, K, V) {
    // Your code here
}

// Test
console.log("Implement transformer attention");`,
      java: `// Java Transformer Attention
class Attention {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Transformer Attention");
    }
}`,
      cpp: `// C++ Transformer Attention
#include <iostream>
using namespace std;

int main() {
    // Your code here
    cout << "Transformer Attention" << endl;
    return 0;
}`
    },
    testCases: [
      { input: 'Q,K,V shape (1,10,64)', expectedOutput: 'Context (1,10,64), Weights (1,10,10)' }
    ],
    mermaidDiagram: `graph TD
    A[Query Q] --> B[Q·K^T]
    C[Key K] --> B
    B --> D[Scale by sqrt d_k]
    D --> E[Softmax]
    E --> F[Attention Weights]
    F --> G[Weights·V]
    H[Value V] --> G
    G --> I[Context Vector]`
  },
  {
    id: 203,
    title: 'Image Convolution',
    difficulty: 'Medium',
    category: 'Computer Vision',
    description: 'Implement 2D convolution operation for image processing. Apply kernel/filter to detect features.',
    examples: [
      { input: 'image (28x28), kernel (3x3)', output: 'feature map (26x26)', explanation: 'Edge detection or blur' }
    ],
    constraints: [
      'No padding (valid convolution)',
      'Stride = 1',
      'Handle grayscale images'
    ],
    starterCode: {
      python: `import numpy as np

def convolve2d(image, kernel):
    """
    2D Convolution operation
    image: (height, width)
    kernel: (k_height, k_width)
    Returns: feature_map
    """
    # Your code here
    pass

# Test - Edge detection kernel
image = np.random.rand(28, 28)
kernel = np.array([[-1, -1, -1],
                   [-1,  8, -1],
                   [-1, -1, -1]])
feature_map = convolve2d(image, kernel)
print(f"Feature map shape: {feature_map.shape}")`,
      javascript: `function convolve2d(image, kernel) {
    // Your code here
}

// Test
const image = Array(28).fill().map(() => Array(28).fill(0.5));
const kernel = [[-1,-1,-1], [-1,8,-1], [-1,-1,-1]];
console.log(convolve2d(image, kernel));`,
      java: `// Java Convolution
class Convolution {
    public static void main(String[] args) {
        // Your code here
        System.out.println("2D Convolution");
    }
}`,
      cpp: `// C++ Convolution
#include <iostream>
using namespace std;

int main() {
    // Your code here
    cout << "2D Convolution" << endl;
    return 0;
}`
    },
    testCases: [
      { input: 'Image (28,28), Kernel (3,3)', expectedOutput: 'Output (26,26)' }
    ],
    mermaidDiagram: `graph TD
    A[Input Image] --> B[Slide Kernel]
    B --> C[Element-wise Multiply]
    C --> D[Sum Values]
    D --> E[Feature Map]`
  }
];

// DevOps Engineer Problems
const devOpsProblems = [
  {
    id: 301,
    title: 'Docker Multi-Stage Build',
    difficulty: 'Easy',
    category: 'Containerization',
    description: 'Create a Dockerfile with multi-stage build to optimize image size for a Node.js application.',
    examples: [
      { input: 'Node.js app with dependencies', output: 'Optimized Docker image < 100MB', explanation: 'Separate build and runtime stages' }
    ],
    constraints: [
      'Use alpine base images',
      'Copy only necessary files',
      'Remove dev dependencies in production'
    ],
    starterCode: {
      dockerfile: `# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
# Your code here - Install dependencies

# Production stage
FROM node:18-alpine
WORKDIR /app
# Your code here - Copy artifacts and run

EXPOSE 3000
CMD ["node", "server.js"]`,
      yaml: `# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production`,
      java: `// Java - Not applicable for Docker
// Use Dockerfile above`,
      cpp: `// C++ - Not applicable for Docker
// Use Dockerfile above`
    },
    testCases: [
      { input: 'Node.js app', expectedOutput: 'Image size < 100MB' },
      { input: 'npm install', expectedOutput: 'Only production deps in final image' }
    ],
    mermaidDiagram: `graph LR
    A[Source Code] --> B[Build Stage]
    B --> C[Install All Dependencies]
    C --> D[Build Application]
    D --> E[Production Stage]
    E --> F[Copy Build Artifacts]
    F --> G[Install Prod Deps Only]
    G --> H[Final Image]`
  },
  {
    id: 302,
    title: 'CI/CD Pipeline Script',
    difficulty: 'Medium',
    category: 'CI/CD',
    description: 'Write a GitHub Actions workflow to build, test, and deploy a web application automatically.',
    examples: [
      { input: 'Push to main branch', output: 'Auto deploy to production', explanation: 'Complete CI/CD pipeline' }
    ],
    constraints: [
      'Run tests before deploy',
      'Build Docker image',
      'Deploy only on main branch'
    ],
    starterCode: {
      yaml: `# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      # Your code here
      # Add steps for:
      # 1. Setup Node.js
      # 2. Install dependencies
      # 3. Run tests
      # 4. Build Docker image
      # 5. Push to registry
      # 6. Deploy to server
      
      - name: Deploy
        run: echo "Deploy to production"`,
      javascript: `// Alternative: Simple deploy script
const { exec } = require('child_process');

async function deploy() {
    // Your deployment logic
    console.log('Starting deployment...');
}

deploy();`,
      java: `// Java - Use YAML workflow above
// CI/CD configuration in YAML`,
      cpp: `// C++ - Use YAML workflow above
// CI/CD configuration in YAML`
    },
    testCases: [
      { input: 'git push origin main', expectedOutput: 'Pipeline triggers automatically' },
      { input: 'Tests fail', expectedOutput: 'Deployment blocked' }
    ],
    mermaidDiagram: `graph TD
    A[Git Push] --> B[Trigger Pipeline]
    B --> C[Checkout Code]
    C --> D[Install Dependencies]
    D --> E[Run Tests]
    E --> F{Tests Pass?}
    F -->|Yes| G[Build Image]
    F -->|No| H[Fail Pipeline]
    G --> I[Push to Registry]
    I --> J[Deploy to Server]`
  },
  {
    id: 303,
    title: 'Kubernetes Deployment',
    difficulty: 'Hard',
    category: 'Orchestration',
    description: 'Create Kubernetes manifests for deploying a microservice with auto-scaling, health checks, and load balancing.',
    examples: [
      { input: 'Microservice app', output: 'K8s deployment with 3 replicas', explanation: 'High availability setup' }
    ],
    constraints: [
      'Use deployment, service, and HPA',
      'Health checks (liveness & readiness)',
      'Resource limits defined'
    ],
    starterCode: {
      yaml: `# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
        - containerPort: 8080
        # Your code here
        # Add: resources, livenessProbe, readinessProbe

---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  # Your code here
  # Define service type and ports

---
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  # Your code here
  # Configure auto-scaling`,
      bash: `# Apply manifests
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f hpa.yaml

# Verify
kubectl get pods
kubectl get svc`,
      java: `// Java - Use K8s YAML above
// Kubernetes manifests in YAML`,
      cpp: `// C++ - Use K8s YAML above
// Kubernetes manifests in YAML`
    },
    testCases: [
      { input: 'kubectl apply', expectedOutput: 'Deployment created with 3 pods' },
      { input: 'High CPU load', expectedOutput: 'Auto-scale to max replicas' }
    ],
    mermaidDiagram: `graph TD
    A[Load Balancer] --> B[Service]
    B --> C[Pod 1]
    B --> D[Pod 2]
    B --> E[Pod 3]
    F[HPA] --> G{CPU > 80%?}
    G -->|Yes| H[Scale Up]
    G -->|No| I[Maintain]
    H --> J[Add More Pods]`
  }
];

export default function AssignmentsPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [category, setCategory] = useState<'SDE' | 'ML' | 'AI' | 'DevOps'>('SDE');
  const [selectedProblem, setSelectedProblem] = useState(sdeSheetProblems[0]);
  const [code, setCode] = useState(sdeSheetProblems[0].starterCode.javascript);
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'diagram' | 'submissions'>('description');
  const [showProblemList, setShowProblemList] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [hint, setHint] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [loadingHint, setLoadingHint] = useState(false);
  const [codeReview, setCodeReview] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [similarProblems, setSimilarProblems] = useState<any[]>([]);
  const [showSimilar, setShowSimilar] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [showSubmit, setShowSubmit] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  // Domain Lock System States
  const [domainStatus, setDomainStatus] = useState<any>(null);
  const [showDomainSelector, setShowDomainSelector] = useState(false);
  const [loadingDomain, setLoadingDomain] = useState(true);
  const [domainError, setDomainError] = useState('');

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/');
    }
  }, [isLoaded, userId, router]);

  // Fetch domain status (MVP: Domain Lock System)
  useEffect(() => {
    if (userId) {
      fetchDomainStatus();
    }
  }, [userId]);

  const fetchDomainStatus = async () => {
    try {
      setLoadingDomain(true);
      const response = await fetch('/api/domain/status');
      const data = await response.json();
      
      setDomainStatus(data);
      
      // If user hasn't selected a domain, show selector
      if (!data.hasSelectedDomain) {
        setShowDomainSelector(true);
      } else {
        // Set category to user's selected domain
        setCategory(data.selectedDomain);
      }
    } catch (error) {
      console.error('Error fetching domain status:', error);
      setDomainError('Failed to load domain status');
    } finally {
      setLoadingDomain(false);
    }
  };

  const handleDomainSelect = async (domain: string) => {
    try {
      setLoadingDomain(true);
      setDomainError('');
      
      const response = await fetch('/api/domain/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setShowDomainSelector(false);
        setCategory(domain as any);
        await fetchDomainStatus();
      } else {
        setDomainError(data.error || 'Failed to select domain');
      }
    } catch (error) {
      console.error('Error selecting domain:', error);
      setDomainError('Failed to select domain');
    } finally {
      setLoadingDomain(false);
    }
  };

  // Prevent switching to locked domains
  const handleCategoryChange = (newCategory: 'SDE' | 'ML' | 'AI' | 'DevOps') => {
    if (!domainStatus) return;
    
    // Check if domain is locked
    if (domainStatus.lockedDomains?.includes(newCategory)) {
      alert(`🔒 ${newCategory} is locked! Complete all ${domainStatus.selectedDomain} assignments first.`);
      return;
    }
    
    setCategory(newCategory);
  };

  // Get current problem set based on category
  const getCurrentProblems = () => {
    switch (category) {
      case 'ML': return mlEngineerProblems;
      case 'AI': return aiEngineerProblems;
      case 'DevOps': return devOpsProblems;
      default: return sdeSheetProblems;
    }
  };

  const currentProblems = getCurrentProblems();

  // Update selected problem when category changes
  useEffect(() => {
    const problems = getCurrentProblems();
    setSelectedProblem(problems[0] as any);
    const firstCode = (problems[0].starterCode as any)[language] || 
                      (problems[0].starterCode as any).javascript || 
                      (problems[0].starterCode as any).python || '';
    setCode(firstCode);
  }, [category]);

  // Load user progress
  useEffect(() => {
    if (userId) {
      progressTracker.getProgress(userId).then(progress => {
        setUserProgress(progress);
      });
    }
  }, [userId]);

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true, 
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#1a1f3a',
        primaryColor: '#06b6d4',
        primaryTextColor: '#fff',
        primaryBorderColor: '#22d3ee',
        lineColor: '#22d3ee',
        secondaryColor: '#3b82f6',
        tertiaryColor: '#8b5cf6'
      }
    });
  }, []);

  useEffect(() => {
    if (diagramRef.current && selectedProblem.mermaidDiagram) {
      diagramRef.current.innerHTML = '';
      const id = `mermaid-${Date.now()}`;
      const div = document.createElement('div');
      div.className = 'mermaid';
      div.textContent = selectedProblem.mermaidDiagram;
      diagramRef.current.appendChild(div);
      mermaid.contentLoaded();
    }
  }, [selectedProblem, activeTab]);

  const handleProblemSelect = (problem: any) => {
    setSelectedProblem(problem as any);
    setCode((problem.starterCode as any)[language] || problem.starterCode.javascript);
    setOutput('');
    setTestResults(null);
    setHint('');
    setShowHint(false);
    setHintLevel(0);
    setCodeReview('');
    setShowReview(false);
    setSimilarProblems([]);
    setShowSimilar(false);
    setStartTime(Date.now());
    setShowSubmit(false); // Reset submit button
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(selectedProblem.starterCode[newLang as keyof typeof selectedProblem.starterCode] || selectedProblem.starterCode.javascript);
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    setTestResults(null);

    try {
      // Get function name from problem title (camelCase)
      const getFunctionName = (title: string) => {
        const words = title.split(' ');
        return words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('').replace(/[^a-zA-Z0-9]/g, '');
      };
      
      const functionName = getFunctionName(selectedProblem.title);
      
      // Wrap the user's code to call the function with test inputs
      const wrappedTestCases = selectedProblem.testCases.map(tc => {
        let wrappedCode = '';
        
        if (language === 'javascript') {
          wrappedCode = `${code}\n\n// Test execution\nconst result = ${functionName}(${tc.input});\nconsole.log(JSON.stringify(result));`;
        } else if (language === 'python') {
          wrappedCode = `${code}\n\n# Test execution\nimport json\nresult = ${functionName}(${tc.input})\nprint(json.dumps(result) if isinstance(result, (list, dict)) else result)`;
        } else if (language === 'java') {
          // For Binary Search: [-1,0,3,5,9,12], 9
          if (selectedProblem.id === 3) {
            // Extract array and target
            const arrayMatch = tc.input.match(/\[([\d,\-\s]+)\]/);
            const targetMatch = tc.input.match(/,\s*([\-\d]+)$/);
            
            if (arrayMatch && targetMatch) {
              const arrayStr = `{${arrayMatch[1]}}`;
              const target = targetMatch[1];
              
              // Extract the method body and properly wrap it
              let methodCode = code;
              
              // Check if it's a static method
              const isStatic = code.includes('public static');
              
              if (isStatic) {
                // If static, we can call directly
                wrappedCode = `${code}

public class Main {
    public static void main(String[] args) {
        int[] nums = ${arrayStr};
        int target = ${target};
        int result = Solution.search(nums, target);
        System.out.println(result);
    }
}`;
              } else {
                // If not static, create instance
                wrappedCode = `${code}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] nums = ${arrayStr};
        int target = ${target};
        int result = sol.search(nums, target);
        System.out.println(result);
    }
}`;
              }
            } else {
              wrappedCode = code;
            }
          } else {
            // For other problems, just use the code as-is for now
            wrappedCode = code;
          }
        } else if (language === 'cpp') {
          // C++ needs main wrapper - similar approach
          wrappedCode = code;
        }
        
        return {
          input: tc.input, // Pass the actual input for display
          expectedOutput: tc.expectedOutput,
          wrappedCode
        };
      });

      const response = await fetch('/api/judge0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          testCases: wrappedTestCases
        })
      });

      const result = await response.json();
      
      if (result.error) {
        setOutput(`Error: ${result.error}\n${result.details || ''}`);
        setShowSubmit(false);
      } else {
        setTestResults(result);
        setOutput(result.summary || 'Code executed successfully');
        
        // Show submit button only if all tests passed
        if (result.allPassed) {
          setShowSubmit(true);
        } else {
          setShowSubmit(false);
        }
        
        // Save progress if tests passed (handled in submit now)
      }
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
      setShowSubmit(false);
    } finally {
      setIsRunning(false);
    }
  };

  const submitSolution = async () => {
    if (!userId || !testResults?.allPassed) return;
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    progressTracker.saveProblemAttempt(userId, {
      problemId: selectedProblem.id,
      problemTitle: selectedProblem.title,
      timestamp: Date.now(),
      passed: true,
      language,
      timeSpent,
    });
    
    // Show success notification
    setOutput('✅ Solution submitted successfully! You earned credits.');
    
    // Reset submit button
    setShowSubmit(false);
  };

  const getHint = async () => {
    if (hintLevel >= 3) {
      setHint('You\'ve used all available hints! Try solving it on your own now.');
      return;
    }

    setLoadingHint(true);
    const nextLevel = hintLevel + 1;
    
    try {
      const response = await fetch('/api/ai-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: selectedProblem.title,
          problemDescription: selectedProblem.description,
          userCode: code,
          hintLevel: nextLevel,
          problemId: selectedProblem.id, // Pass problem ID for MCP context
        }),
      });

      const data = await response.json();
      setHint(data.hint);
      setShowHint(true);
      setHintLevel(nextLevel);
      
      // Show MCP enhancement indicator if available
      if (data.mcpEnhanced) {
        console.log('✅ MCP-enhanced hint with personalized context');
      }
    } catch (error) {
      setHint('Failed to get hint. Please try again.');
    } finally {
      setLoadingHint(false);
    }
  };

  const reviewCode = async () => {
    setLoadingReview(true);
    
    try {
      const response = await fetch('/api/code-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          problemTitle: selectedProblem.title,
          problemDescription: selectedProblem.description,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        setCodeReview(`Error: ${data.error}`);
      } else if (data.review) {
        setCodeReview(data.review);
      } else {
        setCodeReview('No review received. Please try again.');
      }
      
      setShowReview(true);
    } catch (error: any) {
      console.error('Code review error:', error);
      setCodeReview(`Failed to review code: ${error.message || 'Unknown error'}. Please check your API key and try again.`);
      setShowReview(true);
    } finally {
      setLoadingReview(false);
    }
  };

  const getSimilarProblems = async () => {
    try {
      const response = await fetch('/api/similar-problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: selectedProblem.title,
          category: selectedProblem.category,
          difficulty: selectedProblem.difficulty,
        }),
      });

      const data = await response.json();
      setSimilarProblems(data.problems || []);
      setShowSimilar(true);
    } catch (error) {
      console.error('Failed to fetch similar problems');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'Hard': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  if (!isLoaded || !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] to-[#1a1f3a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#1a1f3a] text-white flex flex-col overflow-hidden">
      {/* LeetCode-style Header */}
      <div className="border-b border-gray-800 bg-[#0a0e27] flex items-center justify-between px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-orange-500" />
            <span className="text-lg font-bold text-white">Problems</span>
          </div>
          
          {/* Category Tabs with Domain Lock */}
          <div className="flex items-center gap-2 bg-[#1a1f3a] rounded-lg p-1">
            <button
              onClick={() => handleCategoryChange('SDE')}
              disabled={domainStatus?.lockedDomains?.includes('SDE')}
              className={`px-4 py-2 rounded text-sm font-semibold transition-all relative ${
                category === 'SDE' 
                  ? 'bg-orange-500 text-white shadow-lg' 
                  : domainStatus?.lockedDomains?.includes('SDE')
                  ? 'text-gray-600 bg-gray-900 cursor-not-allowed opacity-50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {domainStatus?.lockedDomains?.includes('SDE') && (
                <span className="absolute -top-1 -right-1 text-xs">🔒</span>
              )}
              📊 SDE Sheet
            </button>
            <button
              onClick={() => handleCategoryChange('ML')}
              disabled={domainStatus?.lockedDomains?.includes('ML')}
              className={`px-4 py-2 rounded text-sm font-semibold transition-all relative ${
                category === 'ML' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : domainStatus?.lockedDomains?.includes('ML')
                  ? 'text-gray-600 bg-gray-900 cursor-not-allowed opacity-50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {domainStatus?.lockedDomains?.includes('ML') && (
                <span className="absolute -top-1 -right-1 text-xs">🔒</span>
              )}
              🤖 ML Engineer
            </button>
            <button
              onClick={() => handleCategoryChange('AI')}
              disabled={domainStatus?.lockedDomains?.includes('AI')}
              className={`px-4 py-2 rounded text-sm font-semibold transition-all relative ${
                category === 'AI' 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : domainStatus?.lockedDomains?.includes('AI')
                  ? 'text-gray-600 bg-gray-900 cursor-not-allowed opacity-50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {domainStatus?.lockedDomains?.includes('AI') && (
                <span className="absolute -top-1 -right-1 text-xs">🔒</span>
              )}
              🧠 AI Engineer
            </button>
            <button
              onClick={() => handleCategoryChange('DevOps')}
              disabled={domainStatus?.lockedDomains?.includes('DevOps')}
              className={`px-4 py-2 rounded text-sm font-semibold transition-all relative ${
                category === 'DevOps' 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : domainStatus?.lockedDomains?.includes('DevOps')
                  ? 'text-gray-600 bg-gray-900 cursor-not-allowed opacity-50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {domainStatus?.lockedDomains?.includes('DevOps') && (
                <span className="absolute -top-1 -right-1 text-xs">🔒</span>
              )}
              ⚙️ DevOps
            </button>
          </div>

          {/* Domain Progress Indicator */}
          {domainStatus?.selectedDomain && domainStatus?.currentProgress && (
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg px-4 py-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">
                  {domainStatus.selectedDomain} Progress: {domainStatus.currentProgress.solved}/{domainStatus.currentProgress.required}
                </span>
                <span className="text-cyan-400 font-semibold">
                  {domainStatus.currentProgress.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${domainStatus.currentProgress.percentage}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-4 text-sm">
            <button 
              onClick={() => setShowProblemList(!showProblemList)}
              className={`transition-colors px-3 py-1 rounded hover:bg-gray-800 ${
                showProblemList ? 'text-cyan-400 bg-gray-800' : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4 inline mr-1" />
              {showProblemList ? 'Hide' : 'Show'} List
            </button>
            <button className="text-cyan-400 border-b-2 border-cyan-400 px-3 py-1">
              Solve
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/progress">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg border border-purple-500/30 transition-colors">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-purple-400">Progress</span>
            </button>
          </Link>
          {userId && userProgress && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-semibold text-yellow-400">
                {userProgress.credits} Credits
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-lg border border-green-500/30">
            <Award className="w-4 h-4 text-green-400" />
            <span className="text-xs font-semibold text-green-400">
              {userProgress ? userProgress.totalProblemsSolved : 0}/{currentProblems.length}
            </span>
          </div>
          {userId && userProgress && userProgress.dailyStreak.currentStreak > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 rounded-lg border border-orange-500/30">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-semibold text-orange-400">
                {userProgress.dailyStreak.currentStreak} day streak
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Problem List */}
        {showProblemList && (
        <div className="w-80 border-r border-gray-800 bg-[#0a0e27] flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-300">Problem Set</h2>
              <span className="text-xs text-gray-500">{currentProblems.length} problems</span>
            </div>
            <input
              type="text"
              placeholder="Search problems..."
              className="w-full bg-[#1a1f3a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {currentProblems.map((problem, idx) => (
              <button
                key={problem.id}
                onClick={() => handleProblemSelect(problem)}
                className={`w-full text-left p-4 border-b border-gray-800 transition-all hover:bg-[#1a1f3a] ${
                  selectedProblem.id === problem.id ? 'bg-[#1a1f3a] border-l-4 border-l-cyan-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                    {problem.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white mb-1 truncate">{problem.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        problem.difficulty === 'Easy' ? 'text-green-400 bg-green-500/20' :
                        problem.difficulty === 'Medium' ? 'text-yellow-400 bg-yellow-500/20' :
                        'text-red-400 bg-red-500/20'
                      }`}>
                        {problem.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">{problem.category}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Main Content Area - Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Problem Description Panel */}
          <div className="w-2/5 border-r border-gray-800 flex flex-col overflow-hidden">
            {/* LeetCode-style Problem Header */}
            <div className="px-6 py-4 border-b border-gray-800 bg-[#0a0e27] flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl font-bold text-white">{selectedProblem.id}. {selectedProblem.title}</h1>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <ThumbsUp className="w-4 h-4 text-gray-400 hover:text-green-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <ThumbsDown className="w-4 h-4 text-gray-400 hover:text-red-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <Star className="w-4 h-4 text-gray-400 hover:text-yellow-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <Share2 className="w-4 h-4 text-gray-400 hover:text-cyan-400" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  selectedProblem.difficulty === 'Easy' ? 'text-green-400 bg-green-500/20' :
                  selectedProblem.difficulty === 'Medium' ? 'text-yellow-400 bg-yellow-500/20' :
                  'text-red-400 bg-red-500/20'
                }`}>
                  {selectedProblem.difficulty}
                </span>
                <span className="text-xs text-gray-500">Topics: <span className="text-cyan-400">{selectedProblem.category}</span></span>
                <span className="text-xs text-gray-500">Companies: <span className="text-gray-400">Google, Amazon, Meta</span></span>
              </div>
            </div>

            {/* AI Helper Buttons */}
            <div className="px-6 py-3 bg-[#0a0e27] border-b border-gray-800 flex items-center gap-2 flex-shrink-0">
              <button
                onClick={getHint}
                disabled={loadingHint}
                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
              >
                {loadingHint ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
                Get Hint {hintLevel > 0 && `(${hintLevel}/3)`}
              </button>
              <button
                onClick={reviewCode}
                disabled={loadingReview}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
              >
                {loadingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Review Code
              </button>
              <button
                onClick={getSimilarProblems}
                className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors text-sm font-medium"
              >
                <Sparkles className="w-4 h-4" />
                Similar Problems
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-4 border-b border-gray-800 bg-[#0a0e27] flex-shrink-0">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-4 py-2 text-sm font-medium transition-all rounded-t-lg ${
                  activeTab === 'description'
                    ? 'text-white bg-[#1a1f3a]'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('diagram')}
                className={`px-4 py-2 text-sm font-medium transition-all rounded-t-lg ${
                  activeTab === 'diagram'
                    ? 'text-white bg-[#1a1f3a]'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                Editorial
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-4 py-2 text-sm font-medium transition-all rounded-t-lg ${
                  activeTab === 'submissions'
                    ? 'text-white bg-[#1a1f3a]'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                Solutions
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#1a1f3a]">
                {activeTab === 'description' && (
                  <div className="p-6 space-y-6">
                    <p className="text-sm text-gray-300 leading-relaxed">{selectedProblem.description}</p>

                    <div className="space-y-4">
                      {selectedProblem.examples.map((example, idx) => (
                        <div key={idx}>
                          <p className="text-xs font-bold text-gray-400 mb-2">Example {idx + 1}:</p>
                          <div className="bg-[#0a0e27] p-4 rounded-lg border border-gray-800 font-mono text-xs">
                            <div className="mb-2">
                              <span className="text-gray-400">Input:</span>{' '}
                              <span className="text-white">{example.input}</span>
                            </div>
                            <div className="mb-2">
                              <span className="text-gray-400">Output:</span>{' '}
                              <span className="text-white">{example.output}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Explanation:</span>{' '}
                              <span className="text-gray-300">{example.explanation}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-300 mb-3">Constraints:</p>
                      <ul className="space-y-2 text-xs text-gray-400">
                        {selectedProblem.constraints.map((constraint, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-cyan-400 mt-0.5">•</span>
                            <code>{constraint}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* AI Hint Display */}
                {showHint && hint && (
                  <div className="mx-6 my-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-yellow-400 mb-2">Hint Level {hintLevel}</h4>
                        <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{hint}</p>
                      </div>
                      <button onClick={() => setShowHint(false)} className="text-gray-400 hover:text-white">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Code Review Display */}
                {showReview && codeReview && (
                  <div className="mx-6 my-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Eye className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-purple-400 mb-3">AI Code Review</h4>
                        <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap font-mono max-h-96 overflow-y-auto custom-scrollbar">
                          {codeReview}
                        </div>
                      </div>
                      <button onClick={() => setShowReview(false)} className="text-gray-400 hover:text-white">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Similar Problems Display */}
                {showSimilar && similarProblems.length > 0 && (
                  <div className="mx-6 my-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-cyan-400 mb-3">Similar Problems</h4>
                        <div className="space-y-3">
                          {similarProblems.map((prob, idx) => (
                            <div key={idx} className="bg-[#0a0e27] rounded-lg p-3 border border-gray-800">
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="text-sm font-semibold text-white">{prob.title}</h5>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  prob.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                  prob.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {prob.difficulty}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mb-2">{prob.description}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                {prob.tags?.map((tag: string, tidx: number) => (
                                  <span key={tidx} className="text-[10px] px-2 py-0.5 bg-gray-800 rounded text-gray-400">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => setShowSimilar(false)} className="text-gray-400 hover:text-white">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'diagram' && (
                  <div className="p-6">
                    <div className="bg-[#0a0e27] rounded-lg border border-gray-800 p-6">
                      <h3 className="text-sm font-bold text-gray-300 mb-4">Algorithm Flow</h3>
                      <div ref={diagramRef} className="flex justify-center" />
                    </div>
                    <div className="mt-6 space-y-4">
                      <div className="bg-[#0a0e27] rounded-lg border border-gray-800 p-4">
                        <h4 className="text-sm font-bold text-cyan-400 mb-2">Approach</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Use a hash map to store each number's complement. As you iterate through the array,
                          check if the current number's complement exists in the map. If it does, you've found your pair!
                        </p>
                      </div>
                      <div className="bg-[#0a0e27] rounded-lg border border-gray-800 p-4">
                        <h4 className="text-sm font-bold text-cyan-400 mb-2">Complexity Analysis</h4>
                        <ul className="text-xs text-gray-400 space-y-1">
                          <li>• <span className="text-green-400">Time:</span> O(n) - Single pass through array</li>
                          <li>• <span className="text-blue-400">Space:</span> O(n) - Hash map storage</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'submissions' && (
                  <div className="p-6">
                    <div className="text-center py-16">
                      <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-400 mb-1">No submissions yet</p>
                      <p className="text-xs text-gray-500">Submit your solution to see it here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          {/* Code Editor Panel */}
          <div className="w-3/5 flex flex-col overflow-hidden bg-[#1a1f3a]">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-[#0a0e27] flex-shrink-0">
              <div className="flex items-center gap-3">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-[#1a1f3a] border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python 3</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
                <button className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 hover:bg-gray-800 rounded-md">
                  Reset Code
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white px-4 py-1.5 rounded-md font-medium text-sm transition-all flex items-center gap-2"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Run
                    </>
                  )}
                </button>
                {showSubmit ? (
                  <button
                    onClick={submitSolution}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md font-medium text-sm transition-all flex items-center gap-2 animate-pulse"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Submit
                  </button>
                ) : (
                  <button
                    disabled
                    className="bg-gray-600 text-gray-400 px-4 py-1.5 rounded-md font-medium text-sm cursor-not-allowed"
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  padding: { top: 16 },
                  fontFamily: "'Fira Code', 'Courier New', monospace",
                  fontLigatures: true,
                }}
              />
            </div>

            {/* Test Cases / Console Area */}
            <div className="h-64 border-t border-gray-800 bg-[#0a0e27] flex flex-col overflow-hidden flex-shrink-0">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800">
                <button className="text-xs font-medium text-white px-3 py-1.5 rounded-md bg-gray-800">
                  Testcase
                </button>
                <button className="text-xs font-medium text-gray-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors">
                  Test Result
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {testResults ? (
                  <div className="space-y-3">
                    {testResults.allPassed ? (
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-sm font-bold text-green-400">Accepted</span>
                        </div>
                        <p className="text-xs text-gray-300">{testResults.summary}</p>
                      </div>
                    ) : (
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="w-5 h-5 text-red-400" />
                          <span className="text-sm font-bold text-red-400">Wrong Answer</span>
                        </div>
                        <p className="text-xs text-gray-300">{testResults.summary}</p>
                      </div>
                    )}

                    {testResults.results?.map((result: any, idx: number) => (
                      <div key={idx} className="bg-[#1a1f3a] border border-gray-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-300">Case {result.testCase}</span>
                          <span className={`text-xs font-bold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                            {result.passed ? '✓ Passed' : '✗ Failed'}
                          </span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-gray-500">Input: </span>
                            <code className="text-cyan-300 bg-gray-900/50 px-2 py-0.5 rounded">{result.input || 'N/A'}</code>
                          </div>
                          <div>
                            <span className="text-gray-500">Expected: </span>
                            <code className="text-green-400 bg-gray-900/50 px-2 py-0.5 rounded">{result.expectedOutput}</code>
                          </div>
                          <div>
                            <span className="text-gray-500">Output: </span>
                            <code className={`${result.passed ? 'text-green-400' : 'text-red-400'} bg-gray-900/50 px-2 py-0.5 rounded`}>
                              {result.actualOutput || 'No output'}
                            </code>
                          </div>
                          {result.error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded p-2 mt-2">
                              <span className="text-red-400 font-semibold">{result.error}: </span>
                              <span className="text-gray-300">{result.message}</span>
                            </div>
                          )}
                          {result.executionTime && (
                            <div className="flex items-center gap-3 text-gray-500 pt-2 border-t border-gray-800">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {result.executionTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" /> {result.memory}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-xs text-gray-500">{output || 'You must run your code first'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Selector Modal (MVP Feature) */}
      {showDomainSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] border-2 border-cyan-500 rounded-2xl p-8 max-w-3xl w-full mx-4 shadow-2xl">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                  <Target className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Choose Your Learning Path</h2>
              <p className="text-gray-400 mb-4">
                Select ONE domain to master. You must complete ALL assignments in this domain before unlocking others.
              </p>
              {domainError && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
                  <p className="text-red-400 text-sm">{domainError}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* SDE Domain */}
              <button
                onClick={() => handleDomainSelect('SDE')}
                disabled={loadingDomain}
                className="group bg-gradient-to-br from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border-2 border-orange-500 hover:border-orange-400 rounded-xl p-6 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-5xl mb-3">📊</div>
                <h3 className="text-xl font-bold text-white mb-2">SDE Track</h3>
                <p className="text-sm text-gray-300 mb-3">
                  Master data structures, algorithms, and system design for software engineering roles
                </p>
                <div className="flex items-center justify-center gap-2 text-orange-400">
                  <span className="text-sm font-semibold">20 Problems</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* ML Domain */}
              <button
                onClick={() => handleDomainSelect('ML')}
                disabled={loadingDomain}
                className="group bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border-2 border-blue-500 hover:border-blue-400 rounded-xl p-6 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-5xl mb-3">🤖</div>
                <h3 className="text-xl font-bold text-white mb-2">ML Track</h3>
                <p className="text-sm text-gray-300 mb-3">
                  Learn machine learning algorithms, model training, and deployment strategies
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-400">
                  <span className="text-sm font-semibold">20 Problems</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* AI Domain */}
              <button
                onClick={() => handleDomainSelect('AI')}
                disabled={loadingDomain}
                className="group bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border-2 border-purple-500 hover:border-purple-400 rounded-xl p-6 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-5xl mb-3">🧠</div>
                <h3 className="text-xl font-bold text-white mb-2">AI Track</h3>
                <p className="text-sm text-gray-300 mb-3">
                  Master neural networks, NLP, computer vision, and generative AI
                </p>
                <div className="flex items-center justify-center gap-2 text-purple-400">
                  <span className="text-sm font-semibold">20 Problems</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* DevOps Domain */}
              <button
                onClick={() => handleDomainSelect('DevOps')}
                disabled={loadingDomain}
                className="group bg-gradient-to-br from-green-500/20 to-teal-500/20 hover:from-green-500/30 hover:to-teal-500/30 border-2 border-green-500 hover:border-green-400 rounded-xl p-6 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-5xl mb-3">⚙️</div>
                <h3 className="text-xl font-bold text-white mb-2">DevOps Track</h3>
                <p className="text-sm text-gray-300 mb-3">
                  Master CI/CD, containerization, orchestration, and infrastructure as code
                </p>
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <span className="text-sm font-semibold">20 Problems</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-300 mb-2">
                    <span className="font-semibold text-cyan-400">MVP Rule:</span> Once you select a domain, you MUST complete ALL 20 assignments before other domains unlock.
                  </p>
                  <p className="text-xs text-gray-400">
                    💡 Reward: Earn 500 bonus credits upon completing all domain assignments!
                  </p>
                </div>
              </div>
            </div>

            {loadingDomain && (
              <div className="flex items-center justify-center gap-2 mt-4 text-cyan-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
