// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    struct Product {
        uint id;
        string name;
        string status;
        address currentOwner;
    }

    struct History {
        string status;
        uint timestamp;
        address updatedBy;
    }

    mapping(uint => Product) public products;
    mapping(uint => History[]) public productHistory;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function addProduct(uint _id, string memory _name) public onlyOwner {
        products[_id] = Product(_id, _name, "Manufactured", msg.sender);
        productHistory[_id].push(History("Manufactured", block.timestamp, msg.sender));
    }

    function updateStatus(uint _id, string memory _status) public onlyOwner {
        products[_id].status = _status;
        products[_id].currentOwner = msg.sender;

        productHistory[_id].push(
            History(_status, block.timestamp, msg.sender)
        );
    }

    function getHistory(uint _id) public view returns (History[] memory) {
        return productHistory[_id];
    }
}
