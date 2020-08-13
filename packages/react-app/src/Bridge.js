import React, { useEffect, useState } from "react";
import { Row, List, Button, Divider } from 'antd';


import * as fcl from "@onflow/fcl";
import * as sdk from "@onflow/sdk";
import * as types from "@onflow/types";

import { useContractLoader, useContractReader, useEventListener } from "./hooks"


import NFTtemplate from "./flow/src/contracts/dummy.cdc";
import DappymonCode from "./flow/src/contracts/Dappymon.cdc";

import setupUser from "./flow/src/contracts/setupUser.cdc";
import mintNFT from "./flow/src/contracts/mintNFT.cdc";
import checkReceiver from "./flow/src/contracts/checkReceiver.cdc"

import "./Bridge.css";

import { generateCode, getAddress, getEthereumID } from "./flow/src/utility.js";

export const getUserAddress = async () => {
  const user = fcl.currentUser();
  const snapshot = await user.snapshot();
  return getAddress(snapshot);
};


var contractDeployed = localStorage.getItem("contractDeployed") ? true : false;
var templateDeployed = localStorage.getItem("templateDeployed") ? true : false;

  // dummy deploy karo
const deployTemplateContract = async () => {

  const { authorization } =  fcl.currentUser();
  const templateAddress = await getUserAddress();
  localStorage.setItem("templateAddress",templateAddress);
  const code = await generateCode(NFTtemplate);

    const tx = await fcl.send([
      sdk.transaction`
            transaction(code: String) {
              prepare(acct: AuthAccount) {
                acct.setCode(code.decodeHex())
              }
            }
          `,
      fcl.args([
        fcl.arg(Buffer.from(code, "utf8").toString("hex"), types.String),
      ]),
      fcl.proposer(authorization),
      fcl.payer(authorization),
      fcl.authorizations([authorization]),
      fcl.limit(100),
    ]);

    console.log({ tx });

    fcl.tx(tx).subscribe((txStatus) => {
      if (fcl.tx.isExecuted(txStatus)) {
        console.log("Contract was deployed");
      }
    });

    templateDeployed = true;
    localStorage.setItem("templateDeployed",true);
};

  // Dappymon contract deloy karo
const deployDappymonContract = async () => {

  const { authorization } = fcl.currentUser();
  const contractAddress = await getUserAddress();
  localStorage.setItem("contractAddress",contractAddress);

  const code = await generateCode(DappymonCode, {
    query: /(0x01)/g,
    "0x01":localStorage.getItem("templateAddress"),
  });

  const tx = await fcl.send([
    sdk.transaction`
            transaction(code: String) {
              prepare(acct: AuthAccount) {
                acct.setCode(code.decodeHex())
              }
            }
          `,
    fcl.args([
        fcl.arg(Buffer.from(code, "utf8").toString("hex"), types.String),
    ]),
    fcl.proposer(authorization),
    fcl.payer(authorization),
    fcl.authorizations([authorization]),
    fcl.limit(100),
  ]);

  console.log({ tx });

  fcl.tx(tx).subscribe((txStatus) => {
    if (fcl.tx.isExecuted(txStatus)) {
      console.log("Contract was deployed");
    }
  });

  contractDeployed = true;
  localStorage.setItem("contractDeployed",true);
};

// setupUser tx
export const setupUserTx = async () => {

  const { authorization } = fcl.currentUser();
  const code = await generateCode(setupUser, {
    query: /(0x01|0x02)/g,
    "0x01": localStorage.getItem("templateAddress"),
    "0x02": localStorage.getItem("contractAddress"),
  });

  const tx = await fcl.send([
    sdk.transaction`${code}`,
    sdk.payer(authorization),
    sdk.proposer(authorization),
    sdk.authorizations([authorization]),
    sdk.limit(100),
  ]);

  console.log({ tx });

  fcl.tx(tx).subscribe((txStatus) => {
    if (fcl.tx.isExecuted(txStatus)) {
      console.log("Transaction was executed");
    }
  });
};

