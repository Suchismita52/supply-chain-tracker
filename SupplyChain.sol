// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {

    address public admin;

    enum Role { None, Manufacturer, Distributor, Retailer }

    struct Product {
        uint id;
        string name;
        string status;
        address currentHandler;
        bool exists;
    }

    struct History {
        string status;
        uint timestamp;
        address updatedBy;
    }

    mapping(address => Role) public roles;
    mapping(uint => Product) public products;
    mapping(uint => History[]) public productHistory;
    uint[] public productIds;

    event RoleAssigned(address indexed user, Role role);
    event ProductAdded(uint indexed id, string name, address indexed manufacturer, uint timestamp);
    event StatusUpdated(uint indexed id, string status, address indexed updatedBy, uint timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can do this");
        _;
    }

    modifier onlyRole(Role _role) {
        require(roles[msg.sender] == _role, "You do not have permission for this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // Admin assigns roles to wallet addresses
    function assignRole(address _user, Role _role) public onlyAdmin {
        roles[_user] = _role;
        emit RoleAssigned(_user, _role);
    }

    // Only a Manufacturer can register a new product
    function addProduct(uint _id, string memory _name) public onlyRole(Role.Manufacturer) {
        require(!products[_id].exists, "Product ID already exists");

        products[_id] = Product({
            id: _id,
            name: _name,
            status: "Manufactured",
            currentHandler: msg.sender,
            exists: true
        });

        productIds.push(_id);
        productHistory[_id].push(History("Manufactured", block.timestamp, msg.sender));

        emit ProductAdded(_id, _name, msg.sender, block.timestamp);
    }

    // Distributor marks a product as shipped/in transit
    function markShipped(uint _id) public onlyRole(Role.Distributor) {
        require(products[_id].exists, "Product does not exist");

        products[_id].status = "Shipped";
        products[_id].currentHandler = msg.sender;
        productHistory[_id].push(History("Shipped", block.timestamp, msg.sender));

        emit StatusUpdated(_id, "Shipped", msg.sender, block.timestamp);
    }

    // Retailer marks a product as delivered
    function markDelivered(uint _id) public onlyRole(Role.Retailer) {
        require(products[_id].exists, "Product does not exist");

        products[_id].status = "Delivered";
        products[_id].currentHandler = msg.sender;
        productHistory[_id].push(History("Delivered", block.timestamp, msg.sender));

        emit StatusUpdated(_id, "Delivered", msg.sender, block.timestamp);
    }

    function getHistory(uint _id) public view returns (History[] memory) {
        return productHistory[_id];
    }

    function getProduct(uint _id) public view returns (Product memory) {
        require(products[_id].exists, "Product does not exist");
        return products[_id];
    }

    function getAllProductIds() public view returns (uint[] memory) {
        return productIds;
    }

    function getMyRole() public view returns (Role) {
        return roles[msg.sender];
    }
}
