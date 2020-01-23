// npm libraries
const { sequelize, DataTypes, Sequelize } = require('../db/conn')
const express = require('express')
const bcrypt = require('bcrypt')
const sendEmail = require('../mail/conn')
const moment = require('moment')

// Models
const Student = require('../dbmodels/student')
const RideProvider = require('../dbmodels/rideProvider')
const RidesRequestedByStudent = require('../dbmodels/ridesRequestedByStudent')
const Ride = require('../dbmodels/ride')
const RidesPostedByProvider = require('../dbmodels/ridesPostedByProvider')
const StudentRideAvailed = require('../dbmodels/studentRideAvailed')
const RideAddress = require('../dbmodels/rideAddress')
const RideProviderRideProvided = require('../dbmodels/rideProviderRideProvided')

const router = new express.Router()

// Student sign up
router.post('/StudentSignUp', async (req, res) => {
    try {
        await Student.findUId(req.body.S_University, req)
        req.body.S_Password = await bcrypt.hash(req.body.S_Password, 8)
        const student = await Student.create(req.body)
        delete student.dataValues.S_Password
        res.status(201).send(student)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Student Login
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

        const rideRequestedByStudent = await RidesRequestedByStudent.create(req.body, {
            fields: ['RRBS_S_Id', 'RRBS_Date', 'RRBS_Time', 'RRBS_Air_Code', 'RRBS_T_Number',
                'RRBS_Seats', 'RRBS_Street', 'RRBS_City', 'RRBS_State', 'RRBS_Zip']
        })

        res.status(201).send(rideRequestedByStudent)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Get fresh rides
router.get('/GetBrandNewRidesPostedByProvider', async (req, res) => {
    try {
        const { gte, gt, in: opIn } = Sequelize.Op;
        const ridesPostedByProvider = await RidesPostedByProvider.findAll({
            where: {
                RPBP_Total: {
                    [gte]: req.body.seats
                },
                RPBP_Current: 0,
                RPBP_From: req.body.from,
                RPBP_Date: req.body.travelDate
            }
        })

        //console.log(ridesPostedByProvider)
        res.send(ridesPostedByProvider)

    } catch (e) {
        res.status(400).send(e)
    }
})

// Get already booked rides
router.get('/GetAlreadyBookedRidesForStudent', async (req, res) => {
    try {

        const { gte, gt, between, in: opIn } = Sequelize.Op;
        const rides = await Ride.findAll({
            attributes: ['R_Id', 'R_Date', 'R_Time', 'R_Rating', 'R_Starting_Air_Code', 'R_Starting_Terminal', 'R_Accepted_By', 'R_Current', 'R_Total'],
            where: {
                R_Date: req.body.travelDate,
                R_Starting_Air_Code: req.body.from,
                R_Total: {
                    [gte]: sequelize.literal('Ride.R_Current + ' + req.body.seats)
                }
            }
        })

        res.send(rides)

    } catch (e) {
        res.status(400).send(e)
    }
})

// Book fresh rides for student
router.post('/BookRideForStudent', async (req, res) => {

    const transaction = await sequelize.transaction()

    try {
        const ridesPostedByProvider = await RidesPostedByProvider.findOne({
            where: {
                RPBP_ID: req.body.RPBP_Id
            }, transaction
        })

        const rideObject = {
            R_Date: ridesPostedByProvider.dataValues.RPBP_Date,
            R_Time: ridesPostedByProvider.dataValues.RPBP_Time,
            R_Rating: 0.0,
            R_Starting_Air_Code: ridesPostedByProvider.dataValues.RPBP_From,
            R_Starting_Terminal: req.body.Terminal,
            R_Accepted_By: ridesPostedByProvider.dataValues.RPBP_Drivers_License,
            R_Current: req.body.seats,
            R_Total: ridesPostedByProvider.dataValues.RPBP_Total
        }

        const ride = await Ride.create(rideObject, {
            fields: ['R_Date', 'R_Time', 'R_Rating', 'R_Starting_Air_Code',
                'R_Starting_Terminal', 'R_Accepted_By', 'R_Current', 'R_Total'],
            transaction
        })

        const studentRideAvailed = await StudentRideAvailed.create({
            SRA_S_Id: req.body.S_Id,
            SRA_Ride_Id: ride.dataValues.id,
            SRA_Rating: 0.0,
            SRA_RPBP_Id: req.body.RPBP_Id,
            SRA_Seats: req.body.seats,
            SRA_Status: 'Active'
        }, {
            transaction
        })

        const rideProviderRideProvider = await RideProviderRideProvided.create({
            RPRP_P_Drivers_License: ridesPostedByProvider.dataValues.RPBP_Drivers_License,
            RPRP_R_Id: ride.dataValues.id,
            RPRP_S_Id: req.body.S_Id,
            RPRP_RPBP_Id: req.body.RPBP_Id
        }, {
            fields: ['RPRP_P_Drivers_License', 'RPRP_R_Id', 'RPRP_S_Id', 'RPRP_RPBP_Id'],
            transaction
        })

        const rideAddress = await RideAddress.create({
            RA_S_Id: req.body.S_Id,
            RA_R_Id: ride.dataValues.id,
            RA_Street: req.body.Street,
            RA_City: req.body.City,
            RA_State: req.body.State,
            RA_Zip: req.body.Zip
        }, {
            fields: ['RA_S_Id', 'RA_R_Id', 'RA_Street', 'RA_City', 'RA_State', 'RA_Zip'],
            transaction
        })

        await RidesPostedByProvider.update({
            RPBP_Current: req.body.seats,
            RPBP_Status: 'Accepted'
        }, {
            where: {
                RPBP_ID: req.body.RPBP_Id
            },
            transaction
        })

        await transaction.commit()

        const rideProvider = await RideProvider.findByPk(ride.dataValues.R_Accepted_By)
        const student = await Student.findByPk(req.body.S_Id)

        // Construct email objects

        // 1. Email for ride provider
        const rideProviderEmailObject = {
            type: 'Ride Provider',
            rideProviderName: rideProvider.dataValues.P_Name,
            from: ride.dataValues.R_Starting_Air_Code,
            to: req.body.Street.toString() + ', ' + req.body.City.toString() + ', ' + req.body.State.toString() + ', ' + req.body.Zip.toString(),
            date: moment(new Date(ride.dataValues.R_Date)).format('dddd MMMM D Y'),
            time: moment(new Date(ride.dataValues.R_Date + ',' + ride.dataValues.R_Time)).format('h:mm:ss a'),
            studentName: student.dataValues.S_Name,
            studentEmail: student.dataValues.S_Email,
            studentPhone: student.dataValues.S_Phone,
            seats: req.body.seats,
            toEmail: rideProvider.dataValues.P_Email
        }

        // 2. Email for Student
        const studentEmailObject = {
            type: 'Student',
            studentName: student.dataValues.S_Name,
            from: ride.dataValues.R_Starting_Air_Code,
            to: req.body.Street.toString() + ', ' + req.body.City.toString() + ', ' + req.body.State.toString() + ', ' + req.body.Zip.toString(),
            date: moment(new Date(ride.dataValues.R_Date)).format('dddd MMMM D Y'),
            time: moment(new Date(ride.dataValues.R_Date + ',' + ride.dataValues.R_Time)).format('h:mm:ss a'),
            seats: req.body.seats,
            rideProviderName: rideProvider.dataValues.P_Name,
            rideProviderEmail: rideProvider.dataValues.P_Email,
            rideProviderPhone: rideProvider.dataValues.P_Phone,
            toEmail: student.dataValues.S_Email
        }

        await sendEmail(rideProviderEmailObject)
        await sendEmail(studentEmailObject)

        res.status(201).send('Ride Successfully Booked')
    } catch (e) {
        await transaction.rollback()
        res.status(400).send(e)
    }
})

// Book already booked rides
router.post('/BookAlreadyBookedRidesForStudent', async (req, res) => {

    // Steps:
    // Get the ride id which we will be updating (available from request)
    // Insert the same into student ride availed and ride address tables
    // construct email body deatils for ride provider and student separately and send email;

    const transaction = await sequelize.transaction()

    try {
        await Ride.update({
            R_Current: sequelize.literal('Ride.R_Current + ' + req.body.seats)
        }, {
            where: {
                R_Id: req.body.R_Id
            }, transaction
        })

        const ride = await Ride.findOne({
            attributes: ['R_Id', 'R_Date', 'R_Time', 'R_Rating', 'R_Starting_Air_Code', 'R_Starting_Terminal', 'R_Accepted_By',
                'R_Current', 'R_Total', 'R_Status'],
            where: {
                R_Id: req.body.R_Id
            }, transaction
        })

        const rideProviderRideProvided = await RideProviderRideProvided.findOne({
            attributes: ['RPRP_Id', 'RPRP_P_Drivers_License', 'RPRP_R_Id', 'RPRP_S_Id', 
                        'RPRP_RPBP_Id', 'RPRP_RRBS_Id', 'RPRP_Status'],
            where: {
                RPRP_R_Id: req.body.R_Id
            }, transaction
        })
        
        await RideProviderRideProvided.create({
            RPRP_P_Drivers_License: rideProviderRideProvided.dataValues.RPRP_Drivers_License,
            RPRP_R_Id: rideProviderRideProvided.dataValues.RPRP_R_Id,
            RPRP_S_Id: req.body.S_Id,
            RPRP_RPBP_Id: rideProviderRideProvided.dataValues.RPRP_RPBP_Id
        }, {
            fields: ['RPRP_P_Drivers_License', 'RPRP_R_Id', 'RPRP_S_Id', 'RPRP_RPBP_Id'],
            transaction
        })

        const studentRideAvailed = await StudentRideAvailed.create({
            SRA_S_Id: req.body.S_Id,
            SRA_Ride_Id: req.body.R_Id,
            SRA_Rating: 0.0,
            SRA_RPBP_Id: rideProviderRideProvided.dataValues.RPRP_RPBP_Id,
            SRA_Seats: req.body.seats,
            SRA_Status: 'Active'
        }, {
            transaction
        })

        const rideAddress = await RideAddress.create({
            RA_S_Id: req.body.S_Id,
            RA_R_Id: ride.dataValues.R_Id,
            RA_Street: req.body.Street,
            RA_City: req.body.City,
            RA_State: req.body.State,
            RA_Zip: req.body.Zip
        }, {
            fields: ['RA_S_Id', 'RA_R_Id', 'RA_Street', 'RA_City', 'RA_State', 'RA_Zip'],
            transaction
        })

        await RideProviderRideProvided.create({
            RPRP_P_Drivers_License: ride.dataValues.R_Accepted_By,
            RPRP_R_Id: req.body.R_Id,
            RPRP_S_Id: req.body.S_Id,
            RPRP_RPBP_Id: rideProviderRideProvided.dataValues.RPRP_Id
        }, {
            fields: ['RPRP_P_Drivers_License', 'RPRP_R_Id', 'RPRP_S_Id', 'RPRP_RPBP_Id'],
            transaction
        })

        await transaction.commit()

        const rideProvider = await RideProvider.findByPk(ride.dataValues.R_Accepted_By)

        const student = await Student.findByPk(req.body.S_Id)

        // Construct email objects

        // 1. Email for student
        // Name, from, to, date, time, rideprovider, rideProvider Email, rideprovider ph number

        const rideProviderEmailObject = {
            type: 'Ride Provider',
            rideProviderName: rideProvider.dataValues.P_Name,
            from: ride.dataValues.R_Starting_Air_Code,
            to: req.body.Street.toString() + ', ' + req.body.City.toString() + ', ' + req.body.State.toString() + ', ' + req.body.Zip.toString(),
            date: moment(new Date(ride.dataValues.R_Date)).format('dddd MMMM D Y'),
            time: moment(new Date(ride.dataValues.R_Date + ',' + ride.dataValues.R_Time)).format('h:mm:ss a'),
            studentName: student.dataValues.S_Name,
            studentEmail: student.dataValues.S_Email,
            studentPhone: student.dataValues.S_Phone,
            seats: req.body.seats,
            toEmail: rideProvider.dataValues.P_Email
        }

        // 2. Email for ride provider
        // Name, from, to, date, time, student, student Email, student ph number

        const studentEmailObject = {
            type: 'Student',
            studentName: student.dataValues.S_Name,
            from: ride.dataValues.R_Starting_Air_Code,
            to: req.body.Street.toString() + ', ' + req.body.City.toString() + ', ' + req.body.State.toString() + ', ' + req.body.Zip.toString(),
            date: moment(new Date(ride.dataValues.R_Date)).format('dddd MMMM D Y'),
            time: moment(new Date(ride.dataValues.R_Date + ',' + ride.dataValues.R_Time)).format('h:mm:ss a'),
            seats: req.body.seats,
            rideProviderName: rideProvider.dataValues.P_Name,
            rideProviderEmail: rideProvider.dataValues.P_Email,
            rideProviderPhone: rideProvider.dataValues.P_Phone,
            toEmail: student.dataValues.S_Email
        }

        await sendEmail(rideProviderEmailObject)
        await sendEmail(studentEmailObject)

        res.status(201).send('Ride booked successfully')
    } catch (e) {
        await transaction.rollback()
        res.status(400).send(e)
    }
})

// Get upcoming rides for student
router.get('/GetUpcomingRidesForStudent', async (req, res) => {
    try {

        const upcomingRides = await sequelize.query("select R_Id, R_Date, R_Time, R_Starting_Air_Code," + 
        "R_Starting_Terminal, P_Name from ride r join student_ride_availed sra on r.R_Id = sra.SRA_Ride_Id " +
        "join ride_provider rp on rp.P_Drivers_License = r.R_Accepted_By " +
        "where sra.SRA_S_Id = " + req.body.SRA_S_Id + " and R_Date > '" + 
        (new Date().getFullYear() + '-' + new Date().getMonth() + 1 + '-' + new Date().getDate()) + "'")

        res.send(upcomingRides[0])

    } catch (e) {
        res.status(400).send()
    }
})

// Get Requessted Rides
router.get('/GetRequestedRidesForStudent', async (req, res) => {

    // Get the student id from req
    // Get all the rides for the student from student ride availed that are pending

    try {
        const { gte } = Sequelize.Op
        requestedRides = await StudentRideAvailed.findAll({
            attributes: ['RRBS_Id', 'RRBS_Date', 'RRBS_Time', 
                         'RRBS_Air_Code', 'RRBS_T_Number', 'RRBS_Seats', 
                         'RRBS_Street', 'RRBS_City', 'RRBS_State', 'RRBS_Zip', 
                         'RRBS_Status'],
            where: {
                RRBS_S_Id: req.S_Id,
                RRBS_Status: 'Pending',
                RRBS_Date: {
                    [gte] :Sequelize.literal((new Date().getFullYear() + '-' + 
                                              new Date().getMonth() + 1 + '-' + 
                                              new Date().getDate()))
                }
            }
        })

        res.send(requestedRides)
    } catch (e) {
        res.status(400).send(e)
    }

})

// Cancel ride booked by student
router.post('/CancelRideBookedByStudent', async (req, res) => {

    const transaction = sequelize.transaction()
    try {
        const R_Id = req.body.R_Id
        const S_Id = req.body.S_Id

        await StudentRideAvailed.update({
            SRA_Status: 'Cancelled'
        }, {
            where: {
                SRA_Ride_Id: req.body.R_Id,
                SRA_S_Id: req.body.S_Id
            }, transaction
        })

        const studentRideAvailed = await StudentRideAvailed.findOne({
            attributes: ['SRA_S_Id', 'SRA_Ride_Id', 'SRA_Rating', 'SRA_RRBS_Id', 'SRA_RPBP_Id', 'SRA_Status', 'SRA_Seats'],
            where: {
                SRA_Ride_Id: req.body.R_Id,
                SRA_S_Id: req.body.S_Id
            }, transaction
        })

        await Ride.update({
            R_Current: sequelize.literal('Ride.R_Current - ' + studentRideAvailed.dataValues.SRA_Seats)
        }, {
            where: {
                R_Id: req.body.R_Id
            }, transaction
        })

        const ride = await Ride.findOne({
            attributes: ['R_Id', 'R_Date', 'R_Time', 'R_Rating', 'R_Starting_Air_Code', 
                        'R_Starting_Terminal', 'R_Accepted_By', 'R_Current', 'R_Total', 'R_Status'],
            where: {
                R_Id: req.body.R_Id
            }, transaction
        })

        const rideAddress = await RideAddress.findOne({
            where: {
                RA_S_Id: req.body.S_Id,
                RA_R_Id: req.body.R_Id
            }, transaction
        })

        await rideAddress.destroy({
            transaction
        })

        
        await RideProviderRideProvided.update({
            RPRP_Status: 'Cancelled'
        }, {
            where: {
                RPRP_R_Id: req.body.R_Id,
                RPRP_S_Id: req.body.S_Id
            }, transaction
        })

        if (studentRideAvailed.dataValues.SRA_RRBS_Id) {
            const rideRequestedByStudent = RidesRequestedByStudent.findOne({
                attributes: ['RRBS_Id', 'RRBS_S_Id', 'RRBS_Date', 'RRBS_Time', 'RRBS_Air_Code', 'RRBS_T_Number', 
                            'RRBS_Seats', 'RRBS_Street', 'RRBS_City', 'RRBS_State', 'RRBS_Zip', 'RRBS_Status'],
                where: {
                    RRBS_Id: studentRideAvailed.dataValues.SRA_RRBS_Id
                }
            })

            await RidesPostedByProvider.update({
                RRBS_Status: 'Pending'
            }, {
                where: {
                    RRBS_Id: rideRequestedByStudent.dataValues.RRBS_Id
                }
            })
        }

        if (ride.dataValues.R_Current === 0) {
            await Ride.update({
                R_Status: 'Cancelled'
            }, {
                where: {
                    R_Id: req.body.R_Id
                }, transaction
            })

            if (studentRideAvailed.dataValues.SRA_RPBP_Id) {
                
                const rideProviderRideProvided = await RideProviderRideProvided.findOne({
                    where: {
                        RPRP_R_Id: req.body.R_Id
                    }, transaction
                })
    
                await RidesPostedByProvider.update({
                    RPBP_Status: 'Pending'
                }, {
                    where: {
                        RPBP_Id: studentRideAvailed.dataValues.SRA_RPBP_Id
                    }, transaction
                })
            } 
        }

        await transaction.commit()

        res.status(201).send()

    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router