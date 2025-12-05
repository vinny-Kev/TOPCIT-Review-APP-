import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
