import { VideoLecture, Simulation, RoutineSlot, NumericalProblem, Quiz } from './types';

export const MOCK_VIDEOS: VideoLecture[] = [
  {
    id: '1',
    title: 'Introduction to Kinematics',
    topic: 'Mechanics',
    chapter: 'Chapter 1',
    duration: '15:20',
    thumbnail: 'https://picsum.photos/seed/phys1/600/400',
    description: 'Understanding displacement, velocity, and acceleration in one dimension.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    isWatched: false
  },
  {
    id: '2',
    title: 'Gauss\'s Law and Electric Flux',
    topic: 'Electromagnetism',
    chapter: 'Chapter 4',
    duration: '22:45',
    thumbnail: 'https://picsum.photos/seed/phys2/600/400',
    description: 'Mastering the relationship between electric charge and the electric field.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    isWatched: true
  }
];

export const MOCK_SIMULATIONS: Simulation[] = [
  {
    id: '1',
    title: 'Projectile Motion',
    topic: 'Mechanics',
    difficulty: 'Beginner',
    launchUrl: 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html',
    observationGuide: 'Vary the launch angle and observe how the horizontal range changes. Find the angle for maximum range.',
    thumbnail: 'https://picsum.photos/seed/sim1/600/400'
  },
  {
    id: '2',
    title: 'Bending Light',
    topic: 'Optics',
    difficulty: 'Intermediate',
    launchUrl: 'https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_en.html',
    observationGuide: 'Observe refraction at the boundary of two media. Verify Snell\'s Law using the protractor tool.',
    thumbnail: 'https://picsum.photos/seed/sim2/600/400'
  }
];

export const MOCK_ROUTINE: RoutineSlot[] = [
  { id: '1', day: 'Monday', time: '09:00 - 10:30', topic: 'Mechanics', room: 'Hall A', note: 'Bring lab notebooks' },
  { id: '2', day: 'Wednesday', time: '11:00 - 12:30', topic: 'Electromagnetism', room: 'Room 302', note: 'Quiz today' },
  { id: '3', day: 'Friday', time: '14:00 - 15:30', topic: 'Quantum', room: 'Lab 1', note: 'Discussion on Schrodinger eq' }
];

export const MOCK_NUMERICALS: NumericalProblem[] = [
  {
    id: '1',
    topic: 'Mechanics',
    subTopic: 'Circular Motion',
    difficulty: 'Medium',
    statement: 'A car of mass $m = 1200\\text{ kg}$ is traveling at $v = 20\\text{ m/s}$ around a curve of radius $r = 50\\text{ m}$. Calculate the centripetal force acting on the car.',
    solutionSteps: [
      'Identify given values: $m = 1200\\text{ kg}$, $v = 20\\text{ m/s}$, $r = 50\\text{ m}$.',
      'Use the centripetal force formula: $F_c = \\frac{mv^2}{r}$.',
      'Substitute values: $F_c = \\frac{1200 \\times 20^2}{50}$.',
      'Simplify: $F_c = \\frac{1200 \\times 400}{50} = 24 \\times 400 = 9600\\text{ N}$.'
    ],
    keyFormula: '$F_c = \\frac{mv^2}{r}$',
    answer: '9600 N',
    status: 'Unsolved'
  }
];

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: '1',
    title: 'Newton\'s Laws Fundamentals',
    topic: 'Mechanics',
    difficulty: 1,
    timeLimitMinutes: 10,
    questions: [
      {
        id: 'q1',
        text: 'What is the SI unit of Force?',
        options: ['Joule', 'Newton', 'Pascal', 'Watt'],
        correctAnswer: 'Newton',
        explanation: 'The SI unit of force is the Newton ($N$), named after Isaac Newton.'
      }
    ]
  }
];
