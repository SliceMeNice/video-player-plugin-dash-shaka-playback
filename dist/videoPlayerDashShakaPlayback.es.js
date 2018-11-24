import { AssetService, MimeTypeUtilities, Playback } from '@slicemenice/video-player';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var VideoSizeBasedABR = /** @class */ (function () {
    function VideoSizeBasedABR() {
        this.enabled = false;
        this.variants = [];
    }
    VideoSizeBasedABR.checkVariantMeetsRestrictions = function (variant, restrictions) {
        var inRange = function (x, min, max) {
            return x >= min && x <= max;
        };
        var video = variant.video;
        // |video.width| and |video.height| can be undefined, which breaks
        // the math, so make sure they are there first.
        if (video && video.width && video.height) {
            if (!inRange(video.width, restrictions.minWidth || 0, restrictions.maxWidth || Infinity)) {
                return false;
            }
            if (!inRange(video.height, restrictions.minHeight || 0, restrictions.maxHeight || Infinity)) {
                return false;
            }
            if (!inRange(video.width * video.height, restrictions.minPixels || 0, restrictions.maxPixels || Infinity)) {
                return false;
            }
        }
        if (!inRange(variant.bandwidth, restrictions.minBandwidth || 0, restrictions.maxBandwidth || Infinity)) {
            return false;
        }
        return true;
    };
    VideoSizeBasedABR.prototype.chooseVariant = function () {
        if (!this.config || !this.config.restrictions) {
            return null;
        }
        var sortedVariants = VideoSizeBasedABR.filterAndSortVariants(this.config.restrictions, this.variants);
        if (this.variants.length && !sortedVariants.length) {
            // If we couldn't meet the ABR restrictions, we should still play something.
            // These restrictions are not "hard" restrictions in the way that top-level
            // or DRM-based restrictions are.  Sort the variants without restrictions
            // and keep just the first (highest-bandwidth) one.
            sortedVariants = VideoSizeBasedABR.filterAndSortVariants({}, this.variants);
            sortedVariants = [sortedVariants[0]];
        }
        return sortedVariants[0] || null;
    };
    VideoSizeBasedABR.prototype.configure = function (config) {
        this.config = config;
        if (this.enabled) {
            this.suggestVariant();
        }
    };
    VideoSizeBasedABR.prototype.disable = function () {
        this.enabled = false;
    };
    VideoSizeBasedABR.prototype.enable = function () {
        this.enabled = true;
    };
    VideoSizeBasedABR.filterAndSortVariants = function (restrictions, variants) {
        var _this = this;
        if (restrictions) {
            variants = variants.filter(function (variant) {
                return _this.checkVariantMeetsRestrictions(variant, restrictions);
            });
        }
        return variants.sort(function (v1, v2) {
            return v2.bandwidth - v1.bandwidth;
        });
    };
    VideoSizeBasedABR.prototype.init = function (switchFunction) {
        this.switch = switchFunction;
    };
    VideoSizeBasedABR.prototype.segmentDownloaded = function () {
        if (this.enabled) {
            this.suggestVariant();
        }
    };
    VideoSizeBasedABR.prototype.setVariants = function (variants) {
        this.variants = variants;
    };
    VideoSizeBasedABR.prototype.stop = function () {
        this.enabled = false;
        this.switch = undefined;
        this.variants = [];
    };
    VideoSizeBasedABR.prototype.suggestVariant = function () {
        if (!this.config) {
            return;
        }
        var chosenVariant = this.chooseVariant();
        if (chosenVariant && this.switch) {
            var anotherVariantWasSuggested = !this.selectedVariant || chosenVariant.id !== this.selectedVariant.id;
            if (anotherVariantWasSuggested) {
                this.switch(chosenVariant, true);
            }
        }
    };
    return VideoSizeBasedABR;
}());

var DASH_MIMETYPES = {
    mpd: ['application/dash+xml']
};
var Plugin = /** @class */ (function (_super) {
    __extends(Plugin, _super);
    function Plugin(videoElement, playerOptions) {
        var _this = _super.call(this, videoElement, playerOptions) || this;
        _this.videoElement = videoElement;
        _this.playerOptions = playerOptions;
        _this.onResize = _this.onResize.bind(_this);
        return _this;
    }
    Plugin.canPlay = function (source, options) {
        var mimeTypes = MimeTypeUtilities.mimeTypesForUrl(source, DASH_MIMETYPES);
        return mimeTypes.length > 0;
    };
    Plugin.prototype.attach = function () {
        var playback = this;
        return new Promise(function (resolve, reject) {
            var onDependenciesLoaded = function () {
                window.shaka.polyfill.installAll();
                playback.player = new window.shaka.Player(playback.videoElement);
                playback.player.configure(playback.playerOptions.dashShakaPlayback || {});
                playback.onResize();
                window.addEventListener('resize', playback.onResize);
                window.addEventListener('orientationchange', playback.onResize);
                resolve();
            };
            if (!Plugin.dependencies || !Plugin.dependencies.length) {
                throw Error('DashShakaPlayback: Please add the path to Shaka using SliceMeNice.VideoPlayer.DashShakaPlayback.setDependencies()');
            }
            AssetService.loadFiles(Plugin.dependencies)
                .then(onDependenciesLoaded)
                .catch(function (error) {
                throw error;
            });
        });
    };
    Plugin.prototype.detach = function () {
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('orientationchange', this.onResize);
        if (this.player) {
            return this.player.destroy();
        }
        return Promise.resolve();
    };
    Plugin.prototype.setSource = function (source) {
        var _this = this;
        return this.attach().then(function () {
            if (_this.player) {
                return _this.player.load(source);
            }
            return Promise.resolve();
        });
    };
    Plugin.setDependencies = function (dependencies) {
        Plugin.dependencies = dependencies;
    };
    Plugin.prototype.onResize = function () {
        var playback = this;
        var devicePixelRatio = window.devicePixelRatio || 1;
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
    };
    Plugin.dependencies = [];
    return Plugin;
}(Playback));

export { DASH_MIMETYPES, Plugin, VideoSizeBasedABR };
