type SwitchFunction = (variant: shaka.extern.Variant, clearBuffer?: boolean) => void;

export class VideoSizeBasedABR {
	protected config?: shaka.extern.AbrConfiguration;
	protected enabled = false;
	protected selectedVariant?: shaka.extern.Variant;
	protected switch?: SwitchFunction;
	protected variants: shaka.extern.Variant[] = [];

	protected static checkVariantMeetsRestrictions(variant: shaka.extern.Variant, restrictions: shaka.extern.Restrictions) {
		const inRange = (x: number, min: number, max: number) => {
			return x >= min && x <= max;
		};

		const video = variant.video;

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
	}

	chooseVariant() {
		if (!this.config || !this.config.restrictions) {
			return null;
		}

		let sortedVariants = VideoSizeBasedABR.filterAndSortVariants(this.config.restrictions, this.variants);

		if (this.variants.length && !sortedVariants.length) {
			// If we couldn't meet the ABR restrictions, we should still play something.
			// These restrictions are not "hard" restrictions in the way that top-level
			// or DRM-based restrictions are.  Sort the variants without restrictions
			// and keep just the first (highest-bandwidth) one.
			sortedVariants = VideoSizeBasedABR.filterAndSortVariants({}, this.variants);
			sortedVariants = [sortedVariants[0]];
		}

		return sortedVariants[0] || null;
	}

	configure(config: shaka.extern.AbrConfiguration) {
		this.config = config;

		if (this.enabled) {
			this.suggestVariant();
		}
	}

	disable() {
		this.enabled = false;
	}

	enable() {
		this.enabled = true;
	}

	static filterAndSortVariants(restrictions: shaka.extern.Restrictions, variants: shaka.extern.Variant[]) {
		if (restrictions) {
			variants = variants.filter((variant: any) => {
				return this.checkVariantMeetsRestrictions(variant, restrictions);
			});
		}

		return variants.sort((v1:shaka.extern.Variant, v2:shaka.extern.Variant) => {
			return v2.bandwidth - v1.bandwidth;
		});
	};

	init(switchFunction: SwitchFunction) {
		this.switch = switchFunction;
	}

	segmentDownloaded() {
		if (this.enabled) {
			this.suggestVariant();
		}
	}

	setVariants(variants: shaka.extern.Variant[]) {
		this.variants = variants;
	}

	stop() {
		this.enabled = false;
		this.switch = undefined;
		this.variants = [];
	}

	protected suggestVariant() {
		if (!this.config) {
			return;
		}

		const chosenVariant = this.chooseVariant();

		if ( chosenVariant && this.switch ) {
			const anotherVariantWasSuggested = !this.selectedVariant || chosenVariant.id !== this.selectedVariant.id;

			if ( anotherVariantWasSuggested ) {
				this.switch(chosenVariant, true);
			}
		}
	}
}