import { 
    TOKEN_2022_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    getAccount,
    getAssociatedTokenAddressSync,
    // TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
} from "@solana/spl-token"
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react"
import { AccountInfo, PublicKey, SystemProgram } from "@solana/web3.js"
import { FC, useEffect, useState } from "react"
import IDL from "../IDL/idl.json"
import { AnchorEscrow } from "../IDL/types"
import "./Make.css"
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor"
import { randomBytes } from "crypto"
import Loading from "./Loading/Loading"

const seed = new BN(randomBytes(8))

const idl_string = JSON.stringify(IDL)
const idl_object = JSON.parse(idl_string)
interface ComponentProps {
    tokensList: {
        account: AccountInfo<Buffer>;
        pubkey: PublicKey;
    }[] | undefined
}
const Make: FC<ComponentProps> = ({tokensList}) => {
    const { connection } = useConnection()
    const { publicKey } = useWallet()
    const anchorWallet = useAnchorWallet()
    const [tokens, setTokens] = useState<{
        account: AccountInfo<Buffer>;
        pubkey: PublicKey;
    }[]>()
    const [selectedToken, setSelectedToken] = useState<{
        pubkey: PublicKey,
        balance: Number
    }>()
    const [depositAmount, setDepositAmount] = useState(0)
    const [recieveAmount, setRecieveAmount] = useState(0)
    const [recieverMint, setRecieverMint] = useState("")
    const [loading, setLoading] = useState(false)
    useEffect(()=> {
        setLoading(false)
        setTokens(tokensList)
        setLoading(false)
    }, [tokensList])
    const createEscrow = async () => {
        if(!anchorWallet || !selectedToken) {return alert("Wallet not connected");}
        try {
            setLoading(true)
            const provider = new AnchorProvider(connection, anchorWallet)
            const program = new Program<AnchorEscrow>(idl_object, provider)
            
            const mintA = (await getAccount(connection, selectedToken?.pubkey)).mint
            // const takerAtaA = getAssociatedTokenAddressSync(mintA, new PublicKey(recieverWallet), false, TOKEN_PROGRAM_ID)
            // const [makerAtaB, takerAtaB] = [anchorWallet.publicKey, new PublicKey(recieverWallet)].map(pkey => (
            //     getAssociatedTokenAddressSync(new PublicKey(recieverMint), pkey, false, TOKEN_PROGRAM_ID)
            // ))
            const [escrow, _bump] = PublicKey.findProgramAddressSync(
                [Buffer.from("escrow"), anchorWallet.publicKey.toBuffer(), seed.toArrayLike(Buffer, "le", 8)],
                program.programId
            )
            const vault = getAssociatedTokenAddressSync(mintA, escrow, true, TOKEN_PROGRAM_ID)
            // const accounts = {
            //     maker: anchorWallet.publicKey,
            //     taker: new PublicKey(recieverWallet),
            //     mintA,
            //     mintB: new PublicKey(recieverMint),
            //     makerAtaA: selectedToken?.pubkey,
            //     takerAtaA,
            //     makerAtaB,
            //     takerAtaB,
            //     escrow,
            //     vault,
            //     tokenProgram: TOKEN_2022_PROGRAM_ID,
            // }
            let depositDecimal =  (await connection.getTokenAccountBalance(selectedToken.pubkey)).value.decimals
            let receiveDecimal =  (await connection.getTokenSupply(new PublicKey(recieverMint))).value.decimals
            console.log(selectedToken.pubkey.toString())
            const tx = await program.methods.make(seed, new BN(depositAmount*10**depositDecimal), new BN(recieveAmount*10**receiveDecimal))
            .accountsStrict({
                maker: anchorWallet.publicKey,
                makerAtaA: selectedToken?.pubkey,
                mintA,
                mintB: new PublicKey(recieverMint),
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                escrow,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                vault
            })
            // .accounts({
            //     makerAtaA: selectedToken?.pubkey,
            //     mintA,
            //     mintB: new PublicKey(recieverMint),
            //     tokenProgram: TOKEN_PROGRAM_ID,
            //     vault
            // })
            .rpc()
            console.log(tx)
            alert("Tx Successful. Check console for Txid")
            setLoading(false)
        } catch(e) {
            alert("Something went wrong. Check console for error")
            console.log(e)
            console.log(selectedToken.pubkey.toString())
            setLoading(false)
        }

    }
    
    return(
        <>
            <div className="Main-container">
                {anchorWallet ? <div className="Modal">
                    { tokens ?
                        <div className="Token-list">
                                <select name="Select token" defaultValue="--Select Token--" onChange={e => {
                                    (async() => {
                                        if(Number(e.target.value) === 0) {return}
                                        let balance = await connection.getTokenAccountBalance(new PublicKey(e.target.value))
                                        setSelectedToken({pubkey: new PublicKey(e.target.value), balance: Number(balance.value.amount)/10**balance.value.decimals})                                    
                                    })()
                                }}>
                                    <option value={0}>---Select Token---</option>
                                    {tokens.length && tokens.map((token, i) => (
                                        <option className="Token-item" key={i} value={token.pubkey.toString()}>
                                            {token.pubkey.toString().slice(0,5)}...{token.pubkey.toString().slice(token.pubkey.toString().length - 5)}
                                        </option>
                                    ))}
                                </select>
                                <span>Balance: {selectedToken?.balance.toString()}</span>
                        </div>
                        : <Loading />
                    }
                    {
                        selectedToken && 
                        <div className="Token-form">
                            <div>
                                <label htmlFor="deposit">Deposit amount</label>
                                <input id="deposit" type="number" onChange={e => setDepositAmount(Number(e.target.value))}/>
                            </div>
                            <div>
                                <label htmlFor="recievermint">Recieve Mint Address</label>
                                <input id="recievermint" type="text" onChange={e => setRecieverMint(e.target.value)}/>
                            </div>
                            <div>
                                <label htmlFor="recieve">Recieve amount</label>
                                <input id="recieve" type="number" onChange={e => setRecieveAmount(Number(e.target.value))}/>
                            </div>
                            <button className="Submit-form" onClick={createEscrow}>Create Escrow</button>
                        </div>
                    }
                </div>: <>Wallet not connected</>}
            </div>
            {loading && <Loading />}
        </>
    )
}

export default Make