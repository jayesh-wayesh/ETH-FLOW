import React, { useEffect, useState } from "react";
import {Link} from "react-router-dom";
import {Row, Col} from 'antd';

export default function Home(){

  return (
    <div>
      <Col style={{position:'fixed', textAlign:'left', left:10,top:200}}>
        <div>
            <Link to="/ethuser">🔗 Ethereum User Profile</Link>
         </div>
         <div style={{height:40}}></div>
         <div>
            <Link to="/ethescrow">🔗 Ethereum Escrow</Link>
         </div>
         <div style={{height:40}}></div>
         <div>
            <Link to="/flowdashboard">🔗 Flow Admin Dashboard</Link>
         </div>
         <div  style={{height:40}}></div>
         <div>
            <Link to="/flowuser">🔗 Flow User Profile</Link>
         </div>
      </Col>
    </div>
  )
}
