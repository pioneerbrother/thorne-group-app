// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title StrategicIntelPass
 * @author The Thorne Group
 * @notice An ERC721 token contract where each NFT serves as an exclusive access pass
 * to The Thorne Group's intelligence briefs. The mint price is fixed but can
 * be updated by the contract owner.
 */
contract StrategicIntelPass is ERC721, Ownable {
    // --- State Variables ---

    uint256 public mintPrice; // The price to mint one pass, denominated in USDC with 6 decimals.
    uint256 public constant MAX_SUPPLY = 100; // A low, exclusive number of passes.
    uint256 public mintedCount; // Tracks the number of passes minted so far.

    IERC20 public immutable usdcToken; // The USDC token contract instance.
    address public treasuryWallet; // The wallet where minting proceeds will be sent.

    // --- Custom Errors for Clarity and Gas Efficiency ---

    error MaxSupplyReached();
    error PaymentRequired(uint256 required, uint256 received);
    error TransferFailed();
    error InvalidAddress();

    // --- Events ---

    event PassMinted(address indexed to, uint256 indexed tokenId, uint256 pricePaid);
    event PriceUpdated(uint256 newPrice);
    event TreasuryUpdated(address newTreasury);

    // --- Constructor ---

    constructor(address initialOwner, address _usdcTokenAddress, address _treasuryWallet)
        ERC721("Thorne Group Strategic Intel Pass", "SIP") // NFT Name and Symbol
        Ownable(initialOwner)
    {
        if (_usdcTokenAddress == address(0) || _treasuryWallet == address(0)) {
            revert InvalidAddress();
        }
        usdcToken = IERC20(_usdcTokenAddress);
        treasuryWallet = _treasuryWallet;
        
        // Set the high-value initial price: 100,000 USDC
        // USDC has 6 decimals, so we multiply by 10^6.
        mintPrice = 100_000 * (10**6);
    }

    // --- Core Public Function: Minting ---

    /**
     * @notice Mints one Strategic Intel Pass NFT to the specified address.
     * @dev The caller (msg.sender) must have first approved this contract to spend
     *      at least `mintPrice` of their USDC tokens.
     * @param to The address that will receive the newly minted NFT.
     */
    function mint(address to) public {
        if (mintedCount >= MAX_SUPPLY) revert MaxSupplyReached();

        // Securely transfer the payment from the caller to the treasury.
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < mintPrice) revert PaymentRequired(mintPrice, allowance);

        bool success = usdcToken.transferFrom(msg.sender, treasuryWallet, mintPrice);
        if (!success) revert TransferFailed();

        // If payment is successful, mint the NFT.
        uint256 newTokenId = mintedCount; // Use the current count as the new unique token ID.
        _safeMint(to, newTokenId);
        
        mintedCount++; // Increment the counter after a successful mint.

        emit PassMinted(to, newTokenId, mintPrice);
    }

    // --- Administrative Functions (Owner Only) ---

    /**
     * @notice Allows the contract owner to update the mint price.
     * @param _newPrice The new price in USDC's smallest unit (e.g., for $50, enter 50 * 10**6).
     */
    function setMintPrice(uint256 _newPrice) public onlyOwner {
        mintPrice = _newPrice;
        emit PriceUpdated(_newPrice);
    }

    /**
     * @notice Allows the contract owner to update the treasury wallet address.
     * @param _newTreasury The new address to receive minting proceeds.
     */
    function setTreasury(address _newTreasury) public onlyOwner {
        if (_newTreasury == address(0)) revert InvalidAddress();
        treasuryWallet = _newTreasury;
        emit TreasuryUpdated(_newTreasury);
    }
    
    // --- Metadata Handling (Optional but Recommended) ---
    // This allows your NFTs to have names and images on marketplaces like OpenSea.
    string private _baseTokenURI;

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string calldata newBaseURI) public onlyOwner {
        _baseTokenURI = newBaseURI;
    }
}