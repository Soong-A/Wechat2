Page({
    data: {
      timerRanges: ['1h', '2h', '3h', '4h'],
      timerValue: 0,
      remainingTime: 0,
      isCountingDown: false,
      // 风扇模型名称，可根据实际情况修改或从接口获取等
      model: '智能风扇型号X',
      // 风扇开关状态，false表示关闭，true表示打开
      fanOn: false,
      // 摇头功能状态，false表示关闭，true表示打开
      shakeOn: false,
      shakeOff: false,
      // 显示摇头角度选择模态框的状态，false表示隐藏，true表示显示
      showAngleModal: false,
      // 当前选择的摇头角度，初始化为60度
      shakeAngle: 60,
      // 风速档位，初始值为1档
      windSpeed: 1,
      // 控制定时选择器显示隐藏的状态，false表示隐藏，true表示显示
      showTimerPicker: false,
      // Wi-Fi连接状态，false表示未连接，true表示已连接
      wifiConnected: true,
      // 风扇动画相关配置（这里暂未详细设置动画内容，只是预留了数据绑定位置）
      fanAnimation: {},
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
        }
      }
    },
    onLoad: function () {
      // 从缓存中获取风扇开关状态，如果缓存中不存在，则使用默认值false
      const cachedFanOn = wx.getStorageSync('fanOn') || false;
      this.setData({
          fanOn: cachedFanOn
      });

      // 从缓存中获取摇头功能状态，同样如果不存在则用默认值false
      const cachedShakeOn = wx.getStorageSync('shakeOn') || false;
      this.setData({
          shakeOn: cachedShakeOn
      });

      // 从缓存中获取风速档位，若不存在则为初始值1档
      const cachedWindSpeed = wx.getStorageSync('windSpeed') || 1;
      this.setData({
          windSpeed: cachedWindSpeed
      });

      // 初始化一些按钮状态，比如根据当前风扇开关状态设置打开按钮的颜色类
      this.initButtonStates();
      
  },

  // 初始化按钮状态的函数
  initButtonStates: function () {
      const openBtnColorClass = this.data.fanOn? 'active' : 'default';
      const shakeOnBtnColorClass = this.data.shakeOn? 'active' : 'default';
      const shakeOffBtnColorClass = this.data.shakeOn? 'default' : 'active';

      this.setData({
          'buttonStates.openBtn.colorClass': openBtnColorClass,
          'buttonStates.shakeOnBtn.colorClass': shakeOnBtnColorClass,
          'buttonStates.shakeOffBtn.colorClass': shakeOffBtnColorClass
      });
  },
    // 打开或关闭风扇的函数
    onFanSwitch: function () {
      this.setData({
          fanOn:!this.data.fanOn,
          'buttonStates.openBtn.clicked': true
      });

      if (this.data.fanOn === true) {
          console.log("open");
          // 显示风扇开启的提示信息（这里使用wx.showToast作为示例，你也可以根据需求选择wx.showModal等其他方式）
          wx.showToast({
              title: '风扇已开启',
              icon:'success',
              duration: 2000
          });
      } 

      // 根据按钮点击状态设置按钮颜色相关样式类
      try {
          this.setButtonColor('open-btn', this.data.fanOn);
      } catch (error) {
          console.error('设置按钮颜色时出错:', error);
      }

      // 动态设置按钮的颜色类名
      if (this.data.fanOn) {
          this.setData({
              'buttonStates.openBtn.colorClass': 'active'
          });
      } else {
          this.setData({
              'buttonStates.openBtn.colorClass': 'default'
          });
      }

      // 这里可以添加更多与风扇开关相关的逻辑，比如发送指令到设备等
  },

  
    // 打开摇头功能的函数
    onShakeOn: function () {
    this.setData({
        shakeOn: true,
        'buttonStates.shakeOnBtn.clicked': true
    });

    if (this.data.shakeOn === true) {
      console.log('摇头功能已开启');
      // 显示风扇开启的提示信息（这里使用wx.showToast作为示例，你也可以根据需求选择wx.showModal等其他方式）
      wx.showToast({
          title: '摇头已开启',
          icon:'success',
          duration: 2000
      });
  } 
    // 根据按钮点击状态设置按钮颜色相关样式类
    this.setButtonColor('btn', this.data.shakeOn);

    // 动态设置按钮的颜色类名，且设置摇头关按钮为默认颜色
    if (this.data.shakeOn) {
        this.setData({
            'buttonStates.shakeOnBtn.colorClass': 'active',
        });
    } else {
        this.setData({
            'buttonStates.shakeOnBtn.colorClass': 'default'
        });
    }

    // 同样可添加与开启摇头功能相关的后续操作逻辑
    },
  
    // 关闭摇头功能的函数
    // 关闭摇头功能的函数
