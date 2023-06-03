import { ProtocolOptions, SocialProtocol } from "@spling/social-protocol";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { web3 } from "@project-serum/anchor"

let socialProtocol: SocialProtocol;

export const userWallet = web3.Keypair.fromSecretKey(bs58.decode("3kHRSij2w6yBLmoQM6yqZMSWUubwExhdrS16rG417ftkX7r34pLPcE7wjdKSiEqeXJjFzTuUL6FDpfPjCWBGF3aF"))
export const getSocialProtocol = (): SocialProtocol => socialProtocol;
export const initSocialProtocol = async () => {
  socialProtocol = await new SocialProtocol(userWallet, null, { useIndexer: true } as ProtocolOptions).init();
};

