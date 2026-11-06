import React from 'react';
import { Sun, Moon, Zap, MessageSquare, CreditCard } from 'lucide-react';
import { SandboxState } from '../types';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  sandboxState: SandboxState;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSimulatePayment: () => void;
  onOpenAssistant: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  sandboxState,
  darkMode,
  onToggleDarkMode,
  onOpenSimulatePayment,
  onOpenAssistant,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'playground', label: 'SDK Playground' },
    { id: 'ledger', label: 'Sandbox Ledger' },
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'webhooks', label: 'Webhooks' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#overview"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('overview');
            }}
            className="flex items-center gap-2 group whitespace-nowrap shrink-0 text-decoration-none"
          >
            {/* Authentic PayPal double-P monogram logo */}
            <div className="w-8 h-8 rounded-lg bg-[#003087] flex items-center justify-center text-white shadow-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fill="#ffffff"
                  d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.477A.641.641 0 0 1 5.577 2h7.39c2.44 0 4.316.574 5.426 1.66 1.054 1.03 1.48 2.532 1.233 4.343-.538 3.963-3.238 6.177-7.234 6.177H9.28a.8.8 0 0 0-.79.692l-1.414 6.465z"
                />
                <path
                  fill="#93c5fd"
                  d="M9.825 8.16h3.117c2.47 0 4.28.536 5.234 1.55.955 1.012 1.247 2.478.847 4.24-.652 2.87-2.775 4.57-6.14 4.57H9.77a.64.64 0 0 1-.632-.553l-1.07-5.99a.8.8 0 0 1 .789-.817h.968z"
                />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold italic text-lg text-[#003087] dark:text-blue-400">
                PayPal
              </span>
              <span className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-200">
                Developer
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-medium">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
                currentTab === item.id
                  ? 'border-[#0070BA] text-[#0070BA] dark:text-blue-400 font-semibold'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 primary action + theme toggle */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Balance pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono">
            <span className="text-slate-500">Sandbox:</span>
            <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
              ${sandboxState.balance.available.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={onOpenSimulatePayment}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#0070BA] hover:bg-[#005ea6] rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Simulate Payment</span>
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 overflow-x-auto text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium transition-colors ${
              currentTab === item.id
                ? 'bg-[#0070BA] text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
