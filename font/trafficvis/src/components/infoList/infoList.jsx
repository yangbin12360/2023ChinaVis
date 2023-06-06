import { Table } from "rsuite";
import { Space, Tag } from "antd";
import React, { useState, useEffect } from "react";
import { TYPE_NAME_LIST } from "../utils/constant.js";

const { Column, HeaderCell, Cell } = Table;

const InfoList = (props) => {
  const { selectTraceId, singleType } = props;
  const [infoArray, setInfoArray] = useState([]);
  useEffect(() => {
    setInfoArray([{ id: selectTraceId, type: TYPE_NAME_LIST[singleType] }]);
    // infoArray.push({id:selectTraceId,type:singleType})
  }, [selectTraceId, singleType]);
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
        <Column width={100} align="center" fixed>
          <HeaderCell style={{ fontWeight: "bold" ,backgroundColor: '#efefef',borderBottom:"2px solid #fff"}}>ID</HeaderCell>
          <Cell dataKey="id" style={{ backgroundColor: '#efefef' }} />
        </Column>
        <Column width={80} align="center" fixed>
          <HeaderCell style={{ fontWeight: "bold",backgroundColor: '#efefef' ,borderBottom:"2px solid #fff"}}>类型</HeaderCell>
          <Cell dataKey="type" style={{ backgroundColor: '#efefef' }}></Cell>
        </Column>
        <Column width={500} align="center" fixed>
          <HeaderCell style={{ fontWeight: "bold" ,backgroundColor: '#efefef',borderBottom:"2px solid #fff"}}>事件类型标签</HeaderCell>
          <Cell style={{ backgroundColor: '#efefef' }}>
            {" "}
            <Space size={[0, 8]} wrap>
              <Tag color="magenta">切入切出</Tag>
              <Tag color="red">长时间停车</Tag>
              <Tag color="volcano">非机动车异常</Tag>
              <Tag color="orange">超速</Tag>
              <Tag color="gold">行人异常</Tag>
              <Tag color="lime">逆行</Tag>
              <Tag color="green">急减速</Tag>
              <Tag color="geekblue">急加速</Tag>
            </Space>
          </Cell>
        </Column>
        <Column width={380} align="center" fixed>
          <HeaderCell style={{ fontWeight: "bold",backgroundColor: '#efefef' ,borderBottom:"2px solid #fff"}}>图例</HeaderCell>
          <Cell dataKey="type" style={{ backgroundColor: '#efefef' }}>
            两条线图例+背景图例
          </Cell>
        </Column>
      </Table>
    </div>
  );
};

export default InfoList;
