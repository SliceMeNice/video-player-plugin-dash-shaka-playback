
interface Window {
    shaka: typeof shaka;
}

declare namespace shaka {

	export class Player {
		static version: string;

		video_: HTMLVideoElement;

		constructor(video: HTMLMediaElement);

		addEventListener(type: string, listener: shaka.util.FakeEventTarget.ListenerType): void;
		configure(config:string|shaka.extern.PlayerConfiguration, value?: any): boolean;
		destroy(): Promise<void>;
		getAudioLanguages(): string[];
		getNetworkingEngine(): shaka.net.NetworkingEngine;
		getStats(): shaka.extern.Stats;
		getTextTracks(): shaka.extern.Track[];
		getVariantTracks(): shaka.extern.Track[];
		isLive(): boolean;
		load(manifestUri: string, opt_startTime?: number, opt_manifestParserFactory?: shaka.extern.ManifestParter.Factory): Promise<void>;
		selectAudioLanguage(language: string, role?: string): void;
		selectTextTrack(track: shaka.extern.Track): void;
		selectVariantTrack(track: shaka.extern.Track, clearBuffer?: boolean): void;
		setTextTrackVisibility(on: boolean): void;
		unload(reinitializeMediaSource?: boolean): Promise<void>;
	}

	namespace Player {
		export interface ErrorEvent {
			type: string;
			detail: shaka.util.Error;
		}
	}

	namespace net {

		export class NetworkingEngine {
			registerRequestFilter(filter: shaka.extern.RequestFilter): void;
			registerResponseFilter(filter: shaka.extern.ResponseFilter): void;
		}

		namespace NetworkingEngine {
			export enum RequestType {
				MANIFEST = 0,
				SEGMENT = 1,
				LICENSE = 2,
				APP = 3
			}
		}
	}

	namespace extern {
		export interface Track {
			id: number;
			active: boolean;

			type: string;
			bandwidth: number;

			language: string;
			label?: string;
			kind?: string;
			width?: number;
			height?: number;
			frameRate?: number;
			mimeType?: string;
			codecs?: string;
			audioCodec?: string;
			videoCodec?: string;
			primary: boolean;
			roles: string[];
			videoId?: number;
			audioId?: number;
			channelsCount?: number;
			audioBandwidth?: number;
			videoBandwidth?: number;
		}

		export interface Variant {
			id: number;
			language: string;
			primary: boolean;
			audio?: Stream;
			video?: Stream;
			bandwidth: number;
			drmInfos: DrmInfo[];
			allowedByApplication: boolean;
			allowedByKeySystem: boolean;
		}

		export interface Stream {
			id: number;
			//createSegmentIndex: CreateSegmentIndexFunction;
			//findSegmentPosition: FindSegmentPositionFunction;
			//getSegmentReference: shakaExtern.GetSegmentReferenceFunction,
			//initSegmentReference: shaka.media.InitSegmentReference,
			presentationTimeOffset: number | undefined;
			mimeType: string;
			codecs: string;
			frameRate: number | undefined;
			bandwidth: number | undefined;
			width: number | undefined;
			height: number | undefined;
			kind: string | undefined;
			encrypted: boolean;
			keyId?: string;
			language: string;
			label?: string;
			type: string;
			primary: boolean;
			trickModeVideo?: Stream;
			containsEmsgBoxes: boolean;
			roles: string[];
			channelsCount: number;
		}

		export type RequestFilter = (requestType: shaka.net.NetworkingEngine.RequestType, request: Request) => Promise<void> | void;
		export type ResponseFilter = (requestType: shaka.net.NetworkingEngine.RequestType, response: Response) => Promise<void> | void;

		export class Request {
			headers: { [key: string]: string };
			uris: string[];
			method: string;
			body: ArrayBuffer;
			allowCrossSiteCredentials: boolean;
			retryParameters: RetryParameters;
		}

		export class Response {
			uri: string;
			data: ArrayBuffer;
			headers: { [key: string]: string };
			timeMs?: number;
			fromCache?: boolean;
		}

		export class RetryParameters {
			maxAttempts: number;
			baseDelay: number;
			backoffFactor: number;
			fuzzFactor: number;
			timeout: number;
		}

