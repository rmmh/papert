function Turtle (canvas, turtle) {
 
    if (canvas && canvas.getContext) {
        this.wait = 100;
    
        this.c = canvas.getContext('2d');
        this.canvas = canvas

        this.max_x = canvas.width;
        this.max_y = canvas.height;

        this.c.lineCap = "round";
        this.turtle = turtle;
        this.visible = true;
        this.undobuffer = [];
        this.redobuffer = [];
        this.setup();
    }
}

Turtle.prototype.savestate = function() {
//    if (this.undobuffer.length > 23) {
//        this.undobuffer.shift();
//    }
//    this.undobuffer.push(this.getstate());
//
//    this.redobuffer = [];
}

Turtle.prototype.getstate = function() {
//    img = this.c.getImageData(0,0,this.max_x,this.max_y);
//    return {"x":this.x,"y":this.y,"angle":this.angle,"img":img};
}
Turtle.prototype.setstate = function(state) {
//    this.x = state.x;
//    this.y = state.y;
//    this.angle = state.angle;
//    this.clean_();
//    this.c.putImageData(state.img,0,0);
//    this.update();
//
}



Turtle.prototype.undo = function() {
    if (this.undobuffer.length > 0) {
        prev = this.undobuffer.pop();
        curr = this.getstate();
        this.setstate(prev);
        this.redobuffer.push(curr);
    } else {
        // Warning
    }
}   

Turtle.prototype.redo = function() {
    if (this.redobuffer.length > 0) {
        next = this.redobuffer.pop();
        curr = this.getstate();
        this.setstate(next);
        this.undobuffer.push(curr);
    } else {
        // Warning
    }
}   


Turtle.prototype.hideturtle = function() {
    this.visible = false;
    this.update();
}

Turtle.prototype.showturtle = function() {
    this.visible = true;
    this.update();
}


Turtle.prototype.update = function() {
    if (this.visible && this.x >=0 && this.y >= 0 && this.x <= this.max_x && this.y <= this.max_y) {
        this.turtle.style.left = parseInt(this.canvas.offsetLeft + this.x -10) + "px";
        this.turtle.style.top = parseInt(this.canvas.offsetTop + this.y-20) + "px";
        this.turtle.style.transform = 'rotate('+(this.angle)+'deg)';
    } else {
        this.turtle.style.left = "-10px";
        this.turtle.style.top = "-10px";
    }   
}


Turtle.prototype.start = function(){};
Turtle.prototype.stop = function(){};
Turtle.prototype.finish = function(){};

Turtle.prototype.setxy = function(x,y) {
    this.savestate();
    this.x = x;
    this.y = y;
    this.update();
}

Turtle.prototype.setx = function(x) {
    this.savestate();
    this.x = x;
    this.update();
}

Turtle.prototype.sety = function(x,y) {
    this.savestate();
    this.x = x;
    this.update();
}

Turtle.prototype.setheading = function(h) {
    this.savestate();
    this.angle = (270+h) % 360;
    this.update();
}

Turtle.prototype.penwidth = function(w) {
    this.savestate();
    this.penwidth_(w);
}

Turtle.prototype.penwidth_ = function(w) {;
    this.c.lineWidth=w;
}

Turtle.prototype.color = function (args) {
    this.savestate();
    this.color_(args)
}
Turtle.prototype.color_ = function (args) {
    this.c.strokeStyle = "rgb("+parseInt(args[0])+","+parseInt(args[1])+","+parseInt(args[2])+")";
}

Turtle.prototype.arc = function (radius, angle) {
    this.savestate();
    if (this.pen) {
        this.c.beginPath();
        this.c.arc(this.x,this.y, radius, this.radians(), ((this.angle+angle)%360)/180*Math.PI,false);
        this.c.stroke();
       
  }
}
Turtle.prototype.arc_point = function (radius, angle) {
    if (this.pen) {
        this.c.beginPath();
        this.c.arc(this.x,this.y, radius, ((this.angle+angle)%360)/180*Math.PI, ((this.angle+angle+1)%360)/180*Math.PI,false);
        this.c.stroke();
       
  }
}



Turtle.prototype.circle = function (radius) {
    this.savestate();
    if (this.pen) {
        this.c.beginPath();
        this.c.arc(this.x,this.y, radius, 0, 2*Math.PI,false);
        this.c.stroke();
       
  }
}

Turtle.prototype.forward = function (d) {
    this.savestate();
    this.crawl(d);
}

Turtle.prototype.crawl = function (d) {
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
    this.update();
}

Turtle.prototype.backward = function (d) {
    this.forward(-d);
}


Turtle.prototype.right = function(angle) {
    this.savestate();
    this.angle = (this.angle + angle) % 360;
    this.update();
}


Turtle.prototype.left = function(angle) {
    this.savestate();
    this.right(-angle);
}


Turtle.prototype.penup = function() {
    this.savestate();
    this.pen = false;
}


Turtle.prototype.pendown = function() {
    this.savestate();
    this.pen = true;
}


