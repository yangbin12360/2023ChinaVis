import json
import os
import operator
from shapely.geometry import LineString, MultiLineString, Point, Polygon
import random
from shapely.ops import linemerge
from shapely.ops import polygonize
from alive_progress import alive_bar
import time
import numpy as np
import math
import csv
import pandas as pd
from sklearn.cluster import DBSCAN
from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler
from sklearn.impute import SimpleImputer
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt


def check_contraflow(road_file, road_direction): # 检查逆行行为
    north_THRESHOLD = [1.0, 1.2]
    south_THRESHOLD = [-1.97, -1.95]
    east_THRESHOLD = [-0.6,-0.5]
    west_THRESHOLD = [2.5,2.6]
    reverse=[]
    if road_direction == 'north':
        threshold = south_THRESHOLD
    elif road_direction == 'south':
        threshold = north_THRESHOLD
    elif road_direction == 'east':
        threshold = west_THRESHOLD
    elif road_direction == 'west':
        threshold = east_THRESHOLD
    else:
        return

    with open(road_file, 'r') as f:
        data = json.load(f)

    for timestamp, vehicles in data.items():
        for vehicle in vehicles:
            heading = vehicle['heading']
            if threshold[0] <= heading <= threshold[1]:
                print("逆行行为：", vehicle['id'], "时间：", timestamp)
                reverse.append(vehicle)
    nomotor_cross_path = os.path.join(f'{road_file}.json')
    with open(nomotor_cross_path, 'w') as f:
        json.dump(reverse, f)

def reverse_new(): #判断每条车道的朝向，并提取逆行行为
    west_road=['part1442','part1443','part1444','part1445','part1910_1','part1910_2','part1911','part1912','part1934']
    east_road=['part1446','part1447','part1448','part1449','part1450','part1898_1','part1898_2','part1900','part1901']
    north_road=['part1436_3','part1972','part1973','part1974','part3487','part1957_3','part1957_4']
    south_road=['part1935','part1436_4','part1955','part1956','part1975_1','part1975_2','part1977','part1978']
    # 遍历文件夹中的JSON文件
    folder_path = 'back\static\data\DataProcess\\roadData'  # 文件夹路径
    json_files = [f for f in os.listdir(folder_path) if f.endswith('.json')]
    for json_file in json_files:
        road_direction = None
        if any(json_file.startswith(rd) for rd in west_road):
            road_direction = 'west'
        elif any(json_file.startswith(rd) for rd in east_road):
            road_direction = 'east'
        elif any(json_file.startswith(rd) for rd in north_road):
            road_direction = 'north'
        elif any(json_file.startswith(rd) for rd in south_road):
            road_direction = 'south'
        if road_direction:
            road_file = os.path.join(folder_path, json_file)
            check_contraflow(road_file, road_direction)

def calculate_average_speed(json_file):#每个车道按时间排序的平均速度
    with open(json_file, 'r') as f:
        data = json.load(f)

    speeds = []
    sorted_data = sorted(data.items(), key=lambda x: datetime.strptime(x[0], "%Y-%m-%d %H:%M:%S"))
    for timestamp, vehicles in sorted_data:
        average_speed = sum(vehicle["velocity"] for vehicle in vehicles) / len(vehicles)
        speeds.append((timestamp, average_speed))

    return speeds

def find_traffic_congestion(speeds, lane_name):#找出当前车道的拥堵数据
    congested_periods = []
    start_time = None

    for timestamp, speed in speeds:
        current_time = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")

        if speed < 1.39:
            if start_time is None:
                start_time = current_time
        else:
            if start_time is not None:
                end_time = current_time
                duration = end_time - start_time

                if duration >= timedelta(minutes=10):
                    congested_periods.append((lane_name, start_time, end_time))

                start_time = None

    return congested_periods
def congestion_process(): #拥堵处理函数
    folder_path = 'back\static\data\DataProcess\\roadData'  # Replace with the actual folder path
    output_file = 'congested_periods.json'  # Replace with the desired output file path
    congested_periods = []

    # Iterate over files in the folder
    for filename in os.listdir(folder_path):
        if filename.endswith(".json"):
            file_path = os.path.join(folder_path, filename)
            lane_name = os.path.splitext(filename)[0]  # Extract lane name from the file name
            speeds = calculate_average_speed(file_path)
            congested_periods.extend(find_traffic_congestion(speeds, lane_name))

    # Write congested periods to JSON file
    with open(output_file, 'w') as f:
        json.dump(congested_periods, f, default=str, indent=4)

    print("Congested periods saved to:", output_file)

# 对数据按照类型和id进行分组


def dataType():
    allData = {}
    # 获取所有数据文件夹
    for i in range(10):
        # 创建文件夹./static/data/ChinaVis Data文件夹，里面放入ChinaVis数据和./static/data/DataProcess/文件夹
        f = open("./static/data/ChinaVis Data/part-0000" + str(i) +
                 "-905505be-27fc-4ec6-9fb3-3c3a9eee30c4-c000.json", "r", encoding="utf-8")
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
        f = open("./static/data/DataProcess/" +
                 nowType + "/" + str(i) + ".json", "w")
        f.write(json.dumps(allData[i]))


# 按时间戳顺序对每辆车的轨迹数据进行排序
def dataTypebytime_meas():
    allData = {}
    # 获取所有数据文件夹
    for i in range(10):
        # 创建文件夹./static/data/ChinaVis Data文件夹，里面放入ChinaVis数据和./static/data/DataProcess/文件夹
        f = open("./static/data/ChinaVis Data/part-0000" + str(i) +
                 "-905505be-27fc-4ec6-9fb3-3c3a9eee30c4-c000.json", "r", encoding="utf-8")
        data = f.read().split("\n")
        # 按照id将数据分组
        for j in data:
            try:
                nowData = json.loads(j)
                nowTime = float(nowData["time_meas"]) / 1000000
                nowTime = time.localtime(nowTime)
                nowTime = time.strftime("%Y-%m-%d %H:%M:%S", nowTime)
                if(nowTime not in allData):
                    allData[nowTime] = []
                allData[nowTime].append(nowData)
            except:
                print(j)

    # 按照数据的类型进行分组保存
    for i in allData:
        data = time.mktime(time.strptime(i, "%Y-%m-%d %H:%M:%S"))
        if(not os.path.exists("./static/data/DataProcess/time_meas")):
            os.makedirs("./static/data/DataProcess/time_meas")
        f = open("./static/data/DataProcess/time_meas/" +
                 str(data) + ".json", "w")
        f.write(json.dumps(allData[i]))


# def sortItem():
#     # 获取文件夹下的所有子文件夹
#     subfolders = [f.path for f in os.scandir(
#         './static/data/DataProcess') if f.is_dir()]

#     # 遍历所有子文件夹，读取子文件夹中的文件
#     for subfolder in subfolders:
#         # 遍历子文件夹中的所有文件
#         for filename in os.listdir(subfolder):
#             filepath = os.path.join(subfolder, filename)
#             # 处理文件
#             with open(filepath, 'r') as f:
#                 data = json.load(f)
#                 # 处理数据，进行排序
#                 data_sorted = sorted(
#                     data, key=operator.itemgetter('time_meas'))
#                 # 将修改后的数据写入到原文件
#                 with open(filepath, 'w') as f:
#                     json.dump(data_sorted, f)

# 提取机动车超速情况
def Overspeeding():
    # 提取机动车超速情况，存到./static/data/DataProcess/overSpeeding.json文件中
    # 设置文件夹路径
    speed_THRESHOLD = 16.7 # 设置速度阈值为60km/h 所有车道限速都是60km/h
    root_folder_path = 'back/static/data/DataProcess'
    overSpeeding_path = 'back/static/data/DataProcess/overSpeeding.json'
    overSpeeding_data = []
    # 遍历根文件夹
    for folder_name in os.listdir(root_folder_path):
        folder_path = os.path.join(root_folder_path, folder_name)
        # 判断是否为需要处理的文件夹
        # 机动车才被检测
        if not os.path.isdir(folder_path) or folder_name not in ['1', '4', '6']:
            continue
        for file_name in os.listdir(folder_path):
            file_path = os.path.join(folder_path, file_name)
            with open(file_path, 'r') as f:
                data = json.load(f)
            if(len(data) < 5):  # 文件中低于5帧的数据不处理
                continue
            data = sorted(data, key=lambda x: x['time_meas'])#按照时间排列数据
            velo_list=[]
            for item in data:
                velo_list.append(item['velocity'])
            Overspeeding = []
            start = end = 0  # 超速起始帧和终止帧
            for i in range(5, len(data), 5):  # 每隔 5 帧（1s）判断一次速度
                if velo_list[i] > speed_THRESHOLD and velo_list[i-5] <= speed_THRESHOLD:
                    start = end = i
                elif velo_list[i] > speed_THRESHOLD and velo_list[i-5] > speed_THRESHOLD:
                    end += 1
                elif velo_list[i] <= speed_THRESHOLD and velo_list[i-5] > speed_THRESHOLD and i != 5:
                    Overspeeding.append([start, end])
            if len(Overspeeding) > 0:
                for i in range(len(Overspeeding)):  # 将急加速数据存入SpeedUp_data列表中
                    overSpeeding_data.append({
                        'type': data[Overspeeding[i][0]]['type'],
                        'id': data[Overspeeding[i][0]]['id'],
                        'start_time': data[Overspeeding[i][0]]['time_meas'],
                        'end_time': data[Overspeeding[i][1]]['time_meas'],
                        'mean_velo': (data[Overspeeding[i][0]]['velocity']+data[Overspeeding[i][1]]['velocity'])/2,
                    })
        print(folder_path+"done!")
    with open(overSpeeding_path, 'w') as f:
        json.dump(overSpeeding_data, f)
    print("Done!")

