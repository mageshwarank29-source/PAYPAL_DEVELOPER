import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory Sandbox Environment State
interface Transaction {
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

interface Subscription {
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

interface WebhookEvent {
  id: string;
  eventType: string;
  resourceType: string;
  summary: string;
  timestamp: string;
  status: 'DELIVERED' | 'PENDING';
  resourceId: string;
}

let sandboxState = {
  merchant: {
    accountEmail: 'sb-merchant-us@business.example.com',
    payerId: 'P9W8R24XKYL7A',
    businessName: 'Apex Digital Commerce LLC',
    currency: 'USD',
    clientId: 'Aa7JkX82910M_LiveSandboxDemo_Key8901LqZ',
    mode: 'sandbox' as const,
  },
  balance: {
    available: 14892.50,
    pending: 340.00,
    held: 0.00,
    currency: 'USD',
  },
  transactions: [
    {
      id: '8XY29410KT829104A',
      type: 'CAPTURE',
      status: 'COMPLETED',
      amount: 149.00,
      currency: 'USD',
      fee: 4.62,
      net: 144.38,
      payerName: 'Sarah Jenkins',
      payerEmail: 's.jenkins@customer.example.com',
      description: 'Annual Pro Plan Upgrade',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      orderId: 'ORD-902184-77',
    },
    {
      id: '6LM18294QP301982B',
      type: 'SALE',
      status: 'COMPLETED',
      amount: 49.99,
      currency: 'USD',
      fee: 1.75,
      net: 48.24,
      payerName: 'Marcus Vance',
      payerEmail: 'mvance@techcorp.example.com',
      description: 'API Integration Toolkit License',
      timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
      orderId: 'ORD-894712-10',
    },
    {
      id: '4TJ99102ZA882190C',
      type: 'SUBSCRIPTION_PAYMENT',
      status: 'COMPLETED',
      amount: 29.00,
      currency: 'USD',
      fee: 1.14,
      net: 27.86,
      payerName: 'Elena Rostova',
      payerEmail: 'elena.r@designstudio.example.com',
      description: 'Monthly Cloud Sync Tier',
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      orderId: 'SUB-41092-RECUR',
    },
    {
      id: '9QK33019VB119283D',
      type: 'REFUND',
      status: 'REFUNDED',
      amount: -35.00,
      currency: 'USD',
      fee: -1.02,
      net: -33.98,
      payerName: 'David Chen',
      payerEmail: 'dchen88@buyer.example.com',
      description: 'Refund for Duplicate Order',
      timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      orderId: 'ORD-761209-02',
    },
    {
      id: '2PL44810RT662914E',
      type: 'CAPTURE',
      status: 'COMPLETED',
      amount: 220.00,
      currency: 'USD',
      fee: 6.68,
      net: 213.32,
      payerName: 'Chloe Dupont',
      payerEmail: 'chloe.dupont@atelier.example.com',
      description: 'Enterprise Consultation Deposit',
      timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      orderId: 'ORD-651094-88',
    },
  ] as Transaction[],
  subscriptions: [
    {
      id: 'I-BW452901KL88',
      planId: 'P-99102X',
      planName: 'Developer Pro Monthly',
      subscriberName: 'Elena Rostova',
      subscriberEmail: 'elena.r@designstudio.example.com',
      status: 'ACTIVE',
      billingAmount: 29.00,
      frequency: 'MONTHLY',
      nextBillingDate: '2026-12-05',
      startDate: '2026-02-05',
    },
    {
      id: 'I-TR7781290OP1',
      planId: 'P-88201Y',
      planName: 'Enterprise SaaS Tier',
      subscriberName: 'TechVision Global Inc.',
      subscriberEmail: 'billing@techvision.example.com',
      status: 'ACTIVE',
      billingAmount: 299.00,
      frequency: 'MONTHLY',
      nextBillingDate: '2026-11-20',
      startDate: '2025-11-20',
    },
    {
      id: 'I-KL110923ZA34',
      planId: 'P-99102X',
      planName: 'Developer Pro Monthly',
      subscriberName: 'Liam O\'Connor',
      subscriberEmail: 'liam@fintech.example.com',
      status: 'ACTIVE',
      billingAmount: 29.00,
      frequency: 'MONTHLY',
      nextBillingDate: '2026-11-18',
      startDate: '2026-01-18',
    },
  ] as Subscription[],
  webhooks: [
    {
      id: 'WH-EVT-99210',
      eventType: 'PAYMENT.CAPTURE.COMPLETED',
      resourceType: 'capture',
      summary: 'Payment capture completed for $149.00 USD (ORD-902184-77)',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      status: 'DELIVERED',
      resourceId: '8XY29410KT829104A',
    },
    {
      id: 'WH-EVT-99209',
      eventType: 'CHECKOUT.ORDER.APPROVED',
      resourceType: 'checkout-order',
      summary: 'Checkout order approved by buyer Marcus Vance',
      timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      status: 'DELIVERED',
      resourceId: 'ORD-894712-10',
    },
    {
      id: 'WH-EVT-99208',
      eventType: 'BILLING.SUBSCRIPTION.ACTIVATED',
      resourceType: 'subscription',
      summary: 'Subscription I-BW452901KL88 activated successfully',
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      status: 'DELIVERED',
      resourceId: 'I-BW452901KL88',
    },
  ] as WebhookEvent[],
};

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// REST Endpoints
app.get('/api/sandbox/state', (_req, res) => {
  res.json(sandboxState);
});

// Simulate incoming payment
app.post('/api/sandbox/simulate-payment', (req, res) => {
  const {
    amount = 49.00,
    payerName = 'Jane Buyer',
    payerEmail = 'buyer-jane@customer.example.com',
    description = 'Standard Sandbox Checkout Payment',
  } = req.body;

  const numAmount = Math.max(1, parseFloat(amount) || 49.00);
  const fee = +(numAmount * 0.029 + 0.30).toFixed(2);
  const net = +(numAmount - fee).toFixed(2);
  const txId = '8SB' + Math.random().toString(36).substring(2, 11).toUpperCase();
  const ordId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

  const newTx: Transaction = {
    id: txId,
    type: 'CAPTURE',
    status: 'COMPLETED',
    amount: numAmount,
    currency: 'USD',
    fee,
    net,
    payerName,
    payerEmail,
    description,
    timestamp: new Date().toISOString(),
    orderId: ordId,
  };

  sandboxState.transactions.unshift(newTx);
  sandboxState.balance.available = +(sandboxState.balance.available + net).toFixed(2);

  // Add webhook event
  const webhookId = 'WH-EVT-' + Math.floor(10000 + Math.random() * 90000);
  sandboxState.webhooks.unshift({
    id: webhookId,
    eventType: 'PAYMENT.CAPTURE.COMPLETED',
    resourceType: 'capture',
    summary: `Payment capture completed for $${numAmount.toFixed(2)} USD (${ordId})`,
    timestamp: new Date().toISOString(),
    status: 'DELIVERED',
    resourceId: txId,
  });

  res.json({
    success: true,
    transaction: newTx,
    updatedBalance: sandboxState.balance,
  });
});

// Simulate refund
app.post('/api/sandbox/simulate-refund', (req, res) => {
  const { transactionId } = req.body;
  const target = sandboxState.transactions.find((t) => t.id === transactionId);

  if (!target) {
    return res.status(404).json({ error: 'Transaction not found in sandbox ledger' });
  }

  if (target.status === 'REFUNDED') {
    return res.status(400).json({ error: 'Transaction already refunded' });
  }

  target.status = 'REFUNDED';
  sandboxState.balance.available = +(sandboxState.balance.available - target.net).toFixed(2);

  const refundTxId = 'RF-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const refundTx: Transaction = {
    id: refundTxId,
    type: 'REFUND',
    status: 'REFUNDED',
    amount: -target.amount,
    currency: target.currency,
    fee: -target.fee,
    net: -target.net,
    payerName: target.payerName,
    payerEmail: target.payerEmail,
    description: `Refund for TX ${target.id}`,
    timestamp: new Date().toISOString(),
    orderId: target.orderId,
  };
  sandboxState.transactions.unshift(refundTx);

  sandboxState.webhooks.unshift({
    id: 'WH-EVT-' + Math.floor(10000 + Math.random() * 90000),
    eventType: 'PAYMENT.CAPTURE.REFUNDED',
    resourceType: 'refund',
    summary: `Refund processed for $${target.amount.toFixed(2)} USD on capture ${target.id}`,
    timestamp: new Date().toISOString(),
    status: 'DELIVERED',
    resourceId: refundTxId,
  });

  res.json({
    success: true,
    refundedTransaction: refundTx,
    updatedBalance: sandboxState.balance,
  });
});

// Reset sandbox demo data
app.post('/api/sandbox/reset', (_req, res) => {
  sandboxState.balance.available = 14892.50;
  sandboxState.balance.pending = 340.00;
  res.json({ success: true, balance: sandboxState.balance });
});

// Assistant Chat endpoint
app.post('/api/assistant/chat', async (req, res) => {
  const { message, history = [], activeContext } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Construct context summary
  const recentTransactionsSummary = sandboxState.transactions.slice(0, 5).map(t => 
    `- ID: ${t.id} | ${t.type} | $${t.amount.toFixed(2)} ${t.currency} | Status: ${t.status} | From: ${t.payerName} (${t.payerEmail}) | Net: $${t.net.toFixed(2)} | Date: ${t.timestamp}`
  ).join('\n');

  const systemInstruction = `You are an intelligent, contextual AI Assistant embedded within the official PayPal Developer application portal.
Your primary goals are to:
1. Guide developers and users on how to use specific features and components of the PayPal platform (such as JavaScript SDK buttons, React components via @paypal/react-paypal-js, invoices, subscriptions, webhooks, and ledger transactions).
2. Answer inquiries regarding incoming funds or payment statuses in real-time (e.g., checking sandbox balances or recent ledger events). You have direct, real-time access to the user's active sandbox merchant account and transaction ledger.
3. Deliver concise, professional, and accurate support matching PayPal's brand tone and technical documentation.

Current Live Sandbox State:
- Merchant Business: ${sandboxState.merchant.businessName}
- Merchant Account Email: ${sandboxState.merchant.accountEmail}
- Merchant Payer ID: ${sandboxState.merchant.payerId}
- Client ID: ${sandboxState.merchant.clientId}
- Available Balance: $${sandboxState.balance.available.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${sandboxState.balance.currency}
- Pending Balance: $${sandboxState.balance.pending.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${sandboxState.balance.currency}
- Recent Ledger Transactions (most recent first):
${recentTransactionsSummary}
- Active Subscriptions Count: ${sandboxState.subscriptions.length}
- Recent Webhook Events: ${sandboxState.webhooks.length} logged
${activeContext ? `- User's Current Screen/View: ${JSON.stringify(activeContext)}` : ''}

Behavior Guidelines:
- Be polite, direct, and actionable in your responses.
- When explaining technical features, reference standard practices like using client IDs and the PayPal SDK script tags (<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD"></script>) or React components (<PayPalScriptProvider options={{ clientId: "..." }}><PayPalButtons ... /></PayPalScriptProvider>).
- When asked about payments, recent transactions, or money received, confirm details clearly (e.g., citing the exact transaction ID, amount in USD, payer name, status COMPLETED, and timestamp).
- Keep responses relatively brief and conversational, making them ideal for a floating chat widget interface. Use clean markdown formatting with concise code snippets where helpful.
- If the user asks to test payments, mention that they can click "Simulate Payment" in the Sandbox Ledger or use the interactive PayPal SDK Buttons playground.`;

  // Helper for generating contextual response based on live state
  const generateContextualResponse = (query: string): string => {
    const q = query.toLowerCase();

    // Check specific transaction by ID if query contains an ID
    const txMatch = sandboxState.transactions.find(t => q.includes(t.id.toLowerCase()));
    if (txMatch) {
      return `Transaction **${txMatch.id}** is **${txMatch.status}**!
- **Type**: ${txMatch.type}
- **Gross Amount**: $${Math.abs(txMatch.amount).toFixed(2)} ${txMatch.currency}
- **Fee**: $${Math.abs(txMatch.fee).toFixed(2)} USD
- **Net Settled**: $${Math.abs(txMatch.net).toFixed(2)} USD
- **Payer**: ${txMatch.payerName} (\`${txMatch.payerEmail}\`)
- **Description**: ${txMatch.description}
- **Timestamp**: ${new Date(txMatch.timestamp).toLocaleString()}`;
    }

    if (q.includes('balance') || q.includes('fund') || q.includes('money') || q.includes('incoming') || q.includes('payment') || q.includes('receive')) {
      const latest = sandboxState.transactions[0];
      return `Your current live sandbox balance is **$${sandboxState.balance.available.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD** available (with $${sandboxState.balance.pending.toFixed(2)} USD pending).

Your most recent ledger event was a **${latest.type}** of **$${latest.amount.toFixed(2)} USD** from **${latest.payerName}** (\`${latest.id}\`) on ${new Date(latest.timestamp).toLocaleTimeString()}.`;
    }

    if (q.includes('react') || q.includes('@paypal/react-paypal-js')) {
      return `Here is how to integrate PayPal buttons using the standard React library \`@paypal/react-paypal-js\`:

\`\`\`jsx
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export function Checkout() {
  return (
    <PayPalScriptProvider options={{ clientId: "${sandboxState.merchant.clientId}", currency: "USD" }}>
      <PayPalButtons
        style={{ layout: "vertical", color: "gold", shape: "rect" }}
        createOrder={(data, actions) => actions.order.create({
          purchase_units: [{ amount: { value: "49.00" } }]
        })}
        onApprove={async (data, actions) => {
          const details = await actions.order.capture();
          console.log("Capture approved by " + details.payer.name.given_name);
        }}
      />
    </PayPalScriptProvider>
  );
}
\`\`\`
You can test this interactively right now in the **SDK Playground** tab!`;
    }

    if (q.includes('button') || q.includes('sdk') || q.includes('javascript') || q.includes('html')) {
      return `To embed PayPal JavaScript SDK buttons on your website, load the SDK script tag with your client ID and mount the container:

\`\`\`html
<!-- Load PayPal JS SDK with your Client ID -->
<script src="https://www.paypal.com/sdk/js?client-id=${sandboxState.merchant.clientId}&currency=USD"></script>

<div id="paypal-button-container"></div>

<script>
  paypal.Buttons({
    style: { layout: 'vertical', color: 'gold', shape: 'rect' },
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [{ amount: { value: '49.00' } }]
      });
    },
    onApprove: (data, actions) => {
      return actions.order.capture().then(details => {
        alert('Transaction completed by ' + details.payer.name.given_name);
      });
    }
  }).render('#paypal-button-container');
</script>
\`\`\`
Check the **SDK Playground** tab to test different button colors, shapes, and funding sources live!`;
    }

    if (q.includes('webhook') || q.includes('signature') || q.includes('event')) {
      return `PayPal webhooks notify your server asynchronously. To verify webhook signatures:
1. Extract headers: \`PAYPAL-AUTH-ALGO\`, \`PAYPAL-CERT-URL\`, \`PAYPAL-TRANSMISSION-ID\`, \`PAYPAL-TRANSMISSION-SIG\`, \`PAYPAL-TRANSMISSION-TIME\`.
2. Call PayPal's verification endpoint \`POST /v1/notifications/verify-webhook-signature\` or use cryptographic verification with PayPal's public cert.
3. Once verified, inspect \`event_type\` (such as \`PAYMENT.CAPTURE.COMPLETED\`) and fulfill the customer order.

You can simulate webhook dispatches in the **Webhooks** panel!`;
    }

    if (q.includes('subscription') || q.includes('recurring') || q.includes('plan')) {
      return `To set up recurring subscriptions with PayPal:
1. Create a Product & Billing Plan (e.g. \`P-99102X\` Developer Pro at $29/mo).
2. Add \`vault=true&intent=subscription\` to the PayPal JavaScript SDK script.
3. In \`paypal.Buttons\`, use \`actions.subscription.create({ plan_id: 'P-99102X' })\`.
4. Listen to \`BILLING.SUBSCRIPTION.ACTIVATED\` webhooks to grant access.

You currently have **${sandboxState.subscriptions.length} active subscriptions** in your sandbox ledger!`;
    }

    return `I am your PayPal Developer Assistant. I have live access to your sandbox account (**${sandboxState.merchant.accountEmail}**, balance: **$${sandboxState.balance.available.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD**).

You can ask me to:
- Check any transaction by ID or review recent incoming funds
- Generate JavaScript SDK or React (\`@paypal/react-paypal-js\`) code snippets
- Explain webhook signature verification and dispute flows
- Guide subscription billing plans`;
  };

  // Fallback if no API key is configured
  if (!ai) {
    return res.json({ reply: generateContextualResponse(message) });
  }

  try {
    const conversationContents: any[] = [];

    for (const item of history.slice(-6)) {
      if (item.sender === 'user') {
        conversationContents.push({ role: 'user', parts: [{ text: item.text }] });
      } else if (item.sender === 'assistant') {
        conversationContents.push({ role: 'model', parts: [{ text: item.text }] });
      }
    }

    conversationContents.push({ role: 'user', parts: [{ text: message }] });

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: conversationContents,
        config: {
          systemInstruction,
        },
      });
    } catch (primaryError: any) {
      console.warn('Primary model error, attempting fallback model:', primaryError.message);
      // Fallback model if 3.8 is busy
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: conversationContents,
        config: {
          systemInstruction,
        },
      });
    }

    const reply = response.text || generateContextualResponse(message);
    return res.json({ reply });
  } catch (error: any) {
    console.error('Gemini error:', error);
    // Return high quality contextual fallback
    return res.json({
      reply: generateContextualResponse(message),
    });
  }
});

// Serve frontend
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
