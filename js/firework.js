function Point3D(x, y, z)
{
	var ab = 5000;
	this.color = "red";
	this.X = x;
	this.Y = y;
	this.Z = z;
	this.FlatX = function () { return ab * this.X / (ab + this.Z) };
	this.FlatY = function () { return ab * this.Y / (ab + this.Z) };
	this.Add = function(p)
	{
		this.X += p.mag * p.point.X;
		this.Y += p.mag * p.point.Y;
		this.Z += p.mag * p.point.Z;
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

var color_red = "#FF2222";
var color_green = "#22FF22";
var color_blue = "#2222FF";
var color_orange = "#FFFF22";
var color_purple = "#FF22FF";

var color_red_light = "#FFAAAA";
var color_green_light = "#AAFFAA";
var color_blue_light = "#AAAAFF";
var color_orange_light = "#FFFFAA";
var color_purple_light = "#FFAAFF";
var firecolor = new Array(color_red, color_green, color_blue, color_orange, color_purple);
var firecolor_light = new Array(color_red_light, color_green_light, color_blue_light, color_orange_light, color_purple_light);
var fireWorks = new Array (100);

