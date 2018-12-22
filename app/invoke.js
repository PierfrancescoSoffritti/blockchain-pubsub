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
const userName = 'user1';

async function Invoke() {
	try {

		const transactionId = await HyperledgerUtils.initClient( { FabricClient, fabricClient, storePath, userName } );

		const request = {
			//targets: default to the peer assigned to the client
			chaincodeId: 'IOchannel',
			fcn: 'putMessage',
			args: ['MSG3', 'newSenderId', 'message from outside'],
			chainId: 'mychannel',
			txId: transactionId
		};

		// send the transaction proposal to the peers for endorsment
		const results = await channel.sendTransactionProposal(request);

		const transactionProposalResponses = results[0];
		const transactionProposal = results[1];

		const promises = [];

		HyperledgerUtils.checkTransactionProposalResponses(transactionProposalResponses);
		const commitTransactionPromise = HyperledgerUtils.commitTransaction(channel, transactionProposalResponses, transactionProposal);

		const txEventPromise = HyperledgerUtils.subscribeTxEventListener(channel, peer, transactionId);

		commitTransactionPromise.then( result => {
			if (result && result.status === 'SUCCESS')
				console.log('Successfully sent transaction to the orderer.');
			else
				console.error(`Failed to order the transaction. Error code: ${result.status}`);
		});

		txEventPromise.then( result => {
			if(result && result.event_status === 'VALID')
				console.log('Successfully committed the change to the ledger by the peer');
			else
				console.log(`Transaction failed to be committed to the ledger due to: ${result.event_status}`);
		});

	} catch (error) {
		console.error(`Failed to invoke successfully: ${error}`);
	}
}

async function test() {
	await Invoke();
}

test()