		export interface PlayerConfiguration {
			drm?: DrmConfiguration,
			manifest?: ManifestConfiguration,
			streaming?: StreamingConfiguration,
			abrFactory?: AbrManager.Factory,
			abr?: AbrConfiguration,
			preferredAudioLanguage?: string,
			preferredTextLanguage?: string,
			preferredVariantRole?: string,
			preferredTextRole?: string,
			preferredAudioChannelCount?: number,
			playRangeStart?: number,
			playRangeEnd?: number,
			restrictions?: Restrictions,
			textDisplayFactory?: shaka.extern.TextDisplayer.Factory
		}

		export interface DrmConfiguration {
			retryParameters: RetryParameters;
			servers: { [key: string]: string };
			clearKeys: { [key: string]: string };
			delayLicenseRequestUntilPlayed: boolean;
 			advanced: { [key: string]: AdvancedDrmConfiguration };
		}

		export interface AdvancedDrmConfiguration {
			distinctiveIdentifierRequired: boolean;
			persistentStateRequired: boolean;
			videoRobustness: string;
			audioRobustness: string;
 			serverCertificate: Uint8Array;
		}

		export interface ManifestConfiguration {
			retryParameters: RetryParameters;
 			dash: DashManifestConfiguration;
		}

		export interface DashManifestConfiguration {
			customScheme: DashContentProtectionCallback;
			clockSyncUri: string;
			ignoreDrmInfo: boolean;
			xlinkFailGracefully: boolean;
			defaultPresentationDelay: number;
		}

		export type DashContentProtectionCallback = (param: any) => DrmInfo[];

		export interface DrmInfo {
			keySystem: string;
			licenseServerUri?: string;
			persistentStateRequired?: boolean;
			distinctiveIdentifierRequired?: boolean;
			initData: InitDataOverride[];
			keyIds: string[];
			serverCertificate?: Uint8Array;
			audioRobustness: string;
			videoRobustness: string;
		}

		export interface InitDataOverride {
			initData: Uint8Array;
			initDataType: string;
			keyId?: string;
		}

		export interface StreamingConfiguration {
			retryParameters?: RetryParameters;
			failureCallback?: (error: shaka.util.Error) => void;
			rebufferingGoal?: number;
			bufferingGoal?: number;
			bufferBehind?: number;
			ignoreTextStreamFailures?: boolean;
			alwaysStreamText?: boolean;
			startAtSegmentBoundary?: boolean;
			smallGapLimit?: number;
			jumpLargeGaps?: boolean;
			durationBackoff?: number;
			forceTransmuxTS?: boolean;
		}

		export interface AbrConfiguration {
			enabled?: boolean;
			defaultBandwidthEstimate?: number;
 			restrictions?: Restrictions;
			switchInterval?: number;
			bandwidthUpgradeTarget?: number;
			bandwidthDowngradeTarget?: number;
		}

		export class AbrManager {

		}

		export namespace AbrManager {
			export type Factory = () => AbrManager;
		}

		export class TextDisplayer {

		}

		export namespace TextDisplayer {
			export type Factory = () => TextDisplayer;
		}

		export class ManifestParter {

		}

		export namespace ManifestParter {
			export type Factory = () => ManifestParter;
		}

		export interface Restrictions {
			minWidth?: number;
			maxWidth?: number;
			minHeight?: number;
			maxHeight?: number;
			minPixels?: number;
			maxPixels?: number;
			minBandwidth?: number;
			maxBandwidth?: number;
		}

		export interface Stats {
			width: number;
			height: number;
 			streamBandwidth: number;

			decodedFrames: number;
			droppedFrames: number;
			estimatedBandwidth: number;

			loadLatency: number;
			playTime: number;
			bufferingTime: number;

			switchHistory: shaka.extern.TrackChoice[];
			stateHistory: shaka.extern.StateChange[];
		}

		export interface TrackChoice {
			timestamp: number;
			id: number;
			type: string;
			fromAdaptation: boolean;
			bandwidth?: number;
		}

		export interface StateChange {
			timestamp: number;
			state: string;
			duration: number;
		}
	}

	namespace text {

		export class SimpleTextDisplayer {
			protected textTrack_: TextTrack;

			constructor(video: HTMLVideoElement);

			append(cues: TextTrackCue[]): void;
			isTextVisible(): boolean;
			setTextVisibility(on: boolean): void;
		}

	}

	namespace util {

		export class Error {
			constructor(severity: Error.Severity, category: Error.Category, code: Error.Code, ...args: any[]);

