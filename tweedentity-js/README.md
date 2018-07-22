# Tweedentity.js

This is a first alpha version. Tests will come soon.

### Getting started

To use tweedentity:

```
npm i tweedentity --save
```

#### Client

Loading the client: 

```
const tweedentityClient = require('tweedentity/Client')

const tClient = new tweedentityClient(web3js)
tClient.load()

```
Loading the TID for a certain wallet

```
tClient.getIdentities('0x93a5b8fc1a951894361c4c35523e23ba6bf073b7')
.then(result => {
   console.log(result.twitter)
})
```
To recover the data about that identity you could use the Twitter API or the Reddit API, or parsing the data server side using the Server component.

#### Server
 
 To get the basic data about a tweedentity (userId, username, name and avatar):

```
const tServer = require('tweedentity').Server

return tServer.getDataById('reddit', 'follus')
  .then(result => {
    return Promise.resolve({
      data: result.userData
    })
  })
```

