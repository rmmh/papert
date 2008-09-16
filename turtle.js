// $Id$


function Turtle (canvas) {
 
    if (!canvas.getContext) {
        return null;
    }

    
    this.wait = 100;

    this.c = canvas.getContext('2d');
    
    this.max_x = canvas.width;
    this.max_y = canvas.height;
    
    this.c.lineCap = "round";
    
    this.setup();
}


Turtle.prototype.delay = function (x) {
    this.wait = x;
}

Turtle.prototype.sleep = function () {
    var now = new Date();
    var exit =  now.getTime() + this.wait;
        
    while (true) {
        now = new Date()
        var c = now.getTime()
        if (c > exit) break;
    }
}

Turtle.prototype.setxy = function(x,y) {
    this.x = x;
    this.y = y;
}

Turtle.prototype.setx = function(x) {
    this.x = x;
}

Turtle.prototype.sety = function(x,y) {
    this.x = x;
}

Turtle.prototype.setheading = function(h) {
    this.angle = (270+h) % 360
}

Turtle.prototype.penwidth = function(w) {
    this.c.lineWidth=w;
}

Turtle.prototype.color = function (args) {
        this.c.strokeStyle = "rgb("+args[0]+","+args[1]+","+args[2]+")";
}

Turtle.prototype.arc = function (radius, angle) {
    if (this.pen) {
        this.c.beginPath();
        this.c.arc(this.x,this.y, radius, this.radians(), ((this.angle+angle)%360)/180*Math.PI,false);
        this.c.stroke();
       
  }
}
Turtle.prototype.circle = function (radius) {
    if (this.pen) {
        this.c.beginPath();
        this.c.arc(this.x,this.y, radius, 0, 2*Math.PI,false);
        this.c.stroke();
       
  }
}


Turtle.prototype.forward = function (d) {
    this.c.beginPath();
    
    this.c.moveTo(this.x,this.y);
    
    var newx = this.x + d * Math.cos(this.radians());
    var newy = this.y + d * Math.sin(this.radians());
   
    if (this.pen) {
        this.c.lineTo(newx,newy);
    } else {
        this.c.moveTo(newx,newy);
    }
    this.c.stroke();
  
    // this only works in opera :( this.sleep();
    
    this.x = newx;
    this.y = newy;
}

Turtle.prototype.backward = function (d) {
    this.forward(-d);
}


Turtle.prototype.right = function(angle) {
    this.angle = (this.angle + angle) % 360;
}


Turtle.prototype.left = function(angle) {
    this.right(-angle);
}


Turtle.prototype.penup = function() {
    this.pen = false;
}


Turtle.prototype.pendown = function() {
    this.pen = true;
}


Turtle.prototype.radians = function() {
    return this.angle / 180 * Math.PI;
}

Turtle.prototype.clearscreen = function() {
    old = this.c.fillStyle
    this.c.fillStyle = "rgb(255,255,255)";
    this.c.fillRect(0,0,this.max_x,this.max_y);
    this.c.fillStyle = old
}


Turtle.prototype.reset = function() {
    this.clearscreen();
    this.setup();
}

Turtle.prototype.home = function() {
    this.x = this.max_x/2;
    this.y = this.max_y/2;
    this.angle = 270;
}

Turtle.prototype.setup = function() {
    this.home();
    this.penwidth(1);
    this.color([0,0,0]);
    this.pen = true;
}
