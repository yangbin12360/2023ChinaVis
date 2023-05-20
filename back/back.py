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

if __name__ == '__main__':
    # app.debug = True   # 开启调试模式, 代码修改后服务器自动重新载入，无需手动重启
    app.run()
