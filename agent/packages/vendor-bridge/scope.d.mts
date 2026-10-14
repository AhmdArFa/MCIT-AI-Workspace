export declare const VENDOR_ALIAS_SCOPE: string;
export declare const VENDOR_REAL_SCOPE: string;
export declare const toRealName: (name: string) => string;
export declare const withVendorNames: <T>(list: T[]) => T[];
export declare const vendorPath: (sub?: string) => RegExp;
export declare const vendorVar: (name: string) => string;
export declare const vendorClass: (name: string) => string;
