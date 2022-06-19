use anchor_lang::prelude::*;
use anchor_spl::token::{self, MintTo, Token};
// use spl_associated_token_account::instruction;
// use solana_program;

declare_id!("CGEYAjkfYU696uy1i3XSpn5TzVvprPMTdAbsng9b2jrE");

// #[program]
// pub mod mint_exchange {
//     use anchor_spl::token::Transfer;

//     use super::*;

//     pub fn buy_nft(ctx: Context<MintTrasfer>) -> Result<()> {
//         // create ATA for a Wallet
        
//         let cpi_accounts = MintTo {
//             mint: ctx.accounts.mint.to_account_info(),
//             to: ctx.accounts.token_account.to_account_info(),
//             authority: ctx.accounts.authority.to_account_info(),
//         };
        
//         let cpi_program = ctx.accounts.token_program.to_account_info();
//         // Create the CpiContext we need for the request
//         let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

//         // Execute anchor's helper function to mint tokens
//         token::mint_to(cpi_ctx, 10)?;
        
//         // let transfer_instruction = Transfer {
//         //     from: ctx.accounts.mint.to_account_info(),
//         //     to: ctx.accounts.token_account.to_account_info(),
//         //     authority: ctx.accounts.wallet.to_account_info(),
//         // };
         
//         // let cpi_program = ctx.accounts.token_program.to_account_info();
//         // // // Create the Context for our Transfer request
//         // let cpi_ctx = CpiContext::new(cpi_program, transfer_instruction);
        
//         // // // Execute anchor's helper function to transfer tokens
//         // anchor_spl::token::transfer(cpi_ctx, 1)?;
        
//         Ok(())
//     }
// }

// #[derive(Accounts)]
// pub struct MintTrasfer<'info> {
//     /// CHECK: add check here! 
//     mint: AccountInfo<'info>,
//     /// CHECK: add check here! 
//     wallet: AccountInfo<'info>,
//     /// CHECK: add check here! 
//     token_program: Program<'info, Token>,
//     /// CHECK: add check here! 
//     token_account: AccountInfo<'info>,
// }

// impl<'info> MintTrasfer<'info> {
//     fn ata_instruction(&self) -> Instruction {
//         instruction::create_associated_token_account(
//             self.wallet.key, 
//             self.mint.key,
//             self.token_program.key
//         )
//     }
// }

#[program]
pub mod mint_exchange {
    use anchor_spl::token::Transfer;

    use super::*;

    pub fn mint_token(ctx: Context<MintToken>,) -> Result<()> {
        // Create the MintTo struct for our context
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        // Create the CpiContext we need for the request
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        // Execute anchor's helper function to mint tokens
        token::mint_to(cpi_ctx, 1)?;

        Ok(())
    }

    pub fn transfer_token(ctx: Context<TransferToken>) -> Result<()> {
        // Create the Transfer struct for our context
        let transfer_instruction = Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.from_authority.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        // Create the Context for our Transfer request
        let cpi_ctx = CpiContext::new(cpi_program, transfer_instruction);

        // Execute anchor's helper function to transfer tokens
        anchor_spl::token::transfer(cpi_ctx, 1)?;

        Ok(())
    }

}

#[derive(Accounts)]
pub struct MintToken<'info> {
    /// CHECK: This is the token that we want to mint
    #[account(mut)]
    pub mint: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    /// CHECK: This is the token account that we want to mint tokens to
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,
    /// CHECK: the authority of the mint account
    #[account(mut)]
    pub authority: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct TransferToken<'info> {
    pub token_program: Program<'info, Token>,
    /// CHECK: The associated token account that we are transferring the token from
    #[account(mut)]
    pub from: UncheckedAccount<'info>,
    /// CHECK: The associated token account that we are transferring the token to
    #[account(mut)]
    pub to: AccountInfo<'info>,
    // the authority of the from account
    pub from_authority: Signer<'info>,
}