# 提取机动车急加急减情况


def speedUpDown():
    # 提取机动车急加急加情况，存到./static/data/DataProcess/speedUp.json和speedDown.json文件中
    # 设置文件夹路径
    speedUp_THRESHOLD = 2.78  # 设置加速度阈值为 2.78 m/s^2
    speedDown_THRESHOLD = -2.78
    time_THRESHOLD = 2  # 异常持续时间阈值
    root_folder_path = 'back/static/data/DataProcess'
    SpeedUp_path = 'back/static/data/DataProcess/speedUp.json'
    SpeedDown_path = 'back/static/data/DataProcess/speedDown.json'
    SpeedUp_data = []  # 急加速数据
    SpeedDown_data = []  # 急减速数据
    # 遍历根文件夹
    for folder_name in os.listdir(root_folder_path):
        folder_path = os.path.join(root_folder_path, folder_name)
        # 判断是否为需要处理的文件夹
        # 机动车才被检测
        if not os.path.isdir(folder_path) or folder_name not in ['1', '4', '6']:
            continue
        for file_name in os.listdir(folder_path):
            file_path = os.path.join(folder_path, file_name)
            with open(file_path, 'r') as f:
                data = json.load(f)
            if(len(data) < 5):  # 文件中低于5帧的数据不处理
                continue
            data = sorted(data, key=lambda x: x['time_meas'])  # 按照时间排列数据
            accel_list = []  # 加速度列表
            for i in range(0, len(data), 5):  # 每隔 5 帧（1s）计算一次加速度
                curr_speed = data[i]['velocity']
                prev_speed = data[i-5]['velocity']
                if i == 0:
                    accel_list.append(0)
                else:
                    accel_list.append((curr_speed - prev_speed) / 1)
            startUp = endUp = 0  # 急加速起始帧和终止帧
            startDown = endDown = 0  # 急减速起始帧和终止帧
            speedUp_list = []  # 急加速列表
            speedDown_list = []  # 急减速列表
            # 遍历加速度列表,找出急加速的起始帧和终止帧
            for i in range(1, len(accel_list)-1):
                if accel_list[i] >= speedUp_THRESHOLD and accel_list[i-1] >= speedUp_THRESHOLD:
                    endUp += 1
                    len_speedUp += 1
                if accel_list[i] >= speedUp_THRESHOLD and accel_list[i-1] < speedUp_THRESHOLD:
                    startUp = endUp = i
                    len_speedUp = 1
                if accel_list[i] < speedUp_THRESHOLD and accel_list[i-1] >= speedUp_THRESHOLD and len_speedUp >= time_THRESHOLD:
                    speedUp_list.append((startUp, endUp, len_speedUp))
                    # print(f"急加速发生在车辆 {data[0]['id']} 的第 {data[5*startUp]['seq']} 到第 {data[5*endUp]['seq']} 帧，加速度为 {accel_list[i-1]} m/s^2")
                if accel_list[i] <= speedDown_THRESHOLD and accel_list[i-1] <= speedDown_THRESHOLD:
                    endDown += 1
                    len_speedDown += 1
                if accel_list[i] <= speedDown_THRESHOLD and accel_list[i-1] > speedDown_THRESHOLD:
                    startDown = endDown = i
                    len_speedDown = 1
                if accel_list[i] > speedDown_THRESHOLD and accel_list[i-1] <= speedDown_THRESHOLD and len_speedDown >= time_THRESHOLD:
                    speedDown_list.append((startDown, endDown, len_speedDown))
                    # print(f"急减速发生在车辆 {data[0]['id']} 的第 {data[5*startDown]['seq']} 到第 {data[5*endDown]['seq']} 帧，加速度为 {accel_list[i-1]} m/s^2")
            if len(speedUp_list) > 0:
                for i in range(len(speedUp_list)):  # 将急加速数据存入SpeedUp_data列表中
                    SpeedUp_data.append({
                        'type': data[0]['type'],
                        'id': data[0]['id'],
                        'speedUp_time': speedUp_list[i][2],
                        'start_time': data[5*speedUp_list[i][0]]['time_meas'],
                        'start_seq': data[5*speedUp_list[i][0]]['seq'],
                        'start_position': data[5*speedUp_list[i][0]]['position'],
                        'end_position': data[5*speedUp_list[i][1]]['position'],
                        'start_velocity': data[5*speedUp_list[i][0]]['velocity'],
                        'end_velocity': data[5*speedUp_list[i][1]]['velocity']
                    })
            if len(speedDown_list) > 0:  # 将急减速数据存入SpeedDown_data列表中
                for i in range(len(speedDown_list)):
                    SpeedDown_data.append({
                        'type': data[0]['type'],
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


# 将所有机动车数据按照朝向进行分类--拥堵需要分辨不同的朝向（需先在DataProcess文件夹下新建文件夹HeadingData）
def heading_type():
    # 朝向阈值
    north_THRESHOLD = [-2.3562, -0.7854]
    south_THRESHOLD = [0.7854, 2.3562]
    east_THRESHOLD = [[-0.3927, 0.3927], [-2.7489, -1.9635]]
    west_THRESHOLD = [[2.7489, 3.5343], [-0.3927, 0.3927]]
    # 遍历所有JSON文件
    north_data = []
    south_data = []
    east_data = []
    west_data = []
    num = 0
    for folder in ["back\static\data\DataProcess/1", "back\static\data\DataProcess/4", "back\static\data\DataProcess/6"]:
        json_data = []
        file_names = os.listdir(folder)
        if num == 0:
            random.shuffle(file_names)  # 打乱文件名顺序
            for i in range(len(file_names)//4):  # 对于car而言，只随机选取1/4的文件
                with open(os.path.join(folder, file_names[i])) as f:
                    json_data.extend(json.load(f))
            num += 1
        else:
            for file_name in os.listdir(folder):
                with open(os.path.join(folder, file_name)) as f:
                    json_data.extend(json.load(f))
        json_data = sorted(
            json_data, key=operator.itemgetter('seq'))  # 所有数据按照序列号排序
        # 遍历数据，将数据根据朝向分类，并存储到相应的列表中
        for d in json_data:
            heading = d['heading']
            if north_THRESHOLD[0] <= heading <= north_THRESHOLD[1]:
                north_data.append(d)
            elif south_THRESHOLD[0] <= heading <= south_THRESHOLD[1]:
                south_data.append(d)
            elif any([r[0] <= heading <= r[1] for r in east_THRESHOLD]):
                east_data.append(d)
            elif any([r[0] <= heading <= r[1] for r in west_THRESHOLD]):
                west_data.append(d)
    # 将分类后的数据分别存储到四个JSON文件中
    with open("back\static\data\DataProcess/HeadingData/north_data.json", "w") as f:
        json.dump(north_data, f)
    with open("back\static\data\DataProcess/HeadingData/south_data.json", "w") as f:
        json.dump(south_data, f)
    with open("back\static\data\DataProcess/HeadingData/east_data.json", "w") as f:
        json.dump(east_data, f)
    with open("back\static\data\DataProcess/HeadingData/west_data.json", "w") as f:
        json.dump(west_data, f)


# 提取拥堵数据到DataProcess/congestion.json中（需先运行heading_type函数）
def congestion():# 提取拥堵数据
    time_THRESHOLD = 600# 时间阈值 10min
    speed_THRESHOLD = 1.39 # 速度阈值 5km/h
    Congestion_path = 'back/static/data/DataProcess/congestion.json' # 拥堵数据存储路径
    folder = 'D:/2023ChinaVis/back\static\data\DataProcess\HeadingData'
    Congestion_data = []
    for filename in os.listdir('D:/2023ChinaVis/back\static\data\DataProcess\HeadingData'):
        with open(os.path.join(folder, filename)) as f:
            data = json.load(f)
        seq_list = []  # 存储序列号
        aveSpeed_data = []  # 存储每s的速度列表.1表示平均速度小于5km/h,0表示平均速度大于5km/h
        data = sorted(data, key=operator.itemgetter('seq'))  # 所有数据按照序列号排序
        for d in data:
            if d["seq"] not in seq_list:
                seq_list.append(d['seq'])
        # 遍历所有序列号,每帧车辆平均速度小于5km/h的数据为拥堵数据
        for i in range(0, len(seq_list), 5):
            seq = seq_list[i]
            seq_data = [d for d in data if d['seq'] == seq]
            speed_list = [d['velocity'] for d in seq_data]
            if sum(speed_list) / len(speed_list) <= speed_THRESHOLD:
                aveSpeed_data.append(1)
            else:
                aveSpeed_data.append(0)
        start_time = end_time = 0
        len_time = 0
        Congestion_list = []  # 存储拥堵数据的起始时间和结束时间
        for i in range(1, len(aveSpeed_data)):
            if aveSpeed_data[i] == 1 and aveSpeed_data[i-1] == 0:
                start_time = end_time = i
                len_time = 1
            if aveSpeed_data[i] == 1 and aveSpeed_data[i-1] == 1:
                end_time += 1
                len_time += 1
            if aveSpeed_data[i] == 0 and aveSpeed_data[i-1] == 1 and len_time >= time_THRESHOLD:
                Congestion_list.append((start_time, end_time))
        for c in Congestion_list:  # 将拥堵情况写入文件
            start_seq = seq_list[c[0]]
            end_seq = seq_list[c[1]]
            seq_data = [d for d in data if d["seq"]
                        == start_seq or d["seq"] == end_seq]
           # 初始化x和y的最大最小值
            x_min = float("inf")
            x_max = float("-inf")
            y_min = float("inf")
            y_max = float("-inf")
            z_min = float("inf")
            z_max = float("-inf")
           # 找出拥堵地段的范围
            for d in seq_data:
                pos = json.loads(d["position"])
                x = pos["x"]
                y = pos["y"]
                z = pos["z"]
                if x < x_min:
                    x_min = x
                if x > x_max:
                    x_max = x
                if y < y_min:
                    y_min = y
                if y > y_max:
                    y_max = y
                if z < z_min:
                    z_min = z
                if z > z_max:
                    z_max = z
            Congestion_data.append({
                'start_time': seq_data[0]['time_meas'],
                'end_time': seq_data[-1]['time_meas'],
                'start_seq': seq_data[0]['seq'],
                'end_seq': seq_data[-1]['seq'],
                'leftDown': {'x': x_min, 'y': y_min, 'z': z_min},
                'rightUp': {'x': x_max, 'y': y_max, 'z': z_max},
                'ave_heading': seq_data[0]['heading'],
            })
        print(filename+'拥堵数据提取完成')
    with open(Congestion_path, 'a') as f:
        json.dump(Congestion_data, f)
    print("Done!")


# 提取机动车逆行情况，存到./static/data/DataProcess/reverse.json文件中---朝向可能还需要再讨论
def reverse():
    # 设置文件夹路径
    # 设置朝向阈值
    threshold = 3.14 #方向相反
    root_folder_path = 'back/static/data/DataProcess'
    file_path1 = 'back/static/data/BoundryRoads/polygons_people.json'  #存着所有机动车道的坐标
    reverse_path ='back/static/data/DataResult/reverse.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        car_polygons = json.load(f)
    # 遍历根文件夹
    # 将所有机动车道按照车道编号分组
    reverse_data = []
    car_lane_dict = {}
    for i in range(len(car_polygons)):
        car_lane_dict[i] = []
    for folder_name in os.listdir(root_folder_path):
        folder_path = os.path.join(root_folder_path, folder_name)
        # 判断是否为需要处理的文件夹
        # 机动车才被检测
        if not os.path.isdir(folder_path) or folder_name not in ['1', '4', '6']:
            continue
        print(folder_path)
        reverse = []  # 存储逆行车辆数据
        for file_name in os.listdir(folder_path):  # 对于所有json文件，遍历
            file_path = os.path.join(folder_path, file_name)
            with open(file_path, 'r') as f:
                data = json.load(f)
            data=sorted(data, key=operator.itemgetter('time_meas'))#所有数据按照序列号排序
            line_car=[]#存储当前车出现在过哪条车道-辅助判断逆行-不用于存储数据
            for i in range(0,len(data),8):# 遍历每s的数据，找出车出现在过哪些车道，并将车辆数据存储到相应的机动车道中
                pos = json.loads(data[i]['position'])
                point1 = Point(pos['x'], pos['y'])
                for j in range(len(car_polygons)):
                    polygon = car_polygons[j]
                    if Polygon(polygon).contains(point1) and j not in line_car:  # 判断该车在哪条机动车道内
                        line_car.append(j)
                        car_lane_dict[j].append([data[i]['type'],data[i]['id'],data[i]['heading'],data[i]['time_meas']])                        
    for i in range(8):#对每个车道的车辆数据进行处理
        if len(car_lane_dict[i])>0:
            third_nums = np.array(car_lane_dict[i])[:, 2]  # 提取每个数字的第三个数
            avg_third_num = np.mean(third_nums)  # 计算平均值
            for car in car_lane_dict[i]:
                if abs(car[2] - avg_third_num) > threshold:  #
                    reverse.append(car)
    if len(reverse) > 0:
        for i in range(len(reverse)):  # 将急加速数据存入SpeedUp_data列表中
            reverse_data.append({
                        'type':reverse[i][0],
                        'id': reverse[i][1],
                        'heading': reverse[i][2],
                        'time': reverse[i][3]
                    })
    with open(reverse_path, 'w') as f:
        json.dump(reverse_data, f)
    print("Done!")


# 过滤掉车辆的轨迹数据中不合理的数据，比如只有一个坐标点，无法画成线
def filterItem():
    # 获取文件夹下的所有子文件夹
    subfolders = [f.path for f in os.scandir(
        './static/data/DataProcess') if f.is_dir()]

    # 遍历所有子文件夹，读取子文件夹中的文件
    for subfolder in subfolders:
        # 遍历子文件夹中的所有文件
        for filename in os.listdir(subfolder):
            filepath = os.path.join(subfolder, filename)
            # 处理文件
            f = open(filepath, 'r')
            data = json.load(f)
            if len(data) < 2:
                f.close()
                os.remove(filepath)
            # with open(filepath, 'r') as f:
            #     data = json.load(f)
            #     # 处理数据
            #     if len(data) <3:

            #         os.remove(filepath)


# 获取用于判断车辆切入切出的边界轨迹线的数据（已做过处理，不是原始数据）
def get_car_Boundry():
    file_path = './static/data/ChinaVis Data/road10map/boundaryroad_car.geojson'
    # 遍历边界geojson数据，找出坐标
    with open(file_path, "r", encoding="utf-8") as f:
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
                # 将坐标存入列表，形成轨迹线
            boundryRoad.append(coordinates)

    # 将列表保存为JSON格式的字符串
    json_string = json.dumps(boundryRoad)

    # 打开文件并写入JSON字符串
    with open('./static/data/BoundryRoads/'+'boundry1' + ".json", 'w') as f:
        f.write(json_string)


# 获取人行道，假定行人不闯红灯，判断行人是否横穿马路需要把人行道的情况去掉
def getCrossWalk():
    file_path = './static/data/ChinaVis Data/road10map/crosswalkroad10.geojson'
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    features = data['features']
    walkRoad = []
    for feature in features:
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
            walkRoad.append(coordinates)

    # 将列表保存为JSON格式的字符串
    json_string = json.dumps(walkRoad)

    # 打开文件并写入JSON字符串
    with open("./static/data/BoundryRoads/crosswalkroad.json", 'w') as f:
        f.write(json_string)


# 将总共8条道路模拟成多边形,一个接一个构造
def get_people_Boundry():
    all_polygons = []
    file_path = './static/data/ChinaVis Data/road10map/boundaryroad_people1.geojson'
    # 遍历边界geojson数据，找出坐标
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    features = data['features']
    boundryRoad = []
    for feature in features:
        geometry = feature['geometry']
        fid = feature['properties']['fid']
        if geometry['type'] == 'LineString':
            coordinates = []
            for coordinate in geometry['coordinates']:
                x = coordinate[0]
                y = coordinate[1]
                arr = []
                arr.append(x)
                arr.append(y)
                coordinates.append(arr)
                # 将坐标存入列表，形成轨迹线
            boundryRoad.append({
                'fid': fid,
                'coordinates': coordinates
            })

    # 第一个多边形
    polygons = []
    for boundry in boundryRoad:
        if boundry['fid'] in [2098, 2562, 2566, 2572, 2577, 70802]:
            line = LineString(boundry['coordinates'])
            polygons.append(line)
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)
    # 将相交的线段合并成一条更长的线段
    merged_line1 = linemerge(multi_line)

    polygons = []
    for boundry in boundryRoad:
        if boundry['fid'] in [70806, 2573, 2567, 2563, 2559, 2095]:
            line = LineString(boundry['coordinates'])
            polygons.append(line)
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)
    # 将相交的线段合并成一条更长的线段
    merged_line2 = linemerge(multi_line)

    # 新增两条线用来闭合多边形
    new_line1 = LineString(
        [(-135.6064395043, -350.8889079756), (-147.8130268923, -346.1381993103)])
    new_line2 = LineString(
        [(-49.7000147442, -139.1845326048), (-58.8520435676, -134.8349823785,)])
    # 将两条线段组合成一个多边形
    polygon = polygonize([merged_line1, merged_line2, new_line1, new_line2])
    # 保存多边形坐标列表
    all_polygons.append([list(coord) for coord in polygon[0].exterior.coords])
    # print([list(coord) for coord in polygon[0].exterior.coords])
    # print(all_polygons)

    # 第二个多边形
    polygons = []
    for boundry in boundryRoad:
        if boundry['fid'] in [2090, 2085, 2079, 2074, 2070, 2066, 70808]:
            line = LineString(boundry['coordinates'])
            polygons.append(line)
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)
    # 将相交的线段合并成一条更长的线段
    merged_line1 = linemerge(multi_line)

    polygons = []
    for boundry in boundryRoad:
        if boundry['fid'] in [70810, 2069, 2073, 2077, 2084, 2089, 2094]:
            line = LineString(boundry['coordinates'])
            polygons.append(line)
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)
    # 将相交的线段合并成一条更长的线段
    merged_line2 = linemerge(multi_line)

    new_line1 = LineString(
        [(-46.3328911412, -142.5103418792), (-35.1385160718, -149.8620882007)])
    new_line2 = LineString(
        [(-130.9738969629, -351.1326432496), (-121.7188209441, -355.3959214054)])
    # 将两条线段组合成一个多边形
    polygon = polygonize([merged_line1, merged_line2, new_line1, new_line2])

    # 保存多边形坐标列表
    all_polygons.append([list(coord) for coord in polygon[0].exterior.coords])
    # print([list(coord) for coord in polygon[0].exterior.coords])

    # 第三个多边形
    polygons = []
    for boundry in boundryRoad:
        if boundry['fid'] in [2597, 2603, 2608, 70799]:
            line = LineString(boundry['coordinates'])
            polygons.append(line)
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)
    # 将相交的线段合并成一条更长的线段
    merged_line1 = linemerge(multi_line)

    polygons = []
    for boundry in boundryRoad:
        if boundry['fid'] in [2594, 2598, 2604, 70796]:
            line = LineString(boundry['coordinates'])
            polygons.append(line)
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)
    # 将相交的线段合并成一条更长的线段
    merged_line2 = linemerge(multi_line)

    new_line1 = LineString(
        [(-59.7112487607, -77.8779703364), (-64.4280725536, -86.8583077487)])
    new_line2 = LineString(
        [(-229.8843439175, 27.4060393564), (-234.2738679262, 15.252095011)])
    # 将两条线段组合成一个多边形
    polygon = polygonize([merged_line1, merged_line2, new_line1, new_line2])

    # 保存多边形坐标列表
    all_polygons.append([list(coord) for coord in polygon[0].exterior.coords])
    # print([list(coord) for coord in polygon[0].exterior.coords])

    # 第四个多边形
    polygons = []
    for boundry in boundryRoad:
        if boundry['fid'] in [2589, 2584, 2578, 70794]:
            line = LineString(boundry['coordinates'])
            polygons.append(line)
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)
    # 将相交的线段合并成一条更长的线段
    merged_line1 = linemerge(multi_line)

    polygons = []
    for boundry in boundryRoad:
        if boundry['fid'] in [70792, 2583, 2588, 2593]:
            line = LineString(boundry['coordinates'])
            polygons.append(line)
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)
    # 将相交的线段合并成一条更长的线段
    merged_line2 = linemerge(multi_line)

    new_line1 = LineString(
        [(-65.7896298383, -90.5211075637), (-71.6224166064, -101.768722395)])
    new_line2 = LineString(
        [(-235.5112315178, 11.3954260819), (-240.5731025918, 2.6856144015)])
    # 将两条线段组合成一个多边形
    polygon = polygonize([merged_line1, merged_line2, new_line1, new_line2])

    # 保存多边形坐标列表
    all_polygons.append([list(coord) for coord in polygon[0].exterior.coords])
    # print([list(coord) for coord in polygon[0].exterior.coords])

    # 第五个多边形
    polygons = []
    for boundry in boundryRoad:
        if boundry['fid'] in [1689, 5246]:
            line = LineString(boundry['coordinates'])
            polygons.append(line)
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)
    # 将相交的线段合并成一条更长的线段
    merged_line1 = linemerge(multi_line)

    polygons = []
    for boundry in boundryRoad:
        if boundry['fid'] in [1685, 5242]:
            line = LineString(boundry['coordinates'])
            polygons.append(line)
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)
    # 将相交的线段合并成一条更长的线段
    merged_line2 = linemerge(multi_line)

    new_line1 = LineString(
        [(-35.929558242, -70.4801425607), (-24.7769278378, -77.8557513969)])
    new_line2 = LineString(
        [(24.3927752072, 29.8864851561), (15.5076317053, 35.6514968701)])
    # 将两条线段组合成一个多边形
    polygon = polygonize([merged_line1, merged_line2, new_line1, new_line2])

    # 保存多边形坐标列表
    all_polygons.append([list(coord) for coord in polygon[0].exterior.coords])
    # print([list(coord) for coord in polygon[0].exterior.coords])

    # 第六个多边形
    polygons = []
    for boundry in boundryRoad:
        if boundry['fid'] in [1681, 1684]:
            line = LineString(boundry['coordinates'])
            polygons.append(line)
    new_line1 = LineString(
        [(-21.4169501531, -80.904564355), (-12.3928360636, -85.6810208172)])
    new_line2 = LineString(
        [(102.8012935529, 132.1931159146), (93.2552832535, 135.872040537)])
    # 将两条线段组合成一个多边形
    polygon = polygonize([polygons[0], polygons[1], new_line1, new_line2])

    # 保存多边形坐标列表
    all_polygons.append([list(coord) for coord in polygon[0].exterior.coords])
    # print([list(coord) for coord in polygon[0].exterior.coords])

    # 第七个多边形
    polygons = []
    for boundry in boundryRoad:
        if boundry['fid'] in [1680, 1675, 1904]:
            line = LineString(boundry['coordinates'])
            polygons.append(line)
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)
    # 将相交的线段合并成一条更长的线段
    merged_line1 = linemerge(multi_line)

    polygons = []
    for boundry in boundryRoad:
        if boundry['fid'] in [1676, 1671, 1900]:
            line = LineString(boundry['coordinates'])
            polygons.append(line)
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)
    # 将相交的线段合并成一条更长的线段
    merged_line2 = linemerge(multi_line)

    new_line1 = LineString(
        [(3.9881766335, -114.784009711), (-1.9936909466, -126.5361033614)])
    new_line2 = LineString(
        [(94.513696073, -189.150043638), (100.7203263401, -177.5976125382)])
    # 将两条线段组合成一个多边形
    polygon = polygonize([merged_line1, merged_line2, new_line1, new_line2])

    # 保存多边形坐标列表
    all_polygons.append([list(coord) for coord in polygon[0].exterior.coords])
    # print([list(coord) for coord in polygon[0].exterior.coords])

    # 第八个多边形
    polygons = []
    for boundry in boundryRoad:
        if boundry['fid'] in [1665, 1894]:
            line = LineString(boundry['coordinates'])
            polygons.append(line)
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)
    # 将相交的线段合并成一条更长的线段
    merged_line1 = linemerge(multi_line)

    polygons = []
    for boundry in boundryRoad:
        if boundry['fid'] in [1670, 1899]:
            line = LineString(boundry['coordinates'])
            polygons.append(line)
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)
    # 将相交的线段合并成一条更长的线段
    merged_line2 = linemerge(multi_line)

    new_line1 = LineString(
        [(-3.7004319466, -130.0160061874), (-11.1173687267, -144.4515544532)])
    new_line2 = LineString(
        [(85.592182908, -207.194765587), (93.247235214, -192.904865557)])
    # 将两条线段组合成一个多边形
    polygon = polygonize([merged_line1, merged_line2, new_line1, new_line2])

    # 保存多边形坐标列表
    all_polygons.append([list(coord) for coord in polygon[0].exterior.coords])
    # print([list(coord) for coord in polygon[0].exterior.coords])

    # 将列表保存为JSON格式的字符串
    json_string = json.dumps(all_polygons)

    # 打开文件并写入JSON字符串
    with open('./static/data/BoundryRoads/'+'polygons_people' + ".json", 'w') as f:
        f.write(json_string)


