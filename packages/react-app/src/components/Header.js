import React from 'react'
import { PageHeader } from 'antd';

export default function Header(props) {
  return (
    <div onClick={()=>{
      window.open("");
    }}>
      <PageHeader
        title="🛸 DapperDoor"
        subTitle="Gateway to Flow"
        style={{cursor:'pointer'}}
      />
    </div>
  );
}
