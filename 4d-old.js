function get_elm(id) {
	return d.getElementById(id);
}
var resizeTimer;
var interval = 100;
var d = document;
var c1;
c1 = get_elm('cnvs');
var ctx;
var Points = [];
var lines = [];
var StartTime;
var Dimensions = 10;

//////////Sin,Cos//////////
var Sins = [];
for (var i = 0; i < 10000; i++) {
	Sins[i] = Math.sin((i / 10000) * 2 * Math.PI);
}

function sin(num) {
	return Sins[num];
} // num : 0 to 9999
function cos(num) {
	return Sins[(num + 2500) % 10000];
} // num : 0 to 9999

function c1_init() {
	if (c1.getContext) {
		ctx = c1.getContext('2d');
		ctx.fillStyle = '#000';
		ctx.globalCompositeOperation = 'source-over';
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}
	for (var i = 0; i < (1 << Dimensions); i++) {
		var Tmp = [];
		for (j = 0; j < Dimensions; j++) {
			if ((i & (1 << j)) == 0) lines.push([i, i + (1 << j)]);
			Tmp[j] = ((i & (1 << j)) == 0) ? 0 : 1;
		}
		Points[i] = (new Vector(Tmp)).MulNumber(4).AddNumber(-2);
	}
	KeysClear();
	StartTime = getTime();
}

function c1_resize() {
	var de = d.documentElement;
	var scale = Math.min((de.clientWidth - 20) / 16, (de.clientHeight - get_elm('end').offsetTop + get_elm('menu').offsetTop - 30) / 15);
	//console.log('resizing scale:' + Math.floor(scale));
	c1.height = (scale * 15) << 0;
	c1.width = (scale * 16) << 0;
}

function c1_paint() {
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle = '#000';
	ctx.lineWidth = 1;
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.globalCompositeOperation = 'lighter';
	//処理をくりかえす
	var i;
	var pos2d = [];
	var rnd = 0;
	var fov = 1 / Math.tan(45 * Math.PI / 360) / 10 * Math.max(ctx.canvas.width, ctx.canvas.height) * 0.5;
	var now = ((getTime() - StartTime) % 10000) << 0;
	//cos : 0 to 2PI
	var MoveVector = new Vector([0, 0, 5]);
	for (i = 0; i < Dimensions - 3; i++) {
		MoveVector.Data.push(5);
	}
	var rotCalc = function (i, j, rot) {
		var a = [];
		for (var k = 0; k < Dimensions; k++) {
			a[k] = [];
			for (var l = 0; l < Dimensions; l++) {
				a[k][l] = 0;
			}
			a[k][k] = 1;
		}
		a[i][i] = cos(rot);
		a[i][j] = -sin(rot);
		a[j][i] = sin(rot);
		a[j][j] = cos(rot);
		return new Matrix(a);
	} //i<j
	var tmppos = [].concat(Points);
	KeysReflush();
	for (i = 0; i < tmppos.length; i++) {
		if (PressNum >= 0) {
			Points[i] = Points[i].MulMatrix(rotCalc(Math.min(PressNum, PressNum2), Math.max(PressNum, PressNum2), 30));/////////////////////////////
		}
		var TmpVec = new Vector(Points[i].Data).AddVector(MoveVector);
		pos2d[i] = TmpVec.To2D(fov);
		pos2d[i].x = (pos2d[i].x + Math.random() * 2 * rnd - rnd + ctx.canvas.width / 2 + 0.5) << 0;
		pos2d[i].y = (pos2d[i].y + Math.random() * 2 * rnd - rnd + ctx.canvas.height / 2 + 0.5) << 0;
		ctx.fillStyle = '#aff';
		ctx.beginPath();
		var size = 40 / TmpVec.Distance();
		ctx.arc(pos2d[i].x, pos2d[i].y, size, 0, Math.PI * 2.0, true);
		ctx.fill();
	}
	ctx.beginPath();
	for (i = 0; i < lines.length; i++) {
		//if(pos2d[lines[i][0]].visible || pos2d[lines[i][1]].visible){
		//ランダムな色を生成//'rgb(' + ((Math.random() * 128 + 127) << 0) + ',' + ((Math.random() * 128 + 127) << 0) + ',' + ((Math.random() * 128 + 127) << 0) + ')';
		//始点を移動
		ctx.moveTo(pos2d[lines[i][0]].x, pos2d[lines[i][0]].y);
		//線を描く
		ctx.lineTo(pos2d[lines[i][1]].x, pos2d[lines[i][1]].y);
		//}
	}
	ctx.strokeStyle = '#aaa';
	ctx.stroke();
}


