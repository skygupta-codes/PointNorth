/**
 * Capacitor native platform detection utility.
 * Used to conditionally render features based on whether the user
 * is in the iOS app (WebView) or a standard web browser.
 *
 * Primary use case: hiding Stripe checkout UI in the iOS binary
 * to comply with Apple App Store guidelines (no IAP bypass).
 */

export const isNativeApp = (): boolean => {
    if (typeof window === "undefined") return false;
    const win = window as unknown as Record<string, unknown>;
    const cap = win.Capacitor;
    if (typeof cap !== "object" || cap === null) return false;
    const capObj = cap as Record<string, unknown>;
    if (typeof capObj.isNativePlatform !== "function") return false;
    return (capObj.isNativePlatform as () => boolean)();
};

