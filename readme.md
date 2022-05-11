# Motoko Wallet

Tagline goes here. Targeting IC Devs [bounty #15](https://icdevs.org/bounties/2022/02/23/Motoko-Wallet.html).

## Dev Process

This project is now in initial development stages and will proceed in roughly these stages:

1. Provision ✅
2. Unit tests and interface development
3. Canister interface implementation
4. Frontend build

## Stack

- [x] Motoko
- [x] Jest/Typescript IC test harness
- [x] React/Typescript SPA frontend
- [x] Jest + Storybook frontend test harness
- [ ] Canistergeek onchain logging

## Canister

The onchain canister is responsible for all of the functionality. [Read more](canister/readme.md)

## Web App

The webapp is a simple interface that allows end users to interact with Motoko Wallet using a nice GUI. [Read more](web-app/readme.md)

## Onchain Logging

(TODO) We deploy [a custom canistergeek frontend](https://) which allows us to preconfigure the UI for our admins. Plug or Stoic wallet principals which are made administrators on the Motoko Wallet canister will be able to access cycles, memory usage and logs on this dashboard.

### A note on log messages

Onchain log messages should be used in the following cases:

1. **Admin access:** by logging each time a canister administrative function is called, we have an access log of priviledged actions which could be critical in troubleshooting.
2. **Unexpected exceptions:** any unreachable or assumptive code paths, or panics, should be logged.

The log format is as follows:

```
caller_principal :: method_name :: message
```

## Web App Logging

There isn't any, but I would love to have a rollbar like service.
