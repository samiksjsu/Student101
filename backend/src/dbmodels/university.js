const {sequelize, DataTypes} = require('../db/conn')

const University = sequelize.define('University', {
    // Model attributes are defined here
    U_Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    U_Name: {
      type: DataTypes.STRING
      // allowNull defaults to true
    },
    U_State: {
        type: DataTypes.STRING
    }, 
    U_City: {
        type: DataTypes.STRING
    }, 
    U_Street: {
        type: DataTypes.STRING
    }, 
    U_Zip: {
        type: DataTypes.STRING
    }
  }, {
    // Other model options go here
    tableName: 'university',
    timestamps: false
  });

  module.exports = University