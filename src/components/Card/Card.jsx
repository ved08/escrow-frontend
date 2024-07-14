import "./Card.css"

const Card = props => (
    <div className="Card" key={props.key}>
        <h2>Escrow: <a href={props.escrow}>{props.maker}</a></h2>
        <h5>Offered Token</h5>
        <p><a href={`https://explorer.solana.com/address/${props.mintAUrl}?cluster=devnet`}>{props.mintA}</a></p>
        <h5>Offered Amount</h5>
        <p>{props.makerAmount}</p>
        <h5>Requested Token</h5>
        <p><a href={`https://explorer.solana.com/address/${props.mintBUrl}?cluster=devnet`}>{props.mintB}</a></p>
        <h5>Requested Amount</h5>
        <p>{props.takerAmount}</p>
        <button className="Deal" onClick={props.deal}>Deal</button>
    </div>
)

export default Card