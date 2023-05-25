from flask import Flask, request
from flask_cors import CORS
import json
import numpy as np
import datetime
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
    print( request.json.get('startTime'))
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
    for id in res:
        tempList = []
        newRes[id]={}
        for item in res[id]:
            tempList.append(item["position"])
        newRes[id]["trace"] = tempList
    for id in res:
        newRes[id]["startTime"] = res[id][0]["time_meas"]
        newRes[id]["endTime"] = res[id][-1]["time_meas"]
    return newRes
@app.route('/getActionAndRoadCount',methods=["POST"])
def getActionAndRoadCount():
    action_count = [[0] * 8 for _ in range(24)]
    # 创建一个三维数组
    road_count = [[[0 for _ in range(9)] for _ in range(8)] for _ in range(24)]

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
                hour1=dt1.hour
                hour2=dt2.hour
                if hour1==hour2:
                    action_count[hour1][index]+=1
                    road_count[hour1][index][item['road']]+=1
                else:
                    action_count[hour1][index]+=1
                    action_count[hour2][index]+=1
                    road_count[hour1][index][item['road']]+=1
                    road_count[hour2][index][item['road']]+=1 
        else:
            for item in d_data:
                if item['road']==-1:
                    continue
                # 将时间戳转换为日期时间
                dt = datetime.datetime.fromtimestamp(item['start_time'] / 1000000)
                action_count[dt.hour][index]+=1
                road_count[dt.hour][index][item['road']]+=1

    all_list=[]
    for index,action_list in enumerate(action_count):
        name_list=['car_cross','long_time','nomotor_cross','overSpeeding','people_cross','reverse','speedDown','speedUp']
        for i,action in enumerate(action_list):
            all_list.append({
                'action_type':name_list[i],
                'action_count':action,
                'action_hour':index,
                'road_count':road_count[index][i]
            })
    return all_list

# def getActionAndRoadCount():
#     file_path = './static/data/Result/all_list.json'
#     with open(file_path, "r", encoding="utf-8") as f:
#         data = json.load(f)
#     return data

if __name__ == '__main__':
    # app.debug = True   # 开启调试模式, 代码修改后服务器自动重新载入，无需手动重启
    app.run()
