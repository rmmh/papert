// $Id$


function Logo () {
    this.turtle = null;
    
    this.setTurtle = function(turtle) {
        this.turtle = turtle;
    }
    var d = new Date()
    this.seed = d.getTime()/1000;
    
    this.functions = new SymbolTable();
    this.values = new SymbolTable();
    
    this.t = new Tokenizer();
    this.p = new Parser();
    
    this.primitive = new Array();
    this.command = new Array();
    this.turtle_command = new Array();
    this.constant = new Array();
    
    this.alias = new Array();

    this.repcount = -1;
    this.setup();
}

Logo.prototype.random = function () {
    this.seed = (this.seed * 214013 + 2531011)%4294967296;
    return ((this.seed >> 16) & 0x7fff) / 32768.0;
}

Logo.prototype.srand = function(seed) {
    this.seed = seed;
}

Logo.prototype.addAlias = function (name, wrd) {
    this.alias[name] = wrd;
}

Logo.prototype.addConstant = function(name, value) {
    this.constant[name] = value;
};

Logo.prototype.addCommand   = function(name, grab, aliases, fun) {
    this.command[name] = fun
    this.addBuiltin(name, grab,aliases);
};

Logo.prototype.addPrimitive = function(name, grab, aliases, fun) {
    this.primitive[name] = fun
    this.addBuiltin(name, grab,aliases);
};

Logo.prototype.addInfix = function(name, fun, p) {
    this.addAlias(name, fun);
    this.p.addInfix(name,p);
}

Logo.prototype.addTurtleCommand = function(name, grab, aliases) {
    this.turtle_command[name] = grab;
    this.addBuiltin(name, grab,aliases);
};

Logo.prototype.addBuiltin = function(name,grab,aliases) {
    this.p.addCommand(name, grab);
    if (aliases != null && aliases.length) {
        for (var a in aliases) {
            this.addAlias(aliases[a],name);
            this.p.addCommand(aliases[a], grab);
        }
    }
}

