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
    
    this.delay = function (x) {
        this.wait = x;
    }

    this.sleep = function () {
        var now = new Date();
        var exit =  now.getTime() + this.wait;
            
        while (true) {
            now = new Date()
            var c = now.getTime()
            if (c > exit) break;
        }
   }

    this.setxy = function(x,y) {
        this.x = x;
        this.y = y;
    }
    
    this.setx = function(x) {
        this.x = x;
    }
    
    this.sety = function(x,y) {
        this.x = x;
    }
    
    this.setheading = function(h) {
        this.angle = (270+h) % 360
    }
    
    this.penwidth = function(w) {
        this.c.lineWidth=w;
    }

    this.color = function (args) {
            this.c.strokeStyle = "rgb("+args[0]+","+args[1]+","+args[2]+")";
    }
    
    this.arc = function (radius, angle) {
        if (this.pen) {
            this.c.beginPath();
            this.c.arc(this.x,this.y, radius, this.radians(), ((this.angle+angle)%360)/180*Math.PI,false);
            this.c.stroke();
           
      }
    }
    this.circle = function (radius) {
        if (this.pen) {
            this.c.beginPath();
            this.c.arc(this.x,this.y, radius, 0, 2*Math.PI,false);
            this.c.stroke();
           
      }
    }
    
    
    this.forward = function (d) {
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
    
    this.backward = function (d) {
        this.forward(-d);
    }
    
    
    this.right = function(angle) {
        this.angle = (this.angle + angle) % 360;
    }
    
    
    this.left = function(angle) {
        this.right(-angle);
    }

    
    this.penup = function() {
        this.pen = false;
    }


    this.pendown = function() {
        this.pen = true;
    }


    this.radians = function() {
        return this.angle / 180 * Math.PI;
    }

    this.clearscreen = function() {
        old = this.c.fillStyle
        this.c.fillStyle = "rgb(255,255,255)";
        this.c.fillRect(0,0,this.max_x,this.max_y);
        this.c.fillStyle = old
    }


    this.reset = function() {
        this.clearscreen();
        this.setup();
    }

    this.home = function() {
        this.x = this.max_x/2;
        this.y = this.max_y/2;
        this.angle = 270;
    }
    
    this.setup = function() {
        this.home();
        this.penwidth(1);
        this.color([0,0,0]);
        this.pen = true;
    }

    this.setup();
            
}
