import React, { useRef, useEffect, useState } from "react"; // 导入 React 和 useRef 和 useEffect hooks
import * as THREE from "three"; // 导入 Three.js 库
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { getJson, getTimeJson } from "../../apis/api";
import traffic from "../../assets/gltf/traffic_modifiedV1.gltf";
import car from "../../assets/gltf/testcar.gltf";
// 引入gltf模型加载库GLTFLoader.js
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import road_back from "../../assets/road_pic/road_background.jpg";
// import sky_up from "../../assets/road_pic/py.png";
// import sky_right from "../../assets/road_pic/px.png";
// import sky_left from "../../assets/road_pic/nx.png";
// import sky_front from "../../assets/road_pic/nz.png";
// import sky_back from "../../assets/road_pic/pz.png";
// import sky_down from "../../assets/road_pic/ny.png";
import * as TWEEN from "@tweenjs/tween.js";
import "./mainView.css";

const mapName = ["boundary", "crosswalk", "lane", "signal", "stopline"];

const move = {
  x: -121,
  y: -104,
  z: -13,
  angle: 90,
};
const TestThree = ({}) => {
  const containerRef = useRef(); // 使用 useRef 创建容器引用
  const [time, setTime] = useState(new Date());
  const [startTime, setStartTime] = useState(1681372078);
  const [timeMsg, setTimeMsg] = useState(1681372078);
  const [standardTimeMsg, setStandardTimeMsg] = useState(
    converTimestamp(timeMsg)
  );

  useEffect(() => {
    // //判断先前是否已经创建了渲染器实例，如果已经创建了，就不再创建
    // if (containerRef.current) {
    //     return;
    //   }
    // getJson().then((res) => {
    //   const geoJsonData = res;
    //   drawThree(geoJsonData);
    // });
    getTimeJson(startTime)
      .then((res) => {
        const data = res;
        drawThree(data);
      })
      .catch((err) => {
        console.log("err", err);
      });
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setStandardTimeMsg(converTimestamp(timeMsg));
      setTimeMsg(timeMsg + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeMsg]);

  const drawThree = (data) => {
    /**three.js基础配置 */
    // 创建场景
    const scene = new THREE.Scene();

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // camera.position.set(10, 100, 250);
    camera.position.set(-81, -104, -13+150);
    // let x_axis = new THREE.Vector3( 1, 0, 0 );
    // let quaternion = new THREE.Quaternion();
    // camera.position.applyQuaternion(quaternion.setFromAxisAngle(x_axis,move.angle));

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // 创建光源
    // const light = new THREE.DirectionalLight(0xffffff, 1);
    // light.position.set(-100, -110, 1);
    // scene.add(light);
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);
    /**GLTF模型导入 */
    // 导入地图模型
    const loader = new GLTFLoader();
    loader.load(traffic, (gltf) => {
      gltf.scene.rotateX(THREE.MathUtils.degToRad(move.angle));
      gltf.scene.position.set(move.x, move.y, move.z);
      console.log(gltf.scene.position);
      // 返回的场景对象gltf.scene插入到threejs场景中
      scene.add(gltf.scene);
    });
    //对数据做循环渲染，按照步骤调用模型创建、模型轨迹存放、模型移动、模型销毁
    //创建天空盒  （6张图片都需要换）
    // scene.background = new THREE.CubeTextureLoader().load([
    //   sky_right,
    //   sky_left,
    //   sky_up,
    //   sky_down,
    //   sky_back,
    //   sky_front,
    // ]);
    // function createPlaneGeometryBasicMaterial() {
    //   var textureLoader = new THREE.TextureLoader();
    //   var cubeMaterial = new THREE.MeshStandardMaterial({
    //     map: textureLoader.load(road_back),
    //   });
    //   cubeMaterial.map.wrapS = THREE.RepeatWrapping;
    //   cubeMaterial.map.wrapT = THREE.RepeatWrapping;
    //   cubeMaterial.map.repeat.set(8, 8); // 创建地平面并设置大小
    //   var planeGeometry = new THREE.PlaneGeometry(1000, 1000);
    //   var plane = new THREE.Mesh(planeGeometry, cubeMaterial); // 设置平面位置并旋转

    //   plane.rotation.x = -0.5 * Math.PI;
    //   plane.position.x = 0;
    //   plane.position.y = 10;
    //   plane.position.z = 0;
    //   return plane;
    // } // 将平面添加到场景中
    // var plane = createPlaneGeometryBasicMaterial();
    // scene.add(plane);
    //对所有交通参与者数据进行遍历，并创建小车模型等操作
    let models = {};
    let modelsToLoad = {};
    for (let trafficId in data) {
      //交通参与者100s秒的轨迹
      const carTrace = movePosition(data[trafficId]["trace"]);
      // let instance
      // loader.load(car,(gltf)=>{
      //   instance = gltf.scene.clone();
      //   models[trafficId] = instance
      //   // instance.name  = trafficId
      //   scene.add(instance);
      //   // console.log(("1111"));
      //   moveModel(0,instance,scene,carTrace)
      // })
      modelsToLoad[trafficId] = {
        timestamp: parseFloat(
          data[trafficId]["startTime"] / 1000000 - startTime
        ),
        trace: carTrace,
        instance: null,
      };
      //对每个交通参与者轨迹进行渲染
      // moveModel(0,instance,scene,carTrace)
    }
    const clock = new THREE.Clock();
    // 渲染循环
    const animate = () => {
      requestAnimationFrame(animate);
      //clock.getDelta()方法获得两帧的时间间隔，返回时间单位：秒
      // 检查是否有新模型需要加载
      const elapsedTime = clock.getElapsedTime();
      for (let modelId in modelsToLoad) {
        // console.log("在运行。。。");
        if (
          modelsToLoad[modelId].timestamp <= elapsedTime &&
          modelsToLoad[modelId].instance === null
        ) {
          loader.load(car, (gltf) => {
            let instance = gltf.scene.clone();
            modelsToLoad[modelId].instance = instance;
            scene.add(instance);
            moveModel(0, instance, scene, modelsToLoad[modelId].trace);
          });
        }
      }
      // 更新所有活动的 tween 对象
      TWEEN.update();
      renderer.render(scene, camera);
    };
    animate();

    //创建一个控制器，控制器会自动绑定到相机上
    const controls = new OrbitControls(camera, renderer.domElement);
    //设置控制器的中心点
    controls.target.set(-121, -104, -13);
    //控制器平移
    controls.enablePan = true;
    // controls.enableDamping = true;
    controls.enableRotate = true;
    controls.update();
  };
  return (
    <div className="mainView">
      <div className="timeMsg">{standardTimeMsg}</div>
      <div ref={containerRef}></div>
    </div>
  ); // 返回带有容器引用的 div 元素
};

