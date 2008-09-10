function eval_logo(code, turtle) {

    code = logo_to_js_list(code,0).join(";\n");

    logo = eval(code);
    
    logo(turtle);
    
}

function logo_to_js_list(code, checkend) {
    var js = new Array();
   
    js.push("function (t) {");
   
    code=code.split(/\n/).join(";");
    
    var instr = /^\s*(\w+)\s+(\d+)\s*;\s*(.*)/i;
    var insr = /^\s*(\w+)\s*;\s*(.*)/i;
    
    
    var loop = true;
    
    while (loop) {
        if ((result = instr.exec(code)) != null) {
            js.push("t."+result[1].toLowerCase()+"("+result[2]+");");
            loop=true;
            code= result[3]; 
        } else if ((result = insr.exec(code)) != null) {
            js.push("t."+result[1].toLowerCase()+"();");
            loop=true;
            code= result[2]; 
        } else {
            loop=false;
        }
    }
    
    js.push("}");
    
    return  js;
}

