import { Table} from 'rsuite';
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
        <Table height={81} data={infoArray} headerHeight={35}>
            <Column width={150} align="center" fixed>
              <HeaderCell style={{ fontWeight: 'bold' }}>ID</HeaderCell>
              <Cell dataKey="id" />
            </Column>
            <Column width={142} fixed>
              <HeaderCell style={{ fontWeight: 'bold' }}>Type</HeaderCell>
              <Cell dataKey="type" ></Cell>
            </Column>
            <Column width={150} fixed>
              <HeaderCell style={{ fontWeight: 'bold' }}>状态追踪</HeaderCell>
              <Cell>{renderStatusCell}</Cell>
            </Column>
          </Table>
        </div>
    )
}

export default InfoList;