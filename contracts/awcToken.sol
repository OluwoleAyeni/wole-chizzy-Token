// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CustomToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18;
    uint256 public constant INITIAL_SUPPLY = (MAX_SUPPLY * 20) / 100;
    uint256 public constant ANNUAL_INFLATION = (MAX_SUPPLY * 5) / 100;
    uint256 public constant BURN_RATE = 2;
    uint256 public constant TREASURY_RATE = 15;
    address public treasury;

    event Burned(address indexed from, uint256 amount);
    event TreasuryAllocated(uint256 amount);
    event StakingRewardsMinted(uint256 amount);

    constructor(address _treasury) ERC20("CustomToken", "CTK") {
        treasury = _treasury;
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function _transfer(address sender, address recipient, uint256 amount) internal override {
        uint256 burnAmount = (amount * BURN_RATE) / 100;
        uint256 treasuryAmount = (amount * TREASURY_RATE) / 100;
        uint256 sendAmount = amount - burnAmount - treasuryAmount;

        super._transfer(sender, recipient, sendAmount);
        if (burnAmount > 0) {
            _burn(sender, burnAmount);
            emit Burned(sender, burnAmount);
        }
        if (treasuryAmount > 0) {
            super._transfer(sender, treasury, treasuryAmount);
            emit TreasuryAllocated(treasuryAmount);
        }
    }

    function mintStakingRewards() external onlyOwner {
        require(totalSupply() + ANNUAL_INFLATION <= MAX_SUPPLY, "Max supply exceeded");
        _mint(owner(), ANNUAL_INFLATION);
        emit StakingRewardsMinted(ANNUAL_INFLATION);
    }
}
