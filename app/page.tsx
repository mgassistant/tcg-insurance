import Link from "next/link";
import { Shield, Check, TrendingUp, Users, Award, FileText } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 lg:pt-40 lg:pb-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
              <Shield className="w-4 h-4" />
              <span>Specialized TCG Insurance Since 2026</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
              Insure Your Grails.
              <br />
              Play with Confidence.
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Premium protection for your TCG collection—from convention floors to card vaults. 
              Specialized coverage for graded cards, sealed product, and dealer inventory.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/quote"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold text-lg transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
              >
                Get Instant Quote →
              </Link>
              <Link
                href="/coverage"
                className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700 rounded-lg font-semibold text-lg transition-all backdrop-blur-sm"
              >
                Learn More
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>$0 Deductible Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>A-Rated Carrier</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Convention Coverage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Highlights */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why TCG Collectors Choose Us
            </h2>
            <p className="text-xl text-slate-400">
              We speak your language—from PSA 10s to first editions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "TCG-Specialized Coverage",
                description: "Not generic collectibles insurance. We understand graded cards, sealed product, and vintage TCG values.",
              },
              {
                icon: TrendingUp,
                title: "Inflation Protection",
                description: "Automatic 1% monthly coverage increase to keep pace with rising card values. No appraisal needed under $25K.",
              },
              {
                icon: Users,
                title: "Convention & Travel",
                description: "Full coverage at tournaments, conventions, and card shows. Protected during travel and shipping.",
              },
              {
                icon: Award,
                title: "$0 Deductible Option",
                description: "Coverage for losses in excess of $50. No out-of-pocket costs for covered claims.",
              },
              {
                icon: FileText,
                title: "Dealer & Shop Protection",
                description: "Specialized policies for shop inventory, customer consignment, and display case coverage.",
              },
              {
                icon: Shield,
                title: "Fast Claims",
                description: "We know what a 1st Ed Charizard is worth. Claims settled quickly with expert adjusters.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all group"
              >
                <feature.icon className="w-12 h-12 mb-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Get Protected in 3 Simple Steps
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Estimate Your Collection",
                description: "Tell us your collection value and what you collect—graded cards, sealed product, or raw singles.",
              },
              {
                step: "2",
                title: "Get Instant Quote",
                description: "Receive your personalized quote immediately. Choose your deductible and coverage options.",
              },
              {
                step: "3",
                title: "You're Protected",
                description: "Coverage starts the same day. Travel to conventions, ship cards, and collect with confidence.",
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/25">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              href="/quote"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold text-lg transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40"
            >
              Start Your Quote Now →
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Trusted by Collectors & Dealers
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "Finally, insurance that understands the TCG market. They knew exactly what my PSA 10 Base Set Charizard was worth without me having to explain it.",
                author: "Mike T.",
                role: "Pokemon Collector",
              },
              {
                quote: "Our shop had a break-in last year. TCG Insurance processed our claim fast and covered our display case inventory at full market value. Couldn't ask for better service.",
                author: "Sarah K.",
                role: "Card Shop Owner",
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="p-8 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm"
              >
                <p className="text-lg text-slate-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-lg">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Protect Your Collection Today
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Get an instant quote in under 2 minutes. No appraisal needed for collections under $25,000.
          </p>
          <Link
            href="/quote"
            className="inline-block px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold text-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
          >
            Get Your Free Quote →
          </Link>
        </div>
      </section>
    </>
  );
}
