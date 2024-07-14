# Project Deployment
[link here](https://escrow-frontend-hazel.vercel.app/)
# Project Demo
[loom video](https://www.loom.com/share/7851784b39174fb4bcba3bce10f28a0c?sid=77899211-41f8-4786-aeda-14c23b26642a)
# Overview
This frontend allows users to interact with an escrow contract on the blockchain. There are three main actions: creating, cancelling, and finalizing an escrow.
## Get Test Tokens
First, before interacting with the program, you can get yourself some test UDSC and EURC tokens from [here](https://faucet.circle.com/)
## Actions
1. Create Escrow
   - Click "Create Escrow" to open a modal.
   - Select a token and then enter the remaining details
   - Submit to create an escrow account
2. Cancel Escrow
   - Select an escrow transaction and click "Refund."
   - Confirm the transaction and amount will be refunded back to your wallet
3. Finalize Escrow
   - Select an escrow account from the list available
   - Once satisfied with a deal, click on "Deal" to finalize and swap tokens
# Run the project locally
- First clone the repo using: `git clone https://github.com/ved08/escrow-frontend.git`<br>
- Go into the project directory and install all dependencies: `yarn install`<br>
- Start the project locally: `yarn start`<br>
- To build the project: `yarn build`

    

`Note: This doesnt work for Token2022 tokens` 
