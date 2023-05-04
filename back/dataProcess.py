import json
import os
import operator
from shapely.geometry import LineString,Polygon

# 对数据按照类型和id进行分组
def dataType():
  allData = {}
  # 获取所有数据文件夹
  for i in range(10):
    # 创建文件夹./static/data/ChinaVis Data文件夹，里面放入ChinaVis数据和./static/data/DataProcess/文件夹
    f = open("./static/data/ChinaVis Data/part-0000" + str(i) +"-905505be-27fc-4ec6-9fb3-3c3a9eee30c4-c000.json", "r", encoding="utf-8")
    data = f.read().split("\n")
    # 按照id将数据分组
    for j in data:
      try:
        nowData = json.loads(j)
        if(nowData["id"] not in allData):
          allData[nowData["id"]] = []
        allData[nowData["id"]].append(nowData)
      except:
        print(j)
  
  # 按照数据的类型进行分组保存
  for i in allData:
    nowType = str(allData[i][0]["type"])
    if(not os.path.exists("./static/data/DataProcess/" + nowType)):
      os.makedirs("./static/data/DataProcess/" + nowType)
    f = open("./static/data/DataProcess/" + nowType + "/" + str(i) + ".json", "w")
    f.write(json.dumps(allData[i]))



# 按时间戳顺序对每辆车的轨迹数据进行排序
def sortItem():
    # 获取文件夹下的所有子文件夹
    subfolders = [f.path for f in os.scandir('./static/data/DataProcess') if f.is_dir()]

    # 遍历所有子文件夹，读取子文件夹中的文件
    for subfolder in subfolders:
        # 遍历子文件夹中的所有文件
        for filename in os.listdir(subfolder):
            filepath = os.path.join(subfolder, filename)
            # 处理文件
            with open(filepath, 'r') as f:
                data = json.load(f)
                # 处理数据，进行排序
                data_sorted = sorted(data, key=operator.itemgetter('time_meas'))
                # 将修改后的数据写入到原文件
                with open(filepath, 'w') as f:
                    json.dump(data_sorted, f)
    
                    
