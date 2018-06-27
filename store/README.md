# store
A set of smart contracts to store the tweedentities


### What to do

Clone the repo as

```
git clone --recurse-submodules -j8 https://github.com/Tweedentity/store.git
```

If you don't have them, install Ganache-cli and Truffle globally

```
npm install -g ganache-cli truffle@4.1.3
```

Install the dependencies

```
npm install
```

To test, run the test server

```
npm run testServer
```
and, in a separate shell, the Oraclize bridge
```
npm run bridge
```
and, in another shell, run
```
truffle test
```

