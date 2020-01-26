const { sequelize, DataTypes } = require('../db/conn')

const RideProviderRideProvided = sequelize.define('Ride_Provider_Ride_Provided', {
    RPRP_Id: {
        type: DataTypes.INTEGER
    }, RPRP_P_Drivers_License: {
        type: DataTypes.INTEGER
    }, RPRP_R_Id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }, RPRP_S_Id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }, RPRP_RPBP_Id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }, RPRP_RRBS_Id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }, RPRP_Status: {
        type: DataTypes.STRING
    }, RPRP_Rating: {
        type: DataTypes.FLOAT
    }, RPRP_Comments: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'Ride_Provider_Ride_Provided',
    timestamps: false
})

module.exports = RideProviderRideProvided