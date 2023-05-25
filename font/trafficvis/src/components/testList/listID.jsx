import { Avatar, List, message,Dropdown,Space,Col,Row,Button,Table} from 'antd';
import { useEffect, useState,useRef } from 'react';
function ListID(){
    const columns = [
        {
          title: 'ID',
          dataIndex: 'key',
        },
        {
          title: '类型',
          dataIndex: 'address',
        },
        {
          title: '高价值场景',
          dataIndex: 'age',
        },
        {
          title: '开始时间',
          dataIndex: 'name',
        },
      ];
      const [data,SetData] = useState([])
      const datatemp =[];
      for (let i = 0; i < 20500; i++) {
        datatemp.push({
          key: i,
          name: `时间 ${i}`,
          age: '超速',
          address: '小型车辆',
        });
      }
      
      //该时间段内高价值场景列表的触发函数
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    // const start = () => {
    //   setLoading(true);
    //   // ajax request after empty completing
    //   setTimeout(() => {
    //     setSelectedRowKeys([]);
    //     setLoading(false);
    //   }, 1000);
    // };
    const onSelectChange = (newSelectedRowKeys,newselectedRows) => {
      console.log('selectedRowKeys changed: ', newselectedRows);
      setSelectedRowKeys(newSelectedRowKeys,newselectedRows);
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;
    //画该时间段内的高价值场景列表
    const [listContainerHeight,setHeight] = useState(200);
    const [listContainerWidth,setWidth] = useState(200);
    function drawListContainer(){
        //获取该时间段内所有高价值场景列表容器的长宽
    console.log(listContainerHeight,listContainerWidth);
    SetData(datatemp);
    }
  
    useEffect(() => {
      drawListContainer();
    },[])
    
    return(
        <div >
          <div>
            <span style={{marginLeft: 8,}}>
              {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
            </span>
          </div>
          <Table rowSelection={rowSelection} columns={columns} dataSource={data} size = 'small' pagination={false} scroll={{x:200,y:100}}
           onRow={(record) => {
            return {
              onMouseEnter: (event) => {console.log(record)}, // 鼠标移入行
              onMouseLeave: (event) => {console.log('移出')},
            };
          }}
          />
          </div>

    );
}
export default ListID;