import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, RotateCcw, Copy, Check, MessageSquare, Zap, ExternalLink } from 'lucide-react';
import { SandboxState, Transaction } from '../types';

interface LedgerViewProps {
  sandboxState: SandboxState;
  onSimulatePayment: () => void;
  onRefundTransaction: (txId: string) => void;
  onAskAssistant: (question: string) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  sandboxState,
  onSimulatePayment,
  onRefundTransaction,
  onAskAssistant,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Filter transactions
  const filteredTransactions = sandboxState.transactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.payerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.payerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'ALL') return true;
    if (filterType === 'CAPTURE') return tx.type === 'CAPTURE';
    if (filterType === 'SALE') return tx.type === 'SALE';
    if (filterType === 'SUBSCRIPTION') return tx.type === 'SUBSCRIPTION_PAYMENT';
    if (filterType === 'REFUND') return tx.type === 'REFUND';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Live Balance Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Sandbox Transaction Ledger</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time ledger events, incoming payments, and fee reconciliations for merchant account <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{sandboxState.merchant.accountEmail}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSimulatePayment}
            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-[#0070BA] hover:bg-[#005ea6] text-white rounded-lg transition-colors flex items-center gap-2 shadow-xs"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Simulate Incoming Payment</span>
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 dark:text-slate-400">Available Balance</div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums mt-1">
            ${sandboxState.balance.available.toLocaleString('en-US', { minimumFractionDigits: 2 })} {sandboxState.balance.currency}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            Settled & available for payouts
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 dark:text-slate-400">Pending Clearance</div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums mt-1">
            ${sandboxState.balance.pending.toFixed(2)} {sandboxState.balance.currency}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Standard 1-day sandbox clearing
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 dark:text-slate-400">Ledger Items Recorded</div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums mt-1">
            {sandboxState.transactions.length}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
            Instant AI status verification available
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Transaction ID, buyer name, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#0070BA]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto">
          {(['ALL', 'CAPTURE', 'SALE', 'SUBSCRIPTION', 'REFUND'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                filterType === type
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {type === 'ALL'
                ? 'All Events'
                : type === 'SUBSCRIPTION'
                ? 'Subscriptions'
                : type.charAt(0) + type.slice(1).toLowerCase() + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Transaction ID</th>
                <th className="py-3 px-4 font-semibold">Type & Status</th>
                <th className="py-3 px-4 font-semibold">Payer Details</th>
                <th className="py-3 px-4 font-semibold text-right">Gross Amount</th>
                <th className="py-3 px-4 font-semibold text-right">Fee</th>
                <th className="py-3 px-4 font-semibold text-right">Net Settled</th>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No transactions match your search query. Try simulating an incoming payment!
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span>{tx.id}</span>
                          <button
                            onClick={() => handleCopy(tx.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Copy Transaction ID"
                          >
                            {copiedId === tx.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {tx.orderId && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Order: {tx.orderId}
                          </div>
                        )}
                      </td>

                      {/* Type & Status */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {isPositive ? (
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          )}
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {tx.type}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {tx.status === 'COMPLETED' ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">COMPLETED</span>
                          ) : tx.status === 'REFUNDED' ? (
                            <span className="text-rose-600 dark:text-rose-400 font-medium">REFUNDED</span>
                          ) : (
                            <span>{tx.status}</span>
                          )}
                        </div>
                      </td>

                      {/* Payer Details */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-slate-200">
                          {tx.payerName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          {tx.payerEmail}
                        </div>
                        <div className="text-[10px] text-slate-400 italic truncate max-w-[180px]">
                          {tx.description}
                        </div>
                      </td>

                      {/* Gross Amount */}
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                        <span className={isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {isPositive ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                        </span>
                        <div className="text-[10px] text-slate-400 font-normal">{tx.currency}</div>
                      </td>

                      {/* Fee */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                        ${Math.abs(tx.fee).toFixed(2)}
                      </td>

                      {/* Net Settled */}
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                        <span className={isPositive ? 'text-slate-900 dark:text-white' : 'text-rose-600'}>
                          {isPositive ? '+' : ''}${Math.abs(tx.net).toFixed(2)}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(tx.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              onAskAssistant(
                                `What is the payment status and details of transaction ${tx.id}?`
                              )
                            }
                            className="px-2 py-1 text-[11px] font-medium text-[#0070BA] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded flex items-center gap-1 transition-colors"
                            title="Ask AI Assistant about this payment"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Ask AI</span>
                          </button>

                          {tx.status === 'COMPLETED' && tx.amount > 0 && (
                            <button
                              onClick={() => onRefundTransaction(tx.id)}
                              className="px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded flex items-center gap-1 transition-colors"
                              title="Process sandbox refund"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Refund</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
