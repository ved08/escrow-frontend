import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import {RiContractLine} from "react-icons/ri"
import "./Navbar.css"
const Navbar = () => (
    <div className="Navbar">
        <span><RiContractLine color="#EEF7FF" size={40}/>Escrow Contract</span>
        <WalletMultiButton />
    </div>
)
export default Navbar