import json
import os
import operator

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
            data = sorted(data, key=lambda x: x['time_meas'])#按照时间排列数据
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
'''
反推红绿灯时间：
1. 获取所有道路的方向、停止线所在经纬度
2. 判断车辆所在道路，以及车速
3. 判断距离停止线最近的车辆是否在减速/停止前进
4. 如果车辆停在停止线前表明当前为红灯
'''
if __name__ == '__main__':
  dataType()


