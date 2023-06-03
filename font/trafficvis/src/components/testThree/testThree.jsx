import React, { useRef, useEffect,useState } from "react"; // 导入 React 和 useRef 和 useEffect hooks
import * as THREE from "three"; // 导入 Three.js 库
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { getJson } from "../../apis/api";
import traffic from "../../assets/gltf/traffic_modifiedV1.gltf";
import car from "../../assets/gltf/testcar.gltf";
// 引入gltf模型加载库GLTFLoader.js
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type1 from "../../assets/gltf/type1.gltf";
import type2 from "../../assets/gltf/type1(rotate).gltf";
//import sky from '../../assets/fig/sky.jpg';
import * as TWEEN from "@tweenjs/tween.js";
import * as dat from 'dat.gui';
//import road_background from './static/road_pic/road_background.png';
// import sky_up from '../../assets/fig/nz.png';
// import sky_right from '../../assets/fig/px.png';
// import sky_left from '../../assets/fig/nx.png';
// import sky_front from '../../assets/fig/ny.png';
// import sky_back from '../../assets/fig/py.png';
// import sky_down from '../../assets/fig/pz.png';


const mapName = ["boundary", "crosswalk", "lane", "signal", "stopline"];

const move = {
  x: -121,
  y: -104,
  z: -13,
  angle: 90,
};
const TestThree = ({}) => {


  // 创建一个新的dat.GUI对象
const gui = new dat.GUI();

// 创建一个控制对象，这个对象将被添加到GUI中
const controlObject = {
  rotationSpeed: 0.01, // 初始旋转速度
};

// 将控制对象添加到GUI中
gui.add(controlObject, 'rotationSpeed', -0.01, 0.01);
  const containerRef = useRef(); // 使用 useRef 创建容器引用
  useEffect(() => {
    // //判断先前是否已经创建了渲染器实例，如果已经创建了，就不再创建
    // if (containerRef.current) {
    //     return;
    //   }
    getJson().then((res) => {
      const geoJsonData = res;
      drawThree(geoJsonData);
    });
  }, []);
  const drawThree = (data) => {
      // 创建一个新的dat.GUI对象
const gui = new dat.GUI();

// 创建一个控制对象，这个对象将被添加到GUI中
const controlObject = {
  rotationSpeed: 1, // 初始旋转速度
};

// 将控制对象添加到GUI中
gui.add(controlObject, 'rotationSpeed', -0.01, 0.01);
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
    camera.position.set(0, -100, 250);
 
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // 创建光源
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 1, 1);
    // scene.add(light);
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    /**GLTF模型导入 */
    // 导入地图模型
    const loader = new GLTFLoader();
    // loader.load(traffic, (gltf) => {
    //   gltf.scene.rotateX(THREE.MathUtils.degToRad(move.angle));
    //   gltf.scene.position.set(move.x, move.y, move.z);
    //   scene.add(gltf.scene);
    // });
    // 导入小车模型
    let model1, model2;
    loader.load(type1, (gltf) => {
      model1 = gltf.scene.clone();
      // model2 = gltf.scene.clone();
      scene.add(model1);
      scene.add(model2);
      // 在模型加载完成后，开始移动模型
      moveModel(model1,0);
    });
    let quaternion = new THREE.Quaternion()
    function render() {
      // 更新模型的旋转
      model1.rotation.y += controlObject.rotationSpeed;
    
      // 渲染场景
      renderer.render(scene, camera);
    
      // 请求下一帧
      requestAnimationFrame(render);
    }
    /**临时绘制地图轨迹 */
    // 处理GeoJSON数据
    const handleGeoJSON = (data) => {
      data.features.forEach((feature) => {
        if (feature.geometry.type === "Polygon") {
          const shape = new THREE.Shape();

          const coordinates = feature.geometry.coordinates[0];
          const [startX, startY, startZ] = coordinates[0];
          shape.moveTo(startX, startY);

          for (let i = 1; i < coordinates.length; i++) {
            const [x, y, z] = coordinates[i];
            shape.lineTo(x, y);
          }

          const geometry = new THREE.ShapeGeometry(shape);
          const material = new THREE.MeshBasicMaterial({
            color: "#003566",
            side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
        } else if (feature.geometry.type === "LineString") {
          const colorList = ["red", "yellow", "#ffc2d1"];
          let i = 0;
          if (data.name == "lane") i = 1;
          if (data.name == "stopline") i = 2;
          console.log("data", data.name);
          const coordinates = feature.geometry.coordinates;
          const material = new THREE.LineBasicMaterial({ color: colorList[i] });
          const geometry = new THREE.BufferGeometry().setFromPoints(
            coordinates.map(([x, y]) => new THREE.Vector2(x, y))
          );
          const line = new THREE.Line(geometry, material);
          scene.add(line);
        }
      });
    };
    handleGeoJSON(data[mapName[0]]);
    handleGeoJSON(data[mapName[1]]);
    handleGeoJSON(data[mapName[2]]);
    handleGeoJSON(data[mapName[4]]);
    /**小车轨迹绘制 */
    let positions = []; //位置坐标
    let indexArr = []; //位置索引
    let indexCar = 0; //小车索引
    let timeStamps = []; //时间戳数组
    //交通参与者坐标放入
    data["car"].forEach((car) => {
      const strPosition = car.position;
      const objPostion = JSON.parse(strPosition);
      const arr = [objPostion.x, objPostion.y];
      const coordinates = arr;
      //暂时将在动的轨迹坐标放入
      if (car.is_moving == 1) {
        positions.push(new THREE.Vector3(coordinates[0], coordinates[1]));
        indexArr.push(indexCar);
        indexCar = indexCar + 1;
        timeStamps.push(car.time_meas);
      }
    });
;
    //创建小车轨迹
    const material = new THREE.LineBasicMaterial({
      color: "green",
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(positions);
    geometry.setIndex(indexArr);
    const carLine = new THREE.Line(geometry, material);
    scene.add(carLine);
    /**小车按帧移动 */
    let currentCoordIndex = 0;
    const moveModel = (model,index) => {
      if (index >= positions.length - 1) {
        // destroyModel(model1,scene);
        return;
      }
      // console.log("car1第",index,"次的时间为：",converTimestamp(timeStamps[index]));
      currentCoordIndex = index;
      let directLength = positions.length;
      // 创建一个新的 tween 对象，以在 0.2 秒内将模型从当前坐标移动到下一个坐标
      const tween1 = new TWEEN.Tween(positions[currentCoordIndex])
        .to(positions[currentCoordIndex + 1], 200)
        .onUpdate((positions1) => {
      // 更新模型的位置
      model.position.copy(positions1);
      if ( currentCoordIndex< directLength  - 2) {
        // console.log("朝向发生改变");
        let targetQuaternion = new THREE.Quaternion(); // 创建一个目标四元数
        targetQuaternion.setFromRotationMatrix(
          new THREE.Matrix4().lookAt(
            positions[currentCoordIndex + 2],
            model.position,
            new THREE.Vector3(0, 0, 1) // 这是模型的上方向
          )
        );
        quaternion.slerp(targetQuaternion, 0.1);
        model.quaternion.copy(quaternion);
      }
        })
        .onComplete(() => {
          // 当 tween 对象完成时，递归调用 moveModel 函数
          moveModel(model,currentCoordIndex + 1);
        })
        .start(); // 开始 tween 动画
    };

    // 渲染循环
    const animate = () => {
      requestAnimationFrame(animate);
      // 更新所有活动的 tween 对象
      TWEEN.update();
      renderer.render(scene, camera);
    };
    animate();

    //创建一个控制器，控制器会自动绑定到相机上
    const controls = new OrbitControls(camera, renderer.domElement);
    //设置控制器的中心点
    controls.target.set(0, -100, 0);
    //控制器平移
    controls.enablePan = true;
    // controls.enableDamping = true;
    controls.update();
  };
  return <div ref={containerRef} />; // 返回带有容器引用的 div 元素
};

//16位时间戳转换
const converTimestamp = (timestamp) => {
  // 将微秒时间戳转换为毫秒
  const milliseconds = timestamp / 1000;

  // 使用毫秒时间戳创建一个新的 Date 对象
  const date = new Date(milliseconds);

  // 返回日期和时间字符串
  return date.toLocaleString("en-US", { hour12: false });
};

// 生成多个模型实例，目前针对单一类型
const createModels = (modelNum, scene, gltf) => {
  //存放多个模型实例
  let instanceArray = [];
  for (let i = 0; i < modelNum; i++) {
    const instance = gltf.scene.clone();
    instance.name = "car${i}";
    instanceArray.push(instance);
    scene.add(instance);
  }
  return instanceArray;
};
//移动坐标存放,还得改
const movePositions = (data) => {
  let positions = []; //位置坐标
  let indexArr = []; //位置索引
  let indexCar = 0; //小车索引
  let timeStamps = []; //时间戳数组
  data.forEach((car) => {
    const strPosition = car.position;
    const objPostion = JSON.parse(strPosition);
    const arr = [objPostion.x, objPostion.y];
    const coordinates = arr;
    //暂时将在动的轨迹坐标放入
    if (car.is_moving == 1) {
      positions.push(new THREE.Vector3(coordinates[0], coordinates[1]));
      indexArr.push(indexCar);
      indexCar = indexCar + 1;
      timeStamps.push(car.time_meas);
    }
  });
  return [positions, indexArr, timeStamps];
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
