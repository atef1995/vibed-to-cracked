import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const challengeData = [
  {
    slug: "hello-world",
    title: "Hello World Function",
    description: "Create a function that returns 'Hello, World!' when called.",
    difficulty: "EASY",
    type: "FUNCTION",
    estimatedTime: "5 minutes",
    order: 1,
    starter: `function sayHello() {
  // Return "Hello, World!"
  
}`,
    solution: `function sayHello() {
  return "Hello, World!";
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content:
          "Take your time and enjoy creating your first function! No pressure - just have fun with it.",
      },
      {
        mood: "RUSH",
        content:
          "Quick function challenge! Get that return statement working fast - you've got this!",
      },
      {
        mood: "GRIND",
        content:
          "Focus on understanding exactly how function returns work. This is foundational knowledge.",
      },
    ],
    tests: [
      {
        input: [],
        expected: "Hello, World!",
        description: "Function should return 'Hello, World!'",
        order: 0,
      },
    ],
  },
  {
    slug: "add-numbers",
    title: "Add Two Numbers",
    description:
      "Create a function that takes two numbers and returns their sum.",
    difficulty: "EASY",
    type: "FUNCTION",
    estimatedTime: "5 minutes",
    order: 2,
    starter: `function addNumbers(a, b) {
  // Return the sum of a and b
  
}`,
    solution: `function addNumbers(a, b) {
  return a + b;
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content:
          "Simple math function - just add the two parameters together and return the result!",
      },
      {
        mood: "RUSH",
        content:
          "Basic addition function - implement it quick with the + operator!",
      },
      {
        mood: "GRIND",
        content:
          "Practice parameter usage and arithmetic operations. Consider edge cases with different number types.",
      },
    ],
    tests: [
      {
        input: [2, 3],
        expected: 5,
        description: "addNumbers(2, 3) should return 5",
        order: 0,
      },
      {
        input: [-1, 1],
        expected: 0,
        description: "addNumbers(-1, 1) should return 0",
        order: 1,
      },
      {
        input: [0, 0],
        expected: 0,
        description: "addNumbers(0, 0) should return 0",
        order: 2,
      },
    ],
  },
  {
    slug: "even-or-odd",
    title: "Even or Odd Checker",
    description:
      "Create a function that determines if a number is even or odd.",
    difficulty: "EASY",
    type: "LOGIC",
    estimatedTime: "8 minutes",
    order: 3,
    starter: `function isEven(number) {
  // Return true if number is even, false if odd
  
}`,
    solution: `function isEven(number) {
  return number % 2 === 0;
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content:
          "Use the modulo operator (%) to check if a number divides evenly by 2. If remainder is 0, it's even!",
      },
      {
        mood: "RUSH",
        content:
          "Quick logic check! Use % operator to find remainder when divided by 2.",
      },
      {
        mood: "GRIND",
        content:
          "Learn the modulo operator thoroughly - it's crucial for many algorithms. Test edge cases.",
      },
    ],
    tests: [
      {
        input: [4],
        expected: true,
        description: "isEven(4) should return true",
        order: 0,
      },
      {
        input: [7],
        expected: false,
        description: "isEven(7) should return false",
        order: 1,
      },
      {
        input: [0],
        expected: true,
        description: "isEven(0) should return true",
        order: 2,
      },
    ],
  },
  {
    slug: "find-max",
    title: "Find Maximum Number",
    description: "Create a function that finds the largest number in an array.",
    difficulty: "EASY",
    type: "ARRAY",
    estimatedTime: "10 minutes",
    order: 4,
    starter: `function findMax(numbers) {
  // Return the largest number in the array
  
}`,
    solution: `function findMax(numbers) {
  return Math.max(...numbers);
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content:
          "You can use Math.max() with the spread operator (...) to find the maximum easily!",
      },
      {
        mood: "RUSH",
        content:
          "Quick solution: Math.max(...numbers) will spread the array and find the max!",
      },
      {
        mood: "GRIND",
        content:
          "Try multiple approaches: Math.max(), reduce(), or a for loop. Compare performance.",
      },
    ],
    tests: [
      {
        input: [[1, 3, 2]],
        expected: 3,
        description: "findMax([1, 3, 2]) should return 3",
        order: 0,
      },
      {
        input: [[-1, -5, -2]],
        expected: -1,
        description: "findMax([-1, -5, -2]) should return -1",
        order: 1,
      },
      {
        input: [[42]],
        expected: 42,
        description: "findMax([42]) should return 42",
        order: 2,
      },
    ],
  },
  {
    slug: "reverse-string",
    title: "Reverse a String",
    description: "Create a function that reverses a given string.",
    difficulty: "EASY",
    type: "FUNCTION",
    estimatedTime: "8 minutes",
    order: 5,
    starter: `function reverseString(str) {
  // Return the string reversed
  
}`,
    solution: `function reverseString(str) {
  return str.split('').reverse().join('');
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content:
          "Split the string into an array, reverse it, then join it back together. Chain those methods!",
      },
      {
        mood: "RUSH",
        content:
          "Quick method chaining: split('').reverse().join('') gets it done fast!",
      },
      {
        mood: "GRIND",
        content:
          "Learn string methods deeply. Try different approaches: loops, recursion, built-in methods.",
      },
    ],
    tests: [
      {
        input: ["hello"],
        expected: "olleh",
        description: "reverseString('hello') should return 'olleh'",
        order: 0,
      },
      {
        input: ["JavaScript"],
        expected: "tpircSavaJ",
        description: "reverseString('JavaScript') should return 'tpircSavaJ'",
        order: 1,
      },
      {
        input: [""],
        expected: "",
        description: "reverseString('') should return ''",
        order: 2,
      },
    ],
  },
  {
    slug: "count-vowels",
    title: "Count Vowels",
    description:
      "Create a function that counts the number of vowels in a string.",
    difficulty: "MEDIUM",
    type: "FUNCTION",
    estimatedTime: "12 minutes",
    order: 6,
    starter: `function countVowels(str) {
  // Count and return the number of vowels (a, e, i, o, u)
  
}`,
    solution: `function countVowels(str) {
  const vowels = 'aeiouAEIOU';
  return str.split('').filter(char => vowels.includes(char)).length;
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content:
          "Create a vowels string, then filter the input string characters that match. Count the results!",
      },
      {
        mood: "RUSH",
        content:
          "Filter approach: split, filter against vowels string, get length. Quick and clean!",
      },
      {
        mood: "GRIND",
        content:
          "Consider case sensitivity, different approaches (regex, loops, filter). Optimize for readability.",
      },
    ],
    tests: [
      {
        input: ["hello"],
        expected: 2,
        description: "countVowels('hello') should return 2",
        order: 0,
      },
      {
        input: ["JavaScript"],
        expected: 3,
        description: "countVowels('JavaScript') should return 3",
        order: 1,
      },
      {
        input: ["xyz"],
        expected: 0,
        description: "countVowels('xyz') should return 0",
        order: 2,
      },
    ],
  },
  {
    slug: "fibonacci-sequence",
    title: "Fibonacci Number",
    description:
      "Create a function that returns the nth number in the Fibonacci sequence.",
    difficulty: "MEDIUM",
    type: "ALGORITHM",
    estimatedTime: "15 minutes",
    order: 7,
    starter: `function fibonacci(n) {
  // Return the nth Fibonacci number (0, 1, 1, 2, 3, 5, 8, ...)
  
}`,
    solution: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content:
          "The Fibonacci sequence: each number is the sum of the two preceding ones. Start with base cases!",
      },
      {
        mood: "RUSH",
        content:
          "Recursive solution: base case for n <= 1, then add the two previous Fibonacci numbers!",
      },
      {
        mood: "GRIND",
        content:
          "Classic algorithm! Try recursive, iterative, and memoized approaches. Compare efficiency.",
      },
    ],
    tests: [
      {
        input: [0],
        expected: 0,
        description: "fibonacci(0) should return 0",
        order: 0,
      },
      {
        input: [1],
        expected: 1,
        description: "fibonacci(1) should return 1",
        order: 1,
      },
      {
        input: [6],
        expected: 8,
        description: "fibonacci(6) should return 8",
        order: 2,
      },
    ],
  },
  {
    slug: "palindrome-check",
    title: "Palindrome Checker",
    description:
      "Create a function that checks if a string is a palindrome (reads the same forwards and backwards).",
    difficulty: "MEDIUM",
    type: "LOGIC",
    estimatedTime: "12 minutes",
    order: 8,
    starter: `function isPalindrome(str) {
  // Return true if str is a palindrome, false otherwise
  
}`,
    solution: `function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content:
          "Clean the string (lowercase, remove spaces/punctuation), then compare with its reverse!",
      },
      {
        mood: "RUSH",
        content:
          "Normalize the string, then check if it equals its reverse. Clean and compare!",
      },
      {
        mood: "GRIND",
        content:
          "Consider edge cases: spaces, punctuation, case sensitivity. Multiple solution approaches.",
      },
    ],
    tests: [
      {
        input: ["racecar"],
        expected: true,
        description: "isPalindrome('racecar') should return true",
        order: 0,
      },
      {
        input: ["hello"],
        expected: false,
        description: "isPalindrome('hello') should return false",
        order: 1,
      },
      {
        input: ["A man a plan a canal Panama"],
        expected: true,
        description:
          "isPalindrome('A man a plan a canal Panama') should return true",
        order: 2,
      },
    ],
  },
  {
    slug: "sum-array",
    title: "Sum Array Elements",
    description:
      "Create a function that calculates the sum of all numbers in an array.",
    difficulty: "EASY",
    type: "ARRAY",
    estimatedTime: "8 minutes",
    order: 9,
    starter: `function sumArray(numbers) {
  // Return the sum of all numbers in the array
  
}`,
    solution: `function sumArray(numbers) {
  return numbers.reduce((sum, num) => sum + num, 0);
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content:
          "Use the reduce method to accumulate the sum. Start with 0 and add each number!",
      },
      {
        mood: "RUSH",
        content:
          "Reduce method: numbers.reduce((sum, num) => sum + num, 0) - quick and functional!",
      },
      {
        mood: "GRIND",
        content:
          "Master the reduce function - it's powerful for array operations. Try other approaches too.",
      },
    ],
    tests: [
      {
        input: [[1, 2, 3, 4]],
        expected: 10,
        description: "sumArray([1, 2, 3, 4]) should return 10",
        order: 0,
      },
      {
        input: [[-1, 1, -2, 2]],
        expected: 0,
        description: "sumArray([-1, 1, -2, 2]) should return 0",
        order: 1,
      },
      {
        input: [[5]],
        expected: 5,
        description: "sumArray([5]) should return 5",
        order: 2,
      },
    ],
  },
  {
    slug: "factorial",
    title: "Calculate Factorial",
    description:
      "Create a function that calculates the factorial of a given number.",
    difficulty: "MEDIUM",
    type: "ALGORITHM",
    estimatedTime: "10 minutes",
    order: 10,
    starter: `function factorial(n) {
  // Return the factorial of n (n! = n � (n-1) � (n-2) � ... � 1)
  
}`,
    solution: `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content:
          "Factorial means multiply a number by all positive integers below it. Base case: 0! and 1! equal 1.",
      },
      {
        mood: "RUSH",
        content:
          "Recursive: base case n <= 1 returns 1, otherwise n * factorial(n-1)!",
      },
      {
        mood: "GRIND",
        content:
          "Classic recursion problem. Compare recursive vs iterative solutions. Handle edge cases.",
      },
    ],
    tests: [
      {
        input: [5],
        expected: 120,
        description: "factorial(5) should return 120",
        order: 0,
      },
      {
        input: [0],
        expected: 1,
        description: "factorial(0) should return 1",
        order: 1,
      },
      {
        input: [1],
        expected: 1,
        description: "factorial(1) should return 1",
        order: 2,
      },
    ],
  },
  {
    slug: "remove-duplicates",
    title: "Remove Duplicates",
    description:
      "Create a function that removes duplicate values from an array.",
    difficulty: "MEDIUM",
    type: "ARRAY",
    estimatedTime: "12 minutes",
    order: 11,
    starter: `function removeDuplicates(arr) {
  // Return a new array with duplicate values removed
  
}`,
    solution: `function removeDuplicates(arr) {
  return [...new Set(arr)];
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content:
          "The Set object automatically removes duplicates! Spread it back into an array.",
      },
      {
        mood: "RUSH",
        content:
          "Set + spread operator: [...new Set(arr)] - fastest way to remove duplicates!",
      },
      {
        mood: "GRIND",
        content:
          "Learn Set data structure. Compare with filter + indexOf approach. Understand time complexity.",
      },
    ],
    tests: [
      {
        input: [[1, 2, 2, 3, 4, 4, 5]],
        expected: [1, 2, 3, 4, 5],
        description:
          "removeDuplicates([1, 2, 2, 3, 4, 4, 5]) should return [1, 2, 3, 4, 5]",
        order: 0,
      },
      {
        input: [["a", "b", "a", "c"]],
        expected: ["a", "b", "c"],
        description:
          "removeDuplicates(['a', 'b', 'a', 'c']) should return ['a', 'b', 'c']",
        order: 1,
      },
      {
        input: [[1, 1, 1]],
        expected: [1],
        description: "removeDuplicates([1, 1, 1]) should return [1]",
        order: 2,
      },
    ],
  },
  {
    slug: "capitalize-words",
    title: "Capitalize Words",
    description:
      "Create a function that capitalizes the first letter of each word in a string.",
    difficulty: "MEDIUM",
    type: "FUNCTION",
    estimatedTime: "15 minutes",
    order: 12,
    starter: `function capitalizeWords(str) {
  // Return string with first letter of each word capitalized
  
}`,
    solution: `function capitalizeWords(str) {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content:
          "Split by spaces, capitalize first letter of each word, join back together!",
      },
      {
        mood: "RUSH",
        content:
          "Split, map with charAt(0).toUpperCase() + slice(1), join. Chain those methods!",
      },
      {
        mood: "GRIND",
        content:
          "String manipulation practice. Handle edge cases: empty strings, single letters, punctuation.",
      },
    ],
    tests: [
      {
        input: ["hello world"],
        expected: "Hello World",
        description:
          "capitalizeWords('hello world') should return 'Hello World'",
        order: 0,
      },
      {
        input: ["javaScript is AWESOME"],
        expected: "Javascript Is Awesome",
        description:
          "capitalizeWords('javaScript is AWESOME') should return 'Javascript Is Awesome'",
        order: 1,
      },
      {
        input: [""],
        expected: "",
        description: "capitalizeWords('') should return ''",
        order: 2,
      },
    ],
  },
  {
    slug: "find-longest-word",
    title: "Find Longest Word",
    description: "Create a function that finds the longest word in a sentence.",
    difficulty: "MEDIUM",
    type: "FUNCTION",
    estimatedTime: "12 minutes",
    order: 13,
    starter: `function findLongestWord(sentence) {
  // Return the longest word in the sentence
  
}`,
    solution: `function findLongestWord(sentence) {
  const words = sentence.split(' ');
  return words.reduce((longest, current) => 
    current.length > longest.length ? current : longest
  );
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content:
          "Split into words, then use reduce to compare lengths and keep the longest one!",
      },
      {
        mood: "RUSH",
        content:
          "Split and reduce! Compare word lengths and keep the longer one each time.",
      },
      {
        mood: "GRIND",
        content:
          "Practice reduce for comparisons. Consider edge cases: ties, punctuation, empty strings.",
      },
    ],
    tests: [
      {
        input: ["The quick brown fox"],
        expected: "quick",
        description:
          "findLongestWord('The quick brown fox') should return 'quick'",
        order: 0,
      },
      {
        input: ["JavaScript is amazing"],
        expected: "JavaScript",
        description:
          "findLongestWord('JavaScript is amazing') should return 'JavaScript'",
        order: 1,
      },
      {
        input: ["a"],
        expected: "a",
        description: "findLongestWord('a') should return 'a'",
        order: 2,
      },
    ],
  },
  {
    slug: "prime-number-check",
    title: "Prime Number Checker",
    description: "Create a function that checks if a given number is prime.",
    difficulty: "HARD",
    type: "ALGORITHM",
    estimatedTime: "20 minutes",
    order: 14,
    starter: `function isPrime(num) {
  // Return true if num is prime, false otherwise
  
}`,
    solution: `function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content:
          "A prime number is only divisible by 1 and itself. Check divisibility up to the square root!",
      },
      {
        mood: "RUSH",
        content:
          "Check divisibility from 2 to sqrt(num). If any divides evenly, it's not prime!",
      },
      {
        mood: "GRIND",
        content:
          "Optimize the algorithm! Only check up to square root. Handle edge cases: 1, 2, negative numbers.",
      },
    ],
    tests: [
      {
        input: [17],
        expected: true,
        description: "isPrime(17) should return true",
        order: 0,
      },
      {
        input: [4],
        expected: false,
        description: "isPrime(4) should return false",
        order: 1,
      },
      {
        input: [2],
        expected: true,
        description: "isPrime(2) should return true",
        order: 2,
      },
      {
        input: [1],
        expected: false,
        description: "isPrime(1) should return false",
        order: 3,
      },
    ],
  },
  {
    slug: "flatten-array",
    title: "Flatten Nested Array",
    description:
      "Create a function that flattens a nested array into a single-level array.",
    difficulty: "HARD",
    type: "ARRAY",
    estimatedTime: "18 minutes",
    order: 15,
    starter: `function flattenArray(arr) {
  // Return a flattened version of the nested array
  
}`,
    solution: `function flattenArray(arr) {
  return arr.flat(Infinity);
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content:
          "The flat() method with Infinity parameter will flatten any level of nesting!",
      },
      {
        mood: "RUSH",
        content:
          "Modern solution: arr.flat(Infinity) handles all nesting levels instantly!",
      },
      {
        mood: "GRIND",
        content:
          "Learn flat() method and compare with recursive solutions. Understand depth parameters.",
      },
    ],
    tests: [
      {
        input: [[1, [2, [3, 4]], 5]],
        expected: [1, 2, 3, 4, 5],
        description:
          "flattenArray([1, [2, [3, 4]], 5]) should return [1, 2, 3, 4, 5]",
        order: 0,
      },
      {
        input: [
          [
            [1, 2],
            [3, 4],
          ],
        ],
        expected: [1, 2, 3, 4],
        description:
          "flattenArray([[1, 2], [3, 4]]) should return [1, 2, 3, 4]",
        order: 1,
      },
      {
        input: [[1, 2, 3]],
        expected: [1, 2, 3],
        description: "flattenArray([1, 2, 3]) should return [1, 2, 3]",
        order: 2,
      },
    ],
  },
  {
    slug: "object-property-sum",
    title: "Sum Object Properties",
    description: "Create a function that sums all numeric values in an object.",
    difficulty: "MEDIUM",
    type: "OBJECT",
    estimatedTime: "15 minutes",
    order: 16,
    starter: `function sumObjectValues(obj) {
  // Return the sum of all numeric values in the object
  
}`,
    solution: `function sumObjectValues(obj) {
  return Object.values(obj)
    .filter(value => typeof value === 'number')
    .reduce((sum, num) => sum + num, 0);
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content:
          "Get object values, filter for numbers, then reduce to sum them up!",
      },
      {
        mood: "RUSH",
        content:
          "Object.values(), filter for numbers, reduce to sum. Chain those methods!",
      },
      {
        mood: "GRIND",
        content:
          "Practice object methods and array chaining. Handle different data types properly.",
      },
    ],
    tests: [
      {
        input: [{ a: 1, b: 2, c: "hello", d: 3 }],
        expected: 6,
        description:
          "sumObjectValues({a: 1, b: 2, c: 'hello', d: 3}) should return 6",
        order: 0,
      },
      {
        input: [{ x: 10, y: -5, z: true }],
        expected: 5,
        description: "sumObjectValues({x: 10, y: -5, z: true}) should return 5",
        order: 1,
      },
      {
        input: [{ name: "John", age: 30 }],
        expected: 30,
        description:
          "sumObjectValues({name: 'John', age: 30}) should return 30",
        order: 2,
      },
    ],
  },
  {
    slug: "binary-search",
    title: "Binary Search Algorithm",
    description:
      "Implement binary search to find the index of a target value in a sorted array.",
    difficulty: "HARD",
    type: "ALGORITHM",
    estimatedTime: "25 minutes",
    order: 17,
    starter: `function binarySearch(arr, target) {
  // Return the index of target in sorted array, or -1 if not found
  
}`,
    solution: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content:
          "Binary search cuts the search space in half each time. Compare middle element with target!",
      },
      {
        mood: "RUSH",
        content:
          "Efficient O(log n) search! Find middle, compare, adjust left/right boundaries.",
      },
      {
        mood: "GRIND",
        content:
          "Master this fundamental algorithm. Understand time complexity, edge cases, and why it's efficient.",
      },
    ],
    tests: [
      {
        input: [[1, 3, 5, 7, 9], 5],
        expected: 2,
        description: "binarySearch([1, 3, 5, 7, 9], 5) should return 2",
        order: 0,
      },
      {
        input: [[1, 3, 5, 7, 9], 6],
        expected: -1,
        description: "binarySearch([1, 3, 5, 7, 9], 6) should return -1",
        order: 1,
      },
      {
        input: [[2, 4, 6, 8, 10, 12], 2],
        expected: 0,
        description: "binarySearch([2, 4, 6, 8, 10, 12], 2) should return 0",
        order: 2,
      },
    ],
  },
  {
    slug: "deep-clone-object",
    title: "Deep Clone Object",
    description:
      "Create a function that creates a deep copy of an object (including nested objects).",
    difficulty: "HARD",
    type: "OBJECT",
    estimatedTime: "22 minutes",
    order: 18,
    starter: `function deepClone(obj) {
  // Return a deep copy of the object
  
}`,
    solution: `function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  const cloned = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content:
          "Recursively copy each property. Handle arrays and objects differently from primitives!",
      },
      {
        mood: "RUSH",
        content:
          "Quick approach: JSON.parse(JSON.stringify(obj)) for simple cases, but learn the proper recursive way!",
      },
      {
        mood: "GRIND",
        content:
          "Master recursion and object manipulation. Handle edge cases: null, arrays, nested structures.",
      },
    ],
    tests: [
      {
        input: [{ a: 1, b: { c: 2 } }],
        expected: { a: 1, b: { c: 2 } },
        description: "deepClone({a: 1, b: {c: 2}}) should return a deep copy",
        order: 0,
      },
      {
        input: [{ arr: [1, 2, { nested: true }] }],
        expected: { arr: [1, 2, { nested: true }] },
        description:
          "deepClone({arr: [1, 2, {nested: true}]}) should return a deep copy",
        order: 1,
      },
      {
        input: [null],
        expected: null,
        description: "deepClone(null) should return null",
        order: 2,
      },
    ],
  },
  {
    slug: "array-filter",
    title: "Filter Even Numbers",
    description: "Create a function that filters an array to keep only even numbers.",
    difficulty: "EASY",
    type: "ARRAY",
    estimatedTime: "8 minutes",
    order: 19,
    starter: `function filterEven(numbers) {
  // Return array with only even numbers
  
}`,
    solution: `function filterEven(numbers) {
  return numbers.filter(num => num % 2 === 0);
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content: "Use the filter method to keep only numbers that are even!",
      },
      {
        mood: "RUSH",
        content: "Quick filter with arrow function - check if num % 2 === 0!",
      },
      {
        mood: "GRIND",
        content: "Master the filter method and modulo operator. Understand how it processes each element.",
      },
    ],
    tests: [
      {
        input: [[1, 2, 3, 4, 5, 6]],
        expected: [2, 4, 6],
        description: "filterEven([1, 2, 3, 4, 5, 6]) should return [2, 4, 6]",
        order: 0,
      },
      {
        input: [[10, 15, 20, 25]],
        expected: [10, 20],
        description: "filterEven([10, 15, 20, 25]) should return [10, 20]",
        order: 1,
      },
      {
        input: [[1, 3, 5]],
        expected: [],
        description: "filterEven([1, 3, 5]) should return []",
        order: 2,
      },
    ],
  },
  {
    slug: "array-map-double",
    title: "Double Each Number",
    description: "Create a function that doubles each number in an array.",
    difficulty: "EASY",
    type: "ARRAY",
    estimatedTime: "8 minutes",
    order: 20,
    starter: `function doubleNumbers(numbers) {
  // Return array with each number doubled
  
}`,
    solution: `function doubleNumbers(numbers) {
  return numbers.map(num => num * 2);
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content: "Use map to transform each number - multiply by 2!",
      },
      {
        mood: "RUSH",
        content: "Quick map with arrow function - just multiply each by 2!",
      },
      {
        mood: "GRIND",
        content: "Understand map vs filter vs reduce. Map transforms, filter selects, reduce combines.",
      },
    ],
    tests: [
      {
        input: [[1, 2, 3]],
        expected: [2, 4, 6],
        description: "doubleNumbers([1, 2, 3]) should return [2, 4, 6]",
        order: 0,
      },
      {
        input: [[5, 10]],
        expected: [10, 20],
        description: "doubleNumbers([5, 10]) should return [10, 20]",
        order: 1,
      },
      {
        input: [[0]],
        expected: [0],
        description: "doubleNumbers([0]) should return [0]",
        order: 2,
      },
    ],
  },
  {
    slug: "array-sum-reduce",
    title: "Sum Array with Reduce",
    description: "Create a function that sums an array using the reduce method.",
    difficulty: "MEDIUM",
    type: "ARRAY",
    estimatedTime: "10 minutes",
    order: 21,
    starter: `function sumWithReduce(numbers) {
  // Use reduce to sum the array
  
}`,
    solution: `function sumWithReduce(numbers) {
  return numbers.reduce((sum, num) => sum + num, 0);
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content: "Reduce accumulates values - start with 0, add each number to the sum!",
      },
      {
        mood: "RUSH",
        content: "Reduce with accumulator - (sum, num) => sum + num, starting at 0!",
      },
      {
        mood: "GRIND",
        content: "Master reduce - it's one of the most powerful array methods. Understand accumulator and initial value.",
      },
    ],
    tests: [
      {
        input: [[1, 2, 3, 4]],
        expected: 10,
        description: "sumWithReduce([1, 2, 3, 4]) should return 10",
        order: 0,
      },
      {
        input: [[0]],
        expected: 0,
        description: "sumWithReduce([0]) should return 0",
        order: 1,
      },
      {
        input: [[-1, -2, -3]],
        expected: -6,
        description: "sumWithReduce([-1, -2, -3]) should return -6",
        order: 2,
      },
    ],
  },
  {
    slug: "string-includes-substring",
    title: "Check for Substring",
    description: "Create a function that checks if a string contains a substring.",
    difficulty: "EASY",
    type: "STRING",
    estimatedTime: "6 minutes",
    order: 22,
    starter: `function hasSubstring(str, substring) {
  // Return true if str contains substring
  
}`,
    solution: `function hasSubstring(str, substring) {
  return str.includes(substring);
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content: "Use the includes method - it's the easiest way to check if a string contains another!",
      },
      {
        mood: "RUSH",
        content: "Quick check with includes() method!",
      },
      {
        mood: "GRIND",
        content: "Learn includes, indexOf, and other string search methods. Understand case sensitivity.",
      },
    ],
    tests: [
      {
        input: ["hello world", "world"],
        expected: true,
        description: "hasSubstring('hello world', 'world') should return true",
        order: 0,
      },
      {
        input: ["hello world", "xyz"],
        expected: false,
        description: "hasSubstring('hello world', 'xyz') should return false",
        order: 1,
      },
      {
        input: ["JavaScript", "Script"],
        expected: true,
        description: "hasSubstring('JavaScript', 'Script') should return true",
        order: 2,
      },
    ],
  },
  {
    slug: "string-repeat",
    title: "Repeat String",
    description: "Create a function that repeats a string n times.",
    difficulty: "EASY",
    type: "STRING",
    estimatedTime: "7 minutes",
    order: 23,
    starter: `function repeatString(str, times) {
  // Return string repeated n times
  
}`,
    solution: `function repeatString(str, times) {
  return str.repeat(times);
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content: "Use the repeat method - super simple!",
      },
      {
        mood: "RUSH",
        content: "Just use str.repeat(times)!",
      },
      {
        mood: "GRIND",
        content: "Learn repeat method. Also consider what happens with negative or zero times.",
      },
    ],
    tests: [
      {
        input: ["ab", 3],
        expected: "ababab",
        description: "repeatString('ab', 3) should return 'ababab'",
        order: 0,
      },
      {
        input: ["hi", 1],
        expected: "hi",
        description: "repeatString('hi', 1) should return 'hi'",
        order: 1,
      },
      {
        input: ["x", 5],
        expected: "xxxxx",
        description: "repeatString('x', 5) should return 'xxxxx'",
        order: 2,
      },
    ],
  },
  {
    slug: "object-keys-to-array",
    title: "Extract Object Keys",
    description: "Create a function that extracts all keys from an object into an array.",
    difficulty: "EASY",
    type: "OBJECT",
    estimatedTime: "6 minutes",
    order: 24,
    starter: `function getObjectKeys(obj) {
  // Return array of object keys
  
}`,
    solution: `function getObjectKeys(obj) {
  return Object.keys(obj);
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content: "Use Object.keys() to get all property names!",
      },
      {
        mood: "RUSH",
        content: "Quick with Object.keys()!",
      },
      {
        mood: "GRIND",
        content: "Learn Object.keys(), Object.values(), Object.entries() and when to use each.",
      },
    ],
    tests: [
      {
        input: [{ a: 1, b: 2, c: 3 }],
        expected: ["a", "b", "c"],
        description: "getObjectKeys({a: 1, b: 2, c: 3}) should return ['a', 'b', 'c']",
        order: 0,
      },
      {
        input: [{ name: "John", age: 30 }],
        expected: ["name", "age"],
        description: "getObjectKeys({name: 'John', age: 30}) should return ['name', 'age']",
        order: 1,
      },
      {
        input: [{}],
        expected: [],
        description: "getObjectKeys({}) should return []",
        order: 2,
      },
    ],
  },
  {
    slug: "object-values-to-array",
    title: "Extract Object Values",
    description: "Create a function that extracts all values from an object into an array.",
    difficulty: "EASY",
    type: "OBJECT",
    estimatedTime: "6 minutes",
    order: 25,
    starter: `function getObjectValues(obj) {
  // Return array of object values
  
}`,
    solution: `function getObjectValues(obj) {
  return Object.values(obj);
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content: "Use Object.values() to get all property values!",
      },
      {
        mood: "RUSH",
        content: "Quick with Object.values()!",
      },
      {
        mood: "GRIND",
        content: "Compare Object.keys(), Object.values(), and Object.entries().",
      },
    ],
    tests: [
      {
        input: [{ a: 1, b: 2, c: 3 }],
        expected: [1, 2, 3],
        description: "getObjectValues({a: 1, b: 2, c: 3}) should return [1, 2, 3]",
        order: 0,
      },
      {
        input: [{ name: "John", age: 30 }],
        expected: ["John", 30],
        description: "getObjectValues({name: 'John', age: 30}) should return ['John', 30]",
        order: 1,
      },
      {
        input: [{}],
        expected: [],
        description: "getObjectValues({}) should return []",
        order: 2,
      },
    ],
  },
  {
    slug: "array-find-first",
    title: "Find First Match",
    description: "Create a function that returns the first element matching a condition.",
    difficulty: "MEDIUM",
    type: "ARRAY",
    estimatedTime: "9 minutes",
    order: 26,
    starter: `function findFirstGreaterThan(numbers, value) {
  // Return first number greater than value
  
}`,
    solution: `function findFirstGreaterThan(numbers, value) {
  return numbers.find(num => num > value);
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content: "Use find() to get the first element that matches your condition!",
      },
      {
        mood: "RUSH",
        content: "Find returns first match - use arrow function to check condition!",
      },
      {
        mood: "GRIND",
        content: "Understand find vs filter - find returns single element or undefined, filter returns array.",
      },
    ],
    tests: [
      {
        input: [[1, 2, 3, 4, 5], 2],
        expected: 3,
        description: "findFirstGreaterThan([1, 2, 3, 4, 5], 2) should return 3",
        order: 0,
      },
      {
        input: [[10, 20, 30], 25],
        expected: 30,
        description: "findFirstGreaterThan([10, 20, 30], 25) should return 30",
        order: 1,
      },
      {
        input: [[1, 2], 10],
        expected: undefined,
        description: "findFirstGreaterThan([1, 2], 10) should return undefined",
        order: 2,
      },
    ],
  },
  {
    slug: "array-some",
    title: "Check Array Has Condition",
    description: "Create a function that checks if at least one element matches a condition.",
    difficulty: "MEDIUM",
    type: "ARRAY",
    estimatedTime: "8 minutes",
    order: 27,
    starter: `function hasNegativeNumber(numbers) {
  // Return true if array has any negative number
  
}`,
    solution: `function hasNegativeNumber(numbers) {
  return numbers.some(num => num < 0);
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content: "Use some() to check if ANY element matches your condition!",
      },
      {
        mood: "RUSH",
        content: "Quick check with some() - stops at first match!",
      },
      {
        mood: "GRIND",
        content: "Learn some() and every() - some returns true if ANY match, every if ALL match.",
      },
    ],
    tests: [
      {
        input: [[1, -2, 3]],
        expected: true,
        description: "hasNegativeNumber([1, -2, 3]) should return true",
        order: 0,
      },
      {
        input: [[1, 2, 3]],
        expected: false,
        description: "hasNegativeNumber([1, 2, 3]) should return false",
        order: 1,
      },
      {
        input: [[-5, -10]],
        expected: true,
        description: "hasNegativeNumber([-5, -10]) should return true",
        order: 2,
      },
    ],
  },
  {
    slug: "array-every",
    title: "Check All Match Condition",
    description: "Create a function that checks if all elements match a condition.",
    difficulty: "MEDIUM",
    type: "ARRAY",
    estimatedTime: "8 minutes",
    order: 28,
    starter: `function allPositive(numbers) {
  // Return true if all numbers are positive
  
}`,
    solution: `function allPositive(numbers) {
  return numbers.every(num => num > 0);
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content: "Use every() to check if ALL elements match your condition!",
      },
      {
        mood: "RUSH",
        content: "Quick check with every() - stops at first non-match!",
      },
      {
        mood: "GRIND",
        content: "Compare some() vs every() - know when to use each for different validations.",
      },
    ],
    tests: [
      {
        input: [[1, 2, 3]],
        expected: true,
        description: "allPositive([1, 2, 3]) should return true",
        order: 0,
      },
      {
        input: [[1, -2, 3]],
        expected: false,
        description: "allPositive([1, -2, 3]) should return false",
        order: 1,
      },
      {
        input: [[10, 20, 30]],
        expected: true,
        description: "allPositive([10, 20, 30]) should return true",
        order: 2,
      },
    ],
  },
  {
    slug: "string-trim-spaces",
    title: "Trim Whitespace",
    description: "Create a function that removes leading and trailing whitespace from a string.",
    difficulty: "EASY",
    type: "STRING",
    estimatedTime: "5 minutes",
    order: 29,
    starter: `function trimString(str) {
  // Remove leading and trailing whitespace
  
}`,
    solution: `function trimString(str) {
  return str.trim();
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content: "Use the trim() method - removes spaces from both ends!",
      },
      {
        mood: "RUSH",
        content: "Just use str.trim()!",
      },
      {
        mood: "GRIND",
        content: "Learn trim(), trimStart(), and trimEnd() methods.",
      },
    ],
    tests: [
      {
        input: ["  hello  "],
        expected: "hello",
        description: "trimString('  hello  ') should return 'hello'",
        order: 0,
      },
      {
        input: ["\\t\\tspaced\\n"],
        expected: "spaced",
        description: "trimString('  spaced  ') should return 'spaced'",
        order: 1,
      },
      {
        input: ["nospace"],
        expected: "nospace",
        description: "trimString('nospace') should return 'nospace'",
        order: 2,
      },
    ],
  },
  {
    slug: "string-split-join",
    title: "Split and Join String",
    description: "Create a function that splits a string and joins it back with different separator.",
    difficulty: "EASY",
    type: "STRING",
    estimatedTime: "7 minutes",
    order: 30,
    starter: `function convertSeparator(str, newSep) {
  // Split by space, join with new separator
  
}`,
    solution: `function convertSeparator(str, newSep) {
  return str.split(' ').join(newSep);
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content: "Split the string into array, then join with new separator!",
      },
      {
        mood: "RUSH",
        content: "Chain split() and join() methods!",
      },
      {
        mood: "GRIND",
        content: "Master split() and join() - understand arrays and method chaining.",
      },
    ],
    tests: [
      {
        input: ["hello world", "-"],
        expected: "hello-world",
        description: "convertSeparator('hello world', '-') should return 'hello-world'",
        order: 0,
      },
      {
        input: ["one two three", "_"],
        expected: "one_two_three",
        description: "convertSeparator('one two three', '_') should return 'one_two_three'",
        order: 1,
      },
      {
        input: ["a b c", "|"],
        expected: "a|b|c",
        description: "convertSeparator('a b c', '|') should return 'a|b|c'",
        order: 2,
      },
    ],
  },
  {
    slug: "array-sort-numbers",
    title: "Sort Array of Numbers",
    description: "Create a function that sorts an array of numbers in ascending order.",
    difficulty: "MEDIUM",
    type: "ARRAY",
    estimatedTime: "10 minutes",
    order: 31,
    starter: `function sortNumbers(numbers) {
  // Return sorted array in ascending order
  
}`,
    solution: `function sortNumbers(numbers) {
  return numbers.sort((a, b) => a - b);
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content: "Use sort with a comparison function - (a, b) => a - b for ascending!",
      },
      {
        mood: "RUSH",
        content: "Sort with (a, b) => a - b comparator!",
      },
      {
        mood: "GRIND",
        content: "Understand sorting algorithms and comparison functions. Know stable vs unstable sorts.",
      },
    ],
    tests: [
      {
        input: [[3, 1, 2]],
        expected: [1, 2, 3],
        description: "sortNumbers([3, 1, 2]) should return [1, 2, 3]",
        order: 0,
      },
      {
        input: [[5, 2, 8, 1]],
        expected: [1, 2, 5, 8],
        description: "sortNumbers([5, 2, 8, 1]) should return [1, 2, 5, 8]",
        order: 1,
      },
      {
        input: [[-1, 0, 5, -3]],
        expected: [-3, -1, 0, 5],
        description: "sortNumbers([-1, 0, 5, -3]) should return [-3, -1, 0, 5]",
        order: 2,
      },
    ],
  },
  {
    slug: "array-reverse",
    title: "Reverse Array",
    description: "Create a function that reverses an array without using the reverse() method.",
    difficulty: "MEDIUM",
    type: "ARRAY",
    estimatedTime: "10 minutes",
    order: 32,
    starter: `function reverseArray(arr) {
  // Return reversed array without using reverse()
  
}`,
    solution: `function reverseArray(arr) {
  const reversed = [];
  for (let i = arr.length - 1; i >= 0; i--) {
    reversed.push(arr[i]);
  }
  return reversed;
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content: "Loop backwards through the array and build a new array!",
      },
      {
        mood: "RUSH",
        content: "Loop from end to start, push to new array!",
      },
      {
        mood: "GRIND",
        content: "Consider multiple approaches: loops, recursion, reduce(). Understand time/space complexity.",
      },
    ],
    tests: [
      {
        input: [[1, 2, 3]],
        expected: [3, 2, 1],
        description: "reverseArray([1, 2, 3]) should return [3, 2, 1]",
        order: 0,
      },
      {
        input: [["a", "b", "c"]],
        expected: ["c", "b", "a"],
        description: "reverseArray(['a', 'b', 'c']) should return ['c', 'b', 'a']",
        order: 1,
      },
      {
        input: [[1]],
        expected: [1],
        description: "reverseArray([1]) should return [1]",
        order: 2,
      },
    ],
  },
  {
    slug: "string-starts-with",
    title: "Check String Start",
    description: "Create a function that checks if a string starts with a given prefix.",
    difficulty: "EASY",
    type: "STRING",
    estimatedTime: "6 minutes",
    order: 33,
    starter: `function startsWithPrefix(str, prefix) {
  // Return true if str starts with prefix
  
}`,
    solution: `function startsWithPrefix(str, prefix) {
  return str.startsWith(prefix);
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content: "Use startsWith() method - super simple!",
      },
      {
        mood: "RUSH",
        content: "Quick check with str.startsWith()!",
      },
      {
        mood: "GRIND",
        content: "Learn startsWith(), endsWith(), and indexOf() for string searching.",
      },
    ],
    tests: [
      {
        input: ["JavaScript", "Java"],
        expected: true,
        description: "startsWithPrefix('JavaScript', 'Java') should return true",
        order: 0,
      },
      {
        input: ["JavaScript", "Script"],
        expected: false,
        description: "startsWithPrefix('JavaScript', 'Script') should return false",
        order: 1,
      },
      {
        input: ["hello", "hello"],
        expected: true,
        description: "startsWithPrefix('hello', 'hello') should return true",
        order: 2,
      },
    ],
  },
  {
    slug: "greatest-common-divisor",
    title: "Find GCD (Euclidean Algorithm)",
    description: "Create a function that finds the greatest common divisor of two numbers.",
    difficulty: "MEDIUM",
    type: "MATH",
    estimatedTime: "12 minutes",
    order: 34,
    starter: `function gcd(a, b) {
  // Find greatest common divisor using Euclidean algorithm
  
}`,
    solution: `function gcd(a, b) {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content: "Use Euclidean algorithm - keep replacing with remainder until b is 0!",
      },
      {
        mood: "RUSH",
        content: "Euclidean algorithm with loop - swap and take remainder!",
      },
      {
        mood: "GRIND",
        content: "Master Euclidean algorithm. Also learn recursive implementation and complexity analysis.",
      },
    ],
    tests: [
      {
        input: [12, 8],
        expected: 4,
        description: "gcd(12, 8) should return 4",
        order: 0,
      },
      {
        input: [48, 18],
        expected: 6,
        description: "gcd(48, 18) should return 6",
        order: 1,
      },
      {
        input: [17, 19],
        expected: 1,
        description: "gcd(17, 19) should return 1 (coprime)",
        order: 2,
      },
    ],
  },
  {
    slug: "object-merge",
    title: "Merge Two Objects",
    description: "Create a function that merges two objects into one.",
    difficulty: "MEDIUM",
    type: "OBJECT",
    estimatedTime: "8 minutes",
    order: 35,
    starter: `function mergeObjects(obj1, obj2) {
  // Merge obj1 and obj2 into new object
  
}`,
    solution: `function mergeObjects(obj1, obj2) {
  return { ...obj1, ...obj2 };
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content: "Use spread operator to combine both objects!",
      },
      {
        mood: "RUSH",
        content: "Quick spread: { ...obj1, ...obj2 }!",
      },
      {
        mood: "GRIND",
        content: "Learn spread operator and Object.assign(). Understand shallow vs deep merging.",
      },
    ],
    tests: [
      {
        input: [{ a: 1 }, { b: 2 }],
        expected: { a: 1, b: 2 },
        description: "mergeObjects({a: 1}, {b: 2}) should return {a: 1, b: 2}",
        order: 0,
      },
      {
        input: [{ name: "John" }, { age: 30 }],
        expected: { name: "John", age: 30 },
        description: "mergeObjects({name: 'John'}, {age: 30}) should return {name: 'John', age: 30}",
        order: 1,
      },
      {
        input: [{ a: 1, b: 2 }, { b: 3, c: 4 }],
        expected: { a: 1, b: 3, c: 4 },
        description: "mergeObjects({a: 1, b: 2}, {b: 3, c: 4}) should return {a: 1, b: 3, c: 4}",
        order: 2,
      },
    ],
  },
  {
    slug: "array-chunk",
    title: "Split Array into Chunks",
    description: "Create a function that splits an array into smaller arrays of given size.",
    difficulty: "MEDIUM",
    type: "ARRAY",
    estimatedTime: "12 minutes",
    order: 36,
    starter: `function chunkArray(arr, size) {
  // Split array into chunks of given size
  
}`,
    solution: `function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}`,
    moodAdaptations: [
      {
        mood: "CHILL",
        content: "Loop through array, slice chunks of given size, and collect them!",
      },
      {
        mood: "RUSH",
        content: "Loop with step size, use slice() to get each chunk!",
      },
      {
        mood: "GRIND",
        content: "Master array slicing and chunking. Consider edge cases and optimization.",
      },
    ],
    tests: [
      {
        input: [[1, 2, 3, 4, 5], 2],
        expected: [[1, 2], [3, 4], [5]],
        description: "chunkArray([1, 2, 3, 4, 5], 2) should return [[1, 2], [3, 4], [5]]",
        order: 0,
      },
      {
        input: [["a", "b", "c", "d"], 2],
        expected: [["a", "b"], ["c", "d"]],
        description: "chunkArray(['a', 'b', 'c', 'd'], 2) should return [['a', 'b'], ['c', 'd']]",
        order: 1,
      },
      {
        input: [[1, 2, 3], 3],
        expected: [[1, 2, 3]],
        description: "chunkArray([1, 2, 3], 3) should return [[1, 2, 3]]",
        order: 2,
      },
    ],
  },
];

export async function seedChallenges() {
  console.log("<1 Seeding challenges...");

  for (const challengeInfo of challengeData) {
    try {
      // Create the challenge
      const challenge = await prisma.challenge.create({
        data: {
          slug: challengeInfo.slug,
          title: challengeInfo.title,
          description: challengeInfo.description,
          difficulty: challengeInfo.difficulty,
          type: challengeInfo.type,
          estimatedTime: challengeInfo.estimatedTime,
          order: challengeInfo.order,
          starter: challengeInfo.starter,
          solution: challengeInfo.solution,
          published: true,
          isPremium: false,
          requiredPlan: "FREE",
        },
      });

      // Create mood adaptations
      for (const adaptation of challengeInfo.moodAdaptations) {
        await prisma.challengeMoodAdaptation.create({
          data: {
            challengeId: challenge.id,
            mood: adaptation.mood,
            content: adaptation.content,
          },
        });
      }

      // Create tests
      for (const test of challengeInfo.tests) {
        await prisma.challengeTest.create({
          data: {
            challengeId: challenge.id,
            input: test.input,
            expected: test.expected,
            description: test.description,
            order: test.order,
          },
        });
      }

      console.log(` Created challenge: ${challengeInfo.title}`);
    } catch (error) {
      console.error(
        `L Error creating challenge ${challengeInfo.title}:`,
        error
      );
    }
  }

  console.log("<� Challenge seeding completed!");
}
seedChallenges();
export default seedChallenges;