# 提取机动车急加急减情况
def speedUpDown():
    # 提取机动车急加急加情况，存到./static/data/DataProcess/speedUp.json和speedDown.json文件中
    # 设置文件夹路径
    speedUp_THRESHOLD = 2.78  # 设置加速度阈值为 2.78 m/s^2
    speedDown_THRESHOLD = -2.78
    time_THRESHOLD = 2 #异常持续时间阈值
    root_folder_path = './static/data/DataProcess'
    SpeedUp_path = './static/data/DataProcess/speedUp.json'
    SpeedDown_path = './static/data/DataProcess/speedDown.json'
    SpeedUp_data = []  # 急加速数据
    SpeedDown_data=[] #急减速数据
    # 遍历根文件夹
    for folder_name in os.listdir(root_folder_path):
        folder_path = os.path.join(root_folder_path, folder_name)
        # 判断是否为需要处理的文件夹
        if not os.path.isdir(folder_path) or folder_name not in ['1', '4', '6']:#机动车才被检测
            continue
        for file_name in os.listdir(folder_path):
            file_path = os.path.join(folder_path, file_name)
            with open(file_path, 'r') as f:
                data = json.load(f)
            if(len(data) < 5): #文件中低于5帧的数据不处理
                continue
            # data = sorted(data, key=lambda x: x['time_meas'])#按照时间排列数据
            accel_list=[] #加速度列表
            for i in range(0, len(data),5):# 每隔 5 帧（1s）计算一次加速度
                curr_speed = data[i]['velocity']
                prev_speed = data[i-5]['velocity']
                if i == 0:
                    accel_list.append(0)
                else:
                    accel_list.append((curr_speed - prev_speed) / 1)
            startUp = endUp = 0 #急加速起始帧和终止帧
            startDown = endDown = 0 #急减速起始帧和终止帧
            speedUp_list = [] #急加速列表
            speedDown_list =[] #急减速列表
            # 遍历加速度列表,找出急加速的起始帧和终止帧
            for i in range(1,len(accel_list)-1):
                if accel_list[i] >= speedUp_THRESHOLD and accel_list[i-1] >= speedUp_THRESHOLD:
                    endUp+=1
                    len_speedUp+=1
                if accel_list[i] >= speedUp_THRESHOLD and accel_list[i-1] < speedUp_THRESHOLD:
                    startUp = endUp=i
                    len_speedUp = 1
                if accel_list[i] < speedUp_THRESHOLD and accel_list[i-1] >= speedUp_THRESHOLD and len_speedUp >= time_THRESHOLD:
                    speedUp_list.append((startUp, endUp,len_speedUp))
                    # print(f"急加速发生在车辆 {data[0]['id']} 的第 {data[5*startUp]['seq']} 到第 {data[5*endUp]['seq']} 帧，加速度为 {accel_list[i-1]} m/s^2")  
                if accel_list[i] <= speedDown_THRESHOLD and accel_list[i-1] <= speedDown_THRESHOLD:
                    endDown+=1
                    len_speedDown+=1
                if accel_list[i] <= speedDown_THRESHOLD and accel_list[i-1] > speedDown_THRESHOLD:
                    startDown = endDown=i
                    len_speedDown = 1
                if accel_list[i] > speedDown_THRESHOLD and accel_list[i-1] <= speedDown_THRESHOLD and len_speedDown >= time_THRESHOLD:
                    speedDown_list.append((startDown, endDown,len_speedDown))
                    # print(f"急减速发生在车辆 {data[0]['id']} 的第 {data[5*startDown]['seq']} 到第 {data[5*endDown]['seq']} 帧，加速度为 {accel_list[i-1]} m/s^2")
            if len(speedUp_list) > 0:
                for i in range(len(speedUp_list)): #将急加速数据存入SpeedUp_data列表中
                    SpeedUp_data.append({
                        'type':data[0]['type'],
                        'id': data[0]['id'],
                        'speedUp_time': speedUp_list[i][2],
                        'start_time': data[5*speedUp_list[i][0]]['time_meas'],
                        'start_seq': data[5*speedUp_list[i][0]]['seq'],
                        'start_position': data[5*speedUp_list[i][0]]['position'],
                        'end_position': data[5*speedUp_list[i][1]]['position'],
                        'start_velocity': data[5*speedUp_list[i][0]]['velocity'],
                        'end_velocity': data[5*speedUp_list[i][1]]['velocity']
                    })
            if len(speedDown_list)>0: # 将急减速数据存入SpeedDown_data列表中
                for i in range(len(speedDown_list)):
                    SpeedDown_data.append({
                        'type':data[0]['type'],
                        'id': data[0]['id'],
                        'speedDown_time': speedDown_list[i][2],
                        'start_time': data[5*speedDown_list[i][0]]['time_meas'],
                        'start_seq': data[5*speedDown_list[i][0]]['seq'],
                        'start_position': data[5*speedDown_list[i][0]]['position'],
                        'end_position': data[5*speedDown_list[i][1]]['position'],
                        'start_velocity': data[5*speedDown_list[i][0]]['velocity'],
                        'end_velocity': data[5*speedDown_list[i][1]]['velocity']
                    })
        print(folder_path+"done!")
    with open(SpeedUp_path, 'w') as f:
        json.dump(SpeedUp_data, f)
    with open(SpeedDown_path, 'w') as f:
        json.dump(SpeedDown_data, f)
    print("Done!")
    
    
