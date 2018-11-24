/// <reference types="shaka" />
import { MimeTypeUtilities, Playback, PlayerOptions, PlayerSource } from '@slicemenice/video-player';
export declare const DASH_MIMETYPES: MimeTypeUtilities.MimeTypeByExtension;
export { VideoSizeBasedABR } from './videoSizeBasedABR';
export declare class Plugin extends Playback {
    protected videoElement: HTMLVideoElement;
    protected playerOptions: PlayerOptions;
    protected player?: shaka.Player;
    static dependencies: string[];
    constructor(videoElement: HTMLVideoElement, playerOptions: PlayerOptions);
    static canPlay(source: PlayerSource, options?: PlayerOptions): boolean;
    attach(): Promise<void>;
    detach(): Promise<void>;
    setSource(source: PlayerSource): Promise<void>;
    static setDependencies(dependencies: string[]): void;
    protected onResize(): void;
}
