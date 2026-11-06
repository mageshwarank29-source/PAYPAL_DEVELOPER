import React, { useState } from 'react';
import { X, Zap, DollarSign, User, Mail, FileText, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SimulatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    payerName: string;
    payerEmail: string;
    description: string;
  }) => Promise<any>;
  onAskAssistant: (question: string) => void;
}

export const SimulatePaymentModal: React.FC<SimulatePaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onAskAssistant,
}) => {
  const [amount, setAmount] = useState(49.00);
  const [payerName, setPayerName] = useState('Jane Buyer');
  const [payerEmail, setPayerEmail] = useState('buyer-jane@customer.example.com');
  const [description, setDescription] = useState('Sandbox E-Commerce Cart Order');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTxId, setCreatedTxId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await onSubmit({
        amount,
        payerName,
        payerEmail,
        description,
      });

      setCreatedTxId(res.transaction?.id || '8SB-NEW');

      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCreatedTxId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Simulate Incoming Sandbox Funds
              </h3>
              <p className="text-[11px] text-slate-500">Inject test customer payment into ledger</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!createdTxId ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Payment Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 1)}
                    required
                    className="w-full pl-8 pr-4 py-2 text-sm font-mono font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[19.99, 49.00, 149.00, 399.00].map((quick) => (
                    <button
                      type="button"
                      key={quick}
                      onClick={() => setAmount(quick)}
                      className="text-[11px] font-mono px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      ${quick.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Payer Full Name
                </label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Payer Email Address
                </label>
                <input
                  type="email"
                  value={payerEmail}
                  onChange={(e) => setPayerEmail(e.target.value)}
                  required
                  className="w-full text-xs font-mono p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Item / Order Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-[#0070BA] hover:bg-[#005ea6] text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isSubmitting ? 'Injecting Funds...' : 'Inject Real-Time Funds to Ledger'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Funds Recorded in Ledger!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  ${amount.toFixed(2)} USD from {payerName} settled with ID <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{createdTxId}</span>.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    handleClose();
                    onAskAssistant(`Did we receive payment ${createdTxId}? Can you confirm the balance and amount?`);
                  }}
                  className="w-full py-2.5 px-4 bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Ask AI: "Did we receive payment {createdTxId}?" &rarr;
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
