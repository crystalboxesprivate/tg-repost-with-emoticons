let express = require('express')
let api = require('./api')

const { Functions } = api
api.fetchUpdates(data => {
  if (typeof data === 'string') { data = JSON.parse(data) }
  console.log(data)
})


