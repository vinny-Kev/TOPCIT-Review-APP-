import { Router, Response, type Express } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import authMiddleware, { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${unique}${extension}`);
  }
} satisfies multer.DiskStorageOptions);

const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });
// Wrap multer handler to avoid duplicate Express type resolutions between workspaces
const uploadSingle = (req: unknown, res: unknown, next: unknown) =>
  (upload.single('file') as any)(req, res, next);

const router = Router();
router.use(authMiddleware);

type UploadRequest = AuthRequest & { file?: Express.Multer.File };

router.get('/', async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const documents = await prisma.uploadedDocument.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ documents });
});

router.post('/upload', uploadSingle, async (req: UploadRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'Missing file' });
  }
  if (req.file.mimetype !== 'application/pdf') {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: 'Only PDF files are supported right now.' });
  }

  const document = await prisma.uploadedDocument.create({
    data: {
      userId: req.user.id,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      status: 'PENDING'
    }
  });

  res.status(201).json({ document });
});

router.delete('/:id', async (req: AuthRequest<{ id: string }>, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid document id' });
  }

  const doc = await prisma.uploadedDocument.findUnique({ where: { id } });
  if (!doc || doc.userId !== req.user.id) {
    return res.status(404).json({ message: 'Document not found' });
  }

  await prisma.uploadedDocument.delete({ where: { id } });
  const filePath = path.join(uploadsDir, doc.storedName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  res.json({ message: 'Document removed' });
});

export default router;
