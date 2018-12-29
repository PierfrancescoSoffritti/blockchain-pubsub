'use strict';

const FabricClient = require('fabric-client');
const path = require('path');
const util = require('util');
const HyperledgerUtils = require('./HyperledgerUtils');

const fabricClient = new FabricClient();

// setup the fabric network
const channel = fabricClient.newChannel('mychannel');

const peer = fabricClient.newPeer('grpc://localhost:7051');
channel.addPeer(peer);

const order = fabricClient.newOrderer('grpc://localhost:7050')
channel.addOrderer(order);

const storePath = path.join(__dirname, 'hfc-key-store');

async function Invoke(userName, message) {
	try {
		if(!userName)
            throw new Error("Wrong arguments. User name is missing")

		await HyperledgerUtils.initClient( FabricClient, fabricClient, storePath );
		await HyperledgerUtils.checkUserIsEnrolled( fabricClient, userName )
		const transactionId = fabricClient.newTransactionID();

		const request = {
			//targets: default to the peer assigned to the client
			chaincodeId: 'IOchannel',
			fcn: 'putMessage',
			args: [message.id, userName, message.content],
			chainId: 'mychannel',
			txId: transactionId
		};

		// send the transaction proposal to the peers for endorsment
		const results = await channel.sendTransactionProposal(request);

		const transactionProposalResponses = results[0];
		const transactionProposal = results[1];

		HyperledgerUtils.checkTransactionProposalResponses(transactionProposalResponses);
		const commitTransactionResult = await HyperledgerUtils.commitTransaction(channel, transactionProposalResponses, transactionProposal);
		
		if (commitTransactionResult && commitTransactionResult.status === 'SUCCESS') {
			// console.log('[invoke] successfully sent transaction to the orderer.');
		} else {
			console.error(`[invoke] failed to order the transaction. Error code: ${commitTransactionResult.status}`);
		}

		const subsribeTxResult = await HyperledgerUtils.subscribeTxEventListener(channel, peer, transactionId);
		
		if(subsribeTxResult && subsribeTxResult.event_status === 'VALID')
			console.log('[invoke] successfully committed the change to the ledger by the peer');
		else
			console.log(`[invoke] transaction failed to be committed to the ledger due to: ${subsribeTxResult.event_status}`);

	} catch (error) {
		console.error(`[invoke] failed to invoke successfully: ${error}`);
	}
}

async function test() {
	await Invoke("user2", { id: "MSG10-PK", content: "test" } );
}

test()

module.exports = Invoke