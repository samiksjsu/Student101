const {sequelize, DataTypes} = require('../db/conn')

const RidesRequestedByStudent = sequelize.define('Rides_Requested_By_Student',{
    RRBS_Id:{
        type:DataTypes.INTEGER,
        primaryKey: true
    },
    RRBS_S_Id:{
        type:DataTypes.STRING,
        allowNull:false
    }, 
    RRBS_Date:{
        type:DataTypes.DATEONLY,
        allowNull:false
    }, 
    RRBS_Time:{
        type:DataTypes.TIME,
        allowNull:false
    }, 
    RRBS_Air_Code:{
        type:DataTypes.STRING,
        allowNull:false
    }, 
    RRBS_T_Number:{
        type:DataTypes.STRING,
        allowNull:false
    }, 
    RRBS_Seats:{
        type:DataTypes.INTEGER,
        allowNull:false
    }, 
    RRBS_Street:{
        type:DataTypes.STRING,
        allowNull:false
    }, 
    RRBS_City:{
        type:DataTypes.STRING,
        allowNull:false
    }, 
    RRBS_State:{
        type:DataTypes.STRING,
        allowNull:false
    }, 
    RRBS_Zip:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    RRBS_Status:{
        type:DataTypes.STRING,
        defaultValue: 'Pending'
    },
    RRBS_Comments: {
        type: DataTypes.STRING
    }  
},{
    timestamps:false,
    tableName:'Rides_Requested_By_Student'
})

module.exports = RidesRequestedByStudent