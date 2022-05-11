import create from 'zustand'
import { StoicIdentity } from "ic-stoic-identity";
import { Principal } from '@dfinity/principal'
import { Actor, ActorSubclass, HttpAgent } from '@dfinity/agent'
import { IDL } from '@dfinity/candid'
import { idlFactory as motokoWalletIdl } from 'interface/motoko-wallet/motoko-wallet.did'
import { MotokoWallet } from 'interface/motoko-wallet/motoko-wallet.did.d'

export const icConf = {
    protocol: import.meta.env.DAPP_IC_PROTOCOL as string || 'https',
    host: import.meta.env.DAPP_IC_HOST as string || 'ic0.app',
    isLocal: import.meta.env.DAPP_IS_LOCAL === 'true',
};

interface Canister<T> {
    idl: IDL.InterfaceFactory,
    canisterId: string,
    interface: T,
};

export const canisters : {
    [key : string]: Canister<unknown>,
} = {
    'motoko-wallet': {
        canisterId: import.meta.env.DAPP_MOTOKO_WALLET_CANISTER_ID,
        idl: motokoWalletIdl,
    } as Canister<MotokoWallet>
};

// TODO: Actors aren't typed!
function makeActors (agent : HttpAgent = defaultAgent) {
    return Object.entries(canisters).reduce((agg, [name, conf]) => {
        return {
            ...agg,
            [name] : Actor.createActor<unknown>(conf.idl, {
                agent,
                canisterId: conf.canisterId,
            }),
        };
    }, {})
};

// TODO: Plug actors are... *acting* up!
async function makeActorsPlug () {
    return Object.entries(canisters).reduce(async (agg, [name, conf]) => {
        return {
            ...agg,
            [name] : await window?.ic?.plug?.createActor({
                canisterId: conf.canisterId,
                interfaceFactory: conf.idl,
            }),
        };
    }, {})
};

export const host = `${icConf.protocol}://${icConf.host}`;
export const whitelist = Object.values(canisters).map(x => x.canisterId);
const defaultAgent = new HttpAgent({ host });

export type Wallet = 'plug' | 'stoic' | 'earth' | 'ii';

interface Connect {
    initialized: boolean;
    init: () => void;

    agent?: HttpAgent;
    actors: {
        [key: string] : ActorSubclass,
    };

    connected: boolean;
    connecting: boolean;
    postConnect: () => void;
    idempotentConnect: () => null | (() => void);
    plugConnect: () => void;
    stoicConnect: () => void;
    plugReconnect: () => Promise<boolean>;
    stoicReconnect: () => Promise<boolean>;

    disconnect: () => void;

    principal?: Principal;
    wallet?: Wallet;
};

const useConnect = create<Connect>((set, get) => ({

    initialized: false,
    init () {
        const { initialized, plugReconnect, stoicReconnect, } = get();
        if (initialized) return;

        // Attempt to reconnect to wallets
        try {
            plugReconnect()
            .then(r => {
                if (!r) stoicReconnect()
            });
        } catch (e) {
            console.error(e);
        }

        set({ initialized : true });
    },

    actors: makeActors(),

    connected: false,
    connecting: false,

    // Ensures only one connection attempt when implemented properly.
    idempotentConnect () {
        const { connecting } = get();
        if (connecting) return null;
        set({ connecting: true });
        return () => {
            set({ connecting: false });
        };
    },

    // Request connection to user's stoic wallet.
    async stoicConnect () {

        const { idempotentConnect, postConnect } = get();

        // Ensure singular connection attempt.
        const complete = idempotentConnect()
        if (complete === null) return;

        StoicIdentity.load().then(async (identity : any) => {
            if (!identity) {
              identity = await StoicIdentity.connect();
            };

            const agent = new HttpAgent({
                identity,
                host,
            });

            set(() => ({
                agent,
                connected: true,
                principal: identity.getPrincipal(),
                wallet: 'stoic'
            }));
            
            postConnect();
        })
        .finally(complete);
    },

    // Request connection to user's plug wallet.
    async plugConnect () {

        const { idempotentConnect, postConnect } = get();

        // Ensure singular connection attempt.
        const complete = idempotentConnect();
        if (complete === null) return;

        // If the user doesn't have plug, send them to get it!
        if (window?.ic?.plug === undefined) {
            window.open('https://plugwallet.ooo/', '_blank');
            return;
        }
        
        await window.ic.plug.requestConnect({ whitelist, host });
        const agent = await window.ic.plug.agent;
        const principal = await agent.getPrincipal();

        complete();
        set(() => ({ connected: true, principal, wallet: 'plug' }));
        postConnect();
    },

    // Attempt to restore a live connection to user's plug wallet.
    async plugReconnect () {
        const { postConnect } = get();
        const plug = window?.ic?.plug;
        if (await plug?.isConnected() && window.localStorage.getItem('wallet') === 'plug') {
            const agent = await plug?.agent;

            if (!agent) {
                await plug?.createAgent({ host, whitelist });
            }

            const principal = await plug?.agent?.getPrincipal();

            set(() => ({ connected: true, principal, wallet: 'plug' }));
            postConnect();

            return true;
        }
        return false;
    },

    // Attempt to restore a live connection to user's stoic wallet.
    async stoicReconnect () {
        const { stoicConnect } = get();
        if (window.localStorage.getItem('_scApp') && window.localStorage.getItem('wallet') === 'stoic') {
            stoicConnect();
            return true;
        };
        return false;
    },

    // Things that happen after a wallet connection.
    async postConnect () {
        const { agent, wallet } = get();

        // Replace identity on actors.
        // Note: might be nice to use Actor.replaceIdentity, but plug best practice requires a proprietary actor creation method, so I'll stick to recreation for now.
        const actors = wallet === 'plug' ? await makeActorsPlug() : agent && makeActors(agent);

        // Track connected wallet
        wallet && window.localStorage.setItem('wallet', wallet);

        set({ actors });
    },

    // Disconnect from users wallet.
    disconnect () {
        StoicIdentity.disconnect();
        window.ic?.plug?.deleteAgent();
        set({
            connected: false,
            principal: undefined,
            actors: makeActors(),
            wallet: undefined,
            agent: undefined,
        });
        window.localStorage.removeItem('wallet');
    },

}));

export default useConnect;


// This is the stuff that plug wallet extension stuffs into the global window namespace.
// I stole this for Norton: https://github.com/FloorLamp/cubic/blob/3b9139b4f2d16bf142bf35f2efb4c29d6f637860/src/ui/components/Buttons/LoginButton.tsx#L59
declare global {
    interface Window {
        ic?: {
            plug?: {
                agent: any;
                createActor: <T>(args : {
                    canisterId          : string,
                    interfaceFactory    : IDL.InterfaceFactory,
                }) => ActorSubclass<T>,
                isConnected : () => Promise<boolean>;
                createAgent : (args?: {
                    whitelist   : string[];
                    host?       : string;
                }) => Promise<undefined>;
                requestBalance: () => Promise<
                    Array<{
                        amount      : number;
                        canisterId  : string | null;
                        image       : string;
                        name        : string;
                        symbol      : string;
                        value       : number | null;
                    }>
                >;
                requestTransfer: (arg: {
                    to      : string;
                    amount  : number;
                    opts?   : {
                        fee?            : number;
                        memo?           : number;
                        from_subaccount?: number;
                        created_at_time?: {
                            timestamp_nanos: number;
                        };
                    };
                }) => Promise<{ height: number }>;
                requestConnect: (opts: any) => Promise<'allowed' | 'denied'>;
                deleteAgent: () => Promise<void>;
            };
        };
    }
}