import React from 'react'
import Styles from './styles.module.css'
import GhostDark from 'assets/ghost-dark.png'
import GhostLight from 'assets/ghost-light.png'
import useThemeStore from 'stores/theme'
import useConnect from 'stores/connect'
import Button from 'ui/button'

interface Props {};

export default function HomePage (props : Props) {
    const { theme } = useThemeStore();
    const connect = useConnect();

    const [pong, setPong] = React.useState<string>();
    React.useEffect(() => void connect.actors['motoko-wallet'].ping().then(setPong).catch(() => setPong('Shit')), [connect.actors]);

    return <div className={Styles.root}>
        <img src={theme === 'dark' ? GhostDark : GhostLight} />
        <h1>Motoko Wallet</h1>
        <p>The canister says "{pong}"</p>
        {
            connect.connected
            ? <>
                <div>Principal: {connect.principal?.toText()}</div>
                <Button onClick={() => connect.disconnect()}>Disconnect</Button>
            </>
            : <>
                <Button disabled={connect.connecting} onClick={() => connect.plugConnect()}>Connect Plug</Button>
                <Button disabled={connect.connecting} onClick={() => connect.stoicConnect()}>Connect Stoic</Button>
            </>
        }
    </div>
};