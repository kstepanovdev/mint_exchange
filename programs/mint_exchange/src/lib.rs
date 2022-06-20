use anchor_lang::prelude::*;
use anchor_spl::token::{self, MintTo, Token};

declare_id!("CGEYAjkfYU696uy1i3XSpn5TzVvprPMTdAbsng9b2jrE");

#[program]
pub mod mint_exchange {
    use anchor_spl::token::Transfer;

    use super::*;

    pub fn mint_token(ctx: Context<MintToken>,) -> Result<()> {
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::mint_to(cpi_ctx, 1)?;

        Ok(())
    }

}

#[derive(Accounts)]
pub struct MintToken<'info> {
    /// CHECK: Token 
    #[account(mut)]
    pub mint: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    /// CHECK: Token account 
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,
    /// CHECK: authority 
    #[account(mut)]
    pub authority: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct TransferToken<'info> {
    pub token_program: Program<'info, Token>,
    /// CHECK: ATA from 
    #[account(mut)]
    pub from: UncheckedAccount<'info>,
    /// CHECK: ATA to 
    #[account(mut)]
    pub to: AccountInfo<'info>,
    // Authority from 
    pub from_authority: Signer<'info>,
}