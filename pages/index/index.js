// pages/_220125A002/_220125A002.js
//55 A5 03      07      00 01      00       00
//头    版本     命令    长度       数据    校验和
var app = getApp();
var timer;
var openfuntimer;
var autoTimer;
var currtime ;
var   send_buffer;
var     PowerStateValue;
var     LdStateValue=1;
var     DP_TYPE_RAW   =   0x00	;			//RAW型
var     DP_TYPE_BOOL  =  0x01	    ;        //布尔型
var DP_TYPE_VALUE  =        0x02	;            //数值型
var DP_TYPE_STRING  =                0x03	;			//字符串型
var DP_TYPE_ENUM     =               0x04		;		//枚举型
var DP_TYPE_FAULT     =              0x05	;			//故障型


function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}
// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)+" "
    }
  )
  return (hexArr.join('')).toUpperCase();
}
function ab2Str(arrayBuffer){
  let unit8Arr = new Uint8Array(arrayBuffer);
  let encodedString = String.fromCharCode.apply(null, unit8Arr);
  //var decodedString = decodeURIComponent(mencode.encodeURIComponent((encodedString)));//没有这一步中文会乱码
  //var decodedString = mencode.encodeURIComponent((encodedString));
  //console.log(decodedString);
  //return decodedString
  return encodedString
}
function stringToBytes(str) {
  var ch, st, re = [];
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i);  // get char  
    st = [];                 // set up "stack"  
    do {
      st.push(ch & 0xFF);  // push byte to stack  
      ch = ch >> 8;          // shift value down by 1 byte  
    }
    while (ch);
    // add stack contents to result  
    // done because chars have "wrong" endianness  
    re = re.concat(st.reverse());
  }
  // return an array of bytes  
  return re;
}


