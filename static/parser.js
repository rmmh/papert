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
                
                i = this.tk.next();
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
    this.raw = code;
    this.code = null;    
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




function ListTokenizer (list) {
    //alert("list tokenizer "+list);
    this.list = list;
    this.current = 0;
 }
 
ListTokenizer.prototype.peek = function () {
    if (this.current >= this.list.length) {
        return new Token('eof','');
    } else {
        var peek=this.list[this.current];
        //alert("peek is "+peek);
        return peek;
    }
}

 
ListTokenizer.prototype.next = function () {
    if (this.current >= this.list.length) {
        return new Token('eof','');
    } else {
        var next = this.list[this.current];
        //alert("next is "+next);
        this.current++;
        return next;
        
    }
}



function Tokenizer () {

    this.text = null;
    this.cache = new Array();
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
Tokenizer.prototype.comment = /^\s*;.*(\r?\n|$)/;

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
    while ((result = this.comment.exec(this.text)) != null) {
        this.text = this.text.substring(result[0].length)
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
