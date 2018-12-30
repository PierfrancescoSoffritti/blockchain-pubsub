const EnrollAdmin = require('./src/enrollAdmin')
const RegisterUser = require('./src/registerUser')
const QueryByRange = require('./src/queryByRange')
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

async function queryRange(queryLowerBound, queryUpperBound) {
    if(!isInitCompleted)
        throw "Init not completed"

    const res = await QueryByRange(registeredUserName, queryLowerBound, queryUpperBound)
    return parseQueryResult(res)
}

async function persist(message) {
    if(!isInitCompleted)
        throw "Init not completed"

    return await Invoke(registeredUserName, message)
}

async function onDataPersisted(onDataPersistedListener) {
    if(!isInitCompleted)
        throw "Init not completed"
        
    return await AddNewBlockEventListener(registeredUserName, onDataPersistedListener)
}

function parseQueryResult(response) {
    /*
        original response format:  [ { "Key": "..", "Record": { .. } } ]
        final response format: [ { id: "..", content: { .. } } ]
    */

   const parsedData = JSON.parse(response).map( data => { return { id: data["Key"], content: data["Record"] } } )
   return parsedData
}

module.exports = { init, queryRange, persist, onDataPersisted }