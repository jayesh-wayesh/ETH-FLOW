import React, { useEffect, useState } from "react";
import { Divider, PageHeader } from 'antd';

import * as fcl from "@onflow/fcl";
import "./Flow.css";



fcl
  .config()
  .put("challenge.handshake", "http://localhost:8701/flow/authenticate");




function Flow() {
  const [user, setUser] = useState(null);

  const handleUser = (user) => {
    if (user.cid) {
      setUser(user);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    return fcl.currentUser().subscribe(handleUser);
  }, []);


  const userLoggedIn = user && !!user.cid;

  return (
    <div>
      <PageHeader
        title="🛸 DapperDoor"
        subTitle="Gateway to Flow"
        style={{cursor:'pointer',position:'fixed',textAlign:'right',left:0,top:0,padding:1}}
      />
      <div style={{height:100}}></div>

      {!userLoggedIn ? (
        <div style={{position:'fixed',textAlign:'right',right:0,top:0,padding:10}}>
          <button onClick={() => {fcl.authenticate();}}>Login</button>
        </div>
        ) : (
        <>
          <h1 className="welcome">Welcome, {user.identity.name}</h1>
          <p>Your Address</p>
          <p className="address">{user.addr}</p>
          <div style={{position:'fixed',textAlign:'right',right:0,top:0,padding:10}}>
             <button onClick={() => {fcl.unauthenticate();}}>Logout</button>
          </div>
           <Divider style={{ marginLeft: "0px" }}></Divider>
        </>
      )}
      </div>
  );
}

export default Flow;
