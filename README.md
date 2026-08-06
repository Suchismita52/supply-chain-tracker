# Blockchain-Based Supply Chain Tracker (Role-Based)

A decentralized application (DApp) that tracks a product's journey through a supply chain — from manufacturing to final delivery — on the Ethereum blockchain. Access is role-based: only the correct party in the chain can perform each step, and every action is permanently recorded and publicly verifiable.

## Problem it solves

Traditional supply chain systems rely on centralized databases controlled by individual companies, where records can be edited, hidden, or disputed. There is also usually no clear, enforced separation of who is allowed to do what at each stage.

This project solves both problems using a smart contract:
- **Immutability** — once a status is recorded, it can never be changed or deleted.
- **Transparency** — anyone can look up a product's full history.
- **Role-based access control** — the contract enforces who can do what:
  - Only a **Manufacturer** can register a new product
  - Only a **Distributor** can mark it as shipped
  - Only a **Retailer** can mark it as delivered
  - Only the **Admin** (contract deployer) can assign these roles to wallet addresses

This mirrors how a real supply chain works — each party has a distinct responsibility, and the code enforces that boundary instead of relying on trust.

## Tech stack

| Layer | Technology |
|---|---|
| Smart contract | Solidity ^0.8.0 |
| Blockchain network | Ethereum (Sepolia testnet) |
| Development environment | Remix IDE |
| Wallet / signing | MetaMask |
| Frontend | React (via CDN), ethers.js |
| Hosting | GitHub Pages |

## Roles

| Role | Can do |
|---|---|
| Admin | Assign roles to wallet addresses |
| Manufacturer | Register new products |
| Distributor | Mark a product as "Shipped" |
| Retailer | Mark a product as "Delivered" |
| Anyone (no role needed) | View any product's history |

## Smart contract functions

| Function | Description | Who can call it |
|---|---|---|
| `assignRole(address, role)` | Assigns a role to a wallet address | Admin only |
| `addProduct(id, name)` | Registers a new product with status "Manufactured" | Manufacturer only |
| `markShipped(id)` | Updates status to "Shipped" | Distributor only |
| `markDelivered(id)` | Updates status to "Delivered" | Retailer only |
| `getHistory(id)` | Returns the full timestamped history of a product | Anyone (read-only, free) |
| `getProduct(id)` | Returns a product's current state | Anyone (read-only, free) |
| `getAllProductIds()` | Returns every registered product ID | Anyone (read-only, free) |
| `getMyRole()` | Returns the caller's own assigned role | Anyone (read-only, free) |

The contract also emits `RoleAssigned`, `ProductAdded`, and `StatusUpdated` events so external tools could listen for changes in real time instead of repeatedly polling the blockchain.

## Project structure
