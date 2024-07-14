import {AnchorProvider, BN, Program} from "@coral-xyz/anchor"
import {
    useConnection,
    useWallet,
    useAnchorWallet,
} from "@solana/wallet-adapter-react"
import IDL from "../IDL/idl.json"
import { AnchorEscrow } from "../IDL/types"
import { useState } from "react"
import Make from "./Make"
import Refund from "./Refund"
import Take from "./Take"
import { FaPlus } from "react-icons/fa";
import { RiRefund2Line } from "react-icons/ri";
import { FaRegHandshake } from "react-icons/fa";
import "./Dashboard.css"
import Modal from "./Modal"
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, getMint } from "@solana/spl-token"
import { AccountInfo, PublicKey } from "@solana/web3.js"

const idl_string = JSON.stringify(IDL)

const PROGRAM_ID = "4c29QFHhggMgbRhJUHr67KTGeK5687XQ97dBepzusp2h"
const idl_object = JSON.parse(idl_string)

const Escrow = () => {
    type EscrowAccount = {
        escrow: PublicKey;
        mintA: PublicKey;
        mintB: PublicKey;
        seed: BN;
        recieve: BN;
        makerAmount: BN;
        maker: PublicKey;
    }
    const { connection } = useConnection()
    const { publicKey } = useWallet()
    const anchorWallet = useAnchorWallet()

    const [showCancelModal, setShowCancelModal] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showFinalizeModal, setShowFinalizeModal] = useState(false)
    const [takeDetails, setTakeDetails] = useState<(EscrowAccount | undefined)[]>()
    const[currentEscrowAccounts, setCurrentEscrowAccounts] = useState<(EscrowAccount | undefined)[]>()
    const [tokens, setTokens] = useState<{
        account: AccountInfo<Buffer>;
        pubkey: PublicKey;
    }[]>()

    const fetchAllTokens = async () => {
        if(publicKey) {
            const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
                programId: TOKEN_PROGRAM_ID
            })
            let tokenDetails = tokenAccounts.value.map(account => account)
            setTokens(tokenDetails)
        }
    }
    const getCurrentEscrowAccounts = async() => {
        if(!anchorWallet) {return;}
        const provider = new AnchorProvider(connection, anchorWallet)
        const program = new Program<AnchorEscrow>(idl_object, provider)
        const data = await program.account.escrow.all()
        const returnData: EscrowAccount[] = []
        for(let i =0;i<data.length;i++) {
            const decimal = (await connection.getTokenSupply(data[i].account.mintB)).value.decimals
            const y = getAssociatedTokenAddressSync(data[i].account.mintA, data[i].publicKey, true, TOKEN_PROGRAM_ID)
            const account = await connection.getTokenAccountBalance(y)
            const balance = Number(account.value.amount)/10**account.value.decimals
            console.log(balance)
            if(data[i].account.maker.toString() == anchorWallet.publicKey.toString()){
                const x: EscrowAccount = {
                    escrow: data[i].publicKey,
                    mintA: data[i].account.mintA,
                    mintB: data[i].account.mintB,
                    seed: data[i].account.seed,
                    recieve: data[i].account.receive/10**decimal,
                    makerAmount: balance,
                    maker: data[i].account.maker
                }
                returnData.push(x)
            }
        }

        setCurrentEscrowAccounts(returnData)
    }
    const getCurrentEscrowAccountsForDeal = async() => {
        if(!anchorWallet) {return;}
        const provider = new AnchorProvider(connection, anchorWallet)
        const program = new Program<AnchorEscrow>(idl_object, provider)
        // setProgram(program)
        const data = await program.account.escrow.all();
        let escrowAccounts: EscrowAccount[] = []
        for(let i=0;i<data.length;i++) {
            const y = getAssociatedTokenAddressSync(data[i].account.mintA, data[i].publicKey, true, TOKEN_PROGRAM_ID)
            const account = await connection.getTokenAccountBalance(y)
            const balance = Number(account.value.amount)/10**account.value.decimals
            const mintInfoB = await getMint(connection, data[i].account.mintB)
            const recieveAmt = data[i].account.receive/10**mintInfoB.decimals
            escrowAccounts.push({
                escrow: data[i].publicKey,
                mintA: data[i].account.mintA,
                mintB: data[i].account.mintB,
                seed: data[i].account.seed,
                recieve: recieveAmt,
                makerAmount: balance,
                maker: data[i].account.maker,
            })
        }
        setTakeDetails(escrowAccounts)
    }
    const toggleCancel = async () => {
        setShowCancelModal(!showCancelModal)
        await getCurrentEscrowAccounts()
    }
    const toggleCreate = async () => {
        setShowCreateModal(!showCreateModal)
        await fetchAllTokens()
    }
    const toggleFinalize = async () => {
        setShowFinalizeModal(!showFinalizeModal)
        await getCurrentEscrowAccountsForDeal()
    }
    return(
        <div className="Dashboard-container">
            <h1>Escrow Contract</h1>
            <p>Securely swap your tokens using escrow contract</p>
            <div className="Dashboard">

            <div className="Instruction-card" onClick={toggleCreate}>
                <FaPlus size={30} color="#EEC3E8"/>
                <h2>Create Escrow</h2>
            </div>
            <div className="Instruction-card" onClick={toggleCancel}>
                <RiRefund2Line size={40} color="#EEC3E8"/>
                <h2>Cancel Escrow</h2>
            </div>
            <div className="Instruction-card" onClick={toggleFinalize}>
                <FaRegHandshake size={40} color="#EEC3E8"/>
                <h2>Finalize Escrow</h2>
            </div>
            <Modal show={showCreateModal} onClose={toggleCreate} title="Start an Escrow">
                <Make tokensList={tokens}/>
            </Modal>
            <Modal show={showCancelModal} onClose={toggleCancel} title="Cancel an Escrow">
                <Refund currentEscrows={currentEscrowAccounts}/>
            </Modal>
            <Modal show={showFinalizeModal} onClose={toggleFinalize} title="Finalize an Escrow">
                <Take takeDetails={takeDetails}/>
            </Modal>
            </div>
        </div>
    )
}

export default Escrow