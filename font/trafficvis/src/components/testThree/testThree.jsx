import React, { useRef, useEffect } from "react"; // 导入 React 和 useRef 和 useEffect hooks
import * as THREE from "three"; // 导入 Three.js 库
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { getJson } from "../../apis/api";
import traffic from "../../assets/gltf/traffic_modifiedV1.gltf";
import car from "../../assets/gltf/testcar.glb";
// 引入gltf模型加载库GLTFLoader.js
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import sky from '../../assets/fig/sky.jpg';
import * as TWEEN from "@tweenjs/tween.js";

const mapName = ["boundary", "crosswalk", "lane", "signal", "stopline"];

const move = {
  x: -121,
  y: -104,
  z: -13,
  angle: 90,
};
const TestThree = ({}) => {
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
    // let x_axis = new THREE.Vector3( 1, 0, 0 );
    // let quaternion = new THREE.Quaternion();
    // camera.position.applyQuaternion(quaternion.setFromAxisAngle(x_axis,move.angle));

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
    loader.load(traffic, (gltf) => {
      gltf.scene.rotateX(THREE.MathUtils.degToRad(move.angle));
      gltf.scene.position.set(move.x, move.y, move.z);
      // 返回的场景对象gltf.scene插入到threejs场景中
      scene.add(gltf.scene);
    });
    // 导入小车模型
    let model1,model2;
    loader.load(car, (gltf) => {
      model1 = gltf.scene.clone();
      model2 = gltf.scene.clone();
      scene.add(model1);
      scene.add(model2);
      // 在模型加载完成后，开始移动模型
      moveModel(0);
      moveModel2(0);
    });
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
    // handleGeoJSON(data[mapName[0]]);
    // handleGeoJSON(data[mapName[1]]);
    // handleGeoJSON(data[mapName[2]]);
    // handleGeoJSON(data[mapName[4]]);
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
    let positions2 = []; //位置坐标
    let indexArr2 = []; //位置索引
    let indexCar2 = 0; //小车索引
    let timeStamps2 = []; //时间戳数组
    data["car2"].forEach((car) => {
      const strPosition = car.position;
      const objPostion = JSON.parse(strPosition);
      const arr = [objPostion.x, objPostion.y];
      const coordinates = arr;
      //暂时将在动的轨迹坐标放入
      if (car.is_moving == 1) {
        positions2.push(new THREE.Vector3(coordinates[0], coordinates[1]));
        indexArr2.push(indexCar2);
        indexCar2 = indexCar + 1;
        timeStamps2.push(car.time_meas);
      }
    });
    console.log("positions2",positions2);
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
    const moveModel = (index) => {
      if (index >= positions.length - 1) {
        // destroyModel(model1,scene);
        return;
      }
      // console.log("car1第",index,"次的时间为：",converTimestamp(timeStamps[index]));
      currentCoordIndex = index;
      // 创建一个新的 tween 对象，以在 0.2 秒内将模型从当前坐标移动到下一个坐标
      const tween1 = new TWEEN.Tween(positions[currentCoordIndex])
        .to(positions[currentCoordIndex + 1], 200)
        .onUpdate((positions) => {
          // 更新模型的位置
          model1.position.copy(positions)
        })
        .onComplete(() => {
          // 当 tween 对象完成时，递归调用 moveModel 函数
          moveModel(currentCoordIndex + 1);
        })
        .start(); // 开始 tween 动画
    };
    let currentCoordIndex2 = 0;
    const moveModel2 = (index)=>{
      if (index >= positions2.length - 1) {
        destroyModel(model2,scene);
        return;
      }
      console.log("car2第",index,"次的时间为：",converTimestamp(timeStamps2[index]));
      currentCoordIndex2 = index;
      const tween2 = new TWEEN.Tween(positions2[currentCoordIndex2])
      .to(positions2[currentCoordIndex2 + 1], 200)
      .onUpdate((positions2) => {
        // 更新模型的位置
        model2.position.copy(positions2)
      })
      .onComplete(() => {
        // 当 tween 对象完成时，递归调用 moveModel 函数
        moveModel2(currentCoordIndex2 + 1);
      })
      .start(); // 开始 tween 动画
    }
     //创建天空盒  （6张图片都需要换）
    //         scene.background = new THREE.CubeTextureLoader().load([sky,sky,sky,sky,sky,sky]);
    //         // 创建一个地面
    //         function createPlaneGeometryBasicMaterial() {
    //           var textureLoader = new THREE.TextureLoader();
    //           var cubeMaterial = new THREE.MeshStandardMaterial({
    //             map: textureLoader.load(sky),
    //           });
    //           cubeMaterial.map.wrapS = THREE.RepeatWrapping;
    //           cubeMaterial.map.wrapT = THREE.RepeatWrapping;
    //           cubeMaterial.map.repeat.set(8, 8)
    //           // 创建地平面并设置大小
    //           var planeGeometry = new THREE.PlaneGeometry(1000, 1000);
    //           var plane = new THREE.Mesh(planeGeometry, cubeMaterial);
    
    //           // 设置平面位置并旋转
    //           plane.rotation.x = -0.5 * Math.PI;
    //           plane.position.x = 0;
    //           plane.position.y = 10;
    //           plane.position.z = 0;
    //           return plane;
    //         }
    //         // 将平面添加到场景中
    //         var plane = createPlaneGeometryBasicMaterial();
    //         scene.add(plane);
    // 渲染循环
    const animate = () => {
      requestAnimationFrame(animate);
      // 更新所有活动的 tween 对象
      TWEEN.update();
      renderer.render(scene, camera);
    };
    animate()

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
const converTimestamp = (timestamp)=>{
    // 将微秒时间戳转换为毫秒
    const milliseconds = timestamp / 1000;

    // 使用毫秒时间戳创建一个新的 Date 对象
    const date = new Date(milliseconds);
  
    // 返回日期和时间字符串
    return date.toLocaleString('en-US', { hour12: false });
}
// 生成多个模型实例，目前针对单一类型
const createModels = (modelNum,scene,gltf) =>{
  //存放多个模型实例
  let instanceArray = []
  for(let i=0;i<modelNum;i++){
    const instance = gltf.scene.clone();
    instance.name = 'car${i}'
    instanceArray.push(instance);
    scene.add(instance);
  }
  return instanceArray;
}
//移动坐标存放,还得改
const movePositions =(data)=>{
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
  return [positions,indexArr,timeStamps];
}
//销毁模型
const destroyModel = (model,scene)=>{
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
}
export default TestThree; // 导出 Polygon 组件
