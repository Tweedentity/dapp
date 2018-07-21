# Tweedentity.js

This is a first alpha version. Tests will come soon.

### Getting started

To use tweedentity:

```
npm i tweedentity --save
```

Client side example in a React component:

```
const tweedentityClient = require('tweedentity/Client')

this.tClient = new tweedentityClient(this.web3js)

this.tClient.load()
  .then(() => {
    this.contracts = this.tClient.contracts
    this.setState({
      netId: this.tClient.netId,
      connected: 1,
      env: this.tClient.env,
      ready: this.tClient.ready ? 1 : 0
    })
    ...
  })

```

Server side example to get the data about a tweedentity:

```
const tServer = require('tweedentity').Server
return this.tServer.getDataById('reddit', 'follus')
  .then(result => {
    return Promise.resolve({
      data: result.userData
    })
  })
```

