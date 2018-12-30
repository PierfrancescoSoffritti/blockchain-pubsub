const EnrollAdmin = require('./src/enrollAdmin')
const RegisterUser = require('./src/registerUser')
const Query = require('./src/query')
const Invoke = require('./src/invoke')
const AddNewBlockEventListener = require('./src/BlockchainListener')

let isInitCompleted = false
let registeredUserName

async function init(adminUserName, userName) {
    await EnrollAdmin(adminUserName)
    const user = await RegisterUser(userName)

    let userPublicKey
    // only for debug
    // if(user)
    //     userPublicKey = user.getIdentity()._publicKey._key.pubKeyHex
    // else
        userPublicKey = `${userName}_publicKey`

    isInitCompleted = true
    registeredUserName = userName

    return userPublicKey
}

async function query(queryLowerBound, queryUpperBound) {
    if(!isInitCompleted)
        throw "Init not completed"

    return await Query(registeredUserName, queryLowerBound, queryUpperBound)
}

async function invoke(message) {
    if(!isInitCompleted)
        throw "Init not completed"

    return await Invoke(registeredUserName, message)
}

async function addNewBlockEventListener(onNewBlockReceived) {
    if(!isInitCompleted)
        throw "Init not completed"
        
    return await AddNewBlockEventListener(registeredUserName, onNewBlockReceived)
}

module.exports = { init, query, invoke, addNewBlockEventListener }