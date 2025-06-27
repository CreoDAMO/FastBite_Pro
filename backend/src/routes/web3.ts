
import express from 'express';
const router = express.Router();

router.post('/payout', (req, res) => {
  res.json({ message: 'Web3 payout endpoint' });
});

export default router;
