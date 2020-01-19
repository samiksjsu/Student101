const RideProvider = require('../dbmodels/rideProvider')
const RidesPostedByProvider = require('../dbmodels/ridesPostedByProvider')
const RidesRequestedByStudent = require('../dbmodels/ridesRequestedByStudent')
const StudentRideAvailed = require('../dbmodels/studentRideAvailed')
const RideAddress = require('../dbmodels/rideAddress')
const Ride = require('../dbmodels/ride')
const express = require('express')
const bcrypt = require('bcrypt')
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
            fields: ['RPBP_Drivers_License', 'RPBP_Date', 'RPBP_Time', 'RPBP_From', 'RPBP_Current', 'RPBP_Total']
        })

        res.status(201).send(ridePostedByProvider)
    } catch (e) {
        res.status(400).send(e)
    }

})

router.post('/StudentRideAcceptedByProvider', async (req, res) => {

    try {
        const RRBS_Id = req.body.RRBS_Id
        const P_Drivers_License = req.body.P_Drivers_License
        const capacity = req.body.capacity

        const rideRequestedByStudent = await RidesRequestedByStudent.findOne({
            where: {
                RRBS_Id
            }
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
                'R_Starting_Terminal', 'R_Accepted_By', 'R_Current', 'R_Total']
        })

        const studentRideAvailed = await StudentRideAvailed.create({
            SRA_S_Id: rideRequestedByStudent.dataValues.RRBS_S_Id,
            SRA_Ride_Id: ride.dataValues.id, 
            SRA_Rating: 0.0
        })

        const rideAddress = await RideAddress.create({
            RA_S_Id: rideRequestedByStudent.dataValues.RRBS_S_Id, 
            RA_R_Id: ride.dataValues.id, 
            RA_Street: rideRequestedByStudent.dataValues.RRBS_Street, 
            RA_City: rideRequestedByStudent.dataValues.RRBS_City, 
            RA_State: rideRequestedByStudent.dataValues.RRBS_State, 
            RA_Zip: rideRequestedByStudent.dataValues.RRBS_Zip
        }, {
            fields: ['RA_S_Id', 'RA_R_Id', 'RA_Street', 'RA_City', 'RA_State', 'RA_Zip']
        })

        res.status(201).send(ride)
    } catch (e) {
        res.status(400).send(e)
    }

})


module.exports = router