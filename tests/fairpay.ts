import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";

describe("fairpay", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Fairpay as Program;

  it("initializes escrow and stores amount", async () => {
    const freelancer = anchor.web3.Keypair.generate();
    const jobTitle = "Logo design";
    const amount = new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL);
    const [escrow] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        provider.wallet.publicKey.toBuffer(),
        freelancer.publicKey.toBuffer(),
        Buffer.from(jobTitle),
      ],
      program.programId
    );

    await program.methods
      .initializeEscrow(jobTitle, "Need a modern brand logo", amount)
      .accounts({
        client: provider.wallet.publicKey,
        freelancer: freelancer.publicKey,
        escrow,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const state = await (program.account as any).escrow.fetch(escrow);
    if (state.amount.toString() !== amount.toString()) {
      throw new Error("Escrow amount mismatch");
    }
  });
});
