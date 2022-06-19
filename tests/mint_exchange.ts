import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { MintExchange } from "../target/types/mint_exchange";

describe("mint_exchange", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.MintExchange as Program<MintExchange>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
