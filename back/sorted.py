import os
import json
import operator

# 按时间戳顺序对每辆车的轨迹数据进行排序
def sortItem():
    # 获取文件夹下的所有子文件夹
    subfolders = [f.path for f in os.scandir('./static/data/DataProcess') if f.is_dir()]

    # 遍历所有子文件夹，读取子文件夹中的文件
    for subfolder in subfolders:
        # 遍历子文件夹中的所有文件
        for filename in os.listdir(subfolder):
            filepath = os.path.join(subfolder, filename)
            # 处理文件
            with open(filepath, 'r') as f:
                data = json.load(f)
                # 处理数据
                data_sorted = sorted(data, key=operator.itemgetter('time_meas'))
                # 将修改后的数据写入到原文件
                with open(filepath, 'w') as f:
                    json.dump(data_sorted, f)


if __name__ == '__main__':
    sortItem()
