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
        primaryKey: true
    }
}, {
    tableName: 'nearby_airports',
    timestamps: false
})

module.exports = NearByAirports