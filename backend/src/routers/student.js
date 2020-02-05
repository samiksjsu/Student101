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

    /*
    Input:
    ------

    1. 'RRBS_S_Id', 'RRBS_Date', 'RRBS_Time', 'RRBS_Air_Code', 'RRBS_T_Number',
        'RRBS_Seats', 'RRBS_Street', 'RRBS_City', 'RRBS_State', 'RRBS_Zip', 'RRBS_Comments'

    2. Note: Comments field must be passed as RRBS_Comments as the object is directly being passed as object

    */
   const transaction = await sequelize.transaction()
    try {
        req.body.RRBS_Date = new Date(req.body.RRBS_Date)
        const isAlreadyRequested = await RidesRequestedByStudent.findOne({
            where: {
                RRBS_S_Id: req.body.RRBS_S_Id,
                RRBS_Date: req.body.RRBS_Date
            }, transaction
        })
        var rideRequestedByStudent = null

        if(!isAlreadyRequested) {
            rideRequestedByStudent = await RidesRequestedByStudent.create(req.body, {
                fields: ['RRBS_S_Id', 'RRBS_Date', 'RRBS_Time', 'RRBS_Air_Code', 'RRBS_T_Number',
                    'RRBS_Seats', 'RRBS_Street', 'RRBS_City', 'RRBS_State', 'RRBS_Zip', 'RRBS_Comments'],
                    transaction
            })
        } else {
            const error = new Error()
            error.message = 'Request already exists for same day'
            error.description = 'Cannot book 2 rides for same day'
            throw error
        }

        await transaction.commit()
        res.status(201).send(rideRequestedByStudent)
    } catch (e) {
        await transaction.rollback()
        res.status(400).send(e)
    }
})

