import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PromoCode } from '../../types';
import { 
  Tag, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  Calendar, 
  Percent, 
  X, 
  Power, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export const PromoManagementView: React.FC = () => {
  const { promoCodes, addPromoCode, togglePromoCode, deletePromoCode, validatePromoCode, showToast } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New promo form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [description, setDescription] = useState('');
  const [minRentalDays, setMinRentalDays] = useState<number>(2);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [maxUses, setMaxUses] = useState<string>('100');

  // Test validator sandbox
  const [testCodeInput, setTestCodeInput] = useState('RIDEOUT15');
  const [testDaysInput, setTestDaysInput] = useState<number>(3);
  const [testSubtotalInput, setTestSubtotalInput] = useState<number>(2700);
  const [testResult, setTestResult] = useState<any>(null);

  const activeCodes = promoCodes.filter(p => p.isActive);
  const totalUses = promoCodes.reduce((sum, p) => sum + p.usageCount, 0);

  const handleCopyCode = (promoCode: string) => {
    navigator.clipboard.writeText(promoCode);
    setCopiedCode(promoCode);
    showToast(`Promo code ${promoCode} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      alert('Please enter a promo code');
      return;
    }

    addPromoCode({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      description: description || `${discountType === 'percentage' ? `${discountValue}%` : `₱${discountValue}`} discount`,
      minRentalDays: Number(minRentalDays),
      expiryDate,
      isActive: true,
      maxUses: maxUses ? Number(maxUses) : undefined,
    });

    setIsCreateModalOpen(false);
    setCode('');
    setDescription('');
  };

  const handleRunTest = () => {
    const res = validatePromoCode(testCodeInput, testDaysInput, testSubtotalInput);
    setTestResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-stone-100 flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-400" />
            <span>Promo Codes & Discount Management</span>
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Configure discount codes for social media campaigns, long-term rentals, and seasonal promos
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Create Promo Code</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-4">
          <span className="text-xs text-stone-400">Active Promo Campaigns</span>
          <div className="text-2xl font-bold font-mono text-stone-100 mt-2 tabular-nums">
            {activeCodes.length} <span className="text-xs font-normal text-stone-500 font-sans">of {promoCodes.length} total</span>
          </div>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-4">
          <span className="text-xs text-stone-400">Total Customer Redemptions</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2 tabular-nums">
            {totalUses} <span className="text-xs font-normal text-stone-500 font-sans">bookings discounted</span>
          </div>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-4">
          <span className="text-xs text-stone-400">Top Performing Code</span>
          <div className="text-xl font-bold font-mono text-stone-100 mt-2 flex items-center gap-2">
            <span>{promoCodes[0]?.code || 'NONE'}</span>
            <span className="text-xs font-normal text-stone-400 font-sans">({promoCodes[0]?.usageCount || 0} uses)</span>
          </div>
        </div>
      </div>

      {/* Main Promo Codes Table */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/80 border-b border-stone-800 text-stone-400 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Promo Code & Description</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min. Duration</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4">Redemptions</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-sans">
              {promoCodes.map((promo) => {
                const today = new Date().toISOString().split('T')[0];
                const isExpired = promo.expiryDate < today;

                return (
                  <tr key={promo.id} className="hover:bg-stone-800/20 transition-colors">
                    {/* Code & Description */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-amber-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                          {promo.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(promo.code)}
                          className="text-stone-400 hover:text-stone-200"
                          title="Copy promo code"
                        >
                          {copiedCode === promo.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="text-xs text-stone-300 mt-1 max-w-xs leading-relaxed">
                        {promo.description}
                      </div>
                    </td>

                    {/* Discount */}
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-200">
                      {promo.discountType === 'percentage' ? (
                        <span className="text-emerald-400">{promo.discountValue}% OFF</span>
                      ) : (
                        <span className="text-emerald-400">₱{promo.discountValue.toLocaleString()} OFF</span>
                      )}
                    </td>

                    {/* Minimum Duration */}
                    <td className="py-3.5 px-4 font-mono text-stone-300">
                      {promo.minRentalDays > 1 ? `${promo.minRentalDays} Days` : 'Any'}
                    </td>

                    {/* Validity */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-stone-300">{promo.expiryDate}</div>
                      {isExpired && (
                        <div className="text-[10px] text-red-400 font-semibold mt-0.5">Expired</div>
                      )}
                    </td>

                    {/* Redemptions */}
                    <td className="py-3.5 px-4 font-mono text-stone-300">
                      {promo.usageCount} {promo.maxUses ? `/ ${promo.maxUses}` : 'uses'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => togglePromoCode(promo.id)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                          promo.isActive && !isExpired
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-stone-800 text-stone-400 border border-stone-700'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{promo.isActive && !isExpired ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => deletePromoCode(promo.id)}
                        className="p-1.5 text-stone-400 hover:text-red-400 transition-colors"
                        title="Delete promo code"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sandbox Test Bar: Test any code with sample days & amounts */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-5 space-y-4">
        <div className="flex items-center gap-2 text-stone-300 font-semibold text-xs">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Promo Code Live Simulator & Sandbox</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-stone-400 mb-1">Code to test</label>
            <input
              type="text"
              value={testCodeInput}
              onChange={(e) => setTestCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. RIDEOUT15"
              className="w-full px-3 py-1.5 bg-stone-950 border border-stone-800 rounded text-stone-100 font-mono text-xs uppercase"
            />
          </div>

          <div>
            <label className="block text-stone-400 mb-1">Simulated Rental Days</label>
            <input
              type="number"
              min="1"
              value={testDaysInput}
              onChange={(e) => setTestDaysInput(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-stone-950 border border-stone-800 rounded text-stone-100 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-stone-400 mb-1">Simulated Subtotal (₱)</label>
            <input
              type="number"
              value={testSubtotalInput}
              onChange={(e) => setTestSubtotalInput(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-stone-950 border border-stone-800 rounded text-stone-100 font-mono text-xs"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunTest}
              className="w-full py-1.5 px-3 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
            >
              Simulate Discount
            </button>
          </div>
        </div>

        {testResult && (
          <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            testResult.valid
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/20 border-red-500/30 text-red-300'
          }`}>
            <span>{testResult.message}</span>
            {testResult.valid && (
              <span className="font-mono font-bold text-stone-100 text-sm">
                Discount: -₱{testResult.discount.toLocaleString()} (New Total: ₱{(testSubtotalInput - testResult.discount).toLocaleString()})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Create Promo Code Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
              <h2 className="text-base font-bold text-stone-100">Create New Promo Code</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Promo Code (All-Caps) *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ZAMBALES20"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono text-sm uppercase font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₱)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">
                    Value ({discountType === 'percentage' ? '%' : '₱'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Description / Campaign Purpose</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Weekend getaway promo for San Felipe riders"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Min. Rental Days</label>
                  <input
                    type="number"
                    min="1"
                    value={minRentalDays}
                    onChange={(e) => setMinRentalDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Expiration Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
