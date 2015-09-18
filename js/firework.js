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

