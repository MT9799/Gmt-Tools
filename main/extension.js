const vscode = require('vscode');

function activate(context) {

    const completion = vscode.languages.registerCompletionItemProvider(
        'gmt',
        {
          provideCompletionItems(document, position) {

            function completionList(objects,kind){
                var comp = [];
                for (let i=0; i<objects.length; i++){
                    comp.splice(0,0,new vscode.CompletionItem(objects[i], kind));
                }
                return comp;
            }

            function varList(arg){
                var varFreePt = [];
                var varPoint = [];
                var varLine = [];
                var varCircle = [];
                var varSeg = [];

                for (let i=0; i<position.line; i++)
                { 
                    const variablePrefix = document.lineAt(i).text;
                    var varConsts = variablePrefix.match('^.*(?==)');
                    
                    if (variablePrefix.match('=(Linepoint)?\\[')){
                        varFreePt.splice(0,0,varConsts[0]);
                    }
                    else if (variablePrefix.match('=(Intersect|Midpoint|EdgePoint|CenterPoint|PolarPoint)\\[')){
                        varPoint.splice(0,0,varConsts[0]);
                    }
                    else if (variablePrefix.match('=(Line|Ray|Parallel|Perp|ABisect|PBisect|FixAngle|CopyAnfle|Tangent|PolarLine)\\[')){
                        varLine.splice(0,0,varConsts[0]);
                    }
                    else if (variablePrefix.match('=(Circle3|Compass|Circle)\\[')){
                        varCircle.splice(0,0,varConsts[0]);
                    }
                    else if (variablePrefix.match('=(Segment|ShiftSeg)\\[')){
                        varSeg.splice(0,0,varConsts[0]);
                    }
                }

                const currentline = document.lineAt(position).text;
                if (currentline.match('result.*:')){
                    var varCurrentline = currentline.match(new RegExp('(?<=(:.*,)|:)[^,]+(?=,)','g'));
                }
                else if (currentline.match('initial|exlpore|hidden|movepoints|(result[^:]*)')){
                    var varCurrentline = currentline.match(new RegExp('(?<==|,)[^,]+(?=,)','g'));
                }
                else if (currentline.match('named')){
                    var varCurrentline = currentline.match(new RegExp('((?<==|,)[^,]+(?=\\.))|((?<==|,)[^,]+(?=,))','g'));
                }
                else {
                    var varCurrentline = currentline.match(new RegExp('(?<=\\[|,)[^,]+(?=,)','g'));
                }
                if (!varCurrentline == []) {
                    if (currentline.match('ShiftSeg')&&varCurrentline.length==2){
                        varCurrentline.splice(1,1);
                    }
                    else if (currentline.match('CopyAngle')&&varCurrentline.length==4&&varCurrentline[0]==varCurrentline[3]){
                        varCurrentline.splice(2,1);
                    }
                    else if (currentline.match('CopyAngle')&&varCurrentline.length==4&&varCurrentline[2]==varCurrentline[3]){
                        varCurrentline.splice(0,1);
                    }
                    else if (currentline.match('CopyAngle')&&varCurrentline.length>=3){
                        varCurrentline.splice(0,3);
                    }
                    for (var i=0;i<varCurrentline.length;i++){
                        if (varPoint.indexOf(varCurrentline[i])>-1){
                            varPoint.splice(varPoint.indexOf(varCurrentline[i]),1);
                        }
                        else if (varFreePt.indexOf(varCurrentline[i])>-1){
                            varFreePt.splice(varFreePt.indexOf(varCurrentline[i]),1);
                        }
                        else if (varLine.indexOf(varCurrentline[i])>-1){
                            varLine.splice(varLine.indexOf(varCurrentline[i]),1);
                        }
                        else if (varCircle.indexOf(varCurrentline[i])>-1){
                            varCircle.splice(varCircle.indexOf(varCurrentline[i]),1);
                        }
                        else if (varSeg.indexOf(varCurrentline[i])>-1){
                            varSeg.splice(varSeg.indexOf(varCurrentline[i]),1);
                        }
                    }
                }

                var varConstsList = Array();
                if (arg==0) {
                    varConstsList=completionList(varFreePt,vscode.CompletionItemKind.Variable);
                }
                else if (arg==1) {
                    varConstsList=completionList(varPoint,vscode.CompletionItemKind.Variable);
                }
                else if (arg==2) {
                    varConstsList=completionList(varLine,vscode.CompletionItemKind.Variable);
                }
                else if (arg==3) {
                    varConstsList=completionList(varCircle,vscode.CompletionItemKind.Variable);
                }
                else if (arg==4) {
                    varConstsList=completionList(varSeg,vscode.CompletionItemKind.Variable);
                }
                return varConstsList;
            }

            const linePrefix = document.lineAt(position).text.substring(0, position.character);
            const funcSeg = ['Segment','ShiftSeg'];
            const funcLine = ['Line','Ray','Parallel','Perp','ABisect','PBisect','FixAngle','CopyAngle','Tangent','PolarLine'];
            const funcCircle = ['Circle','Compass','Circle3'];
            const funcPoint = ['Intersect','Linepoint','Midpoint','EdgePoint','CenterPoint','PolarPoint'];
            const LevelSettings = ['initial','result','explore','rules','movepoints','hidden','named'];
                        
            if (linePrefix.match('^S[0-9]+=$')) {
                return completionList(funcSeg,vscode.CompletionItemKind.Function);
            }
            else if (linePrefix.match('^s[0-9]+=$')) {
                return completionList(funcLine,vscode.CompletionItemKind.Function);
            }
            else if (linePrefix.match('^c[0-9]+=$')) {
                return completionList(funcCircle,vscode.CompletionItemKind.Function);
            }
            else if (linePrefix.match('^(([A-RT-Z][0-9]*)|[A-Z])=$')) {
                return completionList(funcPoint,vscode.CompletionItemKind.Function);
            }
            
            if (linePrefix.match('((Circle3|Compass|Circle|Line|Ray|Segment|ShiftSeg|Parallel|Perp|ABisect|PBisect|FixAngle|CopyAngle|Tangent|PolarLine|Midpoint)\\[$)|((Circle3|(?<==)Line|Ray|Segment|Midpoint|ABisect|PBisect|ShiftSeg|Compass|Circle|CopyAngle)\\[[^,]*,$)|((Circle3|ABisect|ShiftSeg|Compass|CopyAngle)\\[[^,]*,[^,]*,$)|(CopyAngle\\[[^,]*,[^,]*,[^,]*,$)|(CopyAngle\\[[^,]*,[^,]*,[^,]*,[^,]*,$)|((FixAngle\\[)[^,]*,$)|(Intersect\\[[^,]*,[^,]*,[^,]*,$)')) {
                var varlistsumpt=varList(1).concat(varList(0));
                return varlistsumpt;
            }
            else if (linePrefix.match('(PolarPoint\\[$)|((Parallel|Perp)\\[[^,]*,$)')) {
                var varlistsumls=varList(2).concat(varList(4));
                return varlistsumls;
            }
            else if (linePrefix.match('Linepoint\\[$')) {
                var varlistsumlcs=varList(2).concat(varList(3)).concat(varList(4));
                return varlistsumlcs;
            }
            else if (linePrefix.match('(CenterPoint\\[$)|((PolarLine|PolarPoint)\\[[^,]*,$)|((Tangent\\[)[^,]*,$)')) {
                return varList(3);
            }
            else if (linePrefix.match('(Intersect\\[$)|((Intersect\\[)[^,]*,$)')) {
                var varlistsumlc=varList(2).concat(varList(3));
                return varlistsumlc;
            }
            else if (linePrefix.match('EdgePoint\\[$')) {
                return varList(2);
            }
            else if (linePrefix.match('(((EdgePoint|Tangent)\\[)[^,]*,$)|((Intersect\\[)[^,]*,[^,]*,$)')) {
                return [new vscode.CompletionItem('0', vscode.CompletionItemKind.Constant),
                        new vscode.CompletionItem('1', vscode.CompletionItemKind.Constant),
                ];
            }

            var varlistsum = varList(0).concat(varList(1)).concat(varList(2)).concat(varList(3)).concat(varList(4));
            if (linePrefix.match('(((initial|explore|hidden|named)(=|(=.*,)))|(result(=|(.*,)|([^:]*:))))[A-Za-z]?$')) {
                return varlistsum;
            }
            else if (linePrefix.match('movepoints(=|(=.*,))$')) {
                return varList(0);
            }
            if (linePrefix.match('^[iermhnIERMHN][^=]*$')) {
                return completionList(LevelSettings,vscode.CompletionItemKind.Property);
            }
            if (linePrefix.match('=[A-Za-z][^=:\\[]*$')) {
                const funcAll = funcSeg.concat(funcPoint).concat(funcLine).concat(funcCircle);
                return completionList(funcAll,vscode.CompletionItemKind.Function);
            }
          }
        },
        '[',',','=','',':'
    );
      
    const symbol = vscode.languages.registerDocumentSymbolProvider(
        "gmt", 
        {
          provideDocumentSymbols(document){

            return new Promise(resolve => 
            {
                const symbolsArr = [];
                const nodes = [symbolsArr];
                let is_inside_varfreept = false;
                let is_inside_varpt = false;
                let is_inside_varline = false;
                let is_inside_varseg = false;
                let is_inside_varcircle = false;
                //let is_inside_lvlsetting = false;
                
                for (let i=0; i<document.lineCount; i++) {
                    const line = document.lineAt(i);
                    const tokens = line.text.split("=");

                    if (line.text.match(new RegExp('^.*(?==(Linepoint)?\\[)'))) {

                        const marker_symbol = new vscode.DocumentSymbol(
                            tokens[0],tokens[1],
                            vscode.SymbolKind.Variable,
                            line.range,line.range
                        );

                        if (!is_inside_varfreept) {
                            const varSymbolKind = new vscode.DocumentSymbol('Var_FreePoints','',vscode.SymbolKind.Function,line.range, line.range);
                            nodes[0].push(varSymbolKind);
                            nodes.push(varSymbolKind.children);
                            var varfreeptset = nodes.length;
                            is_inside_varfreept = true;
                        }

                        nodes[varfreeptset-1].push(marker_symbol);
                    }

                    else if (line.text.match(new RegExp('^.*(?==(Intersect|Midpoint|EdgePoint|CenterPoint|PolarPoint)\\[)'))) {

                        const marker_symbol = new vscode.DocumentSymbol(
                            tokens[0],tokens[1],
                            vscode.SymbolKind.Variable,
                            line.range,line.range
                        );

                        if (!is_inside_varpt) {
                            const varSymbolKind = new vscode.DocumentSymbol('Var_Points','',vscode.SymbolKind.Function,line.range, line.range);
                            nodes[0].push(varSymbolKind);
                            nodes.push(varSymbolKind.children);
                            var varptset = nodes.length;
                            is_inside_varpt = true;
                        }

                        nodes[varptset-1].push(marker_symbol);
                    }

                    else if (line.text.match(new RegExp('^.*(?==(Line|Ray|Parallel|Perp|ABisect|PBisect|FixAngle|CopyAnfle|Tangent|PolarLine)\\[)'))) {

                        const marker_symbol = new vscode.DocumentSymbol(
                            tokens[0],tokens[1],
                            vscode.SymbolKind.Variable,
                            line.range,line.range
                        );

                        if (!is_inside_varline) {
                            const varSymbolKind = new vscode.DocumentSymbol('Var_Lines','',vscode.SymbolKind.Function,line.range, line.range);
                            nodes[0].push(varSymbolKind);
                            nodes.push(varSymbolKind.children);
                            var varlineset = nodes.length;
                            is_inside_varline = true;
                        }

                        nodes[varlineset-1].push(marker_symbol);
                    }

                    else if (line.text.match(new RegExp('^.*(?==(Circle3|Compass|Circle)\\[)'))) {

                        const marker_symbol = new vscode.DocumentSymbol(
                            tokens[0],tokens[1],
                            vscode.SymbolKind.Variable,
                            line.range,line.range
                        );

                        if (!is_inside_varcircle) {
                            const varSymbolKind = new vscode.DocumentSymbol('Var_Circles','',vscode.SymbolKind.Function,line.range, line.range);
                            nodes[0].push(varSymbolKind);
                            nodes.push(varSymbolKind.children);
                            var varcircleset = nodes.length;
                            is_inside_varcircle = true;
                        }

                        nodes[varcircleset-1].push(marker_symbol);
                    }

                    else if (line.text.match(new RegExp('^.*(?==(Segment|ShiftSeg)\\[)'))) {

                        const marker_symbol = new vscode.DocumentSymbol(
                            tokens[0],tokens[1],
                            vscode.SymbolKind.Variable,
                            line.range,line.range
                        );

                        if (!is_inside_varseg) {
                            const varSymbolKind = new vscode.DocumentSymbol('Var_Segments','',vscode.SymbolKind.Function,line.range, line.range);
                            nodes[0].push(varSymbolKind);
                            nodes.push(varSymbolKind.children);
                            var varsegset = nodes.length;
                            is_inside_varseg = true;
                        }

                        nodes[varsegset-1].push(marker_symbol);
                    }

                    else if (line.text.match(new RegExp('(?<=(initial|named|movepoints|hidden|result|explore|rules)=.*)',))) {

                        const marker_symbol = new vscode.DocumentSymbol(
                            tokens[0],tokens[1],
                            vscode.SymbolKind.Field,
                            line.range,line.range
                        );

                        nodes[0].push(marker_symbol);
                    }

                    else if (line.text.startsWith("#")) {
                        const cmd_symbol = new vscode.DocumentSymbol(
                            tokens[0].match('(?<=#).*$'),
                            '',
                            vscode.SymbolKind.String,
                            line.range, line.range);

                        nodes[nodes.length-1].push(cmd_symbol);
                    }
                }

                resolve(symbolsArr);
            })
          }
        }
    );


    context.subscriptions.push(completion);
    context.subscriptions.push(symbol);
    //context.subscriptions.push(rename);

}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}