// mint tx
const mintNFTTx = async (userAddress,ethTokenID) => {

  const { authorization } = fcl.currentUser();
  //const tokenID = getEthereumID(4);

  console.log("Mint to address :", userAddress);
  console.log("TokenID : ", ethTokenID);


  const code = await generateCode(mintNFT, {
    query: /(0x01|0x02|0x03|TOKEN_ID)/g,
    "0x01": localStorage.getItem("templateAddress"),
    "0x02": localStorage.getItem("contractAddress"),
    "0x03": userAddress,
    "TOKEN_ID": getEthereumID(ethTokenID),
  });

  const tx = await fcl.send([
    sdk.transaction`${code}`,
    sdk.payer(authorization),
    sdk.proposer(authorization),
    sdk.authorizations([authorization]),
    sdk.limit(100),
  ]);

  console.log({ tx });

  fcl.tx(tx).subscribe((txStatus) => {
    if (fcl.tx.isExecuted(txStatus)) {
      console.log("Transaction was executed");
    }
  });
};

// script to check if receiver of current user is set up or not
const checkIfReceiverSetup = async (userAddress) => {

  const code = await generateCode(checkReceiver, {
    query: /(0x01|0x02|0x03)/g,
    "0x01": localStorage.getItem("templateAddress"),
    "0x02": localStorage.getItem("contractAddress"),
    "0x03": userAddress,
  });

  const response = await fcl.send([
    sdk.script`${code}`,
  ]);

  return fcl.decode(response);
};

export const getEvents = async (params) => {
    // Define event type from params
    const { contractAddress, contractName, eventName } = params;
    const eventType = `A.${contractAddress}.${contractName}.${eventName}`;

    const { from = 0, to } = params;
    let toBlock;
    if (to === undefined) {
      // Get latest block
      const blockResponse = await fcl.send(
        await sdk.build([sdk.getLatestBlock()])
      );
      toBlock = blockResponse.latestBlock.height;
    } else {
      toBlock = to;
    }

    const response = await fcl.send(
      await sdk.build([sdk.getEvents(eventType, from, toBlock)])
    );

    // Return a list of events
    //return response.events;
    const events = await fcl.decode(response);
    return events;
};


