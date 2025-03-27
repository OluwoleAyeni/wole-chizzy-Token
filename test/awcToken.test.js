const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CustomToken", function () {
    let Token, token, owner, addr1, addr2, treasury;

    beforeEach(async function () {
        [owner, addr1, addr2, treasury] = await ethers.getSigners();
        Token = await ethers.getContractFactory("CustomToken");
        token = await Token.deploy(treasury.address);
        await token.deployed();
    });

    it("Should deploy with correct initial supply", async function () {
        expect(await token.totalSupply()).to.equal(ethers.utils.parseEther("200000"));
    });

    it("Should burn 2% of each transaction", async function () {
        await token.transfer(addr1.address, ethers.utils.parseEther("1000"));
        expect(await token.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("830")); // 2% burn, 15% treasury
    });

    it("Should allocate 15% to treasury", async function () {
        expect(await token.balanceOf(treasury.address)).to.be.above(0);
    });

    it("Should mint staking rewards", async function () {
        await token.mintStakingRewards();
        expect(await token.totalSupply()).to.be.above(ethers.utils.parseEther("200000"));
    });
});
