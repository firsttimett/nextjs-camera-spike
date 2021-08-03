import type { AppProps } from "next/app";
import { AppContextProvider } from "src/components/app-context";
import { GlobalStyle } from "src/styles/global-styles";

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <AppContextProvider>
      <GlobalStyle />
      <Component {...pageProps} />
    </AppContextProvider>
  );
};

export default App;
