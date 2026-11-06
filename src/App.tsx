import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { SdkPlaygroundView } from './components/SdkPlaygroundView';
import { LedgerView } from './components/LedgerView';
import { SubscriptionsView } from './components/SubscriptionsView';
import { WebhooksView } from './components/WebhooksView';
import { AssistantWidget } from './components/AssistantWidget';
import { CheckoutModal } from './components/CheckoutModal';
import { SimulatePaymentModal } from './components/SimulatePaymentModal';
import { SandboxState } from './types';
import { fetchSandboxState, simulatePayment, simulateRefund } from './services/api';

const defaultSandboxState: SandboxState = {
  merchant: {
    accountEmail: 'sb-merchant-us@business.example.com',
    payerId: 'P9W8R24XKYL7A',
    businessName: 'Apex Digital Commerce LLC',
    currency: 'USD',
    clientId: 'Aa7JkX82910M_LiveSandboxDemo_Key8901LqZ',
    mode: 'sandbox',
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
  ],
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
  ],
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
  ],
};

export default function App() {
  const [currentTab, setCurrentTab] = useState('overview');
  const [sandboxState, setSandboxState] = useState<SandboxState>(defaultSandboxState);
  const [darkMode, setDarkMode] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [checkoutModalData, setCheckoutModalData] = useState<{
    isOpen: boolean;
    amount: number;
    description: string;
  }>({
    isOpen: false,
    amount: 49.00,
    description: 'Sandbox Checkout Order',
  });
  const [externalAssistantPrompt, setExternalAssistantPrompt] = useState<string | null>(null);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load sandbox state from server
  const refreshState = async () => {
    try {
      const data = await fetchSandboxState();
      setSandboxState(data);
    } catch (err) {
      console.warn('Using client fallback sandbox state:', err);
    }
  };

  useEffect(() => {
    refreshState();
  }, []);

  // Handle simulating a payment
  const handleSimulatePayment = async (data: {
    amount: number;
    payerName: string;
    payerEmail: string;
    description: string;
  }) => {
    try {
      const result = await simulatePayment(data);
      await refreshState();
      return result;
    } catch (err) {
      // Client-side fallback
      const txId = '8SB' + Math.random().toString(36).substring(2, 10).toUpperCase();
      const numAmount = data.amount;
      const fee = +(numAmount * 0.029 + 0.30).toFixed(2);
      const net = +(numAmount - fee).toFixed(2);

      const newTx = {
        id: txId,
        type: 'CAPTURE' as const,
        status: 'COMPLETED' as const,
        amount: numAmount,
        currency: 'USD',
        fee,
        net,
        payerName: data.payerName,
        payerEmail: data.payerEmail,
        description: data.description,
        timestamp: new Date().toISOString(),
        orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      };

      setSandboxState((prev) => ({
        ...prev,
        balance: {
          ...prev.balance,
          available: +(prev.balance.available + net).toFixed(2),
        },
        transactions: [newTx, ...prev.transactions],
        webhooks: [
          {
            id: 'WH-EVT-' + Math.floor(10000 + Math.random() * 90000),
            eventType: 'PAYMENT.CAPTURE.COMPLETED',
            resourceType: 'capture',
            summary: `Payment capture completed for $${numAmount.toFixed(2)} USD`,
            timestamp: new Date().toISOString(),
            status: 'DELIVERED',
            resourceId: txId,
          },
          ...prev.webhooks,
        ],
      }));

      return { success: true, transaction: newTx };
    }
  };

  // Handle refund
  const handleRefund = async (txId: string) => {
    try {
      await simulateRefund(txId);
      await refreshState();
    } catch (err: any) {
      // Local fallback
      setSandboxState((prev) => {
        const target = prev.transactions.find((t) => t.id === txId);
        if (!target) return prev;
        target.status = 'REFUNDED';
        const refundTx = {
          id: 'RF-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          type: 'REFUND' as const,
          status: 'REFUNDED' as const,
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

        return {
          ...prev,
          balance: {
            ...prev.balance,
            available: +(prev.balance.available - target.net).toFixed(2),
          },
          transactions: [refundTx, ...prev.transactions],
        };
      });
    }
  };

  // Simulate subscription charge
  const handleSimulateSubscriptionCharge = async (subId: string) => {
    const sub = sandboxState.subscriptions.find((s) => s.id === subId);
    if (!sub) return;

    await handleSimulatePayment({
      amount: sub.billingAmount,
      payerName: sub.subscriberName,
      payerEmail: sub.subscriberEmail,
      description: `Recurring cycle charge for ${sub.planName} (${sub.id})`,
    });
  };

  // Dispatch webhook simulation
  const handleDispatchWebhook = (eventType: string) => {
    const newEvt = {
      id: 'WH-EVT-' + Math.floor(10000 + Math.random() * 90000),
      eventType,
      resourceType: eventType.includes('SUBSCRIPTION') ? 'subscription' : 'capture',
      summary: `Simulated event: ${eventType} fired at ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toISOString(),
      status: 'DELIVERED' as const,
      resourceId: '8SB' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    };

    setSandboxState((prev) => ({
      ...prev,
      webhooks: [newEvt, ...prev.webhooks],
    }));
  };

  // Ask assistant helper
  const handleAskAssistant = (question: string) => {
    setExternalAssistantPrompt(question);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        sandboxState={sandboxState}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenSimulatePayment={() => setIsSimulateModalOpen(true)}
        onOpenAssistant={() => setExternalAssistantPrompt('Hello! What is my sandbox status?')}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {currentTab === 'overview' && (
          <OverviewView
            sandboxState={sandboxState}
            onNavigate={setCurrentTab}
            onSimulatePayment={() => setIsSimulateModalOpen(true)}
            onAskAssistant={handleAskAssistant}
          />
        )}

        {currentTab === 'playground' && (
          <SdkPlaygroundView
            sandboxState={sandboxState}
            onOpenCheckout={(amount, description) =>
              setCheckoutModalData({ isOpen: true, amount, description })
            }
            onAskAssistant={handleAskAssistant}
          />
        )}

        {currentTab === 'ledger' && (
          <LedgerView
            sandboxState={sandboxState}
            onSimulatePayment={() => setIsSimulateModalOpen(true)}
            onRefundTransaction={handleRefund}
            onAskAssistant={handleAskAssistant}
          />
        )}

        {currentTab === 'subscriptions' && (
          <SubscriptionsView
            sandboxState={sandboxState}
            onSimulateSubscriptionCharge={handleSimulateSubscriptionCharge}
            onAskAssistant={handleAskAssistant}
          />
        )}

        {currentTab === 'webhooks' && (
          <WebhooksView
            sandboxState={sandboxState}
            onDispatchWebhook={handleDispatchWebhook}
            onAskAssistant={handleAskAssistant}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">PayPal Developer Platform</span>
            <span>·</span>
            <span>Sandbox Environment v2.4</span>
            <span>·</span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">All APIs Operational</span>
          </div>

          <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
            <button
              onClick={() => handleAskAssistant('What are the best practices for PayPal JavaScript SDK buttons?')}
              className="hover:text-[#0070BA] dark:hover:text-blue-400"
            >
              SDK Documentation
            </button>
            <button
              onClick={() => handleAskAssistant('How do I handle dispute webhooks and ledger reconciliations?')}
              className="hover:text-[#0070BA] dark:hover:text-blue-400"
            >
              API Reference
            </button>
            <button
              onClick={() => setCurrentTab('playground')}
              className="hover:text-[#0070BA] dark:hover:text-blue-400"
            >
              Interactive Playground
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Checkout Modal (from SDK Buttons Playground) */}
      <CheckoutModal
        isOpen={checkoutModalData.isOpen}
        onClose={() => setCheckoutModalData((prev) => ({ ...prev, isOpen: false }))}
        amount={checkoutModalData.amount}
        description={checkoutModalData.description}
        onPaymentSuccess={async (amt, name, email, desc) => {
          return await handleSimulatePayment({
            amount: amt,
            payerName: name,
            payerEmail: email,
            description: desc,
          });
        }}
        onAskAssistant={handleAskAssistant}
      />

      {/* Simulate Payment Modal */}
      <SimulatePaymentModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onSubmit={handleSimulatePayment}
        onAskAssistant={handleAskAssistant}
      />

      {/* Embedded Contextual AI Assistant Floating Widget */}
      <AssistantWidget
        sandboxState={sandboxState}
        activeTab={currentTab}
        onNavigate={setCurrentTab}
        externalPrompt={externalAssistantPrompt}
        onClearExternalPrompt={() => setExternalAssistantPrompt(null)}
      />
    </div>
  );
}
