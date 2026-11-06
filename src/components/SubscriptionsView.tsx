import React, { useState } from 'react';
import { Calendar, CheckCircle2, DollarSign, Plus, Sparkles, User, Zap, RefreshCw } from 'lucide-react';
import { SandboxState } from '../types';

interface SubscriptionsViewProps {
  sandboxState: SandboxState;
  onSimulateSubscriptionCharge: (subId: string) => void;
  onAskAssistant: (question: string) => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  sandboxState,
  onSimulateSubscriptionCharge,
  onAskAssistant,
}) => {
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('Growth Tier Plan');
  const [newPlanPrice, setNewPlanPrice] = useState(49);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>PayPal Subscriptions & Recurring Billing</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage recurring billing plans, active subscribers, and test automated subscription charge cycles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onAskAssistant('How do I create and manage PayPal subscriptions and recurring billing?')}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#0070BA] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0070BA]" />
            <span>Ask AI About Subscriptions</span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono">PLAN ID: P-99102X</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">ACTIVE</span>
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Developer Pro Monthly
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">$29.00</span>
            <span className="text-xs text-slate-500">/ month</span>
          </div>
          <p className="text-xs text-slate-500">
            Standard recurring plan for independent SaaS tools and API consumers.
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            Subscribers: <span className="font-medium font-mono text-slate-900 dark:text-white">2 active</span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono">PLAN ID: P-88201Y</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">ACTIVE</span>
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Enterprise SaaS Tier
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">$299.00</span>
            <span className="text-xs text-slate-500">/ month</span>
          </div>
          <p className="text-xs text-slate-500">
            High volume plan with priority webhook routing and unlimited API keys.
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            Subscribers: <span className="font-medium font-mono text-slate-900 dark:text-white">1 active</span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono">PLAN ID: P-77402Z</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">ACTIVE</span>
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Starter API Tier
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">$9.00</span>
            <span className="text-xs text-slate-500">/ month</span>
          </div>
          <p className="text-xs text-slate-500">
            Affordable trial plan for early-stage prototype integrations.
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            Subscribers: <span className="font-medium font-mono text-slate-900 dark:text-white">Ready for signups</span>
          </div>
        </div>
      </div>

      {/* Active Subscribers List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Active Subscriptions Roster ({sandboxState.subscriptions.length})
          </h2>
          <span className="text-xs text-slate-500">Auto-billed in sandbox</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Subscription ID</th>
                <th className="py-3 px-4 font-semibold">Subscriber</th>
                <th className="py-3 px-4 font-semibold">Plan Name</th>
                <th className="py-3 px-4 font-semibold text-right">Billing Cadence</th>
                <th className="py-3 px-4 font-semibold">Next Billing</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sandboxState.subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-slate-200">
                    {sub.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900 dark:text-slate-200">
                      {sub.subscriberName}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                      {sub.subscriberEmail}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {sub.planName}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                    ${sub.billingAmount.toFixed(2)} / {sub.frequency.toLowerCase()}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {sub.nextBillingDate}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSimulateSubscriptionCharge(sub.id)}
                      className="px-2.5 py-1 text-xs font-medium text-[#0070BA] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded transition-colors inline-flex items-center gap-1.5"
                      title="Trigger subscription billing cycle now"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Charge Now</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Integration Code Tip */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          PayPal Subscription Button Code Reference
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          To integrate recurring subscriptions with PayPal buttons, pass <code className="text-[#0070BA] bg-blue-50 dark:bg-blue-950/40 px-1 py-0.5 rounded font-mono">vault: true</code> in your script URL and use <code className="text-[#0070BA] bg-blue-50 dark:bg-blue-950/40 px-1 py-0.5 rounded font-mono">actions.subscription.create</code>:
        </p>
        <pre className="p-3.5 bg-slate-950 text-slate-200 text-xs rounded-lg overflow-x-auto font-mono leading-relaxed border border-slate-800">
{`paypal.Buttons({
  createSubscription: function(data, actions) {
    return actions.subscription.create({
      'plan_id': 'P-99102X' // Developer Pro Monthly
    });
  },
  onApprove: function(data, actions) {
    console.log('Subscription active:', data.subscriptionID);
  }
}).render('#paypal-button-container');`}
        </pre>
      </div>
    </div>
  );
};