Logo.prototype.setup = function () {

    this.addCommand('forward',1,['fw','fd'], function (a) { 
        if (parseFloat(a[0]) != a[0]) return new Token('error','Can only go forward a number, not '+a[0])
        this.turtle.forward(parseInt(a[0]));
    });
    
    this.addCommand('backward',1,['bw','bk','back'], function (a) { 
        if (parseFloat(a[0]) != a[0]) return new Token('error','Can only go backward a number, not '+a[0])
        this.turtle.backward(parseInt(a[0]));
    });
    this.addCommand('right',1,['rt'], function (a) { 
        if (parseFloat(a[0]) != a[0]) return new Token('error','Can only turn right a number of degrees, not '+a[0])
        this.turtle.right(a[0]);
    });
    this.addCommand('left',1,['lt'], function (a) { 
        if (parseFloat(a[0]) != a[0]) return new Token('error','Can only turn left a number of degrees, not '+a[0])
        this.turtle.left(a[0]);
    });

    this.addCommand('setx',1,null, function (a) { 
        if (parseInt(a[0]) != a[0]) return new Token('error','Can only set x to a whole number, not '+a[0])
        this.turtle.setx(a[0]);
    });

    this.addCommand('sety',1,null, function (a) { 
        if (parseInt(a[0]) != a[0]) return new Token('error','Can only set y to a whole number, not '+a[0])
        this.turtle.sety(a[0]);
    });
    
    this.addCommand('setheading',1,['seth'], function (a) { 
        alert('foo');
        if (parseFloat(a[0]) != a[0]) return new Token('error','Can only set heading to a number, not '+a[0])
        this.turtle.setheading(a[0]);
    });

    this.addCommand('setxy',2,null, function (a) { 
        if (parseInt(a[0]) != a[0]) return new Token('error','When using setxy, you can only set x to a whole number, not '+a[0])
        if (parseInt(a[1]) != a[1]) return new Token('error','When using setxy, you can only set y to a whole number, not '+a[1])
        this.turtle.setxy(a[0],a[1]);
    });

    this.addCommand('setpos',1,null, function (b) { 
        if (b && b.length == 1 && b[0].length == 2 ) {
            var a = b[0];
            if (parseInt(a[0]) != a[0]) return new Token('error','When using setpos, you can only set x to a whole number, not '+a[0])
            if (parseInt(a[1]) != a[1]) return new Token('error','When using setpos, you can only set y to a whole number, not '+a[1])
            this.turtle.setxy(a[0],a[1]);
        } else {
            return new Token('error','You need to pass setpos a list of two arguments [ x y ], not '+b[0]);
        }
    });

    this.addCommand('arc',2,null, function (a) { 
        if (parseFloat(a[0]) != a[0]) return new Token('error','When using arc, you can only set the radius to a number, not '+a[0])
        if (parseFloat(a[1]) != a[1]) return new Token('error','When using arc, you can only set the angle to a number, not '+a[1])
        this.turtle.arc(a[0],a[1]);
    });
    
    this.addCommand('circle',1,null, function (a) { 
        if (parseFloat(a[0]) != a[0]) return new Token('error','When using circle, you can only set the radius to a number, not '+a[0])

        this.turtle.circle(a[0]);
    });
    
    this.addTurtleCommand('penup',0,['pu']);
    this.addTurtleCommand('pendown',0,['pd']);
    this.addTurtleCommand('home',0,null);
    
    this.addCommand('color',1,['colour'], function (a) { 
        if (a[0].length != 3 ) return new Token('error','When using color, pass it a list like [r g b], not '+a[0])

        this.turtle.color(a[0]);
    });
    
    this.addCommand('penwidth',1,['setpensize'], function (a) { 
        if (parseFloat(a[0]) != a[0]) return new Token('error','Pen widths can only be a number, not '+a[0])
        this.turtle.penwidth(a[0]);
    });
    
    this.addTurtleCommand('clearscreen',0,['cs','clear']);
    
    this.addTurtleCommand('reset',0,null);


    this.addCommand('first',1,['head'],function (a) {return a[0][0];});
    this.addCommand('last',1,null,function (a) {var b = a[0]; return b[b.length];});

    this.addCommand('butfirst',1,['tail','bf'],function (a) {return a[0].slice(1);});
    this.addCommand('butlast',1,['bl'],function (a) {var b = a[0]; return b.slice(0,b.length-1);});
    this.addCommand('item',2,null,function (a) {var b = a[1]; return b[a[0]];});
    this.addCommand('setitem',3,null,function (a) {var b = a[1]; b[a[0]]= a[2];});

    this.addCommand('empty?',1,['emptyp'],function (a) {return a[0].length == 0});

    this.addCommand('fput',2,null,function (a) {var b = a[1]; return [a[0]].concat(b.slice(0));});
    this.addCommand('lput',2,null,function (a) {var b = a[1]; return b.slice(0).concat(a[0]);});

    this.addCommand('int',1,null,function (a) {return Math.floor(a[0])});
    this.addCommand('round',1,null,function (a) {return Math.round(a[0])});
    this.addCommand('sqrt',1,null,function (a) {return Math.sqrt(a[0])});
    this.addCommand('power',2,['pow'],function (a) {return Math.pow(a[0],a[1])});
    this.addCommand('exp',1,null,function (a) {return Math.exp(a[0])});
    this.addCommand('ln',1,null,function (a) {return Math.log(a[0])});
    this.addCommand('log10',1,null,function (a) {return Math.LOG10E * Math.log(a[0])});
    this.addCommand('sin',1,null,function (a) {return Math.sin(a[0]/180*Math.PI)});
    this.addCommand('cos',1,null,function (a) {return Math.cos(a[0]/180*Math.PI)});
    this.addCommand('arctan',1,null,function (a) {return Math.atan(a[0])*180/Math.PI});
    this.addCommand('radsin',1,null,function (a) {return Math.sin(a[0])});
    this.addCommand('radcos',1,null,function (a) {return Math.cos(a[0])});
    this.addCommand('radarctan',1,null,function (a) {return Math.atan(a[0])});

    this.addCommand('random',1,['rand'],function (a) {var b= Math.floor(this.random()*a[0]); return b;});
    this.addCommand('rerandom',1,['srand'],function (a) {return this.srand(a[0])});
    
    this.addCommand('bitand',2,null,function (a) {var sum = 1; for (var i in a) {sum=sum&a[i]}; return sum;});
    this.addCommand('bitor',2,null,function (a) {var sum = 0; for (var i in a) {sum=sum|a[i]}; return sum;});
    this.addCommand('bitxor',2,null,function (a) {var sum = 0; for (var i in a) {sum=sum|a[i]}; return sum;});
    this.addCommand('bitnot',1,null,function (a) { return  ~a[0]});
    
    this.addCommand('sum',2,['add'],function (a) {var sum = 0; for (var i in a) {sum+=a[i]}; return sum;});
    this.addCommand('difference',2,['sub'],function (a) {return a[0]-a[1]});
    this.addCommand('product',2,['mul'],function (a) {var product = 1; for (var i in a) {product*=a[i]}; return product;});
    this.addCommand('divide',2,['div'],function (a) {return a[0]/a[1]});
    this.addCommand('modulo',2,['mod','remainder'],function (a) {return a[0]%a[1]});
    this.addCommand('minus',1,null,function (a) {return -a[0]});

    this.addCommand('output',1,['op'],function (a) {return new Token('stop',a[0])});

    this.addInfix('+','sum',40);
    this.addInfix('-','difference',40);
    this.addInfix('*','product',20);
    this.addInfix('/','divide',20);
    this.addInfix('%','modulo',10);
    
    
    this.addCommand('or',2,null,function (a) {return a[0] || a[1]});
    this.addCommand('and',2,null,function (a) {return a[0] && a[1]});
    this.addCommand('not',1,null,function (a) {return !a[0]});

    this.addCommand('equal?',2,['equalp'],function (a) {return a[0] == a[1]});
    this.addCommand('notequal?',2,['notequalp'],function (a) {return a[0] != a[1]});
    this.addCommand('less?',2,['lessp'],function (a) {return a[0] < a[1]});
    this.addCommand('greater?',2,['greaterp'],function (a) {return a[0] > a[1]});

    this.addCommand('greaterequal?',2,['greaterequalp'],function (a) {return a[0] >= a[1]});
    this.addCommand('lessequal?',2,['greaterequalp'],function (a) {return a[0] <= a[1]});

    this.addInfix('=','equal?',60);
    this.addInfix('!=','notequal?',60);
    this.addInfix('<>','notequal?',60);
    this.addInfix('<','less?',60);
    this.addInfix('>','greater?',60);
    this.addInfix('<=','lessequal?',60);
    this.addInfix('>=','greaterequal?',60);

    this.addConstant('stop',new Token('stop',null));


    this.addCommand('array',1,null,function (a) {
        var list = new Array(a[0]);
        for (var i in list) {
            list[i] = 0;
        }
        return list;
    });
   
    this.addPrimitive('forever',1,null,function (args) {
            if (args && args.length == 1) { 
                var cmd = args[0];
                while(true) { 
                    var res = this.eval(cmd);
                    if (res && res.type == "error") return res;
                    if (res && res.type == "stop") return res;
                }
            } else {
                return new Token ('error','I can\'t forever.');
            }
        
        }
    );

    this.addPrimitive('do.until',2,null,function (args) {
            if (args && args.length == 2) { 
                var cmd = args[1];
                while (true) {
                    var res = this.eval(cmd);
                    if (res && res.type == "error") return res;
                    if (res && res.type == "stop") return res;

                    var limit = this.eval(args[0]);
                    if (limit == null) return new Token('error','Don\'t know what the while condition is.');
                    if (limit && limit.type == "error") return limit;
                    if (limit) return;
                }
            } else {
                return new Token ('error','I can\'t repeat.');
            }
        
        }
    );


    this.addPrimitive('do.while',2,null,function (args) {
            if (args && args.length == 2) { 
                var cmd = args[1];
                while (true) {
                    var res = this.eval(cmd);
                    if (res && res.type == "error") return res;
                    if (res && res.type == "stop") return res;

                    var limit = this.eval(args[0]);
                    if (limit == null) return new Token('error','Don\'t know what the while condition is.');
                    if (limit && limit.type == "error") return limit;
                    if (!limit) return;
                }
            } else {
                return new Token ('error','I can\'t repeat.');
            }
        
        }
    );

    this.addPrimitive('until',2,null,function (args) {
            if (args && args.length == 2) { 
                var cmd = args[1];
                while (true) {
                    var limit = this.eval(args[0]);
                    if (limit == null) return new Token('error','Don\'t know what the while condition is.');
                    if (limit && limit.type == "error") return limit;
                    if (limit) return;
                
                    var res = this.eval(cmd);
                    if (res && res.type == "error") return res;
                    if (res && res.type == "stop") return res;
                }
            } else {
                return new Token ('error','I can\'t repeat.');
            }
        
        }
    );
    this.addPrimitive('while',2,null,function (args) {
            if (args && args.length == 2) { 
                var cmd = args[1];
                while (true) {
                    var limit = this.eval(args[0]);
                    if (limit == null) return new Token('error','Don\'t know what the while condition is.');
                    if (limit && limit.type == "error") return limit;
                    if (!limit) return;
                
                    var res = this.eval(cmd);
                    if (res && res.type == "error") return res;
                    if (res && res.type == "stop") return res;
                }
            } else {
                return new Token ('error','I can\'t repeat.');
            }
        
        }
    );

    this.addPrimitive('repeat',2,null,function (args) {
            if (args && args.length == 2) { 
                var limit = this.eval(args[0]);
                if (limit == null) return new Token('error','Don\'t know how many times to repeat');
                if (limit && limit.type == "error") return limit;
                if (limit != parseInt(limit)) return new Token('error','I can only repeat things a whole number of times, and '+ limit+' is not a whole number');
                
                var cmd = args[1];
                for (var c = 0; c< limit; c++) {
                    var res = this.eval(cmd);
                    if (res && res.type == "error") return res;
                    if (res && res.type == "stop") return res;
                }
            } else {
                return new Token ('error','I can\'t repeat.');
            }
        
        }
    );
    
    this.addPrimitive('if',2,null,function (args) {
            if (args && args.length == 2) { 
                var cond = this.eval(args[0]);
                if (cond && cond.type == "error") return cond;
                if (cond == null) return new Token('error','if needs a condition, something that is true or false. what is being run is returning null');

                if (cond) {
                    return this.eval(args[1]);
                }
            } else {
                return new Token ('error','I can\'t if.');
            }
        
        }
    );
    
    
    this.addPrimitive('ifelse',3,null,function (args) {
            if (args && args.length == 3) { 
                var cond = this.eval(args[0]);
                if (cond && cond.type == "error") return cond;
                if (cond == null) return new Token('error','if needs a condition, something that is true or false. what is being run is returning null');

                if (cond) {
                    return this.eval(args[1]);
                } else {
                    return this.eval(args[2]);
                }
            } else {
                return new Token ('error','I can\'t if.');
            }
        
        }
    );
        
    this.addPrimitive('make',2,null,function (args) {
            if (args && args.length == 2) {
                if (args[0].type == "sym") {
                    var name = this.eval(args[0]);
                    if (name == null) return new Token('error','Can\'t make with no name');
                    if (name && name.type == "error") return name;
            
                    var value = this.eval(args[1]);
                    if (value == null) return new Token('error','Can\'t set '+name+' to null');
                    if (value && value.type == "error") return value;
            
                    //alert("make "+name+" "+value);
                    this.values.set(name,value);
                } else {
                    return new Token('error','I can\'t make - '+args[0].data+' is not a symbol');
                }
            }
        }
    )
    
    this.addConstant('true',true);
    this.addConstant('false',false);
    
}