# 获取边界线geojson数据的坐标用于shapely库画线，针对不同的车辆需要不同的边界线组合 
def getBoundry(file_path):
    
    #对边界geojson数据做了一些处理，形成了三个文件
    file_path=['./static/data/ChinaVis Data/road10map/boundaryroad_car.geojson',
           './static/data/ChinaVis Data/road10map/boundaryroad_people.geojson',
           './static/data/ChinaVis Data/road10map/boundaryroad_non.geojson']
    
    #遍历边界geojson数据，找出坐标
    for i,filepath in enumerate(file_path, start=1):
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        features = data['features']
        boundryRoad = []
        for feature in features:
            geometry = feature['geometry']
            if geometry['type'] == 'LineString':
                coordinates = []
                for coordinate in geometry['coordinates']:
                    x = coordinate[0]
                    y = coordinate[1]
                    arr = []
                    arr.append(x)
                    arr.append(y)
                    coordinates.append(arr)
                    #将坐标存入列表，形成轨迹线
                boundryRoad.append(coordinates)
                
        # 将列表保存为JSON格式的字符串
        json_string = json.dumps(boundryRoad)

        # 打开文件并写入JSON字符串
        with open('./static/data/BoundryRoads/'+'boundry'+str(i)+ ".json", 'w') as f:
            f.write(json_string)       


# 获取两个特殊的人行道，假定行人不闯红灯，判断行人是否横穿马路需要把人行道的情况去掉
def getPolygon():
    for i,filepath in enumerate(file_path, start=1):
        file_path=['./static/data/ChinaVis Data/road10map/crosswalkroad10.geojson']
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        features = data['features']
        polygonRoad = []
        for feature in features:
            #主要是人行道177和178
            if feature['properties']['fid']==177 or feature['properties']['fid']==178:
                geometry = feature['geometry']
                coordinates = []
                for coordinate in geometry['coordinates']:
                    for item in coordinate:
                        x = item[0]
                        y = item[1]
                        arr = []
                        arr.append(x)
                        arr.append(y)
                        coordinates.append(arr)
                    polygonRoad.append(coordinates)
                
        # 将列表保存为JSON格式的字符串
        json_string = json.dumps(polygonRoad)

        # 打开文件并写入JSON字符串
        with open('./static/data/BoundryRoads/crosswalk/'+'poly'+str(i)+ ".json", 'w') as f:
            f.write(json_string) 


# 判断机动车是否与车道边界线存在交点           
def car_cross():
    
    car_cross_data=[]
    #获取边界数据，用于画线
    boundry_path = './static/data/BoundryRoads/boundry1.json'
    with open(boundry_path, "r", encoding="utf-8") as f:
        boundryRoad = json.load(f)

    root_folder_path = './static/data/DataProcess'
    # 遍历根文件夹
    for folder_name in os.listdir(root_folder_path):
        folder_path = os.path.join(root_folder_path, folder_name)
        # 判断是否为需要处理的文件夹
        if not os.path.isdir(folder_path) or folder_name not in ['1', '4', '6']:#机动车才被检测
            continue
        # 获取文件夹中的所有文件
        file_list = os.listdir(folder_path)
        # 遍历文件列表，筛选出JSON文件并读取
        for file_name in file_list:
            file_path = os.path.join(folder_path, file_name)
            track = []
            count=0
            with open(file_path, 'r') as f:
                data = json.load(f)
            #获取车辆轨迹
            for item in data:
                pos = json.loads(item['position'])
                arr = []
                arr.append(pos['x'])
                arr.append(pos['y'])
                track.append(arr)
            for road in boundryRoad:
                line1_obj = LineString(road)
                line2_obj = LineString(track)
                if line1_obj.intersects(line2_obj):
                    # 两条线存在交点
                    intersection_point = line1_obj.intersection(line2_obj)
                    # 判断交点的类型，并统计数量
                    if intersection_point.geom_type == 'Point':
                        count += 1
                    elif intersection_point.geom_type == 'MultiPoint':
                        count += len(intersection_point.geoms)
            if count>0:        
                car_cross_data.append({
                    'id':data[0]['id'],
                    'type':data[0]['type'],
                    'count':count
                })
    
    car_cross_path = './static/data/DataResult/car_cross.json'
    with open(car_cross_path, 'w') as f:
        json.dump(car_cross_data, f)
        
   
            
