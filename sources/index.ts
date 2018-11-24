import {
	AssetService,
	MimeTypeUtilities,
	Playback,
	PlayerOptions,
	PlayerSource
} from '@slicemenice/video-player';

export const DASH_MIMETYPES: MimeTypeUtilities.MimeTypeByExtension = {
	mpd: ['application/dash+xml']
};

export { VideoSizeBasedABR } from './videoSizeBasedABR';

export class Plugin extends Playback {
	protected player?: shaka.Player;
	static dependencies: string[] = [];

	constructor(
		protected videoElement: HTMLVideoElement,
		protected playerOptions: PlayerOptions
	) {
		super(videoElement, playerOptions);

		this.onResize = this.onResize.bind(this);
	}

	static canPlay(source: PlayerSource, options?: PlayerOptions) {
		const mimeTypes = MimeTypeUtilities.mimeTypesForUrl(source, DASH_MIMETYPES);

		return mimeTypes.length > 0;
	}

	attach() {
		const playback = this;

		return new Promise<void>((resolve, reject) => {
			const onDependenciesLoaded = function() {
				window.shaka.polyfill.installAll();

				playback.player = new window.shaka.Player(playback.videoElement);

				playback.player.configure(playback.playerOptions.dashShakaPlayback || {});
				playback.onResize();

				window.addEventListener('resize', playback.onResize);
				window.addEventListener('orientationchange', playback.onResize);

				resolve();
			};

			if ( !Plugin.dependencies || !Plugin.dependencies.length ) {
				throw Error( 'DashShakaPlayback: Please add the path to Shaka using SliceMeNice.VideoPlayer.DashShakaPlayback.setDependencies()' );
			}

			AssetService.loadFiles(Plugin.dependencies)
				.then( onDependenciesLoaded )
				.catch( (error: Error) => {
					throw error;
				});
		});
	}

	detach() {
		window.removeEventListener('resize', this.onResize);
		window.removeEventListener('orientationchange', this.onResize);

		if (this.player) {
			return this.player.destroy();
		}

		return Promise.resolve();
	}

	setSource(source: PlayerSource) {
		return this.attach().then(() => {
			if (this.player) {
				return this.player.load(source);
			}

			return Promise.resolve();
		});
	}

	static setDependencies( dependencies: string[] ) {
		Plugin.dependencies = dependencies;
	}

	protected onResize() {
		const playback = this;
		const devicePixelRatio = window.devicePixelRatio || 1;

		if (playback.player) {
			playback.player.configure({
				abr: {
					restrictions: {
						maxWidth: playback.videoElement.offsetWidth * devicePixelRatio,
						maxHeight: playback.videoElement.offsetHeight * devicePixelRatio
					}
				}
			});
		}
	}
}
