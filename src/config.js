require('dotenv').config()
const config = {
  address: process.env.API_ADDRESS,
  token: process.env.API_TOKEN
}

module.exports = config
