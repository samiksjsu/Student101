const { sequelize, DataTypes } = require('../db/conn')

const StudentRideAvailed = sequelize.define('StudentRideAvailed', {
    SRA_S_Id: {
        type: DataTypes.STRING,
        allowNull: false
    }, SRA_Ride_Id: {
        type: DataTypes.INTEGER
    }, SRA_Rating: {
        type: DataTypes.FLOAT
    }
}, {
    timestamps: false,
    tableName: 'student_ride_availed'
})