#判断车辆是否存在切入切出的行为，并记录id和发生时间戳
def car_cross():

    car_cross_data = []
    # 获取边界数据，用于画线
    boundry_path = './static/data/BoundryRoads/boundry1.json'
    with open(boundry_path, "r", encoding="utf-8") as f:
        boundryRoad = json.load(f)
    # 获取多边形坐标数据
    file_path1 = './static/data/BoundryRoads/polygons_people.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        road_polygons = json.load(f)
        
    root_folder_path = './static/data/DataProcess'
    # 遍历根文件夹
    for folder_name in os.listdir(root_folder_path):
        folder_path = os.path.join(root_folder_path, folder_name)
        # 判断是否为需要处理的文件夹
        # 机动车才被检测
        if not os.path.isdir(folder_path) or folder_name not in ['1','4','6']:
            continue
        # 获取文件夹中的所有文件
        file_list = os.listdir(folder_path)
        # 遍历文件列表，筛选出JSON文件并读取
        for file_name in file_list:
            file_path = os.path.join(folder_path, file_name)
            track = [] #车辆轨迹
            temporary_data=[]  #临时数据，用于找时间
            count=0
            closest_points=[] #保存距离交点最近的坐标
            time_data=[]   #保存发生时间
            road_num=[] #保存道路信息
            with open(file_path, 'r') as f:
                data = json.load(f)
            # 获取车辆轨迹
            for item in data:
                pos = json.loads(item['position'])
                arr = []
                arr.append(pos['x'])
                arr.append(pos['y'])
                track.append(arr)
                #保存临时数据
                temporary_data.append({
                    'position':pos,
                    'time_stamp':item['time_meas']
                })
            # if file_name=='175143606.json':
            #     print(track)  
            #     break  
            #针对每条边界判断车辆轨迹是否与之存在交点
            for road in boundryRoad:
                line1_obj = LineString(road)
                line2_obj = LineString(track)
                if line1_obj.intersects(line2_obj):
                    # 两条线存在交点
                    intersection_point = line1_obj.intersection(line2_obj)
                    # 判断交点的类型，并统计数量
                    if intersection_point.geom_type == 'Point':
                        aindex=-1
                        # 判断该交点位于哪条道路之上，获取空间信息
                        for index, polygon in enumerate(road_polygons):
                            if Polygon(polygon).contains(intersection_point) or Polygon(polygon).touches(intersection_point):
                                aindex=index
                                break
                        count += 1
                        if aindex==-1:
                            min_distance = float('inf')
                            closest_polygon = None
                            # 寻找交点距离最近的多边形
                            for index, polygon in enumerate(road_polygons):
                                polygon = Polygon(polygon)
                                distance = intersection_point.distance(polygon)
                                if distance < min_distance:
                                    min_distance = distance
                                    closest_polygon = index
                            road_num.append(closest_polygon) 
                        else:
                            road_num.append(aindex)      
                        # 计算每个点与给定点之间的距离
                        distances = [intersection_point.distance(Point(coord)) for coord in track]
                        # 找到距离最短的点
                        min_dist_index = distances.index(min(distances))
                        closest_point = track[min_dist_index]
                        closest_points.append(closest_point)
                                 
                    elif intersection_point.geom_type == 'MultiPoint':
                        aindex=-1
                        # 判断该交点位于哪条道路之上，获取空间信息
                        for index, polygon in enumerate(road_polygons):
                            if Polygon(polygon).contains(intersection_point.geoms[0]) or Polygon(polygon).touches(intersection_point.geoms[0]):
                                aindex=index
                                break
                        if aindex==-1:
                            min_distance = float('inf')
                            closest_polygon = None
                            # 寻找交点距离最近的多边形
                            for index, polygon in enumerate(road_polygons):
                                polygon = Polygon(polygon)
                                distance = intersection_point.geoms[0].distance(polygon)
                                if distance < min_distance:
                                    min_distance = distance
                                    closest_polygon = index
                            aindex=closest_polygon        
                        count += len(intersection_point.geoms)#计算次数
                        # 遍历所有交点坐标
                        for inter_point in intersection_point.geoms:
                            road_num.append(aindex)
                            # 计算每个点与给定点之间的距离
                            distances = [inter_point.distance(Point(coord)) for coord in track]
                            # 找到距离最短的点
                            min_dist_index = distances.index(min(distances))
                            closest_point = track[min_dist_index]
                            closest_points.append(closest_point)
            #寻找高价值场景发生时间    
            for p in closest_points:
                for d in temporary_data:
                    if p[0]==d['position']['x'] and p[1]==d['position']['y']:
                        time_data.append(d['time_stamp'])
                        break   
            if count>0:        
                car_cross_data.append({
                    'id':data[0]['id'],
                    'type':data[0]['type'],
                    'count':count,
                    'time_arr':time_data,
                    'road':road_num
                })

    car_cross_path = './static/data/DataResult/car_cross.json'
    with open(car_cross_path, 'w') as f:
        json.dump(car_cross_data, f) 


