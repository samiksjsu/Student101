const Student = require('./src/dbmodels/student')
const arr = ['0145127063', '0145127062']
async function getEmails(arr) {
    var emails = ''
    for(const id of arr) {
        var temp = await Student.findOne({
            where: {
                S_Id: id
            }
        })
        emails += temp.dataValues.S_Email + ','
    }
    return emails
}
getEmails(arr).then((emails) => {
    console.log(emails)
}).catch((e) => {
    console.log(e)
})

