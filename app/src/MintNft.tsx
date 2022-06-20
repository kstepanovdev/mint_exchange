import { 
    Keypair, 
    Transaction, 
    SystemProgram,
    PublicKey,
} from '@solana/web3.js';
import { 
    createAssociatedTokenAccountInstruction,
    createInitializeMintInstruction,
    getAssociatedTokenAddress, 
} from '@solana/spl-token';
import { programID } from "./utils/config";
import idl from "./mint_exchange.json";

import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
    MINT_SIZE,
    TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import React, { FC, useCallback } from 'react';
import { Program, AnchorProvider, getProvider, setProvider, Provider } from "@project-serum/anchor";

export const MintNft: FC = () => {
    const mintKey = Keypair.generate();
    const { connection } = useConnection();
    const { wallet, publicKey, sendTransaction, signTransaction, signAllTransactions } = useWallet();
    
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
        
        const mint_tx = new Transaction().add(
            SystemProgram.createAccount({
              fromPubkey: publicKey,
              newAccountPubkey: mintKey.publicKey,
              space: MINT_SIZE,
              programId: TOKEN_PROGRAM_ID,
              lamports,
            }),
            createInitializeMintInstruction(
              mintKey.publicKey, 0, publicKey, publicKey, TOKEN_PROGRAM_ID
            ),
            createAssociatedTokenAccountInstruction(
              publicKey, associatedTokenAccount, publicKey, mintKey.publicKey, TOKEN_PROGRAM_ID
            )
        );
        console.log(publicKey);
        mint_tx.feePayer = new PublicKey(publicKey);
        mint_tx.recentBlockhash = (await connection.getLatestBlockhash("finalized")).blockhash;
        mint_tx.partialSign(mintKey);
        await sendTransaction(mint_tx, connection);
        console.log(mintKey.publicKey);

        await program.methods.mintToken().accounts({
            mint: mintKey.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenAccount: associatedTokenAccount,
            authority: publicKey,
          }).rpc()

    }, [publicKey, sendTransaction, connection]);

    return (
        <button onClick={onClick} disabled={!publicKey}>
            Buy NFT 
        </button>
    );
}
