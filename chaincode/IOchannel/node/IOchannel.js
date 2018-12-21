'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {

  /**
   * Method called when the chaincode is instantiated by the blockchain network. 
   * Best practice is to have any Ledger initialization in separate function -- see initLedger()
   */
  async Init(stub) {
    console.info('=========== start Init ===========');
    return shim.success();
  }

  /**
   * Method called as a result of an application request to run the chaincode
   */
  async Invoke(stub) {
    console.info('=========== start Invoke ===========');
    const invocationArguments = stub.getFunctionAndParameters();
    console.info(invocationArguments);

    const requestedFunction = this[invocationArguments.fcn];
    if (!requestedFunction) {
      console.error(`no function with name: ${invocationArguments.fcn} found`);
      throw new Error(`Received unknown function ${invocationArguments.fcn} invocation`);
    }
    
    try {
      const payload = await requestedFunction(stub, invocationArguments.params);
      return shim.success(payload);
    } catch (error) {
      console.log(error);
      return shim.error(error);
    }
  }

  async initLedger(stub, args) {
    console.info('============= start initLedger ===========');
    
    const messages = [
      {
        senderId: 'testSender',
        content: 'This is a test message'
      }
    ];

    for(let i=0; i<messages.length; i++) {
      await stub.putState(`MSG${i}`, Buffer.from(JSON.stringify(messages[i])));
      console.info(`Added:  ${messages[i]}`);
    }

    console.info('============= finish initLedger ===========');
  }

  async queryMessage(stub, args) {
    console.info('============= start queryMessage ===========');
    if (args.length != 1)
      throw new Error('Incorrect number of arguments. Expected messageId is missing');
    
    const messageId = args[0];

    const messageAsBytes = await stub.getState(messageId);
    if(!messageAsBytes || messageAsBytes.toString().length <= 0)
      throw new Error(`${messageId} does not exist.`);

    console.log(messageAsBytes.toString());
    console.info('============= finish queryMessage ===========');

    return messageAsBytes;
  }

  async putMessage(stub, args) {
    console.info('============= start putMessage ===========');
    if (args.length != 3)
      throw new Error('Incorrect number of arguments. Expecting 3 arguments');

    const messageId = args[0];
    const message = {
      senderId: args[1],
      content: args[2]
    };

    await stub.putState(messageId, Buffer.from(JSON.stringify(message)));

    console.info('============= finish putMessage ===========');
  }

  async queryAllMessages(stub, args) {
    console.info('============= start queryAllMessages ===========');

    const startKey = 'MSG0';
    const endKey = 'MSG999';

    const iterator = await stub.getStateByRange(startKey, endKey);

    const allResults = [];
    while (true) {
      const nextValue = await iterator.next();

      if (nextValue.value && nextValue.value.value.toString()) {
        const jsonRes = {};
        console.log(nextValue.value.value.toString('utf8'));

        jsonRes.Key = nextValue.value.key;
        try {
          jsonRes.Record = JSON.parse(nextValue.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          jsonRes.Record = nextValue.value.value.toString('utf8');
        }
        allResults.push(jsonRes);
      }
      
      if (nextValue.done) {
        console.log('end of data');
        
        await iterator.close();

        console.info(allResults);
        console.info('============= stop queryAllMessages ===========');

        return Buffer.from(JSON.stringify(allResults));
      }
    }
  }
};

shim.start(new Chaincode());
