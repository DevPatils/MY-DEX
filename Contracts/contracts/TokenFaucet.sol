// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract TokenFaucet{
    address public owner ;
    IERC20 public tokenx;
    IERC20 public tokeny;
    uint256 public amountPerClaim = 100 * 1e18; // 100 tokens
    uint256 public coolDown = 0;

    mapping(address => uint256) public lastClaimTimeX;
    mapping(address => uint256) public lastClaimTimeY;

    constructor(address _tokenx, address _tokeny) {
        owner = msg.sender;
        tokenx = IERC20(_tokenx);
        tokeny = IERC20(_tokeny);
    }

    function claimTokenx()external{
        require(block.timestamp >= lastClaimTimeX[msg.sender] + coolDown, "Please wait before claiming again");
        require(tokenx.balanceOf(address(this)) >= amountPerClaim, "Not enough tokens in faucet");
        lastClaimTimeX[msg.sender] = block.timestamp;
        tokenx.transfer(msg.sender, amountPerClaim);
    }
        function claimTokeny()external{
        require(block.timestamp >= lastClaimTimeY[msg.sender] + coolDown, "Please wait before claiming again");
        require(tokeny.balanceOf(address(this)) >= amountPerClaim, "Not enough tokens in faucet");
        lastClaimTimeY[msg.sender] = block.timestamp;
        tokeny.transfer(msg.sender, amountPerClaim);
    }
    function setAmountPerClaim(uint256 _amount) external {
        require(msg.sender == owner, "Only owner can set amount per claim");
        amountPerClaim = _amount;
    }
    function setCoolDown(uint256 _coolDown) external {
        require(msg.sender == owner, "Only owner can set cooldown");
        coolDown = _coolDown;
    }
    function withdrawTokens(address _token, uint256 _amount) external {
        require(msg.sender == owner, "Only owner can withdraw tokens");
        IERC20(_token).transfer(owner, _amount);
    }
    function getBalace() external view returns (uint256) {
        return tokenx.balanceOf(address(this));
    }
    function getBalnace() external view returns (uint256) {
        return tokeny.balanceOf(address(this));
    }
    
}