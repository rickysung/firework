var timer_tick = 100;
var opac;
var fireNum;
var then = Date.now();
var now;
var fps = 60;
var interval = 1000/fps;
var width;
var height;
function start()
{
	init();
}
function init(){
	var ctx = document.getElementById('firework').getContext('2d');
	timer_tick =100;
	var tmprandom = Math.floor(Math.random()*1000000)%6;
	width = ctx.canvas.width;
	height = ctx.canvas.height;
	switch(tmprandom)
	{
		// FireInit(Explode Location, fireNum(<30), fire velocity, fire Color)
		case 0:// Basic Explosion
		{
			fireNum = Math.floor(getRandom(3,6));
			fireWorks = new Array(fireNum);
			for(var i=0 ; i<fireNum ; i++)
			{
				var tempP = new Point3D(getRandom(width*1/5,width*4/5),getRandom(height/7,height/2),getRandom(-500,500));
				var exdelay = getRandom(0,50);
				var exduration = getRandom(100,110);
				var fcolor = firecolor[Math.floor(getRandom(0,5))][Math.floor(getRandom(0,4))];
				fireWorks[i] = new SingleFire();
				fireWorks[i].FireInit(tempP, 25 - fireNum, 10, fcolor, exdelay, exduration-fireNum*5);
				var time = exdelay + exduration - fireNum*5;	
				if(timer_tick < time)
				{
					timer_tick = time;
				}
			}
			break;
		}
		case 1:// 3 Color Explosion
		{
			fireNum = Math.floor(getRandom(1,4));
			for(var i=0 ; i<fireNum*3 ; i+=3)
			{
				var tempP = new Point3D(getRandom(width*1/5,width*4/5), getRandom(height/7,height/2), getRandom(-500,500));
				var exdelay = getRandom(0,50);
				var exduration = getRandom(130,150);
				var fcolor = firecolor[Math.floor(getRandom(0,5))][Math.floor(getRandom(0,4))];
				var fcolor_light = firecolor_light[Math.floor(getRandom(0,5))][Math.floor(getRandom(0,3))];
				var fcolor_light2 = firecolor_light[Math.floor(getRandom(0,5))][Math.floor(getRandom(0,3))];
				fireWorks[i] = new SingleFire();
				fireWorks[i+1] = new SingleFire();
				fireWorks[i+2] = new SingleFire();
				fireWorks[i].FireInit(tempP, 20, 9, fcolor, exdelay, exduration);
				fireWorks[i+1].FireInit(tempP, 17, 7, fcolor_light, exdelay+10, exduration);
				fireWorks[i+2].FireInit(tempP, 15, 5, fcolor_light2, exdelay+20, exduration);
				var time = exdelay + 20 + exduration;
				if(timer_tick < time)
				{
					timer_tick = time;
				}
			}
			fireNum*=3;
			break;
		}
		case 2:// Galaxy Explosion
		{
			fireNum = Math.floor(getRandom(100,120));
			var basecolor = firecolor[Math.floor(getRandom(0,5))];
			for(var i=0 ; i<fireNum ; i++)
			{
				var tempP = new Point3D(getRandom(0,width), getRandom(height*2/7,height*4/7), getRandom(-500,500));
				var exdelay = getRandom(30,50);
				var exduration = getRandom(40,50);
				var fcolor = basecolor[Math.floor(getRandom(0,4))];
				fireWorks[i] = new SingleFire();
				fireWorks[i].FireInit(tempP, 7, 3, fcolor, exdelay, exduration);
				var time = exdelay + exduration;
				if(timer_tick < time)
				{
					timer_tick = time;
				}
			}
			break;
		}
		case 3://Massive Explosion
		{
			fireNum = 1;
			var taillength = 3;
			var tempP = new Point3D(getRandom(width*2/5,width*3/5), getRandom(height/7,height/2), getRandom(-500,500));
			var exdelay = getRandom(0,50);
			var exduration = getRandom(90,120);
			var v = Math.floor(getRandom(0,5));
			var fcolor = firecolor[v][Math.floor(getRandom(0,4))];
			var fcolor_light = firecolor_light[v][Math.floor(getRandom(0,3))];
			var velocity = 10;
			var div = 30;
			fireWorks[0] = new SingleFire();
			fireWorks[0].FireInit(tempP, div, velocity, fcolor, exdelay, exduration);
			for(var i=1 ; i<fireNum*taillength ; i++)
			{
				exdelay+=1;				
				fireWorks[i] = new SingleFire();
				fireWorks[i].FireInit(tempP, div, velocity, fcolor_light, exdelay, exduration);
				fireWorks[i].firePoints = [];
				fireWorks[i].fireVectors = [];
				for(var j=0 ; j<fireWorks[0].fn ; j++)
				{
					fireWorks[i].firePoints[j] = new Point3D(fireWorks[0].firePoints[j].X, fireWorks[0].firePoints[j].Y, fireWorks[0].firePoints[j].Z);
					fireWorks[i].fireVectors[j] =new Vector3D(fireWorks[0].fireVectors[j].mag, new Point3D(fireWorks[0].fireVectors[j].point.X, fireWorks[0].fireVectors[j].point.Y, fireWorks[0].fireVectors[j].point.Z));
					fireWorks[i].firePoints[j].color = fcolor_light;
				}				
			}
			var time = exdelay +exduration;
			if(timer_tick < time)
			{
				timer_tick = time;
			}
			fireNum *= taillength;
			break;
		}
		case 4://Smile Explosion
		{
			fireNum = Math.floor(getRandom(7,12));
			fireWorks = new Array(fireNum);
			for(var i=0 ; i<fireNum ; i++)
			{
				var tempP = new Point3D(getRandom(width*1/5,width*4/5), getRandom(height/7,height/2), getRandom(-500,500));
				var exdelay = getRandom(0,70);
				var exduration = getRandom(110,120);
				var fcolor = firecolor_light[Math.floor(getRandom(0,5))][Math.floor(getRandom(0,3))];
				fireWorks[i] = new SmileFire();
				fireWorks[i].FireInit(tempP, 40, 7, fcolor, exdelay, exduration-fireNum*5);
				var time = exdelay + exduration - fireNum*5;	
				if(timer_tick < time)
				{
					timer_tick = time;
				}
			}
			break;
		}
		case 5://Double Explosion
		{
			fireNum = getRandom(70,80);
			fireWorks = [];
			var tempP = new Point3D(getRandom(width*5/11,width*7/11), height*2/7, getRandom(-500,500));
			var exdelay = 0;
			var exduration = getRandom(100,110);
			var fcolor = firecolor[Math.floor(getRandom(0,5))][Math.floor(getRandom(0,4))];
			var fcolor_light = firecolor_light[Math.floor(getRandom(0,5))][Math.floor(getRandom(0,3))];
			fireWorks[0] = new SingleFire();
			fireWorks[0].FireInit(tempP, 25, 10, fcolor, exdelay, exduration);
			for(var i=1 ; i<fireNum+1 ; i++)
			{
				var x, y;
				var ang = 2*Math.PI*i/fireNum;
				x = getRandom(300,500) * Math.cos(ang);
				y = -getRandom(300,500) * Math.sin(ang);
				var tempP2 = new Point3D(tempP.X + x, tempP.Y + y, getRandom(-500,500));
				var exdelay2 = exduration + getRandom(-40,10);
				var exduration2 = getRandom(40, 60);
				fireWorks[i] = new SingleFire();
				fireWorks[i].FireInit(tempP2, 7, 6, fcolor_light, exdelay2, exduration2);
				var time = exdelay2 + exduration2;
				if(timer_tick < time)
				{
					timer_tick = time;
				}		
			}
			fireNum++;
			break;
		}
		default:
			break;
	}
	window.requestAnimationFrame(draw);
}
function draw()
{
	now = Date.now();
	var delta = now - then;
	then = now;
	var ctx = document.getElementById('firework').getContext('2d');
	var cof = delta/interval;
	ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);	
	for(var j=0 ; j<fireNum ; j++)	
	{
		if(fireWorks[j].IsExplode == true && fireWorks[j].IsDone == false)
		{
			ctx.globalAlpha = fireWorks[j].opac;
			for(var i=0 ; i<fireWorks[j].fn ; i++)
			{
				ctx.fillStyle = fireWorks[j].firePoints[i].color;
				ctx.fillRect(fireWorks[j].firePoints[i].FlatX()-1,fireWorks[j].firePoints[i].FlatY()-1,2,2);
			}
		}
		fireWorks[j].progress(cof);
	}
	timer_tick--;
	if(timer_tick>0)
		window.requestAnimationFrame(draw);
	else
	{
		window.setTimeout(init,200);
	}
}
