import { createContext, useEffect, useMemo, useState } from "react";
import { Connection } from '@solana/web3.js';
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, web3 } from "@project-serum/anchor";

export const WalletContext = createContext();

export const WalletContextProvider = ({ children }) => {
    const wallet = useAnchorWallet();

    const connection = useMemo(() => new Connection(web3.clusterApiUrl("devnet"), 'processed'), []);

    const provider = useMemo(() => new AnchorProvider(connection, wallet, 'processed'), [connection, wallet]);


    const [publicKey, setPublicKey] = useState(null);

    useEffect(() => {
        const updatePublicKey = async () => {
            if (provider.publicKey) {
                const publicKeyString = provider.publicKey.toString();
                setPublicKey(publicKeyString);
            }
        };
        updatePublicKey();
    }, [provider]);

    return (
        <WalletContext.Provider value={{ publicKey, wallet }}>
            {children}
        </WalletContext.Provider>
    );
};
