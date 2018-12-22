'use strict';

const FabricClient = require('fabric-client');
const FabricCAClient = require('fabric-ca-client');
const HyperledgerUtils = require('./HyperledgerUtils');
const path = require('path');

const fabricClient = new FabricClient();
const storePath = path.join(__dirname, 'hfc-key-store');

async function enrollAdmin(adminUserName) {
    try {
        if(!adminUserName)
            throw new Error("Wrong arguments. Admin user name is missing")

        const cryptoSuite = await HyperledgerUtils.initClient( FabricClient, fabricClient, storePath );
    
        // first check to see if the admin is already enrolled
        const userFromStore = await fabricClient.getUserContext(adminUserName, true);

        if (userFromStore && userFromStore.isEnrolled()) {
            console.log(`[enrollAdmin] successfully loaded admin ${adminUserName} from persistence`);
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

            console.log(`[enrollAdmin] successfully enrolled admin user ${adminUserName}`);

            const user = await fabricClient.createUser( {
                username: adminUserName,
                mspid: 'Org1MSP',
                cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate } 
            } );
            
            await fabricClient.setUserContext(user);

            console.log(`[enrollAdmin] assigned the admin user to the fabric client: ${user.toString()}`);

        } catch(error) {
            throw new Error(`[enrollAdmin] failed to enroll and persist admin. Error: ${error.stack ? error.stack : error}`);
        }

    } catch(error) {
        console.error(`[enrollAdmin] failed to enroll admin: ${error}`);
    }
}

// async function test() {
//     await enrollAdmin("admin")
// }

// test()

module.exports = enrollAdmin