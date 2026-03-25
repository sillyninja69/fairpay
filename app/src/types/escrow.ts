export type EscrowState =
  | "active"
  | "workSubmitted"
  | "disputed"
  | "completed"
  | "resolved";

export interface EscrowAccount {
  publicKey: string;
  client: string;
  freelancer: string;
  amount: number;
  jobTitle: string;
  jobDescription: string;
  workDescription: string;
  workLink: string;
  clientClaim: string;
  freelancerClaim: string;
  verdictReasoning: string;
  state: EscrowState;
  bump: number;
}
