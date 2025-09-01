export const questionAnswerPrompt = (
  role,
  experience,
  topicsToFocus,
  numberOfQuestions
) => `You are an AI trained to generate technical interview questions and answers.

Task:
   -Role: ${role}
   -Candidate Experience: ${experience} years
   -Focus Topics: ${
     Array.isArray(topicsToFocus) ? topicsToFocus.join(", ") : topicsToFocus
   }
   -Write ${numberOfQuestions} interview questions.
   -For each question, generate a detailed but beginner-friendly answer.
   -If the answer needs a code example, add a small code block inside.
   -Keep formatting very clean.

Return ONLY a valid JSON array with this exact format:
[
  {
    "question": "What is React?",
    "answer": "React is a JavaScript library for building user interfaces..."
  }
]

CRITICAL: Return ONLY the JSON array, no other text, no markdown formatting.`;

export const conceptExplainPrompt = (
  question
) => `You are an AI trained to generate comprehensive explanations for interview questions.

Task: Explain the following interview question in detail with practical examples:

Question: "${question}"

Requirements:
- Provide a comprehensive explanation (400-600 words)
- Start with a clear definition and overview
- Explain the core concept in detail
- Include practical examples and use cases
- Add relevant code examples with explanations
- Cover best practices and common pitfalls
- Include real-world applications
- Make it suitable for intermediate developers
- Use clear, professional language
- Structure the explanation logically

Return ONLY a valid JSON object with this exact format:
{
  "title": "React Hooks",
  "explanation": "React Hooks are functions that allow you to use state and other React features in functional components. Introduced in React 16.8, hooks solve several problems that existed with class components, including complex logic reuse, confusing lifecycle methods, and the difficulty of understanding 'this' binding. The useState hook is one of the most fundamental hooks, allowing functional components to manage local state. When you call useState, it returns an array with two elements: the current state value and a function to update it. This pattern enables components to maintain state without converting to class components. Example of useState: import React, { useState } from 'react'; function Counter() { const [count, setCount] = useState(0); return ( <div> <p>You clicked {count} times</p> <button onClick={() => setCount(count + 1)}> Click me </button> </div> ); } The useEffect hook handles side effects in functional components, replacing componentDidMount, componentDidUpdate, and componentWillUnmount. It runs after every render by default and can be configured to run only when specific dependencies change. Best practices include: Always include dependencies in the dependency array, Clean up subscriptions and timers in the cleanup function, Avoid infinite loops by carefully managing dependencies, Use multiple useEffect hooks to separate concerns. Common pitfalls include forgetting the dependency array, causing infinite re-renders, and not cleaning up side effects properly. Hooks must be called at the top level of your component, never inside loops, conditions, or nested functions. Real-world applications include form handling, API calls, subscriptions, and DOM manipulation. Hooks make it easier to extract and reuse stateful logic between components, leading to cleaner, more maintainable code."
}

CRITICAL: Return ONLY the JSON object, no other text, no markdown formatting.`;
