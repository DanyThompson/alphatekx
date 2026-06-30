import fs from 'fs/promises';
import path from 'path';

const LEDGER_PATH = path.join(process.cwd(), 'credits-ledger.json');

function normalizeLedger(raw) {
  return {
    balance: Number.isFinite(Number(raw?.balance)) ? Number(raw.balance) : 100,
    transactions: Array.isArray(raw?.transactions) ? raw.transactions : [],
  };
}

async function readLedger() {
  try {
    const content = await fs.readFile(LEDGER_PATH, 'utf8');
    return normalizeLedger(JSON.parse(content));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { balance: 100, transactions: [] };
    }
    throw error;
  }
}

async function writeLedger(ledger) {
  await fs.mkdir(path.dirname(LEDGER_PATH), { recursive: true });
  await fs.writeFile(LEDGER_PATH, JSON.stringify(ledger, null, 2), 'utf8');
}

export async function getCreditBalance(owner = 'default') {
  const ledger = await readLedger();
  return {
    balance: ledger.balance,
    owner,
    lowBalance: ledger.balance <= 5,
  };
}

export async function consumeCredits({ amount = 1, reason = 'generic-action', owner = 'default' } = {}) {
  const ledger = await readLedger();
  const numericAmount = Math.max(0, Number(amount) || 0);
  const nextBalance = Math.max(0, ledger.balance - numericAmount);
  const transaction = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    amount: numericAmount,
    reason,
    owner,
    timestamp: new Date().toISOString(),
    balanceAfter: nextBalance,
  };

  const nextLedger = {
    balance: nextBalance,
    transactions: [transaction, ...ledger.transactions].slice(0, 100),
  };

  await writeLedger(nextLedger);
  return { success: true, balance: nextBalance, transaction };
}

export async function addCredits({ amount = 10, reason = 'top-up', owner = 'default' } = {}) {
  const ledger = await readLedger();
  const numericAmount = Math.max(0, Number(amount) || 0);
  const nextLedger = {
    balance: ledger.balance + numericAmount,
    transactions: [{
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      amount: numericAmount,
      reason,
      owner,
      timestamp: new Date().toISOString(),
      balanceAfter: ledger.balance + numericAmount,
    }, ...ledger.transactions].slice(0, 100),
  };

  await writeLedger(nextLedger);
  return { success: true, balance: nextLedger.balance };
}

export function shouldPromptTopUp(balance) {
  return Number(balance) <= 5;
}
