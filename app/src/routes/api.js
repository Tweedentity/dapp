const express = require('express')
const router = express.Router()
const jsonParser = require('body-parser').json()
const Provider = require('../lib/Provider')
const EthProvider = require('../lib/EthProvider')


router.post('/eth-info', jsonParser, function (req, res, next) {

  const ethProvider = new EthProvider(req.body.network)

  Promise.all([
    ethProvider.gethEtherPrice(),
    ethProvider.getGasInfo()
  ])
    .then(values => {
      res.status(200).json({
        price: values[0],
        gasInfo: values[1]
      })
    })
    .catch(err => {
      res.status(500)
    })

})

router.post('/wallet-stats', jsonParser, function (req, res, next) {

  const ethProvider = new EthProvider(req.body.network)
  const address = req.body.address

  Promise.all([
    ethProvider.walletStats('1', address, req.body.network === '1' ? req.body.claimer : null),
    ethProvider.walletStats('3', address, req.body.network === '3' ? req.body.claimer : null)
  ])
    .then(values => {
      res.status(200).json({
        main: values[0],
        ropsten: values[1]
      })
    })
    .catch(err => {
      res.status(500)
    })
})

router.post('/get-txs', jsonParser, function (req, res, next) {

  const ethProvider = new EthProvider(req.body.network)

  ethProvider.getTxs(req.body)
    .then(results => {
      if (results.error) {
        throw(new Error(results.error))
      }
      res.status(200).json(results)
    })
    .catch(err => {
      console.log({error: err.message})
      res.status(200).json({error: 'Api not available'})
    })
})


router.post('/scan/:webApp', jsonParser, function (req, res, next) {

  const webApp = req.params.webApp
  const provider = new Provider()

  provider.scan(webApp, req.body.username, req.body.sig)
    .then(results => {
      if (results.error) {
        throw(new Error(results.error))
      }
      res.status(200).json(results)
    })
    .catch(err => {
      console.log({error: err.message})

      res.status(200).json({error: err.message})
    })

})

router.get('/gas-info', function (req, res, next) {

  const ethProvider = new EthProvider(req.body.network)

  ethProvider.getGasInfo()
    .then(results => {
      res.status(200).json(results)
    })
    .catch(err => {
      res.status(200).json({error: "Error retrieving gas info"})
    })

})

router.post('/contract-abi', jsonParser, function (req, res, next) {

  const ethProvider = new EthProvider(req.body.network)

  let promises = []
  for (let a of req.body.addresses) {
    promises.push(ethProvider.getAbi(req.body.network, a))
  }

  Promise.all(promises)
    .then(values => {
      res.status(200).json(values)
    })
    .catch(err => {
      res.status(200).json({error: "Error retrieving contract abi"})
    })

})


router.post('/user-id/:webApp', jsonParser, function (req, res, next) {

  const webApp = req.params.webApp
  const provider = new Provider()

  provider.getUserId(webApp, req.body.username)
    .then(result => {
      res.status(200).json(result)
    })
    .catch(err => {
      res.status(200).json({error: err.message})
    })

})


router.post('/data/:webApp', jsonParser, function (req, res, next) {

  const webApp = req.params.webApp
  const provider = new Provider()

  provider.getDataByTID(webApp, req.body.userId)
    .then(result => {
      res.status(200).json(result)
    })
    .catch(err => {
      res.status(200).json({error: err.message})
    })

})


module.exports = router
