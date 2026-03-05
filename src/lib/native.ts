export const isNativeApp = (): boolean => {
    if (typeof window === 'undefined') return false;
    return typeof (window as any).Capacitor !== 'undefined' &&
        (window as any).Capacitor.isNativePlatform();
};