Logo.prototype.run = function (code) {
    var js = new Array();
   
    this.t.load(code);
    this.p.load(this.t); 
    
    var i = null;
    
    this.turtle.start();
    
    var ret = null;
    do {
        i = this.p.next();
        if (i == null) { ret =new Token('error','I can\'t parse this.'); break;}
        if (i.type == "error") {ret = i; break;}
        if (i.type == "eof") break;
        
        var out = this.eval(i);
        if (out && out.type == "error") {ret = out; break;}
        
    } while (1);
    
    this.turtle.finish();
    return ret;
}

Logo.prototype.eval = function (code) {
    //alert("evaling "+code.type);
    if (code == null) {
        return null;
    } else if (code.type == "def") {        // a definition: to ....
        this.functions.set(code.data,code.args);
        //alert(code.args.args.length);
    } else if (code.type == "lst") {        // a list of items
        //alert('evaling list');
        return this.eval_list(code.args);
    } else if (code.type == "wrd" || code.type=="ops") {        // a command
        if (this.alias[code.data] != null) {
            code.data = this.alias[code.data];
        }
        
        if (this.constant[code.data] != null) {    // a constant

            return this.constant[code.data];
            
        } else if (this.primitive[code.data] != null) {    // an primitive operation, don't eval args
            var f = this.primitive[code.data];
            var l = code.args;
            
            if (l && l.type == 'error') return l;
            
            var result = f.call(this,l);
            
            return result;
        } else if (this.command[code.data] != null) {    // an command operation, eval args.
            var f = this.command[code.data];
            var l = this.eval_list(code.args);
            
            if (l && l.type == 'error') return l;
            
            var result = f.call(this,l);
            
            return result;
        
        } else if (this.turtle_command[code.data] != null) {  // a turtle command, eval and pass to the turtle.

            // it's a builtin
            var f = this.turtle[code.data];
            var l = this.eval_list(code.args);
            if (l && l.type == 'error') return l;
            f.apply(this.turtle,l);
            return null;
        
        } else if (this.functions.get(code.data) != null) { // a user defined function

            var f = this.functions.get(code.data);
            var last = f.code[f.code.length-1];
            var newvalues = new SymbolTable(this.values);

            for (var c  in code.args) {
                var name = f.args[c].data;
                var value = this.eval(code.args[c]);
                if (value == null) return new Token('error','Can\'t pass a null to '+code.data);
                if (value && value.type == 'error') return value;

                //alert("call "+code.data+" setting: "+name +":" +value);
                newvalues.set(name,value);

            }
            
            if (last.type == "wrd" && last.data == code.data) {
                
                var par = this.values;
                
                var tail = f.code.pop();
                while (1) { // revursive
                    this.values = newvalues;
                    var result = this.eval_list(f.code);
                    
                    if (result && result.type == "stop") {
                        this.values = par; // restore the original stack
                        f.code.push(tail); // restore the original tail.
                        return result.data;
                    };
                    
                    newvalues = new SymbolTable(par);
                    
                    for (var c in code.args) {
                        var name = f.args[c].data;
                        var value = this.eval(tail.args[c]);
                        if (value == null) return new Token('error','Can\'t pass a null to '+code.data);
                        if (value && value.type == 'error') return value;
    
                        //alert("rec: "+code.data+" setting: "+name +":" +value);
                        newvalues.set(name,value);
    
                    }
            
                }
            } else {
                this.values = newvalues;
         
                var result = this.eval_list(f.code);
                
                if (result && result.type == "stop") { result = result.data };

                this.values = this.values.par;
                return result
            }
        } else {
            return new Token('error','I don\'t know how to ' + code.data);
        }
    } else if (code.type == "var") {        // a variable
        var r = this.values.get(code.data);
        //alert("getting:" + code.data + ":"+ r);
        return r;
        
    } else if (code.type == "num" || code.type == "sym") { // a number / symbol
        return code.data;
    } else {
        return new Token ('error', 'I don\'t know how to evaluate '+code.data); 
    }
}

