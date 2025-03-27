const { ethers } = require("hardhat");

async function main() {
    const [deployer, founder1, founder2, founder3] = await ethers.getSigners();

    console.log("Deploying contracts with:", deployer.address);

    // Deploy CustomToken
    const CustomToken = await ethers.getContractFactory("CustomToken");
    const token = await CustomToken.deploy(deployer.address);
    await token.deployed();
    console.log(`✅ CustomToken deployed at: ${token.address}`);

    // Deploy TokenVesting
    const TokenVesting = await ethers.getContractFactory("TokenVesting");
    const vesting = await TokenVesting.deploy(token.address);
    await vesting.deployed();
    console.log(`✅ TokenVesting deployed at: ${vesting.address}`);

    // Transfer vesting tokens to vesting contract
    const vestingSupply = ethers.utils.parseEther("300000"); // 100,000 per founder
    const transferTx = await token.transfer(vesting.address, vestingSupply);
    await transferTx.wait();
    console.log(`💸 Transferred ${vestingSupply} tokens to vesting contract`);

    // Set allocations
    const alloc = ethers.utils.parseEther("100000"); // Per founder
    await vesting.setAllocation(founder1.address, alloc);
    await vesting.setAllocation(founder2.address, alloc);
    await vesting.setAllocation(founder3.address, alloc);
    console.log("🧾 Founder allocations set");

    // (Optional) Mint staking rewards
    const mintTx = await token.connect(deployer).mintStakingRewards();
    await mintTx.wait();
    console.log("🎁 Staking rewards minted");

    console.log("✅ Deployment complete");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

