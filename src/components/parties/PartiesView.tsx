import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserPlus,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  MessageSquare,
  Edit2,
  Trash2,
  Phone,
} from 'lucide-react';
import { Party } from '../../types';
import { PartyModal } from './PartyModal';
import { PartyLedgerModal } from './PartyLedgerModal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export const PartiesView: React.FC = () => {
  const { parties, deleteParty, formatMoney, profile, searchQuery } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'customer' | 'supplier' | 'to_collect' | 'to_pay'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [ledgerParty, setLedgerParty] = useState<Party | null>(null);
  const [partyToDelete, setPartyToDelete] = useState<Party | null>(null);

  // Filter parties
  const filteredParties = parties.filter((p) => {
    if (p.archived) return false;

    // Search filter
    const q = (searchTerm || searchQuery).trim().toLowerCase();
    if (q) {
      const matchName = p.name.toLowerCase().includes(q);
      const matchPhone = p.phone && p.phone.toLowerCase().includes(q);
      const matchAddress = p.address && p.address.toLowerCase().includes(q);
      const matchType = p.type && p.type.toLowerCase().includes(q);
      const matchNtn = p.ntn && p.ntn.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchAddress && !matchType && !matchNtn) return false;
    }

    // Category filter
    if (activeFilter === 'customer') return p.type === 'customer' || p.type === 'both';
    if (activeFilter === 'supplier') return p.type === 'supplier' || p.type === 'both';
    if (activeFilter === 'to_collect') return p.currentBalance > 0;
    if (activeFilter === 'to_pay') return p.currentBalance < 0;

    return true;
  });

  const totalReceivable = parties
    .filter((p) => p.currentBalance > 0)
    .reduce((sum, p) => sum + p.currentBalance, 0);

  const totalPayable = parties
    .filter((p) => p.currentBalance < 0)
    .reduce((sum, p) => sum + Math.abs(p.currentBalance), 0);

  const handleSendReminder = (party: Party) => {
    let text = `Dear ${party.name},\nGentle reminder from ${profile.name} regarding your pending balance of ${formatMoney(party.currentBalance)}. Kindly settle at your earliest convenience.\n`;
    if (profile.bankName && profile.bankAccountNumber) {
      text += `\nBank: ${profile.bankName} | A/C: ${profile.bankAccountNumber}`;
    }
    if (profile.easypaisaNumber) {
      text += `\nEasyPaisa: ${profile.easypaisaNumber} (${profile.easypaisaTitle || profile.name})`;
    }
    if (profile.jazzcashNumber) {
      text += `\nJazzCash: ${profile.jazzcashNumber} (${profile.jazzcashTitle || profile.name})`;
    }
    text += `\nThank you for your business!`;

    const encoded = encodeURIComponent(text);
    let phone = party.phone ? party.phone.replace(/\D/g, '') : '';
    if (phone.startsWith('03')) {
      phone = '92' + phone.substring(1);
    }
    const url = phone ? `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Balance Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-600" />
            <span>Parties & Ledger Directory</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track customer receivables, supplier payables, and full running ledger
          </p>
        </div>

        <button
          onClick={() => {
            setEditingParty(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-theme px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>+ Add New Party</span>
        </button>
      </div>

      {/* Receivables vs Payables mini cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-950 dark:bg-emerald-950/20">
          <div>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Total You'll Receive (To Collect)
            </span>
            <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
              {formatMoney(totalReceivable)}
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-950 dark:bg-rose-950/20">
          <div>
            <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
              Total You'll Pay (Supplier Bills)
            </span>
            <div className="text-xl font-extrabold text-rose-700 dark:text-rose-400 font-mono mt-0.5">
              {formatMoney(totalPayable)}
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Parties' },
            { id: 'customer', label: 'Customers' },
            { id: 'supplier', label: 'Suppliers' },
            { id: 'to_collect', label: "You'll Get" },
            { id: 'to_pay', label: "You'll Give" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-slate-900 text-white dark:bg-emerald-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search party by name, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Parties Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Party Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4 text-right">Balance</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredParties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No parties found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredParties.map((party) => {
                  const isReceivable = party.currentBalance > 0;
                  const isPayable = party.currentBalance < 0;
                  return (
                    <tr key={party.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {party.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          {party.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {party.phone ? (
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {party.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        <span className="text-[11px] truncate block">{party.address || '--'}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span
                          className={`${
                            isReceivable
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isPayable
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {formatMoney(party.currentBalance)}
                        </span>
                        <span className="block text-[10px] font-sans font-normal text-slate-400">
                          {isReceivable ? 'To Collect' : isPayable ? 'To Pay' : 'Settled'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setLedgerParty(party)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800 cursor-pointer"
                            title="View Running Ledger"
                          >
                            <BookOpen className="h-4 w-4" />
                          </button>

                          {party.currentBalance > 0 && (
                            <button
                              onClick={() => handleSendReminder(party)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-800 cursor-pointer"
                              title="Send WhatsApp Payment Reminder"
                            >
                              <MessageSquare className="h-4 w-4 text-emerald-600" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditingParty(party);
                              setIsAddModalOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 cursor-pointer"
                            title="Edit Party"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* DELETE PARTY BUTTON WITH CONFIRMATION POPUP */}
                          <button
                            onClick={() => setPartyToDelete(party)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800 cursor-pointer"
                            title="Delete Party"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {/* Add / Edit Party Modal */}
      <PartyModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingParty(null);
        }}
        partyToEdit={editingParty}
      />

      {/* Party Ledger Statement Modal */}
      <PartyLedgerModal
        party={ledgerParty}
        onClose={() => setLedgerParty(null)}
      />

      {/* Confirm Delete Party Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(partyToDelete)}
        title="Delete Party Account?"
        message="Are you sure you want to permanently delete this party? Their running ledger records will be removed."
        itemName={partyToDelete?.name}
        onConfirm={() => {
          if (partyToDelete) {
            deleteParty(partyToDelete.id);
            setPartyToDelete(null);
          }
        }}
        onClose={() => setPartyToDelete(null)}
      />
    </div>
  );
};
