const { sequelize, DataTypes } = require('../db/conn')

const StudentRideAvailed = sequelize.define('StudentRideAvailed', {
    SRA_S_Id: {
        type: DataTypes.STRING,
        primaryKey: true
    }, SRA_Ride_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    }, SRA_Rating: {
        type: DataTypes.FLOAT
    }, SRA_RRBS_Id: {
        type: DataTypes.INTEGER
    }, SRA_RPBP_Id: {
        type: DataTypes.INTEGER
    }, SRA_Seats: {
        type: DataTypes.INTEGER
    }, SRA_Status: {
        type: DataTypes.STRING
    }, SRA_Comments: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false,
    tableName: 'student_ride_availed'
})

module.exports = StudentRideAvailed