export default function Bridge(props){


  const readContracts = useContractLoader(props.localProvider);
  const writeContracts = useContractLoader(props.injectedProvider);
  const _ERC721events = useEventListener(readContracts,"NFTescrow","_ERC721update",props.localProvider,1);


  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const [mintingTasks, setMintingTasks] = useState( localStorage.getItem("mintingTasks")? JSON.parse(localStorage.getItem("mintingTasks")) : []);

  useEffect(() => {
         updateEvents();
  },[_ERC721events]);

  const updateEvents = async () => {

    var prevLength = localStorage.getItem("eventsLength") ? localStorage.getItem("eventsLength") : 0;
    var newLength = _ERC721events.length;

    if(newLength > prevLength){

       const temp = [];
       for (var i = prevLength; i < newLength ; i++){
           const event = _ERC721events[i];
           // TODO: how to handle reminting
           if(event._received){
              temp.push({"flowAddress": event._flowAddress, "ethereumTokenID": event._tokenID.toNumber()});
           }
       }

       setMintingTasks(mintingTasks => [...mintingTasks, ...temp]);
       localStorage.setItem("eventsLength", newLength);
    }
  }

  useEffect(() => {
      localStorage.setItem("mintingTasks", JSON.stringify(mintingTasks));
  },[mintingTasks]);

  const [completedTasks, setCompletedTasks] = useState( localStorage.getItem("completedTasks")? JSON.parse(localStorage.getItem("completedTasks")) : []);

  useEffect(() => {
      localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
  },[completedTasks]);

  const mint_NFT2 = async () => {

    if(mintingTasks.length == 0){
      console.log("No task pending! 🙌")
      return;
    }

    const mintedTo = mintingTasks[0];
    const res = await checkIfReceiverSetup(mintedTo.flowAddress);

    const temp = [...mintingTasks];
    temp.splice(0, 1);

    if(res == "true"){

      await mintNFTTx(mintedTo.flowAddress, mintedTo.ethereumTokenID);
      setMintingTasks(mintingTasks => [...temp]);
      setCompletedTasks(completedTasks => [mintedTo, ...completedTasks]);
      console.log("NFT minted to : ", mintedTo.flowAddress);
    }else{
      // remove from front
      // put it in the back
      console.log("Receiver not set : ", mintedTo.flowAddress);
      setMintingTasks(mintingTasks => [...temp,mintedTo]);
      console.log("👀 Receiver not set by : ", mintedTo.flowAddress);
    }

    // TODO: Call Flow events to figure out flow id of minted NFT

  };



  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // Deploy FLow's standard NFT contract template
  const deploy_template = async () => {
    await deployTemplateContract();
    // set up global variable templateAddress
  };

  // Deploy custom NFT contract
  const deploy_contract = async () => {
    await deployDappymonContract();
    // set up global variable contractAddress
  };






const Event_converted = async () => {
    const events = await getEvents({
      contractName: "Dappymon",
      contractAddress: "179b6b1cb6755e31", // note the address is without "0x" prefix
      eventName: "Converted",
    });
    console.log("Converted waley events: ",events);
    //console.log(events[0].payload.value.fields);

    events.map((event) => {
    //  setTxList(txList => [{"eth_id":event.data.ethid, "flow_id":event.data.id, "flow_address":event.data.address} , ...txList]);
      return event;
    });
};

/* not in use */
const Event_deposit = async () => {
  const events = await getEvents({
    contractName: "Dappymon",
    contractAddress: "179b6b1cb6755e31", // note the address is without "0x" prefix
    eventName: "Deposit",  // yha 'from' block bhi daalna seekho
  });
  console.log("events:" ,events);

  events.map((event) => {
    //setTxList(txList => [{"token_id":event.data.id, "address":event.data.to} , ...txList]);
    return event;
  });

  //Event_converted();
  //  TODO: yha loop lgake iterate karo

};


  return (
    <div>

      {!templateDeployed &&
        <Row>
          <h2>👉 Deploy Template with Account 1</h2>
          <div style={{width:10}}></div>
          <Button onClick={deploy_template}>Deploy Template</Button>
        </Row>
      }
      {!contractDeployed &&
        <Row>
          <h2>👉 Deploy Contract with Account 2</h2>
          <div style={{width:20}}></div>
          <Button onClick={deploy_contract}>Deploy Contract</Button>
        </Row>
      }
      {
        <Row>
          <h2>👉 Start Minting NFTs </h2>
          <div style={{width:30}}></div>
          <Button type="primary" onClick={mint_NFT2}>mint NFT</Button>
        </Row>
      }
      <Divider style={{ marginLeft: "0px" }}></Divider>


      <Row style={{width:800}}>
      <List
        style={{ width: 350, marginTop: 25}}
        header={<div><b>Minting Tasks : </b></div>}
        bordered
        dataSource={mintingTasks}
        renderItem={item => (
        <List.Item key={item.flowAddress} style={{ fontSize:14 }}>
          Mint Eth ID: {item.ethereumTokenID} to {item.flowAddress}
        </List.Item>
      )}
      />
      <List
        style={{ width: 400, marginTop: 25, marginLeft: 25}}
        header={<div><b>Completed Tasks : </b></div>}
        bordered
        dataSource={completedTasks}
        renderItem={item => (
        <List.Item key={item.flowAddress} style={{ fontSize:14 }}>
           ETH {item.ethereumTokenID} minted to {item.flowAddress}
        </List.Item>
      )}
      />
      </Row>
    </div>
  )
}
