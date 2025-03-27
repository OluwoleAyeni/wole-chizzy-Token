const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("TokenVesting", function () {
    let token, vesting, owner, founder1, founder2;
    const totalAllocation = ethers.utils.parseEther("100000"); // 100,000 tokens

    beforeEach(async function () {
        [owner, founder1, founder2] = await ethers.getSigners();

        // Deploy test ERC20 token
        const Token = await ethers.getContractFactory("CustomToken");
        token = await Token.deploy(owner.address);
        await token.deployed();

        // Deploy vesting contract
        const Vesting = await ethers.getContractFactory("TokenVesting");
        vesting = await Vesting.deploy(token.address);
        await vesting.deployed();

        // Transfer tokens to vesting contract
        await token.transfer(vesting.address, totalAllocation);

        // Set allocations
        await vesting.setAllocation(founder1.address, ethers.utils.parseEther("50000")); // 50%
        await vesting.setAllocation(founder2.address, ethers.utils.parseEther("50000")); // 50%
    });

    it("should allow the owner to set allocations", async function () {
        const allocation = await vesting.allocations(founder1.address);
        expect(allocation).to.equal(ethers.utils.parseEther("50000"));
    });

    it("should not allow non-owners to set allocations", async function () {
        await expect(
            vesting.connect(founder1).setAllocation(founder1.address, 1000)
        ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should not allow immediate claim after deployment", async function () {
        await expect(vesting.connect(founder1).claim()).to.be.revertedWith("No tokens to claim");
    });

    it("should release tokens gradually over time", async function () {
        // Advance 1 year
        await time.increase(365 * 24 * 60 * 60);

        // Founder1 claims tokens
        const tx = await vesting.connect(founder1).claim();
        const receipt = await tx.wait();

        const vested = ethers.utils.parseEther("12500"); // 25% of 50,000
        const balance = await token.balanceOf(founder1.address);

        expect(balance).to.equal(vested);
        expect(receipt.events[0].event).to.equal("TokensClaimed");
        expect(receipt.events[0].args.amount).to.equal(vested);
    });

    it("should not allow claiming more than vested", async function () {
        await time.increase(365 * 24 * 60 * 60); // 1 year
        await vesting.connect(founder1).claim();

        // Try to claim again immediately
        await expect(vesting.connect(founder1).claim()).to.be.revertedWith("No tokens to claim");
    });

    it("should allow claiming full amount after 4 years", async function () {
        await time.increase(4 * 365 * 24 * 60 * 60); // 4 years
        await vesting.connect(founder1).claim();

        const balance = await token.balanceOf(founder1.address);
        expect(balance).to.equal(ethers.utils.parseEther("50000"));
    });

    it("should update claimed amount after each claim", async function () {
        await time.increase(2 * 365 * 24 * 60 * 60); // 2 years
        await vesting.connect(founder1).claim();

        const claimed = await vesting.claimed(founder1.address);
        expect(claimed).to.be.closeTo(ethers.utils.parseEther("25000"), ethers.utils.parseEther("0.1"));
    });
});