			category: Error.Category;
			code: Error.Code;
			data: any[];
			handled: boolean;
			message: string;
			severity: Error.Severity;
			stack: string;
		}

		namespace StreamUtils {
			function meetsRestrictions(...args: any): boolean;
		}

		namespace Error {

			export enum Severity {
				RECOVERABLE = 1,
				CRITICAL = 2
			}

			export enum Category {
				NETWORK = 1, // errors from the network stack
				TEXT = 2, // errors parsing text streams
				MEDIA = 3, // errors parsing or processing audio or video streams
				MANIFEST = 4, // errors parsing the Manifest
				STREAMING = 5, // errors related to streaming
				DRM = 6, // errors related to DRM
				PLAYER = 7,	// miscellaneous errors from the player
				CAST = 8, // errors related to cast
				STORAGE = 9
			}

			export enum Code {
				UNSUPPORTED_SCHEME = 1000,
				BAD_HTTP_STATUS = 1001,
				HTTP_ERROR = 1002,
				TIMEOUT = 1003,
				MALFORMED_DATA_URI = 1004,
				UNKNOWN_DATA_URI_ENCODING = 1005,
				REQUEST_FILTER_ERROR = 1006,
				RESPONSE_FILTER_ERROR = 1007,
				MALFORMED_TEST_URI = 1008,
				UNEXPECTED_TEST_REQUEST = 1009,
				INVALID_TEXT_HEADER = 2000,
				INVALID_TEXT_CUE = 2001,
				UNABLE_TO_DETECT_ENCODING = 2003,
				BAD_ENCODING = 2004,
				INVALID_XML = 2005,
				INVALID_MP4_TTML = 2007,
				INVALID_MP4_VTT = 2008,
				UNABLE_TO_EXTRACT_CUE_START_TIME = 2009,
				BUFFER_READ_OUT_OF_BOUNDS = 3000,
				JS_INTEGER_OVERFLOW = 3001,
				EBML_OVERFLOW = 3002,
				EBML_BAD_FLOATING_POINT_SIZE = 3003,
				MP4_SIDX_WRONG_BOX_TYPE = 3004,
				MP4_SIDX_INVALID_TIMESCALE = 3005,
				MP4_SIDX_TYPE_NOT_SUPPORTED = 3006,
				WEBM_CUES_ELEMENT_MISSING = 3007,
				WEBM_EBML_HEADER_ELEMENT_MISSING = 3008,
				WEBM_SEGMENT_ELEMENT_MISSING = 3009,
				WEBM_INFO_ELEMENT_MISSING = 3010,
				WEBM_DURATION_ELEMENT_MISSING = 3011,
				WEBM_CUE_TRACK_POSITIONS_ELEMENT_MISSING = 3012,
				WEBM_CUE_TIME_ELEMENT_MISSING = 3013,
				MEDIA_SOURCE_OPERATION_FAILED = 3014,
				MEDIA_SOURCE_OPERATION_THREW = 3015,
				VIDEO_ERROR = 3016,
				QUOTA_EXCEEDED_ERROR = 3017,
				TRANSMUXING_FAILED = 3018,
				UNABLE_TO_GUESS_MANIFEST_TYPE = 4000,
				DASH_INVALID_XML = 4001,
				DASH_NO_SEGMENT_INFO = 4002,
				DASH_EMPTY_ADAPTATION_SET = 4003,
				DASH_EMPTY_PERIOD = 4004,
				DASH_WEBM_MISSING_INIT = 4005,
				DASH_UNSUPPORTED_CONTAINER = 4006,
				DASH_PSSH_BAD_ENCODING = 4007,
				DASH_NO_COMMON_KEY_SYSTEM = 4008,
				DASH_MULTIPLE_KEY_IDS_NOT_SUPPORTED = 4009,
				DASH_CONFLICTING_KEY_IDS = 4010,
				UNPLAYABLE_PERIOD = 4011,
				RESTRICTIONS_CANNOT_BE_MET = 4012,
				NO_PERIODS = 4014,
				HLS_PLAYLIST_HEADER_MISSING = 4015,
				INVALID_HLS_TAG = 4016,
				HLS_INVALID_PLAYLIST_HIERARCHY = 4017,
				DASH_DUPLICATE_REPRESENTATION_ID = 4018,
				HLS_MULTIPLE_MEDIA_INIT_SECTIONS_FOUND = 4020,
				HLS_COULD_NOT_GUESS_MIME_TYPE = 4021,
				HLS_MASTER_PLAYLIST_NOT_PROVIDED = 4022,
				HLS_REQUIRED_ATTRIBUTE_MISSING = 4023,
				HLS_REQUIRED_TAG_MISSING = 4024,
				HLS_COULD_NOT_GUESS_CODECS = 4025,
				HLS_KEYFORMATS_NOT_SUPPORTED = 4026,
				DASH_UNSUPPORTED_XLINK_ACTUATE = 4027,
				DASH_XLINK_DEPTH_LIMIT = 4028,
				HLS_COULD_NOT_PARSE_SEGMENT_START_TIME = 4030,
				CONTENT_UNSUPPORTED_BY_BROWSER = 4032,
				INVALID_STREAMS_CHOSEN = 5005,
				NO_RECOGNIZED_KEY_SYSTEMS = 6000,
				REQUESTED_KEY_SYSTEM_CONFIG_UNAVAILABLE = 6001,
				FAILED_TO_CREATE_CDM = 6002,
				FAILED_TO_ATTACH_TO_VIDEO = 6003,
				INVALID_SERVER_CERTIFICATE = 6004,
				FAILED_TO_CREATE_SESSION = 6005,
				FAILED_TO_GENERATE_LICENSE_REQUEST = 6006,
				LICENSE_REQUEST_FAILED = 6007,
				LICENSE_RESPONSE_REJECTED = 6008,
				ENCRYPTED_CONTENT_WITHOUT_DRM_INFO = 6010,
				NO_LICENSE_SERVER_GIVEN = 6012,
				OFFLINE_SESSION_REMOVED = 6013,
				EXPIRED = 6014,
				LOAD_INTERRUPTED = 7000,
				OPERATION_ABORTED = 7001,
				NO_VIDEO_ELEMENT = 7002,
				CAST_API_UNAVAILABLE = 8000,
				NO_CAST_RECEIVERS = 8001,
				ALREADY_CASTING = 8002,
				UNEXPECTED_CAST_ERROR = 8003,
				CAST_CANCELED_BY_USER = 8004,
				CAST_CONNECTION_TIMED_OUT = 8005,
				CAST_RECEIVER_APP_UNAVAILABLE = 8006,
				STORAGE_NOT_SUPPORTED = 9000,
				INDEXED_DB_ERROR = 9001,
				DEPRECATED_OPERATION_ABORTED = 9002,
				REQUESTED_ITEM_NOT_FOUND = 9003,
				MALFORMED_OFFLINE_URI = 9004,
				CANNOT_STORE_LIVE_OFFLINE = 9005,
				STORE_ALREADY_IN_PROGRESS = 9006,
				NO_INIT_DATA_FOR_OFFLINE = 9007,
				LOCAL_PLAYER_INSTANCE_REQUIRED = 9008,
				NEW_KEY_OPERATION_NOT_SUPPORTED = 9011,
				KEY_NOT_FOUND = 9012,
				MISSING_STORAGE_CELL = 9013
			}

		}

