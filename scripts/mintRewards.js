const { ethers } = require("hardhat");

async function main() {
    const [owner] = await ethers.getSigners();

    const tokenAddress = "YOUR_DEPLOYED_TOKEN_ADDRESS";
    const Token = await ethers.getContractAt("CustomToken", tokenAddress);

    const tx = await Token.connect(owner).mintStakingRewards();
    await tx.wait();

    console.log("Staking rewards minted successfully.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
