import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const prisma = new PrismaClient();
const colorPalette = ['#8b0000', '#ba2d65', '#c05621', '#2563eb', '#0f766e', '#7c3aed'];
const sampleDescriptions = {
    'Data Science/Machine Learning': 'Covers ML fundamentals, workflows, and model evaluation best practices.',
    'Databases/SQL': 'SQL mastery, schema design, and transactional thinking.',
    'Programming/Algorithms': 'Core CS data structures, algorithms, and complexity.',
    'Computer Science Fundamentals': 'Systems thinking, OS, memory, and architecture.',
    'Networking/Security': 'Protocols, security layers, and best practices.',
    'Cloud Computing/DevOps': 'Modern delivery pipelines, IaC, and distributed workloads.'
};
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_FILE = path.resolve(__dirname, '../../tests/test1.csv.txt');
function parseCsv() {
    const raw = fs.readFileSync(TEST_FILE, 'utf-8');
    const output = {};
    raw
        .split('---')
        .map((section) => section.trim())
        .filter(Boolean)
        .forEach((block) => {
        block
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .forEach((line) => {
            const [category, question] = line.split(',');
            if (!category || !question)
                return;
            if (!output[category]) {
                output[category] = [];
            }
            output[category].push(question.trim());
        });
    });
    return output;
}
async function main() {
    const questionMap = parseCsv();
    await prisma.testSession.deleteMany();
    await prisma.progressRecord.deleteMany();
    await prisma.question.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    let colorIndex = 0;
    for (const [name, prompts] of Object.entries(questionMap)) {
        const category = await prisma.category.create({
            data: {
                name,
                description: sampleDescriptions[name] || 'Practice topic',
                color: colorPalette[colorIndex % colorPalette.length]
            }
        });
        colorIndex += 1;
        await prisma.question.createMany({
            data: prompts.map((prompt) => ({ prompt, categoryId: category.id }))
        });
    }
    const passwordHash = await bcrypt.hash('password123', 10);
    await prisma.user.create({
        data: {
            name: 'Demo User',
            email: 'demo@topcit.dev',
            passwordHash
        }
    });
    console.log('Database seeded. Demo credentials -> demo@topcit.dev / password123');
}
main()
    .catch((err) => {
    console.error(err);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
