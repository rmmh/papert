// $Id$

function Turtle (canvas) {
 
    if (canvas.getContext) {

        this.c = canvas.getContext('2d');
        
        this.max_x = canvas.width;
        this.max_y = canvas.height;
        
        this.x = canvas.width/2;

        this.c.lineCap = "round";
        

        this.jump = function(x,y) {
            this.x = x;
            this.y = y;
        }
        
        this.penwidth = function(w) {
            this.c.lineWidth=w;
        }
        this.colour = function(colour) {
            this.c.strokeStyle = colour;
        }
        
        this.color = this.colour;
        
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
            
            this.x = newx;
            this.y = newy;
        }
        
        this.fw = this.forward;
       
        this.backward = function (d) {
            this.forward(-d);
        }
        
        this.bk = this.backward;
        
        this.right = function(angle) {
            this.angle = (this.angle + angle) % 360;
        }
        
        this.rt = this.right;
        
        this.left = function(angle) {
            this.right(-angle);
        }

        this.lt = this.left;
        
        this.penup = function() {
            this.pen = false;
        }

        this.pd = this.penup;

        this.pendown = function() {
            this.pen = true;
        }

	    this.pd = this.pendown;

        this.radians = function() {
            return this.angle / 180 * Math.PI;
        }
 
        this.clear = function() {
            old = this.c.fillStyle
            this.c.fillStyle = "rgb(255,255,255)";
            this.c.fillRect(0,0,this.max_x,this.max_y);
            this.c.fillStyle = old
        }

        this.cs = this.clear;

        this.reset = function() {
            this.clear();
            this.setup();
        }

        this.setup = function() {
            this.x = this.max_x/2;
            this.y = this.max_y/2;
            this.angle = 270;
            this.penwidth(1);
            this.color("rgb(0,0,0)");
            this.pen = true;
        }

        this.setup();
            
    }
}
