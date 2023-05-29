from flask import Flask, request
from flask_cors import CORS
import json
import numpy as np
import os
import datetime
import pandas as pd
import math
app = Flask(__name__)
CORS(app, supports_credentials=True)


@app.route('/helloReact',methods=["POST"])
def helloReact():
    return 'rrr react.'

@app.route('/getJson',methods=["POST"])
def getJson():
    mapName = ['boundary','crosswalk','lane','signal','stopline']
    res = {}
    for name in mapName:
        with open('../back\static\data\ChinaVis Data/road10map/'+name+'road10.geojson', 'r', encoding='utf-8') as f:
            data = json.load(f) 
        res[name] = data
    with open('../back/static/data\DataProcess/1/171547107.json ')as f:
        data1 = json.load(f)
    with open('../back/static/data\DataProcess/6/188078451.json ')as f:
        data2 = json.load(f)
    #时间戳排序
    res["car"] = sorted(data1, key=lambda x: x['time_meas'])
    res["car2"] = sorted(data2, key=lambda x: x['time_meas'])
    return res

@app.route('/getList',methods=["POST"])
def getList():
   
    with open('../back/static/data/DataProcess/merged_data.json ')as f:
        data = json.load(f)
        res = data[0]+data[1]+data[2]+data[3]+data[4]+data[5]+data[6]+data[7]
        # print(data)
    #时间戳排序
    return res

#按照时间戳获取交通参与者数据
@app.route('/getTimeJson',methods=["POST"])
def getTimeJson():
    startTime = request.json.get('startTime')
    pathList = []
    # startTime = 1681315196
    for i in range(0,1000):
        fileName = str(i+startTime)+'.0.json'
        pathList.append(fileName)
    res = {}
    for path in pathList:
        with open('../back/static/data\DataProcess/time_meas/'+path)as f:
            data = json.load(f)
            # 遍历数据，根据id进行分组
            for item in data:
                if item['type'] != -1 :  
                    id = item.get('id')  
                    if id not in res:
                        res[id] = []
                    res[id].append(item)
    # 对每个id对应的数据列表按照time_meas进行排序
    for id in res:
        res[id].sort(key=lambda x: x['time_meas'])  
    newRes = {}
    # 每个id对应的position、shape、orientation、velocity、heading、type放入
    for id in res:
        pList = []
        oList = []
        vList = []
        hList = [] 
        newRes[id]={}
        for item in res[id]:
            pList.append(item["position"])
            oList.append(item["orientation"])
            vList.append(item["velocity"])
            hList.append(item["heading"])
            newRes[id]["shape"] = item["shape"]
            newRes[id]["type"] = item["type"]
        newRes[id]["trace"] = pList
        newRes[id]["orientation"] = oList
        newRes[id]["velocity"] = vList
        newRes[id]["heading"] = hList
    for id in res:
        newRes[id]["startTime"] = res[id][0]["time_meas"]
        newRes[id]["endTime"] = res[id][-1]["time_meas"]
    return newRes
    
