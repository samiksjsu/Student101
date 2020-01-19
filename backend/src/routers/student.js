const { sequelize, DataTypes, Sequelize } = require('../db/conn')

const express = require('express')
const bcrypt = require('bcrypt')

//models
const Student = require('../dbmodels/student')
const RidesRequestedByStudent = require('../dbmodels/ridesRequestedByStudent')
const Ride = require('../dbmodels/ride')
const RidesPostedByProvider = require('../dbmodels/ridesPostedByProvider')
const StudentRideAvailed = require('../dbmodels/studentRideAvailed')
const RideAddress = require('../dbmodels/rideAddress')

const router = new express.Router()

//student sign up
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

//Book fresh rides for student
router.post('/BookRideForStudent',async(req,res)=>{
    try{
        const ridesPostedByProvider = await RidesPostedByProvider.findOne({RPBP_Id:req.body.RPBP_Id})

        //console.log(ridesPostedByProvider)

        const rideObject = {
            R_Date: ridesPostedByProvider.dataValues.RPBP_Date,
            R_Time: ridesPostedByProvider.dataValues.RPBP_Time,
            R_Rating: 0.0,
            R_Starting_Air_Code: ridesPostedByProvider.dataValues.RPBP_From,
            R_Starting_Terminal:req.body.Terminal ,
            R_Accepted_By: ridesPostedByProvider.dataValues.RPBP_Drivers_License,
            R_Current: req.body.Seats,
            R_Total: ridesPostedByProvider.dataValues.RPBP_Total
        }

        const ride = await Ride.create(rideObject, {
            fields: ['R_Date', 'R_Time', 'R_Rating', 'R_Starting_Air_Code',
                'R_Starting_Terminal', 'R_Accepted_By', 'R_Current', 'R_Total']
        })

        //console.log('Data inserted into ride')

        const studentRideAvailed = await StudentRideAvailed.create({
            SRA_S_Id: req.body.S_Id,
            SRA_Ride_Id: ride.dataValues.id, 
            SRA_Rating: 0.0
        })

        //console.log('data inserted into student ride availed')

        const rideAddress = await RideAddress.create({
            RA_S_Id: req.body.S_Id, 
            RA_R_Id: ride.dataValues.id, 
            RA_Street: req.body.Street, 
            RA_City: req.body.City, 
            RA_State: req.body.State, 
            RA_Zip: req.body.Zip
        }, {
            fields: ['RA_S_Id', 'RA_R_Id', 'RA_Street', 'RA_City', 'RA_State', 'RA_Zip']
        })

        //console.log('Data inserted into ride addresses')

        await RidesPostedByProvider.update({
            RPBP_Status: 'Accepted'
        }, {
            where: {
                RPBP_ID:req.body.RPBP_Id
            }
        })

        res.status(201).send('Ride Successfully Booked')
    }catch(e){
        res.status(400).send(e)
    }
})

//get fresh rides

module.exports = router