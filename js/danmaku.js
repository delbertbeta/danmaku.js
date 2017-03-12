var Danmaku = function (option) {
    option && this.init(option);
    return this;
};
// 定义弹幕初始化函数
Danmaku.prototype.init = function (option) {
    // 如果没有检测到初始化配置中含有视频的DOM元素则不继续下一步操作
    if (!option.videoEl) {
        throw Error('No Video Element to attach!');
    } else {
        // 将弹幕和视频放到同一个div下
        this.videoEl = option.videoEl;
        this.video = document.getElementById(this.videoEl);
        var videoContainer = this.video.parentElement;
        this.stage = document.createElement('div');
        videoContainer.insertBefore(this.stage, this.video);
        this.video.style.position = 'absolute';
        this.stage.appendChild(this.video);
        this.danmakuArea = document.createElement('div');
        this.danmakuArea.style.cssText = 'overflow: hidden; white-space: nowrap; transform: translateZ(0px); position: relative; pointer-events: none;';
        this.resize();
        this.stage.appendChild(this.danmakuArea);
    }
    this.speed = option.speed || 5;
    if (typeof option.isLive == 'undefined') {
        this.isLive = false;
    } else {
        this.isLive = option.isLive;
    }
    this.fontSize = option.fontSize || 20;
    this.danmakuList = [];
};

// 重设弹幕区域的大小
Danmaku.prototype.resize = function () {
    // 如果当时视频的长宽还未加载，则重试
    if (this.video.clientHeight == 0) {
        var that = this;
        setTimeout(function () {
            that.resize();
        }, 100);
    } else {
        this.danmakuArea.style.height = this.video.clientHeight + 'px';
        this.danmakuArea.style.width = this.video.clientWidth + 'px';
        this.height = this.video.clientHeight;
        this.width = this.video.clientWidth;
    }
};

// 计算弹幕出现位置
Danmaku.prototype.positionCalculator = function (dmk, list) {
    var that = this;

    function setX() {
        var now = Date.now() / 1000;
        var progress = (now - dmk.startTime) / that.speed;
        var total = that.width + dmk.node.offsetWidth;
        dmk.x = that.width - (total * progress);
    }

    var lineHeight = dmk.node.offsetHeight;
    if (dmk.position == 'normal') {
        if (typeof dmk.x == 'undefined') {
            var that = this;
            // 检测是否发生重叠
            function checkMovement(oldDmk) {
                if (oldDmk.x + oldDmk.text.length * that.fontSize < that.width) {
                    return true;
                } else {
                    return false;
                }
            }
            var lineState = [];
            for (let i = 0; i < list.length; i++) {
                if (list[i].position == 'normal' && typeof list[i].y != 'undefined') {
                    var y = list[i].y;
                    if (lineState[y]) {
                        lineState[y].push(list[i]);
                    } else {
                        lineState[y] = [];
                        lineState[y].push(list[i]);
                    }
                }
            }
            var line = 0;
            for (line; typeof lineState[line] != 'undefined'; line = line + lineHeight + 2) {
                if (checkMovement(lineState[line][(lineState[line].length - 1)]) == true) {
                    dmk.y = line;
                    setX();
                    return;
                }
            }
            dmk.y = line;
            setX();
            return;
        } else {
            setX();
        }
    }

    if (dmk.position == 'top') {
        if (dmk.y) {
            return;
        } else {
            dmk.x = (this.width / 2) - (dmk.node.offsetWidth / 2);
            var counter = 0;
            for (let i = 0; i < list.length; i++) {
                if (list[i].position == 'top' && typeof list[i].y != 'undefined') {
                    counter++;
                }
            }
            dmk.y = (lineHeight * counter - 1) + (2 * counter);
        }
    }

    if (dmk.position == 'buttom') {
        if (dmk.y) {
            return;
        } else {
            dmk.x = (this.width / 2) - (dmk.node.offsetWidth / 2);
            var counter = 0;
            for (let i = 0; i < list.length; i++) {
                if (list[i].position == 'buttom' && typeof list[i].y != 'undefined') {
                    counter++;
                }
            }
            dmk.y = this.height - (lineHeight * (counter + 1)) - (2 * counter);
        }
    }

}

// 向弹幕div中添加元素
Danmaku.prototype.createNode = function (dmk) {
    var dmkNode = document.createElement('div');
    dmkNode.style.position = 'absolute';
    dmkNode.style.fontSize = this.fontSize + 'px';
    dmkNode.style.textShadow = '0px 0px 2px #000000';
    dmkNode.style.color = dmk.color;
    dmkNode.textContent = dmk.text;
    return dmkNode;
}

// 渲染弹幕
Danmaku.prototype.render = function () {
    if (this.isLive) {
        var runningList = [];
        // 筛选时间条件满足的弹幕
        for (let i = 0; i < this.danmakuList.length; i++) {
            var now = Date.now() / 1000;
            var dmk = this.danmakuList[i];
            if (now - dmk.startTime < this.speed) {
                runningList.push(dmk);
            } else {
                this.danmakuArea.removeChild(dmk.node);
            }
        }
        var danmakuNode = document.createDocumentFragment();

        if (runningList.length == 0) {
            this.danmakuList = runningList;
            return;
        }

        // 预渲染弹幕
        for (let i = 0; i < runningList.length; i++) {
            var thisDmk = runningList[i];
            if (thisDmk.node) {
                continue;
            } else {
                thisDmk.node = this.createNode(thisDmk);
                thisDmk.node.style.transform = 'translate(' + this.width + 'px, ' + 'px)';
                danmakuNode.appendChild(thisDmk.node);
            }
        }
        this.danmakuArea.appendChild(danmakuNode);

        for (let i = 0; i < runningList.length; i++) {
            var thisDmk = runningList[i];
            this.positionCalculator(thisDmk, runningList);
            thisDmk.node.style.transform = 'translate(' + thisDmk.x + 'px, ' + thisDmk.y + 'px)';
            danmakuNode.appendChild(thisDmk.node);
        }
        this.danmakuList = runningList;
        this.danmakuArea.appendChild(danmakuNode);
    } else {
        throw Error('Developing....');
    }
}

var animationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function (callback) {
        return setTimeout(callback, 50 / 3);
    };


var cancelAnimationFrame =
    window.cancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    clearTimeout;



Danmaku.prototype.play = function () {
    var that = this;

    function call() {
        that.render();
        that.requestId = animationFrame(call);
    }
    this.requestId = animationFrame(call);
}

Danmaku.prototype.pause = function () {
    cancelAnimationFrame(this.requestId);
}

// 在直播流中插入一条弹幕
Danmaku.prototype.push = function (danmaku) {
    if (this.isLive) {
        var now = Date.now() / 1000;
        this.danmakuList.push({
            color: danmaku.color || '#ffffff',
            text: danmaku.text || '',
            startTime: now,
            position: danmaku.position || 'normal',
        })
    } else {
        throw Error('It\'s not a live stream. Please contains a danmaku list when initializing.');
    }
}