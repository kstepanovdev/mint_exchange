import { 
    // clusterApiUrl, 
//     Connection, 
//     PublicKey, 
    Keypair, 
//     LAMPORTS_PER_SOL, 
    Transaction, 
    SystemProgram,
    PublicKey,
    // TransactionInstruction
//     sendAndConfirmTransaction, 
//     TransactionInstruction
} from '@solana/web3.js';
import { 
    createAssociatedTokenAccountInstruction,
    createInitializeMintInstruction,
    createMint, 
    getAssociatedTokenAddress, 
    // mintTo, 
    // Account, 
    // createSetAuthorityInstruction, 
    // AuthorityType,
    // getOrCreateAssociatedTokenAccount
} from '@solana/spl-token';
import { programID } from "./utils/config";
// import { 
//     WalletDialogProvider 
// } from "@solana/wallet-adapter-material-ui";
// import { 
//     PhantomWalletAdapter 
// } from "@solana/wallet-adapter-wallets";
// import {
//     ConnectionProvider,
//     WalletProvider,
//     Wallet
// } from "@solana/wallet-adapter-react";
import idl from "./mint_exchange.json";

import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
    MINT_SIZE,
    TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import React, { FC, useCallback } from 'react';
import { Program, AnchorProvider, getProvider, setProvider, Provider } from "@project-serum/anchor";
// import { sendAndConfirmTransaction } from '@solana/web3.js';
// import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

export const MintNft: FC = () => {
    const mintKey = Keypair.generate();
    const { connection } = useConnection();
    const { wallet, publicKey, sendTransaction, signTransaction, signAllTransactions } = useWallet();
    const kek = useWallet();
    // const provider = new AnchorProvider(connection, kek, "processed"); 
    
    const onClick = useCallback(async () => {
        if (!wallet || !publicKey || !signTransaction || !signAllTransactions) throw new WalletNotConnectedError();
        
        const signerWallet = {
            publicKey: publicKey,
            signTransaction: signTransaction,
            signAllTransactions: signAllTransactions,
          };
      
        const provider = new AnchorProvider(connection, signerWallet, {
          preflightCommitment: "recent",
        });
    
        let associatedTokenAccount = await getAssociatedTokenAddress(
            mintKey.publicKey,
            publicKey
        );
        
        const program = new Program(idl, programID, provider);
        const lamports: number = await program.provider.connection.getMinimumBalanceForRentExemption(
            MINT_SIZE
        );
        
        // Fires a list of instructions
        const mint_tx = new Transaction().add(
            // Use anchor to create an account from the mint key that we created
            SystemProgram.createAccount({
              fromPubkey: publicKey,
              newAccountPubkey: mintKey.publicKey,
              space: MINT_SIZE,
              programId: TOKEN_PROGRAM_ID,
              lamports,
            }),
            // Fire a transaction to create our mint account that is controlled by our anchor wallet
            createInitializeMintInstruction(
              mintKey.publicKey, 0, publicKey, publicKey, TOKEN_PROGRAM_ID
            ),
            // Create the ATA account that is associated with our mint on our anchor wallet
            createAssociatedTokenAccountInstruction(
              publicKey, associatedTokenAccount, publicKey, mintKey.publicKey, TOKEN_PROGRAM_ID
            )
        );
        console.log(publicKey);
        mint_tx.feePayer = new PublicKey(publicKey);
        mint_tx.recentBlockhash = (await connection.getLatestBlockhash("finalized")).blockhash;
        mint_tx.partialSign(mintKey);
        // console.log(mint_tx.recentBlockhash);
        // await signTransaction(mint_tx);
        // tx.recentBlockhash = await connection.getLatestBlockhash("finalized")).blockhash;
        await sendTransaction(mint_tx, connection);
        console.log(mintKey.publicKey);

        // sends and create the transaction
        // const res = await anchor.AnchorProvider.env().sendAndConfirm(mint_tx, [mintKey]);
        // await sendAndConfirmTransaction(connection, mint_tx, [mintKey]);
        // console.log(signature);
        // const mint = await sendAndConfirmTransaction(connection, mint_tx, [mintKey]);
                
        // const mint = await createMint(connection, mintKey, publicKey, null, 0);
        
        // const program = new Program(idl, programID, provider);
        await program.methods.mintToken().accounts({
            mint: mintKey.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenAccount: associatedTokenAccount,
            authority: publicKey,
          }).rpc()

        // const transaction = new Transaction().add(
        //     SystemProgram.transfer({
        //         fromPubkey: publicKey,
        //         toPubkey: Keypair.generate().publicKey,
        //         lamports: 1,
        //     })
        // );

        // const signature = await sendTransaction(transaction, connection);

        // await connection.confirmTransaction(signature, 'processed');
    }, [publicKey, sendTransaction, connection]);

    return (
        <button onClick={onClick} disabled={!publicKey}>
            Buy NFT 
        </button>
    );
}
