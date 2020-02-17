require('dotenv').config()
const config = {
  address: process.env.API_ADDRESS,
  token: process.env.API_TOKEN,
  mode: process.env.MODE || "sync"
}

module.exports = config
