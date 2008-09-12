function Logo (turtle) {
    this.turtle = turtle;

    this.symbols = new Array();
    
    this.run = function (code) {
        var js = new Array();
       
        var t = new Tokenizer(code)
        var p = new Parser(t); 
        
        var i = null;
        
        do {
            i = p.next();
            if (p == null) return new Token('error','null parse tree received');
            if (p.type == "error") return p;
            if (p.type == "eof") {
                p = null;
                break;
            }
            
            var out = this.eval(i);
            if (out && out.type == "error") {return p;}
            
            
        } while (1);
        
        return
        }
    
    this.eval = function (code) {
        //alert("evaling "+code);
        if (code == null) {
            return null;
        } else if (code.type == "lst") {
            //alert('evaling list');
            this.eval_list(code.args);
        } else if (code.type == "wrd") {
            if (code.data == "repeat") {
               // alert("repeat");
                //alert(code.args[0].type);
                if (code.args.length == 2 && code.args[0].type == "num") { 
                    var limit = code.args[0].data;
                    var cmd = code.args[1];
                    for (var c = 0; c< limit; c++) {
                        this.eval(cmd);
                    }
                } else {
                    return new Token ('error','invalid args to repeat');
                }
            } else if (this.symbols[code.data] != null) {
                // it's been defined.
            } else {
                // it's a builtin
                var f = this.turtle[code.data]
                var l = this.eval_list(code.args)
                f.apply(this.turtle,l);
            }
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
function Parser(tk) {
    
    this.tk = tk

    var grab = new Array();
        grab['forward'] = 1;
        grab['backward'] = 1;
        grab['right'] = 1;
        grab['left'] = 1;
        
    
        grab['repeat'] = 2;
        
    this.grab = grab;
        
    this.addCommand = function (wrd,n) {
        this.grab['wrd'] = n;
    }
    
    this.next = function () {
        
        var token = this.tk.next();
        //alert("got token: "+token);
        
        if (token == null) return new Token('error','null token received');
        
        if (token.type == "error") return token;
        
        if (token.type == "eof") {
            this.tk = null;
            return token;
        }
        
        if (token.type == "wrd") {
            if (token.data == '[') {
                var args = new Array();
                do {
                    var i = this.next();
                    
                    if (i == null) return new Token('error','null token received');
                    if (i.type == "error") return i;
                    if (i.type == "eof") return new Token('error','premature eof');
                 
                    if (i.type == "wrd" && i.data == ']') break;
                    
                    args.push(i);
                } while (1);
                //alert("end of list");
                token.type = "lst";
                token.args = args;
                //alert(token);
            
            } else {
                 var g = this.grab[token.data];
                 if (g != null) {
                     var args = new Array();
                     while (g > 0) {
                        var i = this.next();
                        
                        if (i == null) return new Token('error','null token received');
                        if (i.type == "error") return i;
                        if (i.type == "eof") return new Token('error','premature eof');
                          
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

function Token(type,data) {
    this.type = type;
    this.data = data;
    this.args = null; 
    this.toString = function () {
        return "(" + type + ")" + data ;
    }
}

function Tokenizer(text) {

    this.text = text;


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


            
