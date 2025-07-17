import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import ReactMarkdown from 'react-markdown';

// Corrected relative paths
import { WalletContext } from '../contexts/WalletContext.jsx';
import PremiumAccessPassABI_file from '../abis/PremiumAccessPass.json';
import ERC20ABI_file from '../abis/ERC20.json';

import './AccessPortal.css';

// Extract ABI arrays
const PremiumAccessPassABI = PremiumAccessPassABI_file.abi;
const ERC20ABI = ERC20ABI_file.abi;

// Configuration
const premiumPassNFTAddress = import.meta.env.VITE_PREMIUM_PASS_NFT_ADDRESS;
const usdcAddress = import.meta.env.VITE_USDC_ADDRESS;
const publicRpcUrl = import.meta.env.VITE_PUBLIC_POLYGON_RPC_URL || "https://polygon-rpc.com/";

// Import post data from the config file
import PREMIUM_POSTS from '../config/premiumPosts.json';


function AccessPortal() {
    const navigate = useNavigate();
    
    // --- THIS IS THE FIX ---
    // We get the whole context object first and check if it's null.
    const walletData = useContext(WalletContext);
    
    // If the context is not yet available, we can't destructure it.
    // Return a loading state or null until the provider has mounted.
    if (!walletData) {
        return <div className="portal-container"><p>Initializing Wallet Provider...</p></div>;
    }
    // Now that we know walletData is not null, we can safely destructure it.
    const { signer, account, chainId, connectWallet } = walletData;
    // --- END OF FIX ---


    const [isLoading, setIsLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [feedback, setFeedback] = useState("");
    
    const [premiumPassPrice, setPremiumPassPrice] = useState("...");
    const [premiumPassMintedCount, setPremiumPassMintedCount] = useState(0);
    const [premiumPassMaxSupply, setPremiumPassMaxSupply] = useState(0);

    const [selectedPost, setSelectedPost] = useState(null);
    const [postContent, setPostContent] = useState("");

    useEffect(() => {
        if (!account) {
            setIsLoading(false);
            setFeedback("Please connect your wallet to verify access credentials.");
            return;
        }

        const checkAccess = async () => {
            setIsLoading(true);
            setFeedback("Verifying access credentials...");
            if (!premiumPassNFTAddress) {
                setFeedback("Configuration error: Premium Pass address not set.");
                setIsLoading(false);
                return;
            }

            try {
                const readOnlyProvider = new ethers.JsonRpcProvider(publicRpcUrl);
                const premiumPassContract = new ethers.Contract(premiumPassNFTAddress, PremiumAccessPassABI, readOnlyProvider);

                const price = await premiumPassContract.mintPrice();
                const minted = await premiumPassContract.mintedCount();
                const maxSupply = await premiumPassContract.MAX_SUPPLY();
                setPremiumPassPrice(ethers.formatUnits(price, 6));
                setPremiumPassMintedCount(Number(minted));
                setPremiumPassMaxSupply(Number(maxSupply));

                const balance = await premiumPassContract.balanceOf(account);
                if (Number(balance) > 0) {
                    setHasAccess(true);
                    setFeedback("");
                    if (PREMIUM_POSTS.length > 0) {
                        handlePostSelect(PREMIUM_POSTS[0]);
                    }
                } else {
                    setHasAccess(false);
                    setFeedback("A Strategic Intel Pass is required for access.");
                }
            } catch (error) {
                console.error("Error verifying access:", error);
                setFeedback("Could not verify access. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        checkAccess();
    }, [account]);

    const handleMintPremiumPass = async () => {
        if (!signer) { setFeedback("Please connect your wallet first."); return; }
        if (chainId !== 137) { setFeedback("Error: Please switch to the Polygon Mainnet."); return; }
        setIsLoading(true);
        setFeedback("Preparing transaction...");
        try {
            const premiumPassContract = new ethers.Contract(premiumPassNFTAddress, PremiumAccessPassABI, signer);
            const usdcContract = new ethers.Contract(usdcAddress, ERC20ABI, signer);
            const price = await premiumPassContract.mintPrice();
            
            setFeedback(`Requesting approval to spend ${ethers.formatUnits(price, 6)} USDC...`);
            const approveTx = await usdcContract.approve(premiumPassNFTAddress, price);
            await approveTx.wait();
            
            setFeedback("Minting your Strategic Intel Pass...");
            const mintTx = await premiumPassContract.mint(account);
            await mintTx.wait();
            
            setFeedback("🎉 Success! Access granted. Loading briefs...");
            setHasAccess(true);
            if (PREMIUM_POSTS.length > 0) {
                handlePostSelect(PREMIUM_POSTS[0]);
            }
        } catch (error) {
            console.error("Strategic Intel Pass mint failed:", error);
            setFeedback(error?.reason || "Transaction failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePostSelect = async (post) => {
        if (!post || !post.cid) return;
        setSelectedPost(post);
        setPostContent("Loading brief...");
        try {
            const response = await fetch(`https://ipfs.io/ipfs/${post.cid}`);
            if (!response.ok) throw new Error("Network response was not ok.");
            const markdown = await response.text();
            setPostContent(markdown);
        } catch (error) {
            console.error("Failed to fetch post from IPFS:", error);
            setPostContent("## Error\nCould not load the selected brief.");
        }
    };

    const isSoldOut = premiumPassMaxSupply > 0 && premiumPassMintedCount >= premiumPassMaxSupply;

    const renderPaywall = () => (
        <div className="mint-section">
            <p>{feedback}</p>
            <div className="mint-info">
                <div className="info-item">
                    <span className="info-label">Acquisition Cost</span>
                    <span className="info-value">{premiumPassPrice} USDC</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Passes Remaining</span>
                    <span className="info-value">{premiumPassMaxSupply - premiumPassMintedCount} / {premiumPassMaxSupply}</span>
                </div>
            </div>
            <button className="mint-button" onClick={handleMintPremiumPass} disabled={isLoading || isSoldOut}>
                {isLoading ? "Processing..." : isSoldOut ? "ALL PASSES ISSUED" : "Acquire Intel Pass"}
            </button>
        </div>
    );

    const renderContentReader = () => (
        <div className="content-reader">
            <aside className="sidebar">
                <h3>Intelligence Briefs</h3>
                <ul>
                    {PREMIUM_POSTS.map(post => (
                        <li 
                            key={post.id} 
                            className={selectedPost?.id === post.id ? 'active' : ''}
                            onClick={() => handlePostSelect(post)}
                        >
                            {post.title}
                        </li>
                    ))}
                </ul>
            </aside>
            <main className="main-content">
                {postContent ? (
                    <ReactMarkdown children={postContent} />
                ) : (
                    <h1>Select a brief to read.</h1>
                )}
            </main>
        </div>
    );


    return (
        <div className="portal-container">
            <div className="portal-box">
                <h2 className="portal-header">Thorne Group // Secure Access Portal</h2>
                
                {isLoading ? (
                    <p className="feedback-text">{feedback || "Loading..."}</p>
                ) : !account ? (
                    <div className="connect-wallet-prompt">
                        <p>{feedback}</p>
                        <button className="connect-button" onClick={connectWallet}>Connect Wallet</button>
                    </div>
                ) : (
                    hasAccess ? renderContentReader() : renderPaywall()
                )}
            </div>
        </div>
    );
}

export default AccessPortal;