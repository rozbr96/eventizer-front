import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Box } from "@chakra-ui/react";

import { AuthProvider } from "@/components/app/auth-context";
import Header from "@/components/app/header";
import { Provider } from "@/components/ui/provider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <AuthProvider>
        <Header />

        <Box maxW="1200px" mx="auto" px="6" py="6">
          <Component {...pageProps} />
        </Box>
      </AuthProvider>
    </Provider>
  )
}
