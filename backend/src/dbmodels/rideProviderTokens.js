const {sequelize, DataTypes} = require('../db/conn')

const RideProviderTokens = sequelize.define('RideProviderTokens', {
    RPT_P_Email: {
        type: DataTypes.STRING,
        primaryKey: true,
        validate: {
            isEmail: true
        } 
    },
    RPT_Token: {
        type: DataTypes.STRING,
        primaryKey: true
    }
}, {
    timestamps: false,
    tableName: 'ride_provider_tokens'
})

module.exports = RideProviderTokens