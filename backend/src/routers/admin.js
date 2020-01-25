const { sequelize, DataTypes, Sequelize } = require('../db/conn')
const express = require('express')
const router = new express.Router()

// DB Models
const RideProvider = require('../dbmodels/rideProvider')
const Student = require('../dbmodels/student')

// Get all ride providers
router.get('/getAllRideProviders', async (req, res) => {

    try {
        const rideProviders = await RideProvider.findAll({
            attributes: ['P_Drivers_License', 'P_Name', 'P_Phone', 'P_Email', 'P_University']
        })
        res.send(rideProviders)
    } catch (e) {
        res.status(400).send(e)
    }

})

router.get('/getAllStudents', async (req, res) => {

    try {
        const students = await Student.findAll({
            attributes: ['S_Id', 'S_Name', 'S_Email', 'S_Phone', 'S_University']
        })
        res.send(students)
    } catch (e) {
        res.status(400).send(e)
    }

})



module.exports = router