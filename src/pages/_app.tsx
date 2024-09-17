import type { AppProps } from "next/app";
import "./globals.css";
import RootLayout from "./layout";
import { AuthProvider } from "./AuthContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <RootLayout>
        <Component {...pageProps} />
      </RootLayout>
    </AuthProvider>

  );
}
