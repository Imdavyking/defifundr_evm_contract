import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Lock Contract Gas Optimization", function () {
    // Gas budget constraints for critical functions
    const GAS_BUDGETS = {
        deploy: 300000,
        withdraw: 80000, // Increased budget to account for separate condition checks
    };

    // Helper function to calculate gas used
    async function getGasUsed(tx: any): Promise<number> {
        const receipt = await tx.wait();
        if (!receipt || receipt.gasUsed === undefined) {
            throw new Error("Receipt or gasUsed not available");
        }

        if (typeof receipt.gasUsed === 'bigint') {
            return Number(receipt.gasUsed);
        } else if (receipt.gasUsed && typeof receipt.gasUsed.toNumber === 'function') {
            return receipt.gasUsed.toNumber();
        } else {
            // Fallback to string conversion then number
            return Number(receipt.gasUsed.toString());
        }
    }

    // Fixture pattern for efficient testing
    async function deployLockFixture() {
        const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
        const currentTime = await time.latest();
        const unlockTime = currentTime + ONE_YEAR_IN_SECS;

        const [owner, otherAccount] = await ethers.getSigners();

        // Measure deployment gas cost
        const Lock = await ethers.getContractFactory("Lock");
        const deployTx = await Lock.getDeployTransaction(unlockTime, { value: ethers.parseEther("1") });
        const estimatedGas = await ethers.provider.estimateGas(deployTx);

        // Convert to number for comparison if needed
        let gasNumber: number;
        if (typeof estimatedGas === 'bigint') {
            gasNumber = Number(estimatedGas);
        } else if (estimatedGas && typeof (estimatedGas as any).toNumber === 'function') {
            gasNumber = (estimatedGas as any).toNumber();
        } else {
            // Fallback to string conversion
            gasNumber = Number(estimatedGas);
        }

        // Check against gas budget
        expect(gasNumber).to.be.at.most(
            GAS_BUDGETS.deploy,
            `Deployment gas exceeds budget of ${GAS_BUDGETS.deploy}`
        );

        // Check against gas budget
        expect(gasNumber).to.be.at.most(
            GAS_BUDGETS.deploy,
            `Deployment gas exceeds budget of ${GAS_BUDGETS.deploy}`
        );

        // Deploy the contract
        const lock = await Lock.deploy(unlockTime, { value: ethers.parseEther("1") });
        await lock.waitForDeployment();

        return { lock, unlockTime, owner, otherAccount };
    }

    describe("Gas Usage Benchmarks", function () {
        it("Should deploy within gas budget", async function () {
            await loadFixture(deployLockFixture);
            // Gas validation already done in the fixture
        });

        it("Withdraw function should stay within gas budget", async function () {
            const { lock, owner } = await loadFixture(deployLockFixture);

            // Increase time to unlock period
            await time.increase(365 * 24 * 60 * 60 + 1);

            // Measure withdraw function gas usage
            const withdrawTx = await lock.connect(owner).withdraw();
            const gasUsed = await getGasUsed(withdrawTx);

            // Log gas usage for reporting in CI pipeline
            console.log(`Withdraw gas usage: ${gasUsed}`);

            // Check against gas budget
            expect(gasUsed).to.be.at.most(
                GAS_BUDGETS.withdraw,
                `Withdraw gas exceeds budget of ${GAS_BUDGETS.withdraw}`
            );
        });
    });

    describe("Gas Optimization Verification", function () {
        it("Should use gas-efficient techniques", async function () {
            const { lock } = await loadFixture(deployLockFixture);

            // Get contract bytecode to verify optimizations
            const address = await lock.getAddress();
            const bytecode = await ethers.provider.getCode(address);

            // Check bytecode length as a proxy for optimization
            console.log(`Contract bytecode length: ${bytecode.length / 2 - 1} bytes`);
            expect(bytecode.length / 2 - 1).to.be.lessThan(1000, "Contract bytecode too large");
        });
    });

    describe("Regression Testing", function () {
        it("Should maintain functionality with optimizations", async function () {
            const { lock, unlockTime, owner, otherAccount } = await loadFixture(deployLockFixture);

            // Test that core functionality still works
            expect(await lock.unlockTime()).to.equal(unlockTime);
            expect(await lock.owner()).to.equal(owner.address);

            // Ensure we can't withdraw before time
            await expect(lock.withdraw()).to.be.revertedWith("You can't withdraw yet");

            // Ensure non-owner can't withdraw
            await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith("You aren't the owner");

            // Increase time to unlock period
            await time.increase(365 * 24 * 60 * 60 + 1);

            // Ensure owner can withdraw after time
            await expect(lock.connect(owner).withdraw()).to.not.be.reverted;
        });
    });
});