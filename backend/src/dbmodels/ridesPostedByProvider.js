const {sequelize, DataTypes} = require('../db/conn')

const RidesPostedByProvider = sequelize.define('RidesPostedByProvider', {
    RPBP_Id: {

        type: DataTypes.INTEGER

    }, RPBP_Drivers_License: {

        type: DataTypes.STRING,
        allowNull: false

    }, RPBP_Date: {

        type: DataTypes.DATE,
        allowNull: false

    }, RPBP_Time: {

        type: DataTypes.TIME,
        allowNull: false

    }, RPBP_From: {

        type: DataTypes.STRING,
        allowNull: false

    }, RPBP_Current: {

        type: DataTypes.STRING,
        allowNull: false

    }, RPBP_Total: {

        type: DataTypes.INTEGER,
        allowNull: false

    }
}, {
    timestamps: false,
    tableName: 'rides_posted_by_provider'
})

module.exports = RidesPostedByProvider