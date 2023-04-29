import json
import os


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


'''
反推红绿灯时间：
1. 获取所有道路的方向、停止线所在经纬度
2. 判断车辆所在道路，以及车速
3. 判断距离停止线最近的车辆是否在减速/停止前进
4. 如果车辆停在停止线前表明当前为红灯
'''
if __name__ == '__main__':
  dataType()


