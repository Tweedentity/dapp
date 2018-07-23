# Tweedentity.js

A library to integrate Tweedentity in any decentralized app.

## Getting started

To use tweedentity:

```
npm i tweedentity --save
```

## Client

### Example

Instantiate the client:

```
const tweedentityClient = require('tweedentity/Client')
const tClient = new tweedentityClient(web3js)

```

### API

####load()

Loads the contracts. It must be executed after instantiating the object and before any other commands.
Example:
```
tClient.load()
.then(() => {
  console.log(tClient.contracts.stores.twitter.address)
})
```
on Ropsten, it should print `0x0de9ccba310161c06ae194f65965c309af167913`

####getIdentities(address, reload)

Gets the identities associated to `address`. The first time it is executed, it saves the results in the property `profiles` so that in the future it can read quickly from that. The param `reload` forces the reload of the data from the blockchain.

```
tClient.getIdentities('0x93a5b8fc1a951894361c4c35523e23ba6bf073b7')
.then(result => {
   console.log(result.twitter)
})
```
Should print `946957110411005953`.

If there isn't any tweedentity set for the specified address, it returns an empty object.

When you have the twitter userId, to recover the profile associated with it you can either use the Twitter API or parse the data using the Server component (see below in the Server section).

####getIdentity(app, address)

Gets the identities associated to `address` and the specified app.
The first parameter can be the nickname of the app, for example `twitter`, or its id, i.e. `1` for twitter.
If the app is not supported it throws `new Error('App not supported')`.

```
tClient.getIdentity('twitter', '0x93a5b8fc1a951894361c4c35523e23ba6bf073b7')
.then(result => {
   console.log(result)
})
```
Should print `946957110411005953`. Alternatively, it can be called as
```
tClient.getIdentity(1, '0x93a5b8fc1a951894361c4c35523e23ba6bf073b7')
...
```

####getFullIdentities__(address)

Returns the same of `getIdentities` but with the full TID. In the example above, it should return for twitter `1/946957110411005953`, where `1` is the twitter appId in Tweedentity.

__getFullIdentity__(appNickname, address)__

Returns the same of `getIdentity` but with the full TID.

####totalIdentities()

Returns a summary of the total of set tweedentities.
```
tClient.totalIdentities()
.then(result) {
  console.log(result)
})
```
Should print something like
```
{total: 200, twitter: 140, reddit: 60}
```

####totalIdentityByApp(app)

Returns the total number of tweedentities set for the specified app.
```
tClient.totalIdentitiesByApp('twitter')
.then(result) {
  console.log(result)
})
```
In line with the previous example, it should print `140`.

### Static methods

####fullify(id)

Returns the TID.
```
console.log(tweedentityClient.fullify('twitter','87237464536')

```
Should print `1/87237464536`

####isSupported(app)

Returns true if the app is supported.

####normalizeApp(app)

Returns the appNickname, despite if app is already a nickname or is an id.

####appByTID(tid)

Returns the appNickname of a TID.
```
console.log(tweedentityClient.appByTID('1/78746563'))
```
Should print `twitter`

## Server

_Versions starting from 0.2.0 are not compatible with previous 0.1.x versions._

When you have the tweedentities associated to a wallet you can retrieve the user profile using the app API, for example, the Twitter API. Alternatively, you can use server-side the Tweedentity API to parse the data from the web.

Supposing you are using Express, to get the basic profile about a Reddit tweedentity (userId, username, name and avatar), you could have something like:

```
const tServer = require('tweedentity').Server

router.post('/data/:webApp', jsonParser, function (req, res, next) {

  const webApp = req.params.webApp
  const provider = new Provider()

  tServer.getDataByTID(webApp, req.body.userId)
    .then(result => {
      res.status(200).json(result)
    })
    .catch(err => {
      res.status(200).json({error: err.message})
    })
})
```
This should return something like:
```
{
    "userId": "1ys6ez",
    "username": "mary908345",
    "name": "Bloody Mary",
    "avatar": "https://s.redditmedia....png?...."
}
```
Or, if the account does not exists:
```
{
  "error": "Not found"
}
```

## License

MIT.

## Copyright

(c) 2018, Francesco Sullo <francesco@sullo.co>, 0xNIL


