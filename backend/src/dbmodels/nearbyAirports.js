const {sequelize, DataTypes} = require('../db/conn')

const NearByAirports = sequelize.define('NearByAirports', {
    N_U_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    }, 
    N_A_Code: {
        type: DataTypes.STRING,
        allowNull: false,
<<<<<<< HEAD
        primaryKey: true
=======
        primaryKey: true,
>>>>>>> e80e355adfeb2ced2b6267248bf043bcb98db240
    }
}, {
    tableName: 'nearby_airports',
    timestamps: false
})

<<<<<<< HEAD
=======
// // Class Method
// Model.myCustomQuery = function (param, param2) {  };

// // Instance Method
// Model.prototype.myCustomSetter = function (param, param2) {  }

>>>>>>> e80e355adfeb2ced2b6267248bf043bcb98db240
module.exports = NearByAirports