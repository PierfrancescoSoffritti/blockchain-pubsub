const EnrollAdmin = require('./enrollAdmin')
const RegisterUser = require('./registerUser')
const Query = require('./query')
const Invoke = require('./invoke')

async function main() {
    
    await EnrollAdmin("admin")
    await RegisterUser("user1")

    console.log("\n\n")

    await Query("user1")
    await Invoke("user1")

    console.log("\n\n")

    await Query("user1")
}

main()