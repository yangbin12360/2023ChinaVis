import { Avatar, List, message,Dropdown,Space } from 'antd';
import VirtualList from 'rc-virtual-list';
import { useEffect, useState } from 'react';
import { getList } from "../../apis/api";
import { DownOutlined } from '@ant-design/icons';


const ContainerHeight = 400; //容器高度
function TestList() {
  const [data, setData] = useState([]);
  //type
  const [typeNum, setType] = useState(-1);
  const [typemenu, setTypemenu] = useState("选择想要查看的类型");
  const [listData, setListData] = useState([]);
  //进行数据的增加
  const appendData = () => {
    getList()
      .then((res) => {
        console.log(res);
        setData(data.concat(res));
        setListData(listData.concat(res));
        //message.success(`${res.length} more items loaded!`);
      });
  };

  //初始化页面时执行一次钩子函数进行原始数据的增加
  useEffect(() => {
    appendData();
  }, []);
  //每次滑动下滑条进行数据的增加
  // const onScroll = (e) => {
  //   if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop === ContainerHeight) {
  //     appendData();
  //   }
  // };


  //判断物体类型
  const typeName = (item) => {
          if (item.type == 1){
            return "小型车辆";
          }
          else if (item.type == 2){
            return "行人";
          }
          else if (item.type == 3){
            return "非机动车";
          }
          else if (item.type == 4){
            return "卡车";
          }
          else if (item.type == 6){
            return "客车";
          }
          else if (item.type == 7){
            return "静态物体";
          }
          else if (item.type == 10){
            return "手推车、三轮车";
          }
          
        }

    //判断异常事件类型
    const activityName = (item) => {
      if (item.action_name == 'car_cross'){
        return "切入切出";
      }
      else if (item.action_name == 'long_time'){
        return "停止时间过久";
      }
      else if (item.action_name == 'nomotor_cross'){
        return "非机动车异常行为";
      }
      else if (item.action_name == 'overSpeeding'){
        return "超速";
      }
      else if (item.action_name == 'people_cross'){
        return "行人异常行为";
      }
      else if (item.action_name == 'reverse'){
        return "逆行";
      }
      else if (item.action_name == 'speedDown'){
        return "急减速";
      }
      else if (item.action_name == 'speedUp'){
        return "急加速";
      }

    }
    
    //判断描述(有些类型未改完)
    const description = (item) => {
      if (item.action_name == 'car_cross'){
        return "切入切出次数:"+item.count;
      }
      else if (item.action_name == 'long_time'){
        return "停止时间段："+item.time_arr;
      }
      else if (item.action_name == 'nomotor_cross'){
        return "非机动车异常行为时间段："+item.time_arr;
      }
      else if (item.action_name == 'overSpeeding'){
        return "超速速度："+item.mean_velo;
      }
      else if (item.action_name == 'people_cross'){
        return "行人异常行为时间段："+item.time_arr;
      }
      else if (item.action_name == 'reverse'){
        return "逆行时间："+item.time;
      }
      else if (item.action_name ==' speedDown'){
        return "急减速:"+item.end_velocity;
      }
      else if (item.action_name == 'speedUp'){
        return "急加速:"+item.end_velocity;
      }
    }

    //列表点击事件
    const clickHandler = (e) => {
      console.log('事件被触发了', e.target)
    }

    //下拉框过滤
    //点击选择事件
    const onClick= ({ key }) => {
      message.info(`Click on item ${key}`);
      setType(key);
    };
   
  useEffect(() => {
    if (typeNum == -1){
      setTypemenu("选择想要查看的参与者类型");
      setListData(data);
    }
    else if (typeNum == 0){
      setTypemenu("所有类型");
      setListData(data);
    }
    else if(typeNum ==1){
      setTypemenu("小型车辆");
      setListData(data.filter((item) => {
        return item.type == 1;
      })) 
    }
    else if(typeNum ==2){
      setTypemenu("行人");
      setListData(data.filter((item) => {
        return item.type == 2;
      })) 
    }
    else if(typeNum ==3){
      setTypemenu("非机动车");
      setListData(data.filter((item) => {
        return item.type == 3;
      })) 
    }
    else if(typeNum ==4){
      setTypemenu("卡车");
      setListData(data.filter((item) => {
        return item.type == 4;
      })) 
    }
    else if(typeNum ==6){
      setTypemenu("客车");
      setListData(data.filter((item) => {
        return item.type == 6;
      })) 
    }
    else if(typeNum ==7){
      setTypemenu("静态物体");
      setListData(data.filter((item) => {
        return item.type == 7;
      })) 
    }
    else if(typeNum ==10){
      setTypemenu("手推车、三轮车");
      setListData(data.filter((item) => {
        return item.type == 10;
      })) 
    }
  }, [typeNum]);
  
    //type下拉框条目
    const items = [
      {
        label: '所有类型',
        key: '0',
      },
      {
        label: '小型车辆',
        key: '1',
      },
      {
        label: '行人',
        key: '2',
      },
      {
        label: '非机动车',
        key: '3',
      },
      {
        label: '卡车',
        key: '4',
      },
      {
        label: '客车',
        key: '6',
      },
      {
        label: '静态物体',
        key: '7',
      },
      {
        label: '手推车、三轮车',
        key: '10',
      },
    ];
    

  return (
    <div className='APP'>
      {/* 下拉框事件参与者 */}
      <div><Dropdown
    menu={{
      items,
      onClick,
    }}
  >
    <a onClick={(e) => e.preventDefault()}>
      <Space>
        {typemenu}
        <DownOutlined />
      </Space>
    </a>
  </Dropdown></div>
 

        {/* 列表 */}
       <List>
      <VirtualList
        data={listData}
        height={ContainerHeight}
        itemHeight={47}
        
        // onScroll={onScroll}
      >
        {(item) => (
          //avatar为列表元素的图表
          //description为列表元素的描述内容
          //title为列表元素的标题
          <List.Item   onClick={clickHandler} >
            <List.Item.Meta
              avatar={<div>{activityName(item)}</div>}
              title={<div>{typeName(item)}</div>}
              description={description(item)}
            />
            <div>ID：{item.id}</div>
          </List.Item>
        )}
      </VirtualList>
    </List>
    </div>
  );
}

export default TestList;
