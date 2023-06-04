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
 * 
 * @param {时间戳} startTime
 * @returns 
 */
//获取弦图数据
export const getLittleRoadFlow= (startTime) => {
  return post("/getLittleRoadFlow",{
    startTime:startTime
  });
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

/**
 * 获取独立交通参与者轨迹
 * @param {时间戳} startTime 
 * @param {车道号} roadNumber
 *  @param {高价值场景索引} actionName
 * @returns 
 */
 export const detail_item=(startTime,roadNumber,actionName)=>{
  return post('/detail_item',{
    startTime:startTime,
    roadNumber:roadNumber,
    actionName:actionName
  })
}

/**
* 获取流量预测数据
* @param {时间戳} timeStamp
* @returns 
*/
export const getFlow=(timeStamp)=>{
 return post('/getFlow',{
  timeStamp:timeStamp,
 })
}


/**
 * 
 * @param {时间戳} startTime
 * @returns 
 */
//获取弦图数据
export const getCrossWalkData= (startTime) => {
  return post("/getCrossWalkData",{
    startTime:startTime
  });
};



/**
 * 
 * @param {时间戳} startTime
 * @returns 
 */
//获取相似度数据
export const getSimilarity= (timeStamp) => {
  return post("/getSimilarity",{
    timeStamp:timeStamp
  });
};
