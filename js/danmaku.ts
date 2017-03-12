interface danmakuOption {
    url: string,
    videoEl: string,
    isLive: boolean,
}

interface danmaku {
    time: number,
    text: string,
    color: string,
    // #ffffff
    position: string
    //  normal  bottum  top
}

let Danmaku = function (option: danmakuOption) {
    option && this.init(option);
    return this;
}


// 定义弹幕初始化函数
Danmaku.prototype.init = function (option) {
    // 如果没有检测到初始化配置中含有视频的DOM元素则不继续下一步操作
    if (!option.videoEl) {
        throw Error('No Video Element to attach!');
    } else {
        // 将弹幕和视频放到同一个div下
        this.videoEl = option.videoEl;
        this.video = document.getElementById(this.videoEl) as HTMLMediaElement;
        let videoContainer = this.video.parentElement as HTMLElement;
        this.stage = document.createElement('div') as HTMLElement;
        this.video.style.position = 'absolute';
        this.stage.appendChild(this.video);

        this.danmakuArea = document.createElement('div') as HTMLElement;
        this.danmakuArea.style.cssText = 'overflow: hidden; white-space: nowrap; transform: translateZ(0px); position: relative; pointer-events: none;';
        this.resize();

        this.stage.appendChild(this.danmakuArea);
        
        videoContainer.insertBefore(this.stage, this.videoDom);
    }
}

// 重设弹幕区域的大小
Danmaku.prototype.resize = function() {
    this.danmakuArea.style.height = this.video.clientHeight + 'px';
    this.danmakuArea.style.width = this.video.clientWidth + 'px';
}