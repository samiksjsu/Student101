const { sequelize, DataTypes } = require('../db/conn')
const University = require('./university')
const bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')
const Student_Tokens = require('./studentTokens')

const Student = sequelize.define('Student', {
    S_Id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    S_Name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    S_Email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    S_Password: {
        type: DataTypes.STRING,
        allowNull: false

    }, S_Phone: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
        validate: {
            len: 10
        }
    },
    S_University: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    S_Rating:{
        type:DataTypes.FLOAT
    },
    S_Rated_By:{
        type:DataTypes.INTEGER
    }

}, {
    tableName: 'Student',
    timestamps: false
})

//class function

Student.findByCredentials = async (req) => {
    const student = await Student.findOne({
        where: {
            S_Email: req.body.S_Email
        }
    })

    if (!student) {
        const error = new Error()
        error.message = 'Invalid Credentials'
        error.description = 'Invalid Credentials'
        throw error
    }

    const isMatch = await bcrypt.compare(req.body.S_Password, student.dataValues.S_Password)

    if (!isMatch) {
        const error = new Error()
        error.message = 'Invalid Credentials'
        error.description = 'Invalid Credentials'
        throw error
    }

    const token = jwt.sign({ _id: req.body.S_Email }, 'studentToken')
    req.token = token
    const student_tokens = await Student_Tokens.create({ ST_S_Email: req.body.S_Email, ST_Token: token })
    return student

}

Student.findUId = async function (U_Name, req) {

    const university = await University.findOne({
        where: {
            U_Name: U_Name
        }
    })

    if (!university) {
        const error = new Error()
        error.error = 'No university found'
        error.description = 'Invalid University Name'
        error.message = 'Invalid University Name'
        throw error
    }

    const U_Id = JSON.parse(JSON.stringify(university)).U_Id
    req.body.S_University = U_Id

}

//instance function



module.exports = Student