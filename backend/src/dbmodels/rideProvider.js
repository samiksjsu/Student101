const { sequelize, DataTypes } = require('../db/conn')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const University = require('./university')
const RideProviderTokens = require('../dbmodels/rideProviderTokens')

const RideProvider = sequelize.define('RideProvider', {
    P_Drivers_License: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    }, P_Password: {
        type: DataTypes.STRING,
        allowNull: false
    }, P_Name: {
        type: DataTypes.STRING,
        allowNull: false,
    }, P_Phone: {
        type: DataTypes.BIGINT,
        allowNull: false
    }, P_Email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    }, P_University: {
        type: DataTypes.INTEGER,
        allowNull: false
    }, P_Rating: {
        type: DataTypes.FLOAT
    }, P_No_Rating: {
        type: DataTypes.FLOAT
    }
}, {
    tableName: 'Ride_Provider',
    timestamps: false
})

RideProvider.findUId = async function (U_Name, req) {

    const university = await University.findOne({
        where: { U_Name }
    })

    if (!university) {
        const error = new Error()
        error.error = 'No university found'
        error.description = 'Invalid university name'
        error.name = 'Invalid university name'

        throw error
    }

    const U_Id = JSON.parse(JSON.stringify(university)).U_Id
    req.body.P_University = U_Id

};

RideProvider.findByCredentials = async (req) => {
    const rideProvider = await RideProvider.findOne({
        where: {
            P_Email: req.body.email
        }
    })

    if (!rideProvider) {
        const error = new Error();
        error.error = 'Invalid Credentials'
        error.description = 'Invalid Credentials'
        throw error
    }
    const isMatch = await bcrypt.compare(req.body.password, rideProvider.dataValues.P_Password)

    if (!isMatch) {
        const error = new Error();
        error.error = 'Invalid Credentials'
        error.description = 'Invalid Credentials'
        throw error
    }

    // Once there is a match, generate jwt and embed in the request
    const token = jwt.sign({ _id: req.body.email.toString() }, 'rideProviderToken')
    req.token = token

    await RideProviderTokens.create({
        RPT_P_Email: req.body.email,
        RPT_Token: token
    })

    return rideProvider
}


// Class Method
// rideProvider.findByCredentials = function (param, param2) {  };

// Instance Method
// rideProvider.prototype.generateAuthToken = async function () { 
//     const rideProvider = this
//     const token = jwt.sign({_id: rideProvider.P_Drivers_License.toString()}, 'rideProvider')


//  }



module.exports = RideProvider