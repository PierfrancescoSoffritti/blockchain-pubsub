'use strict';

const FabricClient = require('fabric-client');
const path = require('path');

const fabricClient = new FabricClient();

// setup the fabric network
const channel = fabricClient.newChannel('mychannel');
const peer = fabricClient.newPeer('grpc://localhost:7051');
channel.addPeer(peer);

const storePath = path.join(__dirname, 'hfc-key-store');

const userName = 'user1';

async function Query() {

	try {
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
			throw new Error(`Failed to get ${userName}.... run registerUser.js`);

		const request = {
			//targets : --- letting this default to the peers assigned to the channel
			chaincodeId: 'IOchannel',
			fcn: 'queryAllMessages',
			args: ['']
		};

		// send the transaction proposal to the peers for endorsment
		const queryResponses = await channel.queryByChaincode(request);

		console.log("Query has completed, checking results");

		// queryResponses could have more than one results if multiple peers were used as targets
		if (queryResponses && queryResponses.length == 1) {
			if (queryResponses[0] instanceof Error)
				console.error(`error from query: ${queryResponses[0]}`);
			else
				console.log(`Response is: ${queryResponses[0].toString()}`);
		} else {
			console.log("No payloads were returned from query");
		}
	} catch(error) {
		console.error(`Failed to query successfully: ${error}`);
	}

	/*
	
	// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
	FabricClient.newDefaultKeyValueStore( { path: storePath } ).then( stateStore => {
		
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
			console.log(`Successfully loaded ${userName} from persistence`);
		else
			throw new Error(`Failed to get ${userName}.... run registerUser.js`);

		const request = {
			//targets : --- letting this default to the peers assigned to the channel
			chaincodeId: 'IOchannel',
			fcn: 'queryAllMessages',
			args: ['']
		};

		// send the transaction proposal to the peers for endorsment
		return channel.queryByChaincode(request);

	}).then( queryResponses => {

		console.log("Query has completed, checking results");

		// queryResponses could have more than one results if multiple peers were used as targets
		if (queryResponses && queryResponses.length == 1) {
			if (queryResponses[0] instanceof Error)
				console.error(`error from query: ${queryResponses[0]}`);
			else
				console.log(`Response is: ${queryResponses[0].toString()}`);
		} else {
			console.log("No payloads were returned from query");
		}

	}).catch( error => {
		console.error(`Failed to query successfully: ${error}`);
	});

	*/
}

Query();

module.exports = Query