# 判断行人是否与道路多边形是否存在交点，从而判断行人是否存在异常行为，记录行人id和异常时间段
def people_cross():
    # 获取多边形坐标数据
    file_path1 = './static/data/BoundryRoads/polygons_people.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        people_polygons = json.load(f)

    # 获取人行道坐标数据
    file_path2 = './static/data/BoundryRoads/crosswalkroad.json'
    with open(file_path2, "r", encoding="utf-8") as f:
        crosswalkRoad = json.load(f)
    # print(crosswalkRoad)

    people_cross_data = []
    # count=0
    folder_path = './static/data/DataProcess/2'
    # 获取文件夹中的所有文件
    file_list = os.listdir(folder_path)
    # 遍历文件列表，筛选出JSON文件并读取
    for file_name in file_list:
        file_path = os.path.join(folder_path, file_name)
        temporary_data = []  # 临时数据，用于找时间
        track = []  # 保存轨迹坐标
        time_data = []  # 保存异常行为时间段
        # num=0
        with open(file_path, 'r') as f:
            data = json.load(f)
        for item in data:
            pos = json.loads(item['position'])
            arr = []
            arr.append(pos['x'])
            arr.append(pos['y'])
            track.append(arr)  # 获取行人轨迹
            # 保存临时数据
            temporary_data.append({
                'position': pos,
                'time_stamp': item['time_meas']
            })
        # 生成轨迹
        line_obj = LineString(track)

        # 针对十字路口区域构建一个四边形
        # center_polygon = [[-66.64, -116.48], [-23.2, -146.52],
        #                   [-3.16, -103.59], [-46.99, -74.72], [-66.64, -116.48]]
        center_polygon = [[-59.81, -115.76], [-45.13, -80.98],
                    [-8.18, -104.56], [-25.72, -139.92], [-59.81, -115.76]]
        # 对处于十字路口的特殊情况
        if line_obj.intersects(Polygon(center_polygon)):
            # print(file_name+"存在")
            people_cross_data.append({
                'id':data[0]['id'],
                'time_arr':[temporary_data[0]['time_stamp'],temporary_data[-1]['time_stamp']],
                'road':8
                })#针对特殊情况，直接存入起点和终点时间
            continue

        # 排除轨迹经过人行道的行为，假设这些行为都是正常的
        flag = 0
        for walkroad in crosswalkRoad:
            # 定义一个Polygon
            polygon = Polygon(walkroad)
            if line_obj.intersects(polygon):
                flag=1
        
        if flag==1:
            continue        
                    
        for index, polygon in enumerate(people_polygons):
            #如果轨迹完全处于多边形之内，则直接存入起点和终点的数据
            if line_obj.within(Polygon(polygon)):
                time_data.append(data[0]['time_meas'])
                time_data.append(data[len(data)-1]['time_meas'])
                # print(file_name)
                # print(track)
                people_cross_data.append({
                'id':data[0]['id'],
                'time_arr':time_data,
                'road':index
                })
                break
            elif line_obj.intersects(Polygon(polygon)):
                # 轨迹与道路边界存在交点
                intersection_point = line_obj.intersection(
                    Polygon(polygon).boundary)
                # 交点为Point时，先计算交点时间，再判断起点或终点是否处于道路之中
                if intersection_point.geom_type == 'Point':
                    # 计算每个点与交点之间的距离
                    distances = [intersection_point.distance(
                        Point(coord)) for coord in track]
                    # 找到距离最短的点
                    min_dist_index = distances.index(min(distances))
                    closest_point = track[min_dist_index]
                    time1 = 0
                    for d in temporary_data:
                        if closest_point[0] == d['position']['x'] and closest_point[1] == d['position']['y']:
                            time1 = d['time_stamp']
                            break
                    # 判断点是否在多边形内
                    # 构造起点和终点
                    point1 = Point(track[0][0], track[0][1])
                    point2 = Point(track[-1][0], track[-1][1])
                    if Polygon(polygon).contains(point1):
                        # num+=1
                        # time_data.append([temporary_data[0]['time_stamp'],time1])
                        # 选择起点的时间
                        people_cross_data.append({
                        'id':data[0]['id'],
                        'time_arr':[temporary_data[0]['time_stamp'],time1],
                        'road':index
                        })
                        break
                    elif Polygon(polygon).contains(point2):
                        # num+=1
                        # time_data.append([time1,temporary_data[-1]['time_stamp']])
                        # 选择终点的时间
                        people_cross_data.append({
                        'id':data[0]['id'],
                        'time_arr':[time1,temporary_data[-1]['time_stamp']],
                        'road':index
                        })
                        break
                        # 这里直接break结束循环是因为，经过多次观察发现行人轨迹不存在跨越多条道路的情况

                elif intersection_point.geom_type == 'MultiPoint':
                    # 计算交点个数
                    if len(intersection_point.geoms) == 2:
                        # print(len(intersection_point.geoms))
                        # print(file_name,intersection_point)
                        # print(track)
                        closest_points = []
                        # num+=2
                        time1 = 0
                        time2 = 0
                        # 如果存在两个交点，则计算两交点的时间戳
                        for inter_point in intersection_point.geoms:
                            # 计算每个点与给定点之间的距离
                            distances = [inter_point.distance(
                                Point(coord)) for coord in track]
                            # 找到距离最短的点
                            min_dist_index = distances.index(min(distances))
                            closest_point = track[min_dist_index]
                            closest_points.append(closest_point)
                        # 寻找高价值场景发生的时间戳
                        for d in temporary_data:
                            if closest_points[0][0] == d['position']['x'] and closest_points[0][1] == d['position']['y']:
                                time1 = d['time_stamp']
                                break
                        for d in temporary_data:
                            if closest_points[1][0] == d['position']['x'] and closest_points[1][1] == d['position']['y']:
                                time2 = d['time_stamp']
                                break
                        if time1 > time2:
                            # time_data.append([time1,time2])
                            people_cross_data.append({
                            'id':data[0]['id'],
                            'time_arr':[time1,time2],
                            'road':index
                            })
                            break
                        else:
                            # time_data.append([time2,time1])
                            people_cross_data.append({
                            'id':data[0]['id'],
                            'time_arr':[time2,time1],
                            'road':index
                            })
                            break
                            # 这里直接break结束循环是因为，经过多次观察发现行人轨迹不存在跨越多条道路的情况
                    else:
                        # print(file_name)
                        # print(track)
                        people_cross_data.append({
                        'id':data[0]['id'],
                        'time_arr':[temporary_data[0]['time_stamp'],temporary_data[-1]['time_stamp']],
                        'road':index
                        })
                        break
                        # 这里直接break结束循环是因为，经过多次观察发现这里的行人轨迹大多直接处于道路之中

        # if num>0:
        #     # print("存在")
        #     people_cross_data.append({
        #         'id':data[0]['id'],
        #         'count':len(time_data),
        #         'time_arr':time_data
        #     })

    people_cross_path = './static/data/DataResult/people_cross.json'
    with open(people_cross_path, 'w') as f:
        json.dump(people_cross_data, f)

        # print(people_cross_data)
        # count+=1
        # if count>100:
        #     print(people_cross_data)
        #     break
        

