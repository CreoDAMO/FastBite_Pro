
import express from 'express';
const router = express.Router();

router.post('/create-intent', (req, res) => {
  res.json({ message: 'Payment intent endpoint' });
});

export default router;
