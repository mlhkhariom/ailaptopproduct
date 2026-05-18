// ══════════════════════════════════════════════════════════
// ACCOUNTING ENGINE — Double-Entry Ledger
// Every transaction has debit + credit entries
// ══════════════════════════════════════════════════════════

import { v4 as uuid } from 'uuid';
import db from '../db/database.js';

// Account types
export const ACCOUNTS = {
  CASH: 'cash', BANK: 'bank', SALES: 'sales', PURCHASES: 'purchases',
  EXPENSES: 'expenses', SALARY: 'salary', RECEIVABLES: 'accounts_receivable',
  PAYABLES: 'accounts_payable', INVENTORY: 'inventory', REVENUE: 'revenue',
  TAX_GST: 'gst_payable', DISCOUNT: 'discount_given',
};

// Record a journal entry (double-entry)
export async function recordEntry({ date, description, entries, ref_module, ref_id, created_by }) {
  const entryId = uuid();
  const entryDate = date || new Date().toISOString().split('T')[0];

  // Validate: total debits must equal total credits
  const totalDebit = entries.filter(e => e.type === 'debit').reduce((s, e) => s + e.amount, 0);
  const totalCredit = entries.filter(e => e.type === 'credit').reduce((s, e) => s + e.amount, 0);
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(`Unbalanced entry: Debit ₹${totalDebit} ≠ Credit ₹${totalCredit}`);
  }

  // Save journal entry
  await db.prepare("INSERT INTO journal_entries (id, date, description, ref_module, ref_id, total_amount, created_by) VALUES (?,?,?,?,?,?,?)")
    .run(entryId, entryDate, description, ref_module || null, ref_id || null, totalDebit, created_by || 'system');

  // Save individual ledger lines
  for (const entry of entries) {
    await db.prepare("INSERT INTO ledger (id, entry_id, account, type, amount, date, description) VALUES (?,?,?,?,?,?,?)")
      .run(uuid(), entryId, entry.account, entry.type, entry.amount, entryDate, entry.description || description);
  }

  return entryId;
}

// Record a sale (auto-creates journal entry)
export async function recordSale({ orderId, amount, paymentMethod, gst, discount }) {
  const entries = [
    { account: paymentMethod === 'cod' ? ACCOUNTS.RECEIVABLES : ACCOUNTS.BANK, type: 'debit', amount },
    { account: ACCOUNTS.REVENUE, type: 'credit', amount: amount - (gst || 0) },
  ];
  if (gst) entries.push({ account: ACCOUNTS.TAX_GST, type: 'credit', amount: gst });
  if (discount) {
    entries[0].amount = amount + discount; // Customer paid less
    entries.push({ account: ACCOUNTS.DISCOUNT, type: 'debit', amount: discount });
  }
  return recordEntry({ description: `Sale: Order ${orderId}`, entries, ref_module: 'order', ref_id: orderId });
}

// Record an expense
export async function recordExpense({ expenseId, amount, category, paymentMethod }) {
  return recordEntry({
    description: `Expense: ${category}`,
    entries: [
      { account: ACCOUNTS.EXPENSES, type: 'debit', amount },
      { account: paymentMethod === 'cash' ? ACCOUNTS.CASH : ACCOUNTS.BANK, type: 'credit', amount },
    ],
    ref_module: 'expense', ref_id: expenseId,
  });
}

// Record salary payment
export async function recordSalary({ staffId, amount, month }) {
  return recordEntry({
    description: `Salary: ${month}`,
    entries: [
      { account: ACCOUNTS.SALARY, type: 'debit', amount },
      { account: ACCOUNTS.BANK, type: 'credit', amount },
    ],
    ref_module: 'payroll', ref_id: staffId,
  });
}

// Get account balance
export async function getAccountBalance(account) {
  const debits = (await db.prepare("SELECT COALESCE(SUM(amount),0) as v FROM ledger WHERE account=? AND type='debit'").get(account))?.v || 0;
  const credits = (await db.prepare("SELECT COALESCE(SUM(amount),0) as v FROM ledger WHERE account=? AND type='credit'").get(account))?.v || 0;
  // Asset/Expense accounts: debit increases, credit decreases
  // Revenue/Liability accounts: credit increases, debit decreases
  const assetAccounts = [ACCOUNTS.CASH, ACCOUNTS.BANK, ACCOUNTS.RECEIVABLES, ACCOUNTS.INVENTORY, ACCOUNTS.EXPENSES, ACCOUNTS.SALARY, ACCOUNTS.DISCOUNT];
  return assetAccounts.includes(account) ? debits - credits : credits - debits;
}

// Trial Balance
export async function getTrialBalance() {
  const accounts = await db.prepare("SELECT account, type, SUM(amount) as total FROM ledger GROUP BY account, type ORDER BY account").all();
  const balance = {};
  for (const row of accounts) {
    if (!balance[row.account]) balance[row.account] = { debit: 0, credit: 0 };
    balance[row.account][row.type] += row.total;
  }
  return balance;
}

// Ledger for specific account (with date range)
export async function getAccountLedger(account, from, to) {
  let q = "SELECT l.*, j.description as entry_desc, j.ref_module FROM ledger l LEFT JOIN journal_entries j ON l.entry_id=j.id WHERE l.account=?";
  const params = [account];
  if (from) { q += ' AND l.date >= ?'; params.push(from); }
  if (to) { q += ' AND l.date <= ?'; params.push(to); }
  q += ' ORDER BY l.date DESC, l.id DESC';
  return db.prepare(q).all(...params);
}
