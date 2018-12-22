'use strict';
/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Enroll the admin user
 */

const FabricClient = require('fabric-client');
const FabricCAClient = require('fabric-ca-client');
const HyperledgerUtils = require('./HyperledgerUtils');
const path = require('path');

const fabricClient = new FabricClient();
const storePath = path.join(__dirname, 'hfc-key-store');
const adminUserName = "admin";

async function enrollAdmin() {
    try {
        const cryptoSuite = await HyperledgerUtils.initClient( FabricClient, fabricClient, storePath );
    
        // first check to see if the admin is already enrolled
        const userFromStore = await fabricClient.getUserContext(adminUserName, true);

        if (userFromStore && userFromStore.isEnrolled()) {
            console.log(`Successfully loaded admin ${adminUserName} from persistence`);
            return;
        }

        try {
            
            const tlsOptions = {
                trustedRoots: [],
                verify: false
            };

            // be sure to change the http to https when the CA is running TLS enabled
            const fabricCAClient = new FabricCAClient('http://localhost:7054', tlsOptions, 'ca.example.com', cryptoSuite);

            // need to enroll it with CA server
            const enrollment = await fabricCAClient.enroll({ enrollmentID: adminUserName, enrollmentSecret: 'adminpw' })

            console.log(`Successfully enrolled admin user ${adminUserName}`);

            const user = await fabricClient.createUser( {
                username: adminUserName,
                mspid: 'Org1MSP',
                cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate } 
            } );
            
            await fabricClient.setUserContext(user);

            console.log(`Assigned the admin user to the fabric client: ${user.toString()}`);

        } catch(error) {
            throw new Error(`Failed to enroll and persist admin. Error: ${error.stack ? error.stack : error}`);
        }

    } catch(error) {
        console.error(`Failed to enroll admin: ${error}`);
    }
}

async function test() {
    await enrollAdmin()
}

test()