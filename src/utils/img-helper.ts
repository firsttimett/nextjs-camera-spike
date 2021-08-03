function fit(contains: boolean) {
	return (
		parentWidth: number,
		parentHeight: number,
		childWidth: number,
		childHeight: number,
		scale = 1,
		offsetX = 0.5,
		offsetY = 0.5
	) => {
		const childRatio = childWidth / childHeight;
		const parentRatio = parentWidth / parentHeight;
		let width = parentWidth * scale;
		let height = parentHeight * scale;

		if (contains ? childRatio > parentRatio : childRatio < parentRatio) {
			height = width / childRatio;
		} else {
			width = height * childRatio;
		}

		return {
			width,
			height,
			offsetX: (parentWidth - width) * offsetX,
			offsetY: (parentHeight - height) * offsetY,
		};
	};
}

export const contain = fit(true);
export const cover = fit(false);

/**
 * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
 * images to fit into a certain area.
 *
 * @param {Number} srcWidth width of source image
 * @param {Number} srcHeight height of source image
 * @param {Number} maxWidth maximum available width
 * @param {Number} maxHeight maximum available height
 * @return {Object} { width, height }
 */
export function calculateAspectRatioFit(
	srcWidth: number,
	srcHeight: number,
	maxWidth: number,
	maxHeight: number
) {
	const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

	return { width: srcWidth * ratio, height: srcHeight * ratio };
}
