import React, { useEffect, useRef, useState } from 'react';
import { Table } from 'rsuite';
import * as d3 from 'd3';

const { Column, HeaderCell, Cell } = Table;

const NowList = (props) => {
  const { nowTimeData ,handleSelectId} = props;

  const [sortedData, setSortedData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    let sorted = [...nowTimeData].sort((a, b) => b.startTime - a.startTime);
    if (sorted.length > 150) {
      sorted = sorted.splice(0, 150);
    }
    setSortedData(sorted);
  }, [nowTimeData]);

  const converTimeStamp = (timeStamp) => {
    const date = new Date(timeStamp * 1000);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };

  const handleRowClick = (rowData) => {
    console.log(rowData.type);
    handleSelectId(rowData.id,rowData.type)

    setSelectedRow(rowData);
  };

  return (
    <div className="container">
      <Table height={200} data={sortedData} onRowClick={handleRowClick}>
        <Column width={100} align="center" fixed>
          <HeaderCell>ID</HeaderCell>
          <Cell dataKey="id" />
        </Column>
        <Column width={45} align="center" fixed>
          <HeaderCell>类型</HeaderCell>
          <Cell dataKey="type" />
        </Column>
        <Column width={90} align="center" fixed>
          <HeaderCell>速度(km/h)</HeaderCell>
          <Cell dataKey="velocity" />
        </Column>
        <Column width={80}  align="center"fixed>
          <HeaderCell>出现时间</HeaderCell>
          <Cell>
            {(rowData, rowIndex) => {
              return converTimeStamp(rowData.startTime);
            }}
          </Cell>
        </Column>
        <Column width={85} align="center" fixed>
          <HeaderCell>消失时间</HeaderCell>
          <Cell>
            {(rowData, rowIndex) => {
              return converTimeStamp(rowData.endTime);
            }}
          </Cell>
        </Column>
      </Table>
    </div>
  );
};

export default NowList;
