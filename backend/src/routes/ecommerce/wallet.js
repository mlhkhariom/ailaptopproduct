import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../../db/database.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();

// GET /api/wallet — get user's wallet balance + transactions
router.get('/', authMiddleware, async (req, res) => {
  let wallet = await db.prepare('SELECT * FROM wallet WHERE user_id=?').get(req.user.id);
  if (!wallet) {
    await db.prepare('INSERT INTO wallet (id, user_id, balance) VALUES (?,?,0)').run(uuid(), req.user.id);
    wallet = { balance: 0 };
  }
  const transactions = await db.prepare('SELECT * FROM wallet_transactions WHERE user_id=? ORDER BY created_at DESC LIMIT 20').all(req.user.id);
  res.json({ balance: wallet.balance, transactions });
});

// POST /api/wallet/use — use wallet balance at checkout
router.post('/use', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  const wallet = await db.prepare('SELECT * FROM wallet WHERE user_id=?').get(req.user.id);
  if (!wallet || wallet.balance < amount) return res.status(400).json({ error: 'Insufficient wallet balance' });

  await db.prepare('UPDATE wallet SET balance = balance - ?, updated_at=NOW() WHERE user_id=?').run(amount, req.user.id);
  await db.prepare('INSERT INTO wallet_transactions (id, user_id, type, amount, description) VALUES (?,?,?,?,?)')
    .run(uuid(), req.user.id, 'debit', -amount, 'Used at checkout');

  res.json({ success: true, new_balance: wallet.balance - amount });
});

// GET /api/wallet/referral — get user's referral code + stats
router.get('/referral', authMiddleware, async (req, res) => {
  let referral = await db.prepare('SELECT * FROM referrals WHERE referrer_id=? LIMIT 1').get(req.user.id);
  if (!referral) {
    const code = 'ALW' + req.user.id.slice(0, 6).toUpperCase();
    await db.prepare('INSERT INTO referrals (id, referrer_id, code) VALUES (?,?,?)').run(uuid(), req.user.id, code);
    referral = { code, status: 'active' };
  }
  const referred = await db.prepare('SELECT COUNT(*) as c FROM referrals WHERE referrer_id=? AND status=?').get(req.user.id, 'completed');
  const earned = await db.prepare("SELECT COALESCE(SUM(amount),0) as total FROM wallet_transactions WHERE user_id=? AND type='credit' AND description LIKE '%referral%'").get(req.user.id);
  res.json({ code: referral.code, referred_count: referred?.c || 0, total_earned: earned?.total || 0 });
});

// POST /api/wallet/referral/apply — apply referral code (new user)
router.post('/referral/apply', authMiddleware, async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code required' });

  const referral = await db.prepare('SELECT * FROM referrals WHERE code=?').get(code.toUpperCase());
  if (!referral) return res.status(404).json({ error: 'Invalid referral code' });
  if (referral.referrer_id === req.user.id) return res.status(400).json({ error: 'Cannot use your own code' });

  // Check if already used
  const already = await db.prepare('SELECT id FROM referrals WHERE referrer_id=? AND referred_id=?').get(referral.referrer_id, req.user.id);
  if (already) return res.status(400).json({ error: 'Already applied' });

  const reward = referral.reward_amount || 500;

  // Credit referrer
  await db.prepare('INSERT INTO wallet (id, user_id, balance) VALUES (?,?,?) ON CONFLICT (user_id) DO UPDATE SET balance=balance+?, updated_at=NOW()')
    .run(uuid(), referral.referrer_id, reward, reward);
  await db.prepare('INSERT INTO wallet_transactions (id, user_id, type, amount, description, ref_id) VALUES (?,?,?,?,?,?)')
    .run(uuid(), referral.referrer_id, 'credit', reward, `Referral reward — friend joined`, req.user.id);

  // Credit new user
  const newUserReward = Math.round(reward / 2);
  await db.prepare('INSERT INTO wallet (id, user_id, balance) VALUES (?,?,?) ON CONFLICT (user_id) DO UPDATE SET balance=balance+?, updated_at=NOW()')
    .run(uuid(), req.user.id, newUserReward, newUserReward);
  await db.prepare('INSERT INTO wallet_transactions (id, user_id, type, amount, description, ref_id) VALUES (?,?,?,?,?,?)')
    .run(uuid(), req.user.id, 'credit', newUserReward, `Welcome bonus — referral code applied`, referral.referrer_id);

  // Update referral record
  await db.prepare("UPDATE referrals SET referred_id=?, status='completed' WHERE id=?").run(req.user.id, referral.id);

  res.json({ success: true, message: `₹${newUserReward} added to your wallet!` });
});

export default router;
