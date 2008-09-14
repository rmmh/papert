// $Id$

function Logo (turtle) {
    this.turtle = turtle;

    this.functions = new SymbolTable();
    this.values = new SymbolTable();
    
    this.t = new Tokenizer();
    this.p = new Parser();

    var builtins = new Array();
        builtins['forward'] = true;
        builtins['backward'] = true;
        builtins['right'] = true;
        builtins['left'] = true;
        builtins['penup'] = true;
        builtins['pendown'] = true;
        builtins['clear'] = true;
        builtins['reset'] = true;

    this.builtins = builtins;

    var arithmetic = new Array();
        arithmetic['add'] = function (x,y) {return x+y};
        arithmetic['sub'] = function (x,y) {return x-y};
        arithmetic['mul'] = function (x,y) {return x*y};
        arithmetic['div'] = function (x,y) {return x/y};

    this.arithmetic = arithmetic;

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
        } else if (code.type == "def") {
            this.functions.set(code.data,code.args);
            //alert(code.args.args.length);
            this.p.addCommand(code.data,code.args.args.length);
        } else if (code.type == "lst") {
            //alert('evaling list');
            this.eval_list(code.args);
        } else if (code.type == "wrd") {
            if (code.data == "repeat") {
               // alert("repeat");
                //alert(code.args[0].type);
                if (code.args && code.args.length == 2) { 
                    var limit = this.eval(code.args[0]);
                    var cmd = code.args[1];
                    for (var c = 0; c< limit; c++) {
                        this.eval(cmd);
                    }
                } else {
                    return new Token ('error','I can\'t repeat.');
                }
            } else if (code.data == "make") {
                if (code.args && code.args.length == 2) {
                    if (code.args[0].type == "sym") {
                        var name = this.eval(code.args[0]);
                        var value = this.eval(code.args[1]);
                        //alert("make "+name+" "+value);
                        this.values.set(name,value);
                    } else {
                        return new Token('error','I can\'t make - '+code.args[0].data+' is not a symbol');
                    }
                } else {
                    return new Token('error','I can\'t make');
                }
            } else if (this.arithmetic[code.data]) {
                //alert("arith");
                var x = this.eval(code.args[0]);
                var y = this.eval(code.args[1]);

                var result = this.arithmetic[code.data](x,y);
                //alert(""+x+" "+code.data+" "+y+" = "+result);
                return result;
            
            } else if (this.builtins[code.data]) {

                // it's a builtin
                var f = this.turtle[code.data]
                var l = this.eval_list(code.args)
                f.apply(this.turtle,l);
                return null;
            
            } else if (this.functions.get(code.data) != null) {

                var f = this.functions.get(code.data);

                if (code.args && code.args.length > 0) {
                    var newvalues = new SymbolTable(this.values);

                    for (var c = 0; c < code.args.length; c ++ ) {
                        var name = f.args[c].data;
                        var value = this.eval(code.args[c]);
                        //alert("setting: "+name +":" +value);
                        newvalues.set(name,value);

                    }

                    this.values = newvalues;
                    var result = this.eval_list(f.code);

                    this.values = this.values.par;
                    return result

                } else {
                    return this.eval_list(f.code);
                }

            } else {
                return new Token('error','I don\'t know how to ' + code.data);
            }
        } else if (code.type == "var") {
            var r = this.values.get(code.data);
            //alert("getting:" + code.data + ":"+ r);
            return r
        } else if (code.type == "num" || code.type == "sym") {
            return code.data;
        }
    }
    
    this.eval_list = function(args) {
        if (args == null) { return null;}
        var ret = new Array()
        for (var i = 0; i < args.length; i++) {
            //alert(args[i]);
            ret.push(this.eval(args[i]));
        }
        return ret;
    }
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

    var grab = new Array();
        grab['forward'] = 1;
        grab['backward'] = 1;
        grab['right'] = 1;
        grab['left'] = 1;
        
        grab['repeat'] = 2;
        grab['make'] = 2;
        
        grab['add'] = 2;
        grab['sub'] = 2;
        grab['mul'] = 2;
        grab['div'] = 2;

    this.grab = grab;
        
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


    var norm = new Array();
        norm['pu'] = 'penup';
        norm['pd'] = 'pendown';
        norm['fw'] = 'forward';
        norm['bw'] = 'backward';
        norm['cs'] = 'clear';
        norm['rt'] = 'right';
        norm['lt'] = 'left';

    this.norm = norm;
    
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
            if (this.norm[result[1]] != null) {
                result[1] = this.norm[result[1]]
            }
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
            return new Token('error', this.text);
        }
    }   
}


            
