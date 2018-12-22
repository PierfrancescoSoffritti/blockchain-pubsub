
async function initClient( { FabricClient, fabricClient, storePath, userName } ) {

    // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
    const stateStore = await FabricClient.newDefaultKeyValueStore( { path: storePath } )

    // assign the store to the fabric client
    fabricClient.setStateStore(stateStore);
    const cryptoSuite = FabricClient.newCryptoSuite();

    // use the same location for the state store (where the users' certificate are kept)
    // and the crypto store (where the users' keys are kept)
    const cryptoStore = FabricClient.newCryptoKeyStore( { path: storePath } );
    cryptoSuite.setCryptoKeyStore(cryptoStore);
    fabricClient.setCryptoSuite(cryptoSuite);

    // get the enrolled user from persistence, this user will sign all requests
    const userFromStore = await fabricClient.getUserContext(userName, true);

    if (userFromStore && userFromStore.isEnrolled())
        console.log(`Successfully loaded ${userName} from persistence`);
    else
        throw new Error(`Failed to get ${userName}... run registerUser.js`);

    const transactionId = fabricClient.newTransactionID();
    return transactionId;
}

module.exports.initClient = initClient;