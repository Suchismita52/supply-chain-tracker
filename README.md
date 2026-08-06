## Why this design

A single-owner system (where one wallet can do everything) is easy to build but doesn't reflect how supply chains actually work — different companies handle different stages, and none of them should be able to perform another's role. Enforcing this with `onlyRole` modifiers means the rules live in the contract itself, not in a policy document that could be ignored.

## Possible future improvements

- Multiple manufacturers/distributors/retailers competing or collaborating on the same product
- QR code generation per product ID for lookup at physical checkpoints
- Time-based alerts if a product stays "Shipped" too long without being delivered
- A public verification page for end customers to check authenticity before purchase

## Live deployment

- **Live app:** https://suchismita52.github.io/supply-chain-tracker/index.html
- **Deployed contract (Sepolia):** `0x7a47A253e566Df381Ae4f563AD5283c97DE757e2`
- **View on Sepolia Etherscan:** https://sepolia.etherscan.io/address/0x7a47A253e566Df381Ae4f563AD5283c97DE757e2

## Author

Built as a final-year blockchain project demonstrating smart contract development, role-based access control, and full-stack DApp architecture.
