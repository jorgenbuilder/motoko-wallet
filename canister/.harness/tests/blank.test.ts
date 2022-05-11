import { motokoWalletActor } from '../actors/actor'

const MotokoWalletAnon = motokoWalletActor();

test('Test harness operational', () => {
    expect(true).toBe(true);
});

test('Test environment operational', async () => {
    const pong = await MotokoWalletAnon.ping();
    console.log(pong)
    expect(pong).toBe('pong');
});