Page({
    /**
     * 页面的初始数据
     */
    data: {
        device:null,
        connected: false,
        readyRec:false,
        hexSend:false,
        hexRec:false,
        chs: [], 
        deviceadd:"  ",
        windowHeight: 0,// 页面总高度将会放在这里
        navbarHeight: 0,// navbar的高度
        headerHeight: 0,// header的高度
        scrollViewHeight: 300, // scroll-view的高度
        recdata:"",
        rxCount:0,
        txCount:0,
        rxRate:0,
        txRate:0,
        connectState:"正在连接",
        reconnect:"连接中...",
        timRX:0,
        timTX:0,
        sendText:"",
        autoSendInv:50,
        autosendEn:false,
        autosendText:"自动发送",
        showModal:false,
        showModalStatus:false,
        showTips:"",
        timer_count:25,
        PowerState:false,
        zd_display:false,
        LdState:1,
      // 显示摇头角度选择模态框的状态，false表示隐藏，true表示显示
      timerRanges: ['取消','1h', '2h', '3h', '4h','5h','6h','7h','8h','9h','10h','11h','12h'],
      timerValue: 0,
      timerValuestring:"",
      remainingTime: 0,
      isCountingDown: false,
      // 风扇模型名称，可根据实际情况修改或从接口获取等
      model: 'FN8071SV18',
      // 风扇开关状态，false表示关闭，true表示打开
      fanOn: false,
      // 摇头功能状态，false表示关闭，true表示打开
      shakeOn: false,
      shakeOff: false,
      // 显示摇头角度选择模态框的状态，false表示隐藏，true表示显示
      showAngleModal: false,
      // 当前选择的摇头角度，初始化为60度
      shakeAngle: 45,
      // 风速档位，初始值为1档
      windSpeed: 1,
      // 控制定时选择器显示隐藏的状态，false表示隐藏，true表示显示
      showTimerPicker: false,
      // Wi-Fi连接状态，false表示未连接，true表示已连接
      wifiConnected: true,
      // 风扇动画相关配置（这里暂未详细设置动画内容，只是预留了数据绑定位置）
      fanAnimation: {},
      iconClassMap: {
        1: 'icon-a-xinhaowangluo-01',
        2: 'icon-a-xinhaowangluo-01',
        3: 'icon-a-xinhaowangluo-01',
        4: 'icon-a-xinhaowangluo-01',
        5: 'icon-a-xinhaowangluo-02',
        6: 'icon-a-xinhaowangluo-02',
        7: 'icon-a-xinhaowangluo-02',
        8: 'icon-a-xinhaowangluo-02',
        9: 'icon-a-xinhaowangluo-03',
        10: 'icon-a-xinhaowangluo-03',
        11: 'icon-a-xinhaowangluo-03',
        12: 'icon-a-xinhaowangluo-04'
      },
      // 用于存储各个按钮的相关状态
      buttonStates: {
        openBtn: {
          clicked: false,
          colorClass: 'default'
        },
        shakeOnBtn: {
          clicked: false,
          colorClass: 'default'
        },
        shakeOffBtn: {
          clicked: false,
          colorClass: 'default'
        },
        angleButtons: {
          '45': { clicked: false, colorClass: 'default' },
          '90': { clicked: false, colorClass: 'default' },
          '120': { clicked: false, colorClass: 'default' }
        }
      }
    },


    openfun_lx() {
        var that = this;
        openfuntimer = setInterval(function () {
          that. openfun();
        }, 30);
    },
    openfun_cancel() {
        clearInterval(openfuntimer)
    },
    onFanSwitch() {
        this.SendHexValue(0x81)
    },
    closefun:function (e) {
        this.SendHexValue(0xA0)
    },
    onShakeOn() {
        
        this.setData({
          shakeOn: true,
          'buttonStates.shakeOnBtn.clicked': true
        });

        if (this.data.shakeOn === true) {
          console.log('摇头功能已开启');
          // 显示风扇开启的提示信息（这里使用wx.showToast作为示例，你也可以根据需求选择wx.showModal等其他方式）
          wx.showToast({
              title: '摇头已开启120度',
              icon:'success',
              duration: 600
          });
      } 
        // 根据按钮点击状态设置按钮颜色相关样式类
        this.setButtonColor('btn', this.data.shakeOn);

        // 动态设置按钮的颜色类名，且设置摇头关按钮为默认颜色
        if (this.data.shakeOn) {
            this.setData({
                'buttonStates.shakeOnBtn.colorClass': 'active',
                'buttonStates.angleButtons[45].colorClass':'default',
                'buttonStates.angleButtons[90].colorClass':'default',
                'buttonStates.angleButtons[120].colorClass':'active'
            });
        } else {
            this.setData({
                'buttonStates.shakeOnBtn.colorClass': 'default',
                'buttonStates.angleButtons[45].colorClass':'default',
                'buttonStates.angleButtons[90].colorClass':'default',
                'buttonStates.angleButtons[120].colorClass':'active'
            });
        }
        
        this.SendHexValue(0x88);

    },
    onShakeOff() {

      this.setData({
          shakeOn: false, // 修改为false，表示摇头功能关闭
          'buttonStates.shakeOffBtn.clicked': true
      }, () => {
          // 在setData的回调函数中执行后续操作，确保数据更新完成
    
          if (this.data.shakeOn === false) {
              console.log('摇头功能已关闭');
              // 显示风扇开启的提示信息（这里使用wx.showToast作为示例，你也可以根据需求选择wx.showModal等其他方式）
              wx.showToast({
                  title: '摇头已关闭',
                  icon:'success',
                  duration: 600
              });
          }
    

          // 输出当前数据状态，方便调试查看
          console.log('当前shakeOn状态:', this.data.shakeOn);
          console.log('当前shakeOffBtn.clicked状态:', this.data.buttonStates.shakeOffBtn.clicked);
          console.log('当前shakeOffBtn.colorClass状态:', this.data.buttonStates.shakeOffBtn.colorClass);
    
          // 根据按钮点击状态设置按钮颜色相关样式类，修改为使用shakeOn的值
          this.setButtonColor('shake-off-btn', this.data.shakeOn); // 修改按钮类名为'shake-off-btn'，与HTML中绑定一致
    
          // 动态设置按钮的颜色类名，且设置摇头开按钮为默认颜色
          if (this.data.shakeOn) {
              this.setData({
                  'buttonStates.shakeOffBtn.colorClass': 'active',
                  'buttonStates.angleButtons[45].colorClass':'default',
                  'buttonStates.angleButtons[90].colorClass':'default',
                  'buttonStates.angleButtons[120].colorClass':'default'
              });
          } else {
              this.setData({
                  'buttonStates.shakeOffBtn.colorClass': 'default',
                  'buttonStates.angleButtons[45].colorClass':'default',
                  'buttonStates.angleButtons[90].colorClass':'default',
                  'buttonStates.angleButtons[120].colorClass':'default'
              });
          }
        }
      )
      


        this.SendHexValue(0x85);
    },
    timerfun() {
        this.SendHexValue(0x84)
    },
        // 选择具体摇头角度的函数
    // 选择具体摇头角度的函数
    selectAngle: function (e) {
        let angle = e.currentTarget.dataset.angle;

        // 获取所有角度按钮的状态数据
        const angleButtons = this.data.buttonStates.angleButtons;
  
        // 将所有角度按钮设置为默认状态
        for (let key in angleButtons) {
            angleButtons[key].colorClass = 'default';
        }
  
        // 将当前点击的角度按钮设置为激活状态
        angleButtons[angle].colorClass = 'active';
  
        // 更新数据，包括选择的角度和角度按钮的状态
        this.setData({
            shakeAngle: angle,
            showAngleModal: false,
            'buttonStates.angleButtons': angleButtons
        });


        // 这里可以添加设置摇头角度到设备的相关逻辑
        console.log('已选择摇头角度：', angle, '度');
        if(angle==45){



          this.SendHexValue(0x86);

          wx.showToast({
              title: '摇头已开45度',
              icon:'success',
              duration: 600
          });

        }
        else if(angle==90){
          this.SendHexValue(0x87);
          wx.showToast({
              title: '摇头已开启90度',
              icon:'success',
              duration: 600
          });
        }
        else if(angle=120){
          this.SendHexValue(0x88);
          wx.showToast({
              title: '摇头已开启120度',
              icon:'success',
              duration: 600
          });
        }
        wx.setStorageSync('selectedAngle', angle);
      },
          // 关闭摇头角度选择模态框的函数
    closeAngleModal: function () {
      this.setData({
      showAngleModal: false
      });
    },
    onShakeAngle: function () {
      this.setData({
        showAngleModal: true
      });
    },
  
 // 风速档位改变时的处理函数
 onWindSpeedChange: function (e) {
  this.setData({
    windSpeed: e.detail.value,
    currentIcon: this.data.iconClassMap[e.detail.value] || 'icon-a-xinhaowangluo-01'
  });
  // 可在此添加根据新风速档位发送指令到设备等操作逻辑
  console.log('风速档位已调整为：', this.data.windSpeed, '档');
      this.SendHexValue(0x90+this.data.windSpeed)
  },

  getIconClass: function(windSpeed) {
    console.log('[测试] 函数被调用，windSpeed=', windSpeed); // 确认函数是否执行
    return 'icon-a-xinhaowangluo-01'; // 直接返回静态可用类名
  },
   //不同档位更换icon
  //  getIconClass: function (windSpeed) {

  // //   console.log('[Debug] windSpeed:', windSpeed, 'Type:', typeof windSpeed);
  // // const iconClass = iconMap[windSpeed] || 'icon-a-xinhaowangluo-01';
  // // console.log('[Debug] Selected icon class:', iconClass);
  // // return iconClass;
  //   const iconMap = {
  //     1: 'icon-a-xinhaowangluo-01',
  //     2: 'icon-a-xinhaowangluo-01',
  //     3: 'icon-a-xinhaowangluo-01',
  //     4: 'icon-a-xinhaowangluo-01',
  //     5: 'icon-a-xinhaowangluo-02',
  //     6: 'icon-a-xinhaowangluo-02',
  //     7: 'icon-a-xinhaowangluo-02',
  //     8: 'icon-a-xinhaowangluo-02',
  //     9: 'icon-a-xinhaowangluo-03',
  //     10: 'icon-a-xinhaowangluo-03',
  //     11: 'icon-a-xinhaowangluo-03',
  //     12: 'icon-a-xinhaowangluo-04'
  //   };
  //   return iconMap[windSpeed] || 'icon-a-xinhaowangluo-01';
  // },

  
    // 显示定时选择器的函数
    showTimerPicker: function () {
      this.setData({
        //timerValue: this.data.initialTimerValue, //恢复初始状态
        showTimerPicker: true
      });
    },
  
  // 定时设置改变时的处理函数
  onTimerSet: function (e) {
    const selectedIndex = e.detail.value;
    //const selectedTime = selectedIndex === 0? 3600 : selectedIndex === 1? 7200 : selectedIndex === 2? 10800 : 14400;
    var selectedTimestring ="";
    // 这里可以处理倒计时逻辑，比如启动倒计时器等
    //console.log(`Selected time: ${selectedTime} seconds`);
    console.log(`Selected time: ${selectedIndex} seconds`);
    if(selectedIndex==1){
      this.SendHexValue(0xB1)
      selectedTimestring="1小时"
    }
    else if(selectedIndex==2){
      this.SendHexValue(0xB2)
      selectedTimestring="2小时"
    }
    else if(selectedIndex==3){
      this.SendHexValue(0xB3)
      selectedTimestring="3小时"
    }
    else if(selectedIndex==4){
      this.SendHexValue(0xB4)
      selectedTimestring="4小时"
    }
    else if(selectedIndex==5){
      this.SendHexValue(0xB5)
      selectedTimestring="5小时"
    }
    else if(selectedIndex==6){
      this.SendHexValue(0xB6)
      selectedTimestring="6小时"
    }
    else if(selectedIndex==7){
      this.SendHexValue(0xB7)
      selectedTimestring="7小时"
    }
    else if(selectedIndex==8){
      this.SendHexValue(0xB8)
      selectedTimestring="8小时"
    }
    else if(selectedIndex==9){
      this.SendHexValue(0xB9)
      selectedTimestring="9小时"
    }
    else if(selectedIndex==10){
      this.SendHexValue(0xBA)
      selectedTimestring="10小时"
    }
    else if(selectedIndex==11){
      this.SendHexValue(0xBB)
      selectedTimestring="11小时"
    }
    else if(selectedIndex==12){
      this.SendHexValue(0xBC)
      selectedTimestring="12小时"
    }
    else {
      this.SendHexValue(0xB0)
      selectedTimestring=""
    }
    
    this.setData({
      timerValue: selectedIndex,
      timerValuestring: selectedTimestring,
      showTimerPicker: false
    });
    //this.startCountdown();
    if(selectedIndex==0){
      wx.showToast({
          title: (`定时已取消`),
          icon:'success',
          duration: 800
      });
    }
    else {
      wx.showToast({
          title: (`定时设定: ${selectedIndex} 小时`),
          icon:'success',
          duration: 800
      });
    }


    // 这里可添加根据新设置的定时时间安排后续操作的逻辑，比如设置定时任务等
    },
    speed1() {
        this.SendHexValue(0x91)
    },
    speed2() {
        this.SendHexValue(0x92)
    },
    speed3() {
        this.SendHexValue(0x93)
    },
    speed4() {
        this.SendHexValue(0x94)
    },
    speed5() {
        this.SendHexValue(0X95)
    },
    speed6() {
        this.SendHexValue(0X96)
    },
    speed7() {
        this.SendHexValue(0X97)
    },
    speed8() {
        this.SendHexValue(0X98)
    },
    speed9() {
        this.SendHexValue(0X99)
    },
    speed10() {
        this.SendHexValue(0X9a)
    },
    speed11() {
    this.SendHexValue(0X9b)
    },
    speed12() {
        this.SendHexValue(0X9c)
    },
    timerfun1() {
        this.SendHexValue(0xB1)
    },
    timerfun2() {
        this.SendHexValue(0xB2)
    },
    timerfun3() {
        this.SendHexValue(0xB3)
    },
    timerfun4() {
        this.SendHexValue(0xB4)
    },
    timerfun5() {
        this.SendHexValue(0xB5)
    },
    timerfun6() {
        this.SendHexValue(0xB6)
    },
    timerfun7() {
        this.SendHexValue(0xB7)
    },
    timerfun8() {
        this.SendHexValue(0xB8)
    },
    timerfun9() {
        this.SendHexValue(0xB9)
    },
    timerfun10() {
        this.SendHexValue(0xBA)
    },
    goclear(){
        this.setData({
          recdata: "",
          rxCount: 0,
          txCount: 0,
        })
      }, 
      SendHexValue(hexvlaue){
        var timer_buffer = new ArrayBuffer(8) 
        let dataView = new DataView(timer_buffer)
        if((hexvlaue&0x80)==0x80){
          dataView.setUint8(0,0XC0)
        }
        else {
          dataView.setUint8(0,0XFC)
        };
        if((hexvlaue&0x40)==0x40){
          dataView.setUint8(1,0XC0)
        }
        else {
          dataView.setUint8(1,0XFC)
        };
        if((hexvlaue&0x20)==0x20){
          dataView.setUint8(2,0XC0)
        }
        else {
          dataView.setUint8(2,0XFC)
        };
        if((hexvlaue&0x10)==0x10){
          dataView.setUint8(3,0XC0)
        }
        else {
          dataView.setUint8(3,0XFC)
        };
        if((hexvlaue&0x8)==0x8){
          dataView.setUint8(4,0XC0)
        }
        else {
          dataView.setUint8(4,0XFC)
        };
        if((hexvlaue&0x4)==0x4){
          dataView.setUint8(5,0XC0)
        }
        else {
          dataView.setUint8(5,0XFC)
        };
        if((hexvlaue&0x2)==0x2){
          dataView.setUint8(6,0XC0)
        }
        else {
          dataView.setUint8(6,0XFC)
        };
        if((hexvlaue&0x1)==0x1){
          dataView.setUint8(7,0XC0)
        }
        else {
          dataView.setUint8(7,0XFC)
        };
        this.send_data_list(8,timer_buffer)
      },

      send_data_list(datalen,databuffer){
        let send_buffer = new ArrayBuffer(databuffer.byteLength+4) 
        let dataView = new DataView(send_buffer)
        let dataView1 = new DataView(databuffer)
        dataView.setUint8(0,0xC0)
        dataView.setUint8(1,0xC0)
        dataView.setUint8(2,0xFC)
        dataView.setUint8(3,0xC0)

        for (let i = 0; i < databuffer.byteLength; i++) {
            console.log(i);
            dataView.setUint8(i+4,dataView1.getUint8(i))
         }
         wx.vibrateShort({ type: 'heavy', style: 'heavy', fail(){} })

        this.gohexsend(send_buffer)
    },

    Countdown() {
        var that = this;
        timer = setTimeout(function () {
          console.log("----Countdown----");
          that.setData({
            rxRate: that.data.timRX*2,
            txRate: that.data.timTX*2,
          })
          that.setData({
            timRX: 0,
            timTX: 0,
          })
          that.Countdown();
        }, 500);
    }, 
    getBLEDeviceServices(deviceId) {
        var that = this
        this.data.readyRec = false
        wx.getBLEDeviceServices({
          deviceId,
          success: (res) => {
            var isService = false
            console.log("service size = ", res.services.length)
            for (let i = 0; i < res.services.length; i++) {
             // if (res.services[i].isPrimary) {
              if (this.serviceu == res.services[i].uuid){
                //this.showModalTips(this.serviceu+"\r找到服务UUID，正在读取所有特征值")
                isService = true
                this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
                this.setData({
                  connectState: "获取特征值"
                })
                }
            }
            if (!isService){ //没有找到服务
              this.setData({
                connectState: "UUID错误"
              })
             // this.showModalTips(this.serviceu +"\r找不到目标服务UUID  请确认UUID是否设置正确或重新连接")
            }
          }
        })
     },

     godisconnect() {
        if (this.data.connected){
          wx.closeBLEConnection({
            deviceId: this.data.deviceId
          })
          this.setData({
            connected: false,
            reconnect:"重新连接",
            connectState: "已断开",
          })
          wx.setNavigationBarTitle({
            title: "已断开 " + this.data.device.name
          })
         // this.showModalTips(this.data.device.name+"已断开连接...")
        }else{
          wx.setNavigationBarTitle({
            title: "正在连接 " + this.data.device.name
          })
          this.setData({
            connectState: "正在连接",
            reconnect: "连接中...",
          })
          wx.createBLEConnection({
            deviceId: this.data.deviceId,
            success: (res) => {
              this.setData({
                connected: true,
                connectState: "读取服务",
                reconnect: "断开连接",
                recdata: "",
                rxCount: 0,
                txCount: 0,
              })
              wx.setNavigationBarTitle({
                title: "已连接 " + this.data.device.name
              })
              this.getBLEDeviceServices(this.data.deviceId)
            }
          })
    
        }
      },
      getBLEDeviceCharacteristics(deviceId, serviceId) {
        const that = this
         wx.getBLEDeviceCharacteristics({
           deviceId,
           serviceId,
           success: (res) => {
             var ismy_service = false
             console.log("compute ", serviceId, this.serviceu)
             if (serviceId == this.serviceu) {
               ismy_service = true
               console.warn("this is my service ")
             }
             console.log('getBLEDeviceCharacteristics success', res.characteristics)
             for (let i = 0; i < res.characteristics.length; i++) {
               let item = res.characteristics[i]
               if (ismy_service){
                 console.log("-----------------------")
               }
               console.log("this properties = ", item.properties)
               if (item.properties.read) {
                 console.log("[Read]", item.uuid)
                 wx.readBLECharacteristicValue({
                   deviceId,
                   serviceId,
                   characteristicId: item.uuid,
                 })
               }
               if (item.properties.write) {
                 this.setData({
                   canWrite: true
                 })
                 console.log("[Write]",item.uuid)
                 this._deviceId = deviceId
                 if (ismy_service && (this.txdu == item.uuid)){
                   console.warn("find write uuid  ready to ", item.uuid)
                   this._characteristicId = item.uuid
                   this._serviceId = serviceId
                  // this.showModalTips(this.txdu+ "\r找到发送特征值")
                 }
                 //this.writeBLECharacteristicValue()
               }
               if (item.properties.notify || item.properties.indicate) {
                 console.log("[Notify]", item.uuid)
                 if (ismy_service && (this.rxdu == item.uuid)){
                   console.warn("find notity uuid try enablec....", item.uuid)
                  // this.showModalTips(this.rxdu + "\r正在开启通知...")
                   wx.notifyBLECharacteristicValueChange({  //开启通知
                     deviceId,
                     serviceId,
                     characteristicId: item.uuid,
                     state: true, 
                     success(res) {
                       console.warn('notifyBLECharacteristicValueChange success', res.errMsg)
                       that.setData({
                         connectState: "连接成功"
                       })
                      // that.showModalTips(that.rxdu + "\r开启通知成功")
                       that.data.readyRec=true
                     }
                   })
                 }
               }
             }
           },
           fail(res) {
             console.error('getBLEDeviceCharacteristics', res)
           }
         })
         // 操作之前先监听，保证第一时间获取数据
         wx.onBLECharacteristicValueChange((characteristic) => {
           var buf = new Uint8Array(characteristic.value)
           var nowrecHEX = ab2hex(characteristic.value)
           console.warn("rec: ", nowrecHEX, characteristic.characteristicId)
           var recStr = ab2Str(characteristic.value)
           console.warn("recstr: ", recStr, characteristic.characteristicId)
           if (this.rxdu != characteristic.characteristicId){
             console.error("no same : ", this.rxdu, characteristic.characteristicId)
             return
           }
           if (!this.data.readyRec)return
           var mrecstr
           if (this.data.hexRec){
             mrecstr = nowrecHEX
           }else{
             mrecstr = recStr
           }
           if (this.data.recdata.length>3000){
             this.data.recdata = this.data.recdata.substring(mrecstr.length, this.data.recdata.length)
           }
           console.warn("RXlen: ", buf.length)
           this.setData({
             recdata: this.data.recdata + mrecstr,
             rxCount: this.data.rxCount + buf.length,
             timRX: this.data.timRX+buf.length
           })
         })
       },
       writeBLECharacteristicValue() {
         // 向蓝牙设备发送一个0x00的16进制数据
         let buffer = new ArrayBuffer(1)
         let dataView = new DataView(buffer)
         dataView.setUint8(0, Math.random() * 255 | 0)
         wx.writeBLECharacteristicValue({
           deviceId: this._deviceId,
           serviceId: this._deviceId,
           characteristicId: this._characteristicId,
           value: buffer,
         })
       },
       gotoback:function(){
        /* if (this.data.device == null){
           wx.navigateTo({
             url: '/pages/_220125A001/_220125A001',
           })
            return
         }*/
         clearTimeout(timer)
         wx.closeBLEConnection({
           deviceId: this.data.deviceId
         })
         this.setData({
           connected: false,
           chs: [],
         })
        /* wx.navigateBack({
           delta: 1
         })*/
       },

       gohexsend(buffer1){
        if (!this.data.connected){
          //this.showModalTips("请先连接BLE设备...")
          this.onShow();
          return
        }
        var that = this;
      //  var buffer1

          
    
       // buffer1 = buffer2.buffer
        console.log("Txbuf = ",buffer1)
        if (buffer1==null)return
        const txlen = buffer1.byteLength
        wx.writeBLECharacteristicValue({
          deviceId: that._deviceId,
          serviceId: that._serviceId,
          characteristicId: that._characteristicId,
          value: buffer1,
          success: function (res) {
            // success
            that.setData({
              txCount: that.data.txCount + txlen,
              timTX:that.data.timTX+txlen
            })
            console.log("success  指令发送成功");
          },
          fail: function (res) {
            // fail
            console.log("1006",res);
           /* that.setData({
              connected: false,
              reconnect:"重新连接",
              connectState: "已断开",
            })*/
            wx.setNavigationBarTitle({
              title: "已断开 " + that.data.device.name
            })
            that.godisconnect();
          },
          complete: function (res) {
            // complete
          }
        })
      },

      gosend(){
        if (!this.data.connected){
        //  this.showModalTips("请先连接BLE设备...")
          return
        }
        var that = this;
        var hex = this.data.sendText //要发送的数据
        var buffer1
        if (this.data.hexSend){ //十六进制发送
          
          var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
            return parseInt(h, 16)
          }))
          
          console.log("hextobyte ", typedArray)
          buffer1 = typedArray.buffer
        }else{ //string发送
          var strbuf = new Uint8Array(stringToBytes(hex))
          console.log("strtobyte ", strbuf)
          buffer1 = strbuf.buffer
        }
        console.log("Txbuf = ",buffer1)
        if (buffer1==null)return
        const txlen = buffer1.byteLength
        wx.writeBLECharacteristicValue({
          deviceId: that._deviceId,
          serviceId: that._serviceId,
          characteristicId: that._characteristicId,
          value: buffer1,
          success: function (res) {
            // success
            that.setData({
              txCount: that.data.txCount + txlen,
              timTX:that.data.timTX+txlen
            })
            console.log("success  指令发送成功");
            console.log(res);
          },
          fail: function (res) {
            // fail
            console.log(res);
          },
          complete: function (res) {
            // complete
          }
        })
      }, hexsend: function (e) {
        console.log("checking ", e.detail.value)
        var selected //= e.target.dataset.checks ? false : true;
        if (e.detail.value.length == 0){
          selected=false
        }else{
          selected=true
        }
        this.setData({
          hexSend: selected,
        })
        console.log("hexsend ", this.data.hexSend)
      }, hexrec: function (e) {
        console.log("checking ")
        var selected //= e.target.dataset.checks ? false : true;
        if (e.detail.value.length == 0) {
          selected = false
        } else {
          selected = true
        }
        this.setData({
          hexRec: selected,
        })
        console.log("hexRec = ", this.data.hexRec)
      },
      showModalTips: function (str) {
        var that = this
        this.setData({
          showTips:str
        })
        // 显示遮罩层
        var animation = wx.createAnimation({
          duration: 200,
          timingFunction: "linear",
          delay: 0
        })
        this.animation = animation
        animation.translateY(300).step()
        this.setData({
          animationData: animation.export(),
          showModalStatus: true
        })
        setTimeout(function () {
          animation.translateY(0).step()
          this.setData({
            animationData: animation.export()
          })
        }.bind(this), 200)
        setTimeout(function () {
          that.hideModalTips();
        }, 2000)
      },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
   
        console.log("onLoad","onLoad")
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.godisconnect()
        console.log("onReady","onReady")
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        console.log("dd",app.globalData.ble_device.name.substr(0,3))
      if(app.globalData.ble_device.name.substr(0,2)=="KW"){
        app.globalData.mserviceuuid="0000FFE0-0000-1000-8000-00805F9B34FB"
        app.globalData.mtxduuid="0000FFE1-0000-1000-8000-00805F9B34FB"
        app.globalData.mrxduuid="0000FFE1-0000-1000-8000-00805F9B34FB"
      }
      else {
        app.globalData.mserviceuuid="0000F100-0000-1000-8000-00805F9B34FB"
        app.globalData.mtxduuid="0000F102-0000-1000-8000-00805F9B34FB"
        app.globalData.mrxduuid="0000F102-0000-1000-8000-00805F9B34FB"
      }
     //app.readSetting()
     this.setData({      //启动强制16进制发送
      hexSend: true,
  })
  this.setData({      //启动强制16进制接收
      hexRec: true,
  })
  this.setData({
    zd_display:true
})
  this.data.device = app.globalData.ble_device
  this.data.readyRec = false
  this.setData({
      autoSendInv : app.globalData.mautoSendInv,
      sendText : app.globalData.msendText,
  })
  // console.log("start ", this.data.autoSendInv, this.data.sendText)
  //this.Countdown() 
  //this.showModalTips("开始连接设备....")
  if (this.data.device == null){
      //this.calScrolHigh()
      return
  }
  const deviceId = this.data.device.deviceId
  this.setData({
      deviceadd: "MAC " + deviceId
  })
  //this.calScrolHigh()
  const name = this.data.device.name
  console.log("device = ", this.data.device)
  this.serviceu = app.globalData.mserviceuuid.toUpperCase()
  this.txdu = app.globalData.mtxduuid.toUpperCase()
  this.rxdu = app.globalData.mrxduuid.toUpperCase()
  console.log("target uuids = ",this.serviceu,this.txdu,this.rxdu)
  wx.setNavigationBarTitle({
      title: "正在连接 " + this.data.device.name
  })
  wx.createBLEConnection({
  deviceId,
  success: (res) => {
      this.setData({
      connected: true,
      name,
      deviceId,
      connectState: "读取服务",
      reconnect:"断开连接"
      })
      wx.setNavigationBarTitle({
      title: "已连接 " + this.data.device.name
      })
      //this.showModalTips("读取BLE所有服务")
      this.getBLEDeviceServices(deviceId)
  }
  })


      console.log("onShow","onShow")
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
      this.gotoback()
      console.log("onHide","onHide")
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
      this.gotoback()
      console.log("onUnload","onUnload")
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    // 辅助函数：根据按钮状态设置按钮颜色样式类
    setButtonColor: function (buttonClass, isActive) {
      const colorClass = isActive? 'active' : 'default';
      console.log('即将设置按钮颜色类名:', buttonClass, '为', colorClass);

    // 使用正确的键名格式来设置数据
      this.setData({
          [`buttonStates.${buttonClass}.colorClass`]: colorClass
      }, () => {
          // 在setData的回调函数中输出更新后的数据值
          console.log('已设置按钮颜色类名，当前数据中的值:', this.data[`buttonStates.${buttonClass}.colorClass`]);
      });
     }
 
    
})