# 判断非机动车是否与边界线存在交点，与行人的判断相似
def nomotor_cross():
    # 获取多边形坐标数据
    file_path1 = './static/data/BoundryRoads/polygons_people.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        nomotor_polygons = json.load(f)

    # 获取人行道坐标数据
    file_path2 = './static/data/BoundryRoads/crosswalkroad.json'
    with open(file_path2, "r", encoding="utf-8") as f:
        crosswalkRoad = json.load(f)

    nomotor_cross_data = []
    # count=0
    root_folder_path = './static/data/DataProcess'
    # 遍历根文件夹
    for folder_name in os.listdir(root_folder_path):
        folder_path = os.path.join(root_folder_path, folder_name)
        # 判断是否为需要处理的文件夹
        # 非机动车才被检测
        if not os.path.isdir(folder_path) or folder_name not in ['3', '10']:
            continue
        # 获取文件夹中的所有文件
        file_list = os.listdir(folder_path)
        # 遍历文件列表，筛选出JSON文件并读取
        for file_name in file_list:
            file_path = os.path.join(folder_path, file_name)
            temporary_data = []  # 临时数据，用于找时间
            track = []
            time_data = []
            # num=0
            with open(file_path, 'r') as f:
                data = json.load(f)
            for item in data:
                pos = json.loads(item['position'])
                arr = []
                arr.append(pos['x'])
                arr.append(pos['y'])
                track.append(arr)  # 获取非机动车轨迹
                temporary_data.append({
                    'position': pos,
                    'time_stamp': item['time_meas']
                })
            # 生成轨迹
            line_obj = LineString(track)

            # 排除人行道行为
            flag = 0
            for walkroad in crosswalkRoad:
                # 定义一个Polygon
                apolygon = Polygon(walkroad)
                if line_obj.intersects(apolygon):
                    flag=1
            
            if flag==1:
                continue        
                        
            for index, polygon in enumerate(nomotor_polygons):
                if line_obj.within(Polygon(polygon)):
                    time_data.append(data[0]['time_meas'])
                    time_data.append(data[len(data)-1]['time_meas'])
                    nomotor_cross_data.append({
                    'id':data[0]['id'],
                    'time_arr':time_data,
                    'road':index
                    })
                    break
                elif line_obj.intersects(Polygon(polygon)):
                    # print(file_name)
                    # print(track)
                    # 两者存在交点
                    intersection_point = line_obj.intersection(
                        Polygon(polygon).boundary)
                    if intersection_point.geom_type == 'Point':
                        # 计算每个点与交点之间的距离
                        distances = [intersection_point.distance(
                            Point(coord)) for coord in track]
                        # 找到距离最短的点
                        min_dist_index = distances.index(min(distances))
                        closest_point = track[min_dist_index]
                        time1 = 0
                        for d in temporary_data:
                            if closest_point[0] == d['position']['x'] and closest_point[1] == d['position']['y']:
                                time1 = d['time_stamp']
                                break
                        # 判断点是否在多边形内
                        # 构造起点和终点
                        point1 = Point(track[0][0], track[0][1])
                        point2 = Point(track[-1][0], track[-1][1])
                        if Polygon(polygon).contains(point1):
                            # num+=1
                            # time_data.append([temporary_data[0]['time_stamp'],time1])
                            nomotor_cross_data.append({
                            'id':data[0]['id'],
                            'time_arr':[temporary_data[0]['time_stamp'],time1],
                            'road':index
                            })
                            break
                        elif Polygon(polygon).contains(point2):
                            # num+=1
                            # time_data.append([time1,temporary_data[-1]['time_stamp']])
                            nomotor_cross_data.append({
                            'id':data[0]['id'],
                            'time_arr':[time1,temporary_data[-1]['time_stamp']],
                            'road':index
                            })
                            break

                    elif intersection_point.geom_type == 'MultiPoint':
                        # 计算次数
                        if len(intersection_point.geoms) == 2:
                            # print(file_name)
                            # print(len(intersection_point.geoms))
                            # print(track)
                            closest_points = []
                            time1 = 0
                            time2 = 0
                            # num+=2
                            for inter_point in intersection_point.geoms:
                                # 计算每个点与给定点之间的距离
                                distances = [inter_point.distance(
                                    Point(coord)) for coord in track]
                                # 找到距离最短的点
                                min_dist_index = distances.index(
                                    min(distances))
                                closest_point = track[min_dist_index]
                                closest_points.append(closest_point)
                            # 寻找高价值场景发生时间
                            for d in temporary_data:
                                if closest_points[0][0] == d['position']['x'] and closest_points[0][1] == d['position']['y']:
                                    time1 = d['time_stamp']
                                    break
                            for d in temporary_data:
                                if closest_points[1][0] == d['position']['x'] and closest_points[1][1] == d['position']['y']:
                                    time2 = d['time_stamp']
                                    break
                            if time1 > time2:
                                # time_data.append([time1,time2])
                                nomotor_cross_data.append({
                                'id':data[0]['id'],
                                'time_arr':[time1,time2],
                                'road':index
                                })
                                break
                            else:
                                # time_data.append([time2,time1])
                                nomotor_cross_data.append({
                                'id':data[0]['id'],
                                'time_arr':[time2,time1],
                                'road':index
                                })
                                break
                        else:
                            # print(file_name)
                            # print(track)
                            nomotor_cross_data.append({
                            'id':data[0]['id'],
                            'time_arr':[temporary_data[0]['time_stamp'],temporary_data[-1]['time_stamp']],
                            'road':index
                            })
                            break

            # if num>0:
            #     # print("存在")
            #     nomotor_cross_data.append({
            #         'id':data[0]['id'],
            #         'count':len(time_data),
            #         'time_arr':time_data
            #     })

    nomotor_cross_path = './static/data/DataResult/nomotor_cross.json'
    with open(nomotor_cross_path, 'w') as f:
        json.dump(nomotor_cross_data, f)

        # count+=1
        # if count>400:
        #     # print(nomotor_cross_data)
        #     break

 # 判断车辆是否存在长时间停车状态，阈值是5分钟


