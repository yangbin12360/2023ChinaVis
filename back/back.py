from flask import Flask, request
from flask_cors import CORS
import json
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
        with open('D:/2023ChinaVis/back/data/题目1 高价值场景可视分析/高价值场景可视分析/road10map/'+name+'road10.geojson', 'r', encoding='utf-8') as f:
            data = json.load(f) 
        res[name] = data
    return res 

if __name__ == '__main__':
    # app.debug = True   # 开启调试模式, 代码修改后服务器自动重新载入，无需手动重启
    app.run()
