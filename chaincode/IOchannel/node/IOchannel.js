/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {

  // The Init method is called when the Smart Contract 'IOchannel' is instantiated by the blockchain network
  // Best practice is to have any Ledger initialization in separate function -- see initLedger()
  async Init(stub) {
    console.info('=========== Instantiated IOchannel chaincode ===========');
    return shim.success();
  }

  // The Invoke method is called as a result of an application request to run the Smart Contract
  // 'IOchannel'. The calling application program has also specified the particular smart contract
  // function to be called, with arguments
  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.error('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async queryMessage(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting MessageId ex: MSG0');
    }
    let messageId = args[0];

    let messageAsBytes = await stub.getState(messageId); //get the message from chaincode state
    if (!messageAsBytes || messageAsBytes.toString().length <= 0) {
      throw new Error(messageId + ' does not exist: ');
    }
    console.log(messageAsBytes.toString());
    return messageAsBytes;
  }

  async initLedger(stub, args) {
    console.info('============= START : Initialize Ledger ===========');
    
    let messages = [];
    messages.push({
      senderId: 'testSender',
      content: 'This is a test message'
    });

    for (let i = 0; i < messages.length; i++) {
      await stub.putState('MSG' +i, Buffer.from(JSON.stringify(messages[i])));
      console.info('Added <--> ', messages[i]);
    }

    console.info('============= END : Initialize Ledger ===========');
  }

  async putMessage(stub, args) {
    console.info('============= START : putMessage ===========');

    if (args.length != 3)
      throw new Error('Incorrect number of arguments. Expecting 3');

    var message = {
      senderId: args[1],
      content: args[2]
    };

    await stub.putState(args[0], Buffer.from(JSON.stringify(message)));

    console.info('============= END : putMessage ===========');
  }

  async queryAllMessages(stub, args) {

    let startKey = 'MSG0';
    let endKey = 'MSG999';

    let iterator = await stub.getStateByRange(startKey, endKey);

    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        jsonRes.Key = res.value.key;
        try {
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString('utf8');
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return Buffer.from(JSON.stringify(allResults));
      }
    }
  }
};

shim.start(new Chaincode());
