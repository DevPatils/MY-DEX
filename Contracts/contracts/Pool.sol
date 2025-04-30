// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// LPToken contract
contract LPToken is ERC20 {
    address public pool;

    constructor() ERC20("Simple LP Token", "SLP") {}

    function setPool(address _pool) external {
        require(pool == address(0), "Pool already set");
        pool = _pool;
    }

    modifier onlyPool() {
        require(msg.sender == pool, "Not authorized");
        _;
    }

    function mint(address to, uint256 amount) external onlyPool {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyPool {
        _burn(from, amount);
    }
}

// SimpleLiquidityPool contract
contract SimpleLiquidityPool {
    address public tokenX;
    address public tokenY;
    LPToken public lpToken;
    
    uint public reserveX;
    uint public reserveY;
    uint public constant FEE_PERCENT = 3; // 0.3%

    constructor(address _tokenX, address _tokenY, address _lpToken) {
        require(_tokenX != _tokenY, "Tokens must differ");
        tokenX = _tokenX;
        tokenY = _tokenY;
        lpToken = LPToken(_lpToken);

    
        lpToken.setPool(address(this));
    }

    function _updateReserves() private {
        reserveX = IERC20(tokenX).balanceOf(address(this));
        reserveY = IERC20(tokenY).balanceOf(address(this));
    }

    function addLiquidity(uint amountX, uint amountY) external {
        require(amountX > 0 && amountY > 0, "Amounts must be > 0");

        IERC20(tokenX).transferFrom(msg.sender, address(this), amountX);
        IERC20(tokenY).transferFrom(msg.sender, address(this), amountY);

        uint liquidity;
        uint _totalSupply = lpToken.totalSupply();

        if (_totalSupply == 0) {
            liquidity = sqrt(amountX * amountY);
        } else {
            liquidity = min(
                (amountX * _totalSupply) / reserveX,
                (amountY * _totalSupply) / reserveY
            );
        }

        require(liquidity > 0, "Insufficient liquidity minted");
        lpToken.mint(msg.sender, liquidity);

        _updateReserves();
    }

    function removeLiquidity(uint lpAmount) external {
        require(lpAmount > 0, "Invalid LP amount");
        require(lpToken.balanceOf(msg.sender) >= lpAmount, "Not enough LP");

        uint _totalSupply = lpToken.totalSupply();

        uint xOut = (lpAmount * reserveX) / _totalSupply;
        uint yOut = (lpAmount * reserveY) / _totalSupply;

        lpToken.burn(msg.sender, lpAmount);

        IERC20(tokenX).transfer(msg.sender, xOut);
        IERC20(tokenY).transfer(msg.sender, yOut);

        _updateReserves();
    }

    function swapXForY(uint amountX) external {
        require(amountX > 0, "Amount must be > 0");
        IERC20(tokenX).transferFrom(msg.sender, address(this), amountX);

        uint amountXWithFee = amountX * (1000 - FEE_PERCENT) / 1000;
        uint amountY = (amountXWithFee * reserveY) / (reserveX + amountXWithFee);

        require(amountY > 0, "Insufficient output");
        IERC20(tokenY).transfer(msg.sender, amountY);

        _updateReserves();
    }

    function swapYForX(uint amountY) external {
        require(amountY > 0, "Amount must be > 0");
        IERC20(tokenY).transferFrom(msg.sender, address(this), amountY);

        uint amountYWithFee = amountY * (1000 - FEE_PERCENT) / 1000;
        uint amountX = (amountYWithFee * reserveX) / (reserveY + amountYWithFee);

        require(amountX > 0, "Insufficient output");
        IERC20(tokenX).transfer(msg.sender, amountX);
    
        _updateReserves();
    }


    function getReserves() external view returns (uint, uint) {
        return (reserveX, reserveY);
    }

    function sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function min(uint a, uint b) internal pure returns (uint) {
        return a < b ? a : b;
    }
    
}