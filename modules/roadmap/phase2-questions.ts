// ─────────────────────────────────────────────────────────────────────
// THE ROADMAP — PHASE 2 (16 Questions)
// Sourced from Chapter 10 ("Swerve On!") of:
// "The Roadmap: Blueprint Your Vision" by Zion SWRV Birdsong
// ─────────────────────────────────────────────────────────────────────
// These are the 16 guided questions used in Phase 2 of the Roadmap
// experience. After a user vents their vision (Phase 1), these
// questions take them deeper into specificity, identity, and impact.
//
// The AI uses both phases to generate the final assessment.
// ─────────────────────────────────────────────────────────────────────

export interface Phase2Question {
  id: string;
  number: number;
  question: string;
  context?: string;            // Optional context from the book
  placeholder?: string;
  /** Which questions can be grouped on a single screen — keeps flow tight */
  group?: 'identity' | 'fulfillment' | 'gifts' | 'values' | 'problems' | 'communication' | 'legacy' | 'success' | 'tech';
}

export const PHASE_2_QUESTIONS: Phase2Question[] = [
  // ── IDENTITY: What lights you up? ──
  {
    id: 'enjoy',
    number: 1,
    question: 'What do I enjoy doing?',
    context: 'Think about the activities that bring you joy and satisfaction.',
    placeholder: 'The things that make you lose track of time. The activities you would do even if no one paid you for them.',
    group: 'identity',
  },
  {
    id: 'fulfilled',
    number: 2,
    question: 'What makes me feel fulfilled?',
    context: 'What experiences or achievements give you a sense of fulfillment?',
    placeholder: 'When have you felt most alive? Most "you"? The moments when something inside said "yes, this is right."',
    group: 'fulfillment',
  },

  // ── GIFTS: What do you have that no one gave you? ──
  {
    id: 'natural-gifts',
    number: 3,
    question: 'What do I have that no one gave me?',
    context: 'Your natural abilities and strengths are often indicators of areas where you can "show up and show out."',
    placeholder: 'The talents that just showed up. The things you have always been able to do that other people seem to struggle with.',
    group: 'gifts',
  },
  {
    id: 'passion',
    number: 4,
    question: 'What do I want to do that no one has to make me do?',
    context: 'What activities, causes, or fields ignite your enthusiasm and passion?',
    placeholder: 'The thing you would do tomorrow with no permission, no paycheck, no audience.',
    group: 'gifts',
  },

  // ── VALUES: What do you stand on? ──
  {
    id: 'values',
    number: 5,
    question: 'What are my core values and beliefs?',
    context: 'What values and beliefs guide your decisions and actions?',
    placeholder: 'The things you would not break, bend, or trade — even when it costs you.',
    group: 'values',
  },
  {
    id: 'lifestyle',
    number: 6,
    question: 'What kind of lifestyle would I need to demonstrate my core beliefs?',
    placeholder: 'How would you have to live, work, and move for your values to be visible in your daily life?',
    group: 'values',
  },

  // ── PROBLEMS: What needs solving? ──
  {
    id: 'disagree',
    number: 7,
    question: "What don't I agree with in the world around me?",
    placeholder: 'The things that frustrate you, anger you, or make you say "this should not be this way."',
    group: 'problems',
  },
  {
    id: 'world-problems',
    number: 8,
    question: 'What problems do I want to take action to solve in the world?',
    context: 'What people, communities, or businesses do you want to impact, serve, or influence?',
    placeholder: 'Specifically — who needs what you have? Whose life gets better because you showed up?',
    group: 'problems',
  },
  {
    id: 'passion-problems',
    number: 9,
    question: 'What problems can I use my passion to solve?',
    context: 'Be creative and let your imagination soar.',
    placeholder: 'The intersection of what you love and what the world needs. Where your gift becomes a solution.',
    group: 'problems',
  },

  // ── COMMUNICATION: How do you show the way? ──
  {
    id: 'silent-impact',
    number: 10,
    question: 'If I could not talk, how could I show people a better way?',
    placeholder: 'Demonstration over explanation. What would you build, make, or do that would speak for itself?',
    group: 'communication',
  },
  {
    id: 'inspiration',
    number: 11,
    question: 'What people, events, or ideas inspire me?',
    placeholder: 'Who or what makes you want to be more, do more, become more?',
    group: 'communication',
  },

  // ── LEGACY: Who are you becoming? ──
  {
    id: 'accomplish',
    number: 12,
    question: 'What do I want to accomplish in my life?',
    context: 'Your dreams, aspirations, deepest desires, and ambitions.',
    placeholder: 'The big ones. The wild ones. The ones you have not said out loud yet because they scared you.',
    group: 'legacy',
  },
  {
    id: 'identity',
    number: 13,
    question: 'Who am I going to be?',
    context: 'What kind of legacy do you want to leave? How do you want to be remembered? Where are you going? What impact are you going to have?',
    placeholder: 'When your name comes up after you are gone — what do people say? What did you leave behind?',
    group: 'legacy',
  },

  // ── SUCCESS: On your terms ──
  {
    id: 'success',
    number: 14,
    question: 'How do I define success?',
    context: 'What does success mean to you personally? Think beyond your upbringing, culture, and society.',
    placeholder: 'Forget what they told you success looks like. What does it look like to YOU?',
    group: 'success',
  },

  // ── TECH: Tools for the journey ──
  {
    id: 'tech-needed',
    number: 15,
    question: 'Do I need to invent specific technology to go along with my vision?',
    placeholder: 'Does your vision require something that does not exist yet? Something only you can build?',
    group: 'tech',
  },
  {
    id: 'tech-available',
    number: 16,
    question: 'What technologies are available to help me achieve my vision?',
    context: 'Online courses, networking platforms, content tools, mentorship platforms, marketing tools, collaboration tools, funding platforms — what is already out there waiting for you?',
    placeholder: 'The tools, platforms, and resources you can use right now to move forward.',
    group: 'tech',
  },
];

/**
 * The system prompt addendum that makes the AI use the book's wisdom
 * during the assessment. References the book directly as context.
 */
export const BOOK_WISDOM_PROMPT = `
You are guided by the wisdom of "The Roadmap: Blueprint Your Vision" by Zion SWRV Birdsong.

Core principles from the book to anchor your analysis:

1. "Where there is no vision, the people perish." Without revelation, people run wild. Your job is to help reveal the vision they already carry.

2. "Vision visits everyone to give their life meaning." The user is not searching for purpose from outside themselves — they are uncovering what was placed in them.

3. "When you know what you can solve, you also know who can help you." Connect their gifts to the specific problems they are equipped to solve.

4. "Vision is the ability to visualize and see past now." Help them see past their current circumstances to where they are designed to go.

5. "Your environment determines your growth." Address the environments — physical, mental, relational — that need to change for their vision to thrive.

6. "Vision is not made, it is received." Treat their answers like clues to a vision that has been given to them, not something they have to manufacture.

7. "Setbacks are setups for your outcome and income." Reframe their struggles as preparation, not obstacles.

8. "The biggest enemy of the right direction is a good direction." Help them see what is GOOD versus what is RIGHT for their specific blueprint.

9. "Past successes can be the worst enemy of vision." Do not let yesterday's wins define their tomorrow.

10. "Faith is speaking like it is already done because you know it is going to be." Use present-tense, affirmative language about their vision.

When generating the assessment, weave these principles into the language without quoting the book directly. The user should feel the wisdom of the book without you announcing it.
`.trim();