//16位时间戳转换
const converTimestamp = (timestamp) => {
  // 将微秒时间戳转换为毫秒
  const milliseconds = timestamp * 1000;

  // 使用毫秒时间戳创建一个新的 Date 对象
  const date = new Date(milliseconds);

  // 返回日期和时间字符串
  return date.toLocaleString("en-US", { hour12: false });
};

//******************封装单一交通参与者轨迹放入、模型运动、模型销毁四大功能 */
// 单一模型轨迹
const movePosition = (data) => {
  let tracePositions = [];
  data.forEach((point) => {
    point = JSON.parse(point);
    const arr = [point.x, point.y];
    tracePositions.push(new THREE.Vector3(arr[0], arr[1]));
  });
  return tracePositions;
};
//根据轨迹移动模型
const moveModel = (startIndex, model, scene, tracePositions) => {
  if (startIndex >= tracePositions.length - 1) {
    destroyModel(model, scene);
    return;
  }
  const tween = new TWEEN.Tween(tracePositions[startIndex])
    .to(tracePositions[startIndex + 1], 200)
    .onUpdate((tracePositions) => {
      model.position.copy(tracePositions);
    })
    .onComplete(() => {
      moveModel(startIndex + 1, model, scene, tracePositions);
    })
    .start();
};
//销毁模型
const destroyModel = (model, scene) => {
  // 从场景中移除模型
  scene.remove(model);
  // 释放模型的几何体、材质和纹理资源
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      child.material.dispose();
      if (child.material.map) child.material.map.dispose();
    }
  });
};

export default TestThree; // 导出 Polygon 组件
