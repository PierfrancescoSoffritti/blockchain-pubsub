
async function initClient( FabricClient, fabricClient, storePath ) {

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

    return cryptoSuite;
}

async function checkUserIsEnrolled(fabricClient, userName) {
    // get the enrolled user from persistence, this user will sign all requests
    const userFromStore = await fabricClient.getUserContext(userName, true);

    if (userFromStore && userFromStore.isEnrolled())
        console.log(`Successfully loaded ${userName} from persistence`);
    else
        throw new Error(`Failed to get ${userName}... run registerUser.js`);
}

function checkTransactionProposalResponses(proposalResponses) {   
    const isProposalGood = proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200;

    if (isProposalGood) {
        console.log('Transaction proposal was good');
    } else {
        console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
        throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
    }

    console.log(`Successfully sent Proposal and received ProposalResponse:` +
        `Status - ${proposalResponses[0].response.status},` +
        `message - "${proposalResponses[0].response.message}"`
    );
}

function commitTransaction(channel, transactionProposalResponses, transactionProposal) {
    // build up the request for the orderer to have the transaction committed
    const commitTransactionRequest = {
        proposalResponses: transactionProposalResponses,
        proposal: transactionProposal
    };		

    const commitTransactionPromise = channel.sendTransaction(commitTransactionRequest);
    return commitTransactionPromise
}

function subscribeTxEventListener(channel, peer, transactionId) {
    const txEventPromise = new Promise( (resolve, reject) => {

        // get an eventhub once the fabric client has a user assigned. The user is required bacause the event registration must be signed
        const eventHub = channel.newChannelEventHub(peer);
        // transaction ID string used for event processing
        const transaction_id_string = transactionId.getTransactionID();
        
        const timeoutHandle = setTimeout(() => {
            eventHub.unregisterTxEvent(transaction_id_string);
            eventHub.disconnect();
            resolve({event_status : 'TIMEOUT'}); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
        }, 30000);

        eventHub.registerTxEvent(transaction_id_string, (tx, code) => {
            clearTimeout(timeoutHandle);
            
            if (code !== 'VALID')
                console.error(`The transaction was invalid, code = ${code}`);
            else
                console.log(`The transaction has been committed on peer ${eventHub.getPeerAddr()}`);
                
            resolve( { event_status : code, tx_id : transaction_id_string } );

        }, error => {
            reject( new Error(`There was a problem with the eventhub: ${error}`) );
        }, 
        { disconnect: true } //disconnect when complete
        );

        eventHub.connect();
    });

    return txEventPromise;
}

module.exports.initClient = initClient;
module.exports.checkUserIsEnrolled = checkUserIsEnrolled;
module.exports.checkTransactionProposalResponses = checkTransactionProposalResponses;
module.exports.commitTransaction = commitTransaction;
module.exports.subscribeTxEventListener = subscribeTxEventListener;