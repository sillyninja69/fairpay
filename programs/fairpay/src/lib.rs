use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("Cd7cvj6DpLPnmJqvp9V2JCoxGmPqmTaSvLhTda1fHhTa");

#[program]
pub mod fairpay {
    use super::*;

    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        job_title: String,
        job_description: String,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, FairPayError::InvalidAmount);

        let escrow = &mut ctx.accounts.escrow;
        escrow.client = ctx.accounts.client.key();
        escrow.freelancer = ctx.accounts.freelancer.key();
        escrow.amount = amount;
        escrow.job_title = job_title;
        escrow.job_description = job_description;
        escrow.work_description = String::new();
        escrow.work_link = String::new();
        escrow.client_claim = String::new();
        escrow.freelancer_claim = String::new();
        escrow.verdict_reasoning = String::new();
        escrow.state = EscrowState::Active;
        escrow.bump = ctx.bumps.escrow;

        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.client.to_account_info(),
                to: ctx.accounts.escrow.to_account_info(),
            },
        );
        transfer(cpi_ctx, amount)?;

        Ok(())
    }

    pub fn submit_work(
        ctx: Context<SubmitWork>,
        work_description: String,
        work_link: String,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(
            escrow.state == EscrowState::Active,
            FairPayError::InvalidStateTransition
        );
        escrow.work_description = work_description;
        escrow.work_link = work_link;
        escrow.state = EscrowState::WorkSubmitted;
        Ok(())
    }

    pub fn approve_work(ctx: Context<ApproveWork>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(
            escrow.state == EscrowState::WorkSubmitted,
            FairPayError::InvalidStateTransition
        );

        let amount = escrow.amount;
        escrow.amount = 0;
        escrow.state = EscrowState::Completed;

        **escrow.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx
            .accounts
            .freelancer
            .to_account_info()
            .try_borrow_mut_lamports()? += amount;

        Ok(())
    }

    pub fn raise_dispute(
        ctx: Context<RaiseDispute>,
        client_claim: String,
        freelancer_claim: String,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(
            ctx.accounts.actor.key() == escrow.client || ctx.accounts.actor.key() == escrow.freelancer,
            FairPayError::Unauthorized
        );
        require!(
            escrow.state == EscrowState::Active || escrow.state == EscrowState::WorkSubmitted,
            FairPayError::InvalidStateTransition
        );

        escrow.client_claim = client_claim;
        escrow.freelancer_claim = freelancer_claim;
        escrow.state = EscrowState::Disputed;
        Ok(())
    }

    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        winner: Pubkey,
        reasoning: String,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(
            escrow.state == EscrowState::Disputed,
            FairPayError::InvalidStateTransition
        );
        require!(
            winner == escrow.client || winner == escrow.freelancer,
            FairPayError::InvalidWinner
        );

        let amount = escrow.amount;
        escrow.amount = 0;
        escrow.verdict_reasoning = reasoning;
        escrow.state = EscrowState::Resolved;

        **escrow.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.winner.to_account_info().try_borrow_mut_lamports()? += amount;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(job_title: String, job_description: String)]
pub struct InitializeEscrow<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
    /// CHECK: freelancer can be any valid address
    pub freelancer: UncheckedAccount<'info>,
    #[account(
        init,
        payer = client,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", client.key().as_ref(), freelancer.key().as_ref(), job_title.as_bytes()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitWork<'info> {
    #[account(mut)]
    pub freelancer: Signer<'info>,
    #[account(
        mut,
        has_one = freelancer @ FairPayError::Unauthorized,
    )]
    pub escrow: Account<'info, Escrow>,
}

#[derive(Accounts)]
pub struct ApproveWork<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
    #[account(mut)]
    pub freelancer: SystemAccount<'info>,
    #[account(
        mut,
        has_one = client @ FairPayError::Unauthorized,
        has_one = freelancer @ FairPayError::Unauthorized
    )]
    pub escrow: Account<'info, Escrow>,
}

#[derive(Accounts)]
pub struct RaiseDispute<'info> {
    pub actor: Signer<'info>,
    #[account(mut)]
    pub escrow: Account<'info, Escrow>,
}

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    #[account(mut, address = ESCROW_RESOLVER)]
    pub resolver: Signer<'info>,
    #[account(mut)]
    pub winner: SystemAccount<'info>,
    #[account(mut)]
    pub escrow: Account<'info, Escrow>,
}

const ESCROW_RESOLVER: Pubkey = pubkey!("3eERcoNESJjiUbohhSRsuaBJsQJiQjmNDtRZmGmLEZ8b");

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub client: Pubkey,
    pub freelancer: Pubkey,
    pub amount: u64,
    #[max_len(80)]
    pub job_title: String,
    #[max_len(500)]
    pub job_description: String,
    #[max_len(500)]
    pub work_description: String,
    #[max_len(200)]
    pub work_link: String,
    #[max_len(500)]
    pub client_claim: String,
    #[max_len(500)]
    pub freelancer_claim: String,
    #[max_len(500)]
    pub verdict_reasoning: String,
    pub state: EscrowState,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum EscrowState {
    Active,
    WorkSubmitted,
    Disputed,
    Completed,
    Resolved,
}

#[error_code]
pub enum FairPayError {
    #[msg("Unauthorized actor for this action")]
    Unauthorized,
    #[msg("Invalid state transition")]
    InvalidStateTransition,
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Dispute winner must be client or freelancer")]
    InvalidWinner,
}
