import React from 'react';
import echarts from 'echarts';
import { useEffect } from 'react';

function RoseComponent() {
    function drawRose() {
        var chartDom = document.getElementById('main');
        var myChart = echarts.init(chartDom);
        var option;
        var piedata=[
            { value: 106, name: '0:00' },
            { value: 101, name: '1:00' },
            { value: 58, name: '2:00' },
            { value: 22, name: '3:00' },
            { value: 40, name: '4:00' },
            { value: 134, name: '5:00' },
            { value: 570, name: '6:00' },
            { value: 1288, name: '7:00' },
            { value: 1795, name: '8:00' },
            { value: 1331, name: '9:00' },
            { value: 1062, name: '10:00' },
            { value: 1327, name: '11:00' },
            { value: 1282, name: '12:00' },
            { value: 1115, name: '13:00' },
            { value: 1176, name: '14:00' },
            { value: 1226, name: '15:00' },
            { value: 1227, name: '16:00' },
            { value: 1684, name: '17:00' },
            { value: 1328, name: '18:00' },
            { value: 913, name: '19:00' },
            { value: 804, name: '20:00' },
            { value: 703, name: '21:00' },
            { value: 477, name: '22:00' },
            { value: 292, name: '23:00' }
          ];
          var bardata=[[35, 21, 30, 17, 23, 43, 14, 13], [29, 34, 24, 16, 22, 20, 12, 13], [15, 23, 16, 6, 10, 20, 5, 3], [4, 10, 1, 7, 8, 5, 5, 0], 
          [3, 23, 6, 3, 11, 12, 8, 1], [31, 60, 22, 12, 39, 38, 8, 7], [94, 233, 165, 65, 221, 155, 22, 18], [441, 425, 230, 207, 420, 399, 99, 38], 
          [582, 659, 301, 191, 581, 611, 224, 75], [374, 487, 268, 167, 478, 422, 145, 81], [296, 373, 203, 104, 356, 365, 146, 84], [354, 452, 321, 158, 415, 401, 121, 89], 
          [333, 419, 349, 178, 386, 385, 140, 76], [327, 391, 231, 129, 392, 351, 119, 79], [333, 437, 216, 154, 418, 377, 129, 76], [377, 443, 210, 144, 432, 410, 115, 80], 
          [321, 430, 267, 158, 435, 361, 102, 97], [521, 564, 273, 258, 590, 468, 109, 175], [425, 434, 268, 205, 457, 429, 94, 96], [250, 311, 186, 137, 330, 291, 80, 48], 
          [264, 251, 181, 114, 247, 246, 59, 49], [194, 234, 166, 115, 219, 211, 70, 36], [122, 177, 136, 57, 173, 143, 32, 18], [95, 78, 102, 33, 63, 102, 21, 13]];
        option = {
            polar: [
                {
                    center: ['50%', '50%'], // 极坐标系中心位置
                    radius: ['61%', '71%'] // 极坐标系半径范围
                },
                {
                    center: ['50%', '50%'], // 极坐标系中心位置
                    radius: ['71%', '81%'] // 极坐标系半径范围
                },
                {
                    center: ['50%', '50%'], // 极坐标系中心位置
                    radius: ['61%', '81%'] // 极坐标系半径范围
                },
                {
                    center: ['50%', '50%'], // 极坐标系中心位置
                    radius: ['10','60%']  // 极坐标系半径范围
                }
            ],
            tooltip: {},
            angleAxis: [
                {
                    type: 'category', // 类别型坐标轴
                    data: Array.from({ length: 288 }, (_, i) => `${i + 1}`),
                    boundaryGap: true, // 坐标轴两端不留空白
                    polarIndex: 0,
                    axisLine: {
                        show: false // 不显示坐标轴线
                    },
                    axisTick: {
                        show: false // 不显示坐标轴刻度
                    },
                    axisLabel: {
                        show: false // 显示坐标轴标签
                    }
                },
                {
                    type: 'category', // 类别型坐标轴
                    data: Array.from({ length: 288 }, (_, i) => `${i + 1}`),
                    boundaryGap: true, // 坐标轴两端不留空白
                    polarIndex: 1,
                    axisLine: {
                        show: false // 不显示坐标轴线
                    },
                    axisTick: {
                        show: false // 不显示坐标轴刻度
                    },
                    axisLabel: {
                        show: false // 显示坐标轴标签
                    }
                },
                {
                    type: 'category', // 设置角度轴类型为分类型
                    data: [
                        '00:00',
                        '01:00',
                        '02:00',
                        '03:00',
                        '04:00',
                        '05:00',
                        '06:00',
                        '07:00',
                        '08:00',
                        '09:00',
                        '10:00',
                        '11:00',
                        '12:00',
                        '13:00',
                        '14:00',
                        '15:00',
                        '16:00',
                        '17:00',
                        '18:00',
                        '19:00',
                        '20:00',
                        '21:00',
                        '22:00',
                        '23:00'
                    ], // 设置刻度标签的数据
                    polarIndex: 2,
                    axisLabel: {
                        show: true, // 显示刻度标签
                        rotate: 90, // 设置刻度标签旋转角度
                        fontSize: 14
                    },
                    axisLine: {
                        show: false // 隐藏角度轴线
                    },
                    splitLine: {
                        show: true, // 显示刻度线
                        lineStyle: {
                            color: '#ccc' // 设置刻度线的颜色
                        }
                    }
                },
                {
                    max: 680,
                    startAngle:90,
                    polarIndex:3,
                    axisLabel: {
                      show: false, // 显示刻度标签
                    },
                    axisLine: {
                      show: false // 隐藏角度轴线
                    },
                }
            ],
            radiusAxis: [
                {
                    type: 'value', // 数值型坐标轴
                    min: 0, // 坐标轴最小值
                    max: 0.5, // 坐标轴最大值
                    polarIndex: 0,
                    interval: 12,
                    axisLine: {
                        show: false // 不显示坐标轴线
                    },
                    axisTick: {
                        show: false // 不显示坐标轴刻度
                    },
                    splitLine: {
                        show: true, // 显示分隔线
                        lineStyle: {
                            color: '#ffdab9', // 分隔线颜色
                            width: 2
                        }
                    },
                    axisLabel: {
                        show: false // 不显示坐标轴标签
                    }
                },
                {
                    type: 'value', // 数值型坐标轴
                    min: 0, // 坐标轴最小值
                    max: 12, // 坐标轴最大值
                    polarIndex: 1,
                    interval: 12,
                    axisLine: {
                        show: false // 不显示坐标轴线
                    },
                    axisTick: {
                        show: false // 不显示坐标轴刻度
                    },
                    splitLine: {
                        show: true, // 显示分隔线
                        lineStyle: {
                            color: '#ffdab9', // 分隔线颜色
                            width: 2
                        }
                    },
                    axisLabel: {
                        show: false // 不显示坐标轴标签
                    }
                },
                {
                    type: 'value', // 数值型坐标轴
                    min: 0, // 坐标轴最小值
                    max: 12, // 坐标轴最大值
                    polarIndex: 2,
                    interval: 12,
                    axisLine: {
                        show: false // 不显示坐标轴线
                    },
                    axisTick: {
                        show: false // 不显示坐标轴刻度
                    },
                    splitLine: {
                        show: true, // 显示分隔线
                        lineStyle: {
                            color: '#ffdab9', // 分隔线颜色
                            width: 2
                        }
                    },
                    axisLabel: {
                        show: false // 不显示坐标轴标签
                    }
                },
                {
                    type: 'category',
                    polarIndex:3,
                    data: Array.from({ length: 8 }, (_, i) => `${i + 1}`),
                    axisLine: {
                      show: false // 不显示坐标轴线
                    },
                    axisTick: {
                      show: false // 不显示坐标轴刻度
                    },
                    axisLabel: {
                      show: false // 不显示坐标轴标签
                    }
                }
            ],
            visualMap: {
                show: false,
                min: 0,
                max: 2000,
                seriesIndex: 2,
                left: '0%',
                bottom: '0%',
                inRange: {
                    color: ['#32cd32', '#ffa500', '#ff0000']
                }
            },
            series: [
                {
                    name: '平均速度',
                    type: 'bar',
                    coordinateSystem: 'polar', // 指定使用极坐标系
                    roundCap: true, // 圆头柱
                    polarIndex: 1,
                    barWidth: 14, // 柱宽
                    // barGap:'10%',
                    data: [
                        6.558137071554561, 6.900393302153851, 7.5112214161372775,
                        6.5716603629702846, 6.5766538381420405, 8.239202067244095,
                        6.884852749030922, 7.133559599977673, 6.597665206523613,
                        7.557946149084991, 8.949356463002367, 9.312569806495224,
                        7.645885702465411, 6.61442952231824, 6.764949033635132,
                        7.65042234278327, 6.186217019559426, 6.916960180751913,
                        8.567296041768277, 9.934088260921364, 9.299198680969473,
                        6.491992971030316, 7.158811113565783, 8.381385444092922,
                        8.226365263134555, 6.184547663914728, 8.602237530716868,
                        8.19169208674144, 11.030135096869845, 5.723929325884366,
                        6.419506129949847, 8.702460187203505, 8.88891558327243,
                        9.750187184804476, 0, 7.967706569637122, 0, 8.861200931183822,
                        8.496283160937036, 7.727067266547547, 7.329513452084777,
                        7.6498539043181815, 0, 8.158679783358718, 7.33209079145289,
                        7.84662303447853, 0, 7.109487790072301, 0, 9.248371758823529,
                        7.283667089212708, 12.7354688070484, 9.723600338068671,
                        6.43700582324639, 0, 7.165198887754945, 8.820366890462717,
                        8.695437939727762, 6.6726036874603185, 6.493833069422199,
                        6.56775576902473, 10.396458533562521, 7.485724214526552,
                        7.094773192774294, 8.683799252922373, 6.101464097482751,
                        6.745541370586835, 6.92750843972104, 7.762911362971827,
                        7.535468966623462, 6.832504121482929, 8.208805528952327,
                        7.490260074709085, 7.858030228136526, 7.971444046612862,
                        9.297331239301945, 6.9584148632402, 7.431728101057263,
                        7.847884568889231, 8.458274271595903, 8.37154351672712,
                        9.118629086264246, 7.979073152263818, 8.063309098681021,
                        7.489475944583012, 7.53734443663339, 8.642225767507506,
                        10.227650084840574, 9.123256066532168, 8.276340303266387,
                        9.73574283721688, 9.084917124477245, 8.949964489962694,
                        8.922447817020618, 9.209473594582791, 9.649864527562514,
                        7.782876316450262, 8.232510049405663, 9.053433221958539,
                        9.349096956529339, 8.735664284813321, 7.968479069351914,
                        9.384675851375151, 8.059473375254335, 8.354346712908464,
                        9.04464656947002, 8.287229137742642, 8.161076081720239,
                        7.5723159784184935, 7.524634902460079, 8.21506568931611,
                        7.24947867140587, 7.200996795231654, 8.302922916010012,
                        7.221798024429843, 6.97948681524128, 8.123247762224693,
                        7.681476783711056, 7.352461377217753, 8.3791513103262,
                        8.250069977935162, 7.7453443570579354, 8.473286462326698,
                        7.572376164403904, 7.7385188422877125, 7.807617430080593,
                        7.725546388542355, 7.657870225628837, 8.321297228043779,
                        6.763289410965446, 7.2884043913341, 8.376304924859117,
                        7.7849363697168625, 7.3765880809773545, 8.409925518865622,
                        7.693908160224292, 7.685629142043827, 7.422706447043263,
                        6.74243777977614, 7.2565098452430545, 8.129333131005467,
                        6.857406807751524, 6.9555965035219876, 6.951081426867826,
                        6.762604506711015, 7.1988632611421615, 6.977728157713686,
                        7.012078544672571, 7.233786969521859, 7.022303451243412,
                        6.610608501707062, 7.220877959004636, 6.9419258061494284,
                        6.540619846189011, 7.832083168318667, 7.16546166919349,
                        6.925645874725549, 8.205705575878074, 7.44076727231904,
                        7.365034946201758, 7.72846843350154, 7.717133886216281,
                        7.282858721581249, 8.18516955265404, 7.437776694369404,
                        7.450685715832429, 7.687526582547112, 7.595246143844736,
                        8.017716161253565, 7.754079398600113, 7.620026021581045,
                        7.513476861515228, 7.838611090318924, 7.520455722545569,
                        7.388232174668162, 8.03857448912477, 7.860661338726078,
                        7.493154248527839, 7.747373833653076, 7.661051808868422,
                        7.033868086443966, 7.712286259730047, 7.9185571166074835,
                        7.655062151889698, 7.965156656595874, 7.7476792626835955,
                        7.831972429163381, 7.320011419956577, 7.889890220362887,
                        7.962517819173715, 7.477579354150611, 7.400653769695923,
                        7.335243877468687, 6.830043478466401, 8.065230320733209,
                        8.348912842412878, 8.053856682512174, 8.352271360632043,
                        8.147276161446563, 8.361631498573791, 8.171786957789374,
                        7.720491798865644, 6.966995701552098, 8.280902647402963,
                        8.988024962234617, 7.998857203371784, 7.671291673049522,
                        7.6038729971605905, 7.180816158310014, 7.74452103209318,
                        7.5298737571844745, 8.009411538253428, 7.1589604167206184,
                        6.813600538237792, 8.014125219865946, 9.124910066684581,
                        7.950625595427157, 7.173367557014016, 7.014992050178097,
                        7.141978284065957, 8.336381234787025, 7.843258518466002,
                        7.3937311722737, 7.051927009273717, 7.128092894808787,
                        7.708696678947505, 7.688876501079527, 7.738740744128251,
                        7.700531273313813, 7.5637871570951445, 8.49037282861939,
                        8.196927578526918, 6.722379056910818, 7.4459883770478354,
                        8.092035085404007, 7.636732683033412, 7.862086694452511,
                        7.177889747101065, 7.322930641710435, 7.308804454947554,
                        7.185037364042743, 7.088755624072957, 7.519361088102903,
                        7.557920310759798, 7.419655355870714, 6.2060712926862545,
                        7.665258368591723, 7.664082627504023, 8.108565635593871,
                        8.271802417341314, 7.8831831493072535, 7.256134740207158,
                        8.24563863841153, 8.545111702869246, 8.326642912392794,
                        7.592460304562052, 7.419149215180368, 7.580974025755686,
                        7.512512015290761, 7.688745483788742, 7.703363695170086,
                        7.830348494808491, 7.8985649057040055, 8.261847341025529,
                        7.512627248990999, 7.7638917719923555, 6.12237865241853,
                        6.561893098140529, 6.700529359148717, 6.902559303251303,
                        8.762823984677556, 7.854193791676275, 8.174483686817256,
                        9.864522914633227, 8.595161328858774, 8.213404153546568,
                        8.437065948563847, 7.2092112442923035, 7.869097856949403,
                        7.071161490108119, 8.82343276845346, 8.234664080005592,
                        8.389543546894402, 7.012373889861548, 7.904685098755252,
                        6.928578570765757, 8.09759204750708, 6.513680154999284
                    ], // 数据
                    itemStyle: {
                        // color: '#ff9c47' // 柱子颜色
                        color: '#87c1fa' // 柱子颜色
                    },
                    emphasis: {
                        itemStyle: {
                            color: '#4b0082' // 柱子高亮颜色
                        }
                    }
                },
                {
                    name: '停止频率',
                    type: 'bar',
                    coordinateSystem: 'polar', // 指定使用极坐标系
                    roundCap: true, // 圆头柱
                    polarIndex: 0,
                    barWidth: 14, // 柱宽
                    // barGap:'10%',
                    data: [
                        0.10526315789473684, 0.2, 0.14285714285714285, 0.0625,
                        0.3076923076923077, 0.14814814814814814, 0.2, 0.25, 0.38461538461538464,
                        0.18181818181818182, 0.3333333333333333, 0.25, 0.11764705882352941,
                        0.34782608695652173, 0.3076923076923077, 0.2, 0.1, 0.08333333333333333,
                        0.5, 0.2, 0.2, 0.125, 0.0, 0.25, 0.25, 0.0, 0.2222222222222222,
                        0.16666666666666666, 0.0, 0.23809523809523808, 0.5, 0.4, 0.0, 1.0, 0,
                        0.0, 0, 0.4, 0.2, 0.0, 0.5, 1.0, 0, 0.0, 0.2, 1.0, 0, 0.0, 0, 0.0, 0.0,
                        0.0, 0.2222222222222222, 0.3333333333333333, 0, 0.0, 0.0,
                        0.42857142857142855, 0.0, 0.2857142857142857, 0.125, 0.0,
                        0.10526315789473684, 0.2222222222222222, 0.2, 0.09090909090909091, 0.5,
                        0.4375, 0.1111111111111111, 0.2631578947368421, 0.15789473684210525,
                        0.20833333333333334, 0.2, 0.20512820512820512, 0.23684210526315788,
                        0.08571428571428572, 0.23255813953488372, 0.10526315789473684,
                        0.1864406779661017, 0.2857142857142857, 0.23333333333333334,
                        0.11827956989247312, 0.14953271028037382, 0.19801980198019803,
                        0.3333333333333333, 0.19014084507042253, 0.18253968253968253,
                        0.087248322147651, 0.17777777777777778, 0.20353982300884957,
                        0.10810810810810811, 0.14563106796116504, 0.20987654320987653,
                        0.14615384615384616, 0.1188118811881188, 0.19402985074626866,
                        0.25806451612903225, 0.24571428571428572, 0.15483870967741936,
                        0.13440860215053763, 0.22897196261682243, 0.15606936416184972, 0.14,
                        0.23529411764705882, 0.1958762886597938, 0.14285714285714285,
                        0.22485207100591717, 0.23902439024390243, 0.23414634146341465,
                        0.24285714285714285, 0.25165562913907286, 0.23626373626373626,
                        0.2808988764044944, 0.1888111888111888, 0.3058823529411765, 0.3046875,
                        0.30327868852459017, 0.26356589147286824, 0.3389830508474576,
                        0.1941747572815534, 0.17094017094017094, 0.30434782608695654,
                        0.2672413793103448, 0.23893805309734514, 0.25190839694656486, 0.216,
                        0.20491803278688525, 0.17757009345794392, 0.18811881188118812, 0.21875,
                        0.31958762886597936, 0.1984126984126984, 0.26153846153846155,
                        0.3064516129032258, 0.1956521739130435, 0.2125, 0.23648648648648649,
                        0.22994652406417113, 0.26903553299492383, 0.22641509433962265,
                        0.2578616352201258, 0.32051282051282054, 0.33707865168539325,
                        0.21951219512195122, 0.2789473684210526, 0.27607361963190186,
                        0.22289156626506024, 0.2, 0.21714285714285714, 0.25142857142857145,
                        0.3312883435582822, 0.23333333333333334, 0.25316455696202533,
                        0.2838709677419355, 0.24404761904761904, 0.25443786982248523,
                        0.2922077922077922, 0.24, 0.22916666666666666, 0.1791044776119403,
                        0.2032520325203252, 0.20512820512820512, 0.22950819672131148,
                        0.15748031496062992, 0.21621621621621623, 0.2556390977443609,
                        0.2781954887218045, 0.2222222222222222, 0.24242424242424243,
                        0.19480519480519481, 0.3511450381679389, 0.2523364485981308,
                        0.21428571428571427, 0.18604651162790697, 0.26717557251908397, 0.225,
                        0.2845528455284553, 0.2638888888888889, 0.2152777777777778,
                        0.2558139534883721, 0.2597402597402597, 0.2518518518518518,
                        0.24193548387096775, 0.2920353982300885, 0.20279720279720279,
                        0.2357142857142857, 0.26785714285714285, 0.22935779816513763,
                        0.23478260869565218, 0.2894736842105263, 0.20114942528735633,
                        0.3472222222222222, 0.2695035460992908, 0.26174496644295303,
                        0.1895424836601307, 0.22, 0.1958041958041958, 0.15441176470588236,
                        0.19852941176470587, 0.1721311475409836, 0.1744186046511628,
                        0.273224043715847, 0.2926829268292683, 0.16153846153846155,
                        0.14838709677419354, 0.16, 0.20526315789473684, 0.16062176165803108,
                        0.25675675675675674, 0.265, 0.266304347826087, 0.21568627450980393,
                        0.27699530516431925, 0.19597989949748743, 0.23076923076923078,
                        0.1643835616438356, 0.21604938271604937, 0.25806451612903225,
                        0.327683615819209, 0.2849740932642487, 0.24277456647398843,
                        0.25161290322580643, 0.19254658385093168, 0.28823529411764703,
                        0.2556390977443609, 0.21428571428571427, 0.19672131147540983,
                        0.20634920634920634, 0.16875, 0.16216216216216217, 0.25,
                        0.22123893805309736, 0.21495327102803738, 0.24, 0.16842105263157894,
                        0.21052631578947367, 0.16666666666666666, 0.2184873949579832, 0.216,
                        0.21296296296296297, 0.24444444444444444, 0.1956521739130435,
                        0.2672413793103448, 0.2905982905982906, 0.29914529914529914,
                        0.3333333333333333, 0.1927710843373494, 0.22093023255813954, 0.225,
                        0.19101123595505617, 0.23333333333333334, 0.27848101265822783,
                        0.21238938053097345, 0.1643835616438356, 0.15584415584415584,
                        0.24561403508771928, 0.2376237623762376, 0.17073170731707318, 0.2,
                        0.15294117647058825, 0.19047619047619047, 0.2, 0.3235294117647059,
                        0.13114754098360656, 0.1320754716981132, 0.2777777777777778,
                        0.3108108108108108, 0.2289156626506024, 0.2631578947368421,
                        0.29508196721311475, 0.22916666666666666, 0.23214285714285715,
                        0.21311475409836064, 0.175, 0.2037037037037037, 0.16129032258064516,
                        0.25, 0.20754716981132076, 0.16393442622950818, 0.3793103448275862,
                        0.1702127659574468, 0.1794871794871795, 0.10256410256410256,
                        0.15789473684210525, 0.06, 0.05128205128205128, 0.19047619047619047,
                        0.21428571428571427
                    ], // 数据
                    itemStyle: {
                        // color: '#87c1fa' // 柱子颜色
                        color: '#cd5c3c' // 柱子颜色
                    },
                    emphasis: {
                        itemStyle: {
                            color: '#4b0082' // 柱子高亮颜色
                        }
                    }
                },
                {
                    name: '总体车流量',
                    type: 'pie',
                    radius: ['10', '60%'],
                    center: ['50%', '50%'],
                    data: piedata,
                    roseType: 'area',
                    label: {
                        normal: {
                            show: false
                        }
                    },
                    tooltip: {
                        trigger: 'item'
                    },
                    itemStyle: {
                        borderColor: '#fff'
                    },
                    animationType: 'scale',
                    animationEasing: 'elasticOut',
                    animationDelay: function (idx) {
                        return Math.random() * 200;
                    }
                }
            ]
        };

        option && myChart.setOption(option);
        myChart.on('click', function(params) {
            // 判断点击的组件是否为玫瑰图的系列
            if (params.seriesIndex === 2 && params.seriesType === 'pie') {
               // 获取点击的花瓣索引
              var dataIndex = params.dataIndex;
              // 获取当前 echarts 实例的配置项
              var option = myChart.getOption();
              // 获取玫瑰图的系列配置
              var seriesOption = option.series.find(function(series) {
                return series.type === 'pie';
              });
              // 获取玫瑰图的总扇区数
              var totalSectors = seriesOption.data.length;
              // 计算每个扇区的角度
              var sectorAngle = 360 / totalSectors;
              // 计算点击花瓣所在的中心角度
              var centerAngle = sectorAngle * (dataIndex + 0.5);
              // 执行切换视图的逻辑
              switchView(dataIndex,centerAngle);
            }
            else{
              switchView(0,0);
            }
        });
        var currentView = 'original'; // 初始显示的视图，可根据实际情况修改
        var series1 ={
            type: 'pie',
            name: '总体车流量',
            radius: ['10','60%'],
            center: ['50%', '50%'],
            data:piedata,
            roseType: 'area',
            label:{
                normal:{
                show:false
                }
            },
            tooltip:{
                trigger:'item'
            },
            itemStyle: {
                borderColor:'#fff'
            }
        };
        function switchView(dataIndex,centerAngle) {
            // 获取当前 echarts 实例的配置项
            var currentOption = myChart.getOption();
            // 根据 seriesIndex 执行切换视图的逻辑
            if (currentView === 'original') {
              var newSeries = {
                type: 'bar',
                name: '中车道车流量',
                data: bardata[dataIndex],
                coordinateSystem: 'polar',
                polarIndex:3
              };
              currentOption.angleAxis[3].startAngle=90-centerAngle;
              // 替换第一个系列为新的系列配置
              currentOption.series[2] = newSeries;
              // 更新 echarts 实例的配置项
              myChart.setOption(currentOption);
              currentView = 'new'; // 更新当前显示的视图为新视图
            } else if (currentView === 'new') {
              // 备份原始的系列和极坐标轴的配置
              var originalSeries = JSON.parse(JSON.stringify(series1));
              currentOption.series[2] = originalSeries;
              currentOption.angleAxis[3].startAngle=90;
              myChart.setOption(currentOption);
              currentView = 'original'; // 更新当前显示的视图为原始视图
            }
        }

    }

    useEffect(() => {
        drawRose()
    }, [])

    return (
        <div id='main' style={{width:'100%',height:'100%'}}></div>
    );
}

export default RoseComponent;