#判断车辆是否存在长时间停车状态，阈值是5分钟
def is_moving():
    # 获取多边形坐标数据
    file_path1 = './static/data/BoundryRoads/polygons_people.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        car_polygons = json.load(f)

    long_time_data = []

    root_folder_path = './static/data/DataProcess'
    # 遍历根文件夹
    for folder_name in os.listdir(root_folder_path):
        folder_path = os.path.join(root_folder_path, folder_name)
        # 判断是否为需要处理的文件夹
        # 机动车才被检测
        if not os.path.isdir(folder_path) or folder_name not in ['1', '4', '6']:
            continue
        # 获取文件夹中的所有文件
        file_list = os.listdir(folder_path)
        # 遍历文件列表，筛选出JSON文件并读取
        for file_name in file_list:
            file_path = os.path.join(folder_path, file_name)
            with open(file_path, 'r') as f:
                data = json.load(f)
            i=0
            time_data=[]
            road_num=[]
            while i<len(data):
                if data[i]['is_moving']==0:
                    left=i
                    for j in range(left, len(data)):
                        i+=1
                        if data[j]['is_moving']==1 or j==len(data)-1:
                            interval_time=(data[j-1]['time_meas']-data[left]['time_meas'])/60000000
                            if interval_time>5:
                                pos = json.loads(data[left]['position'])
                                point1 = Point(pos['x'], pos['y'])
                                for index,polygon in enumerate(car_polygons):
                                    if Polygon(polygon).contains(point1) or Polygon(polygon).touches(point1):
                                        # print(file_name+"该车存在长时间停车行为")
                                        # print(data[left]['time_meas'],data[j-1]['time_meas'],interval_time)
                                        time_data.append([data[left]['time_meas'],data[j-1]['time_meas']])
                                        road_num.append(index)
                                        break
                                center_polygon = [[-66.64, -116.48], [-23.2, -146.52],
                                       [-3.16, -103.59], [-46.99, -74.72], [-66.64, -116.48]]
                                if Polygon(center_polygon).contains(point1) or Polygon(center_polygon).touches(point1):    
                                    time_data.append([data[left]['time_meas'],data[j-1]['time_meas']])
                                    road_num.append(8)
                            break
                else:
                    i += 1

            if len(time_data) > 0:
                long_time_data.append({
                    'id':data[0]['id'],
                    'type':data[0]['type'],
                    'time_arr':time_data,
                    'road':road_num
                })  
    
    long_time_path = './static/data/DataResult/long_time.json'
    with open(long_time_path, 'w') as f:
        json.dump(long_time_data, f)

# 对数据进行一些修改，以便前端进行列表展示
def merge():
    merged_data=[]
    folder_path = './static/data/DataResult'
    # 获取文件夹中的所有文件
    file_list = os.listdir(folder_path)
    # 遍历文件列表，筛选出JSON文件并读取

    for file_name in file_list:
        file_path = os.path.join(folder_path, file_name)
        with open(file_path, 'r') as f:
            data = json.load(f)
        file_name_without_extension = file_name.rsplit(".", 1)[0]
        if file_name=='people_cross.json':
            for item in data:
                item["type"]=2 
                # 加上高价值场景类型标识
                item["action_name"]=file_name_without_extension  
        elif file_name=='nomotor_cross.json':
            for item in data:
                item["type"]=3 
                item["action_name"]=file_name_without_extension
        else:
            for item in data:
                item["action_name"]=file_name_without_extension
        merged_data.append(data) 
    merge_path = './static/data/DataResult/merged_data.json'
    with open(merge_path, 'w') as f:
        json.dump(merged_data, f)

