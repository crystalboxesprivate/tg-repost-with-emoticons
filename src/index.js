let express = require('express')
let api = require('./api')

const { Functions } = api

setInterval(() => {
  console.log('get updates')
  api.send(Functions.getUpdates).then(data => {
    console.log(data)
  }).catch(err => console.log(err))
}, 1000)

