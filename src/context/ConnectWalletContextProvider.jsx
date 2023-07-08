import { BackpackWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

export const ConnectWalletProvider = ({ children }) => {

  const wallets = [
    new BackpackWalletAdapter()
  ]
  const solanaEndpoint = 'https://api.devnet.solana.com';
  // display the wallet address in console

  return (
    <ConnectionProvider endpoint={solanaEndpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

