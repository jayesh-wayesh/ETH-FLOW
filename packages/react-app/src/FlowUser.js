import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button } from 'antd';

import { setupUserTx, getUserAddress, getEvents } from "./Bridge.js";
import usePoller from "./hooks/Poller.js";

export default function FlowUser(){

  const [myCollection, setMyCollection] = useState([]);

  const Event_converted = async () => {
      const events = await getEvents({
        contractName: "Dappymon",
        contractAddress: "179b6b1cb6755e31", // note the address is without "0x" prefix
        eventName: "Converted",
      });

      console.log("events :", events);
      const userAddress = await getUserAddress();
      var temp = [];
      events.map((event) => {
        // id = address
        if(event.data.id == userAddress){
          temp.push(
            <Col style={{width:200}}>
             <Card
               hoverable
               cover={<img alt="example" src={"https://storage.googleapis.com/opensea-prod.appspot.com/creature/"+event.data.ethid+".png"} />}
               bodyStyle={{ marginBottom: "-5px" }}
               style={{ width: 200, height: 270, marginTop: 25 }}>
               <p>Flow ID: {event.data.address}</p>
               <p>Eth ID: {event.data.ethid}</p>
             </Card>
           </Col>
          );
        }
        //setTxList(txList => [{"eth_id":event.data.ethid, "flow_id":event.data.id, "flow_address":event.data.address} , ...txList]);
        return event;
      });

      setMyCollection(myCollection => [...temp]);
  };

  console.log("myCollection :", myCollection)
  usePoller(Event_converted,10000);
  useEffect(() => {
       Event_converted();
  },[]);

  // Set up NFTReceiver
  const setup_user = async () => {
     await setupUserTx();
  };

  return (
      <div>
        <div style={{position:'fixed',textAlign:'right',left:0,top:60,padding:10 }}>
          <Button  type="primary" onClick={setup_user}>Setup Receiver</Button>
        </div>
        <h2>My NFT Collection 👾</h2>
        <Row style={{width:700}}>
          {myCollection}
        </Row>
      </div>
  )
}
