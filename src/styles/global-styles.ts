import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
	html,
	body {
		padding: 0;
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
			Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
			sans-serif;
		// overflow: hidden;
	}

	* {
		box-sizing: border-box;
	}

	.bg-black {
		background-color: black;
	}
`;
