import { SELAreaKey, SELPrompt } from "@/types/emotionalInsights";

export const SEL_AREA_PROMPTS: Record<SELAreaKey, SELPrompt> = {
  'self_awareness': {
    title: 'Self-Awareness',
    description: 'Understanding your own emotions, strengths, and areas for growth',
    prompts: {
      younger: [
        'Draw a picture of how you feel right now and explain why you feel that way.',
        'Name three things that make you feel happy and three things that make you feel sad.',
        'When you get upset, what happens in your body? Where do you feel it?',
        "What's one thing you're really good at and one thing that's hard for you?",
      ],
      older: [
        'Take a few minutes to reflect on a recent strong emotional reaction you had. What triggered it and how did you respond?',
        'Think about a time when your emotions affected your decisions. What would you do differently next time?',
        'List three of your strengths and three areas where you want to improve. How can you use your strengths to help with your challenges?',
        'How do you think others see you? Is this different from how you see yourself?',
      ]
    }
  },
  'self_management': {
    title: 'Self-Management',
    description: 'Managing emotions, thoughts, and behaviors effectively',
    prompts: {
      younger: [
        'What do you do to calm down when you feel angry or upset?',
        'Make a list of things you can do when you feel like giving up on something hard.',
        "What's something you really want but have to wait for? How do you handle waiting?",
        'Think of a time you made a mistake. What did you learn from it?',
      ],
      older: [
        'Describe a situation where you successfully managed strong emotions. What strategies did you use?',
        'What are your top three stress triggers, and what techniques can you use to manage them better?',
        'Set a small goal for this week. What specific steps will you take to achieve it? What obstacles might come up?',
        'Think about a recent time when you procrastinated. What emotions were you feeling? How could you handle similar situations differently?',
      ]
    }
  },
  'social_awareness': {
    title: 'Social Awareness',
    description: "Understanding others' perspectives and empathizing with them",
    prompts: {
      younger: [
        'Think about a friend who was sad recently. How could you tell they were sad? What did you do to help?',
        'When someone feels different from you about something, how do you try to understand their feelings?',
        'Think of someone who might be lonely at school. What could you do to include them?',
        "Name three ways people show they're feeling happy, sad, or angry without using words.",
      ],
      older: [
        'Think about a recent disagreement you had with someone. Try to describe the situation from their perspective.',
        'Consider someone in your life who is very different from you. What might be some challenges they face that you don\'t?',
        'How might your actions or words affect others, even when you don\'t intend them to?',
        'Think about a time when you noticed someone needed help. How did you know, and what did you do?',
      ]
    }
  },
  'relationship_skills': {
    title: 'Relationship Skills',
    description: 'Building and maintaining healthy relationships',
    prompts: {
      younger: [
        'What makes someone a good friend? How are you a good friend to others?',
        'When you have a problem with a friend, what do you do to fix it?',
        'How do you show people that you care about them?',
        "What's something nice someone did for you recently? How did it make you feel?",
      ],
      older: [
        'Think about a conflict you recently had with someone. How did you handle it? What could you have done differently?',
        'What are three qualities you look for in close friendships? How do you demonstrate these qualities yourself?',
        'Describe a time when you had to compromise with someone. What did you learn from the experience?',
        'How do you respond when a friend shares something personal or difficult with you?',
      ]
    }
  },
  'responsible_decision_making': {
    title: 'Responsible Decision-Making',
    description: 'Making constructive choices about personal behavior and social interactions',
    prompts: {
      younger: [
        'Think about a choice you made today. Was it a good choice? How do you know?',
        'When you need to make a decision, who helps you? How do they help?',
        "What's a rule at home or school that helps keep you safe? Why is it important?",
        'Think about a time you helped someone else. Why did you decide to help?',
      ],
      older: [
        'Describe a difficult decision you had to make recently. What factors did you consider?',
        'Think about a time when you made a decision you later regretted. What would you do differently now?',
        'How do your personal values influence the decisions you make?',
        'Consider a choice you need to make soon. What are the possible consequences (both positive and negative) of each option?',
      ]
    }
  }
};

export const MIN_DATA_POINTS_FOR_CHART = 2;
export const IS_DEVELOPMENT = import.meta.env.DEV;