onShakeOff: function () {
    this.setData({
        shakeOn: true,
        'buttonStates.shakeOffBtn.clicked': true
    });
    if (this.data.shakeOn === true) {
      console.log('摇头功能已关闭');
      // 显示风扇开启的提示信息（这里使用wx.showToast作为示例，你也可以根据需求选择wx.showModal等其他方式）
      wx.showToast({
          title: '摇头已关闭',
          icon:'success',
          duration: 2000
      });
  } 
    // 输出当前数据状态，方便调试查看
    console.log('当前shakeOn状态:', this.data.shakeOn);
    console.log('当前shakeOffBtn.clicked状态:', this.data.buttonStates.shakeOffBtn.clicked);
    console.log('当前shakeOffBtn.colorClass状态:', this.data.buttonStates.shakeOffBtn.colorClass);

    // 根据按钮点击状态设置按钮颜色相关样式类，修改为使用shakeOn的值
    this.setButtonColor('btn', this.data.shakeOn);

    // 动态设置按钮的颜色类名，且设置摇头开按钮为默认颜色
    if (this.data.shakeOn) {
        this.setData({
            'buttonStates.shakeOffBtn.colorClass': 'active',
        });
    } else {
        this.setData({
            'buttonStates.shakeOffBtn.colorClass': 'default'
        });
    }

    // 比如停止发送摇头相关指令等操作可在此添加
},
    // 打开摇头角度选择模态框的函数
    onShakeAngle: function () {
      this.setData({
        showAngleModal: true
      });
    },
  
    // 选择具体摇头角度的函数
    selectAngle: function (e) {
      let angle = e.currentTarget.dataset.angle;
      const buttonClass = e.currentTarget.dataset.buttonClass || 'angle-btn'; // 假设按钮有一个自定义属性 data-button-class，如果没有则使用默认的 'angle-btn'

      // 设置按钮为激活状态（即改变颜色）
      this.setButtonColor(buttonClass, true);

      this.setData({
          shakeAngle: angle,
          showAngleModal: false
      });

      // 这里可以添加设置摇头角度到设备的相关逻辑
      console.log('已选择摇头角度：', angle, '度');

      // 在短暂延迟后（例如500毫秒）将按钮颜色恢复为默认，以实现点击瞬间变色效果
      setTimeout(() => {
          this.setButtonColor(buttonClass, false);
      }, 500);
  },
  
    // 关闭摇头角度选择模态框的函数
    closeAngleModal: function () {
      this.setData({
      showAngleModal: false
      });
    },
  
    // 风速档位改变时的处理函数
    onWindSpeedChange: function (e) {
      this.setData({
        windSpeed: e.detail.value
      });
      // 可在此添加根据新风速档位发送指令到设备等操作逻辑
      console.log('风速档位已调整为：', this.data.windSpeed, '档');
      },

      timerValueToTimeMap: {
        0: 3600,
        1: 7200,
        2: 10800,
        3: 14400
      },
    // 显示定时选择器的函数
    showTimerPicker: function () {
      this.setData({
        timerValue: this.data.initialTimerValue, //恢复初始状态
        showTimerPicker: true
      });
    },

    startCountdown: function () {
      // 直接从映射对象中获取对应的时间值
      const selectedTime = this.timerValueToTimeMap[this.data.timerValue];
      this.setData({
        remainingTime: selectedTime,
        isCountingDown: true
      });
      const countdownInterval = setInterval(() => {
        this.setData({
          remainingTime: this.data.remainingTime - 1
        });
        if (this.data.remainingTime <= 0) {
          clearInterval(countdownInterval);
          this.setData({
            isCountingDown: false
          });
          // 这里可以添加倒计时结束后的操作，比如触发提醒等
        }
      }, 1000);
    },
  
    // 定时设置改变时的处理函数
    onTimerSet: function (e) {
      const selectedIndex = e.detail.value;
  
      // 创建一个对象来映射selectedIndex与对应的时间值（单位：秒）
      const selectedIndexToTimeMap = {
        0: 3600,
        1: 7200,
        2: 10800,
        3: 14400
      };
  
      // 直接从映射对象中获取对应的时间值
      const selectedTime = selectedIndexToTimeMap[selectedIndex];
  
      // 这里可以处理倒计时逻辑，比如启动倒计时器等
      console.log(`Selected time: ${selectedTime} seconds`);
      this.setData({
        timerValue: selectedIndex,
        showTimerPicker: false
      });
      this.startCountdown();
      // 这里可添加根据新设置的定时时间安排后续操作的逻辑，比如设置定时任务等
    },

  
    // 辅助函数：根据按钮状态设置按钮颜色样式类
    // 辅助函数：根据按钮状态设置按钮颜色样式类
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
  });