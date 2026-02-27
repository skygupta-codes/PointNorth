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
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍁</span>
            <span className="text-xl font-bold tracking-tight">TrueNorthPoints</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-gray-500 hover:text-gray-900">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-amber-500 text-white hover:bg-amber-600">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16">
        {/* Gradient Orbs */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-amber-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm text-amber-700">
            <Sparkles className="h-4 w-4" />
            AI-Powered Rewards Optimization
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-gray-900 md:text-7xl">
            Stop Leaving Points
            <br />
            <span className="bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">on the Table.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-500 md:text-xl">
            TrueNorthPoints tracks your Canadian credit card rewards, tells you the
            best card for every purchase, and helps you maximize your Aeroplan,
            Scene+, and cashback earnings.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-amber-500 px-8 text-lg text-white hover:bg-amber-600"
              >
                Start Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                size="lg"
                variant="outline"
                className="border-gray-300 px-8 text-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                I Have an Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-gray-200 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Everything You Need to
              <span className="text-amber-600"> Maximize Rewards</span>
            </h2>
            <p className="mx-auto max-w-2xl text-gray-500">
              Built specifically for Canadians. We understand Aeroplan, Air
              Miles, Scene+, PC Optimum, and every major rewards program.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="group border-gray-200 bg-white shadow-sm transition-all hover:border-amber-300 hover:shadow-md">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 transition-colors group-hover:bg-amber-100">
                  <CreditCard className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Card Dashboard
                </h3>
                <p className="text-gray-500">
                  Track all your Canadian credit cards in one place. See points
                  balances, expiry dates, and annual fee renewals at a glance.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-gray-200 bg-white shadow-sm transition-all hover:border-emerald-300 hover:shadow-md">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 transition-colors group-hover:bg-emerald-100">
                  <MessageCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Maple AI Chat 🍁
                </h3>
                <p className="text-gray-500">
                  Ask Maple which card to use at the grocery store, how to
                  transfer points to Aeroplan, or how to maximize dining rewards.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-gray-200 bg-white shadow-sm transition-all hover:border-sky-300 hover:shadow-md">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 transition-colors group-hover:bg-sky-100">
                  <TrendingUp className="h-6 w-6 text-sky-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Best Card Picker
                </h3>
                <p className="text-gray-500">
                  Instantly know which card earns the most for groceries, gas,
                  dining, travel, and more — with the math to prove it.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-t border-gray-200 px-6 py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center md:flex-row md:text-left">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-50">
            <Shield className="h-7 w-7 text-emerald-600" />
          </div>
          <div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              Your Data Stays Private
            </h3>
            <p className="text-gray-500">
              TrueNorthPoints never connects to your bank. You manually add cards
              and points — you&apos;re always in control. Powered by SOC 2
              compliant infrastructure.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-200 bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to Earn More? 🍁
          </h2>
          <p className="mb-8 text-lg text-gray-500">
            Join Canadians who are maximizing every dollar of rewards on their
            credit cards.
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="bg-amber-500 px-10 text-lg text-white hover:bg-amber-600"
            >
              Sign Up Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍁</span>
            <span className="font-semibold text-gray-900">TrueNorthPoints</span>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} TrueNorthPoints.ca — Made in Canada.
          </p>
        </div>
      </footer>
    </div>
  );
}
