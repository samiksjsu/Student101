const RideProvider = require('../dbmodels/rideProvider')
const RidesPostedByProvider = require('../dbmodels/ridesPostedByProvider')
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



module.exports = router