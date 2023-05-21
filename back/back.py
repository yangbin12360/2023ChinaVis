from flask import Flask, request
from flask_cors import CORS
import json
import numpy as np
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
   
    with open('../back/static/data\DataProcess/merged_data.json ')as f:
        data = json.load(f)
        res = data[0]+data[1]+data[2]+data[3]
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

if __name__ == '__main__':
    # app.debug = True   # 开启调试模式, 代码修改后服务器自动重新载入，无需手动重启
    app.run()