function c1_loop() {
	c1_paint();
	requestAnimationFrame(c1_loop);
}
//////////KeyInput////////////L R
var PressNum; //公開
var PressNum2; //公開
//キーボード入力限定
var KeyPress = [];
var KeyPress2 = [];
document.onkeydown = function (e) {
	if (!e) e = window.event;
	if (e.keyCode >= 49 && e.keyCode <= 49 + Dimensions - 1) {
		KeyPress[e.keyCode - 49] = true;
	} else if (e.keyCode >= 97 && e.keyCode <= 97 + Dimensions - 1) {
		KeyPress2[e.keyCode - 97] = true;
	}
};
document.onkeyup = function (e) {
	if (!e) e = window.event;
	if (e.keyCode >= 49 && e.keyCode <= 49 + Dimensions - 1) {
		KeyPress[e.keyCode - 49] = false;
	} else if (e.keyCode >= 97 && e.keyCode <= 97 + Dimensions - 1) {
		KeyPress2[e.keyCode - 97] = false;
	}
};

function KeysClear() {
				PressNum = -1;
				PressNum2 = 1;
	for (var i = 0; i < Dimensions; i++) {
		KeyPress[i] = false;
		KeyPress2[i] = false;
	}
}
window.onblur = KeysClear;

function KeysReflush() {
	PressNum = -1;
	for (var i = 0; i < KeyPress.length; i++) {
		if (KeyPress[i]) PressNum = i;
		if (KeyPress2[i]) PressNum2 = i;
	}
	get_elm('rotatestate').innerText = (1 + PressNum) + " : " + (1 + PressNum2);
}

//----------------------------------------------------------//
window.onresize = function (event) {
	if (resizeTimer) {
		clearTimeout(resizeTimer);
	}
	resizeTimer = setTimeout(function () {
		c1_resize();
	}, interval);
};
window.onload = function (event) {
	c1_init();
	c1_resize();
	c1_loop();
};
var now = window.performance && (performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow);
window.getTime = function () {
	return (now && now.call(performance)) || (new Date().getTime());
};
//////////Vector//////////
/**
 * @constructor
 */
var Vector = function (_array) {
	this.Data = [].concat(_array);
};
Vector.prototype.MulNumber = function (_num) {
	for (var i = 0; i < this.Data.length; i++) {
		this.Data[i] *= _num;
	}
	return this;
};
Vector.prototype.AddNumber = function (_num) {
	for (var i = 0; i < this.Data.length; i++) {
		this.Data[i] += _num;
	}
	return this;
};
Vector.prototype.AddVector = function (_vector) {
	for (var i = 0; i < this.Data.length; i++) {
		this.Data[i] += _vector.Data[i];
	}
	return this;
};
Vector.prototype.MulMatrix = function (_matrix) {
	var sum;
	var _data;
	_data = [].concat(this.Data);
	for (var i = 0; i < this.Data.length; i++) {
		sum = 0;
		for (var j = 0; j < this.Data.length; j++) {
			sum += _data[j] * _matrix.Data[i][j];
		}
		this.Data[i] = sum;
	}
	return this;
};
Vector.prototype.Minus = function () {
	for (var i = 0; i < this.Data.length; i++) {
		this.Data[i] = -this.Data[i];
	}
	return this;
};
Vector.prototype.To2D = function (_fov) {
	var ans = {};
	var tmp = [].concat(this.Data);
	ans.visible = true;
	for (var i = this.Data.length - 1; i >= 2; i--) {
		if (tmp[i] < 1) ans.visible = false;
		for (var j = 0; j < i; j++) {
			tmp[j] /= tmp[i];
			tmp[j] *= _fov;
		}
	}
	ans.x = tmp[0];
	ans.y = tmp[1];
	return ans;
};
Vector.prototype.Distance = function () {
	var a = 0;
	for (var i = 0; i < this.Data.length; i++) {
		a += this.Data[i] * this.Data[i];
	}
	return Math.sqrt(a);
};
//////////Matrix//////////
/**
 * @constructor
 */
var Matrix = function (_arrays) {
	this.Data = [].concat(_arrays);
};
Matrix.prototype.AddNumber = function (_num) {
	for (var i = 0; i < this.Data.length; i++) {
		for (var j = 0; j < this.Data.length; j++) {
			this.Data[i][j] += _num;
		}
	}
	return this;
};
Matrix.prototype.MulNumber = function (_num) {
	for (var i = 0; i < this.Data.length; i++) {
		for (var j = 0; j < this.Data.length; j++) {
			this.Data[i][j] *= _num;
		}
	}
	return this;
};
Matrix.prototype.AddMatrix = function (_matrix) {
	for (var i = 0; i < this.Data.length; i++) {
		for (var j = 0; j < this.Data.length; j++) {
			this.Data[i][j] += _matrix.Data[i][j];
		}
	}
	return this;
};
Matrix.prototype.Minus = function () {
	for (var i = 0; i < this.Data.length; i++) {
		for (var j = 0; j < this.Data.length; j++) {
			this.Data[i][j] = -this.Data[i][j];
		}
	}
	return this;
};
//------------------------------------------------------------//
document.body.removeChild(get_elm('message'));