const { sequelize, DataTypes, Sequelize } = require('../db/conn')

const express = require('express')
const bcrypt = require('bcrypt')

//models
const Student = require('../dbmodels/student')
const RidesRequestedByStudent = require('../dbmodels/ridesRequestedByStudent')
const router = new express.Router()

router.post('/StudentSignUp', async (req, res) => {
    try {
        await Student.findUId(req.body.S_University, req)
        req.body.S_Password = await bcrypt.hash(req.body.S_Password, 8)
        const student = await Student.create(req.body)
        delete student.dataValues.S_Password
        console.log('Student Signup Successful', student)
        res.status(201).send(student)
    } catch (e) {
        res.status(400).send(e)
    }
})

//Login
router.post('/StudentLogin', async (req, res) => {
    try {
        console.log(req.body)
        const student = await Student.findByCredentials(req)
        delete student.dataValues.S_Password
        res.send({
            student,
            token: req.token
        })
    } catch (e) {
        res.status(401).send(e)
    }
})

// StudentRideRequest
router.post('/StudentRideRequest', async (req, res) => {
    try {
        req.body.RRBS_Status = 'Pending'

        console.log(req.body)
        const rideRequestedByStudent = await RidesRequestedByStudent.create(req.body, {
            fields: ['RRBS_S_Id', 'RRBS_Date', 'RRBS_Time', 'RRBS_Air_Code', 'RRBS_T_Number', 'RRBS_Seats', 'RRBS_Street', 'RRBS_City', 'RRBS_State', 'RRBS_Zip', 'RRBS_Status']
        })
        res.status(201).send(rideRequestedByStudent)
    } catch (e) {
        res.status(400).send(e)
    }
})



module.exports = router