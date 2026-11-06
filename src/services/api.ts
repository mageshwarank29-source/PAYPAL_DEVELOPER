import { SandboxState, Transaction } from '../types';

export async function fetchSandboxState(): Promise<SandboxState> {
  const res = await fetch('/api/sandbox/state');
  if (!res.ok) {
    throw new Error('Failed to load sandbox state');
  }
  return res.json();
}

export async function simulatePayment(payload: {
  amount: number;
  payerName: string;
  payerEmail: string;
  description: string;
}): Promise<{ success: boolean; transaction: Transaction; updatedBalance: SandboxState['balance'] }> {
  const res = await fetch('/api/sandbox/simulate-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Failed to simulate payment');
  }
  return res.json();
}

export async function simulateRefund(transactionId: string): Promise<{
  success: boolean;
  refundedTransaction: Transaction;
  updatedBalance: SandboxState['balance'];
}> {
  const res = await fetch('/api/sandbox/simulate-refund', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactionId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to refund transaction');
  }
  return res.json();
}

export async function sendAssistantMessage(payload: {
  message: string;
  history: Array<{ sender: 'user' | 'assistant'; text: string }>;
  activeContext?: any;
}): Promise<{ reply: string }> {
  const res = await fetch('/api/assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Failed to reach assistant server');
  }
  return res.json();
}