Logo.prototype.eval_list = function(args) {
    if (args == null) { return null;}
    var ret = new Array()
    for (var i = 0; i < args.length; i++) {
        //alert(args[i]);
        var res = this.eval(args[i]);
        if (res && res.type == "error") {
            return res;
        } else if (res  && res.type== "stop") {
            return res
        } else {
            ret.push(res);
        }
    }
    return ret;
}
    

function SymbolTable (par) {
    this.par = par;
    this.table = new Array();
}

SymbolTable.prototype.get = function (key) {
    var mkey = "_"+key;
    var r = this.table[mkey];
    if (r == null && this.par != null) {
        t = this.par.get(key);
    }
    return r;
}


SymbolTable.prototype.set = function (key,value) {
    var mkey = "_" + key;
    //alert(key+":"+value);
    this.table[mkey] = value;
    //alert("set!");
}



function Parser () {
    this.tk = null;
    this.grab = new Array();
    this.infix = new Array();
}

Parser.prototype.load = function(tk) {
    this.tk = tk;
}

Parser.prototype.addCommand = function (wrd,n) {
    this.grab[wrd] = n;
}

Parser.prototype.addInfix = function (wrd,p) {
    this.infix[wrd] = p;
}

Parser.prototype.next = function (precedent) {
    if (precedent == null) precedent = 100;
    
    var token = this.tk.next();

    //alert("got token: "+token);
    
    if (token == null) return new Token('error','I don\'t know how to tokenize this.');
    
    if (token.type == "error") return token;
    
    if (token.type == "eof") {
        this.tk = null;
        return token;
    } else if (token.type == "ops") {
        //alert("ops");
        if (token.data == '(') {
        
            var args = new Array();
            
            var look = this.tk.peek()
            var name = null;
            
            if (look && look.type == "wrd") {
                name = this.tk.next();
            }
            do {
                var i = this.next();
                
                if (i == null) return new Token('error','I don\'t know how to tokenize this');
                if (i.type == "error") return i;
                if (i.type == "eof") return new Token('error','You\'re missing a )');
             
                if (i.type == "ops" && i.data == ')') break;
                
                args.push(i);
            } while (1);
            //alert("end of list");
            if (name) {
                token = name
                token.args = args;
            
            } else if (args.length == 1) {
                token = args[0];
            } else{
                token.type = "lst";
                token.data
                token.args = args;
            } 
            //alert(token);
        
        } else if (token.data == '[') {
        
            var args = new Array();
            do {
            
                var i = this.next();
                
                if (i == null) return new Token('error','I don\'t know how to tokenize this');
                if (i.type == "error") return i;
                if (i.type == "eof") return new Token('error','You\'re missing a ]');
             
                if (i.type == "ops" && i.data == ']') break;
                
                args.push(i);
            } while (1);
            //alert("end of list");
            
            token.type = "lst";
            token.data
            token.args = args;
            //alert(token);
        } else if (token.data == "to") {
            
            var name = this.tk.next();

            if (name == null) return new Token('error','I don\'t know how to tokenize this');
            if (name.type == "error") return i;
            if (name.type == "eof") return new Token('error','You need to say what the name os for to.');
            
            if (name.type == "wrd") {
                name = name.data;
            } else {
                return new Token('error',name.data + " is not a good name for a function");
            }

            var args = new Array();
            
            var i = null;
            do {
                i = this.tk.peek();
                
                if (i == null) return new Token('error','I don\'t know how to tokenize this');
                if (i.type == "error") return i;
                if (i.type == "eof") return new Token('error','to '+name+' needs an end');
             
                if (i.type !="var") break;
                
                args.push(this.tk.next());
                this.addCommand(name, args.length);
                
            } while (1);
            
            
            
            var code = new Array();
            
            do {
                
                i = this.next();
                if (i == null) return new Token('error','I don\'t know how to tokenize this');
                if (i.type == "error") return i;
                if (i.type == "eof") return new Token('error','to '+name+' needs an end');
                
                if (i.type == "ops" && i.data == 'to') return new Token('error','I\'m sorry, you can\'t have nested to\'s');
                if (i.type == "ops" && i.data == 'end') break;
                
                code.push(i);
                
            } while (1);
            
            //alert("end of list");
            
            token.type = "def";
            token.data = name;
            
            token.args = new Command(args,code);

            //alert(token);
        }
    } else if (token.type == "wrd") {
         var g = this.grab[token.data];
         //alert("grabbing "+g+" for "+token.data);
         if (g != null) {
             var args = new Array();
             var t = g;
             while (g > 0) {
                var i = this.next();
                
                if (i == null) return new Token('error','I don\'t know how to tokenize this');
                if (i.type == "error") return i;
                if (i.type == "eof") return new Token('error','I can\'t '+ token.data+", it needs "+g+" more arguments, I got "+(t-g)+".");
                  
                args.push(i);
                g--;
                //alert(i.type+i.data);
            }
            token.args = args;
         }
    }
    if (token.type != 'ops' ) while (1) {
        var look = this.tk.peek()
        //alert("lookahead = "+look+" " +this.infix[look.data] ) ;
        if (look && this.infix[look.data] && this.infix[look.data] < precedent) {
            //alert("whee, an infix op");
            var op_token = this.tk.next();
            //alert(op_token);
            var right = this.next(this.infix[look.data]);
            //alert(right);
            op_token.args = new Array(token, right);
            token = op_token;
            
        
        } else {
            break;
        }
    }
    //alert("returning token "+ token)
    return token;
}


