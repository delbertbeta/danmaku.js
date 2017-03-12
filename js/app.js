var danmaku = new Danmaku({
    url: '232332',
    videoEl: 'testVideo',
    speed: 10,
    fontSize: 24,
    isLive: true,
});

danmaku.play();

document.getElementById('normalButton').addEventListener('click', function() {
    danmaku.push({text: '2333333'});
})

document.getElementById('topButton').addEventListener('click', function() {
    danmaku.push({text: '2333333', position: 'top'});
})

document.getElementById('buttomButton').addEventListener('click', function() {
    danmaku.push({text: '2333333', position: 'buttom'});
})