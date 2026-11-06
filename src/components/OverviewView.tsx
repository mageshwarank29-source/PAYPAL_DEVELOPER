import React from 'react';
import { CreditCard, ArrowRight, ShieldCheck, Play, Zap, FileText } from 'lucide-react';
import { SandboxState } from '../types';

interface OverviewViewProps {
  sandboxState: SandboxState;
  onNavigate: (tab: string) => void;
  onSimulatePayment: () => void;
  onAskAssistant: (question: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  sandboxState,
  onNavigate,
  onSimulatePayment,
  onAskAssistant,
}) => {
  const latestTx = sandboxState.transactions[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 dark:from-slate-950 dark:via-blue-950/60 dark:to-slate-950 rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-300">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Sandbox Mode Active</span>
            <span aria-hidden="true">·</span>
            <span>{sandboxState.merchant.businessName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            PayPal Developer Portal & Sandbox
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Build, test, and deploy PayPal payment integrations. Explore live JavaScript & React SDK buttons, simulate real-time incoming transactions, inspect webhook payloads, and chat with the embedded contextual AI Assistant.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('playground')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold bg-[#0070BA] hover:bg-[#005ea6] text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch SDK Playground</span>
            </button>
            <button
              onClick={onSimulatePayment}
              className="px-4 py-2 text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-lg transition-colors flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Simulate Incoming Funds</span>
            </button>
            <button
              onClick={() => onAskAssistant('What is my current sandbox balance and latest incoming payment?')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Ask AI About Funds</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Available Balance</span>
            <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-medium">REAL-TIME</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            ${sandboxState.balance.available.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="font-mono tabular-nums">+${sandboxState.balance.pending.toFixed(2)}</span>
            <span>pending clearance</span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Total Ledger Transactions</span>
            <span className="text-xs text-slate-400">Sandbox</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            {sandboxState.transactions.length} events
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>Last capture:</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {latestTx ? `$${latestTx.amount.toFixed(2)} USD` : 'None'}
            </span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Active Subscriptions</span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Monthly Plans</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            {sandboxState.subscriptions.filter(s => s.status === 'ACTIVE').length} active
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Recurring MRR: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">$357.00/mo</span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Webhook Delivery</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">99.9% health</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            {sandboxState.webhooks.length} delivered
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Latest: <span className="font-mono text-[11px]">{sandboxState.webhooks[0]?.eventType.split('.')[1] || 'CAPTURE'}</span>
          </div>
        </div>
      </div>

      {/* Grid: Developer Quickstart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Developer Quickstart & Credentials */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Integration Checklist & Credentials
              </h2>
              <span className="text-xs font-mono text-slate-500">v2/checkout/orders</span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Sandbox Client ID
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-200 truncate">
                    {sandboxState.merchant.clientId}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(sandboxState.merchant.clientId)}
                    className="text-xs font-medium text-[#0070BA] dark:text-blue-400 hover:underline shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Sandbox Facilitator Email
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-200 truncate">
                    {sandboxState.merchant.accountEmail}
                  </span>
                  <span className="text-xs text-slate-400">Payer ID: {sandboxState.merchant.payerId}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-3">
                Quick Integration Steps
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => onNavigate('playground')}
                  className="text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#0070BA] dark:hover:border-blue-500 transition-colors group"
                >
                  <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-[#0070BA] dark:group-hover:text-blue-400">
                    1. SDK Buttons
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Embed JS SDK or React buttons with customized styling.
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('ledger')}
                  className="text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#0070BA] dark:hover:border-blue-500 transition-colors group"
                >
                  <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-[#0070BA] dark:group-hover:text-blue-400">
                    2. Payment Capture
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Capture funds in real-time and review the sandbox ledger.
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('webhooks')}
                  className="text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#0070BA] dark:group-hover:text-blue-400 transition-colors group"
                >
                  <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-[#0070BA] dark:group-hover:text-blue-400">
                    3. Webhook Events
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Listen to asynchronous order authorizations and refunds.
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Latest Sandbox Transactions & AI Assistant Teaser */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Recent Ledger Events
              </h2>
              <button
                onClick={() => onNavigate('ledger')}
                className="text-xs font-medium text-[#0070BA] dark:text-blue-400 hover:underline"
              >
                View all ({sandboxState.transactions.length})
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {sandboxState.transactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-medium text-slate-900 dark:text-slate-200 truncate">
                        {tx.id}
                      </span>
                      <span className="text-[10px] text-slate-400">· {tx.type}</span>
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {tx.payerName} ({tx.description})
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-mono text-xs font-semibold ${tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Net ${tx.net.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900/40">
              <div className="text-xs font-medium text-blue-900 dark:text-blue-200 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0070BA]" />
                <span>Need immediate guidance?</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-normal mb-2">
                Ask the AI Assistant for code examples, payment statuses, or SDK troubleshooting.
              </p>
              <button
                onClick={() => onAskAssistant('How do I integrate PayPal JavaScript SDK buttons?')}
                className="text-xs font-semibold text-[#0070BA] dark:text-blue-400 hover:underline"
              >
                Prompt: "How do I integrate PayPal JavaScript SDK buttons?" &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
