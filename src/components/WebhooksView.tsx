import React, { useState } from 'react';
import { Radio, Send, CheckCircle2, ChevronDown, ChevronRight, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';
import { SandboxState, WebhookEvent } from '../types';

interface WebhooksViewProps {
  sandboxState: SandboxState;
  onDispatchWebhook: (eventType: string) => void;
  onAskAssistant: (question: string) => void;
}

export const WebhooksView: React.FC<WebhooksViewProps> = ({
  sandboxState,
  onDispatchWebhook,
  onAskAssistant,
}) => {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(sandboxState.webhooks[0]?.id || null);
  const [selectedEventType, setSelectedEventType] = useState('PAYMENT.CAPTURE.COMPLETED');
  const [copied, setCopied] = useState(false);

  const eventTypes = [
    { type: 'PAYMENT.CAPTURE.COMPLETED', desc: 'A payment capture has completed successfully.' },
    { type: 'CHECKOUT.ORDER.APPROVED', desc: 'A customer has approved an order during checkout.' },
    { type: 'PAYMENT.CAPTURE.REFUNDED', desc: 'A merchant or buyer refunded a previously captured payment.' },
    { type: 'BILLING.SUBSCRIPTION.ACTIVATED', desc: 'A recurring subscription has been approved and activated.' },
    { type: 'BILLING.SUBSCRIPTION.CANCELLED', desc: 'A customer or merchant cancelled an active recurring subscription.' },
  ];

  const handleCopy = (json: string) => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSamplePayload = (evt: WebhookEvent) => {
    return {
      id: evt.id,
      event_version: '1.0',
      create_time: evt.timestamp,
      resource_type: evt.resourceType,
      event_type: evt.eventType,
      summary: evt.summary,
      resource: {
        id: evt.resourceId,
        status: 'COMPLETED',
        amount: {
          total: '49.00',
          currency: 'USD',
        },
        create_time: evt.timestamp,
        update_time: evt.timestamp,
        seller_protection: {
          status: 'ELIGIBLE',
        },
      },
      links: [
        {
          href: `https://api.sandbox.paypal.com/v1/notifications/webhooks-events/${evt.id}`,
          rel: 'self',
          method: 'GET',
        },
      ],
    };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>PayPal Webhooks Simulator & Event Log</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Test asynchronous webhook events, inspect payload payloads, and verify event signatures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onAskAssistant('How do I verify PayPal webhook signatures in Node.js?')}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#0070BA] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0070BA]" />
            <span>Ask AI About Webhook Verification</span>
          </button>
        </div>
      </div>

      {/* Simulator Control Card */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#0070BA]" />
          <span>Simulate Webhook Event Dispatcher</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Select Event Type to Fire
            </label>
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="w-full text-xs font-mono p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              {eventTypes.map((et) => (
                <option key={et.type} value={et.type}>
                  {et.type} — {et.desc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={() => onDispatchWebhook(selectedEventType)}
              className="w-full py-2.5 px-4 text-xs font-semibold bg-[#0070BA] hover:bg-[#005ea6] text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Webhook Event</span>
            </button>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs text-slate-500 flex items-center justify-between">
          <span>Target Listener URL: <strong className="font-mono text-slate-700 dark:text-slate-300">https://api.merchant.example.com/v1/paypal/webhooks</strong></span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Listening (200 OK)</span>
        </div>
      </div>

      {/* Webhook Events Stream & Inspector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Webhook Event History ({sandboxState.webhooks.length} events logged)
          </h2>
          <span className="text-xs text-slate-400">Click any row to view full payload</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {sandboxState.webhooks.map((evt) => {
            const isExpanded = expandedEventId === evt.id;
            const payload = getSamplePayload(evt);
            const payloadStr = JSON.stringify(payload, null, 2);

            return (
              <div key={evt.id} className="transition-colors">
                <div
                  onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button className="text-slate-400">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                          {evt.eventType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {evt.id}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {evt.summary}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{evt.status}</span>
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Expanded Payload Viewer */}
                {isExpanded && (
                  <div className="p-4 bg-slate-950 text-slate-200 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono">HTTP Headers & JSON Body</span>
                      <button
                        onClick={() => handleCopy(payloadStr)}
                        className="flex items-center gap-1 text-slate-300 hover:text-white"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                      </button>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 bg-slate-900 p-2.5 rounded border border-slate-800 space-y-1">
                      <div><span className="text-blue-400">PAYPAL-TRANSMISSION-ID:</span> {evt.id}</div>
                      <div><span className="text-blue-400">PAYPAL-CERT-URL:</span> https://api.sandbox.paypal.com/v1/notifications/certs/CERT-360</div>
                      <div><span className="text-blue-400">PAYPAL-AUTH-ALGO:</span> SHA256withRSA</div>
                      <div><span className="text-blue-400">Content-Type:</span> application/json</div>
                    </div>

                    <pre className="p-3 bg-slate-900 rounded font-mono text-xs overflow-x-auto text-emerald-400 max-h-72 border border-slate-800 leading-relaxed">
                      <code>{payloadStr}</code>
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