// Get fresh rides
router.get('/GetBrandNewRidesPostedByProvider', async (req, res) => {
    try {
        req.body.travelDate = new Date(req.body.travelDate)
        const { gte, gt, eq, in: opIn } = Sequelize.Op;
        const ridesPostedByProvider = await RidesPostedByProvider.findAll({
            where: {
                RPBP_Total: {
                    [gte]: req.body.seats
                },
                RPBP_Current: 0,
                RPBP_From: req.body.from,
                RPBP_Date: req.body.travelDate,
                RPBP_Status: {
                    [eq] : 'Pending'
                }
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
        req.body.travelDate=new Date(req.body.travelDate)
        const { gte, eq } = Sequelize.Op;
        const rides = await Ride.findAll({
            attributes: ['R_Id', 'R_Date', 'R_Time', 'R_Rating', 'R_Starting_Air_Code', 'R_Starting_Terminal', 'R_Accepted_By', 'R_Current', 'R_Total'],
            where: {
                R_Date: req.body.travelDate,
                R_Starting_Air_Code: req.body.from,
                R_Total: {
                    [gte]: sequelize.literal('Ride.R_Current + ' + req.body.seats)
                },
                R_Status: {
                    [eq]: 'Active'
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
            RPRP_P_Drivers_License: rideProviderRideProvided.dataValues.RPRP_P_Drivers_License,
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

// Get Requested Rides
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
                    [gte]: Sequelize.literal((new Date().getFullYear() + '-' +
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

    const transaction = await sequelize.transaction()
    try {
        const R_Id = req.body.R_Id
        const S_Id = req.body.S_Id
        const Comments = req.body.Comments

        /*
        Steps:
        ------

        1. Mark the ride as cancelled in student_ride_availed
        2. Redeuce the same number of seats from ride table for this ride number. Ride number is avilable from SRA_R_Id
        3. Since ride is now cancelled, we need to delete the same address from ride_address table
        4. Ride provider should also know about the cancellation, hence mark the ride cancelled at ride_provider_ride_provided
        5. 2 conditions: 
            a. If this was a student request that was approved, mark the request as pending
            b. If the current seats has become 0 in the ride table and it was initially , mark the reqest in the ride_posted_by_provider as pending
               and mark the ride as cancelled.
        */

        /*
        Inputs:
        -------

        1. Ride to be cancelled as R_Id
        2. Student id of the student cancelling the ride as S_Id
        3. Comments to be posted as reason as Comments
        */


        // 1st mark the ride as cancelled in student ride availed
        await StudentRideAvailed.update({
            SRA_Status: 'Cancelled',
            SRA_Comments: 'Ride cancelled by student.\n' + Comments
        }, {
            where: {
                SRA_Ride_Id: R_Id,
                SRA_S_Id: S_Id
            }, transaction
        })

        // Get the details of the ride from student_ride_availed.
        // Because there are details such as whether it was a ride provider request, a student request and no. of seats
        // that would be required later.
        const studentRideAvailed = await StudentRideAvailed.findOne({
            attributes: ['SRA_S_Id', 'SRA_Ride_Id', 'SRA_Rating', 'SRA_RRBS_Id', 'SRA_RPBP_Id', 'SRA_Status', 'SRA_Seats'],
            where: {
                SRA_Ride_Id: R_Id,
                SRA_S_Id: S_Id
            }, transaction
        })

        // Substract the same number of seats from the ride in ride table
        await Ride.update({
            R_Current: sequelize.literal('Ride.R_Current - ' + studentRideAvailed.dataValues.SRA_Seats)
        }, {
            where: {
                R_Id: R_Id
            }, transaction
        })

        // Fetch the ride, details to be used later
        const ride = await Ride.findOne({
            attributes: ['R_Id', 'R_Date', 'R_Time', 'R_Rating', 'R_Starting_Air_Code',
                'R_Starting_Terminal', 'R_Accepted_By', 'R_Current', 'R_Total', 'R_Status'],
            where: {
                R_Id: R_Id
            }, transaction
        })


        // Since the ride was never taken, there is no point keeping the address.
        // Hence, deleting the same
        const rideAddress = await RideAddress.findOne({
            where: {
                RA_S_Id: S_Id,
                RA_R_Id: R_Id
            }, transaction
        })

        await rideAddress.destroy({
            transaction
        })


        await RideProviderRideProvided.update({
            RPRP_Status: 'Cancelled',
            RPRP_Comments: 'Ride cancelled by student.\n' + Comments
        }, {
            where: {
                RPRP_R_Id: R_Id,
                RPRP_S_Id: S_Id
            }, transaction
        })

        // If the cancelled ride was requested by same student, masrk the request as pending
        if (studentRideAvailed.dataValues.SRA_RRBS_Id) {

            /*
            Commenting this part as well.
            Not sure why we are fetching the request details as we can directly update the request as pending.
            Verify later
            */ 
            // const rideRequestedByStudent = RidesRequestedByStudent.findOne({
            //     attributes: ['RRBS_Id', 'RRBS_S_Id', 'RRBS_Date', 'RRBS_Time', 'RRBS_Air_Code', 'RRBS_T_Number',
            //         'RRBS_Seats', 'RRBS_Street', 'RRBS_City', 'RRBS_State', 'RRBS_Zip', 'RRBS_Status'],
            //     where: {
            //         RRBS_Id: studentRideAvailed.dataValues.SRA_RRBS_Id
            //     }
            // })
            

            // Verify this change
            // ---------------------

            // await RidesPostedByProvider.update({
            //     RRBS_Status: 'Pending'
            // }, {
            //     where: {
            //         RRBS_Id: rideRequestedByStudent.dataValues.RRBS_Id
            //     }
            // })

            await RidesRequestedByStudent.update({
                RRBS_Status: 'Pending'
            }, {
                where: {
                    RRBS_Id: studentRideAvailed.dataValues.SRA_RRBS_Id
                }, transaction
            })
        }

        // Now if all the students have cancelled the ride, there is no point keeping the ride.
        // Hence marking the ride as cancelled, updating the comments accordingly
        // Next check if it was ride provider request, if yes, mark that request as pending
        if (ride.dataValues.R_Current === 0) {
            await Ride.update({
                R_Status: 'Cancelled',
                R_Comments: 'All students cancelled the ride. Automatic cancellation.'
            }, {
                where: {
                    R_Id: req.body.R_Id
                }, transaction
            })

            const { ne } = Sequelize.Op
            const rideProviderRideProvided = await RideProviderRideProvided.findOne({
                where: {
                    RPRP_R_Id: req.body.R_Id,
                    RPRP_RPBP_Id: {
                        [ne]: null
                    }
                }, transaction
            })

            if (rideProviderRideProvided) {
                await RidesPostedByProvider.update({
                    RPBP_Status: 'Pending'
                }, {
                    where: {
                        RPBP_Id: rideProviderRideProvided.dataValues.RPRP_RPBP_Id
                    }, transaction
                })
            }
        }


        // Update comments after cancellation of ride.
        // Since student is cancelling the ride, comments should be visible to RP.
        // Hence update the comments at ride_provider_ride_provided.
        // Use columns RPRP_R_Id and RPRP_S_Id

        await transaction.commit()

        res.status(201).send('Ride successfully cancelled')

    } catch (e) {
        await transaction.rollback()
        res.status(400).send()
    }
})

// Get All the completed rides by Student
router.get('/GetCompletedRidesByStudent', async (req, res) => {
    try {
        const completedRides = await sequelize.query("select * from student_ride_availed S join ride_address R on SRA_S_Id = RA_S_Id where SRA_Status = 'Completed' and SRA_S_Id = " + req.body.S_Id)
        res.send(completedRides[0])
    } catch (e) {
        await transaction.rollback()
        res.status(400).send(e)
    }
})

// Give rating for the provider
router.post('/RateProvider', async (req, res) => {
    const transaction = await sequelize.transaction()
    try{
        const R_Id = req.body.R_Id
        const S_Id = req.body.S_Id
        const Rating = req.body.Rating

        await RideProviderRideProvided.update({
            RPRP_Rating:Rating
        },{
            where:{
                RPRP_R_Id:R_Id,
                RPRP_S_Id:S_Id
            },transaction
        })

        const {ne} = Sequelize.Op 
        const avgData = await RideProviderRideProvided.findAll({
            attributes:[[sequelize.fn('sum',sequelize.col('RPRP_Rating')),'sum'], [sequelize.fn('count',sequelize.col('RPRP_Rating')),'count'],'RPRP_P_Drivers_License'],
            group:['RPRP_R_Id','RPRP_P_Drivers_License'],
            raw:true,
            where:{
                RPRP_Rating:{
                    [ne]:0
                }
            },
            transaction
        })
        const avg = parseInt(avgData[0].sum)/parseInt(avgData[0].count)
        const pDriversLicense=avgData[0].RPRP_P_Drivers_License
        

        await Ride.update({
            R_Rating:avg
        },{
            where:{
                R_Id:R_Id
            },transaction
        })

        const rideProvider = await RideProvider.findOne({
            where:{
                P_Drivers_License:pDriversLicense
            },transaction
        })
        
        
        const newRideProviderRating=((rideProvider.dataValues.P_Rating * rideProvider.dataValues.P_No_Rating) + parseInt(Rating))/(rideProvider.dataValues.P_No_Rating+1)
        console.log(newRideProviderRating)

        await RideProvider.update({
            P_Rating:newRideProviderRating,
            P_No_Rating:sequelize.literal('P_No_Rating +1')
        },{
            where:{
                P_Drivers_License:pDriversLicense
            },transaction
        })

        //await transaction.rollback()
        await transaction.commit()
        res.send('Rating Added Successfully')

    }catch(e){
        await transaction.rollback()
        res.status(400).send()
    }
})


module.exports = router