import json
import os
import operator
import datetime
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
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import matplotlib.pyplot as plt
import datetime as dt
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import collections
import shutil


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

    allFault = {}
    # 按照数据的类型进行分组保存
    for i in allData:
        nowType = {}
        for j in allData[i]:
            if(j["type"] not in nowType):
                nowType[j["type"]] = 0
            nowType[j["type"]] += 1
        typeNum = 0
        allNum = len(allData[i])
        maxType = -1
        useType = 0
        for j in nowType:
            typeNum += 1
            if(nowType[j] > maxType):
                maxType = nowType[j]
                useType = str(j)
        if(typeNum > 1):
            allFault[i] = nowType
            for j in range(allNum):
                allData[i][j]["type"] = useType

        if(not os.path.exists("./static/data/DataProcess/" + useType)):
            os.makedirs("./static/data/DataProcess/" + useType)
        f = open("./static/data/DataProcess/" +
                 useType + "/" + str(i) + ".json", "w")
        f.write(json.dumps(allData[i]))
    f = open("./static/data/DataProcess/allFault.json", "w")
    f.write(json.dumps(allFault))
    for i in range(10):
        # 创建文件夹./static/data/ChinaVis Data文件夹，里面放入ChinaVis数据和./static/data/DataProcess/文件夹
        f = open("./static/data/ChinaVis Data/part-0000" + str(i) +
                    "-905505be-27fc-4ec6-9fb3-3c3a9eee30c4-c000.json", "r", encoding="utf-8")
        data = f.read().split("\n")
        nowFile = open("./static/data/ChinaVis Data/part" + str(i) + ".json", "a", encoding="utf-8")
        # 按照id将数据分组
        for j in data:
            try:
                nowData = json.loads(j)
                nowData["type"] = allData[nowData["id"]][0]["type"]
                nowFile.write(json.dumps(nowData))
            except:
                print(j)

