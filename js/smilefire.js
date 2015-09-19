function SmileFire()
{
	this.firePoints = new Array(4000);
	this.fireVectors = new Array(4000);
	this.fn=0;
	this.x=0;
	this.y=0;
	this.z=0;
	this.explodedelay=0;
	this.explodeduration=0;
	var tick;
	this.IsExplode=false;
	this.IsDone = false;

	this.FireInit = function(point, div, vel, color, exde, exdu)
	{
			var cof = 0.1;
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
						IsDone = true;
					}
				}
			}
		}
	}
}
