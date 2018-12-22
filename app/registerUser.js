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

async function registerUser(userName) {
    try {
        if(!userName)
            throw new Error("Wrong arguments. User name is missing")

        const cryptoSuite = await HyperledgerUtils.initClient( FabricClient, fabricClient, storePath );

        // first check to see if the admin is already enrolled
        const adminFromStore = await fabricClient.getUserContext('admin', true);

        if (adminFromStore && adminFromStore.isEnrolled())
            console.log('[registerUser] successfully loaded admin from persistence');
        else
            throw new Error('Failed to get admin... run enrollAdmin.js');
    
        // be sure to change the http to https when the CA is running TLS enabled
        const fabricCaClient = new FabricCAClient('http://localhost:7054', null , '', cryptoSuite);

        // first register the user with the CA server
        const secret = await fabricCaClient.register(
            { enrollmentID: userName, affiliation: 'org1.department1', role: 'client' },
            adminFromStore
        );

        console.log(`[registerUser] successfully registered ${userName}, secret: ${secret}`);
        
        // next we need to enroll the user with CA server
        const enrollment = await fabricCaClient.enroll({ enrollmentID: userName, enrollmentSecret: secret });

        console.log(`[registerUser] successfully enrolled member user ${userName}`);

        const memberUser = await fabricClient.createUser( { 
            username: userName,
            mspid: 'Org1MSP',
            cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
        });

        await fabricClient.setUserContext(memberUser);

        console.log(`[registerUser] user ${userName} was successfully registered and enrolled and is ready to interact with the fabric network`);

    } catch(error) {
        console.error(`[registerUser] failed to register user ${userName}: ${error}`);
        
        if(error.toString().indexOf('Authorization') > -1) {
            console.error(`[registerUser] authorization failures may be caused by having admin credentials from a previous CA instance.
            Try again after deleting the contents of the store directory: ${storePath}`);
	    }
    }
}

// async function test() {
//     await registerUser("user1")
// }

// test()

module.exports = registerUser