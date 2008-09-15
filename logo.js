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
    
    this.alias = new Array();
    
    this.addAlias = function (name, wrd) {
        this.alias[name] = wrd;
    }

    
    this.addCommand   = function(name, grab, aliases, fun) {
        this.command[name] = fun
        this.addBuiltin(name, grab,aliases);
        };

    this.addPrimitive = function(name, grab, aliases, fun) {
        this.primitive[name] = fun
        this.addBuiltin(name, grab,aliases);
    };

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
    
        this.addTurtleCommand('forward',1,['fw']);
        this.addTurtleCommand('backward',1,['bw']);
        this.addTurtleCommand('right',1,['rt']);
        this.addTurtleCommand('left',1,['lt']);
        this.addTurtleCommand('penup',1,['pu']);
        this.addTurtleCommand('pendown',1,['pd']);
        
        this.addTurtleCommand('color',3,['colour']);
        this.addTurtleCommand('penwidth',1,null);
        this.addTurtleCommand('clear',0,['cs','clearscreen']);
        
        this.addTurtleCommand('reset',0,null);
        
        this.addCommand('add',2,['sum'],function (a) {return a[0]+a[1]});
        this.addCommand('sub',2,['difference'],function (a) {return a[0]-a[1]});
        this.addCommand('mul',2,['product'],function (a) {return a[0]*a[1]});
        this.addCommand('div',2,['divide'],function (a) {return a[0]/a[1]});
            
        this.addPrimitive('repeat',2,null,function (args) {
                if (args && args.length == 2) { 
                    var limit = this.eval(args[0]);
                    if (limit == null) return new Token('error','Don\'t know how many times to repeat');
                    if (limit && limit.type == "error") return limit;
    
                    var cmd = args[1];
                    for (var c = 0; c< limit; c++) {
                        var res = this.eval(cmd);
                        if (res && res.type == "error") return res;
                    }
                } else {
                    return new Token ('error','I can\'t repeat.');
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
        //alert("evaling "+code);
        if (code == null) {
            return null;
        } else if (code.type == "def") {        // a definition: to ....
            this.functions.set(code.data,code.args);
            //alert(code.args.args.length);
            this.p.addCommand(code.data,code.args.args.length);
        } else if (code.type == "lst") {        // a list of items
            //alert('evaling list');
            return this.eval_list(code.args);
        } else if (code.type == "wrd") {        // a command
        
            if (this.alias[code.data] != null) {
                code.data = this.alias[code.data];
            }
            
            if (this.primitive[code.data] != null) {    // an primitive operation, don't eval args
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
                var result = this.eval_list(f.code);

                this.values = this.values.par;
                return result

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

    this.next = function () {
        
        var token = this.tk.next();

        //alert("got token: "+token);
        
        if (token == null) return new Token('error','I don\'t know how to tokenize this.');
        
        if (token.type == "error") return token;
        
        if (token.type == "eof") {
            this.tk = null;
            return token;
        }
        
        if (token.type == "wrd") {
            if (token.data == "to") {
                var code = new Array();

                var name = this.tk.next();

                if (name == null) return new Token('error','I don\'t know how to tokenize this');
                if (name.type == "error") return i;
                if (name.type == "eof") return new Token('error','You need to say what the name os for to.');
                
                if (name.type == "wrd") {
                    name = name.data;
                } else {
                    return new Token('error',name.data + " is not a good name for a function");
                }

                do {
                    var i = this.next();
                    
                    if (i == null) return new Token('error','I don\'t know how to tokenize this');
                    if (i.type == "error") return i;
                    if (i.type == "eof") return new Token('error','You can\'t have an endless to');
                 
                    if (i.type == "wrd" && i.data == 'end') break;
                    
                    code.push(i);
                } while (1);
                //alert("end of list");
                
                var args = new Array();
                while (code[0].type == "var") {
                    args.push(code.shift());
                }

                token.type = "def";
                token.data = name;
                
                token.args = new Command(args,code);

                //alert(token);
            
            } else if (token.data == '[') {
            
                var args = new Array();
                do {
                    var i = this.next();
                    
                    if (i == null) return new Token('error','I don\'t know how to tokenize this');
                    if (i.type == "error") return i;
                    if (i.type == "eof") return new Token('error','Lists have a start "[", middle and and end "]". Yours does not have an end');
                 
                    if (i.type == "wrd" && i.data == ']') break;
                    
                    args.push(i);
                } while (1);
                //alert("end of list");
                
                token.type = "lst";
                token.data
                token.args = args;
                //alert(token);
            
            } else {
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
    
    this.wrd_rx = /^\s*([a-zA-Z]\w*|\[|\])\s*/i;
    this.var_rx = /^\s*:([a-zA-Z]\w*)\s*/i;
    this.num_rx = /^\s*(\d+(?:\.\d+)?)\s*/i;
    this.sym_rx = /^\s*"([a-zA-Z]\w*)\s*/i;

    this.empty = /^\s*$/;
    this.next = function () {

        if (this.empty.exec(this.text)) {
            this.text = null;
            return new Token('eof','');

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


            
