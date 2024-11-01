import express from 'express';
import cors from 'cors';
import recipesRouter from './routes/recipes.js';
import userRoutes from './routes/users.js';

const app = express();

// CORS configuration
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? ['https://husman-frontend.vercel.app', 'https://main.d2mfv1qnw7e58a.amplifyapp.com']
    : ['http://localhost:5173', 'https://husman-frontend.vercel.app'];

const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

// Apply CORS middleware
app.use(cors(corsOptions));

app.use(express.json());

// Import routes
app.use('/recipes', recipesRouter);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

// Only start the server if we're not in a Vercel environment and not running tests
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
