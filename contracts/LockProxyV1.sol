// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title Lock
 * @dev A time-locked vault contract with optimized gas usage
 */
contract LockProxyV1 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint256 public unlockTime;

    event Withdrawal(uint256 amount, uint256 when);

    function initialize(uint256 _unlockTime) public initializer {
        require(
            block.timestamp < _unlockTime,
            "Unlock time should be in the future"
        );
        unlockTime = _unlockTime;
        __UUPSUpgradeable_init();
        __Ownable_init(msg.sender);
    }

    /**
     * @dev Withdraw all funds from the contract
     * Requirements:
     * - Current time must be after unlock time
     * - Caller must be the owner
     */
    function withdraw() public {
        // Check ownership with original error message
        if (msg.sender != owner()) {
            revert("You aren't the owner");
        }
        // Check time condition with original error message
        if (block.timestamp < unlockTime) {
            revert("You can't withdraw yet");
        }

        uint256 amount = address(this).balance;

        // Emit event before state change to follow checks-effects-interactions pattern
        emit Withdrawal(amount, block.timestamp);

        // Transfer funds to owner using a more gas-efficient approach
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");
    }

    function version() public pure returns (string memory) {
        return "V1";
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
