process.on('message', function (data) {
	switch (data.type) {
		case 'setTimes':
		times = data.data
		break;
		case 'getTimes':
		process.send(times)
		break;
		case 'contDown':
		contDown(data.data)
		break;
		case 'finish':
		clearInterval(twhite)
		clearInterval(tblack)
		process.exit()
		break;
	}	
})
var tblack= 1;
var twhite= 1;

var lastTime = 0
var  times= {
	white: 1 * 60,
	black: 1 * 60
}
var contDown = function (turn) {
	clearInterval(twhite)
	clearInterval(tblack)
	if (turn === 'white') {
		twhite = setInterval(function () {
			times[turn]= times[turn] - 1
			if(times[turn]<=-1){
				times[turn] = 0
				clearInterval(twhite)
				clearInterval(tblack)
			}
			process.send(times)			
		},1000)
	}else {
		tblack = setInterval(function () {
			times[turn]= times[turn] - 1
			if(times[turn]<=-1){
				times[turn] = 0
				clearInterval(twhite)
				clearInterval(tblack)
			}
			process.send(times)			
		},1000)
	}
}
var getTimes = function () {
	return times
}
var setTimes = function (newtimes) {
	times= newtimes
	lastTime = new Date().getTimes()
}