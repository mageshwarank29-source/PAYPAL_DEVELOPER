import React, { useState } from 'react';
import { Copy, Check, Sparkles, Code2, RefreshCw, Layers, Shield, Play } from 'lucide-react';
import { ButtonConfig, SandboxState } from '../types';

interface SdkPlaygroundViewProps {
  sandboxState: SandboxState;
  onOpenCheckout: (amount: number, description: string) => void;
  onAskAssistant: (question: string) => void;
}

export const SdkPlaygroundView: React.FC<SdkPlaygroundViewProps> = ({
  sandboxState,
  onOpenCheckout,
  onAskAssistant,
}) => {
  const [config, setConfig] = useState<ButtonConfig>({
    layout: 'vertical',
    color: 'gold',
    shape: 'rect',
    label: 'paypal',
    height: 48,
    fundingSources: {
      paypal: true,
      paylater: true,
      venmo: true,
      card: true,
    },
    currency: 'USD',
    amount: 49.00,
  });

  const [activeCodeTab, setActiveCodeTab] = useState<'js' | 'react' | 'backend'>('js');
  const [copied, setCopied] = useState(false);

  const clientId = sandboxState.merchant.clientId;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate code samples
  const jsSdkCode = `<!-- 1. Include the PayPal JavaScript SDK with your Client ID -->
<script src="https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${config.currency}"></script>

<!-- 2. Set up a container element for the button -->
<div id="paypal-button-container" style="max-width: 480px; margin: auto;"></div>

<!-- 3. Render the PayPal buttons with your chosen style configuration -->
<script>
  paypal.Buttons({
    style: {
      layout: '${config.layout}',
      color: '${config.color}',
      shape: '${config.shape}',
      label: '${config.label}',
      height: ${config.height}
    },
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{
          description: 'Standard Sandbox Purchase',
          amount: {
            currency_code: '${config.currency}',
            value: '${config.amount.toFixed(2)}'
          }
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(orderData) {
        console.log('Capture result', orderData);
        alert('Transaction completed by ' + orderData.payer.name.given_name);
      });
    },
    onError: function(err) {
      console.error('PayPal checkout error:', err);
    }
  }).render('#paypal-button-container');
</script>`;

  const reactSdkCode = `import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export function PayPalCheckout() {
  const initialOptions = {
    clientId: "${clientId}",
    currency: "${config.currency}",
    intent: "capture"
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          style={{
            layout: "${config.layout}",
            color: "${config.color}",
            shape: "${config.shape}",
            label: "${config.label}",
            height: ${config.height}
          }}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [{
                description: "React Sandbox Checkout",
                amount: {
                  currency_code: "${config.currency}",
                  value: "${config.amount.toFixed(2)}"
                }
              }]
            });
          }}
          onApprove={async (data, actions) => {
            if (actions.order) {
              const details = await actions.order.capture();
              console.log("Captured successfully:", details);
            }
          }}
          onError={(err) => {
            console.error("PayPal React Error:", err);
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}`;

  const backendCode = `// Node.js Express server-side order capture with PayPal REST API v2
import express from 'express';

const app = express();
const PAYPAL_API = 'https://api-m.sandbox.paypal.com';

// 1. Generate Access Token using Client ID and Secret
async function generateAccessToken() {
  const auth = Buffer.from(process.env.PAYPAL_CLIENT_ID + ':' + process.env.PAYPAL_CLIENT_SECRET).toString('base64');
  const response = await fetch(\`\${PAYPAL_API}/v1/oauth2/token\`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: \`Basic \${auth}\`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  const data = await response.json();
  return data.access_token;
}

// 2. Create Order endpoint
app.post('/api/orders', async (req, res) => {
  const accessToken = await generateAccessToken();
  const response = await fetch(\`\${PAYPAL_API}/v2/checkout/orders\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: \`Bearer \${accessToken}\`
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: '${config.currency}',
          value: '${config.amount.toFixed(2)}'
        }
      }]
    })
  });
  const order = await response.json();
  res.json(order);
});

// 3. Capture Order endpoint
app.post('/api/orders/:orderId/capture', async (req, res) => {
  const { orderId } = req.params;
  const accessToken = await generateAccessToken();
  const response = await fetch(\`\${PAYPAL_API}/v2/checkout/orders/\${orderId}/capture\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: \`Bearer \${accessToken}\`
    }
  });
  const captureData = await response.json();
  res.json(captureData);
});`;

  const activeCode = activeCodeTab === 'js' ? jsSdkCode : activeCodeTab === 'react' ? reactSdkCode : backendCode;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>PayPal JavaScript & React SDK Playground</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customize PayPal button styles, funding sources, and layout. Click any rendered button to test a live sandbox checkout and capture funds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAskAssistant(`Can you explain the difference between JavaScript SDK buttons and React @paypal/react-paypal-js components?`)}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#0070BA] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0070BA]" />
            <span>Ask AI About SDK</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Style Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0070BA]" />
              <span>Button Styling Parameters</span>
            </h2>

            {/* Layout */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Layout Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['vertical', 'horizontal'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setConfig({ ...config, layout: l })}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors capitalize ${
                      config.layout === l
                        ? 'border-[#0070BA] bg-blue-50/60 dark:bg-blue-950/60 text-[#0070BA] dark:text-blue-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Button Color
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {(['gold', 'blue', 'silver', 'white', 'black'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setConfig({ ...config, color: c })}
                    className={`py-2 px-2 text-xs font-medium rounded-lg border transition-colors capitalize flex flex-col items-center gap-1.5 ${
                      config.color === c
                        ? 'border-[#0070BA] bg-blue-50/60 dark:bg-blue-950/60 text-[#0070BA] dark:text-blue-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border ${
                        c === 'gold'
                          ? 'bg-[#FFC439] border-amber-400'
                          : c === 'blue'
                          ? 'bg-[#0070BA] border-blue-700'
                          : c === 'silver'
                          ? 'bg-[#EEEEEE] border-slate-300'
                          : c === 'white'
                          ? 'bg-white border-slate-300'
                          : 'bg-[#2C2E2F] border-slate-900'
                      }`}
                    />
                    <span>{c}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shape */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Button Shape
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['rect', 'pill'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setConfig({ ...config, shape: s })}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors capitalize ${
                      config.shape === s
                        ? 'border-[#0070BA] bg-blue-50/60 dark:bg-blue-950/60 text-[#0070BA] dark:text-blue-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {s === 'rect' ? 'Rectangular (4px radius)' : 'Pill (Full radius)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Button Label */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Primary Button Label
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['paypal', 'checkout', 'buynow', 'pay'] as const).map((lbl) => (
                  <button
                    key={lbl}
                    onClick={() => setConfig({ ...config, label: lbl })}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors capitalize ${
                      config.label === lbl
                        ? 'border-[#0070BA] bg-blue-50/60 dark:bg-blue-950/60 text-[#0070BA] dark:text-blue-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Funding Sources */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                Enabled Funding Sources
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <input
                    type="checkbox"
                    checked={config.fundingSources.paypal}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fundingSources: { ...config.fundingSources, paypal: e.target.checked },
                      })
                    }
                    className="rounded text-[#0070BA]"
                  />
                  <span>PayPal Balance</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <input
                    type="checkbox"
                    checked={config.fundingSources.paylater}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fundingSources: { ...config.fundingSources, paylater: e.target.checked },
                      })
                    }
                    className="rounded text-[#0070BA]"
                  />
                  <span>Pay in 4 (Pay Later)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <input
                    type="checkbox"
                    checked={config.fundingSources.venmo}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fundingSources: { ...config.fundingSources, venmo: e.target.checked },
                      })
                    }
                    className="rounded text-[#0070BA]"
                  />
                  <span>Venmo</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <input
                    type="checkbox"
                    checked={config.fundingSources.card}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fundingSources: { ...config.fundingSources, card: e.target.checked },
                      })
                    }
                    className="rounded text-[#0070BA]"
                  />
                  <span>Debit or Credit Card</span>
                </label>
              </div>
            </div>

            {/* Test Amount */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Currency
                </label>
                <select
                  value={config.currency}
                  onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                  className="w-full text-xs font-mono p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Simulation Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.amount}
                  onChange={(e) => setConfig({ ...config, amount: Math.max(1, parseFloat(e.target.value) || 1) })}
                  className="w-full text-xs font-mono p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Rendered Preview & Code Snippets (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Preview Card */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Live Interactive Button Preview
                </h3>
              </div>
              <span className="text-xs text-slate-400">Click any button to test checkout</span>
            </div>

            {/* Container for Rendered Buttons */}
            <div className="p-8 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[220px]">
              <div className="w-full max-w-sm space-y-3">
                {/* 1. Main PayPal Button */}
                {config.fundingSources.paypal && (
                  <button
                    onClick={() => onOpenCheckout(config.amount, `Live Sandbox Checkout (${config.label})`)}
                    style={{
                      height: `${config.height}px`,
                      borderRadius: config.shape === 'pill' ? '9999px' : '6px',
                    }}
                    className={`w-full flex items-center justify-center gap-2 font-semibold text-sm transition-transform active:scale-[0.98] shadow-xs cursor-pointer ${
                      config.color === 'gold'
                        ? 'bg-[#FFC439] hover:bg-[#f4bb33] text-slate-900'
                        : config.color === 'blue'
                        ? 'bg-[#0070BA] hover:bg-[#005ea6] text-white'
                        : config.color === 'silver'
                        ? 'bg-[#EEEEEE] hover:bg-[#e2e2e2] text-slate-900 border border-slate-300'
                        : config.color === 'white'
                        ? 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-300'
                        : 'bg-[#2C2E2F] hover:bg-[#1a1b1c] text-white'
                    }`}
                  >
                    {/* SVG Monogram */}
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        fill={config.color === 'blue' ? '#ffffff' : '#003087'}
                        d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.477A.641.641 0 0 1 5.577 2h7.39c2.44 0 4.316.574 5.426 1.66 1.054 1.03 1.48 2.532 1.233 4.343-.538 3.963-3.238 6.177-7.234 6.177H9.28a.8.8 0 0 0-.79.692l-1.414 6.465z"
                      />
                      <path
                        fill={config.color === 'blue' ? '#93c5fd' : '#0079C1'}
                        d="M9.825 8.16h3.117c2.47 0 4.28.536 5.234 1.55.955 1.012 1.247 2.478.847 4.24-.652 2.87-2.775 4.57-6.14 4.57H9.77a.64.64 0 0 1-.632-.553l-1.07-5.99a.8.8 0 0 1 .789-.817h.968z"
                      />
                    </svg>
                    <span className="italic tracking-tight text-base font-extrabold">
                      {config.label === 'paypal' ? (
                        <>
                          <span className={config.color === 'blue' ? 'text-white' : 'text-[#003087]'}>Pay</span>
                          <span className={config.color === 'blue' ? 'text-blue-200' : 'text-[#0079C1]'}>Pal</span>
                        </>
                      ) : config.label === 'checkout' ? (
                        'Checkout'
                      ) : config.label === 'buynow' ? (
                        'Buy Now'
                      ) : (
                        'Pay Now'
                      )}
                    </span>
                  </button>
                )}

                {/* 2. Pay Later (Pay in 4) */}
                {config.fundingSources.paylater && (
                  <button
                    onClick={() => onOpenCheckout(config.amount, 'PayPal Pay Later (Pay in 4)')}
                    style={{
                      height: `${config.height}px`,
                      borderRadius: config.shape === 'pill' ? '9999px' : '6px',
                    }}
                    className="w-full flex items-center justify-center gap-2 font-medium text-xs sm:text-sm bg-[#FFC439] hover:bg-[#f4bb33] text-slate-900 transition-transform active:scale-[0.98] shadow-xs cursor-pointer border border-amber-300/40"
                  >
                    <span className="font-extrabold italic text-[#003087]">Pay</span>
                    <span className="font-extrabold italic text-[#0079C1]">Pal</span>
                    <span className="text-slate-700 font-semibold text-xs ml-1">Pay Later</span>
                  </button>
                )}

                {/* 3. Venmo */}
                {config.fundingSources.venmo && (
                  <button
                    onClick={() => onOpenCheckout(config.amount, 'Venmo Checkout')}
                    style={{
                      height: `${config.height}px`,
                      borderRadius: config.shape === 'pill' ? '9999px' : '6px',
                    }}
                    className="w-full flex items-center justify-center gap-2 font-semibold text-sm bg-[#008CFF] hover:bg-[#007ce4] text-white transition-transform active:scale-[0.98] shadow-xs cursor-pointer"
                  >
                    <span className="italic font-bold tracking-wider text-base">venmo</span>
                  </button>
                )}

                {/* 4. Debit or Credit Card */}
                {config.fundingSources.card && (
                  <button
                    onClick={() => onOpenCheckout(config.amount, 'Credit or Debit Card Checkout')}
                    style={{
                      height: `${config.height}px`,
                      borderRadius: config.shape === 'pill' ? '9999px' : '6px',
                    }}
                    className="w-full flex items-center justify-center gap-2 font-medium text-xs sm:text-sm bg-[#2C2E2F] hover:bg-[#1f2021] text-white transition-transform active:scale-[0.98] shadow-xs cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect width="20" height="14" x="2" y="5" rx="2" strokeWidth="2"/>
                      <line x1="2" x2="22" y1="10" y2="10" strokeWidth="2"/>
                    </svg>
                    <span>Debit or Credit Card</span>
                  </button>
                )}
              </div>
            </div>

            <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simulates real order creation (`v2/checkout/orders`) with instant ledger updates</span>
            </div>
          </div>

          {/* Generated Code Snippet */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              {/* Segmented Tab Controls */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  onClick={() => setActiveCodeTab('js')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeCodeTab === 'js'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  HTML & JS SDK
                </button>
                <button
                  onClick={() => setActiveCodeTab('react')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeCodeTab === 'react'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  React Component
                </button>
                <button
                  onClick={() => setActiveCodeTab('backend')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeCodeTab === 'backend'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Node.js Backend
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(activeCode)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md transition-colors flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Snippet'}</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="p-4 bg-slate-950 text-slate-200 text-xs rounded-lg overflow-x-auto font-mono max-h-80 leading-relaxed border border-slate-800">
                <code>{activeCode}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