Turtle.prototype.radians = function() {
    return this.angle / 180 * Math.PI;
}
Turtle.prototype.clean = function() {
    this.savestate();
    this.clean_;
}
Turtle.prototype.clean_ = function() {
    old = this.c.fillStyle
    this.c.fillStyle = "rgb(255,255,255)";
    this.c.fillRect(0,0,this.max_x,this.max_y);
    this.c.fillStyle = old;
}

Turtle.prototype.clearscreen = function() {
    this.savestate();
    this.clean_();
    this.home_();
}


Turtle.prototype.reset = function() {
    this.clean_();
    this.setup();
    this.undobuffer = [];
    this.redobuffer = [];
}

Turtle.prototype.home = function () {
    this.savestate();
    this.home_();
}

Turtle.prototype.home_ = function() {
    this.x = this.max_x/2;
    this.y = this.max_y/2;
    this.angle = 270;
    this.update();
}

Turtle.prototype.setup = function() {
    this.home_();
    this.penwidth_(1);
    this.color_([0,0,0]);
    this.pen = true;
}

Turtle.prototype.paint = function () {}

function DelayCommand (that,fun,args) {
    this.that = that;
    this.fun = fun;
    this.args = args;
}

DelayCommand.prototype.call = function (that) {
    return this.fun.apply(this.that,this.args);
}


function DelayTurtle (canvas, sprite, speed, draw_bits) {
    this.turtle = new Turtle(canvas, sprite);
    this.pipeline = null;
    this.active = false;
    this.halt = false;
    this.speed = speed
    this.drawbits = (draw_bits == false) ? false : true;
}

DelayTurtle.prototype.start = function(){this.active = true; this.halt = false; this.pipeline = new Array(); this.paint();};
DelayTurtle.prototype.finish = function(){this.active = false;};
DelayTurtle.prototype.stop =  function(){this.halt = true;};

DelayTurtle.prototype.paint = function() {
    if (!this.halt) {
        var redraw = this.active;
        if (this.pipeline.length > 0) {
            var c = 0;
            do {
                var fun = this.pipeline.shift();
                fun.call()
                redraw = true;
                c++;
            } while (this.speed <= 1 && c< 10 && this.pipeline.length >0)
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

DelayTurtle.prototype.forward = function(d) {
    if (this.drawbits) {
        var l = Math.abs(d);
        var s = l/d; 

        this.savestate();
        for (var c = 0; c < l; c++ ) {
            this.addCommand(this.turtle.crawl,[s])
        }
    } else {
        this.addCommand(this.turtle.forward,[d]);
    }
};
DelayTurtle.prototype.backward = function(d) { this.forward(-d)};

DelayTurtle.prototype.showturtle = function() { this.addCommand(this.turtle.showturtle,arguments)};
DelayTurtle.prototype.hideturtle = function() { this.addCommand(this.turtle.hideturtle,arguments)};
DelayTurtle.prototype.right = function() { this.addCommand(this.turtle.right,arguments)};
DelayTurtle.prototype.left = function() { this.addCommand(this.turtle.left,arguments)};
DelayTurtle.prototype.reset = function() { this.addCommand(this.turtle.reset,arguments)};
DelayTurtle.prototype.clean = function() { this.addCommand(this.turtle.clean,arguments)};
DelayTurtle.prototype.clearscreen = function() { this.addCommand(this.turtle.clearscreen,arguments)};
DelayTurtle.prototype.penup = function() { this.addCommand(this.turtle.penup,arguments)};
DelayTurtle.prototype.pendown = function() { this.addCommand(this.turtle.pendown,arguments)};
DelayTurtle.prototype.penwidth = function() { this.addCommand(this.turtle.penwidth,arguments)};
DelayTurtle.prototype.color = function() { this.addCommand(this.turtle.color,arguments)};
DelayTurtle.prototype.savestate = function() { this.addCommand(this.turtle.savestate,arguments)};
DelayTurtle.prototype.redo = function() { this.addCommand(this.turtle.redo,arguments)};
DelayTurtle.prototype.undo = function() { this.addCommand(this.turtle.undo,arguments)};

DelayTurtle.prototype.arc = function(radius, angle) { 
    if (this.drawbits) {
        var end = (360+angle) % 360 ; 
        this.savestate();
        for (var c = 0; c <= end; c++ ) {
            this.addCommand(this.turtle.arc_point,[radius,c])
        }
    } else {
        this.addCommand(this.turtle.arc,[radius,angle])
    }
};
DelayTurtle.prototype.circle = function(radius) {
    if (this.drawbits) {
        this.savestate();
        for (var c = 0; c < 360; c++ ) {
            this.addCommand(this.turtle.arc_point,[radius,c])
        }
    } else {
        this.addCommand(this.turtle.circle,[radius])
    }
};

DelayTurtle.prototype.setxy = function() { this.addCommand(this.turtle.setxy,arguments)};
DelayTurtle.prototype.setx = function() { this.addCommand(this.turtle.setx,arguments)};
DelayTurtle.prototype.sety = function() { this.addCommand(this.turtle.sety,arguments)};

DelayTurtle.prototype.setheading = function() { this.addCommand(this.turtle.setheading,arguments)};

DelayTurtle.prototype.home = function() { this.addCommand(this.turtle.home,arguments)};
