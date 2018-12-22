'use strict';
/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Register and Enroll a user
 */

const FabricClient = require('fabric-client');
const FabricCAClient = require('fabric-ca-client');
const HyperledgerUtils = require('./HyperledgerUtils');
const path = require('path');

const fabricClient = new FabricClient();
const storePath = path.join(__dirname, 'hfc-key-store');
const userName = "user1";

async function registerUser() {
    try {
        const cryptoSuite = await HyperledgerUtils.initClient( FabricClient, fabricClient, storePath );

        // first check to see if the admin is already enrolled
        const adminFromStore = await fabricClient.getUserContext('admin', true);

        if (adminFromStore && adminFromStore.isEnrolled())
            console.log('Successfully loaded admin from persistence');
        else
            throw new Error('Failed to get admin... run enrollAdmin.js');
    
        // be sure to change the http to https when the CA is running TLS enabled
        const fabricCaClient = new FabricCAClient('http://localhost:7054', null , '', cryptoSuite);

        // first register the user with the CA server
        const secret = await fabricCaClient.register(
            { enrollmentID: userName, affiliation: 'org1.department1', role: 'client' },
            adminFromStore
        );

        console.log(`Successfully registered ${userName}, secret: ${secret}`);
        
        // next we need to enroll the user with CA server
        const enrollment = await fabricCaClient.enroll({ enrollmentID: userName, enrollmentSecret: secret });

        console.log(`Successfully enrolled member user ${userName}`);

        const memberUser = fabricClient.createUser( { 
            username: userName,
            mspid: 'Org1MSP',
            cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
        });

        await fabricClient.setUserContext(memberUser);

        console.log(`User ${userName} was successfully registered and enrolled and is ready to interact with the fabric network`);

    } catch(error) {
        console.error(`Failed to register user ${userName}: ${error}`);
        
        if(error.toString().indexOf('Authorization') > -1) {
            console.error(`Authorization failures may be caused by having admin credentials from a previous CA instance.
            Try again after deleting the contents of the store directory: ${storePath}`);
	    }
    }
}

async function test() {
    await registerUser()
}

test()