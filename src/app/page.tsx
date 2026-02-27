import Link from "next/link";
import {
  CreditCard,
  MessageCircle,
  TrendingUp,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍁</span>
            <span className="text-xl font-bold tracking-tight">TrueNorthPoints</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-zinc-400 hover:text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-amber-500 text-zinc-950 hover:bg-amber-400">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16">
        {/* Gradient Orbs */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-400">
            <Sparkles className="h-4 w-4" />
            AI-Powered Rewards Optimization
          </div>
          <h1 className="mb-6 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-5xl font-bold leading-tight tracking-tight text-transparent md:text-7xl">
            Stop Leaving Points
            <br />
            on the Table.
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-400 md:text-xl">
            TrueNorthPoints tracks your Canadian credit card rewards, tells you the
            best card for every purchase, and helps you maximize your Aeroplan,
            Scene+, and cashback earnings.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-amber-500 px-8 text-lg text-zinc-950 hover:bg-amber-400"
              >
                Start Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                size="lg"
                variant="outline"
                className="border-zinc-700 px-8 text-lg text-zinc-300 hover:bg-zinc-900 hover:text-white"
              >
                I Have an Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-zinc-800 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Everything You Need to
              <span className="text-amber-400"> Maximize Rewards</span>
            </h2>
            <p className="mx-auto max-w-2xl text-zinc-400">
              Built specifically for Canadians. We understand Aeroplan, Air
              Miles, Scene+, PC Optimum, and every major rewards program.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="group border-zinc-800 bg-zinc-900/50 transition-all hover:border-amber-500/30">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 transition-colors group-hover:bg-amber-500/20">
                  <CreditCard className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Card Dashboard
                </h3>
                <p className="text-zinc-400">
                  Track all your Canadian credit cards in one place. See points
                  balances, expiry dates, and annual fee renewals at a glance.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-zinc-800 bg-zinc-900/50 transition-all hover:border-emerald-500/30">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/20">
                  <MessageCircle className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Maple AI Chat 🍁
                </h3>
                <p className="text-zinc-400">
                  Ask Maple which card to use at the grocery store, how to
                  transfer points to Aeroplan, or how to maximize dining rewards.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-zinc-800 bg-zinc-900/50 transition-all hover:border-sky-500/30">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 transition-colors group-hover:bg-sky-500/20">
                  <TrendingUp className="h-6 w-6 text-sky-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Best Card Picker
                </h3>
                <p className="text-zinc-400">
                  Instantly know which card earns the most for groceries, gas,
                  dining, travel, and more — with the math to prove it.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-t border-zinc-800 px-6 py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center md:flex-row md:text-left">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
            <Shield className="h-7 w-7 text-emerald-400" />
          </div>
          <div>
            <h3 className="mb-1 text-lg font-semibold text-white">
              Your Data Stays Private
            </h3>
            <p className="text-zinc-400">
              TrueNorthPoints never connects to your bank. You manually add cards
              and points — you&apos;re always in control. Powered by SOC 2
              compliant infrastructure.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-zinc-800 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to Earn More? 🍁
          </h2>
          <p className="mb-8 text-lg text-zinc-400">
            Join Canadians who are maximizing every dollar of rewards on their
            credit cards.
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="bg-amber-500 px-10 text-lg text-zinc-950 hover:bg-amber-400"
            >
              Sign Up Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍁</span>
            <span className="font-semibold">TrueNorthPoints</span>
          </div>
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} TrueNorthPoints.ca — Made in Canada.
          </p>
        </div>
      </footer>
    </div>
  );
}
