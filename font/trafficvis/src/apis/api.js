import { get, post } from "./http";

export const helloReact = () => {
  return post("/helloReact");
};