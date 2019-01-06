'use strict';
const shim = require('fabric-shim');

let Chaincode = class {

  /**
   * Method called when the chaincode is instantiated by the blockchain network. 
   * Best practice is to have any Ledger initialization in separate function -- see initLedger()
   */
  async Init(stub) {
    console.log('[ init ] start');
    console.log('[ init ] finish');

    return shim.success();
  }

  /**
   * Method called as a result of an application request to run the chaincode
   */
  async Invoke(stub) {
    console.log('[ invoke ] start');
    
    const invocationArguments = stub.getFunctionAndParameters();
    console.log(`[ invoke ] called with arguments: ${JSON.stringify(invocationArguments)}`);

    const requestedFunction = this[invocationArguments.fcn];
    if (!requestedFunction) {
      console.error(`[ invoke ] no function with name: ${invocationArguments.fcn} found`);
      throw new Error(`[ invoke ] received unknown function ${invocationArguments.fcn} invocation`);
    }
    
    try {
      const payload = await requestedFunction(stub, invocationArguments.params);
      return shim.success(payload);
    } catch (error) {
      console.log(`[ invoke ] ${error}`);
      return shim.error(error);
    } finally {
      console.log('[ invoke ] finish');
    }
  }

  async initLedger(stub, args) {
    console.log('[ initLedger ] start');
    console.log('[ initLedger ] finish');
  }

  async queryMessage(stub, args) {
    console.log('[ queryMessage ] start');
    
    if (args.length != 1)
      throw new Error('[ queryMessage ] incorrect number of arguments. Expected messageId, but is missing');
    
    const messageId = args[0];

    const messageAsBytes = await stub.getState(messageId);

    if(!messageAsBytes || messageAsBytes.toString().length <= 0)
      throw new Error(`[ queryMessage ] no data found with id ${messageId}.`);

    console.log(`[ queryMessage ] message: ${messageAsBytes.toString()}`);
    console.log('[ queryMessage ] finish');

    return messageAsBytes;
  }

  async putMessage(stub, args) {
    console.log('[ putMessage ] start');
    
    if (args.length != 2)
      throw new Error('[ putMessage ] incorrect number of arguments. Expecting 2 arguments.');

    console.log(`[ putMessage ] id: ${args[0]}`)
    console.log(`[ putMessage ] content: ${args[1]}`)

    const messageId = args[0];
    // const message = {
    //   content: args[1]
    // };
    const message = args[1]

    await stub.putState(messageId, Buffer.from(JSON.stringify(message)));

    console.log('[ putMessage ] finish');
  }

  async queryByRange(stub, args) {
    console.log('[ queryAllMessages ] start');

    const startKey = args[0];
    const endKey = args[1];

    const iterator = await stub.getStateByRange(startKey, endKey);

    const allResults = [];
    while (true) {
      const nextValue = await iterator.next();

      if (nextValue.value && nextValue.value.value.toString()) {
        const jsonRes = {};
        console.log(`[ queryAllMessages ] read: ${nextValue.value.value.toString('utf8')}`);

        jsonRes.Key = nextValue.value.key;
        try {
          jsonRes.Record = JSON.parse(nextValue.value.value.toString('utf8'));
        } catch (error) {
          console.log(`[ queryAllMessages ] ${error}`);
          jsonRes.Record = nextValue.value.value.toString('utf8');
        }

        allResults.push(jsonRes);
      }
      
      if (nextValue.done) {
        console.log('[ queryAllMessages ] end of data');
        
        await iterator.close();

        console.log(`[ queryAllMessages ] all results: ${JSON.stringify(allResults)}`);
        console.log('[ queryAllMessages ] stop');

        return Buffer.from(JSON.stringify(allResults));
      }
    }
  }
};

shim.start(new Chaincode());
