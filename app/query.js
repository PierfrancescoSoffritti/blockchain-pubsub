'use strict';

const FabricClient = require('fabric-client');
const path = require('path');

const HyperledgerUtils = require('./HyperledgerUtils');

const fabricClient = new FabricClient();

// setup the fabric network
const channel = fabricClient.newChannel('mychannel');
const peer = fabricClient.newPeer('grpc://localhost:7051');
channel.addPeer(peer);

const storePath = path.join(__dirname, 'hfc-key-store');

const userName = 'user1';

async function Query() {

	try {

		await HyperledgerUtils.initClient( { FabricClient,	fabricClient, storePath, userName } );

		const request = {
			//targets : default to the peer assigned to the client
			chaincodeId: 'IOchannel',
			fcn: 'queryAllMessages',
			args: ['']
		};

		// send the transaction proposal to the peers for endorsment
		const queryResponses = await channel.queryByChaincode(request);

		const response = checkQueryResponsesValidity(queryResponses);
		return response;

	} catch(error) {
		console.error(`Failed to query successfully: ${error}`);
	}

	function checkQueryResponsesValidity(queryResponses) {
		// queryResponses could have more than one results if multiple peers were used as targets
		if (queryResponses && queryResponses.length == 1) {
			if (queryResponses[0] instanceof Error)
				console.error(`error from query: ${queryResponses[0]}`);
			else {
				const response = queryResponses[0].toString();
				console.log(`Response is: ${response}`);
				return response;
			}
		} else {
			console.log("No payloads were returned from query");
		}
	}
}

async function test() {
	const res = await Query();
	console.log("--")
	console.log(res)
}

// test()

module.exports = Query