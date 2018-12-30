'use strict';

const FabricClient = require('fabric-client');
const path = require('path');

const HyperledgerUtils = require('./utils');

const fabricClient = new FabricClient();

// setup the fabric network
const channel = fabricClient.newChannel('mychannel');
const peer = fabricClient.newPeer('grpc://localhost:7051');
channel.addPeer(peer);

const storePath = path.join(__dirname, '/../hfc-key-store');

async function Query(userName, queryLowerBound, queryUpperBound) {
	try {
		if(!userName)
            throw new Error("Wrong arguments. User name is missing")

		await HyperledgerUtils.initClient( FabricClient, fabricClient, storePath );
		await HyperledgerUtils.checkUserIsEnrolled( fabricClient, userName )

		const request = {
			//targets : default to the peer assigned to the client
			chaincodeId: 'IOchannel',
			fcn: 'queryAllMessages',
			args: [queryLowerBound, queryUpperBound]
		};

		// send the transaction proposal to the peers for endorsment
		const queryResponses = await channel.queryByChaincode(request);

		const response = checkQueryResponsesValidity(queryResponses);
		return response;

	} catch(error) {
		console.error(`[query] failed to query successfully: ${error}`);
	}

	function checkQueryResponsesValidity(queryResponses) {
		// queryResponses could have more than one results if multiple peers were used as targets
		if (queryResponses && queryResponses.length == 1) {
			if (queryResponses[0] instanceof Error)
				console.error(`[query] error from query: ${queryResponses[0]}`);
			else {
				const response = queryResponses[0].toString();
				// console.log(`[query] response is: ${response}`);
				return response;
			}
		} else {
			console.log("[query] no payloads were returned from query");
		}
	}
}

// async function test() {
// 	const res = await Query("user1", "MSG0", "MSG999");
// 	console.log("--")
// 	console.log(res)
// }

// test()

module.exports = Query