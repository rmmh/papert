function eval_logo(code, turtle) {

    var js = new Array();
   
    var t = new Tokenizer(code)
    var p = new Parser(t); 
    
    var i = null;
    
    do {
        i = p.next();
        if (p == null) return ['error','null parse tree received'];
        if (p[0] == "error") return p;
        if (p[0] == "eof") {
            p = null;
            break;
        }
           
        
        alert(i.type +":"+i.data+":"+i.args);
    } while (1);
    
    return  js;
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
            
        //alert(token[0]);
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
                token.args = args;
            
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


            
