import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletDisconnectButton, WalletModal, WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {web3} from "@coral-xyz/anchor"
import { FC, ReactNode, useMemo } from "react";
require("@solana/wallet-adapter-react-ui/styles.css")

const WalletContextProvider: FC<{children: ReactNode}> = ({children}) => {
    const network = web3.clusterApiUrl("devnet")
    const wallets = useMemo(
        () => [],
        [network]
    )
    return (
        <ConnectionProvider endpoint={network}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}

export default WalletContextProvider