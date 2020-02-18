
let express = require('express')
let app = express()
let config = require('./config')
let bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.listen(config.port, '0.0.0.0', () => {
  console.log(`'listening on ${config.port}'`)
})

app.get('/', (req, res) => {
  console.log('got connection!', req.body)
  res.send("hi")
})

module.exports = app