		export class FakeEventTarget {

		}

		export namespace FakeEventTarget {
			export type ListenerType = EventListener | ( (event: Event) => (boolean | undefined) );
		}

		export class DataViewReader {
			skip(bytes: number): void;
		}

		export class Mp4Parser {
			static allData(callback: (bytes: Uint8Array) => any): Mp4Parser.CallbackType;
			static children(box: Mp4Parser.ParsedBox): void;
			static sampleDescription(box: Mp4Parser.ParsedBox): void;
			static typeToString(type: number): string;

			box(type: string, definition: Mp4Parser.CallbackType): Mp4Parser;
			fullBox(type: string, definition: Mp4Parser.CallbackType): Mp4Parser;
			parse(data: BufferSource, partialOkay?: boolean): void;
			parseNext(absStart: number, reader: DataViewReader, partialOkay?: boolean): void;
			stop(): void;
		}

		export namespace Mp4Parser {
			export type CallbackType = (( box: ParsedBox ) => void);

			export interface ParsedBox {
				parser: Mp4Parser;
				partialOkay: boolean;
				start: number;
				size: number;
				version?: number;
				flags?: number;
				reader: shaka.util.DataViewReader
			}
		}

	}

	export class polyfill {
		static installAll(): void;
		static register(polyfill: Function, priority?: number): void;
	}

}