from flask import Flask, request
from flask_cors import CORS
app = Flask(__name__)
CORS(app, supports_credentials=True)


@app.route('/helloReact',methods=["POST"])
def helloReact():
    return 'rrr react.'


if __name__ == '__main__':
    # app.debug = True   # 开启调试模式, 代码修改后服务器自动重新载入，无需手动重启
    app.run()
