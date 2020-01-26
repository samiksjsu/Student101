const { sequelize, DataTypes } = require('../db/conn')
const RideProvider = require('../dbmodels/rideProvider')
const RidesPostedByProvider = require('../dbmodels/ridesPostedByProvider')
const RidesRequestedByStudent = require('../dbmodels/ridesRequestedByStudent')
const StudentRideAvailed = require('../dbmodels/studentRideAvailed')
const RideAddress = require('../dbmodels/rideAddress')
const Ride = require('../dbmodels/ride')
const Student = require('../dbmodels/student')
const RideProviderRideProvided = require('../dbmodels/rideProviderRideProvided')
const express = require('express')
const bcrypt = require('bcrypt')
const sendEmail = require('../mail/conn')
const router = new express.Router()


router.post('/RideProviderSignUp', async (req, res) => {
    try {

        await RideProvider.findUId(req.body.P_University, req)
        req.body.P_Password = await bcrypt.hash(req.body.P_Password, 8)
        const rideProvider = await RideProvider.create(req.body)
        delete rideProvider.dataValues.P_Password
        res.send(rideProvider)

    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/RideProviderLogin', async (req, res) => {

    try {
        const rideProvider = await RideProvider.findByCredentials(req)
        delete rideProvider.dataValues.P_Password

        res.status(200).send({
            rideProvider,
            token: req.token
        })
    } catch (e) {
        res.status(401).send(e)
    }
})

router.post('/ProviderRidePost', async (req, res) => {

    try {
        const ridePostedByProvider = await RidesPostedByProvider.create(req.body, {
            fields: ['RPBP_Drivers_License', 'RPBP_Date', 'RPBP_Time', 'RPBP_From', 'RPBP_Current', 'RPBP_Total', 'RPBP_Comments']
        })

        res.status(201).send(ridePostedByProvider)
    } catch (e) {
        res.status(400).send(e)
    }

})

router.post('/StudentRideAcceptedByProvider', async (req, res) => {

    const transaction = await sequelize.transaction()
    try {

        const RRBS_Id = req.body.RRBS_Id
        const P_Drivers_License = req.body.P_Drivers_License
        const capacity = req.body.capacity

        const rideRequestedByStudent = await RidesRequestedByStudent.findOne({
            where: {
                RRBS_Id
            }, transaction
        })

        const rideObject = {
            R_Date: rideRequestedByStudent.dataValues.RRBS_Date,
            R_Time: rideRequestedByStudent.dataValues.RRBS_Time,
            R_Rating: 0.0,
            R_Starting_Air_Code: rideRequestedByStudent.dataValues.RRBS_Air_Code,
            R_Starting_Terminal: rideRequestedByStudent.dataValues.RRBS_T_Number,
            R_Accepted_By: P_Drivers_License,
            R_Current: rideRequestedByStudent.dataValues.RRBS_Seats,
            R_Total: capacity
        }

        const ride = await Ride.create(rideObject, {
            fields: ['R_Date', 'R_Time', 'R_Rating', 'R_Starting_Air_Code',
                'R_Starting_Terminal', 'R_Accepted_By', 'R_Current', 'R_Total'],

            transaction
        })

        const studentRideAvailed = await StudentRideAvailed.create({
            SRA_S_Id: rideRequestedByStudent.dataValues.RRBS_S_Id,
            SRA_Ride_Id: ride.dataValues.id,
            SRA_Rating: 0.0
        }, {
            transaction
        })

        const rideAddress = await RideAddress.create({
            RA_S_Id: rideRequestedByStudent.dataValues.RRBS_S_Id,
            RA_R_Id: ride.dataValues.id,
            RA_Street: rideRequestedByStudent.dataValues.RRBS_Street,
            RA_City: rideRequestedByStudent.dataValues.RRBS_City,
            RA_State: rideRequestedByStudent.dataValues.RRBS_State,
            RA_Zip: rideRequestedByStudent.dataValues.RRBS_Zip
        }, {
            fields: ['RA_S_Id', 'RA_R_Id', 'RA_Street', 'RA_City', 'RA_State', 'RA_Zip'],
            transaction
        })

        await RidesRequestedByStudent.update({
            RRBS_Status: 'Accepted'
        }, {
            where: {
                RRBS_Id
            },
            transaction
        })


        // Get email ids of both parties
        const student = await Student.findOne({}, {
            where: {
                S_Id: rideRequestedByStudent.dataValues.RRBS_S_Id
            }, transaction
        })

        const rideProvider = await RideProvider.findOne({
            where: {
                P_Drivers_License: P_Drivers_License
            }, transaction
        })

        // Construct the email is
        const mailObject = student.dataValues.S_Email.toString() + ',' + rideProvider.dataValues.P_Email.toString()

        // Send email
        sendEmail(mailObject)

        // Commit the transactions
        transaction.commit()

        // Send confirmation
        res.status(201).send({
            Message: 'Ride Accepted Successfully'
        })
    } catch (e) {
        transaction.rollback()
        console.log('Rolling back transaction')
        res.status(400).send('Transaction failed')
    }

})

//cancel whole ride by ride provider
router.post('/CancelRideByProvider', async (req, res) => {
    const transaction = sequelize.transaction()
    try {
        const R_Id = req.body.R_Id
        const P_Drivers_License = req.body.P_Drivers_License
        const { ne } = Sequelize.Op

        await StudentRideAvailed.update({
            SRA_Status: 'Cancelled',
            SRA_Comments: 'Ride cancelled by ride provider:\n' + Comments
        }, {
            where: {
                SRA_Ride_Id: R_Id
            }, transaction
        })

        await Ride.update({
            R_Status: 'Cancelled',
            R_Comments: 'Ride cancelled by ride provider.\n' + Comments
        }, {
            where: {
                R_Id
            }, transaction
        })

        await RideProviderRideProvided.update({
            RPRP_Status: 'Cancelled',
            RPRP_Comments: 'Ride cancelled by ride provider.\n' + Comments
        }, {
            where: {
                RPRP_R_Id: R_Id
            }, transaction
        })

        const rideProviderRideProvided = await RideProviderRideProvided.findOne({
            where: {
                RPRP_R_Id: R_Id,
                RPRP_RRBS_Id: {
                    [ne]: null
                }
            }
        }, transaction)

        if (rideProviderRideProvided.dataValues.RPRP_RRBS_Id) {
            await RidesRequestedByStudent.update({
                RRBS_Status: 'Pending'
            }, {
                where: {
                    RRBS_Id: rideProviderRideProvided.dataValues.RPRP_RRBS_Id
                }, transaction
            })
        }

        await transaction.commit()
        res.status(201).send()

    } catch (e) {
        res.status(400).send(e)
    }
})


//mark ride as completed
router.post('/MarkRideAsCompleted', async (req, res) => {
    const transaction = await sequelize.transaction()
    try {
        const R_Id = req.body.R_Id

        await StudentRideAvailed.update({
            SRA_Status: 'Completed'
        }, {
            where: {
                SRA_Ride_Id: R_Id
            }, transaction
        })

        await Ride.update({
            R_Status:'Completed'
        },{
            where:{
                R_Id:R_Id
            },transaction
        })

        await RideProviderRideProvided.update({
            RPRP_Status:'Completed'
        },{
            where:{
                RPRP_R_Id:R_Id
            },transaction
        })

        await transaction.commit()


        const ride = await Ride.findOne({
            where: {
                R_Id: R_Id
            },
            attributes: ['R_Id', 'R_Date', 'R_Time', 'R_Rating', 'R_Starting_Air_Code', 'R_Starting_Terminal', 'R_Accepted_By', 'R_Current', 'R_Total', 'R_Status']
        })
        const rideProvider = await RideProvider.findByPk(ride.dataValues.R_Accepted_By)
        const studentRideAvailed = await StudentRideAvailed.findAll({ SRA_Ride_Id: R_Id })
        const students = await sequelize.query('select S_Id, S_Name, S_Email, S_Phone from Student inner join Student_Ride_Availed on S_Id = SRA_S_Id ' + 
            'and SRA_Ride_Id = ' + R_Id)
        
        var emails = ''
        //console.log(students)
        students[0].forEach(element => {
            emails+=element.S_Email + ','
        });
        var emails = emails.slice(0, -1);

        //send email; after this

        
        res.status(201).send(students)

    } catch (e) {
        res.status(400).send(e)
    }
})



module.exports = router