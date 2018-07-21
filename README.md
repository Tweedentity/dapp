# Tweedentity DApp

This is a repo containing all the components of the tweedentity system.

### Getting started

Clone the repo:

```
git clone --recurse-submodules -j8 https://github.com/Tweedentity/dapp.git
```

Install Ganache-cli and Truffle globally:

```
npm install -g ganache-cli truffle
```

Install the dependencies:

```
npm run install-all
```

To test the api:

```
npm run test-api
```

To test the smart contracts,
(1) run the test server:

```
npm run testServer
```
(2) in a separate shell, run the Oraclize bridge:
```
npm run bridge
```
(3) in a third shell, run:
```
npm run test-store
```

