const {sequelize, DataTypes} = require('../db/conn')

const University = sequelize.define('University', {
    // Model attributes are defined here
    U_Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
<<<<<<< HEAD
      primaryKey:true
=======
      primaryKey: true
>>>>>>> e80e355adfeb2ced2b6267248bf043bcb98db240
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
<<<<<<< HEAD
    timestamps:false
=======
    timestamps: false
>>>>>>> e80e355adfeb2ced2b6267248bf043bcb98db240
  });

  module.exports = University