import { ContractProvider } from '@/contexts/ContractContext'
import { PrivyProvider } from "@privy-io/react-auth";
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { BiconomyProvider } from '@/contexts/BiconomyContext';
import Greeting from '@/components/Greeting';
import { useState } from 'react';


export default function App({ Component, pageProps }: AppProps) {
  return (
    <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
        onSuccess={() => console.log("login success")}
        config={{
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
            noPromptOnSignature: false,
          },
          loginMethods: ["sms", "email"],
        }}
      >
      <BiconomyProvider>
      <ContractProvider>
        <Greeting />
      <Component {...pageProps} />
      </ContractProvider>
      </BiconomyProvider>
    </PrivyProvider>
  )
}
