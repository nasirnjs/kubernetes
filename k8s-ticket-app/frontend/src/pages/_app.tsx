import "@/styles/globals.css";
import type { AppProps } from "next/app";
import AuthContextProvider from "../context/AuthContext";

type TAppPageProps = {
  isAuthenticated?: boolean;
};
export default function App({ Component, pageProps }: AppProps<TAppPageProps>) {
  return (
    <AuthContextProvider isAuthenticated={!!pageProps.isAuthenticated}>
      <Component {...pageProps} />
    </AuthContextProvider>
  );
}
