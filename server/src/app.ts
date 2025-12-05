import express from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import progressRoutes from './routes/progressRoutes';
import testRoutes from './routes/testRoutes';
import notesRoutes from './routes/notesRoutes';
import documentsRoutes from './routes/documentsRoutes';
import customContentRoutes from './routes/customContentRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/custom-content', customContentRoutes);
app.use('/api/admin', adminRoutes);

export default app;
