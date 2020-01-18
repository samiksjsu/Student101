const {sequelize, DataTypes} = require('../db/conn')

const Student_Tokens = sequelize.define('Student_Tokens',{
    ST_S_Email:{
        type:DataTypes.STRING,
        validate:{
            isEmail:true
        },
        primaryKey:true
    },
    ST_Token:{
        type:DataTypes.STRING,
        unique:true,
        primaryKey:true
    }
},{
    timestamps:false,
    tableName:'Student_Tokens'
})

module.exports = Student_Tokens