# 获取超速行为所发生的道路信息
def get_road_information():
    # 获取多边形坐标数据
    file_path1 = './static/data/BoundryRoads/polygons_people.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        road_polygons = json.load(f)
    # 读取超速数据
    file_path2 = './static/data/DataResult/overSpeeding.json'
    with open(file_path2, "r", encoding="utf-8") as f:
        overSpeed = json.load(f)
    for item in overSpeed:
        root_folder_path = './static/data/DataProcess'
        # 遍历根文件夹
        for folder_name in os.listdir(root_folder_path):
            folder_path = os.path.join(root_folder_path, folder_name)
            # 判断是否为需要处理的文件夹
            # 机动车才被检测
            if not os.path.isdir(folder_path) or folder_name not in ['1','4','6']:
                continue
            if folder_name==str(item['type']): 
                # 获取文件夹中的所有文件
                file_list = os.listdir(folder_path)
                # 遍历文件列表，筛选出JSON文件并读取
                for file_name in file_list: 
                    # 获取文件名（不包括扩展名）
                    file_name_without_extension = file_name.rsplit(".", 1)[0]
                    # 通过id寻找该车辆的轨迹文件
                    if file_name_without_extension==str(item['id']):
                        file_path = os.path.join(folder_path, file_name)
                        with open(file_path, 'r') as f:
                            data = json.load(f)
                        # 获取车辆轨迹数据
                        for d in data:
                            # 寻找对应的时间戳，并获得该时间戳内的位置坐标
                            if d['time_meas']==item['start_time']:
                                pos = json.loads(d['position'])
                                point=Point([pos['x'],pos['y']])
                                aindex=-1
                                # 判断位于哪条道路
                                for index, polygon in enumerate(road_polygons):
                                    if Polygon(polygon).contains(point) or Polygon(polygon).touches(point):
                                        aindex=index
                                        break
                                center_polygon = [[-66.64, -116.48], [-23.2, -146.52],
                                       [-3.16, -103.59], [-46.99, -74.72], [-66.64, -116.48]]
                                if Polygon(center_polygon).contains(point) or Polygon(center_polygon).touches(point):
                                    aindex=8
                                item['road']=aindex
                                break
                        break
    # 将更新后的Python对象转换为JSON格式
    updated_json = json.dumps(overSpeed)

    # 将更新后的JSON数据写入文件
    with open('./static/data/DataResult/overSpeeding.json', 'w') as file:
        file.write(updated_json)

# 获取逆行行为所发生的道路信息
def get_road_information():
    # 获取多边形坐标数据
    file_path1 = './static/data/BoundryRoads/polygons_people.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        road_polygons = json.load(f)
        
    file_path2 = './static/data/DataResult/reverse.json'
    with open(file_path2, "r", encoding="utf-8") as f:
        reverse = json.load(f)
    for item in reverse:
        root_folder_path = './static/data/DataProcess'
        # 遍历根文件夹
        for folder_name in os.listdir(root_folder_path):
            folder_path = os.path.join(root_folder_path, folder_name)
            # 判断是否为需要处理的文件夹
            # 机动车才被检测
            if not os.path.isdir(folder_path) or folder_name not in ['1','4','6']:
                continue
            if folder_name==str(item['type']): 
                # 获取文件夹中的所有文件
                file_list = os.listdir(folder_path)
                # 遍历文件列表，筛选出JSON文件并读取
                for file_name in file_list: 
                    # 获取文件名（不包括扩展名）
                    file_name_without_extension = file_name.rsplit(".", 1)[0]
                    if file_name_without_extension==str(item['id']):
                        file_path = os.path.join(folder_path, file_name)
                        with open(file_path, 'r') as f:
                            data = json.load(f)
                        # 获取车辆轨迹数据
                        for d in data:
                            if d['time_meas']==item['time']:
                                pos = json.loads(d['position'])
                                point=Point([pos['x'],pos['y']])
                                aindex=-1
                                for index, polygon in enumerate(road_polygons):
                                    if Polygon(polygon).contains(point) or Polygon(polygon).touches(point):
                                        aindex=index
                                        break
                                center_polygon = [[-66.64, -116.48], [-23.2, -146.52],
                                       [-3.16, -103.59], [-46.99, -74.72], [-66.64, -116.48]]
                                if Polygon(center_polygon).contains(point) or Polygon(center_polygon).touches(point):
                                    aindex=8
                                item['road']=aindex
                                break
                        break
    # 将更新后的Python对象转换为JSON格式
    updated_json = json.dumps(reverse)

    # 将更新后的JSON数据写入文件
    with open('./static/data/DataResult/reverse.json', 'w') as file:
        file.write(updated_json)

# 获取急减行为所发生的道路信息
def get_road_information():
    # 获取多边形坐标数据
    file_path1 = './static/data/BoundryRoads/polygons_people.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        road_polygons = json.load(f)
        
    file_path2 = './static/data/DataResult/speedDown.json'
    with open(file_path2, "r", encoding="utf-8") as f:
        speeddown = json.load(f)
    for item in speeddown:
        pos = json.loads(item['start_position'])
        point=Point([pos['x'],pos['y']])
        aindex=-1
        for index, polygon in enumerate(road_polygons):
            if Polygon(polygon).contains(point) or Polygon(polygon).touches(point):
                aindex=index
                break
        center_polygon = [[-66.64, -116.48], [-23.2, -146.52],
                [-3.16, -103.59], [-46.99, -74.72], [-66.64, -116.48]]
        if Polygon(center_polygon).contains(point) or Polygon(center_polygon).touches(point):
            aindex=8
        item['road']=aindex
    # 将更新后的Python对象转换为JSON格式
    updated_json = json.dumps(speeddown)

    # 将更新后的JSON数据写入文件
    with open('./static/data/DataResult/speedDown.json', 'w') as file:
        file.write(updated_json)

# 获取急加行为所发生的道路信息
def get_road_information():
    # 获取多边形坐标数据
    file_path1 = './static/data/BoundryRoads/polygons_people.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        road_polygons = json.load(f)
        
    file_path2 = './static/data/DataResult/speedUp.json'
    with open(file_path2, "r", encoding="utf-8") as f:
        speedup = json.load(f)
    for item in speedup:
        pos = json.loads(item['start_position'])
        point=Point([pos['x'],pos['y']])
        aindex=-1
        for index, polygon in enumerate(road_polygons):
            if Polygon(polygon).contains(point) or Polygon(polygon).touches(point):
                aindex=index
                break
        center_polygon = [[-66.64, -116.48], [-23.2, -146.52],
                [-3.16, -103.59], [-46.99, -74.72], [-66.64, -116.48]]
        if Polygon(center_polygon).contains(point) or Polygon(center_polygon).touches(point):
            aindex=8
        item['road']=aindex
    # 将更新后的Python对象转换为JSON格式
    updated_json = json.dumps(speedup)

    # 将更新后的JSON数据写入文件
    with open('./static/data/DataResult/speedUp.json', 'w') as file:
        file.write(updated_json)

# 获取出口道路到入口道路的车流量（24小时）
def road_flow():
    # 获取多边形坐标数据
    file_path1 = './static/data/BoundryRoads/polygons_people.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        road_polygons = json.load(f)

    helper_list=[]
    root_folder_path = './static/data/DataProcess'
    # 遍历根文件夹
    for folder_name in os.listdir(root_folder_path):
        folder_path = os.path.join(root_folder_path, folder_name)
        # 判断是否为需要处理的文件夹
        # 机动车流量
        if not os.path.isdir(folder_path) or folder_name not in ['1','4','6']:
            continue
        # 获取文件夹中的所有文件
        file_list = os.listdir(folder_path)
        # 遍历文件列表，筛选出JSON文件并读取
        for file_name in file_list:
            file_path = os.path.join(folder_path, file_name)
            with open(file_path, 'r') as f:
                data = json.load(f)
            start_index=-1  #记录出口道路的标识
            end_index=-1   #记录入口道路的标识
            flag=0
            # 针对每个时间戳的坐标点
            for item in data:
                if item['is_moving']==1:
                    pos = json.loads(item['position'])
                    arr = []
                    arr.append(pos['x'])
                    arr.append(pos['y'])
                    # 创建Point对象
                    point = Point(arr)
                    # 判断该坐标点位于哪条道路
                    for index,polygon in enumerate(road_polygons):
                        if Polygon(polygon).contains(point) or Polygon(polygon).touches(point):
                            # 判断是否为出口道路
                            if index in [1,3,4,6] and start_index==-1:
                                start_index=index 
                                flag=1 #用于固定先后顺序，只有先从出口道路出来，才能进入入口道路
                                break 
                            # 记录入口道路 
                            if index in [0,2,5,7] and flag==1:
                                end_index=index
                                break   
                    if end_index!=-1:
                        break
            #记录出入口信息 
            if start_index!=-1 and end_index!=-1:
                helper_list.append([file_name,start_index,end_index])
                
    flow_path = './static/data/Result/road_flow.json'
    with open(flow_path, 'w') as f:
        json.dump(helper_list, f) 

    # 将数据存入8乘8的矩阵
    road_flow_data = [[0 for _ in range(8)] for _ in range(8)]
    for item in helper_list:
        index1=item[1]
        index2=item[2]
        road_flow_data[index1][index2]+=1
        
    print(road_flow_data)

