
import express from 'express';
const router = express.Router();

router.get('/metrics', (req, res) => {
  res.json({ message: 'Compliance metrics endpoint' });
});

export default router;
