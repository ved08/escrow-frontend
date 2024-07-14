import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import IDL from "../IDL/idl.json"
import { AnchorEscrow } from "../IDL/types";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { FC, useEffect, useState } from "react";
import Card from "./Card/Card";
import { getAssociatedTokenAddressSync, getAccount, TOKEN_PROGRAM_ID, getMint, ASSOCIATED_TOKEN_PROGRAM_ID} from "@solana/spl-token";
import "./Make.css"
import Loading from "./Loading/Loading";

let idl_string = JSON.stringify(IDL)
let idl_object = JSON.parse(idl_string)
type EscrowAccount = {
    escrow: PublicKey;
    mintA: PublicKey;
    mintB: PublicKey;
    seed: BN;
    recieve: BN;
    makerAmount: BN;
    maker: PublicKey
}
interface Props {
    takeDetails: (EscrowAccount | undefined)[] | undefined
}
const Take: FC<Props> = ({takeDetails}) => {
    const {connection} = useConnection()
    const ourWallet = useAnchorWallet()
    const [escrowAccounts, setEscrowAccounts] = useState<(EscrowAccount | undefined)[]>()
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        setLoading(true)
        const data: (EscrowAccount | undefined)[] | undefined =  takeDetails
        if(data?.length) {
            setEscrowAccounts(data)
            console.log(escrowAccounts)
        } 
        console.log(data)
        setLoading(false)
    },[takeDetails])
    // const getTokenBalance = async (mint: PublicKey, owner: PublicKey, programId: PublicKey) => {
    //     const y = getAssociatedTokenAddressSync(mint, owner, true, programId)
    //     return (await getAccount(connection, y)).amount
    // }
    
    
    const truncate = (str: String | undefined) => str ? (str.slice(0,4)+"..."+str.slice(-4)) : null

    return(
        <div className="Main-container">
                {loading == false ?<div className="Cards">
                    {
                        escrowAccounts && 
                        escrowAccounts.map((escrowAccount, i) => (
                            <Card 
                            key={i}
                            escrow={`https://explorer.solana.com/address/${escrowAccount?.escrow.toString()}?cluster=devnet`} 
                            mintA={truncate(escrowAccount?.mintA.toString())} 
                            mintB={truncate(escrowAccount?.mintB.toString())} 
                            mintAUrl={escrowAccount?.mintA.toString()}
                            mintBUrl={escrowAccount?.mintB.toString()}
                            maker={truncate(escrowAccount?.escrow.toString())}
                            makerAmount={(escrowAccount?.makerAmount.toString())}
                            takerAmount={(escrowAccount?.recieve.toString())}
                            deal={async () => {
                                if(!ourWallet) {return alert("Wallet not connected");}
                                const provider = new AnchorProvider(connection, ourWallet)
                                const program = new Program<AnchorEscrow>(idl_object, provider)
                                if(!escrowAccount){return}
                                const makerAtaB = getAssociatedTokenAddressSync(escrowAccount?.mintB, escrowAccount?.maker,false, TOKEN_PROGRAM_ID)
                                const takerAtaA = getAssociatedTokenAddressSync(escrowAccount.mintA, ourWallet.publicKey, false, TOKEN_PROGRAM_ID)
                                const takerAtaB = getAssociatedTokenAddressSync(escrowAccount.mintB, ourWallet.publicKey, false, TOKEN_PROGRAM_ID)
                                const vault = getAssociatedTokenAddressSync(escrowAccount.mintA, escrowAccount.escrow, true, TOKEN_PROGRAM_ID)
                                console.log(takerAtaB.toString())
                                try {

                                    const tx = await program.methods.take()
                                    .accountsStrict({
                                        makerAtaB,
                                        takerAtaA,
                                        takerAtaB,
                                        vault,
                                        tokenProgram: TOKEN_PROGRAM_ID,
                                        taker: ourWallet.publicKey,
                                        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                                        escrow: escrowAccount.escrow,
                                        maker: escrowAccount.maker,
                                        mintA: escrowAccount.mintA,
                                        mintB: escrowAccount.mintB,
                                        systemProgram: SystemProgram.programId
                                    })
                                    .rpc()
                                    console.log(tx)
                                    alert("Tx Successful. Check console for Txid")
                                } catch(e) {
                                    alert("Something went wrong. Check console for error")
                                    console.log(e)
                                }
                            }}
                            />
                        ))
                    }
                </div>: <Loading />}
        </div>
    )
}
export default Take