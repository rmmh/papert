// $Id$

function Turtle (canvas) {
 
    if (canvas && canvas.getContext) {
        this.wait = 100;
    
        this.c = canvas.getContext('2d');
        
        this.max_x = canvas.width;
        this.max_y = canvas.height;
        
        this.c.lineCap = "round";
        
        this.setup();
    }
}

Turtle.prototype.start = function(){};
Turtle.prototype.stop = function(){};
Turtle.prototype.finish = function(){};

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

function DelayCommand (that,fun,args) {
    this.that = that;
    this.fun = fun;
    this.args = args;
}

DelayCommand.prototype.call = function (that) {
    return this.fun.apply(this.that,this.args);
}


function DelayTurtle (canvas, speed) {
    this.turtle = new Turtle(canvas);
    this.pipeline = null;
    this.active = false;
    this.halt = false;
    this.speed = speed
}

DelayTurtle.prototype.start = function(){this.active = true; this.halt = false; this.pipeline = new Array(); this.paint();};
DelayTurtle.prototype.finish = function(){this.active = false;};
DelayTurtle.prototype.stop =  function(){this.halt = true;};

DelayTurtle.prototype.paint = function() {
    if (!this.halt) {
        var redraw = this.active;
        if (this.pipeline.length > 0) {
            var fun = this.pipeline.shift();
            fun.call()
            redraw = true;
        } 
        if (redraw) {
            var that = this;
            
            setTimeout(function(){that.paint.call(that)},this.speed);
        }
    }
}

DelayTurtle.prototype.addCommand = function (fun, args) {
    this.pipeline.push(new DelayCommand(this.turtle, fun, args));
}

// There must be a nicer way to do this

DelayTurtle.prototype.forward = function() { this.addCommand(this.turtle.forward,arguments)};
DelayTurtle.prototype.backward = function() { this.addCommand(this.turtle.backward,arguments)};
DelayTurtle.prototype.right = function() { this.addCommand(this.turtle.right,arguments)};
DelayTurtle.prototype.left = function() { this.addCommand(this.turtle.left,arguments)};
DelayTurtle.prototype.reset = function() { this.addCommand(this.turtle.reset,arguments)};
DelayTurtle.prototype.clearscreen = function() { this.addCommand(this.turtle.clearscreen,arguments)};
DelayTurtle.prototype.penup = function() { this.addCommand(this.turtle.penup,arguments)};
DelayTurtle.prototype.pendown = function() { this.addCommand(this.turtle.pendown,arguments)};
DelayTurtle.prototype.penwidth = function() { this.addCommand(this.turtle.penwidth,arguments)};
DelayTurtle.prototype.color = function() { this.addCommand(this.turtle.color,arguments)};
DelayTurtle.prototype.arc = function() { this.addCommand(this.turtle.arc,arguments)};
DelayTurtle.prototype.circle = function() { this.addCommand(this.turtle.circle,arguments)};

DelayTurtle.prototype.setxy = function() { this.addCommand(this.turtle.setxy,arguments)};
DelayTurtle.prototype.setx = function() { this.addCommand(this.turtle.setx,arguments)};
DelayTurtle.prototype.sety = function() { this.addCommand(this.turtle.sety,arguments)};

DelayTurtle.prototype.setheading = function() { this.addCommand(this.turtle.setheading,arguments)};

DelayTurtle.prototype.home = function() { this.addCommand(this.turtle.home,arguments)};
