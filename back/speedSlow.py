import os
import json
import operator
import datetime

def unixTime(timestamp):
    datetime_obj = datetime.datetime.fromtimestamp(
        timestamp / 1000000.0)  # 转换为秒级别Unix时间戳
    return datetime_obj

def speedSlow():
    # 设置文件夹路径
    folder_path = './static/data/DataProcess/6'

    # 获取文件夹中的所有文件
    file_list = os.listdir(folder_path)
    
    # 遍历文件列表，筛选出JSON文件并读取
    for file_name in file_list:
        if file_name.endswith('.json'):
            file_path = os.path.join(folder_path, file_name)
            with open(file_path, 'r') as f:
                data = json.load(f)
                # 对JSON数据进行处理，例如打印或保存等操作
                for i in range(1, len(data)):
                    time_diff = data[i]['time_meas']-data[i-1]['time_meas']
                    velocity_diff = data[i]['velocity']-data[i-1]['velocity']
                    accel = velocity_diff/(time_diff/1000000)
                    # print("所有速度：")
                    if accel > 3.475:
                        moment = unixTime(data[i]['time_meas'])
                        print("id为"+file_name+"的车在",end='')
                        print(moment,end='')
                        print("进行了急加速")
                        print(data[i-1]['velocity'])
                        # print(data[i]['velocity'])
                    elif accel < -3.475:
                        moment = unixTime(data[i]['time_meas'])
                        print("id为"+file_name+"的车在",end='')
                        print(moment,end='')
                        print("进行了急减速")
                        print(data[i-1]['velocity'])
                        # print(data[i]['velocity'])

if __name__ == '__main__':
  speedSlow()
