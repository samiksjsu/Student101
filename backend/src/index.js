const express = require('express')
const port = process.env.PORT || 3000
const studentRouter = require('./routers/student')
const rideProviderRouter = require('./routers/rideProvider')
const adminRouter = require('./routers/admin')
const app = express()

app.use(express.json())
app.use(studentRouter)
app.use(rideProviderRouter)
app.use(adminRouter)


app.listen(port, () => {
    console.log('Server is running at port ', port)
})