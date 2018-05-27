# Roll Your Own PM by [Gnosis](gnosis.pm)

Have you ever gazed at the glory of [Gnosis Beta](https://mainnet.gnosis.pm/) and thought to yourself: "wowowowow those prediction markets are coming, and they are coming in waves! I have so many ideas, WhatAmIGonnaDo??"

Well fret no more. Now it's easier than ever before to roll out your own prediction market application with the help of Gnosis [pm-js](https://github.com/gnosis/pm-js) and [pm-contracts](https://github.com/gnosis/pm-contracts). We've showcased just how easy it is with this simple boilerplate built with React and Javascript.

## Getting Started
-----
### Install requirements with npm
```
npm install
```
### Start application and navigate to `localhost:5000`
```
npm start
```


## Configuration 
-----
Edit `config.json` in scripts to fit your prediction needs!


## STEPS
-----
We've broken down the process of utilizing pm-js library into 5 easy steps.
For full interactivity, download [MetaMask](https://metamask.io/)

1. Connect To Provider: Initialize your connection to an ethereum provider (if you are using Metamask, this will be injected directly so move on to Step 2)
2. Create Market: This instantiates a new gnosis object, publishes your event to ipfs, creates a matching centralized oracle, and finally creates and funds a market. Be patient after clicking this, you can check your progress in the browser console.
3. Buy Outcomes: This buys a fixed amount of outcome tokens from your market.
4. Sell Outcomes: Sells what you just bought.
5. Close Market: After the resolution date, you can close your market.

## Local Setup
-----
To migrate the pm-contracts onto a local ganache instance with:
```
npm run ganache
```
In a separate terminal window:

```
npm run install-contracts
npm run migrate
```
Finally, run the following in another terminal window. This will execute Steps 1-2. See if you can use the pm-js [documentation](https://gnosis-pm-js.readthedocs.io/en/latest/) to complete the rest.
```
npm run gnosis
```

#### Completed at ETHBuenosAires 2018 By:
[Andre Meyer](@andre-meyer)

[Collin Chin](@collinc97)