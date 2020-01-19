const {sequelize, DataTypes} = require('../db/conn')

const RideAddress = sequelize.define('Ride_Address',{
    RA_S_Id:{
        type:DataTypes.STRING
    }, 
    RA_R_Id:{
        type:DataTypes.INTEGER
    }, 
    RA_Street:{
        type:DataTypes.STRING
    }, 
    RA_City:{
        type:DataTypes.STRING
    }, 
    RA_State:{
        type:DataTypes.STRING
    }, 
    RA_Zip:{
        type:DataTypes.INTEGER
    }
},{
    timestamps:false,
    tableName:'Ride_Address'
})

module.exports = RideAddress