// $Id$


    

function Logo () {
    this.turtle = null;
    
    this.setTurtle = function(turtle) {
        this.turtle = turtle;
    }
    
    this.functions = new SymbolTable();
    this.values = new SymbolTable();
    
    this.t = new Tokenizer();
    this.p = new Parser();
    
    this.primitive = new Array();
    this.command = new Array();
    this.turtle_command = new Array();
    this.constant = new Array();
    
    this.alias = new Array();
    
    this.addAlias = function (name, wrd) {
        this.alias[name] = wrd;
    }
    
    this.addConstant = function(name, value) {
        this.constant[name] = value;
    };

    this.addCommand   = function(name, grab, aliases, fun) {
        this.command[name] = fun
        this.addBuiltin(name, grab,aliases);
        };

    this.addPrimitive = function(name, grab, aliases, fun) {
        this.primitive[name] = fun
        this.addBuiltin(name, grab,aliases);
    };
    
    this.addInfix = function(name, fun, p) {
        this.addAlias(name, fun);
        this.p.addInfix(name,p);
    }
    
    this.addTurtleCommand = function(name, grab, aliases) {
        this.turtle_command[name] = grab;
        this.addBuiltin(name, grab,aliases);
    };

    this.addBuiltin = function(name,grab,aliases) {
        this.p.addCommand(name, grab);
        if (aliases != null && aliases.length) {
            for (var a in aliases) {
                this.addAlias(aliases[a],name);
                this.p.addCommand(aliases[a], grab);
            }
        }
    }

    this.setup = function () {
    
        this.addCommand('forward',1,['fw'], function (a) { 
            if (parseInt(a[0]) != a[0]) return new Token('error','Can only go forward a whole number, not '+a[0])
            this.turtle.forward(a[0]);
        });
        
        this.addCommand('backward',1,['bw'], function (a) { 
            if (parseInt(a[0]) != a[0]) return new Token('error','Can only go backward a whole number, not '+a[0])
            this.turtle.backward(a[0]);
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
            if (parseInt(a[0]) != a[0]) return new Token('error','Can only set heading to a whole number, not '+a[0])
            this.turtle.setheading(a[0]);
        });

        this.addCommand('setxy',2,null, function (a) { 
            if (parseInt(a[0]) != a[0]) return new Token('error','When using setxy, you can only set x to a whole number, not '+a[0])
            if (parseInt(a[1]) != a[1]) return new Token('error','When using setxy, you can only set y to a whole number, not '+a[1])
            this.turtle.setxy(a[0],a[1]);
        });

        this.addCommand('arc',2,null, function (a) { 
            if (parseInt(a[0]) != a[0]) return new Token('error','When using arc, you can only set the radius to a whole number, not '+a[0])
            if (parseInt(a[1]) != a[1]) return new Token('error','When using arc, you can only set the angle to a whole number, not '+a[1])
            this.turtle.arc(a[0],a[1]);
        });
        
        this.addCommand('circle',1,null, function (a) { 
            if (parseInt(a[0]) != a[0]) return new Token('error','When using circle, you can only set the radius to a whole number, not '+a[0])
 
            this.turtle.circle(a[0]);
        });
        

        this.addTurtleCommand('penup',0,['pu']);
        this.addTurtleCommand('pendown',0,['pd']);
        this.addTurtleCommand('home',0,null);
        
        this.addCommand('color',1,['colour'], function (a) { 
            if (a[0].length != 3 ) return new Token('error','When using color, pass it a list like [r g b], not '+a[0])
 
            this.turtle.color(a[0]);
        });
        
        this.addCommand('penwidth',1,null, function (a) { 
            if (parseInt(a[0]) != a[0]) return new Token('error','Pen widths can only be a whole number, not '+a[0])
            this.turtle.penwidth(a[0]);
        });
        
        this.addTurtleCommand('clearscreen',0,['cs','clear']);
        
        this.addTurtleCommand('reset',0,null);
        
        this.addCommand('sum',2,['add'],function (a) {return a[0]+a[1]});
        this.addCommand('difference',2,['sub'],function (a) {return a[0]-a[1]});
        this.addCommand('product',2,['mul'],function (a) {return a[0]*a[1]});
        this.addCommand('divide',2,['div'],function (a) {return a[0]/a[1]});
        this.addCommand('modulo',2,['mod'],function (a) {return a[0]%a[1]});
        this.addCommand('minus',1,null,function (a) {return -a[0]});

        this.addInfix('+','sum',40);
        this.addInfix('-','difference',40);
        this.addInfix('*','product',20);
        this.addInfix('/','product',20);
        this.addInfix('%','modulo',10);
        
        
        this.addCommand('or',2,null,function (a) {return a[0] || a[1]});
        this.addCommand('and',2,null,function (a) {return a[0] && a[1]});
        this.addCommand('not',1,null,function (a) {return !a[0]});

        this.addCommand('equals?',2,null,function (a) {return a[0] == a[1]});
        this.addCommand('less?',2,null,function (a) {return a[0] < a[1]});
        this.addCommand('greater?',2,null,function (a) {return a[0] > a[1]});
       
        this.addInfix('=','equals?',60);
        this.addInfix('<','less?',60);
        this.addInfix('>','greater?',60);

        this.addConstant('stop','stop');
       

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
                        if (res == "stop") return null;
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
    
    
    this.run = function (code) {
        var js = new Array();
       
        this.t.load(code);
        this.p.load(this.t); 
        
        var i = null;
        
        do {
            i = this.p.next();
            if (i == null) return new Token('error','I can\'t parse this.');
            if (i.type == "error") return i;
            if (i.type == "eof") {
                i = null;
                break;
            }
            
            var out = this.eval(i);
            if (out && out.type == "error") {return out;}
            
            
        } while (1);
        
        return
        }
    
    this.eval = function (code) {
        //alert("evaling "+code.type);
        if (code == null) {
            return null;
        } else if (code.type == "def") {        // a definition: to ....
            this.functions.set(code.data,code.args);
            //alert(code.args.args.length);
        } else if (code.type == "lst") {        // a list of items
            //alert('evaling list');
            return this.eval_list(code.args);
        } else if (code.type == "wrd") {        // a command
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

                for (var c = 0; c < code.args.length; c ++ ) {
                    var name = f.args[c].data;
                    var value = this.eval(code.args[c]);
                    if (value == null) return new Token('error','Can\'t pass a null to '+code.data);
                    if (value && value.type == 'error') return value;

                    //alert("setting: "+name +":" +value);
                    newvalues.set(name,value);

                }
                this.values = newvalues;
                
                if (last.type == "wrd" && last.data == code.data) {
                     var tail = f.code.pop();
                     while (1) {
                        
                        var result = this.eval_list(f.code);
                        
                        if (result == "stop") { return null;};
                        
                        newvalues = new SymbolTable(this.values.par);
                        
                        for (var c = 0; c < code.args.length; c ++ ) {
                            var name = f.args[c].data;
                            var value = this.eval(tail.args[c]);
                            if (value == null) return new Token('error','Can\'t pass a null to '+code.data);
                            if (value && value.type == 'error') return value;
        
                            //alert("setting: "+name +":" +value);
                            newvalues.set(name,value);
        
                        }
                        
                        this.values = newvalues;
                    }
                } else {
                    var result = this.eval_list(f.code);
                    
                    if (result == "stop") { result = null };
    
                    this.values = this.values.par;
                    return result
                }
            } else {
                return new Token('error','I don\'t know how to ' + code.data);
            }
        } else if (code.type == "var") {        // a variable
            var r = this.values.get(code.data);
            //alert("getting:" + code.data + ":"+ r);
            return r
            
        } else if (code.type == "num" || code.type == "sym") { // a number / symbol
            return code.data;
        }
    }
    
    this.eval_list = function(args) {
        if (args == null) { return null;}
        var ret = new Array()
        for (var i = 0; i < args.length; i++) {
            //alert(args[i]);
            var res = this.eval(args[i]);
            if (res && res.type == "error") {
                return res;
            } else if (res == "stop") {
                return "stop";
            } else {
                ret.push(res);
            }
        }
        return ret;
    }
    
    this.setup();
}

