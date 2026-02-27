import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        🍁 TrueNorthPoints
                    </h1>
                    <p className="mt-2 text-gray-500">
                        Create your account and start maximizing rewards
                    </p>
                </div>
                <SignUp
                    appearance={{
                        elements: {
                            rootBox: "mx-auto w-full",
                            card: "shadow-lg border border-gray-200 bg-white",
                            headerTitle: "text-gray-900",
                            headerSubtitle: "text-gray-500",
                            socialButtonsBlockButton:
                                "border-gray-200 text-gray-700 hover:bg-gray-50",
                            formFieldLabel: "text-gray-700",
                            formFieldInput:
                                "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400",
                            footerActionLink: "text-amber-600 hover:text-amber-700",
                            dividerLine: "bg-gray-200",
                            dividerText: "text-gray-400",
                        },
                    }}
                />
            </div>
        </div>
    );
}
