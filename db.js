const {Sequelize} = require('sequelize')


module.exports = new Sequelize (
  'telegram-bot',
  'postgres',
  '123',
  {
    host: 'localhost',
    port: '5432',
    dialect: 'postgres'
  }
)