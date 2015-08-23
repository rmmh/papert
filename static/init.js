var turtle = null;
var logo = null;
var canvas;
var form;
var sprite;
var textOutput;
var oldcode;
var fast;
var out;
var DelayTurtle;

function setup() {
    logo = new Logo();
    
    fast = 5;
    turtle = new DelayTurtle(canvas, sprite, fast, false);
    logo.setTurtle(turtle);
    logo.setTextOutput(textOutput);
}

function init(canvas_id, turtle_id, form_id, oldcode_id, textoutput_id) {
    canvas = document.getElementById(canvas_id);
    form = document.getElementById(form_id);
    textOutput = document.getElementById(textoutput_id);
    sprite = document.getElementById(turtle_id);

    // I hate opera, I hate firefox.
    canvas.style.width = 500;
    canvas.width = 500;
    
    canvas.style.height = 500;
    canvas.height = 500;
    
    oldcode = document.getElementById(oldcode_id);
}

function run(speed, drawbits, options) {

    if (options && options.svg) {
      var _svg = true;
      document.getElementById('save-svg').setAttribute('style','')
      document.getElementById('canvas').setAttribute('style','display:none;')
    } else {
      var _svg = false;
      document.getElementById('save-svg').setAttribute('style','display:none;')
      if (document.getElementById('svg-container') && document.getElementById('svg-container').childNodes.length > 0) document.getElementById('svg-container').childNodes[0].remove();
      document.getElementById('canvas').setAttribute('style','')
    }

    setup();

    turtle.stop();
    if (speed !== fast) {
        fast = speed;
        var newturtle = null;
        // newturtle = new Turtle(canvas);
        
        newturtle = new DelayTurtle(canvas, sprite, _svg, fast, drawbits);
        logo.setTurtle(newturtle);
        turtle = newturtle;
    }
  
    oldcode.innerHTML += "\n" + form.code.value;
    //form.code.value = ""
  
    out = logo.run(form.code.value);

    if (_svg) document.getElementById('svg-container').appendChild(turtle.turtle.c.getSvg());
            
    if (out && out.type === "error") {
        alert(out.data);
        setup();
    }
}

function stop() {
    turtle.stop();
}

function saveSVG(element) {

    element.setAttribute('download',"papert.svg");
    element.setAttribute('href',"data:image/svg+xml;utf8," + turtle.turtle.getSVGString());

}

function clearcanvas() {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillRect(0, 0, 500, 500);
    textOutput.innerHTML = "";
}
