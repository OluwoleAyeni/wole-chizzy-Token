// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenVesting is Ownable {
    IERC20 public immutable token;
    uint256 public immutable start;
    uint256 public constant DURATION = 4 years;
    mapping(address => uint256) public allocations;
    mapping(address => uint256) public claimed;

    event TokensClaimed(address indexed beneficiary, uint256 amount);

    constructor(IERC20 _token) {
        token = _token;
        start = block.timestamp;
    }

    function setAllocation(address beneficiary, uint256 amount) external onlyOwner {
        allocations[beneficiary] = amount;
    }

    function claim() external {
        uint256 vested = (allocations[msg.sender] * (block.timestamp - start)) / DURATION;
        uint256 claimable = vested - claimed[msg.sender];
        require(claimable > 0, "No tokens to claim");

        claimed[msg.sender] += claimable;
        require(token.transfer(msg.sender, claimable), "Transfer failed");

        emit TokensClaimed(msg.sender, claimable);
    }
}
