export interface Transaction {
  id: string;
  type: 'CAPTURE' | 'SALE' | 'AUTHORIZATION' | 'REFUND' | 'SUBSCRIPTION_PAYMENT';
  status: 'COMPLETED' | 'PENDING' | 'REFUNDED' | 'HELD';
  amount: number;
  currency: string;
  fee: number;
  net: number;
  payerName: string;
  payerEmail: string;
  description: string;
  timestamp: string;
  orderId?: string;
}

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  subscriberName: string;
  subscriberEmail: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  billingAmount: number;
  frequency: string;
  nextBillingDate: string;
  startDate: string;
}

export interface WebhookEvent {
  id: string;
  eventType: string;
  resourceType: string;
  summary: string;
  timestamp: string;
  status: 'DELIVERED' | 'PENDING';
  resourceId: string;
  payload?: any;
}

export interface SandboxState {
  merchant: {
    accountEmail: string;
    payerId: string;
    businessName: string;
    currency: string;
    clientId: string;
    mode: 'sandbox';
  };
  balance: {
    available: number;
    pending: number;
    held: number;
    currency: string;
  };
  transactions: Transaction[];
  subscriptions: Subscription[];
  webhooks: WebhookEvent[];
}

export interface ButtonConfig {
  layout: 'vertical' | 'horizontal';
  color: 'gold' | 'blue' | 'silver' | 'white' | 'black';
  shape: 'rect' | 'pill';
  label: 'paypal' | 'checkout' | 'buynow' | 'pay';
  height: number;
  fundingSources: {
    paypal: boolean;
    paylater: boolean;
    venmo: boolean;
    card: boolean;
  };
  currency: string;
  amount: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  relatedAction?: {
    type: 'open_playground' | 'open_ledger' | 'simulate_payment' | 'view_transaction';
    label: string;
    data?: any;
  };
}
