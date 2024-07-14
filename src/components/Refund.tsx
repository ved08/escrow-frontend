import { AnchorProvider, Program, BN } from "@coral-xyz/anchor"
import IDL from "../IDL/idl.json"
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { AnchorEscrow } from "../IDL/types"
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAssociatedTokenAddressSync } from "@solana/spl-token"
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js"
import { FC, useEffect, useState } from "react"
import Loading from "./Loading/Loading"
const idl_string = JSON.stringify(IDL)
const idl_object = JSON.parse(idl_string)

type EscrowAccount = {
    escrow: PublicKey;
    mintA: PublicKey;
    mintB: PublicKey;
    seed: BN;
    recieve: BN,
    makerAmount: BN;
}
interface Props {
    currentEscrows: (EscrowAccount | undefined)[] | undefined
}
const Refund: FC<Props> = ({currentEscrows}) => {
    const { connection } = useConnection()
    const ourWallet = useAnchorWallet()
    const [escrowAccounts, setEscrowAccounts] = useState<(EscrowAccount | undefined)[]>()
    const [selectedEscrow, setSelectedEscrow] = useState<EscrowAccount>()
    const [loading, setLoading] = useState(false)
    useEffect(()=> {
        setLoading(true)
        const data: (EscrowAccount | undefined)[] | undefined = currentEscrows
        if(data?.length) {
            setEscrowAccounts(data)
        }
        setLoading(false)
    }, [currentEscrows])
    const refundEscrow2 = async () => {
        if(!ourWallet) {return alert("Wallet not connected");}
        const provider = new AnchorProvider(connection, ourWallet)
        const program = new Program<AnchorEscrow>(idl_object, provider)
        if(selectedEscrow) {
            const makerAtaA = getAssociatedTokenAddressSync(
                selectedEscrow.mintA, ourWallet.publicKey,false,TOKEN_PROGRAM_ID
            )
            const vault = getAssociatedTokenAddressSync(
                selectedEscrow.mintA,
                selectedEscrow.escrow,
                true,
                TOKEN_PROGRAM_ID
            )
            console.log(makerAtaA.toString(), vault.toString())
            try {
                const tx = await program.methods.refund()
                .accountsStrict({
                    makerAtaA,
                    vault,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    escrow: selectedEscrow.escrow,
                    maker: ourWallet.publicKey,
                    mintA: selectedEscrow.mintA,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID
                })
                .rpc()
                alert("Tx Successful. Check console for Txid")
                console.log(tx)
            } catch(e) {
                alert("Something went wrong. Check console for error")
                console.log(e)
            }
        } else {
            alert("Select an Escrow Account")
        }
        
        
    }
    const truncate = (str: String | undefined) => str ? (str.slice(0,5)+"..."+str.slice(-5)) : null
    
    return(
        <div className="Main-container">
            {loading==false ?
            <div className="Modal">
                
                <div>
                    <select onChange={e => {
                        setSelectedEscrow(escrowAccounts?.find(es => es?.escrow.toString() == e.target.value))
                    }}>
                        <option value={""}>--Select Escrow--</option>
                        {
                            escrowAccounts && 
                            escrowAccounts.map((escrowAccount,i) => (
                                <option key={i} value={escrowAccount?.escrow.toString()}>{escrowAccount?.escrow.toString()}</option>
                            ))
                        }
                    </select>
                </div>
                <div className="Refund-details">
                    <p>Offered Token: <a href={`https://explorer.solana.com/address/${selectedEscrow?.mintA.toString()}?cluster=devnet`}>{truncate(selectedEscrow?.mintA.toString())}</a></p>
                    <p>Offered Amount: {selectedEscrow?.makerAmount.toString()}</p>
                    <p>Requested Token: <a href={`https://explorer.solana.com/address/${selectedEscrow?.mintB.toString()}?cluster=devnet`}>{truncate(selectedEscrow?.mintB.toString())}</a></p>
                    <p>Requested Amount: {selectedEscrow?.recieve.toString()}</p>
                    <button className="Submit-form" onClick={refundEscrow2}>Refund</button>
                </div>
            </div>: <Loading />}
        </div>
    )
}

export default Refund