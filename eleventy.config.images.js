const path = require("path");
const eleventyImage = require("@11ty/eleventy-img");

module.exports = eleventyConfig => {
	function relativeToInputPath(inputPath, relativeFilePath) {
		let split = inputPath.split("/");
		split.pop();

		return path.resolve(split.join(path.sep), relativeFilePath);
	}

	// Eleventy Image shortcode
	eleventyConfig.addAsyncShortcode("image", async function imageShortcode(src, alt, widths, sizes) {
		// Default widths
		let defaultWidths = widths || [600];
		let file = relativeToInputPath(this.page.inputPath, src);

		// Handle .gif files explicitly
		if (file.endsWith(".gif")) {
			// Only generate GIF format and preserve animation
			let metadata = await eleventyImage(file, {
				widths: defaultWidths,
				formats: ["gif"], // Only GIF format
				outputDir: path.join(eleventyConfig.dir.output, "img"),
				sharpOptions: {
					animated: true, // Ensure animation is preserved
				},
			});

			// Serve the GIF directly without a <picture> element
			return `<img src="${metadata.gif[0].url}" alt="${alt}" width="${metadata.gif[0].width}" height="${metadata.gif[0].height}" style="max-width: 100%; height: auto;" loading="lazy" decoding="async">`;
		}

		// For other image types, generate multiple formats
		let metadata = await eleventyImage(file, {
			widths: defaultWidths,
			formats: ["avif", "webp", "auto"],
			outputDir: path.join(eleventyConfig.dir.output, "img"),
		});

		// Standard responsive image generation
		let imageAttributes = {
			alt,
			sizes,
			loading: "lazy",
			decoding: "async",
			style: "max-width: 100%; height: auto;",
		};
		return eleventyImage.generateHTML(metadata, imageAttributes);
	});
};
