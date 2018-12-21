'use strict';

const FabricClient = require('fabric-client');
const path = require('path');
const util = require('util');

const fabricClient = new FabricClient();

// setup the fabric network
const channel = fabricClient.newChannel('mychannel');

const peer = fabricClient.newPeer('grpc://localhost:7051');
channel.addPeer(peer);

const order = fabricClient.newOrderer('grpc://localhost:7050')
channel.addOrderer(order);

const storePath = path.join(__dirname, 'hfc-key-store');

const userName = 'user1';
let transactionId = null;

// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
FabricClient.newDefaultKeyValueStore({ path: storePath }).then( stateStore => {
	
	// assign the store to the fabric client
	fabricClient.setStateStore(stateStore);
	const cryptoSuite = FabricClient.newCryptoSuite();

	// use the same location for the state store (where the users' certificate are kept)
	// and the crypto store (where the users' keys are kept)
	const cryptoStore = FabricClient.newCryptoKeyStore( { path: storePath } );
	cryptoSuite.setCryptoKeyStore(cryptoStore);
	fabricClient.setCryptoSuite(cryptoSuite);

	// get the enrolled user from persistence, this user will sign all requests
	return fabricClient.getUserContext(userName, true);

}).then( userFromStore => {

	if (userFromStore && userFromStore.isEnrolled())
		console.log(`Successfully loaded user ${userName} from persistence`);
	else
		throw new Error(`Failed to get user ${userName}... run registerUser.js`);

	// get a transaction id object based on the current user assigned to fabric client
	transactionId = fabricClient.newTransactionID();

	const request = {
		//targets: let default to the peer assigned to the client
		chaincodeId: 'IOchannel',
		fcn: 'putMessage',
		args: ['MSG2', 'newSenderId', 'message from outside'],
		chainId: 'mychannel',
		txId: transactionId
	};

	// send the transaction proposal to the peers for endorsment
	return channel.sendTransactionProposal(request);

}).then( results => {

	const proposalResponses = results[0];
	const proposal = results[1];
	
	const isProposalGood = proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200;

	if (isProposalGood) {
		console.log('Transaction proposal was good');
	} else {
		console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
		throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
	}

	console.log(
		util.format(
			'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
			proposalResponses[0].response.status,
			proposalResponses[0].response.message
		)
	);

	// build up the request for the orderer to have the transaction committed
	const commitTransactionRequest = {
		proposalResponses: proposalResponses,
		proposal: proposal
	};

	// set the transaction listener and set a timeout of 30 sec if the transaction did not get committed within the timeout period, report a TIMEOUT status
	const transaction_id_string = transactionId.getTransactionID(); //Get the transaction ID string to be used by the event processing
	const promises = [];

	const commitTransactionPromise = channel.sendTransaction(commitTransactionRequest);
	promises.push(commitTransactionPromise); //we want the send transaction first, so that we know where to check status

	// get an eventhub once the fabric client has a user assigned. The user is required bacause the event registration must be signed
	const event_hub = channel.newChannelEventHub(peer);

	// using resolve the promise so that result status may be processed
	// under the then clause rather than having the catch clause process
	// the status
	let txPromise = new Promise( (resolve, reject) => {
		
		let timeoutHandle = setTimeout(() => {
			event_hub.unregisterTxEvent(transaction_id_string);
			event_hub.disconnect();
			resolve({event_status : 'TIMEOUT'}); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
		}, 30000);

		event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
			// this is the callback for transaction event status
			clearTimeout(timeoutHandle);

			const return_status = { event_status : code, tx_id : transaction_id_string };
			if (code !== 'VALID') {
				console.error(`The transaction was invalid, code = ${code}`);
				resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
			} else {
				console.log(`The transaction has been committed on peer ${event_hub.getPeerAddr()}`);
				resolve(return_status);
			}

		}, error => {
			reject( new Error(`There was a problem with the eventhub: ${error}`) );
		}, 
		{ disconnect: true } //disconnect when complete
		);

		event_hub.connect();
	});
	promises.push(txPromise);

	return Promise.all(promises);
}).then((promisesResult) => {
	
	console.log('Send transaction promise and event listener promise have completed');
	
	// check the results in the order the promises were added to the promise all list
	if (promisesResult && promisesResult[0] && promisesResult[0].status === 'SUCCESS')
		console.log('Successfully sent transaction to the orderer.');
	else
		console.error(`Failed to order the transaction. Error code: ${promisesResult[0].status}`);

	if(promisesResult && promisesResult[1] && promisesResult[1].event_status === 'VALID')
		console.log('Successfully committed the change to the ledger by the peer');
	else
		console.log(`Transaction failed to be committed to the ledger due to: ${promisesResult[1].event_status}`);

}).catch( error => {
	console.error(`Failed to invoke successfully: ${error}`);
});
