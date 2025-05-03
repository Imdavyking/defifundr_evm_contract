// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/**
 * @title Lock
 * @dev A time-locked vault contract with optimized gas usage
 */
contract Lock {
    // Using immutable for variables that won't change after construction
    uint256 public immutable unlockTime;
    address payable public immutable owner;

    event Withdrawal(uint256 amount, uint256 when);

    /**
     * @dev Sets the unlock time and owner for this contract
     * @param _unlockTime Time when funds can be withdrawn (in unix timestamp)
     */
    constructor(uint256 _unlockTime) payable {
        require(
            block.timestamp < _unlockTime,
            "Unlock time should be in the future"
        );

        unlockTime = _unlockTime;
        owner = payable(msg.sender);
    }

    /**
     * @dev Withdraw all funds from the contract
     * Requirements:
     * - Current time must be after unlock time
     * - Caller must be the owner
     */
    function withdraw() public {
        // Check time condition with original error message
        if (block.timestamp < unlockTime) {
            revert("You can't withdraw yet");
        }
        
        // Check ownership with original error message
        if (msg.sender != owner) {
            revert("You aren't the owner");
        }
        
        uint256 amount = address(this).balance;
        
        // Emit event before state change to follow checks-effects-interactions pattern
        emit Withdrawal(amount, block.timestamp);
        
        // Transfer funds to owner using a more gas-efficient approach
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Transfer failed");
    }
}