function Command (args,code) {
    this.args = args;
    this.code = code;
    
}



function Token(type,data) {
    this.type = type;
    this.data = data;
    this.args = null; 
    this.code = null;

}

Token.prototype.toString = function () {
        return "(" + this.type + ")" + this.data ;
}



function Tokenizer () {

    this.text = null;
    this.cache = new Array()
 }
 
Tokenizer.prototype.load = function (text) {
    this.text = text;
}

 
Tokenizer.prototype.ops_rx = /^\s*(!=|<>|<=|>=|\+|\-|\*|\/|\%|<|>|=|\[|\]|\(|\)|to|end)\s*/i;
Tokenizer.prototype.wrd_rx = /^\s*([a-zA-Z\.]\w*\??)\s*/i;
Tokenizer.prototype.var_rx = /^\s*:([a-zA-Z]\w*)\s*/i;
Tokenizer.prototype.num_rx = /^\s*(\d+(?:\.\d+)?)\s*/i;
Tokenizer.prototype.sym_rx = /^\s*"([a-zA-Z]\w*)\s*/i;

Tokenizer.prototype.empty = /^\s*$/;

Tokenizer.prototype.peek = function () {
    if (this.cache.length > 0) { 
        return this.cache[0];
    } else {
        var token = this.next();
        this.cache.push(token);
        return token;
    }
    
}
Tokenizer.prototype.next = function () {
    if (this.cache.length > 0) {
        return this.cache.shift();
    }

    if (this.empty.exec(this.text)) {
        this.text = null;
        return new Token('eof','');
    } else if ((result = this.ops_rx.exec(this.text)) != null) {
        this.text = this.text.substring(result[0].length)
        return new Token('ops',result[1].toLowerCase());

    } else if ((result = this.wrd_rx.exec(this.text)) != null) {
        this.text = this.text.substring(result[0].length)
        return new Token('wrd',result[1].toLowerCase());

    } else if ((result = this.var_rx.exec(this.text)) != null) {
        this.text = this.text.substring(result[0].length)
        return new Token('var',result[1].toLowerCase());

    } else if ((result = this.num_rx.exec(this.text)) != null) {
        this.text = this.text.substring(result[0].length)
        return new Token('num',parseFloat(result[1]));

    } else if ((result = this.sym_rx.exec(this.text)) != null) {
        this.text = this.text.substring(result[0].length)
        return new Token('sym',result[1].toLowerCase());

    } else {
        return new Token('error', 'I can\'t understand this:'+this.text);
    }
}   



            
