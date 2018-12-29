const EnrollAdmin = require('./enrollAdmin')
const RegisterUser = require('./registerUser')
const Query = require('./query')
const Invoke = require('./invoke')

async function main() {

    const userName = "user1"

    const user = await init(userName)
    let userPK
    if(user)
        userPK = user.getIdentity()._publicKey._key.pubKeyHex
    else
        userPK = userName

    await sendMessage(userName, {id: `MSG1-${userPK}`, content: "0"})
    
    await Query(userName, "MSG0", "MSG999")
    
    console.log("done")
}

async function init(userName) {
    await EnrollAdmin("admin")
    return await RegisterUser(userName)
}

async function sendMessage(userName, message) {
    await Invoke("user1", message)
}

main()