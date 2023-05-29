import { get, post } from "./http";

export const helloReact = () => {
  return post("/helloReact");
};

//获取cosswalkRoad10的json数据
export const getJson = () => {
  return post("/getJson");
};

//获取cosswalkRoad10的json数据
export const getList= () => {
  return post("/getList");
};

/**
 * 
 * @param {时间戳} startTime
 * @returns 
 */
export const getTimeJson =(startTime)=>{
  return post('/getTimeJson',{
    startTime:startTime
  })
}
//获取高价值场景数据
export const getActionAndRoadCount= () => {
  return post("/getActionAndRoadCount");
};


/**
 * 获取高价值场景列表数据
 * @param {时间戳} startTime
 * @returns 
 */
export const getHighValue =(startTime)=>{
  return post('/getHighValue',{
    startTime:startTime
  })
}

/**
 * 获取聚类散点图数据
 * @param {时间戳} startTime
 * @returns 
 */
export const getCluster =(startTime)=>{
  return post('/getCluster',{
    startTime:startTime
  })
}


/**
 * 获取独立交通参与者轨迹
 * @param {交通参与者} id 
 * @param {交通参与者类型} type
 * @returns 
 */
export const getIdHighValue=(id,type)=>{
  return post('/getIdHighValue',{
    id:id,
    type:type
  })
}