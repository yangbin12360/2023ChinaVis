import os
import json


def filterItem():
    # 获取文件夹下的所有子文件夹
    subfolders = [f.path for f in os.scandir('./static/data/DataProcess') if f.is_dir()]

    # 遍历所有子文件夹，读取子文件夹中的文件
    for subfolder in subfolders:
        # 遍历子文件夹中的所有文件
        for filename in os.listdir(subfolder):
            filepath = os.path.join(subfolder, filename)
            # 处理文件
            f=open(filepath, 'r')
            data = json.load(f)
            if len(data) <2:
                f.close()
                os.remove(filepath)
            # with open(filepath, 'r') as f:
            #     data = json.load(f)
            #     # 处理数据
            #     if len(data) <3:
                    
            #         os.remove(filepath)


if __name__ == '__main__':
    filterItem()
