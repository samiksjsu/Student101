// const Student = require('./src/dbmodels/student')
// const arr = ['014500889', '014500890']



// async function getEmails(arr) {
//     var emails = ''
//     for(const id of arr) {
//         var temp = await Student.findOne({
//             where: {
//                 S_Id: id
//             }
//         })
//         emails += temp.dataValues.S_Email + ','
//     }
//     return emails
// }

// getEmails(arr).then((emails) => {
//     emails = emails.replace(/(^,)|(,$)/g, "")
//     console.log(emails)
// }).catch((e) => {
//     console.log(e)
// })