function SymbolTable (par) {
    this.par = par;
    this.table = new Array();
    this.get = function (key) {
        var r = this.table[key];
        if (r == null && this.par != null) {
            t = this.par.get(key);
        }
        return r;
    }
    this.set = function (key,value) {
        this.table[key] = value;
    }
}


function Parser () {
    
    this.tk = null;

    this.load = function(tk) {
        this.tk = tk;
    }

    this.grab = new Array();
    
    this.addCommand = function (wrd,n) {
        this.grab[wrd] = n;

    }
    
    this.infix = new Array();
    
    this.addInfix = function (wrd,p) {
        this.infix[wrd] = p;
    }

    this.next = function (precedent) {
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
                do {
                    var i = this.next();
                    
                    if (i == null) return new Token('error','I don\'t know how to tokenize this');
                    if (i.type == "error") return i;
                    if (i.type == "eof") return new Token('error','You\'re missing a )');
                 
                    if (i.type == "ops" && i.data == ')') break;
                    
                    args.push(i);
                } while (1);
                //alert("end of list");
                if (args.length == 1) {
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
                    i = this.next();
                    
                    if (i == null) return new Token('error','I don\'t know how to tokenize this');
                    if (i.type == "error") return i;
                    if (i.type == "eof") return new Token('error','to '+name+' needs an end');
                 
                    if (i.type !="var") break;
                    
                    args.push(i);
                    this.addCommand(name, args.length);
                    
                } while (1);
                
                
                
                var code = new Array();
                
                do {
                    
                    if (i == null) return new Token('error','I don\'t know how to tokenize this');
                    if (i.type == "error") return i;
                    if (i.type == "eof") return new Token('error','to '+name+' needs an end');
                    
                    if (i.type == "ops" && i.data == 'end') break;
                    
                    code.push(i);
                    
                    i = this.next();
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
                op_token.type = "wrd";
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

    this.toString = function () {
        return "(" + type + ")" + data ;
    }
}

function Tokenizer () {

    this.text = null;

    this.load = function (text) {
        this.text = text;
    }
    
    this.cache = new Array()
    
    this.ops_rx = /^\s*(\+|\-|\*|\/|\%|\<|\>|\=|\[|\]|\(|\)|to|end)\s*/i;
    this.wrd_rx = /^\s*([a-zA-Z]\w*\??)\s*/i;
    this.var_rx = /^\s*:([a-zA-Z]\w*)\s*/i;
    this.num_rx = /^\s*(\d+(?:\.\d+)?)\s*/i;
    this.sym_rx = /^\s*"([a-zA-Z]\w*)\s*/i;

    this.empty = /^\s*$/;
    
    this.peek = function () {
        if (this.cache.length > 0) { 
            return this.cache[0];
        } else {
            var token = this.next();
            this.cache.push(token);
            return token;
        }
        
    }
    this.next = function () {
        if (this.cache.length > 0) {
            return this.cache.shift();
        }

        if (this.empty.exec(this.text)) {
            this.text = null;
            return new Token('eof','');
        } else if ((result = this.ops_rx.exec(this.text)) != null) {
            this.text = this.text.substring(result[0].length)
            return new Token('ops',result[1]);

        } else if ((result = this.wrd_rx.exec(this.text)) != null) {
            this.text = this.text.substring(result[0].length)
            return new Token('wrd',result[1]);

        } else if ((result = this.var_rx.exec(this.text)) != null) {
            this.text = this.text.substring(result[0].length)
            return new Token('var',result[1]);

        } else if ((result = this.num_rx.exec(this.text)) != null) {
            this.text = this.text.substring(result[0].length)
            return new Token('num',parseFloat(result[1]));

        } else if ((result = this.sym_rx.exec(this.text)) != null) {
            this.text = this.text.substring(result[0].length)
            return new Token('sym',result[1]);

        } else {
            return new Token('error', 'I can\'t understand this:'+this.text);
        }
    }   
}


            
