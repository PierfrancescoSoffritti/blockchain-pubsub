'use strict';

const FabricClient = require('fabric-client');
const path = require('path');
const HyperledgerUtils = require('./HyperledgerUtils');
const Query = require('./query')

const fabricClient = new FabricClient();

// setup the fabric network
const channel = fabricClient.newChannel('mychannel');

const peer = fabricClient.newPeer('grpc://localhost:7051');
channel.addPeer(peer);

const order = fabricClient.newOrderer('grpc://localhost:7050')
channel.addOrderer(order);

const storePath = path.join(__dirname, 'hfc-key-store');
const userName = 'user1';

async function listenForNewBlocks() {
    try {

        await HyperledgerUtils.initClient( FabricClient, fabricClient, storePath );
		await HyperledgerUtils.checkUserIsEnrolled( fabricClient, userName )

        // get an eventhub once the fabric client has a user assigned. The user is required bacause the event registration must be signed
        let eventHub = channel.newChannelEventHub(peer);

        let txPromise = new Promise( (resolve, reject) => {
            let blockReg = eventHub.registerBlockEvent( block => {
                console.log('Successfully received the block event');
                
                Query()

            }, error => {
                console.log('Failed to receive the block event ::'+error);
                eventHub.disconnect();
            });
            eventHub.connect();

        });
        
    } catch(error) {
        console.error(`Error: ${error}`);
    }
}

async function test() {
    await listenForNewBlocks()
}

test()