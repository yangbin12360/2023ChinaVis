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