# 按时间戳顺序对每辆车的轨迹数据进行排序
def dataTypebytime_meas():
    allData = {}
    # 获取所有数据文件夹
    for i in range(10):
        # 创建文件夹./static/data/ChinaVis Data文件夹，里面放入ChinaVis数据和./static/data/DataProcess/文件夹
        # f = open("./static/data/DataProcess/idRoad/part" + str(i) +
        #          ".json", "r", encoding="utf-8")
        # data = f.read()
        with open("./static/data/DataProcess/idRoad/part" + str(i) +
                 ".json", "r") as f:
            data=json.load(f)
        # 按照id将数据分组
        with alive_bar(len(data)) as bar:
            for key, value in data.items():
                try:
                    nowData = value
                    nowTime = float(nowData["time_meas"]) / 1000000
                    nowTime = time.localtime(nowTime)
                    nowTime = time.strftime("%Y-%m-%d %H:%M:%S", nowTime)
                    if nowTime not in allData:
                        allData[nowTime] = []
                    allData[nowTime].append(nowData)
                except:
                    print("Error processing data:", value)
                bar()
    # 按照数据的类型进行分组保存
    for i in allData:
        data = time.mktime(time.strptime(i, "%Y-%m-%d %H:%M:%S"))
        if(not os.path.exists("./static/data/DataProcess/newtime_meas")):
            os.makedirs("./static/data/DataProcess/newtime_meas")
        f = open("./static/data/DataProcess/newtime_meas/" +
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

# # 对数据进行一些修改，以便前端进行列表展示
# def merge():
#     merged_data=[]
#     folder_path = './static/data/DataResult'
#     # 获取文件夹中的所有文件
#     file_list = os.listdir(folder_path)
#     # 遍历文件列表，筛选出JSON文件并读取

#     for file_name in file_list:
#         file_path = os.path.join(folder_path, file_name)
#         with open(file_path, 'r') as f:
#             data = json.load(f)
#         file_name_without_extension = file_name.rsplit(".", 1)[0]
#         if file_name=='people_cross.json':
#             for item in data:
#                 item["type"]=2 
#                 # 加上高价值场景类型标识
#                 item["action_name"]=file_name_without_extension  
#         elif file_name=='nomotor_cross.json':
#             for item in data:
#                 item["type"]=3 
#                 item["action_name"]=file_name_without_extension
#         else:
#             for item in data:
#                 item["action_name"]=file_name_without_extension
#         merged_data.append(data) 
#     merge_path = './static/data/DataResult/merged_data.json'
#     with open(merge_path, 'w') as f:
#         json.dump(merged_data, f)

# 获取超速行为所发生的道路信息
def get_road_information1():
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
def get_road_information2():
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
def get_road_information3():
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
def get_road_information4():
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

# 计算一天时间内每五分钟的路口总体平均速度，用于玫瑰图分析是否存在拥堵
def aver_speed():
    # 时间段时长和数量
    segment_duration = datetime.timedelta(minutes=5)  # 时间段时长为5分钟
    num_segments = 288  # 时间段数量

    # 初始化时间段数据
    segment_data = [[] for _ in range(num_segments)]  # 使用列表存储每个时间段的数据

    # 获取多边形坐标数据
    file_path1 = './static/data/BoundryRoads/polygons_people.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        road_polygons = json.load(f)

    root_folder_path = './static/data/DataProcess'
    # 遍历根文件夹
    for folder_name in os.listdir(root_folder_path):
        folder_path = os.path.join(root_folder_path, folder_name)
        # 判断是否为需要处理的文件夹
        # 机动车数据
        if not os.path.isdir(folder_path) or folder_name not in ['1','4','6']:
            continue
        # 获取文件夹中的所有文件
        file_list = os.listdir(folder_path)
        # 遍历文件列表，筛选出JSON文件并读取
        for file_name in file_list:
            file_path = os.path.join(folder_path, file_name)
            with open(file_path, 'r') as f:
                data = json.load(f)
            velocity_data = [[] for _ in range(num_segments)]  # 使用列表存储每个时间段的速度数据   
            for item in data:
                if item['is_moving']==1:
                    pos = json.loads(item['position'])
                    arr = []
                    arr.append(pos['x'])
                    arr.append(pos['y'])
                    # 创建Point对象
                    point = Point(arr)
                    for road in road_polygons:
                        # 判断是否位于车道内
                        if Polygon(road).contains(point) or Polygon(road).touches(point):
                            # 将时间戳转换为日期时间
                            dt = datetime.datetime.fromtimestamp(item['time_meas'] / 1000000)
                            time_diff = dt - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳的时间差
                            segment_index = int(time_diff.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
                            if segment_index>287:
                                segment_index=287
                            velocity_data[segment_index].append(item['velocity'])  # 将速度存储到对应的时间段中
                            break
                    center_polygon = [[-66.64, -116.48], [-23.2, -146.52],
                                    [-3.16, -103.59], [-46.99, -74.72], [-66.64, -116.48]]
                    if Polygon(center_polygon).contains(point) or Polygon(center_polygon).touches(point):
                        # 将时间戳转换为日期时间
                        dt = datetime.datetime.fromtimestamp(item['time_meas'] / 1000000)
                        time_diff = dt - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳与当天零点之间的时间差
                        segment_index = int(time_diff.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
                        if segment_index>287:
                            segment_index=287
                        velocity_data[segment_index].append(item['velocity'])  # 将速度数据存储到对应的时间段中 
                        
            #计算每辆车在某个时间段内的平均速度，作为计算该时间段总的平均速度的基础数据   
            for index, velocity in enumerate(velocity_data):                  
                if velocity:
                    aver_velocity=sum(velocity)/len(velocity) 
                    segment_data[index].append(aver_velocity) 
            # count+=1
            # if count>50:
            #     print(segment_data)
            #     break   
        print('finish'+folder_name)
        
    averspeed_path = './static/data/Result/segment_speed_data.json'
    with open(averspeed_path, 'w') as f:
        json.dump(segment_data, f)  
            
    final_result=[]
    for segment in segment_data:
        if segment:
            average=sum(segment)/len(segment) 
            final_result.append(average) 
        else:
            final_result.append(0)  

    print(final_result) 

# 计算每小时路口总的车流量数据，用于玫瑰图
def traffic_flow():
    # 时间段时长和数量
    segment_duration = datetime.timedelta(minutes=60)  # 时间段时长为60分钟
    num_segments = 24  # 时间段数量
    # 初始化时间段数据
    traffic_flow = [0 for _ in range(num_segments)]  # 使用列表存储每个时间段的数据
    # 获取多边形坐标数据
    file_path1 = './static/data/BoundryRoads/polygons_people.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        road_polygons = json.load(f)

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
            aindex=-1
            for item in data:
                if item['is_moving']==1:
                    pos = json.loads(item['position'])
                    arr = []
                    arr.append(pos['x'])
                    arr.append(pos['y'])
                    # 创建Point对象
                    point = Point(arr)
                    for road in road_polygons:
                        if Polygon(road).contains(point) or Polygon(road).touches(point):
                            # 将时间戳转换为日期时间
                            dt = datetime.datetime.fromtimestamp(item['time_meas'] / 1000000)
                            time_diff = dt - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳的时间差
                            segment_index = int(time_diff.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
                            if aindex!=segment_index:
                                if segment_index>23:
                                    traffic_flow[23]+=1
                                else:
                                    traffic_flow[segment_index]+=1
                                aindex=segment_index
                            break      
        # print('finish'+folder_name)                
    print(traffic_flow)                    
          

# 分解高价值场景数据，以便跟好地统计数量，此外还修改数据的部分格式
def decomposition():
    decomposition_data=[]
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
            new_data=[]
            for item in data:
                time_arr=item['time_arr']
                # 将时间段数据分为start_time和end_time，同时加上类型标识
                new_data.append({
                    'id':item['id'],
                    'type':2,
                    'start_time':time_arr[0],
                    'end_time':time_arr[1],
                    'road':item['road'],
                    'action_name':file_name_without_extension
                })
            data=new_data  
        elif file_name=='nomotor_cross.json':
            new_data=[]
            for item in data:
                time_arr=item['time_arr']
                # 将时间段数据分为start_time和end_time，同时加上类型标识
                new_data.append({
                    'id':item['id'],
                    'type':3,
                    'start_time':time_arr[0],
                    'end_time':time_arr[1],
                    'road':item['road'],
                    'action_name':file_name_without_extension
                })
            data=new_data
        elif file_name=='car_cross.json':
            new_data=[]
            for item in data:
                time_arr=item['time_arr']
                road=item['road']
                # 将切入切出数据分解，同时加上类型标识
                for i,t in enumerate(time_arr):
                    new_data.append({
                        'id':item['id'],
                        'type':item['type'],
                        'count':item['count'],
                        'start_time':t,
                        'road':road[i],
                        'action_name':file_name_without_extension
                    })
            data=new_data
                    
        elif file_name=='long_time.json':
            new_data=[]
            for item in data:
                time_arr=item['time_arr']
                road=item['road']
                for i,t in enumerate(time_arr):
                    new_data.append({
                        'id':item['id'],
                        'type':item['type'],
                        'start_time':t[0],
                        'end_time':t[1],
                        'road':road[i],
                        'action_name':file_name_without_extension
                    })
            data=new_data        
        
        elif file_name=='reverse.json':
            for item in data:
                item['start_time'] = item.pop('time')
                item['action_name']=file_name_without_extension
        
        else:
            for item in data:
                item["action_name"]=file_name_without_extension        
            
        decomposition_data.append(data) 
    decom_path = './static/data/Result/decomposition_data.json'
    with open(decom_path, 'w') as f:
        json.dump(decomposition_data, f)

# 获取一天时间内每五分钟的路口总停止频率，只有停车次数大于1次才被计入
def stop_frequency():
    # 时间段时长和数量
    segment_duration = datetime.timedelta(minutes=5)  # 时间段时长为5分钟
    num_segments = 288  # 时间段数量

    # 初始化车辆总数的数据
    car_total = [0 for _ in range(num_segments)]  # 使用列表存储每个时间段的数据
    # 初始化停车总数的数据
    stop_total = [0 for _ in range(num_segments)]

    # 获取多边形坐标数据
    file_path1 = './static/data/BoundryRoads/polygons_people.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        road_polygons = json.load(f)

    root_folder_path = './static/data/DataProcess'
    # 十字路口的坐标
    center_polygon = [[-66.64, -116.48], [-23.2, -146.52],[-3.16, -103.59], [-46.99, -74.72], [-66.64, -116.48]]
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
            # 用于判断轨迹时间戳数据是否跨越时间段
            segment_index1=-1
            segment_index2=-1
            # 记录停车次数
            stop_count=-1
            # 记录前一个时间戳的车辆状态（停止和移动）
            previous_attribute = None
            for item in data:
                pos = json.loads(item['position'])
                arr = []
                arr.append(pos['x'])
                arr.append(pos['y'])
                # 创建Point对象
                point = Point(arr)
                for road in road_polygons:
                    # 判断该时间戳内车辆是否位于车道内
                    if Polygon(road).contains(point) or Polygon(road).touches(point) or Polygon(center_polygon).contains(point) or Polygon(center_polygon).touches(point):
                        # 将时间戳转换为日期时间
                        dt = datetime.datetime.fromtimestamp(item['time_meas'] / 1000000)
                        time_diff = dt - datetime.datetime(dt.year, dt.month, dt.day)  # 计算时间戳与当天零点之间的时间差
                        new_index = int(time_diff.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
                        current_attribute = item['is_moving']
                        # 变化次数
                        if previous_attribute!=None and current_attribute != previous_attribute:
                            stop_count += 1
                        previous_attribute = current_attribute
                        # 计算某个时间段内车辆总数
                        if new_index!=segment_index1:
                            car_total[new_index]+=1  # 将数据存储到对应的时间段中
                            segment_index1=new_index
                        # 计算某个时间段内停过车的车辆总数
                        if new_index!=segment_index2:
                            # 停车次数必须大于1
                            if stop_count>1:
                                stop_total[new_index]+=1
                                stop_count=-1
                                segment_index2=new_index    
                        break 

    adata = {
        "list1": car_total,
        "list2": stop_total
    }
    averspeed_path = './static/data/Result/stop.json'
    with open(averspeed_path, 'w') as f:
        json.dump(adata, f)
        
    stop_frequency=[]
    for num1, num2 in zip(stop_total, car_total):
        if num2 != 0:
            stop_frequency.append(num1 / num2)
        else:
            stop_frequency.append(0)  
            
    print(stop_frequency)

# 获取每个小车道每五分钟的车流量
def little_road_flow():
    # 车道对应序号
    pair_dict={'part1912':0,'part1911':1,'part1910_2':2,'part1910_1':3,'part1898_1':4,'part1898_2':5,'part1900':6,'part1901':7,'part1957_4':8,'part1957_3':9,'part1956':10,
    'part1955':11,'part1934':12,'part1935':13,'part1936_3':14,'part1936_4':15,'part1450':16,'part1449':17,'part1448':18,'part1447':19,'part1446':20,'part1442':21,'part1443':22,
    'part1444':23,'part1445':24,'part1974':25,'part1973':26,'part1972':27,'part1975_1':28,'part1975_2':29,'part1977':30,'part1978':31,'part3487':32,'part3486':33}
    # 时间段时长和数量
    segment_duration = datetime.timedelta(minutes=5)  # 时间段时长为5分钟
    flow_result=[[0 for _ in range(288)] for _ in range(34)]
    folder_path = './static/data/DataProcess/road'
    # 获取文件夹中的所有文件
    file_list = os.listdir(folder_path)
    # 遍历文件列表，筛选出JSON文件并读取
    for file_name in file_list:
        # 获取文件名字符串
        file_name_without_extension = file_name.rsplit(".", 1)[0]
        file_path = os.path.join(folder_path, file_name)
        with open(file_path, 'r') as f:
            data = json.load(f)
        id_list=[[] for _ in range(288)]
        # 遍历字典的键值对
        for key, value in data.items():
            # 将时间段的时间转换为 datetime 对象
            key_time = datetime.datetime.strptime(key, "%Y-%m-%d %H:%M:%S")
            time_diff = key_time - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳的时间差
            segment_index = int(time_diff.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
            if segment_index>287:
                segment_index=287
            for item in value:
                if item['is_moving']==0:
                    continue
                car_id=item['id']
                # 保存车辆id，重复的不计入
                if car_id not in id_list[segment_index]:
                    id_list[segment_index].append(car_id) 
        for index,alist in enumerate(id_list): 
            # 列表长度对应流量  
            flow_result[pair_dict[file_name_without_extension]][index]=len(alist)
    # print(flow_result)
    with open('./static/data/Result/little_road_flow.json', 'w') as f:
        json.dump(flow_result, f)  

# 获取从出口小车道进入入口小车道的流量数据，用于弦图，按每五分钟计
def little_road_flow_new():
    pair_dict={'part1912':0,'part1911':1,'part1910_2':2,'part1910_1':3,'part1898_1':4,'part1898_2':5,'part1900':6,'part1901':7,'part1957_4':8,'part1957_3':9,'part1956':10,
    'part1955':11,'part1934':12,'part1935':13,'part1936_3':14,'part1936_4':15,'part1450':16,'part1449':17,'part1448':18,'part1447':19,'part1446':20,'part1442':21,'part1443':22,
    'part1444':23,'part1445':24,'part1974':25,'part1973':26,'part1972':27,'part1975_1':28,'part1975_2':29,'part1977':30,'part1978':31}
    # 时间段时长和数量
    segment_duration = datetime.timedelta(minutes=5)  # 时间段时长为5分钟
    rows = 32
    cols = 32
    length = 288
    # 创建长度为 288 的列表，其中每个元素是一个 32x32 的矩阵
    flow_result = [[[0 for _ in range(cols)] for _ in range(rows)] for _ in range(length)]
    left_id_list=[]
    right_id_list=[]
    folder_path = './static/data/DataProcess/road'
    # 获取文件夹中的所有文件
    file_list = os.listdir(folder_path)
    # 遍历文件列表，筛选出JSON文件并读取
    for file_name in file_list:
        file_name_without_extension = file_name.rsplit(".", 1)[0]
        file_path = os.path.join(folder_path, file_name)
        with open(file_path, 'r') as f:
            data = json.load(f)
        # 不考虑两个特殊车道
        if file_name=='part3486.json' or file_name=='part3487.json':
            continue
        id_list=[[] for _ in range(288)]
        # 遍历字典的键值对
        for key, value in data.items():
            # 将时间段的起始时间和结束时间转换为 datetime 对象
            key_time = datetime.datetime.strptime(key, "%Y-%m-%d %H:%M:%S")
            time_diff = key_time - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳与当天零点之间的时间差
            segment_index = int(time_diff.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
            if segment_index>287:
                segment_index=287
            for item in value:
                if item['is_moving']==0:
                    continue
                car_id=item['id']
                if car_id not in id_list[segment_index]:
                    id_list[segment_index].append(car_id)
        # 小车道出口的序号，只能作为出口 
        if pair_dict[file_name_without_extension] in [4,5,6,7,12,13,14,15,21,22,23,24,28,29,30,31]:
            # 保存位于出口道路的车辆id
            right_id_list.append({
                'serial_num':pair_dict[file_name_without_extension],
                'idlist':id_list
            })  
        else:
            # 保存位于入口道路的车辆id
            left_id_list.append({
                'serial_num':pair_dict[file_name_without_extension],
                'idlist':id_list
            })   
    # 判断每个出口道路的车辆id是否与入口道路的车辆id相同
    for item1 in right_id_list:
        idList1=item1['idlist']
        for index,segment_list1 in enumerate(idList1):
            for item2 in left_id_list:
                idList2=item2['idlist']
                segment_list2=idList2[index]
                for aid in segment_list1:
                    for bid in segment_list2:
                        if aid==bid:
                            flow_result[index][item1['serial_num']][item2['serial_num']]+=1
    
        # for index,alist in enumerate(id_list):       
        #     flow_result[pair_dict[file_name_without_extension]][index]=len(alist) 
    # print(flow_result)
    with open('./static/data/Result/little_road_flow_new.json', 'w') as f:
        json.dump(flow_result, f)  
        
# 获取每条小车道24小时的流量、最大流量、最小流量，用于健康指数计算
def little_road_flow_health():
    pair_dict={'part1912':0,'part1911':1,'part1910_2':2,'part1910_1':3,'part1898_1':4,'part1898_2':5,'part1900':6,'part1901':7,'part1957_4':8,'part1957_3':9,'part1956':10,
    'part1955':11,'part1934':12,'part1935':13,'part1936_3':14,'part1936_4':15,'part1450':16,'part1449':17,'part1448':18,'part1447':19,'part1446':20,'part1442':21,'part1443':22,
    'part1444':23,'part1445':24,'part1974':25,'part1973':26,'part1972':27,'part1975_1':28,'part1975_2':29,'part1977':30,'part1978':31,'part3487':32,'part3486':33}
    # 时间段时长和数量
    segment_duration = datetime.timedelta(minutes=60)  # 时间段时长为5分钟
    # 用于保存每条小车道的24小时的流量
    flow_result=[[0 for _ in range(24)] for _ in range(34)]
    # 用于保存每条小车道的最大流量
    max_flow=[0 for _ in range(34)]
    # 用于保存每条小车道的最小流量
    min_flow=[0 for _ in range(34)]
    folder_path = './static/data/DataProcess/road'
    # 获取文件夹中的所有文件
    file_list = os.listdir(folder_path)
    # 遍历文件列表，筛选出JSON文件并读取
    for file_name in file_list:
        file_name_without_extension = file_name.rsplit(".", 1)[0]
        file_path = os.path.join(folder_path, file_name)
        with open(file_path, 'r') as f:
            data = json.load(f)
        # 保存该车道的每个小时的车辆id
        id_list=[[] for _ in range(24)]
        maxcount=0
        mincount=500
        # 遍历字典的键值对
        for key, value in data.items():
            # 将键的时间转换为 datetime 对象
            key_time = datetime.datetime.strptime(key, "%Y-%m-%d %H:%M:%S")
            time_diff = key_time - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳的时间差
            segment_index = int(time_diff.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
            if segment_index>23:
                segment_index=23
            for item in value:
                if item['is_moving']==0:
                    continue
                car_id=item['id']
                if car_id not in id_list[segment_index]:
                    id_list[segment_index].append(car_id) 
        for index,alist in enumerate(id_list):       
            flow_result[pair_dict[file_name_without_extension]][index]=len(alist)
            # 获取24小时内的最大流量
            if len(alist)>maxcount:
                maxcount=len(alist)
            # 获取24小时内的最小流量
            if len(alist)<mincount:
                mincount=len(alist)
        max_flow[pair_dict[file_name_without_extension]]=maxcount
        min_flow[pair_dict[file_name_without_extension]]=mincount
    # print(flow_result)
    with open('./static/data/Result/little_road_flow_health.json', 'w') as f:
        json.dump(flow_result, f)
    print(max_flow)
    print(min_flow)  

# 获取每条小车道24小时的平均速度、总的平均速度和高峰平均速度，用于健康指数计算
def little_road_velocity_health():
    pair_dict={'part1912':0,'part1911':1,'part1910_2':2,'part1910_1':3,'part1898_1':4,'part1898_2':5,'part1900':6,'part1901':7,'part1957_4':8,'part1957_3':9,'part1956':10,
    'part1955':11,'part1934':12,'part1935':13,'part1936_3':14,'part1936_4':15,'part1450':16,'part1449':17,'part1448':18,'part1447':19,'part1446':20,'part1442':21,'part1443':22,
    'part1444':23,'part1445':24,'part1974':25,'part1973':26,'part1972':27,'part1975_1':28,'part1975_2':29,'part1977':30,'part1978':31,'part3487':32,'part3486':33}
    # 时间段时长和数量
    segment_duration = datetime.timedelta(minutes=60)  # 时间段时长为5分钟
    # 保存24小时平均速度数据
    velocity_result=[[0 for _ in range(24)] for _ in range(34)]
    # 保存用于计算总的平均速度的数据
    sum_velocity=[0 for _ in range(34)]
    # 保存用于计算高峰平均速度的数据
    high_velocity=[0 for _ in range(34)]
    folder_path = './static/data/DataProcess/road'
    # 获取文件夹中的所有文件
    file_list = os.listdir(folder_path)
    # 遍历文件列表，筛选出JSON文件并读取
    for file_name in file_list:
        file_name_without_extension = file_name.rsplit(".", 1)[0]
        file_path = os.path.join(folder_path, file_name)
        with open(file_path, 'r') as f:
            data = json.load(f)
        # 保存针对特定小车道的中间数据
        road_velocity=[[] for _ in range(24)]
        road_all_velocity=[]
        road_high_velocity=[]
        # 遍历字典的键值对
        for key, value in data.items():
            # 将键的时间转换为 datetime 对象
            key_time = datetime.datetime.strptime(key, "%Y-%m-%d %H:%M:%S")
            time_diff = key_time - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳与当天零点之间的时间差
            segment_index = int(time_diff.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
            speed_list=[]
            if segment_index>23:
                segment_index=23
            for item in value:
                if item['is_moving']==0:
                    continue
                item_velocity=item['velocity']
                # 将该时间段内的速度存入列表，用于计算该时间段的平均速度
                speed_list.append(item_velocity)
            if speed_list:
                # 计算该时间段的平均速度
                aver_velocity=sum(speed_list)/len(speed_list)
                # 将该时间段的平均速度放入指定的小时数据列表中，用于计算小时的平均速度
                road_velocity[segment_index].append(aver_velocity)
                road_all_velocity.append(aver_velocity)
                # 存入高峰平均速度的中间数据
                if segment_index in [8,17]:
                    road_high_velocity.append(aver_velocity)    
        for index,alist in enumerate(road_velocity):
            if alist:  
                # 计算每小时的平均速度 
                velocity_result[pair_dict[file_name_without_extension]][index]=sum(alist)/len(alist)
        if road_all_velocity:
            # 计算总的平均速度
            sum_velocity[pair_dict[file_name_without_extension]]=sum(road_all_velocity)/len(road_all_velocity)
        else:
            sum_velocity[pair_dict[file_name_without_extension]]=0
        if road_high_velocity:
            # 计算高峰平均速度
            high_velocity[pair_dict[file_name_without_extension]]=sum(road_high_velocity)/len(road_high_velocity)
        else:
            high_velocity[pair_dict[file_name_without_extension]]=0
    # print(flow_result)
    with open('./static/data/Result/little_road_velocity_health.json', 'w') as f:
        json.dump(velocity_result, f)
    print(sum_velocity)
    print(high_velocity)  

# 计算客车指标数据（平均速度、速度占比），用于健康指数计算
def little_road_bus_velocity_health():
    pair_dict={'part1912':0,'part1911':1,'part1910_2':2,'part1910_1':3,'part1898_1':4,'part1898_2':5,'part1900':6,'part1901':7,'part1957_4':8,'part1957_3':9,'part1956':10,
    'part1955':11,'part1934':12,'part1935':13,'part1936_3':14,'part1936_4':15,'part1450':16,'part1449':17,'part1448':18,'part1447':19,'part1446':20,'part1442':21,'part1443':22,
    'part1444':23,'part1445':24,'part1974':25,'part1973':26,'part1972':27,'part1975_1':28,'part1975_2':29,'part1977':30,'part1978':31,'part3487':32,'part3486':33}
    # 时间段时长和数量
    segment_duration = datetime.timedelta(minutes=60)  # 时间段时长为5分钟
    velocity_result=[[0 for _ in range(24)] for _ in range(34)]
    velocity_propotion=[[0 for _ in range(24)] for _ in range(34)]
    folder_path = './static/data/DataProcess/road'
    # 获取文件夹中的所有文件
    file_list = os.listdir(folder_path)
    # 遍历文件列表，筛选出JSON文件并读取
    for file_name in file_list:
        file_name_without_extension = file_name.rsplit(".", 1)[0]
        file_path = os.path.join(folder_path, file_name)
        with open(file_path, 'r') as f:
            data = json.load(f)
        road_velocity=[[] for _ in range(24)]
        # 遍历字典的键值对
        for key, value in data.items():
            # 将键的时间转换为 datetime 对象
            key_time = datetime.datetime.strptime(key, "%Y-%m-%d %H:%M:%S")
            time_diff = key_time - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳的时间差
            segment_index = int(time_diff.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
            speed_list=[]
            if segment_index>23:
                segment_index=23
            for item in value:
                if item['is_moving']==0:
                    continue
                # 判断是否为公交车
                if item['type']!=6:
                    continue
                item_velocity=item['velocity']
                speed_list.append(item_velocity)
            if speed_list:
                aver_velocity=sum(speed_list)/len(speed_list)
                road_velocity[segment_index].append(aver_velocity)  
        for index,alist in enumerate(road_velocity):
            if alist:       
                velocity_result[pair_dict[file_name_without_extension]][index]=sum(alist)/len(alist)
    # print(flow_result)
    with open('./static/data/Result/little_road_bus_velocity_health.json', 'w') as f:
        json.dump(velocity_result, f)
    with open('./static/data/Result/little_road_velocity_health.json', "r", encoding="utf-8") as f:
        social_car_velocity = json.load(f)
    # 计算客车平均速度与社会车辆平均速度占比
    for r_index,r_velocity in enumerate(velocity_result):
        for hour_index,hour_velocity in enumerate(r_velocity):
            social_speed=social_car_velocity[r_index][hour_index]
            if social_speed!=0:
                velocity_propotion[r_index][hour_index]=hour_velocity/social_speed
    with open('./static/data/Result/little_road_bus_propotion_health.json', 'w') as f:
        json.dump(velocity_propotion, f)    

# 获取中车道的车流量（24小时）
def middle_road_flow():
    # 获取多边形坐标数据
    file_path1 = './static/data/BoundryRoads/polygons_people.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        road_polygons = json.load(f)
    # 时间段时长和数量
    segment_duration = datetime.timedelta(minutes=60)  # 时间段时长为5分钟
    flow_result=[[0 for _ in range(8)] for _ in range(24)]
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
            previous_segment_index=-1
            previous_index=-1
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
                            # 将时间戳转换为日期时间
                            dt = datetime.datetime.fromtimestamp(item['time_meas'] / 1000000)
                            time_diff = dt - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳的时间差
                            segment_index = int(time_diff.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
                            if segment_index>23:
                                segment_index=23
                            if segment_index!=previous_segment_index or previous_index!=index:
                                flow_result[segment_index][index]+=1
                                previous_segment_index=segment_index
                                previous_index=index
                            break    
                        
    flow_path = './static/data/Result/middle_road_flow.json'
    with open(flow_path, 'w') as f:
        json.dump(flow_result, f) 
    print(flow_result) 

# 计算每五分钟的人行道流量
def people_flow():
    # 时间段时长和数量
    segment_duration = datetime.timedelta(minutes=5)  # 时间段时长为5分钟
    num_segments = 288  # 时间段数量
    # 初始化时间段数据
    segment_data = [[0 for _ in range(7)] for _ in range(num_segments)]  # 使用列表存储每个时间段的数据
    # 获取人行道坐标数据
    file_path = './static/data/BoundryRoads/crosswalkroad.json'
    with open(file_path, "r", encoding="utf-8") as f:
        crosswalkRoad = json.load(f)
    pair_dict={'0':4,'1':0,'2':3,'3':2,'4':1,'5':5,'6':6}    
    folder_path = './static/data/DataProcess/2'
    # 获取文件夹中的所有文件
    file_list = os.listdir(folder_path)
    # 遍历文件列表，筛选出JSON文件并读取
    for file_name in file_list:
        file_path = os.path.join(folder_path, file_name)
        with open(file_path, 'r') as f:
            data = json.load(f)
        previous_index=-1
        previous_road=-1
        for item in data:
            if item['is_moving']==1:
                pos = json.loads(item['position'])
                arr = []
                arr.append(pos['x'])
                arr.append(pos['y'])
                # 创建Point对象
                point = Point(arr)
                # 判断行人轨迹点是否位于人行道内
                for index,road in enumerate(crosswalkRoad):
                    if Polygon(road).contains(point) or Polygon(road).touches(point):
                        # 将时间戳转换为日期时间
                        dt = datetime.datetime.fromtimestamp(item['time_meas'] / 1000000)
                        time_diff = dt - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳的时间差
                        segment_index = int(time_diff.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
                        if segment_index>287:
                            segment_index=287
                        # 当时间段索引改变或者行人走到不同的人行道时，就计入一次流量
                        if previous_index!=segment_index or previous_road!=index:
                            segment_data[segment_index][pair_dict[str(index)]]+=1
                            previous_index=segment_index
                            previous_road=index
                            
    with open('./static/data/Result/people_flow.json', 'w') as f:
        json.dump(segment_data, f)

# 计算每五分钟的人行道平均速度
def people_velocity():
    # 时间段时长和数量
    segment_duration = datetime.timedelta(minutes=5)  # 时间段时长为5分钟
    num_segments = 288  # 时间段数量
    # 初始化时间段数据
    segment_data = [[0 for _ in range(7)] for _ in range(num_segments)]  # 使用列表存储每个时间段的数据
    # 获取人行道坐标数据
    file_path = './static/data/BoundryRoads/crosswalkroad.json'
    with open(file_path, "r", encoding="utf-8") as f:
        crosswalkRoad = json.load(f)
    pair_dict={'0':4,'1':0,'2':3,'3':2,'4':1,'5':5,'6':6}  
    # 保存每条人行道的每个时间段内的行人行走速度
    speed_list=[[[] for _ in range(7)] for _ in range(num_segments)]    
    folder_path = './static/data/DataProcess/2'
    # 获取文件夹中的所有文件
    file_list = os.listdir(folder_path)
    # 遍历文件列表，筛选出JSON文件并读取
    for file_name in file_list:
        file_path = os.path.join(folder_path, file_name)
        with open(file_path, 'r') as f:
            data = json.load(f)
        for item in data:
            if item['is_moving']==1:
                pos = json.loads(item['position'])
                arr = []
                arr.append(pos['x'])
                arr.append(pos['y'])
                # 创建Point对象
                point = Point(arr)
                for index,road in enumerate(crosswalkRoad):
                    if Polygon(road).contains(point) or Polygon(road).touches(point):
                        # 将时间戳转换为日期时间
                        dt = datetime.datetime.fromtimestamp(item['time_meas'] / 1000000)
                        time_diff = dt - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳的时间差
                        segment_index = int(time_diff.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
                        if segment_index>287:
                            segment_index=287
                        # 将原始速度数据放入对应的列表位置内
                        speed_list[segment_index][pair_dict[str(index)]].append(item['velocity'])
    for index1,item1 in enumerate(speed_list):
        for index2,item2 in enumerate(item1):
            if item2:
                # 计算每条人行道的每个时间段的平均行人速度
                segment_data[index1][index2]=sum(item2)/len(item2)                       
    with open('./static/data/Result/people_velocity.json', 'w') as f:
        json.dump(segment_data, f)

# 计算每五分钟的人行道对应的高价值场景数量
def crosswalkroad_high_value():
    # 时间段时长和数量
    segment_duration = datetime.timedelta(minutes=5)  # 时间段时长为5分钟
    num_segments = 288  # 时间段数量
    segment_data = [[0 for _ in range(7)] for _ in range(num_segments)]
    # 获取所有高价值数据
    file_path = './static/data/Result/new_decomposition_data.json'
    with open(file_path, "r", encoding="utf-8") as f:
        decomposition = json.load(f)
    #遍历对应的高价值数组 
    for item in decomposition[4]:
        # 将时间戳转换为日期时间
        dt1 = datetime.datetime.fromtimestamp(item['start_time'] / 1000000)
        dt2 = datetime.datetime.fromtimestamp(item['end_time'] / 1000000)
        time_diff1 = dt1 - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳与当天零点之间的时间差
        segment_index1 = int(time_diff1.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
        if segment_index1>287:
            segment_index1=287
        time_diff2 = dt2 - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳与当天零点之间的时间差
        segment_index2 = int(time_diff2.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
        if segment_index2>287:
            segment_index2=287
        for i in range(segment_index1,segment_index2+1):
            # 只计算路口的人行道对应的高价值场景数据
            if item['road'] in [0,1]:
                segment_data[i][0]+=1
            if item['road'] in [2,3]:
                segment_data[i][1]+=1
            if item['road'] in [4,5]:
                segment_data[i][2]+=1
            if item['road'] in [6,7]:
                segment_data[i][3]+=1
    with open('./static/data/Result/crosswalkroad_high_value.json', 'w') as f:
        json.dump(segment_data, f)

def getLightData():
    f = open("./static/data/ChinaVis Data/road10map/laneroad10.geojson", "r")
    laneData = json.load(f)
    useData = {}
    useLaneData = {}

    # 获取所有车道的fid, 判断车道是否为同一个
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
                # 获取车道的所有点，判断不同车道是否又交点
                if(abs(k[0] - useCoord[0][0]) < 0.1 and abs(k[1] - useCoord[0][1]) < 0.1):
                    lineStart.append(j["properties"]["fid"])
                    isOne = True
                if(abs(k[0] - useCoord[-1][0]) < 0.1 and abs(k[1] - useCoord[-1][1]) < 0.1):
                    lineEnd.append(j["properties"]["fid"])
                    isOne = True
            if(isOne):
                useData[i["properties"]["fid"]].append(j["properties"]["fid"])
    
    # 获取同一个车道的所有点信息，并整合到一起
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

    # 将该信息存储进line.json文件
    f = open("./static/data/DataProcess/line.json", "w")
    json.dump(useData, f)

    # 五条车道的fid，分别进行判断
    twoLine = [1898, 1910, 1936, 1957, 1975]
    laneAll = {}
    for i in useData:
        if(len(useData[i]) == 0):
            continue
        oneLineData = []
        # 判断当前车道是否为两车道，如果是，则将该两条车道分开
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
    # 按照车道上下左右和方向进行分类
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
        # 判断当前道路的方向(位置信息和车道方向统一)
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

    # 存储所有车道的所有数据，以及相关节点
    f = open("./static/data/DataProcess/laneAll.json", "w")
    json.dump(useLane, f)

    # 获取每个车道的左右边界
    f = open("./static/data/ChinaVis Data/road10map/boundaryroad10.geojson", "r")
    boundary = json.load(f)
    boundaryData = {}
    for i in boundary["features"]:
        boundaryData[i["properties"]["fid"]] = i

    polygonList = {}
    allData = {}
    # 是固体部分shapely将每一个车道做成一个包围盒（左右车道由于方向相同，所有其中一个数据需要翻转）
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
    # 读取所有数据，并判断每一个点所在的车道信息
    for i in range(10):
    # 创建文件夹./static/data/ChinaVis Data文件夹，里面放入ChinaVis数据和./static/data/DataProcess/文件夹
        f = open("./static/data/ChinaVis Data/part" + str(i) +
                    ".json", "r", encoding="utf-8")
        data = f.read().split("\n")
        # 按照id将数据分组
        with alive_bar(len(data)) as bar:
            for j in data:
                try:
                    nowData = json.loads(j)
                    nowPosition = json.loads(nowData["position"])
                    nowData = json.loads(j)
                    # 获取当前时间（时分秒）
                    nowTime = float(nowData["time_meas"]) / 1000000
                    # nowTime = time.localtime(nowTime)
                    # nowTime = time.strftime("%Y-%m-%d %H:%M:%S", nowTime)
                    allTime[nowTime] = {}
                    # 判断车所在车道
                    for k in polygonList:
                        if(polygonList[k].contains(Point(nowPosition["x"], nowPosition["y"]))):
                            if(nowTime not in allData[k]):
                                allData[k][nowTime] = []
                            allData[k][nowTime].append(nowData)
                            break
                except:
                    print(j)
                bar()
    # 按照车道信息进行存储
    for i in allData:
        f = open("./static/data/DataProcess/part" + str(i) + ".json", "w")
        json.dump(allData[i], f)

    # #获取每一个车道所有时刻距离3米以内的车辆的启动信息，以判断红绿灯颜色（数据缺少，无法判断）
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



#对高价值场景按csv文件进行存放
def forHighValue():
    file = '../back/static/data/DataProcess/highSceneData/decomposition_data.json'
    with open(file, 'r') as f:
        data = json.load(f)
    file_name = ['carCross','longTime','noMotorCross','overSpeeding','peopleCross','reverse','speedDown','speedUp']
    # 为每个列表创建一个DataFrame，并将其保存为csv文件
    for i, list_data in enumerate(data):
        df = pd.DataFrame(list_data)
        if "start_time" in df.columns:
            df = df.sort_values(by="start_time")
        df.to_csv(f'../back/static/data/DataProcess/highSceneCsv/{file_name[i]}.csv', index=False, encoding='utf-8')

#赋予各交通参与者roadId信息
def addRoadId():
    # 获取所有JSON文件的列表
    file_list = os.listdir('../back/static/data/DataProcess/laneData')
    file = '../back/static/data/DataProcess/laneData/'
   # 创建一个空的DataFrame
    with alive_bar(len(file_list), title='Processing') as bar:
        df = pd.DataFrame()
        for name in file_list:
            file_path = os.path.join(file, name)
            with open(file_path, 'r') as f:
                json_data = json.load(f)
                # 遍历JSON数据中的每个时间戳
                for timestamp, records in json_data.items():
                    for record in records:
                        record['roadId'] = name.split('.')[0]
                    temp_df = pd.DataFrame(records)
                    df = df.append(temp_df, ignore_index=True)

            bar()  # 更新进度条
            time.sleep(0.1)  # 模拟每次迭代的时间延迟
    # 将DataFrame按照id进行分组，并将每个分组写入单独的CSV文件
    grouped = df.groupby('id')
    with alive_bar(len(grouped), title='Writing Files') as bar:
        for group_id, group_data in grouped:
            group_data.to_csv(f'../back/static/data/DataProcess/addRoadId/{group_id}.csv', index=False)

            bar()  # 更新进度条
            time.sleep(0.1)  # 模拟每次迭代的时间延迟

#群体性驾驶行为变化趋势分析
#统计特征提取
def featureExtraction(startTime,nameTime):
    # startTime = 1681315196
    pathList = []
    #每5分钟交通参与者提取
    for i in range(0,300):
        fileName = str(i+startTime)+'.0.json'
        pathList.append(fileName)
    res = {}
    for path in pathList:
        with open('../back/static/data\DataProcess/time_meas/'+path,'r') as f:
            data = json.load(f)
            # 遍历数据，根据id进行分组
            for item in data:
                if item['type'] == 1 or item['type'] == 4 or item['type'] == 6 :  
                    id = item.get('id')  
                    if id not in res:
                        res[id] = []
                    res[id].append(item)
    newRes = {}
    # 提取速度、坐标位置、车头朝向，每0.2s一次，总计5分钟
    for id in res:
        positionList = []
        vList = []
        oList = []
        newRes[id]={}
        for item in res[id]:
            vList.append(item["velocity"])
            oList.append(item["orientation"])
            positionList.append(item["position"])
        newRes[id]["position"] = positionList
        newRes[id]["v"] = vList
        newRes[id]["o"] = oList
        newRes[id]["type"] = res[id][0]["type"]
    #提取加速度
    for id in newRes:
        aList = []
        idL = len(newRes[id]["v"])
        lastIndex = math.ceil(idL/5)
        for i in range(0,lastIndex):
            if i != lastIndex-1:
                aList.append(newRes[id]["v"][(i+1)*5-1]-newRes[id]["v"][i*5])
        newRes[id]["a"] = aList
    #统计特征提取
    for id in newRes:
        #平均速度
        newRes[id]["v_mean"] = np.mean(newRes[id]["v"])
        #最大速度
        newRes[id]["v_max"] = np.max(newRes[id]["v"])
        #最小速度
        newRes[id]["v_min"] = np.min(newRes[id]["v"])
        # #速度标准差
        # newRes[id]["v_std"] = np.std(newRes[id]["v"])
        # #加速度标准差
        # newRes[id]["a_std"] = np.std(newRes[id]["a"])
        # #朝向标准差
        newRes[id]["o_std"] = np.std(newRes[id]["o"])
        newRes[id]["a_mean"] = np.mean(newRes[id]["a"])
        #位置聚集程度：1.求各个坐标的几何中心 2.求各个坐标到几何中心的距离 3.求距离的平均值
        xList = []
        yList = []
        for position in newRes[id]["position"]:
            position = json.loads(position)
            xList.append(position["x"])
            yList.append(position["y"])
        x_mean = np.mean(xList)
        y_mean = np.mean(yList)
        distanceList = []
        for i in range(0,len(xList)):
            distanceList.append(math.sqrt((xList[i]-x_mean)**2+(yList[i]-y_mean)**2))
        newRes[id]["distance_mean"] = np.mean(distanceList)
    #将newRes写入csv文件
    with open("../back\static\data\DataProcess/5m/originFeature/"+str(nameTime)+"s.csv","w") as f:
        writer = csv.writer(f)
        writer.writerow(["id","type","v_mean","v_max","v_min","a_mean"])
        for id in newRes:
            writer.writerow([id,newRes[id]["type"],newRes[id]["v_mean"],newRes[id]["v_max"],newRes[id]["v_min"],newRes[id]["a_mean"]])
#对time_meas文件夹下的所有文件每300个文件进行特征提取
def featureAll():
    file_list = os.listdir('../back/static/data\DataProcess/time_meas')
    file_count = len(file_list)
    startTime = 1681315196
    nameTime = 300
    with alive_bar(len(file_list),title="Processing") as bar:
        for i in range(0,math.ceil(file_count/300)):
            featureExtraction(startTime,nameTime)
            startTime += 300
            nameTime += 300
        bar()
        time.sleep(0.1)

#对提取的特征做归一化处理
def csvNormalization():
    file_list = os.listdir('../back/static/data\DataProcess/5m/feature_extraction')
    for file in file_list:
        df = pd.read_csv('../back/static/data\DataProcess/5m/feature_extraction/' + file)
        id_type_cols = df[['id', 'type']]  # 保留'id'和'type'列
        df_numeric = df.select_dtypes(include=[float, int])  # 选择数值型列并排除'id'和'type'
        scaler = MinMaxScaler()
        df_normalized = pd.DataFrame(scaler.fit_transform(df_numeric), columns=df_numeric.columns)
        df_normalized[['id', 'type']] = id_type_cols  # 将保留的'id'和'type'列重新添加到归一化后的DataFrame
        df_normalized.to_csv('../back/static/data\DataProcess/5m/feature_extraction_nor/' + file, index=False)

#对三个速度进行降维
def dimReduction():
    file_list = os.listdir('../back/static/data\DataProcess/5m/feature_extraction_nor')
    for file in file_list:
        df = pd.read_csv('../back/static/data\DataProcess/5m/feature_extraction_nor/' + file)
        features = df[['v_min', 'v_max', 'v_mean']]
        pca = PCA(n_components=1)
        principalComponents = pca.fit_transform(features)
        # 将降维后的主成分添加到原始数据框中，此处我们将新的主成分列命名为'v_pca'
        df['v_pca'] = principalComponents
        df = df.drop(['v_min', 'v_max', 'v_mean'], axis=1)
        df.to_csv('../back/static/data\DataProcess/5m/feature_extraction_dim/' + file +'.csv', index=False)

#对三个速度进行降维
def dimReduction_no():
    file_list = os.listdir('../back/static/data\DataProcess/5m/feature_extraction')
    start = 300
    for file in file_list:
        df = pd.read_csv('../back/static/data\DataProcess/5m/feature_extraction/' + file)
        features = df[['v_min', 'v_max', 'v_mean']]
        pca = PCA(n_components=1)
        principalComponents = pca.fit_transform(features)
        # 将降维后的主成分添加到原始数据框中，此处我们将新的主成分列命名为'v_pca'
        df['v_pca'] = principalComponents
        df = df.drop(['v_min', 'v_max', 'v_mean'], axis=1)
        df.to_csv('../back/static/data\DataProcess/5m/feature_dim/' + str(start)+'s.csv' , index=False)
        start+=300

#对csv文件中的缺值进行填充
def fillNan():
    file_list = os.listdir('../back/static/data\DataProcess/5m/feature_extraction_dim')
    for file in file_list:
        df = pd.read_csv('../back/static/data\DataProcess/5m/feature_extraction_dim/' + file)
        # 填充缺失值，此处使用均值进行填充
        imputer = SimpleImputer(strategy='constant', fill_value=0)
        df_imputed = pd.DataFrame(imputer.fit_transform(df), columns=df.columns)
        df_imputed.to_csv('../back/static/data\DataProcess/10m/feature_extraction_dim/' + file, index=False)
        print(111)
#对归一化后的特征实现k-means聚类
def kmeans():
    file_list = os.listdir('../back/static/data\DataProcess/5m/feature_extraction_dim')
    nameTime = 300
    with alive_bar(len(file_list),title="Processing") as bar:
        for file in file_list:
            df = pd.read_csv('../back/static/data\DataProcess/5m/feature_extraction_dim/' + file)
            row_count = len(df)
            print(row_count)
            # 小于两行，跳出当前循环
            if row_count < 3:
                df.to_csv('../back/static/data\DataProcess/5m/cluster_results/'+ str(nameTime) +'s.csv', index=False)
                nameTime += 300
                print('跳出循环')
                continue;
            df.drop(['v_std'],axis=1,inplace=True)
            df.dropna(inplace=True)
            features = df[['v_pca', 'a_std', 'o_std', 'distance_mean']]
            kmeans = KMeans(n_clusters=3)
            kmeans.fit(features)
            df['cluster'] = kmeans.labels_
            df.to_csv('../back/static/data\DataProcess/5m/cluster_results/'+ str(nameTime) +'s.csv', index=False)
            nameTime += 300
        bar()
        time.sleep(0.1)

#对归一化后的特征实现DBSCAN聚类
def forDbscan():
    file_list = os.listdir('../back/static/data\DataProcess/feature_extraction_dim')
    nameTime = 0.5
    for file in file_list:
        df = pd.read_csv('../back/static/data\DataProcess/feature_extraction_dim/' + file)
        features = df[['v_pca', 'v_std', 'a_std', 'o_std', 'distance_mean']]
        # DBSCAN聚类
        dbscan = DBSCAN(eps=0.5, min_samples=5)
        df['cluster'] = dbscan.fit_predict(features)
        df.to_csv('../back/static/data\DataProcess/cluster_results_dbscan/'+ str(nameTime) +'h.csv', index=False)
        nameTime += 0.5

#对聚类结果进行降维
def dimReduction_cluster():
    file_list = os.listdir('../back/static/data\DataProcess/5m/feature_extraction_dim')
    startR = 300
    for file in file_list:
        data = pd.read_csv('../back/static/data/DataProcess/5m/feature_extraction_dim/'+ file)
        row_count = len(data)
        print(data)
            # 小于两行，跳出当前循环
        if row_count < 3:
            data .to_csv('../back/static/data\DataProcess/5m/clusterAll/'+ str(startR) +'s.csv', index=False)
            startR += 300
            print('跳出循环')
            continue;
        features = data[['v_pca', 'a_std', 'o_std', 'distance_mean']]
        pca = PCA(n_components=2)
        reduced_features = pca.fit_transform(features)
        reduced_data = pd.DataFrame(data=reduced_features, columns=['x', 'y'])
        reduced_data['cluster'] = data['cluster_label']
        reduced_data['type'] = data['type']
        reduced_data['id'] = data['id']
        reduced_data["o_std"] =data["o_std"]
        reduced_data["distance_mean"] =data["distance_mean"]
        reduced_data["a_std"] =data["a_std"]
    # 保存降维结果到新的CSV文件
        reduced_data.to_csv('../back/static/data\DataProcess/5m/clusterAll/'+ str(startR) +'s.csv', index=False)
        startR += 300
    # 绘制降维结果的散点图
        # plt.scatter(reduced_data['x'], reduced_data['y'], c=reduced_data['cluster'])
        # plt.xlabel('x')
        # plt.ylabel('y')
        # plt.title('K-means Clustering Result')
        # plt.show()


def read_json(file_name):
    with open(file_name, 'r') as f:
        data = json.load(f)
    return data

def write_to_csv(data, folder, file_name):
    df = pd.DataFrame(data)
    df.sort_values(by='time_meas', inplace=True)
    folder_path = f'../back/static/data\DataProcess/idRoadCsv/{folder}'
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    df.to_csv(f'{folder_path}/{file_name}.csv', index=False)

# 对添加了道路id数据按照交通参与者id进行分类
def newDataType():
    file_prefix = '../back/static/data\DataProcess/idRoad/part'
    num_files = 10
    all_data = {}
    # Processing the JSON files
    with alive_bar(num_files) as bar:
        for i in range(num_files):
            file_name = f'{file_prefix}{i}.json'
            data = read_json(file_name)
            for k, v in data.items():
                if v['type'] in all_data:
                    if v['id'] in all_data[v['type']]:
                        all_data[v['type']][v['id']].append(v)
                    else:
                        all_data[v['type']][v['id']] = [v]
                else:
                    all_data[v['type']] = {v['id']: [v]}
            bar()

    # Writing the data to CSV files
    with alive_bar(len(all_data)) as bar:
        for k, v in all_data.items():
            for id, data in v.items():
                write_to_csv(data, k, id)
            bar()

#合并聚类结果
def mergeCluster():
    # 指定两个目录
    dir1 = '../back/static/data\DataProcess/5m/pca_results/'
    dir2 = '../back/static/data\DataProcess/5m/feature_dim/'

# 获取目录下的所有文件名
    filenames = os.listdir(dir1) # 假设两个目录中的文件数量和名称都是一样的

# 对每个文件进行处理
    for filename in filenames:
    # 拼接完整的文件路径
        file1 = os.path.join(dir1, filename)
        file2 = os.path.join(dir2, filename)

    # 读取csv文件
        df1 = pd.read_csv(file1)
        df2 = pd.read_csv(file2)

    # 合并数据
        df = pd.merge(df1, df2, how='outer', on=['id', 'type'])
        if 'cluster' in df.columns:
            df = df.dropna(subset=['cluster'])
            df['cluster'] = df['cluster'].astype(int)

    # 保存合并后的数据到新的csv文件
        output_filename = os.path.join('../back/static/data\DataProcess/5m/merge', filename)
        df.to_csv(output_filename, index=False)

#处理flid
def processFid():
    folder_path = '../back/static/data\DataProcess/idRoadCsv/3/'
    for filename in os.listdir(folder_path):
        if filename.endswith('.csv'):
            file_path = os.path.join(folder_path, filename)
            df = pd.read_csv(file_path)
        
        # 检查是否存在'lineFid'列
            if 'lineFid' in df.columns:
            # 将'lineFid'列中的数值转换为字符串
                df['lineFid'] = df['lineFid'].astype(str)

            # 去掉字符串中的".0"
                df['lineFid'] = df['lineFid'].apply(lambda x: x.rstrip('.0') if '.0' in x else x)

            # 将修改后的数据写回文件
                df.to_csv(file_path, index=False)

#将预测数据处理成整点数据
def forecastToInt():
    df = pd.read_csv("../back/static/data/DataProcess/flowForecast/countpre0607.csv")
    # 处理timestamp列，使其变为最接近的整点时刻
# 处理timestamp列，将其转换为最接近的整点时刻
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['timestamp'] = df['timestamp'].dt.round('H')
# 将timestamp列转换为10位时间戳
    df['timestamp'] = df['timestamp'].apply(lambda x: int(time.mktime(x.timetuple())))
    df.to_csv('../back/static/data/DataProcess/flowForecast/new_file0607.csv', index=False)


def getDriveReserve():
    laneAll = open("./static/data/DataProcess/laneAll.json", "r")
    laneAll = json.load(laneAll)
    for i in laneAll:
        for j in laneAll[i]:
            for k in laneAll[i][j]:
                driveReserve = {}
                nowDataStart = laneAll[i][j][k][0]["geometry"]["coordinates"][0]
                nowDataEnd = laneAll[i][j][k][-1]["geometry"]["coordinates"][-1]
                slope = (nowDataEnd[1] - nowDataStart[1] )/ (nowDataEnd[0] -nowDataStart[0])
                useLaneData = open("./static/data/DataProcess/laneData/part" + str(k) +".json", "r")
                useLaneData = json.load(useLaneData)
                radin = math.atan(slope)
                if(nowDataEnd[1] < nowDataStart[1]):
                    radin = radin - math.pi
                # 当前方向左右各加90度是正向范围
                if(radin < math.pi / 2 and radin > -math.pi / 2):
                    radinS = radin - math.pi / 2
                    radinE = radin + math.pi / 2
                    for l in useLaneData:
                        driveReserve[l] = {}
                        for m in useLaneData[l]:
                            if(useLaneData[l][m]["heading"] < radinS or useLaneData[l][m]["heading"] > radinE):
                                driveReserve[l][m] = useLaneData[l][m]
                elif(radin < -math.pi / 2):
                    radinS = radin + math.pi / 2 * 3
                    radinE = radin + math.pi / 2
                    for l in useLaneData:
                        driveReserve[l] = {}
                        for m in useLaneData[l]:
                            if(useLaneData[l][m]["heading"] < radinS  and useLaneData[l][m]["heading"] > radinE):
                                driveReserve[l][m] = useLaneData[l][m]
                elif(radin > math.pi / 2):
                    radinS = radin - math.pi / 2
                    radinE = radin - math.pi / 2 * 3
                    for l in useLaneData:
                        driveReserve[l] = {}
                        for m in useLaneData[l]:
                            if(useLaneData[l][m]["heading"] < radinS  and useLaneData[l][m]["heading"] > radinE):
                                driveReserve[l][m] = useLaneData[l][m]
                reverseF =  open("./static/data/DataProcess/reverse/reverse"+str(k)+'.json', "w")
                json.dump(driveReserve, reverseF)

# 获取样本之间的相似度
def getSimilarity():
    # 获取文件夹下所有的csv文件
    folder_path = './static/data/DataProcess/5m/merge'  
    csv_files = [f for f in os.listdir(folder_path) if f.endswith('.csv')]
    new_path  = './static/data/DataProcess/5m/similaryity'
    with alive_bar(len(csv_files), title='Processing files') as bar:
        for file in csv_files:
            file_path = os.path.join(folder_path, file)
            df = pd.read_csv(file_path)        
        # 检查是否包含所需的列
            required_columns = ['x', 'y', 'cluster', 'type', 'id', 'v_std', 'a_std', 'o_std', 'distance_mean', 'v_pca']
            if not all(column in df.columns for column in required_columns):
                print(f"Skipping file {file} as it does not contain all required columns.")
                bar()
                continue
        # Z-Score归一化
            scaler = StandardScaler()
            df[['v_std', 'a_std', 'o_std', 'distance_mean', 'v_pca']] = scaler.fit_transform(df[['v_std', 'a_std', 'o_std', 'distance_mean', 'v_pca']])
        # 计算余弦相似度
            similarity = cosine_similarity(df[['v_std', 'a_std', 'o_std', 'distance_mean', 'v_pca']])
        # 创建一个新的DataFrame来存储相似度，id和cluster
            similarity_df = pd.DataFrame(similarity)
            similarity_df.columns = df['id'].tolist()
            similarity_df.index = df['id'].tolist()
            similarity_df = similarity_df.reset_index().melt(id_vars='index', var_name='id2', value_name='similarity')
            similarity_df.columns = ['id1', 'id2', 'similarity']
        # 将cluster信息添加到新的DataFrame
            cluster_dict = df.set_index('id')['cluster'].to_dict()
            similarity_df['cluster1'] = similarity_df['id1'].map(cluster_dict)
            similarity_df['cluster2'] = similarity_df['id2'].map(cluster_dict)
        # 将相似度写入新的csv文件
            similarity_df.to_csv(os.path.join(new_path, f'{file}'), index=False)
        bar()

#读取reverse文件中的非空数据：
def getReverseData():
    input_directory = './static/data/DataProcess/reverse'
    output_directory = './static/data/DataProcess/newReverse'
    for filename in os.listdir(input_directory):
        if filename.endswith('.json'):  
            with open(os.path.join(input_directory, filename), 'r') as f:  
                json_data = json.load(f)  
                non_empty_data = {key: value for key, value in json_data.items() if value}  
                new_filename = filename.rsplit('.', 1)[0] + '_non_empty.json' 
                with open(os.path.join(output_directory, new_filename), 'w') as nf: 
                    json.dump(non_empty_data, nf)  

# 获取高价值场景次数
def getHighSceneCount():
    # 初始化一个空的DataFrame来存储结果
    result_df = pd.DataFrame(columns=['id', 'type', 'hvCount'])
# 遍历文件夹下的所有csv文件
    for filename in os.listdir('./static/data/DataProcess/highSceneCsv'):
        if filename.endswith('.csv'):
        # 读取csv文件
            df = pd.read_csv('./static/data/DataProcess/highSceneCsv/'+filename)
        # 只保留type为1, 4, 6的行
            df = df[df['type'].isin([1, 4, 6])]
        # 计算每个id的出现次数
            df['hvCount'] = df.groupby('id')['id'].transform('count')
                    # 只保留'id', 'type', 'hvCount'三列
            df = df[['id', 'type', 'hvCount']]
        # 将结果添加到总的结果DataFrame中
            result_df = pd.concat([result_df, df])
# 删除重复的行
    result_df = result_df.drop_duplicates()
# 将结果写入新的csv文件
    result_df.to_csv('./static/data/DataProcess/5m/hvCount.csv', index=False)

# 对逆行数据进行清洗，删除type为-1的
def cleanReverseData():
    folder_path = './static/data/DataProcess/newReverse'  
    for filename in os.listdir(folder_path):
        if filename.endswith('.json'):
            file_path = os.path.join(folder_path, filename)     
            with open(file_path, 'r') as file:
                data = json.load(file) 
            for key in list(data.keys()):
                for subkey in list(data[key].keys()):
                    if data[key][subkey]['type'] == -1:
                        del data[key][subkey]
            with open(file_path, 'w') as file:
                json.dump(data, file, indent=4)

#合并高价值场景次数和聚类结果
def mergeHV():
    folder_path = './static/data/DataProcess/5m/mergeHV'
    merge_file_path = './static/data/DataProcess/5m/hvCount.csv'
    merge_df = pd.read_csv(merge_file_path)
# 遍历文件夹下的所有csv文件
    for filename in os.listdir(folder_path):
        if filename.endswith('.csv'):
            file_path = os.path.join(folder_path, filename)
            df = pd.read_csv(file_path)
        # 检查是否包含所有必要的列
            required_columns = ['x', 'y', 'cluster', 'type', 'id', 'v_std', 'a_std', 'o_std', 'distance_mean', 'v_pca']
            if not all(column in df.columns for column in required_columns):
                continue
        # 合并csv文件
            df = pd.merge(df, merge_df, on=['id', 'type'], how='left')
        # 检查hvCount列，若为空值则补充为0
            df['hvCount'] = df['hvCount'].fillna(0)
        # 保存合并后的csv文件
            df.to_csv(file_path, index=False)
# 合并hvCount中的相同id
def mergeHVCount():
    df = pd.read_csv('./static/data/DataProcess/5m/hvCount.csv')
    df = df.groupby(['id', 'type'], as_index=False)['hvCount'].sum()  
    duplicate_ids = df[df.duplicated('id')]['id']
    if not duplicate_ids.empty:
        print('以下id在不同的type中存在：')
        print(duplicate_ids.unique())
    else:
        print('没有发现在不同type中存在的相同id。')
    df.to_csv('./static/data/DataProcess/5m/hvCount.csv', index=False)

# 对相似度数据进行排序：
def sortSimilarity():
    file_path='./static/data/DataProcess/5m/similaryityHv/'
    with alive_bar(len(os.listdir(file_path)), title='Processing files') as bar:
        for filename in os.listdir(file_path):
            path = os.path.join(file_path, filename)
            df = pd.read_csv(path,error_bad_lines=False)
        # 创建一个空的DataFrame用于存储结果
     # 获取所有不同的id1并根据cluster1排序
            id_sort = df.sort_values('cluster1')['id1'].unique().tolist()
# 创建一个空的二维列表来存储similarity值
            similarity_list = [[0]*len(id_sort) for _ in range(len(id_sort))]
# 遍历排序后的id列表，计算每个id与列表中每个id的similarity值
            for i in range(len(id_sort)):
                for j in range(len(id_sort)):
                    if i == j:
                        similarity_list[i][j] = 1  # 一个id与自己的similarity值为1
                    else:
            # 查找两个id的similarity值
                        similarity_value = df[(df['id1'] == id_sort[i]) & (df['id2'] == id_sort[j])]['similarity']
                        if not similarity_value.empty:
                            similarity_list[i][j] = similarity_value.values[0]
                        else:
                            similarity_list[i][j] = 0  # 如果没有找到similarity值，则设为0
            with open('./static/data/DataProcess/5m/similaryityHvJson/'+ filename.split('.')[0] +'.json', 'w') as f:
                json.dump({"idSort": id_sort, "similarityList": similarity_list}, f)
            bar()
#将相似度数据处理为对称的形式：
def proSim():
    file_path='./static/data/DataProcess/5m/similaryity'
    new_path='./static/data/DataProcess/5m/testS/'
    with alive_bar(len(os.listdir(file_path)), title='Processing files') as bar:
        for filename in os.listdir(file_path):
            path = os.path.join(file_path,filename)
            df = pd.read_csv(path)
            unique_ids = np.unique(np.concatenate([df['id1'].unique(), df['id2'].unique()]))
            matrix_df = pd.DataFrame(index=unique_ids, columns=unique_ids)
            for index, row in df.iterrows():
                matrix_df.loc[row['id1'], row['id2']] = row['similarity']
            matrix_df.to_csv(new_path+filename, index=True)
            bar()

def getSingleFlow():
        file_path = './static/data/DataProcess/laneData/part1972.json'
        df = pd.DataFrame(columns=["roadid", "timestamp", "true"])
    # for filename in os.listdir(file_path):
        with open(file_path,"r")as f:
            data = json.load(f)
        new_data = defaultdict(list)
        earliest_time = min(datetime.strptime(key, "%Y-%m-%d %H:%M:%S") for key in data.keys())
        current_hour = earliest_time
        for time, records in sorted(data.items()):
            time_as_datetime = datetime.strptime(time, "%Y-%m-%d %H:%M:%S")
            if time_as_datetime < current_hour + timedelta(hours=1):
                new_data[current_hour.strftime("%Y-%m-%d %H:%M:%S")].extend(records)
            else:
                current_hour += timedelta(hours=1)
                new_data[current_hour.strftime("%Y-%m-%d %H:%M:%S")].extend(records)
        for timestamp, records in new_data.items():
            ids = set()
            count = 0
            for record in records:
                if record["type"] in [1, 3, 4, 6, 10] and record["id"] not in ids:
                    count += 1
                    ids.add(record["id"])
            df = df.append({"roadid": "1972", "timestamp": timestamp, "true": count}, ignore_index=True)
        df.to_csv("./static/data/DataProcess/laneData/1972.csv", index=False)

    # res["data"] =data
    # return res 

#去除非机动车逆行数据中没有移动的数据
def noMoving():
    file_path='./static/data/DataProcess/reversePart'
    for filename in os.listdir(file_path):
        # 收集要删除的条目
        to_delete = []
        with open(file_path+'/'+filename,"r")as f:
            data = json.load(f)
        for key, value in data.items():
            for sub_key, sub_value in value.items():
        # 如果"is_moving"为0，则删除该条目
                if sub_value.get("is_moving") == 0:
                    to_delete.append((key, sub_key))
        # 删除收集到的条目
        for key, sub_key in to_delete:
            del data[key][sub_key]
        with open(file_path+'/'+filename, 'w') as file:
            json.dump(data, file)

#合并非机动车道逆行数据//合并json文件
def mergeReverse():
    folder_path = './static/data/DataProcess/oBus'
    merged_data = {}
# 遍历文件夹
    for filename in os.listdir(folder_path):
        if filename.endswith(".json"):
            file_path = os.path.join(folder_path, filename)
            with open(file_path) as file:
                data = json.load(file)
            # 合并键值对
                for key, value in data.items():
                    if key not in merged_data:
                        merged_data[key] = value
                    else:
                        merged_data[key].update(value)
# 按键名从小到大排序
    sorted_data = dict(sorted(merged_data.items(), key=lambda x: int(x[0])))
# 将数据写入新的JSON文件
    output_file = "./static/data/DataProcess/oBus/allOBus.json"
    with open(output_file, "w") as file:
        json.dump(sorted_data, file)


#合并5分钟内、id相同的数据
def mergeId():
    file = "./static/data/DataProcess/oBus/allOBus.json"
    with open(file,"r") as f :
        data = json.load(f)
    # 结果字典
    result = collections.defaultdict(list)
    # 初始时间戳
    initial_timestamp = 1681315196
   # 遍历数据
    for timestamp_str, entries in data.items():
    # 计算组别
        group = initial_timestamp + ((int(timestamp_str) - initial_timestamp) // 300) * 300
        for entry in entries.values():
            id_ = entry['id']
            type_ = entry['type']
            time_meas = entry['time_meas']
            velocity = entry['velocity']
            lineFid = entry['lineFid']
        # 忽略特定的 type
            if type_ in {-1, 2, 7}:
                continue;
        # 查找已经存在的条目
            for i, existing_entry in enumerate(result[str(group)]):
                if existing_entry['id'] == id_:
                    existing_entry['end_time'] = max(existing_entry['end_time'], time_meas)
                    existing_entry['start_time'] = min(existing_entry['start_time'], time_meas)
                    existing_entry['velocity'] = (existing_entry['velocity'] + velocity) / 2
                    break
            else:
            # 创建新条目
                result[str(group)].append({
                    'id': id_,
                    'type': type_,
                    'start_time': time_meas,
                    'end_time': time_meas,
                    'velocity': velocity,
                    'lineFid': lineFid
                })
# 保存结果
    with open('./static/data/DataProcess/oBus/mergeOBus.json', 'w') as f:
        json.dump(result, f)

#合并新雷达图数据
def mergeRadar():
    dir1 = './static/data/DataProcess/5m/clusterAll'
    dir2 = './static/data/DataProcess/5m/originFeature'
    for filename in os.listdir(dir1):
        if filename.endswith(".csv"):
            output_file = os.path.join('./static/data/DataProcess/5m/newMergeAll/', filename)
        try:
            file1 = os.path.join(dir1, filename)
            file2 = os.path.join(dir2, filename)
            df1 = pd.read_csv(file1)
            df2 = pd.read_csv(file2)
            necessary_columns_1 = ['x','y','cluster','type','id','o_std','a_std','distance_mean']
            necessary_columns_2 = ['id','type','v_mean','v_max','v_min','a_mean']
            if all(elem in df1.columns  for elem in necessary_columns_1) and all(elem in df2.columns  for elem in necessary_columns_2):
                df = pd.merge(df1, df2, on=['id', 'type'])
                df.to_csv(output_file, index=False)
            else:
                print(f"Skipping {file1} or {file2} due to missing columns.")
        except Exception as e:
            print(f"Error processing {file1} or {file2}: {e}")

# 查看逆行的数据
def readCsv():
    file ='./static/data/DataProcess/idRoadCsv/1/269658033.csv'
    df = pd.read_csv(file)
    column_data = df["orientation"].to_list()
    print(column_data)
# 查看-1文件夹下是否有同名数据
def validate():
    main_folder = './static/data/DataProcess/idRoadCsv'  # 替换为你的文件夹路径
    target_folder = os.path.join(main_folder, '-1')
# 获取所有文件名
    file_names = os.listdir(target_folder)
    with alive_bar(len(file_names), title='Processing files') as bar:
        for file_name in file_names:
            file_path = os.path.join(target_folder, file_name)
            for folder_name in os.listdir(main_folder):
                if folder_name != '-1':  # 排除目标文件夹本身
                    folder_path = os.path.join(main_folder, folder_name)
                    if os.path.exists(os.path.join(folder_path, file_name)):
                        print(f"文件 {file_name} 在文件夹 {folder_name} 中存在，目录为: {folder_path}")
            bar()

def jsonLen():
    with open("./static/data/DataProcess/allFault.json") as f:
        data = json.load(f)
    print(len(data))

def getDriveReserve():
    laneAll = open("./static/data/DataProcess/laneAll.json", "r")
    laneAll = json.load(laneAll)
    # 判断是否同号
    def same_sign(a, b):
        product = a * b
        if product >= 0:
            return True  # 同号
        else:
            return False  # 异号
    for i in laneAll:
        print(i)
        for j in laneAll[i]:
            print(j)
            for k in laneAll[i][j]:
                driveReserve = {}
                nowDataStart = laneAll[i][j][k][0]["geometry"]["coordinates"][0]
                nowDataEnd = laneAll[i][j][k][-1]["geometry"]["coordinates"][-1]
                slope = (nowDataEnd[1] - nowDataStart[1]) / \
                    (nowDataEnd[0] - nowDataStart[0])
                useLaneData = open(
                    "./static/data/DataProcess/part/part" + str(k) + ".json", "r")
                useLaneData = json.load(useLaneData)
                radin = math.atan(slope)
                if(nowDataEnd[1] < nowDataStart[1]):
                    radin = radin - math.pi
                with alive_bar(len(useLaneData), title='Processing files') as bar:
                    for l in useLaneData:
                        driveReserve[l] = {}
                        for m in useLaneData[l]:
                            if(same_sign(math.cos(useLaneData[l][m]["heading"]),math.cos(radin)) and abs(useLaneData[l][m]["heading"]-radin)>math.pi/2):
                                    driveReserve[l][m] = useLaneData[l][m]
                        bar()
                useLaneData = open(
                    "./static/data/DataProcess/reversePart/" + str(k) + ".json", "w")
                useLaneData.write(json.dumps(driveReserve))

def mergeJsonToCsv():
    with open('./static/data/DataProcess/highSceneCsv/motor_reverse.json', 'r') as f:
        data = json.load(f)
    with open('./static/data/DataProcess/highSceneCsv/output.csv', 'w', newline='') as file:
        writer = csv.writer(file) 
        writer.writerow(["type", "id", "road", "start_time", "action_name"])
        for item in data:
            writer.writerow([item['type'], item['id'], item['road'], item['start_time'], "reverse"])

def kmeansAll():
    all_data = pd.DataFrame()
# 文件夹路径
    folder_path = './static/data/DataProcess/5m/feature_extraction_dim'
# 遍历文件夹下的所有csv文件
    for filename in os.listdir(folder_path):
        if filename.endswith(".csv"):
            file_path = os.path.join(folder_path, filename)
            df = pd.read_csv(file_path)
            df['filename'] = filename  # 添加一个列来记录每行数据来自哪个文件
            all_data = all_data.append(df, ignore_index=True)
    # 对于没有数值型数据的列，该列全为NaN，fillna无法处理，需要手动删除该列
    all_data= all_data.fillna(0)
# 进行聚类
    kmeans = KMeans(n_clusters=3)  # 选择合适的聚类数量
    all_data['cluster_label'] = kmeans.fit_predict(all_data.drop(columns=['filename']))
# 将聚类标签写回到每个csv文件中
    for filename in all_data['filename'].unique():
        df = all_data[all_data['filename'] == filename]
        df.drop(columns=['filename']).to_csv(os.path.join(folder_path, filename), index=False)

# 获取非机动车道中type为1、4、6的数据
def getAllType():
    file_path = "./static/data/DataProcess/part/"
    partList =["1912","1901","1450","1445"]
    typeList =[1,3,4,10,"1","3","4","10"]
    for filename in partList:
        targetData = {}
        with open(file_path+"part"+filename+".json", "r") as f:
            useLaneData = json.load(f)
        with alive_bar(len(useLaneData), title='Processing files') as bar:
            for i in useLaneData:
                targetData[i] = {} 
                for j in useLaneData[i]:
                    if useLaneData[i][j]["type"] in typeList:
                        targetData[i][j] = useLaneData[i][j]
                bar()
        useLaneData = open("./static/data/DataProcess/oBus/"+"part"+filename+".json", "w")
        useLaneData.write(json.dumps(targetData))
    
if __name__ == '__main__':
    # 驾驶行为
    # featureAll()
    # csvNormalization()
    # dimReduction()
    # fillNan() 
    # kmeans()
    # dimReduction_cluster()
    # forHighValue()
    # getLightData()
    # addRoadId()
    # newDataType()
    # dimReduction_no()
    # mergeCluster()
    # processFid() #  1 2 已经修改
    # forecastToInt()
    # # getDriveReserve()
    # getSimilarity()
    # getReverseData()
    # cleanReverseData()
    # getHighSceneCount()
    # mergeHV()
    # mergeHVCount()
    # # sortSimilarity()
    # # proSim()
    # dataTypebytime_meas()
    # forecastToInt()
    # noMoving()
    # mergeReverse()
    # mergeId()
    # mergeRadar()
    # readCsv()
    # validate()
    # jsonLen()
    # getDriveReserve()
    # mergeJsonToCsv()
    # dataTypebytime_meas()
    # kmeansAll()
    # dimReduction_cluster()
    # getAllType()
    # mergeReverse()
    mergeId()
    # getAllType()