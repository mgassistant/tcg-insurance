"use client";

import { useState } from "react";
import { Shield, Calculator, Check } from "lucide-react";

export default function QuotePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    collectionValue: "",
    cardTypes: {
      graded: 0,
      sealed: 0,
      raw: 0,
    },
    storageLocation: "",
    deductible: "0",
    inflationProtection: false,
    email: "",
    phone: "",
  });

  const [quote, setQuote] = useState<number | null>(null);

  const calculateQuote = () => {
    const value = parseInt(formData.collectionValue.replace(/,/g, "")) || 0;
    
    // Base rate: ~0.9% annually
    let annualPremium = value * 0.009;
    
    // Deductible adjustment
    if (formData.deductible === "500") annualPremium *= 0.85;
    if (formData.deductible === "1000") annualPremium *= 0.75;
    
    // Inflation protection add-on
    if (formData.inflationProtection) annualPremium *= 1.1;
    
    // Graded card discount (lower risk)
    const gradedPercent = formData.cardTypes.graded / 100;
    annualPremium *= (1 - gradedPercent * 0.1);
    
    setQuote(Math.round(annualPremium));
  };

  const updateCardType = (type: keyof typeof formData.cardTypes, value: number) => {
    const newCardTypes = { ...formData.cardTypes };
    newCardTypes[type] = value;
    
    // Auto-adjust others to keep total at 100%
    const total = Object.values(newCardTypes).reduce((a, b) => a + b, 0);
    if (total > 100) {
      const excess = total - 100;
      const otherTypes = Object.keys(newCardTypes).filter(k => k !== type) as Array<keyof typeof formData.cardTypes>;
      otherTypes.forEach(k => {
        newCardTypes[k] = Math.max(0, newCardTypes[k] - excess / otherTypes.length);
      });
    }
    
    setFormData({ ...formData, cardTypes: newCardTypes });
  };

  const formatCurrency = (value: string) => {
    const num = value.replace(/,/g, "");
    if (!num) return "";
    return parseInt(num).toLocaleString();
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <Calculator className="w-4 h-4" />
            <span>Get Your Instant Quote</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Protect Your Collection in Minutes
          </h1>
          <p className="text-xl text-slate-400">
            No appraisal needed for collections under $25,000
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Step {step} of 3</span>
            <span className="text-sm text-slate-400">{Math.round((step / 3) * 100)}% Complete</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Tell Us About Your Collection</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Estimated Collection Value
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400">$</span>
                  <input
                    type="text"
                    value={formData.collectionValue}
                    onChange={(e) =>
                      setFormData({ ...formData, collectionValue: formatCurrency(e.target.value) })
                    }
                    placeholder="50,000"
                    className="w-full pl-8 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  Include graded cards, sealed product, and raw singles at current market value
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-4">
                  Collection Breakdown (optional)
                </label>
                <div className="space-y-4">
                  {[
                    { key: "graded" as const, label: "Graded Cards (PSA/BGS)", icon: "🏆" },
                    { key: "sealed" as const, label: "Sealed Product", icon: "📦" },
                    { key: "raw" as const, label: "Raw Singles", icon: "🃏" },
                  ].map((type) => (
                    <div key={type.key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">
                          {type.icon} {type.label}
                        </span>
                        <span className="text-sm font-medium">{formData.cardTypes[type.key]}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.cardTypes[type.key]}
                        onChange={(e) => updateCardType(type.key, parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.collectionValue}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 rounded-lg font-semibold transition-all shadow-lg"
              >
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Coverage Preferences</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Primary Storage Location
                </label>
                <select
                  value={formData.storageLocation}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">Select location...</option>
                  <option value="home">Home</option>
                  <option value="vault">Professional Vault</option>
                  <option value="shop">Card Shop</option>
                  <option value="multiple">Multiple Locations</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Deductible
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "0", label: "$0", recommended: true },
                    { value: "500", label: "$500", recommended: false },
                    { value: "1000", label: "$1,000", recommended: false },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, deductible: option.value })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.deductible === option.value
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <div className="font-semibold">{option.label}</div>
                      {option.recommended && (
                        <div className="text-xs text-blue-400 mt-1">Recommended</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inflationProtection}
                    onChange={(e) =>
                      setFormData({ ...formData, inflationProtection: e.target.checked })
                    }
                    className="mt-1 w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium">Add Inflation Protection</div>
                    <div className="text-sm text-slate-400 mt-1">
                      Automatic 1% monthly coverage increase to keep pace with rising card values (max $1M)
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700 rounded-lg font-semibold transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.storageLocation}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 rounded-lg font-semibold transition-all shadow-lg"
                >
                  Calculate Quote →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Your Instant Quote</h2>
              
              {!quote && (
                <div className="text-center py-8">
                  <button
                    onClick={calculateQuote}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold text-lg transition-all shadow-lg"
                  >
                    Calculate My Quote
                  </button>
                </div>
              )}

              {quote && (
                <>
                  <div className="text-center py-8 border-2 border-blue-500/30 rounded-xl bg-blue-500/5">
                    <div className="text-sm text-slate-400 mb-2">Estimated Annual Premium</div>
                    <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                      ${quote.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400">
                      or ${Math.round(quote / 12).toLocaleString()}/month
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-5 h-5 text-green-400" />
                      <span>Collection Value: ${formatCurrency(formData.collectionValue)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-5 h-5 text-green-400" />
                      <span>${formData.deductible} Deductible</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-5 h-5 text-green-400" />
                      <span>Convention & Travel Coverage</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-5 h-5 text-green-400" />
                      <span>Fire, Theft, Accidental Damage</span>
                    </div>
                    {formData.inflationProtection && (
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Check className="w-5 h-5 text-green-400" />
                        <span>1% Monthly Inflation Protection</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => alert("Quote request submitted! We'll contact you within 24 hours.")}
                    disabled={!formData.email || !formData.phone}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 rounded-lg font-semibold transition-all shadow-lg"
                  >
                    Request Full Quote →
                  </button>

                  <button
                    onClick={() => {
                      setStep(1);
                      setQuote(null);
                    }}
                    className="w-full py-3 text-slate-400 hover:text-white transition-colors"
                  >
                    ← Start Over
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Trust Signals */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-4">
            <Shield className="w-4 h-4 text-green-400" />
            <span>Coverage provided by A-rated carriers</span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl mx-auto">
            This quote is an estimate based on the information provided. Final premium may vary based on additional underwriting factors.
            Licensed insurance agency. California License #PENDING.
          </p>
        </div>
      </div>
    </div>
  );
}