# 判断行人是否与边界线存在交点   
def people_cross():
    #获取边界
    file_path1 = './static/data/BoundryRoads/boundry2.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        boundryRoad = json.load(f)
    #获取人行道
    file_path2 = './static/data/BoundryRoads/crosswalk/poly1.json'
    with open(file_path2, "r", encoding="utf-8") as f:
        crosswalkRoad = json.load(f) 
        
    folder_path = './static/data/DataProcess/2'
    # 获取文件夹中的所有文件
    file_list = os.listdir(folder_path)
    # 遍历文件列表，筛选出JSON文件并读取
    people_id=[]
    for file_name in file_list:
        file_path = os.path.join(folder_path, file_name)
        track = []
        with open(file_path, 'r') as f:
            data = json.load(f)
        #获取行人轨迹
        for item in data:
            pos = json.loads(item['position'])
            arr = []
            arr.append(pos['x'])
            arr.append(pos['y'])
            track.append(arr)
        # 定义一个Polygon
        polygon1 = Polygon(crosswalkRoad[0])
        polygon2 = Polygon(crosswalkRoad[1])
        line2_obj = LineString(track)
        #判断交点
        if not line2_obj.intersects(polygon1) and not line2_obj.intersects(polygon2):        
            for road in boundryRoad:
                line1_obj = LineString(road)
                if line1_obj.intersects(line2_obj):
                    #如果存在交点，则保存行人id
                    people_id.append(data[0]['id'])
                    break  
                
    people_cross_path = './static/data/DataResult/people_cross.json'
    with open(people_cross_path, 'w') as f:
        json.dump(people_id, f) 
        
# 判断非机动车是否与边界线存在交点
def nomotor_cross():
    #获取边界
    file_path1 = './static/data/BoundryRoads/boundry3.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        boundryRoad = json.load(f)
    #获取人行道
    file_path2 = './static/data/BoundryRoads/crosswalk/poly1.json'
    with open(file_path2, "r", encoding="utf-8") as f:
        crosswalkRoad = json.load(f) 
        
    folder_path = './static/data/DataProcess/3'
    # 获取文件夹中的所有文件
    file_list = os.listdir(folder_path)
    # 遍历文件列表，筛选出JSON文件并读取
    nomotor_id=[]
    for file_name in file_list:
        file_path = os.path.join(folder_path, file_name)
        track = []
        with open(file_path, 'r') as f:
            data = json.load(f)
        #获取行人轨迹
        for item in data:
            pos = json.loads(item['position'])
            arr = []
            arr.append(pos['x'])
            arr.append(pos['y'])
            track.append(arr)
        # 定义一个Polygon
        polygon1 = Polygon(crosswalkRoad[0])
        polygon2 = Polygon(crosswalkRoad[1])
        line2_obj = LineString(track)
        #判断交点
        if not line2_obj.intersects(polygon1) and not line2_obj.intersects(polygon2):        
            for road in boundryRoad:
                line1_obj = LineString(road)
                if line1_obj.intersects(line2_obj):
                    #如果存在交点，则保存非机动车id
                    nomotor_id.append(data[0]['id'])
                    break  
                
    nomotor_cross_path = './static/data/DataResult/nomotor_cross.json'
    with open(nomotor_cross_path, 'w') as f:
        json.dump(nomotor_id, f)


       
'''
反推红绿灯时间：
1. 获取所有道路的方向、停止线所在经纬度
2. 判断车辆所在道路，以及车速
3. 判断距离停止线最近的车辆是否在减速/停止前进
4. 如果车辆停在停止线前表明当前为红灯
'''
if __name__ == '__main__':
  dataType()


