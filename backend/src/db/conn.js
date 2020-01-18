const { Sequelize, DataTypes } = require('sequelize');

// Option 2: Passing parameters separately (other dialects)
const sequelize = new Sequelize('ISHelper', 'ISAdmin', 'ISAdmin', {
    host: 'localhost',
    dialect: 'mysql'
  });

  sequelize.authenticate().then(() => {
      console.log('Successfully connected to database')
  }).catch((e) => {
      console.log('Unsuccessful Connection', e)
  })

  module.exports = {
      Sequelize,
      DataTypes,
      sequelize
  }