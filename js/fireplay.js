var FIREWORKS = (function(ns){
    var timer_tick = 100;
    var opac;
    var fireNum;
    var then = Date.now();
    var now;
    var fps = 60;
    var interval = 1000/fps;
    var width;
    var height;
    var scaleCof;
    var fireSize;
    var fireDelta = 50;
    var LetterFire = {};
    var letterPoint = 0;
    var Sentences = ["TEST"];
    LetterFire['0'] = getArcFires(new Point3D(0,0,0),-Math.PI*0.5,1.5*Math.PI,300,true);
    LetterFire['1'] = getLineFires(new Point3D(-40,-160,0), new Point3D(0,-200,0)).concat(
                        getLineFires(new Point3D(0,-200,0), new Point3D(0,300,0))).concat(
                        getLineFires(new Point3D(-40,300,30), new Point3D(60,300,30)));
    LetterFire['2'] = getArcFires(new Point3D(0,-100,0),0,1.25*Math.PI,200,true).concat(
                        getLineFires(new Point3D(200,-100,0), new Point3D(-200,250,0))).concat(
                        getLineFires(new Point3D(-200,250,0), new Point3D(200,250,0)));
    LetterFire['3'] = getArcFires(new Point3D(0,-100,0), 0, 1.25*Math.PI,200,true).concat(
                        getLineFires(new Point3D(200,-100,0), new Point3D(0,0,0))).concat(
                        getLineFires(new Point3D(0,0,0), new Point3D(200,100,0))).concat(
                        getArcFires(new Point3D(0,100,0), 1.25*Math.PI, 2*Math.PI,200, true));
    LetterFire['4'] = getLineFires(new Point3D(0,-300,0), new Point3D(-200,0,0)).concat(
                        getLineFires(new Point3D(-200,0,0), new Point3D(200,0,0))).concat(
                        getLineFires(new Point3D(0,-300,0), new Point3D(0,300,0)));
    LetterFire['5'] = getLineFires(new Point3D(-200,-200,0), new Point3D(200,-200,0)).concat(
                        getLineFires(new Point3D(-200,-200,0), new Point3D(-200,0,0))).concat(
                        getArcFires(new Point3D(-50, 80.603, 0), Math.PI*2.9652, Math.PI*4.9012, 173.205, true));
    LetterFire['6'] = getArcFires(new Point3D(0,0,0), 0, Math.PI, 200, false).concat(
                        getArcFires(new Point3D(100,0,0), Math.PI, 1.5*Math.PI, 300, false)).concat(
                        getArcFires(new Point3D(100,200,0), Math.PI * 1.5, Math.PI * 2, 100, false)).concat(
                        getArcFires(new Point3D(0,200,0), 0, Math.PI * 0.9, 200, false));
    LetterFire['7'] = getLineFires(new Point3D(-200,-200,0), new Point3D(200,-200,0)).concat(
                        getLineFires(new Point3D(200, -200,0), new Point3D(-200,400,0)));
    LetterFire['8'] = getArcFires(new Point3D(0,-150,0), -Math.PI*0.5, Math.PI*1.5, 150, true).concat(
                        getArcFires(new Point3D(0,200,0), Math.PI*0.5, Math.PI*2.5, 200, false));
    LetterFire['9'] = getArcFires(new Point3D(0,-200,0), Math.PI, 1.9*Math.PI, 200, true).concat(
                        getArcFires(new Point3D(-100,-200,0), Math.PI*0.5, Math.PI, 100, true)).concat(
                        getArcFires(new Point3D(-100, 0, 0), 0, Math.PI*0.5, 300, true)).concat(
                        getArcFires(new Point3D(-50,0,0), Math.PI, Math.PI*2, 250, true));
    LetterFire['A'] = getLineFires(new Point3D(-200,175,30), new Point3D(0,-400,-60)).concat(
                        getLineFires(new Point3D(0,-400,-60), new Point3D(200,175,40))).concat(
                        getLineFires(new Point3D(-150,0,0), new Point3D(150,0,0)));
    LetterFire['B'] = getLineFires(new Point3D(-200,-200,30), new Point3D(-200,200,0)).concat(
                        getLineFires(new Point3D(-200,-200,0), new Point3D(0, -200, 20))).concat(
                        getArcFires(new Point3D(0,-100,0),-Math.PI/2,Math.PI/2,100,true)).concat(
                        getLineFires(new Point3D(0,0,0), new Point3D(-200,0,0))).concat(
                        getArcFires(new Point3D(0,100,0),-Math.PI/2,Math.PI/2,100,true)).concat(
                        getLineFires(new Point3D(0,200,0), new Point3D(-200,200,30)));
    LetterFire['C'] = getArcFires(new Point3D(0,0,0), Math.PI/4, 1.8*Math.PI,200);
    LetterFire['D'] = getLineFires(new Point3D(-100,-200,30), new Point3D(-100,200,0)).concat(
                        getLineFires(new Point3D(-100,-200,0), new Point3D(0, -200, 20))).concat(
                        getArcFires(new Point3D(0,0,0),-Math.PI/2,Math.PI/2,200,true)).concat(
                        getLineFires(new Point3D(0,200,0), new Point3D(-100,200,30)));
    LetterFire['E'] = getLineFires(new Point3D(-100,-200,30), new Point3D(-100,200,0)).concat(
                        getLineFires(new Point3D(-100,-200,0), new Point3D(200, -200, 20))).concat(
                        getLineFires(new Point3D(-100,0,0), new Point3D(200, 0, 20))).concat(
                        getLineFires(new Point3D(-100,200,0), new Point3D(200,200,30)));
    LetterFire['F'] = getLineFires(new Point3D(-100,-200,30), new Point3D(-100,200,0)).concat(
                        getLineFires(new Point3D(-100,-200,0), new Point3D(200, -200, 20))).concat(
                        getLineFires(new Point3D(-100,0,0), new Point3D(200, 0, 20)));
    LetterFire['G'] = getArcFires(new Point3D(0,0,0), Math.PI/4, 1.8*Math.PI,200).concat(
                        getLineFires(new Point3D(50,0,0), new Point3D(250,0,0))).concat(
                        getLineFires(new Point3D(200,0,0), new Point3D(200,240,0)));
    LetterFire['H'] = getLineFires(new Point3D(-100,-200,30), new Point3D(-100,200,0)).concat(
                        getLineFires(new Point3D(-100,0,0), new Point3D(200, 0, 20))).concat(
                        getLineFires(new Point3D(100,-200,0), new Point3D(100,200,30)));
    LetterFire['I'] = getLineFires(new Point3D(-50,-200,30), new Point3D(50,-200,0)).concat(
                        getLineFires(new Point3D(0,-200,30), new Point3D(0,200,0))).concat(
                        getLineFires(new Point3D(-50,200,30), new Point3D(50,200,0)));
    LetterFire['J'] = getLineFires(new Point3D(-50,-200,30), new Point3D(50,-200,0)).concat(
                        getLineFires(new Point3D(0,-200,30), new Point3D(0,150,0))).concat(
                        getArcFires(new Point3D(-75,150,30), Math.PI, 2*Math.PI, 75, true));

    LetterFire['K'] = getLineFires(new Point3D(-100,-200,30), new Point3D(-100,200,0)).concat(
                        getLineFires(new Point3D(-100,0,0), new Point3D(200, -200, 20))).concat(
                        getLineFires(new Point3D(-100,0,0), new Point3D(200, 200, 20)));

    LetterFire['L'] = getLineFires(new Point3D(-100,-200,30), new Point3D(-100,200,0)).concat(
                        getLineFires(new Point3D(-100,200,0), new Point3D(200,200,30)));
    LetterFire['M'] = getLineFires(new Point3D(-150,200,0), new Point3D(-150,-150,0)).concat(
                        getLineFires(new Point3D(-150, -150, 0), new Point3D(0,0,0))).concat(
                        getLineFires(new Point3D(0, 0, 0), new Point3D(150, -150, 0))).concat(
                        getLineFires(new Point3D(150,-150,0), new Point3D(150,200,0)));
    LetterFire['N'] = getLineFires(new Point3D(-150,-150,0), new Point3D(-150, 200, 0)).concat(
                        getLineFires(new Point3D(-150,-150,0), new Point3D(150,200,0))).concat(
                        getLineFires(new Point3D(150,200,0), new Point3D(150,-200,0)));
    LetterFire['O'] = getArcFires(new Point3D(0,0,0),-Math.PI*0.5,Math.PI*1.5,200,true);                   
    LetterFire['P'] = getLineFires(new Point3D(-100,-200,0), new Point3D(-100,200,0)).concat(
                        getLineFires(new Point3D(-100,-200,0), new Point3D(100,-200,0))).concat(
                        getArcFires(new Point3D(100,-100,0),-0.5*Math.PI,0.5*Math.PI,100,true)).concat(
                        getLineFires(new Point3D(100,0,0), new Point3D(-100,0,0)));
    LetterFire['Q'] = getArcFires(new Point3D(0,0,0),-Math.PI*0.5,Math.PI*1.5,200,true).concat(
                        getLineFires(new Point3D(50,50,0), new Point3D(250,250,0)));
    LetterFire['R'] = getLineFires(new Point3D(-100,-200,0), new Point3D(-100,200,0)).concat(
                        getLineFires(new Point3D(-100,-200,0), new Point3D(100,-200,0))).concat(
                        getArcFires(new Point3D(100,-100,0),-0.5*Math.PI,0.5*Math.PI,100,true)).concat(
                        getLineFires(new Point3D(100,0,0), new Point3D(-100,0,0))).concat(
                        getLineFires(new Point3D(-100,0,0), new Point3D(250,250,0)));
    LetterFire['S'] = getArcFires(new Point3D(0,-100,0),-Math.PI*0.2,Math.PI,150,false).concat(
                        getLineFires(new Point3D(-150,-100,0), new Point3D(150,100,0))).concat(
                        getArcFires(new Point3D(0,100,0), 0.8*Math.PI, 2*Math.PI, 150, true));
    LetterFire['T'] = getLineFires(new Point3D(-150,-200,0), new Point3D(150,-200,0)).concat(
                        getLineFires(new Point3D(0,-200,0), new Point3D(0,200,0)));
    LetterFire['U'] = getLineFires(new Point3D(-150,-150,0), new Point3D(-150,0,0)).concat(
                        getArcFires(new Point3D(0,0,0),Math.PI,Math.PI*2,150,false)).concat(
                        getLineFires(new Point3D(150,0,0), new Point3D(150,-150,0)));
    LetterFire['V'] = getLineFires(new Point3D(-150,-150,0), new Point3D(0,200,0)).concat(
                        getLineFires(new Point3D(0,200,0), new Point3D(150,-150,0)));
    LetterFire['W'] = getLineFires(new Point3D(-150,-150,0), new Point3D(-75,200,0)).concat(
                        getLineFires(new Point3D(-75,200,0), new Point3D(0,-150,0))).concat(
                        getLineFires(new Point3D(0,-150,0), new Point3D(75,200,0))).concat(
                        getLineFires(new Point3D(75,200,0), new Point3D(150,-150,0)));
    LetterFire['X'] = getLineFires(new Point3D(-200,-200,0), new Point3D(200,200,0)).concat(
                        getLineFires(new Point3D(200,-200,0), new Point3D(-200,200,0)));
    LetterFire['Y'] = getLineFires(new Point3D(-150,-150,0), new Point3D(0,0,0)).concat(
                        getLineFires(new Point3D(150,-150,0), new Point3D(0,0,0))).concat(
                        getLineFires(new Point3D(0,0,0), new Point3D(0,300,0)));
    LetterFire['Z'] = getLineFires(new Point3D(-200,-200,0), new Point3D(200,-200,0)).concat(
                        getLineFires(new Point3D(200,-200,0), new Point3D(-200,200,0))).concat(
                        getLineFires(new Point3D(-200,200,0), new Point3D(200,200,0)));
                        
    LetterFire[' '] = [];
    ns.startfire = function(text)
    {
        if(typeof(text)=="undefined")
            text = "";
        text = text.toUpperCase();
        Sentences = text.split(/[\s\+]+/);
        init();
    }
    function Point3D(x, y, z)
    {
        var ab = 5000;
        this.color = "red";
        this.X = x;
        this.Y = y;
        this.Z = z;
        this.FlatX = function () { return ab * this.X / (ab + this.Z) };
        this.FlatY = function () { return ab * this.Y / (ab + this.Z) };
        this.Add = function(c, p)
        {
            this.X += c * p.mag * p.point.X;
            this.Y += c * p.mag * p.point.Y;
            this.Z += c * p.mag * p.point.Z;
        }
    }
    function Vector3D(mag, p)
    {
        this.mag = mag;
        this.point = p;
    }
    function getRandom(s,f)
    {
        return Math.random()*(f-s)+s;
    }

    var gravity = new Vector3D(1, new Point3D(0,1,0));
    var color_red = new Array("#FF0000","#FF2222", "#FF2222", "#FF2222");
    var color_green = new Array("#00FF00", "#22FF22", "#44FF44", "#88FF88");
    var color_blue = new Array("0000FF", "#2222FF", "#4444FF", "#8888FF");
    var color_orange = new Array("#FFFF00", "#FFFF22", "#FFFF44", "#FFFF88");
    var color_purple = new Array("FF00FF", "#FF22FF", "#FF44FF", "#FF88FF");

    var color_red_light = new Array("#FFAAAA","#FFCCCC","#FFEEEE");
    var color_green_light = new Array("#AAFFAA", "#CCFFCC", "#EEFFEE");
    var color_blue_light = new Array("#AAAAFF", "#CCCCFF", "#EEEEFF");
    var color_orange_light = new Array("#FFFFAA", "#FFFFCC", "#FFFFEE");
    var color_purple_light = new Array("#FFAAFF", "#FFEEFF", "#FFCCFF");
    var firecolor = new Array(color_red, color_green, color_blue, color_orange, color_purple);
    var firecolor_light = new Array(color_red_light, color_green_light, color_blue_light, color_orange_light, color_purple_light);
    var fireWorks = new Array (100);

    function SingleFire()
    {
        this.firePoints = [];
        this.fireVectors = [];
        this.fn=0;
        this.x=0;
        this.y=0;
        this.z=0;
        this.explodedelay=0;
        this.explodeduration=0;
        var tick;
        this.fireSize = 1;
        this.IsExplode=false;

        this.IsDone = false;
        this.FireInit = function(point, div, vel, color, exde, exdu, fs)
        {
            var cof = 0.3;
            this.fireSize = fs;
            for(var i= 0; i<2*div ; i++)
            {
                for(var j= 1 ; j<div ; j++){
                    var ang = (Math.PI+getRandom(-cof,cof))*j/div;
                    var tx = Math.cos(ang);
                    var ty = -Math.sin(ang);
                    var tz = 0;
                    ang = (Math.PI+getRandom(-cof,cof))*i/div;
                    var x = tx;
                    var y = Math.cos(ang)*ty;
                    var z = -Math.sin(ang)*ty;
                    this.fireVectors[this.fn] = new Vector3D(vel, new Point3D(x,y,z));
                    this.firePoints[this.fn] = new Point3D(x,y,z);
                    this.fn++;
                }
            }
            var w = getRandom(-90,90) * Math.PI/180;
            for(var i=0 ; i<this.fn ; i++)
            {
                var ty = Math.cos(w) * this.firePoints[i].Y + Math.sin(w) * this.firePoints[i].Z;
                var tz = -Math.sin(w) * this.firePoints[i].Y + Math.cos(w) * this.firePoints[i].Z;
                this.firePoints[i].Y = ty;
                this.firePoints[i].Z = tz;
                this.fireVectors[i].point.Y = ty;
                this.fireVectors[i].point.Z = tz;
            }
            var w = getRandom(-90,90) * Math.PI/180;

            for(var i=0 ; i<this.fn ; i++)
            {
                var tx = Math.cos(w) * this.firePoints[i].X + Math.sin(w) * this.firePoints[i].Z;
                var tz = -Math.sin(w) * this.firePoints[i].X + Math.cos(w) * this.firePoints[i].Z;
                this.firePoints[i].X = tx;
                this.firePoints[i].Z = tz;
                this.fireVectors[i].point.X = tx;
                this.fireVectors[i].point.Z = tz;
            }
            this.x = point.X;
            this.y = point.Y;
            this.z = point.Z;

            for(var i=0 ;  i<this.fn ; i++)
            {
                this.firePoints[i].X += this.x;
                this.firePoints[i].Y += this.y;
                this.firePoints[i].Z += this.z;
                this.firePoints[i].color = color;
            }
            this.explodedelay = exde;
            this.explodeduration = exdu;
            this.opac = 1;
            this.IsExplode = false;
            tick=0;
        }
        this.progress = function(c)
        {
            tick++;
            if(this.IsExplode == false)
            {
                if(tick>this.explodedelay)
                    this.IsExplode = true;
            }
            else if(this.IsExplode == true)
            {
                if(this.explodedelay+this.explodeduration > tick)
                {
                    for(var i=0 ; i<this.fn ; i++)
                    {
                        this.firePoints[i].Add(c, this.fireVectors[i]);
                        this.firePoints[i].Add(c, gravity);
                        this.fireVectors[i].mag/=1.01;
                    }
                    if(this.explodedelay+this.explodeduration - tick <=40)
                    {
                        this.opac -= 0.025;
                        if(this.opac < 0.05)
                        {
                            this.fn = 0;
                            this.opac = 0;
                            IsDone = true;
                        }
                    }
                }
            }
        }
    }
    function SmileFire()
    {
        this.firePoints = [];
        this.fireVectors = [];
        this.fn=0;
        this.x=0;
        this.y=0;
        this.z=0;
        this.explodedelay=0;
        this.explodeduration=0;
        this.fireSize = 1;
        var tick;
        this.IsExplode=false;
        this.IsDone = false;

        this.FireInit = function(point, div, vel, color, exde, exdu, fs)
        {
            var cof = 0.1;
            this.fireSize = fs;
            for(var i= 0; i<2*div ; i++)
            {
                var z = 0;
                ang = (Math.PI+getRandom(-cof,cof))*i/div;
                var x = Math.cos(ang);
                var y = -Math.sin(ang);
                this.fireVectors[this.fn] = new Vector3D(vel, new Point3D(x,y,z));
                this.firePoints[this.fn] = new Point3D(x,y,z);
                this.firePoints[this.fn].color = color;
                this.fn++;
            }
            for(var i=0 ; i<div ; i++)
            {	
                var z =0;
                ang = -(Math.PI + getRandom(-cof,cof))*i/div;
                var x = Math.cos(ang);
                var y = -Math.sin(ang);
                this.fireVectors[this.fn] = new Vector3D(vel/2, new Point3D(x,y,z));
                this.firePoints[this.fn] = new Point3D(x,y,z);
                this.firePoints[this.fn].color = "red";
                this.fn++;
            }
            ang = Math.PI/4;
            var x = Math.cos(ang);
            var y = -Math.sin(ang);
            this.fireVectors[this.fn] = new Vector3D(vel/2, new Point3D(x,y,0));
            this.firePoints[this.fn] = new Point3D(x,y,0);
            this.firePoints[this.fn].color = "red";
            this.fn++;
            ang = Math.PI*3/4;
            var x = Math.cos(ang);
            var y = -Math.sin(ang);
            this.fireVectors[this.fn] = new Vector3D(vel/2, new Point3D(x,y,0));
            this.firePoints[this.fn] = new Point3D(x,y,0);
            this.firePoints[this.fn].color = "red";
            this.fn++;

            var w = getRandom(-90,90) * Math.PI/180;
            for(var i=0 ; i<this.fn ; i++)
            {
                var ty = Math.cos(w) * this.firePoints[i].Y + Math.sin(w) * this.firePoints[i].Z;
                var tz = -Math.sin(w) * this.firePoints[i].Y + Math.cos(w) * this.firePoints[i].Z;
                this.firePoints[i].Y = ty;
                this.firePoints[i].Z = tz;
                this.fireVectors[i].point.Y = ty;
                this.fireVectors[i].point.Z = tz;
            }
            var w = getRandom(-90,90) * Math.PI/180;

            for(var i=0 ; i<this.fn ; i++)
            {
                var tx = Math.cos(w) * this.firePoints[i].X + Math.sin(w) * this.firePoints[i].Z;
                var tz = -Math.sin(w) * this.firePoints[i].X + Math.cos(w) * this.firePoints[i].Z;
                this.firePoints[i].X = tx;
                this.firePoints[i].Z = tz;
                this.fireVectors[i].point.X = tx;
                this.fireVectors[i].point.Z = tz;
            }
            this.x = point.X;
            this.y = point.Y;
            this.z = point.Z;

            for(var i=0 ;  i<this.fn ; i++)
            {
                this.firePoints[i].X += this.x;
                this.firePoints[i].Y += this.y;
                this.firePoints[i].Z += this.z;
            }
            this.explodedelay = exde;
            this.explodeduration = exdu;
            this.opac = 1;
            this.IsExplode = false;
            tick=0;
        }
        this.progress = function(c)
        {
            tick++;
            if(this.IsExplode == false)
            {
                if(tick>this.explodedelay)
                    this.IsExplode = true;
            }
            else if(this.IsExplode == true)
            {
                if(this.explodedelay+this.explodeduration > tick)
                {
                    for(var i=0 ; i<this.fn ; i++)
                    {
                        this.firePoints[i].Add(c, this.fireVectors[i]);
                        this.firePoints[i].Add(c, gravity);
                        this.fireVectors[i].mag/=1.01;
                    }
                    if(this.explodedelay+this.explodeduration - tick <=40)
                    {
                        this.opac -= 0.025;
                        if(this.opac < 0.05)
                        {
                            this.opac = 0;
                            this.firePoints = [];
                            this.fn =0;
                            
                            IsDone = true;
                        }
                    }
                }
            }
        }
    }
    function getDist(st, fi)
    {
        return Math.sqrt(Math.pow(st.X-fi.X, 2)
                        +Math.pow(st.Y-fi.Y, 2)
                        +Math.pow(st.Z-fi.Z, 2));
    }
    function getUnitVect(st, fi)
    {
        var d = getDist(st, fi);
        return new Point3D(fireDelta * (fi.X-st.X)/d, fireDelta * (fi.Y-st.Y)/d, fireDelta * (fi.Z-st.Z)/d);
    }
    function getLineFires(st, fi)
    {
        var tmpPoint = [];
        var dv = getUnitVect(st, fi);
        var n = getDist(st, fi)/fireDelta;
        var i;
        for(i=0 ; i<n ; i++)
        {
            tmpPoint = tmpPoint.concat(new Point3D((st.X + i*dv.X), (st.Y + i*dv.Y), (st.Z + i*dv.Z)));
        }
        return tmpPoint;
    }
    function getArcFires(org, st, fi, rad, clcwis)
    {
        var tmpPoint = [];
        var dt = fireDelta/rad;
        var i;
        var n = (fi-st)/dt;
        var tx, ty;
        if(clcwis == true)
        {
            dt = -dt;
            var tp = st;
            st = fi;
            fi = tp;
        }
        for(i=0 ; i<n ; i++)
        {
            tx = Math.cos(st + dt*i) * rad;
            ty = -Math.sin(st + dt*i) * rad;
            tmpPoint = tmpPoint.concat(new Point3D(org.X + tx, org.Y + ty, org.Z));
        }
        return tmpPoint;
    }
    function drawLetter(letters)
    {
        var letter;
        var dn = width * 0.8 / (letters.length+1);
        var st = width * 0.1;
        var exdelay = 5;
        var fcolor = firecolor_light[Math.floor(getRandom(0,5))][Math.floor(getRandom(0,4))];
        var fireWorks_tmp = [];
        var cnt=0;
        for(var k=0 ; k<letters.length ; k++)
        {
            letter = LetterFire[letters[k]];
            if(typeof LetterFire[letters[k]]=="undefined" || letters[k] == '+')
                letter = LetterFire[' '];
            var origin = new Point3D(st + dn * (k+1), height *0.4 + getRandom(-50,50), getRandom(-100,100));
            for(i=0 ; i<letter.length ; i++)
            {
                var tempP = new Point3D(origin.X + letter[i].X*scaleCof, origin.Y + letter[i].Y*scaleCof, origin.Z + letter[i].Z*scaleCof);
                exdelay += getRandom(0,2);
                var exduration = getRandom(40,50);
                fireWorks_tmp[cnt] = new SingleFire();
                fireWorks_tmp[cnt].FireInit(tempP, getRandom(5,8),getRandom(2,5) *scaleCof, fcolor, exdelay, exduration, 2);
                var time = exdelay + exduration;	
                if(timer_tick < time)
                {
                    timer_tick = time;
                }
                cnt++;
            }
            exdelay += 15;
        }
        return fireWorks_tmp;
    }
    function BasicExplosion()
    {
        var n = Math.floor(getRandom(3,6));
        var fireWorks_tmp = [];
        for(var i=0 ; i<n ; i++)
        {
            var tempP = new Point3D(getRandom(width*1/5,width*4/5),getRandom(height/7,height/2),getRandom(-500,500));
            var exdelay = getRandom(20,150);
            var exduration = getRandom(100,110);
            var fcolor = firecolor[Math.floor(getRandom(0,5))][Math.floor(getRandom(0,4))];
            fireWorks_tmp[i] = new SingleFire();
            fireWorks_tmp[i].FireInit(tempP, 22, 10*scaleCof, fcolor, exdelay, exduration, 2);
            var time = exdelay + exduration;	
            if(timer_tick < time)
            {
                timer_tick = time;
            }
        }
        return fireWorks_tmp;
    }
    function GalaxyExplosion()
    {
        var n = Math.floor(getRandom(300,400));
        var fireWorks_tmp = [];
        var basecolor = firecolor[Math.floor(getRandom(0,5))];
        for(var i=0 ; i<n ; i++)
        {
            var tempP = new Point3D(getRandom(0,width), getRandom(height*2/7,height*4/7), getRandom(-500,500));
            var exdelay = getRandom(30,250);
            var exduration = getRandom(70,90);
            var fcolor = basecolor[Math.floor(getRandom(0,4))];
            fireWorks_tmp[i] = new SingleFire();
            fireWorks_tmp[i].FireInit(tempP, 7,5* scaleCof, fcolor, exdelay, exduration, 2);
            var time = exdelay + exduration;
            if(timer_tick < time)
            {
                timer_tick = time;
            }
        }
        return fireWorks_tmp;
    }
    function MassiveExplosion()
    {
        var n = 1;
        var taillength = 3;
        var tempP = new Point3D(getRandom(width*2/5,width*3/5), getRandom(height/7,height/2), getRandom(-500,500));
        var exdelay = getRandom(30,50);
        var exduration = getRandom(90,120);
        var v = Math.floor(getRandom(0,5));
        var fcolor = firecolor[v][Math.floor(getRandom(0,4))];
        var fcolor_light = firecolor_light[v][Math.floor(getRandom(0,3))];
        var velocity = 10;
        var div = 25;
        var fireWorks_tmp = [];
        fireWorks_tmp[0] = new SingleFire();
        fireWorks_tmp[0].FireInit(tempP, div, velocity * scaleCof, fcolor, exdelay, exduration, 2);
        for(var i=1 ; i<n*taillength ; i++)
        {
            exdelay+=1;				
            fireWorks_tmp[i] = new SingleFire();
            fireWorks_tmp[i].FireInit(tempP, div, velocity * scaleCof, fcolor_light, exdelay, exduration, 2);
            fireWorks_tmp[i].firePoints = [];
            fireWorks_tmp[i].fireVectors = [];
            for(var j=0 ; j<fireWorks_tmp[0].fn ; j++)
            {
                fireWorks_tmp[i].firePoints[j] = new Point3D(fireWorks_tmp[0].firePoints[j].X,fireWorks_tmp[0].firePoints[j].Y, fireWorks_tmp[0].firePoints[j].Z);
                fireWorks_tmp[i].fireVectors[j] =new Vector3D(fireWorks_tmp[0].fireVectors[j].mag, new Point3D(fireWorks_tmp[0].fireVectors[j].point.X, fireWorks_tmp[0].fireVectors[j].point.Y, fireWorks_tmp[0].fireVectors[j].point.Z));
                fireWorks_tmp[i].firePoints[j].color = fcolor_light;
            }				
        }
        var time = exdelay +exduration;
        if(timer_tick < time)
        {
            timer_tick = time;
        }
        return fireWorks_tmp;
    }
    function SmileExplosion()
    {
        var n = Math.floor(getRandom(7,12));
        var fireWorks_tmp = [];
        for(var i=0 ; i<n ; i++)
        {
            var tempP = new Point3D(getRandom(width*1/5,width*4/5), getRandom(height/7,height/2), getRandom(-500,500));
            var exdelay = getRandom(30,170);
            var exduration = getRandom(110,120);
            var fcolor = firecolor_light[Math.floor(getRandom(0,5))][Math.floor(getRandom(0,3))];
            fireWorks_tmp[i] = new SmileFire();
            fireWorks_tmp[i].FireInit(tempP, 40, 7 * scaleCof, fcolor, exdelay, exduration, 3);
            var time = exdelay + exduration;	
            if(timer_tick < time)
            {
                timer_tick = time;
            }
        }
        return fireWorks_tmp;
    }
    function init(){
        var ctx = document.getElementById('firework').getContext('2d');
        var random = Math.floor(getRandom(0,1000)%4);
        timer_tick =100;
        width = ctx.canvas.width;
        height = ctx.canvas.height;
        scaleCof = (width / window.innerWidth)<(height / window.innerHeight)?(width / window.innerWidth):(height / window.innerHeight);
        fireSize = 2;
        gravity = new Vector3D(scaleCof, new Point3D(0,1,0));
        if(scaleCof<0.5 || window.innerWidth < 480)
            fireSize = 1;
        fireWorks = [];
        fireWorks = fireWorks.concat(drawLetter(Sentences[letterPoint].split('')));
        letterPoint = (++letterPoint)%Sentences.length;
        switch(random)
        {
            // FireInit(Explode Location, fireNum(<30), fire velocity, fire Color, explosion delay, explosion duration)
            case 0:// Basic Explosion
            {
                fireWorks = fireWorks.concat(BasicExplosion());
                break;
            }
            case 1:// 3 Color Explosion
            {
                fireWorks = fireWorks.concat(SmileExplosion());
                break;
            }
            case 2:// Galaxy Explosion
            {
                fireWorks = fireWorks.concat(GalaxyExplosion());
                break;
            }
            case 3://Massive Explosion
            {
                fireWorks = fireWorks.concat(MassiveExplosion());
                break;
            }
            default:
                break;
        }
        fireNum = fireWorks.length;
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
                    ctx.fillRect(fireWorks[j].firePoints[i].FlatX()-1,fireWorks[j].firePoints[i].FlatY()-1,fireWorks[j].fireSize,fireWorks[j].fireSize);
                }
            }
            fireWorks[j].progress(cof);
        }
        timer_tick--;
        if(timer_tick>0)
            window.requestAnimationFrame(draw);
        else
        {
            window.setTimeout(init,20);
        }
    }
    return ns;
})(FIREWORKS || {});
