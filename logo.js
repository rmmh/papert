function eval_logo(code, turtle) {

    code = logo_to_js_list(code,0).join(";\n");

    logo = eval(code);
    
    logo(turtle);
    
}

function logo_to_js_list(code, checkend) {
    var js = new Array();
   
    var p = parse(code); 
    
    return  js;
}

function Operator(id,type,binding,grab) {
    this.id = id;
    this.type=type;
    this.binding=binding;
    this.grab=grab;
}

function parse(text) {
    
    var tk = new Tokenizer(text);

    var norm = new Array();
        norm['pu'] = 'penup';
        norm['pd'] = 'pendown';
        norm['fw'] = 'forward';
        norm['bw'] = 'backward';
        norm['cs'] = 'clear';
        norm['rt'] = 'right';
        norm['lt'] = 'left';

    var ops = new Array();
        ops['forward'] = new Operator('forward','cmd',0,1);
        ops['backward'] = new Operator('backward','cmd',0,1);
        ops['right'] = new Operator('right','cmd',0,1);
        ops['left'] = new Operator('left','cmd',0,1);

        ops['penup'] = new Operator('penup','cmd',0,0);
        ops['pendown'] = new Operator('pendown','cmd',0,0);
        ops['clear'] = new Operator('clear','cmd',0,0);

    var ops_stack = new Array():
    var items_stack = new Array();


    do {
        token = tk.next()
        if (token == null)  break;
        if (token[0] == 'error') {
            alert("Error: unexpected text: "+token[1]);
            return null;
        } else if (token[0] == 'id') {
            if (norm[token[1]] != null) {
                token[1] = norm[token[1]]
            }
        }
        
        // unwind stack

        if(token[0] == 'id') {
            var op = ops[token[1]];
            if (op != null) {
                ops_stack.push(op);
            } else {
                return alert("Unexpected command: "+token[1]);
            }
        } else if (token[0] == 'eof') {
            break;
        } else { // it is an item
            items_stack.push(token)
        }
    } while(true);
}

function Tokenizer(text) {

    this.text = text;

    this.id_rx = /^\s*([a-zA-Z]\w*)\s*/i;
    this.var_rx = /^\s*(:[a-zA-Z]\w*)\s*/i;
    this.num_rx = /^\s*(\d+(?:\.\d+)?)\s*/i;
    this.str_rx = /^\s*"((?:(?!\\)[^"]|\\")*)"\s*/i;

    this.empty = /^\s*$/;
    this.next = function () {

        if (this.empty.exec(this.text)) {
            this.text = null;
            return ['eof',''];

        } else if ((result = this.id_rx.exec(this.text)) != null) {
            this.text = this.text.substring(result[0].length)
            return ['id',result[1]];

        } else if ((result = this.var_rx.exec(this.text)) != null) {
            this.text = this.text.substring(result[0].length)
            return ['var',result[1]];

        } else if ((result = this.num_rx.exec(this.text)) != null) {
            this.text = this.text.substring(result[0].length)
            return ['num',parseFloat(result[1])];

        } else if ((result = this.str_rx.exec(this.text)) != null) {
            this.text = this.text.substring(result[0].length)
            return ['str',result[1]];

       /* } else if ((result = this.regex.exec(this.text)) != null) {
            this.text = this.text.substring(result[0].length)
            return ['id',result[1]];
       */
        } else {
            return ['error', this.text];
        }
    }   
}


            
