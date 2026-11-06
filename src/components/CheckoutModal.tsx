import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Lock, Loader2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  onPaymentSuccess: (amount: number, buyerName: string, buyerEmail: string, desc: string) => Promise<any>;
  onAskAssistant: (question: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  amount,
  description,
  onPaymentSuccess,
  onAskAssistant,
}) => {
  const [buyerName, setBuyerName] = useState('Jane Buyer');
  const [buyerEmail, setBuyerEmail] = useState('buyer-jane@customer.example.com');
  const [selectedFunding, setSelectedFunding] = useState<'balance' | 'card'>('balance');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTxId, setCompletedTxId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const res = await onPaymentSuccess(amount, buyerName, buyerEmail, description);
      setCompletedTxId(res.transaction?.id || '8SB-COMPLETED');

      // Fire confetti
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAndClose = () => {
    setCompletedTxId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-[#003087] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold italic text-lg tracking-tight">
              Pay<span className="text-blue-300">Pal</span>
            </span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">
              Sandbox Checkout
            </span>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!completedTxId ? (
            <>
              {/* Order Amount Header */}
              <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  Payment to Apex Digital Commerce
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                  ${amount.toFixed(2)} <span className="text-sm font-normal text-slate-500">USD</span>
                </div>
                <div className="text-xs text-slate-400 mt-1 italic">
                  {description}
                </div>
              </div>

              {/* Simulated Buyer Account */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Simulated Sandbox Buyer
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">Buyer Name</label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">Buyer Email</label>
                    <input
                      type="text"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Payment Method
                </div>
                <div className="space-y-2">
                  <label
                    onClick={() => setSelectedFunding('balance')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedFunding === 'balance'
                        ? 'border-[#0070BA] bg-blue-50/50 dark:bg-blue-950/40'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        checked={selectedFunding === 'balance'}
                        onChange={() => setSelectedFunding('balance')}
                        className="text-[#0070BA]"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          PayPal Balance
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Available: $2,450.00 USD
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                      ${amount.toFixed(2)}
                    </span>
                  </label>

                  <label
                    onClick={() => setSelectedFunding('card')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedFunding === 'card'
                        ? 'border-[#0070BA] bg-blue-50/50 dark:bg-blue-950/40'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        checked={selectedFunding === 'card'}
                        onChange={() => setSelectedFunding('card')}
                        className="text-[#0070BA]"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          Visa ending in •••• 4242
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Expires 12/28
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                      ${amount.toFixed(2)}
                    </span>
                  </label>
                </div>
              </div>

              {/* Pay Now Button */}
              <button
                disabled={isProcessing}
                onClick={handlePay}
                className="w-full py-3 px-4 bg-[#FFC439] hover:bg-[#f2b930] text-slate-900 font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                    <span>Processing Sandbox Capture...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-800" />
                    <span>Complete Purchase (${amount.toFixed(2)} USD)</span>
                  </>
                )}
              </button>

              <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulated PayPal Sandbox Environment</span>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Payment Captured Successfully!
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  ${amount.toFixed(2)} USD received from {buyerName}. The transaction has been posted to your Sandbox Ledger.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-left border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{completedTxId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Order Status:</span>
                  <span className="text-emerald-600 font-medium">COMPLETED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Webhook Fired:</span>
                  <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">PAYMENT.CAPTURE.COMPLETED</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    handleResetAndClose();
                    onAskAssistant(`Can you check the details and status of my new transaction ${completedTxId}?`);
                  }}
                  className="w-full py-2.5 px-4 bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span>Ask AI Assistant to Verify TX {completedTxId}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleResetAndClose}
                  className="w-full py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Close & Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
