import { createContext } from 'react';

/**
 * Creates the WalletContext.
 * 
 * This context provides a way to pass down wallet-related data (like the account,
 * signer, and connectWallet function) through the component tree without having
 * to pass props down manually at every level.
 * 
 * The initial value is `null` because when the app first loads, there is no
 * wallet information available until the user connects. The WalletProvider
 * component will be responsible for providing the actual value.
 */
export const WalletContext = createContext(null);