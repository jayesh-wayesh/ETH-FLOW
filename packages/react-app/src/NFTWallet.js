import React, { useEffect, useState } from 'react'
import { ethers } from "ethers";
import { Card, Row, Col, List, Input, Button, Divider } from 'antd';
import { DownloadOutlined, UploadOutlined, CloseCircleOutlined, CheckCircleOutlined, RocketOutlined, SafetyOutlined } from '@ant-design/icons';
import { useContractLoader, useContractReader, useEventListener, useBlockNumber, useBalance, useTimestamp, useCustomContractReader, useCustomContractLoader } from "./hooks"
import { Address, Balance, Timeline, AddressInput, Blockie } from "./components"


const { Meta } = Card;
const contractName = "NFTescrow"
var url = require('url');

const ESCROW="0x5D79475C85B39E3ef1DdBdcD54560EC9eAC4B466";


export default function Nftwallet(props) {

  // Flow Address
  const [flowAddress, setFlowAddress] = useState(
    (localStorage.getItem("flowAddress")) ? localStorage.getItem("flowAddress") : "No ADDRESS!");
  const [inputAddress, setInputAddress] = useState("");
  const [myCollection, setMyCollection] = useState([]);


  const readContracts = useContractLoader(props.localProvider);
  const writeContracts = useContractLoader(props.injectedProvider);
  const contractAddress = readContracts?readContracts[contractName].address:""
  const _ERC721events = useEventListener(readContracts,contractName,"_ERC721update",props.localProvider,1);
  //const _flowAddressUpdated = useEventListener(readContracts,contractName,"_flowAddressUpdated",props.localProvider,1);


  // transferNFT from user account to ESCROW
  const transferNFT = async (id) => {

    console.log("id : ", id);
    var temp = localStorage.getItem("flowAddress");
    const res1 = await writeContracts['Creature'].safeTransferFrom(props.address,ESCROW,new ethers.utils.BigNumber(id.toString()));
    console.log("res1 :", res1);
  }



  // update Flow Address
  const updateFlowAddress = async () => {
    console.log("input : ", inputAddress);
    const res = await writeContracts['NFTescrow']._updateFlowAddress(inputAddress.toString());
    console.log("FLow Address updated :", res);
    setFlowAddress(inputAddress);
  }


  // render creature Collection
  const ListCreatures = async () => {
    var temp = [];
    for (var i = 1; i <= 12; i++) {
      const id = i;
      const res = await writeContracts['Creature'].ownerOf(new ethers.utils.BigNumber(id.toString()));
      if(res == props.address){
        temp.push(
          <Col style={{width:200}}>
           <Card
             hoverable
             cover={<img alt="example" src={"https://storage.googleapis.com/opensea-prod.appspot.com/creature/"+i+".png"} />}
             bodyStyle={{ marginBottom: "-5px" }}
             style={{ width: 200, height: 250, marginTop: 25 }}>
           </Card>
           <Button type="primary" onClick={() => transferNFT(id)}>Convert to Flow</Button>
         </Col>
        );
      }
    }
    setMyCollection(myCollection => [...temp]);
  }


  // get Flow address (if available) corresponding to current ethereum address
  const getFlowAddress = async () => {
    const res = await writeContracts['NFTescrow'].getFlowAddress();
    console.log("flow Address --> ", res);
    if(res.length){
      setFlowAddress(res);
    }
  }


  useEffect(() => {
     if(writeContracts){
       ListCreatures();
       getFlowAddress();
     }
  },[_ERC721events]);

  useEffect(() => {
    localStorage.setItem("flowAddress", flowAddress);
  },[flowAddress]);



  return (
    <div>
        <Card
          title={(
            <div>
              Current User 📄
              <div style={{float:'right',opacity:0.77}}>
              </div>
            </div>
          )}
          size="large"
          style={{ width: 550, marginTop: 25 }}>
          <Meta
            description={(
              <div>
                <Address
                  ensProvider={props.ensProvider}
                  value={props.address}
                />
              </div>
            )}
          />
          <Divider style={{ marginLeft: "0px" }}></Divider>
            <h3>👉 Firstly, check if your FLOW address is updated or not. </h3>
            <h3>👉 Click on the Convert to Flow button to transfer it to Escrow. </h3>
            <h3>🔄 In case you are unable to see your collection wait for some time and then try refreshing. </h3>
          <Divider style={{ marginLeft: "0px" }}></Divider>
        <div style={{height:20}}></div>
          <div>
            <h3>Current Flow Address: {flowAddress} </h3>
            <input type="text" style={{opacity:0.5}} placeholder="Address" onChange={e => (setInputAddress(e.target.value))}/>
            <div style={{height:10}}></div>
            <Button type="primary" onClick={updateFlowAddress}>Update Flow Address</Button>
          </div>
        </Card>
        <div style={{height:50}}></div>
        <h2>My NFT Collection 👾</h2>
      <Row style={{width:700}}>
            {myCollection}
        </Row>
    </div>
  );
}
