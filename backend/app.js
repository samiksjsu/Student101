const {sequelize, DataTypes, Sequelize} = require('./src/db/conn')
const University = require('./src/dbmodels/university')
const NearByAirports = require('./src/dbmodels/nearbyAirports')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
app.use(express.json())


app.post('/ISHelper/createUser/', async (req, res) => {

    try {
        const nearByAirport = await NearByAirports.create(req.body)
        console.log('Airport created', nearByAirport)

        res.status(201).send(req.body)
    } catch (e) {
        console.log(e)
    } finally {
        sequelize.close()
    }

})

const getUniversities = async () => {

    try {
        const universities = await University.findAll({
            attributes: ['U_Id', 'U_Name', 'U_State', 'U_City', 'U_Street', 'U_Zip'],
            where: {
                U_Id: 1
            }
        });
            // console.log(users.every(user => user instanceof User)); // true
            console.log("All users:", JSON.parse(JSON.stringify(universities)));
    } catch (e) {
        console.log(e)
    } finally {
        sequelize.close()
    }
}

const getNearbyAirports = async () => {
    try {
        const nearbyAirports = await NearByAirports.findAll({
            attributes: ['N_U_Id', 'N_A_Code']
        })

        console.log(JSON.parse(JSON.stringify(nearbyAirports)))
    } catch (e) {
        console.log('Error Occurred', e)
    } finally {
        sequelize.close()
    }
}

// getUniversities()
// getNearbyAirports()


const insertAirport = async () => {
    try {
        const jane = await NearByAirports.create({ N_U_Id: 3, N_A_Code: "SFO" }, {
        })

        console.log(jane)
    } catch (e) {
        console.log(e)
    } finally {
        sequelize.close()
    }
}


app.listen(port, () => {
    console.log('Server is running at port ', port)
})