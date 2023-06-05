import { Table} from 'rsuite';
import { Space, Tag } from 'antd';
import React, { useState,useEffect } from 'react';
import {TYPE_NAME_LIST} from '../utils/constant.js' 

const { Column, HeaderCell, Cell } = Table;

const InfoList =(props) =>{
      const {selectTraceId,singleType} = props
      const [infoArray,setInfoArray] = useState([])
      useEffect(()=>{
        setInfoArray([{id:selectTraceId,type:TYPE_NAME_LIST[singleType]}])
        // infoArray.push({id:selectTraceId,type:singleType})
      },[selectTraceId,singleType])
      const renderStatusCell = (rowData, rowIndex) => {
        return (
          <Cell>
            <button className="statusButton">状态按钮</button>
          </Cell>
        );
      };
    
    return (
        <div className="infoBox">
        <Table height={85} data={infoArray} headerHeight={35}>
            <Column width={250} align="center" fixed>
              <HeaderCell style={{ fontWeight: 'bold' }}>ID</HeaderCell>
              <Cell dataKey="id" />
            </Column>
            <Column width={142} align="center" fixed>
              <HeaderCell style={{ fontWeight: 'bold' }}>Type</HeaderCell>
              <Cell dataKey="type" ></Cell>
            </Column>
            <Column width={668} align="center" fixed>
              <HeaderCell style={{ fontWeight: 'bold' }}>事件类型标签</HeaderCell>
              <Cell>    <Space size={[0, 8]} wrap>
      <Tag color="magenta">切入切出</Tag>
      <Tag color="red">长时间停车</Tag>
      <Tag color="volcano">非机动车异常</Tag>
      <Tag color="orange">超速</Tag>
      <Tag color="gold">行人异常</Tag>
      <Tag color="lime">逆行</Tag>
      <Tag color="green">急减速</Tag>
      <Tag color="geekblue">急加速</Tag>
    </Space></Cell>
            </Column>
          </Table>
        </div>
    )
}

export default InfoList;