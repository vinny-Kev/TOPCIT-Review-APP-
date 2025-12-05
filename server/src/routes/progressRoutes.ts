import { Response, Router } from 'express';
import authMiddleware, { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const [records, categories, sessions] = await Promise.all([
      prisma.progressRecord.findMany({ where: { userId: req.user.id } }),
      prisma.category.findMany({ include: { _count: { select: { questions: true } } } }),
      prisma.testSession.count({ where: { userId: req.user.id } })
    ]);

    const progressMap = new Map(records.map((record) => [record.categoryId, record]));

    const chart = categories.map((category) => {
      const record = progressMap.get(category.id);
      const total = record?.total || category._count.questions;
      const completed = record?.completed || 0;
      return {
        label: category.name,
        completed,
        total,
        percentage: total ? Math.round((completed / total) * 100) : 0,
        color: category.color
      };
    });

    const overallCompleted = chart.reduce((sum, entry) => sum + entry.completed, 0);
    const overallTotal = chart.reduce((sum, entry) => sum + entry.total, 0) || 1;

    res.json({
      summary: {
        topicsCovered: chart.length,
        questionsPracticed: overallCompleted,
        completionRate: Math.round((overallCompleted / overallTotal) * 100),
        testsTaken: sessions
      },
      chart
    });
  } catch (err) {
    res.status(500).json({ message: 'Unable to load progress' });
  }
});

export default router;