def getLightData():
    f = open("./static/data/ChinaVis Data/road10map/laneroad10.geojson", "r")
    laneData = json.load(f)
    useData = {}
    useLaneData = {}

    for i in laneData["features"]:
        useCoord = i["geometry"]["coordinates"]

        if(i["properties"]["lane_count"] == 0 and i["properties"]["lane_no"] == 0):
            continue
        useData[i["properties"]["fid"]] = []
        useLaneData[i["properties"]["fid"]] = i
        useCoord = i["geometry"]["coordinates"]
        lineStart = []
        lineEnd = []
        for j in laneData["features"]:
            if(j["properties"]["lane_count"] == 0 and j["properties"]["lane_no"] == 0):
                continue
            if(j["properties"]["fid"] == i["properties"]["fid"]):
                continue
            nowCoord = j["geometry"]["coordinates"]
            isOne = False
            for k in nowCoord:
                if(abs(k[0] - useCoord[0][0]) < 0.1 and abs(k[1] - useCoord[0][1]) < 0.1):
                    lineStart.append(j["properties"]["fid"])
                    isOne = True
                if(abs(k[0] - useCoord[-1][0]) < 0.1 and abs(k[1] - useCoord[-1][1]) < 0.1):
                    lineEnd.append(j["properties"]["fid"])
                    isOne = True
            if(isOne):
                useData[i["properties"]["fid"]].append(j["properties"]["fid"])

    allLane = set()

    def getOneLineAll(nowData):
        result = []
        for i in nowData:
            if(i in allLane):
                continue
            result.append(i)
            allLane.add(i)
            result.extend(getOneLineAll(useData[i]))
            useData[i] = []
        return result
    for i in useData:
        if(i in allLane):
            continue
        allLane.add(i)
        useData[i] = getOneLineAll(useData[i])
        useData[i].append(i)

    f = open("./static/data/DataProcess/line.json", "w")
    json.dump(useData, f)

    twoLine = [1898, 1910, 1936, 1957, 1975]
    laneAll = {}
    for i in useData:
        if(len(useData[i]) == 0):
            continue
        oneLineData = []
        if(int(i) in twoLine):
            oneLineData = {}
            for j in useData[i]:
                if(useLaneData[j]["properties"]["lane_no"] not in oneLineData):
                    oneLineData[useLaneData[j]["properties"]["lane_no"]] = []
                    nowstr = str(i) + "_" + \
                        str(useLaneData[j]["properties"]["lane_no"])
                    laneAll[nowstr] = []
                oneLineData[useLaneData[j]["properties"]
                            ["lane_no"]].append(useLaneData[j])
            for j in oneLineData:
                laneAll[str(i) + "_" + str(j)] = oneLineData[j]
        else:
            for j in useData[i]:
                oneLineData.append(useLaneData[j])
            laneAll[i] = oneLineData

    useLane = {
        "top": {
            "r": {},
            "l": {}
        },
        "bottom": {
            "r": {},
            "l": {}
        },
        "right": {
            "r": {},
            "l": {}
        },
        "left": {
            "r": {},
            "l": {}
        }
    }
    data1 = []
    for i in laneAll:
        data1.extend(laneAll[i])
        nowcoord = laneAll[i][0]["geometry"]["coordinates"]
        # 判断当前道路的方向
        if((nowcoord[0][1] - nowcoord[-1][1]) / (nowcoord[0][0] - nowcoord[-1][0]) > 0):
            if(nowcoord[0][1] - nowcoord[-1][1] > 0):
                laneAll[i].sort(key=lambda x: x["geometry"]
                                ["coordinates"][0][1], reverse=True)
                if(laneAll[i][0]["geometry"]["coordinates"][-1][1] > -100):
                    useLane["top"]["r"][i] = laneAll[i]
                else:
                    useLane["bottom"]["l"][i] = laneAll[i]

            else:
                laneAll[i].sort(key=lambda x: x["geometry"]
                                ["coordinates"][0][1])
                if(laneAll[i][0]["geometry"]["coordinates"][0][1] > -100):
                    useLane["top"]["l"][i] = laneAll[i]
                else:
                    useLane["bottom"]["r"][i] = laneAll[i]

        else:
            if(nowcoord[0][0] - nowcoord[-1][0] > 0):
                laneAll[i].sort(key=lambda x: x["geometry"]
                                ["coordinates"][0][0], reverse=True)

                if(laneAll[i][0]["geometry"]["coordinates"][-1][0] > -30):
                    useLane["right"]["r"][i] = laneAll[i]
                else:
                    useLane["left"]["l"][i] = laneAll[i]
            else:
                laneAll[i].sort(key=lambda x: x["geometry"]
                                ["coordinates"][0][0])
                if(laneAll[i][0]["geometry"]["coordinates"][0][0] > -30):
                    useLane["right"]["l"][i] = laneAll[i]
                else:
                    useLane["left"]["r"][i] = laneAll[i]

    f = open("./static/data/DataProcess/1.json", "w")
    json.dump({
        "type": "FeatureCollection",
        "name": "lane",
        "features": data1
    }, f)

    f = open("./static/data/DataProcess/laneAll.json", "w")
    json.dump(useLane, f)

    f = open("./static/data/ChinaVis Data/road10map/boundaryroad10.geojson", "r")
    boundary = json.load(f)
    boundaryData = {}
    for i in boundary["features"]:
        boundaryData[i["properties"]["fid"]] = i

    polygonList = {}
    allData = {}
    for i in useLane:
        for j in useLane[i]:
            for k in useLane[i][j]:
                leftData = []
                rightData = []
                for l in useLane[i][j][k]:
                    for m in boundaryData[l["properties"]["left_boundary_id"]]["geometry"]["coordinates"]:
                        leftData.append([m[0], m[1]])
                        
                    for m in boundaryData[l["properties"]["right_boundary_id"]]["geometry"]["coordinates"]:
                        rightData.append([m[0], m[1]])
                rightData.reverse()
                leftData.extend(rightData)
                polygonList[k] = Polygon(leftData)
                allData[k] = {}
    allTime = {}
    for i in range(10):
    # 创建文件夹./static/data/ChinaVis Data文件夹，里面放入ChinaVis数据和./static/data/DataProcess/文件夹
        f = open("./static/data/ChinaVis Data/part-0000" + str(i) +
                    "-905505be-27fc-4ec6-9fb3-3c3a9eee30c4-c000.json", "r", encoding="utf-8")
        data = f.read().split("\n")
        # 按照id将数据分组
        with alive_bar(len(data)) as bar:
            for j in data:
                try:
                    nowData = json.loads(j)
                    nowPosition = json.loads(nowData["position"])
                    nowData = json.loads(j)
                    nowTime = float(nowData["time_meas"]) / 1000000
                    nowTime = time.localtime(nowTime)
                    nowTime = time.strftime("%Y-%m-%d %H:%M:%S", nowTime)
                    allTime[nowTime] = {}
                    for k in polygonList:
                        if(polygonList[k].contains(Point(nowPosition["x"], nowPosition["y"]))):
                            if(nowTime not in allData[k]):
                                allData[k][nowTime] = []
                            allData[k][nowTime].append(nowData)
                            break
                except:
                    print(j)
                bar()
    for i in allData:
        f = open("./static/data/DataProcess/part" + str(i) + ".json", "w")
        json.dump(allData[i], f)
    # for i in allData:
    #     f = open("./static/data/DataProcess/part" + str(i) + ".json", "r")
    #     allData[i] = json.load(f)
    for i in useLane:
        for j in useLane[i]:
            if(j == "l"):
                continue
            for k in useLane[i][j]:
                for l in allData[k]:
                    if(i == "top"):
                        allData[k][l].sort(key = lambda x:json.loads(x["position"])["y"], reverse = True)
                    elif(i == "bottom"):
                        allData[k][l].sort(key = lambda x:json.loads(x["position"])["y"])
                    elif(i == "right"):
                        allData[k][l].sort(key = lambda x:json.loads(x["position"])["x"], reverse = True)
                    elif(i == "left"):
                        allData[k][l].sort(key = lambda x:json.loads(x["position"])["x"])
                    nowData = json.loads(allData[k][l][0]["position"])
                    if(i == "top" or i =="bottom"):
                        if(nowData["y"] - useLane[i][j][k][-1]["geometry"]["coordinates"][-1][2] > 3):
                            allData[k][l] = [allData[k][l][0]]
                        else:
                            allData[k][l] = []
                    else:
                        if(nowData["x"] - useLane[i][j][k][-1]["geometry"]["coordinates"][-1][0] > 3):
                            allData[k][l] = [allData[k][l][0]]
                        else:
                            allData[k][l] = []
    for i in allTime:
        for j in useLane:
            for k in useLane[j]["r"]:
                if(i in allData[k]):
                    if(len(allData[k][i]) > 0):
                        allTime[i][k] = allData[k][i]["is_moving"]
                else:
                    allTime[i][k] = 0

    f = open("./static/data/DataProcess/allLineRun.json", "w")
    json.dump(allTime, f)



if __name__ == '__main__':
    # dataType()
    # 驾驶行为
    # featureAll()
    # csvNormalization()
    # dimReduction()
    # fillNan()
    # kmeans()
    dimReduction_cluster()