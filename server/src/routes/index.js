import express from 'express';
import authRoutes from './auth.routes.js';

const app = express();

// Register auth routes
app.use('/api/auth', authRoutes);

export default app;
