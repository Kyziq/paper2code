import { Helmet } from "react-helmet-async";

interface SEOProps {
	title?: string;
	description?: string;
	keywords?: string[];
	image?: string;
	url?: string;
}

export function SEO({
	title = "paper2code - Convert Handwritten Code to Digital",
	description = "Convert your handwritten code into executable programs. Supporting Python, C++, and Java with instant code execution and syntax enhancement.",
	keywords = [
		"handwritten code",
		"code conversion",
		"OCR code",
		"python",
		"java",
		"c++",
		"code execution",
		"code compiler",
	],
	image = "/og-image.png",
	url = window.location.href,
}: SEOProps) {
	const siteName = "paper2code";
	// const twitterHandle = "@paper2code";

	return (
		<Helmet>
			{/* Basic Meta Tags */}
			<title>{title}</title>
			<meta name="description" content={description} />
			<meta name="keywords" content={keywords.join(", ")} />

			{/* Open Graph / Facebook */}
			<meta property="og:type" content="website" />
			<meta property="og:url" content={url} />
			<meta property="og:title" content={title} />
			<meta property="og:description" content={description} />
			<meta property="og:image" content={image} />
			<meta property="og:site_name" content={siteName} />

			{/* Twitter */}
			<meta name="twitter:card" content="summary_large_image" />
			{/* <meta name="twitter:site" content={twitterHandle} /> */}
			<meta name="twitter:title" content={title} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={image} />

			{/* Additional Meta Tags */}
			<meta name="robots" content="index, follow" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
			<link rel="canonical" href={url} />
		</Helmet>
	);
}
