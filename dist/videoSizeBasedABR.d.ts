/// <reference types="shaka" />
declare type SwitchFunction = (variant: shaka.extern.Variant, clearBuffer?: boolean) => void;
export declare class VideoSizeBasedABR {
    protected config?: shaka.extern.AbrConfiguration;
    protected enabled: boolean;
    protected selectedVariant?: shaka.extern.Variant;
    protected switch?: SwitchFunction;
    protected variants: shaka.extern.Variant[];
    protected static checkVariantMeetsRestrictions(variant: shaka.extern.Variant, restrictions: shaka.extern.Restrictions): boolean;
    chooseVariant(): shaka.extern.Variant | null;
    configure(config: shaka.extern.AbrConfiguration): void;
    disable(): void;
    enable(): void;
    static filterAndSortVariants(restrictions: shaka.extern.Restrictions, variants: shaka.extern.Variant[]): shaka.extern.Variant[];
    init(switchFunction: SwitchFunction): void;
    segmentDownloaded(): void;
    setVariants(variants: shaka.extern.Variant[]): void;
    stop(): void;
    protected suggestVariant(): void;
}
export {};
