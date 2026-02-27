import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white">
                        🍁 TrueNorthPoints
                    </h1>
                    <p className="mt-2 text-zinc-400">
                        Create your account and start maximizing rewards
                    </p>
                </div>
                <SignUp
                    appearance={{
                        elements: {
                            rootBox: "mx-auto w-full",
                            card: "shadow-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm",
                            headerTitle: "text-white",
                            headerSubtitle: "text-zinc-400",
                            socialButtonsBlockButton:
                                "border-zinc-700 text-white hover:bg-zinc-800",
                            formFieldLabel: "text-zinc-300",
                            formFieldInput:
                                "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500",
                            footerActionLink: "text-amber-400 hover:text-amber-300",
                            dividerLine: "bg-zinc-700",
                            dividerText: "text-zinc-500",
                        },
                    }}
                />
            </div>
        </div>
    );
}
