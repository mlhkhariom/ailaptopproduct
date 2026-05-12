import { Router } from 'express';
import jobcardsRouter from './jobcards.js';
import billingRouter from './billing.js';
import crmRouter from './crm.js';
import staffRouter from './staff.js';
import financeRouter from './finance.js';
import reportsRouter from './reports.js';
import miscRouter from './misc.js';

const router = Router();

router.use(jobcardsRouter);
router.use(billingRouter);
router.use(crmRouter);
router.use(staffRouter);
router.use(financeRouter);
router.use(reportsRouter);
router.use(miscRouter);

export default router;
