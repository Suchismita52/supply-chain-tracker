# Blockchain-Based Supply Chain Tracker

A decentralized application (DApp) that tracks a product's journey — from manufacturing to delivery — on the Ethereum blockchain. Every status change is permanently recorded and publicly verifiable, so no single party can alter or hide a product's history.

## Problem it solves

Traditional supply chain tracking relies on centralized databases that individual companies control and can edit or delete records from. This makes it hard for customers, auditors, or partners to fully trust a product's reported history (origin, handling, ownership changes).

This project stores that history on a public blockchain instead, so:
- Records are **immutable** — once written, an entry can never be changed or deleted.
- Records are **transparent** — anyone can look up a product's full history.
- Writes are **access-controlled** — only the contract owner (the account that deployed it) can register products or update their status.

## Tech stack

| Layer | Technology |
|---|---|
| Smart contract | Solidity ^0.8.0 |
| Blockchain network | Ethereum (Sepolia testnet) |
| Development environment | Remix IDE |
| Wallet / signing | MetaMask |
| Frontend | React (via CDN), ethers.js |

## How it works

1. **Add a product** — The contract owner registers a product with a unique ID and name. Its status starts as `"Manufactured"` and its first history entry is recorded.
2. **Update status** — As the product moves through the supply chain (e.g. `Shipped`, `Delivered`), the owner updates its status. Each update appends a new entry to the product's history — nothing is overwritten.
3. **View history** — Anyone can query a product by ID and retrieve its complete, timestamped history: every status, when it happened, and which wallet address made the change.

## Smart contract functions

| Function | Description | Who can call it |
|---|---|---|
| `addProduct(id, name)` | Registers a new product | Contract owner only |
| `updateStatus(id, status)` | Adds a new status entry | Contract owner only |
| `getHistory(id)` | Returns the full history array for a product | Anyone (read-only, free) |
| `products(id)` | Returns a product's current state | Anyone (read-only, free) |

## Project structure

```
supply-chain-tracker/
├── contracts/
│   └── SupplyChain.sol      # Smart contract source
├── frontend/
│   └── index.html           # Web UI to interact with the deployed contract
└── README.md
```

## How to run this project

### 1. Deploy the smart contract
1. Open [Remix IDE](https://remix.ethereum.org).
2. Create a new file and paste in `contracts/SupplyChain.sol`.
3. Compile it (Solidity Compiler tab).
4. Under **Deploy & Run Transactions**, set Environment to **Injected Provider / Browser Extension** and connect MetaMask.
5. Switch MetaMask to the **Sepolia test network** and make sure the account has test ETH (available from a Sepolia faucet).
6. Click **Deploy** and confirm the transaction in MetaMask.
7. Copy the deployed contract address.

### 2. Run the frontend
1. Open `frontend/index.html` in your browser (double-click it — no install needed, React and ethers.js load from a CDN).
2. Click **Connect Wallet**.
3. Paste in the deployed contract address.
4. Use the form to add products, update their status, and view history.

## Example usage

```
addProduct(1, "Wireless Mouse")
  → history: [{ status: "Manufactured", timestamp: ..., updatedBy: 0x566c...345f }]

updateStatus(1, "Shipped")
  → history: [
      { status: "Manufactured", ... },
      { status: "Shipped", ... }
    ]

getHistory(1)
  → returns the full array above
```

## Possible future improvements

- Role-based access control (separate `Manufacturer`, `Distributor`, `Retailer` roles instead of a single owner)
- Ownership transfer between wallets as a product changes hands
- QR code generation per product ID for easy lookup at physical checkpoints
- A dashboard view listing all registered products and their current status
- Deployment to a live (mainnet or L2) network

## Live deployment

- **Live app:** https://suchismita52.github.io/supply-chain-tracker/index.html
- **Deployed contract (Sepolia):** `0x4553c3415a258BCb2b3ac033a8c73c184F976dd5`
- **View on Sepolia Etherscan:** https://sepolia.etherscan.io/address/0x4553c3415a258BCb2b3ac033a8c73c184F976dd5

To try it yourself: open the live app link above, click **Connect Wallet**, paste in the contract address, and interact with it directly (make sure MetaMask is set to the Sepolia test network).

## Author

Built as a final-year blockchain project demonstrating smart contract development, DApp architecture, and Ethereum testnet deployment.
