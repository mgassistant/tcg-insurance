import { Shield, Zap, Globe, Package, FileCheck, TrendingUp } from "lucide-react";

export default function CoveragePage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Comprehensive TCG Coverage
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            From graded slabs to sealed booster boxes, we protect every part of your collection—at home, at conventions, and everywhere in between.
          </p>
        </div>

        {/* What's Covered */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8">What's Covered</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Fire & Theft", desc: "Full replacement value if your collection is stolen or damaged by fire" },
              { icon: Zap, title: "Accidental Damage", desc: "Spilled drinks, drops, and other accidents—we've got you covered" },
              { icon: Globe, title: "Natural Disasters", desc: "Floods, earthquakes, hurricanes (excluding certain flood zones)" },
              { icon: Package, title: "Mail Loss", desc: "USPS, FedEx, UPS—coverage for cards lost or damaged in transit" },
              { icon: FileCheck, title: "Convention & Travel", desc: "Protection at tournaments, shows, and exhibitions including shipping" },
              { icon: TrendingUp, title: "Market Value", desc: "Coverage based on current market prices, not what you paid" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-blue-500/50 transition-all"
              >
                <item.icon className="w-10 h-10 mb-4 text-blue-400" />
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Card Types */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8">We Cover All TCG Formats</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Graded Cards",
                desc: "PSA, BGS, CGC slabs at full graded value",
                examples: ["PSA 10 1st Ed Charizard", "BGS Black Label quads", "CGC Pristine 10s"],
              },
              {
                title: "Sealed Product",
                desc: "Booster boxes, ETBs, and sealed sets",
                examples: ["Vintage booster boxes", "Modern sealed cases", "Elite Trainer Boxes"],
              },
              {
                title: "Raw Singles",
                desc: "Ungraded cards in mint condition",
                examples: ["High-value raws", "Complete vintage sets", "Modern chase cards"],
              },
            ].map((type, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50"
              >
                <h3 className="text-xl font-semibold mb-3">🃏 {type.title}</h3>
                <p className="text-slate-400 mb-4">{type.desc}</p>
                <ul className="space-y-2">
                  {type.examples.map((example, i) => (
                    <li key={i} className="text-sm text-slate-500">• {example}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage Tiers */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">Coverage Tiers</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                tier: "Starter",
                range: "$500 - $2,500",
                price: "~$50/year",
                features: ["$0 deductible option", "Convention coverage", "Mail loss protection", "24/7 claims"],
              },
              {
                tier: "Collector",
                range: "$2,500 - $25,000",
                price: "~$250/year",
                features: ["Everything in Starter", "Inflation protection", "Travel coverage", "Priority claims"],
                popular: true,
              },
              {
                tier: "Premium",
                range: "$25,000+",
                price: "Custom",
                features: ["Everything in Collector", "White-glove service", "Appraisal assistance", "Dedicated adjuster"],
              },
            ].map((tier, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-xl border-2 ${
                  tier.popular
                    ? "border-blue-500 bg-blue-500/5"
                    : "border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50"
                }`}
              >
                {tier.popular && (
                  <div className="text-sm font-medium text-blue-400 mb-2">Most Popular</div>
                )}
                <h3 className="text-2xl font-bold mb-2">{tier.tier}</h3>
                <div className="text-slate-400 mb-1">{tier.range}</div>
                <div className="text-3xl font-bold mb-6">{tier.price}</div>
                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-12 rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30">
          <h2 className="text-3xl font-bold mb-4">Ready to Protect Your Collection?</h2>
          <p className="text-xl text-slate-400 mb-8">Get an instant quote in under 2 minutes</p>
          <a
            href="/quote"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold text-lg transition-all shadow-lg"
          >
            Get Instant Quote →
          </a>
        </div>
      </div>
    </div>
  );
}
