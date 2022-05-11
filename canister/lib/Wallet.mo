/// Primary Motoko Wallet module.

import Result "mo:base/Result";

module Wallet {


    //////////////
    // Factory //
    ////////////


    // TODO: Should type this with Interface.
    public class Factory (state : State) {};


    ////////////
    // Types //
    //////////


    public type CallResult = {
        #reply: Blob;
        // sha256 of ["wallet_proposal"] + [Principal of self] + ["nonce"] + [stable Nonce]
        #proposal: Nat;
    };

    public type NeuronId = Nat;

    public type NeuronIdOrSubaccount = {
        #Subaccount : [Nat8];
        #NeuronId : NeuronId;
    };

    public type ConfigureWalletCommand = {
        #addToken: {
            principal: Principal;
            standard: Text;
            symbol: Text;
        };
        #removeToken: Principal;
        #addNNSNeuron: NeuronIdOrSubaccount;
        #removeNNSNeuron: NeuronIdOrSubaccount;
         #addSNSNeuron: NeuronIdOrSubaccount;
        #removeSNSNeuron: NeuronIdOrSubaccount;
        #addNFT: {
            principal: Principal;
            standard: Text;
            collection: Text;
        };
        #removeNFT: Principal;
        #addAllow: [{
            principal: Principal;
            function: Text;
            /// candid
            service: Text;
        }];
        #removeAllow: [{
            principal: Principal;
            function: Text;
        }];
        #setDebug: Bool;
        #purgeDebug;
        #purgeFunctionLog;
        #purgeConfigLog;
        #sendCycles: {
            principal: Principal;
            amount: Nat;
        };
        #setMultiSig: {
            #owner: [Principal];
            #multisig: {
                /// If `null`, sets the owner to self so that only a proposal can change the participants.
                owner: ?[Principal];
                /// Number of signatures needed.
                n: Nat;
                m: [Principal];
                /// If private is true, do not return who voted for what.
                isPrivate: Bool;
            };
            #remote: {
                /// If `null`, sets the owner to self so that only a proposal can change the participants.
                owner: ?[Principal];
                /// Calls actor.proposal_status(Nat) -> async Result<{ProposalStatus}> and actor.sign_proposal(caller: Principal, proposal: Nat) -> aync Result<{ProposalStatus} for signatures.
                principal: Principal;
            };
            #local: {
                /// If `null`, sets the owner to self so that only a proposal can change the participants
                owner: ?[Principal];
                /// Calls self.proposal_status(Nat) -> async Result<{ProposalStatus}> for status and self.sign_proposal(caller: Principal) -> aync Result<{ProposalStatus} for signatures.
                principal: Principal;
            };

        }
    };

    public type ConfigureWalletResponse = {};

    public type ProposalStatus = {
        status: {
            #pass;
            #open;
            #reject;
            #error: CommonError;
        };
        votes: ?{
            accept: [Principal];
            reject: [Principal];
            outstanding: ?[[Principal]]
        }
    };

    public type CommonError = {};

    /// Stable state utilized by this module.
    public type StableState = {
    };

    /// External state and functions utilized by this module.
    public type Dependencies = {
        _log : (caller  : Principal, method  : Text, message : Text) -> ();
    };

    /// Total state utilized by this module.
    public type State = StableState and Dependencies;

    /// The public compliance interface.
    public type Interface = {
        /// Request the cycle balance of the canister.
        /// Must be an owner of the canister.
        cycleBalance : query () -> async Nat;

        /// Returns the default account for the wallet that can be used with some ledger based tokens.
        defaultAccount : query () -> async Text;

        /// Returns a list of tokens that have been added to the wallet.
        /// The wallet should natively know how to handle EXT, DIP20, and Ledger(ICP) based tokens.
        tokenList : query () -> async [{principal: Principal; standard: Text; symbol: Text}];

        /// Returns a list of NFT canisters that have been added to the wallet.
        nftList : query () -> async [{principal: Principal; standard: Text; collection: Text}];

        /// Returns a list of allowed functions for the wallet.
        allowList : query () -> async [{principal: Principal; function: Text; service: Text}];

        /// Returns a list of functions that were called by the wallet.
        functionLog : query () -> async (page: Nat, skip: Nat, count: Nat);

        /// Keeps a running list of config changes.
        configLog : query () -> async (page: Nat, skip: Nat, count: Nat);

        /// Returns proposals in reverse order.
        proposals : query (page: Nat, skip: Nat, count: Nat) -> async [{proposal: Nat; proposalResult: ProposalStatus; principal: Principal; function: Text; data: Blob; timestamp: Nat;}];

        /// Returns config proposals in reverse order.
        configProposals : query (page: Nat, skip: Nat, count: Nat) -> async [{proposal: Nat; proposalResult: ProposalStatus; command: ConfigureWalletCommand; timestamp: Nat;}];

        /// Can be called by an owner or signer to change the way the wallet behaves.  If the wallet is in multi-sig mode a proposal will be created..
        configureWallet : query (command: ConfigureWalletCommand) -> async Result.Result<ConfigureWalletResponse, CommonError>;

        /// Calls the function and either executes the function or creates a proposal to execute the function;.
        call : query (principal: Principal, function: Text, data: Blob) -> async CallResult;

        /// Signs an open proposal.  Must be called by a signer.
        signPropsal : query (proposal: Nat, {#sign; #reject}) -> async Result.Result<ProposalStatus, CommonError>;

        /// Signs config proposals, Must be called by a signer.
        signConfigProposal : query (proposal: Nat, {#sign; #reject}) -> async Result.Result<ProposalStatus, CommonError>;

        /// Receives cycles.
        /// Should be logged to the token transaction log.
        walletReceive() : async ();
    };
}