@app.route('/getActionAndRoadCount',methods=["POST"])
def getActionAndRoadCount():
    # 时间段时长和数量
    segment_duration = datetime.timedelta(minutes=5)  # 时间段时长为5分钟
    num_segments = 288  # 时间段数量
    # 创建一个三维数组
    all_count = [[[0 for _ in range(num_segments)] for _ in range(9)] for _ in range(8)]

    file_path = './static/data/Result/decomposition_data.json'
    with open(file_path, "r", encoding="utf-8") as f:
        decomposition_data = json.load(f)
    for index,d_data in enumerate(decomposition_data):
        if index in [1,2,3,4]:
            for item in d_data:
                if item['road']==-1:
                    continue
                # 将时间戳转换为日期时间
                dt1 = datetime.datetime.fromtimestamp(item['start_time'] / 1000000)
                dt2 = datetime.datetime.fromtimestamp(item['end_time'] / 1000000)
                time_diff1 = dt1 - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳与当天零点之间的时间差
                segment_index1 = int(time_diff1.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
                time_diff2 = dt2 - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳与当天零点之间的时间差
                segment_index2 = int(time_diff2.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
                if segment_index1==segment_index2:
                    all_count[index][item['road']][segment_index1]+=1
                else:
                    all_count[index][item['road']][segment_index1]+=1
                    if segment_index2>287:
                        # print(segment_index2,dt2)
                        all_count[index][item['road']][287]+=1
                    else:
                        all_count[index][item['road']][segment_index2]+=1 
        else:
            for item in d_data:
                if item['road']==-1:
                    continue
                # 将时间戳转换为日期时间
                dt = datetime.datetime.fromtimestamp(item['start_time'] / 1000000)
                time_diff = dt - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳与当天零点之间的时间差
                segment_index = int(time_diff.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
                all_count[index][item['road']][segment_index]+=1
                
                
    # print(all_count)
    # list_path = './static/data/Result/all_list.json'
    # with open(list_path, 'w') as f:
    #     json.dump(all_count, f)                  
    return all_count

# def getActionAndRoadCount():
#     file_path = './static/data/Result/all_list.json'
#     with open(file_path, "r", encoding="utf-8") as f:
#         data = json.load(f)
#     return data

def getLittleRoadFlow():
    startTime = request.json.get('startTime')
    segment_duration = datetime.timedelta(minutes=5)
    file_path = './static/data/Result/little_road_flow_new.json'
    with open(file_path, "r", encoding="utf-8") as f:
        little_flow = json.load(f)
    # 将时间段的起始时间和结束时间转换为 datetime 对象
    startTime = datetime.datetime.strptime(startTime, "%Y-%m-%d %H:%M:%S")
    time_diff = startTime - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳与当天零点之间的时间差
    segment_index = int(time_diff.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
    if segment_index>287:
        segment_index=287
    return little_flow[segment_index]
    

#按照时间戳获取高价值场景数据
@app.route('/getHighValue',methods=["POST"])
def getHighValue():
    startTime = request.json.get('startTime')
    file_name = os.listdir('../back/static/data/DataProcess/highSceneCsv')
    file = '../back/static/data/DataProcess/highSceneCsv'
    res = {}
    endTime = startTime+300
    startTime = startTime*1000000
    endTime = endTime*1000000
    for name in file_name:
        file_path = os.path.join(file,name)
        df = pd.read_csv(file_path)
        selected_rows = df[(df['start_time'] >= startTime) & (df['start_time'] <= endTime)]
        resName = name.split('.')[0]
        res[resName] = selected_rows.to_dict('records')
    newRes = {}
        # 遍历 res 中的每个关键字和对应的列表
    for keyword, lst in res.items():
        newRes[keyword] = []
        # 遍历列表中的每个字典
        for dictionary in lst:
            # 获取每个字典下的 'id'、'type'、'action_name' 和 'start_time' 键对应的值
            id_value = dictionary['id']
            type_value = dictionary['type']
            action_name_value = dictionary['action_name']
            start_time_value = dictionary['start_time']

            # 将这四个键和对应的值组成一个新的字典，并添加到 newRes 中
            new_dictionary = {
                'id': id_value,
                'type': type_value,
                'hv_type': action_name_value,
                'start_time': start_time_value
            }
            newRes[keyword].append(new_dictionary)
    return newRes


#按照id获取高价值场景数据
@app.route('/getIdHighValue',methods=["POST"])
def getIdHighValue():
    id = request.json.get('id')
    type = request.json.get('type')
    file_name = os.listdir('../back/static/data/DataProcess/highSceneCsv')
    file = '../back/static/data/DataProcess/highSceneCsv'
    res = {}
    tempDict = {}
    hvCount = [] #高价值场景数量，对应bar图
    # 定义一个自定义函数，用于除以1000000
    def divide_by_1000000(value):
        return int(value / 1000000)
    for name in file_name:
        file_path = os.path.join(file,name)
        df = pd.read_csv(file_path)
        selected_rows = df[(df['id'] == id)]
        hvCount.append(len(df[(df['id'] == id)]))
        selected_rows['start_time'] = selected_rows['start_time'].apply(divide_by_1000000)
        resName = name.split('.')[0]
        tempDict[resName] = selected_rows['start_time'].tolist()
        res[resName] = selected_rows.to_dict('records')
    print(hvCount)
    # timeStampList = sorted(timeStampList)
    # print(tempDict)
    newRes = {}
    newRes["highValue"] = res #高价值场景数据
    file_name_id = "../back/static/data/DataProcess/idRoadCsv/"+str(type)+"/"+str(id)+".csv"
    with open(file_name_id,"r") as f:
        data = pd.read_csv(f)
    velocityList = [] #速度折线图列表，还需要除以5,以获得每秒的平均速度
    laneRoadList = data.iloc[0:]["lineFid"].to_list() #所在车道列表，对应轨迹
    print(laneRoadList)
    for index, row in data.iterrows():
        velocityList.append(row['velocity'])
    laneRoadId = data.iloc[0]["lineFid"]
    startTime = int(data.iloc[0]["time_meas"]/1000000) #起始时间
    endTime = int(data.iloc[-1]["time_meas"]/1000000)  #结束时间 
    print(laneRoadId,startTime,endTime)
    return newRes

#按照时间戳获取每5分钟的机动车的聚类结果
@app.route('/getCluster',methods=["POST"])
def getCluster():
    time = request.json.get('time')
    start_time = 1681315196
    clusterTime = math.floor(((time-start_time)/300))
    file_path = "../back/static/data/DataProcess/5m/merge/" 
    res ={}
    #获取聚类结果
    dfCluster = pd.read_csv(file_path+str(clusterTime*300)+"s.csv")
    #获取聚类结果相关的属性
    for cluster in dfCluster['cluster'].unique():
        df_temp = dfCluster[dfCluster['cluster'] == cluster]  

        cluster_avg_a_std = df_temp['a_std'].mean()
        cluster_avg_o_std = df_temp['o_std'].mean()
        cluster_avg_distance_mean = df_temp['distance_mean'].mean()
        cluster_avg_v_pca = df_temp['v_pca'].mean()

        res["cluster" + str(cluster)] = {}
        res["cluster" + str(cluster)]['a_std'] = cluster_avg_a_std
        res["cluster" + str(cluster)]['o_std'] = cluster_avg_o_std
        res["cluster" + str(cluster)]['distance_mean'] = cluster_avg_distance_mean
        res["cluster" + str(cluster)]['v_pca'] = cluster_avg_v_pca
        for _, row in df_temp.iterrows():
            if 'ids' not in res["cluster" + str(cluster)]:
                res["cluster" + str(cluster)]['ids'] = {}
            res["cluster" + str(cluster)]['ids'][row['id']] = {}
            res["cluster" + str(cluster)]['ids'][row['id']]['position'] = [row['x'], row['y']]
            res["cluster" + str(cluster)]['ids'][row['id']]['type'] = row['type']

    return res


if __name__ == '__main__':
    # app.debug = True   # 开启调试模式, 代码修改后服务器自动重新载入，无需手动重启
    app.run()
