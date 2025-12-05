import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const colorPalette = ['#8b0000', '#ba2d65', '#c05621', '#2563eb', '#0f766e', '#7c3aed'];

const sampleDescriptions: Record<string, string> = {
  'Data Science/Machine Learning': 'Covers ML fundamentals, workflows, and model evaluation best practices.',
  'Databases/SQL': 'SQL mastery, schema design, and transactional thinking.',
  'Programming/Algorithms': 'Core CS data structures, algorithms, and complexity.',
  'Computer Science Fundamentals': 'Systems thinking, OS, memory, and architecture.',
  'Networking/Security': 'Protocols, security layers, and best practices.',
  'Cloud Computing/DevOps': 'Modern delivery pipelines, IaC, and distributed workloads.'
};

const TEST_FILE = path.resolve(__dirname, '../../tests/test1.csv.txt');

function parseCsv(): Record<string, string[]> {
  const raw = fs.readFileSync(TEST_FILE, 'utf-8');
  const output: Record<string, string[]> = {};
  raw
    .split('---')
    .map((section: string) => section.trim())
    .filter(Boolean)
    .forEach((block: string) => {
      block
        .split('\n')
        .map((line: string) => line.trim())
        .filter(Boolean)
        .forEach((line: string) => {
          const [category, question] = line.split(',');
          if (!category || !question) return;
          if (!output[category]) {
            output[category] = [];
          }
          output[category].push(question.trim());
        });
    });
  return output;
}

const multipleChoiceQuestions = [
  {
    category: 'Networking/Security',
    prompt: 'Which transport-layer protocol guarantees ordered, reliable delivery of packets?',
    options: ['TCP', 'UDP', 'ICMP', 'ARP'],
    correctIndex: 0
  },
  {
    category: 'Databases/SQL',
    prompt: 'Which SQL clause filters rows after aggregation?',
    options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'],
    correctIndex: 1
  },
  {
    category: 'Programming/Algorithms',
    prompt: 'What is the time complexity of binary search on a sorted array?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    correctIndex: 1
  },
  {
    category: 'Computer Science Fundamentals',
    prompt: 'Which component of the operating system schedules CPU time for processes?',
    options: ['Memory manager', 'Scheduler', 'File system', 'Device driver'],
    correctIndex: 1
  },
  {
    category: 'Data Science/Machine Learning',
    prompt: 'Which technique helps prevent overfitting by randomly dropping neurons during training?',
    options: ['Batch normalization', 'Dropout', 'Gradient clipping', 'Early stopping'],
    correctIndex: 1
  },
  {
    category: 'Cloud Computing/DevOps',
    prompt: 'Which service model lets you deploy applications without managing servers?',
    options: ['IaaS', 'PaaS', 'Serverless/FaaS', 'SaaS'],
    correctIndex: 2
  },
  {
    category: 'Networking/Security Deep Dive',
    prompt: 'What cryptographic technique uses the same key for encryption and decryption?',
    options: ['Symmetric encryption', 'Asymmetric encryption', 'Hashing', 'Salting'],
    correctIndex: 0
  },
  {
    category: 'Databases/SQL Deep Dive',
    prompt: 'Which strategy partitions data horizontally across multiple servers?',
    options: ['Indexing', 'Sharding', 'Replication', 'Materialized views'],
    correctIndex: 1
  },
  {
    category: 'Programming/Algorithms Deep Dive',
    prompt: 'Which data structure gives O(1) average-time insert and lookup by key?',
    options: ['Array', 'Binary search tree', 'Hash table', 'Heap'],
    correctIndex: 2
  },
  {
    category: 'Computer Science Fundamentals Deep Dive',
    prompt: 'What term describes the rapid swapping of pages that degrades performance?',
    options: ['Caching', 'Thrashing', 'Paging', 'Prefetching'],
    correctIndex: 1
  }
];

async function main() {
  const questionMap = parseCsv();

  await prisma.note.deleteMany();
  await prisma.customExamQuestion.deleteMany();
  await prisma.customFlashcard.deleteMany();
  await prisma.uploadedDocument.deleteMany();
  await prisma.testResponse.deleteMany();
  await prisma.testSession.deleteMany();
  await prisma.progressRecord.deleteMany();
  await prisma.question.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  let colorIndex = 0;
  const categoryMap: Record<string, number> = {};
  for (const [name, prompts] of Object.entries(questionMap)) {
    const category = await prisma.category.create({
      data: {
        name,
        description: sampleDescriptions[name] || 'Practice topic',
        color: colorPalette[colorIndex % colorPalette.length]
      }
    });
    colorIndex += 1;
    categoryMap[name] = category.id;

    await prisma.question.createMany({
      data: prompts.map((prompt) => ({ prompt, categoryId: category.id }))
    });
  }

  for (const question of multipleChoiceQuestions) {
    let categoryId = categoryMap[question.category];
    if (!categoryId) {
      const category = await prisma.category.create({
        data: {
          name: question.category,
          description: sampleDescriptions[question.category] || 'Practice topic',
          color: colorPalette[colorIndex % colorPalette.length]
        }
      });
      colorIndex += 1;
      categoryId = category.id;
      categoryMap[question.category] = category.id;
    }

    await prisma.question.create({
      data: {
        prompt: question.prompt,
        categoryId,
        answer: question.options[question.correctIndex],
        options: JSON.stringify(question.options),
        correctOptionIndex: question.correctIndex
      }
    });
  }

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@topcit.dev',
      passwordHash,
      role: 'USER'
    }
  });

  await prisma.user.create({
    data: {
      name: 'Admin Operator',
      email: 'admin@topcit.dev',
      passwordHash: adminPassword,
      role: 'ADMIN'
    }
  });

  await prisma.note.create({
    data: {
      userId: demoUser.id,
      title: 'Kickoff study plan',
      content: 'Focus on networking/security flashcards this week and run a practice exam on Friday.'
    }
  });

  await prisma.customFlashcard.create({
    data: {
      userId: demoUser.id,
      prompt: 'Explain idempotency in REST APIs.',
      answer: 'Same request executed multiple times results in identical state. PUT/DELETE should be idempotent.',
      tags: 'api,rest'
    }
  });

  await prisma.customExamQuestion.create({
    data: {
      userId: demoUser.id,
      question: 'Design a CI/CD pipeline for a microservice that requires compliance checks.',
      sampleAnswer: 'Use branching strategy, automated tests, security scanning, and gated deployments.',
      difficulty: 'Intermediate'
    }
  });

  console.log('Database seeded. Demo -> demo@topcit.dev/password123, Admin -> admin@topcit.dev/admin123');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
