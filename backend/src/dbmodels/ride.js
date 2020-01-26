const { sequelize, DataTypes } = require('../db/conn')

const Ride = sequelize.define('Ride', {
    R_Id: {
        type: DataTypes.INTEGER
    },
    R_Date: {
        type: DataTypes.DATEONLY
    },
    R_Time: {
        type: DataTypes.TIME,
    },
    R_Rating: {
        type: DataTypes.FLOAT
    },
    R_Starting_Air_Code: {
        type: DataTypes.STRING
    },
    R_Starting_Terminal: {
        type: DataTypes.STRING
    },
    R_Accepted_By: {
        type: DataTypes.STRING
    },
    R_Current: {
        type: DataTypes.INTEGER
    },
    R_Total: {
        type: DataTypes.INTEGER
    },
    R_Status: {
        type: DataTypes.STRING,
        defaultValue: 'Active'
    },
    R_Comments: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false,
    tableName: 'Ride'
})

module.exports = Ride