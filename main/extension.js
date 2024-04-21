const vscode = require('vscode');

function activate(context) {

    const completion = vscode.languages.registerCompletionItemProvider(
        'gmt',
        {
          provideCompletionItems(document, position) {

            function varlist(arg){
                var varFreePt = [];
                var varPoint = [];
                var varLine = [];
                var varCircle = [];
                var varSeg = [];

                for (var i=0; i<document.lineCount-1; i++)
                { 
                    const variablePrefix = document.lineAt(i).text;
                    var varConsts = variablePrefix.match('^.*(?==)');
                    
                    if (variablePrefix.match('=(Linepoint)?\\[')){
                        varFreePt.splice(0,0,varConsts[0]);
                    }
                    else if (variablePrefix.match('=(Linepoint|Midpoint|EdgePoint|CenterPoint|PolarPoint)\\[')){
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
                    var varCurrentline = currentline.match(new RegExp('(?<==|,)[^,]+(?=\\.)','g'));
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
                    for (var i=0;i<varFreePt.length;i++){
                        varConstsList.splice(0,0,new vscode.CompletionItem(varFreePt[i], vscode.CompletionItemKind.Variable));
                    }
                }
                if (arg==1) {
                    for (var i=0;i<varPoint.length;i++){
                        varConstsList.splice(0,0,new vscode.CompletionItem(varPoint[i], vscode.CompletionItemKind.Variable));
                    }
                }
                else if (arg==2) {
                    for (var i=0;i<varLine.length;i++){
                        varConstsList.splice(0,0,new vscode.CompletionItem(varLine[i], vscode.CompletionItemKind.Variable));
                    }
                }
                else if (arg==3) {
                    for (var i=0;i<varCircle.length;i++){
                        varConstsList.splice(0,0,new vscode.CompletionItem(varCircle[i], vscode.CompletionItemKind.Variable));
                    }
                }
                else if (arg==4) {
                    for (var i=0;i<varSeg.length;i++){
                        varConstsList.splice(0,0,new vscode.CompletionItem(varSeg[i], vscode.CompletionItemKind.Variable));
                    }
                }
                return varConstsList;
            }

            const linePrefix = document.lineAt(position).text.substring(0, position.character);

                        
            if (linePrefix.match('^S[0-9]+=$')) {
                return [new vscode.CompletionItem('Segment', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('ShiftSeg', vscode.CompletionItemKind.Function),
                ];
            }
            else if (linePrefix.match('^s[0-9]+=$')) {
                return [new vscode.CompletionItem('Line', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('Ray', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('Parallel', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('Perp', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('ABisect', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('PBisect', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('FixAngle', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('CopyAngle', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('Tangent', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('PolarLine', vscode.CompletionItemKind.Function),
                ];
            }
            else if (linePrefix.match('^c[0-9]+=$')) {
                return [new vscode.CompletionItem('Circle', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('Compass', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('Circle3', vscode.CompletionItemKind.Function),
                ];
            }
            else if (linePrefix.match('^(([A-RT-Z][0-9]*)|[A-Z])=$')) {
                return [new vscode.CompletionItem('Intersect', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('Linepoint', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('Midpoint', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('EdgePoint', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('CenterPoint', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('PolarPoint', vscode.CompletionItemKind.Function),
                ];
            }
            
            if (linePrefix.match('((Circle3|Compass|Circle|Line|Ray|Segment|ShiftSeg|Parallel|Perp|ABisect|PBisect|FixAngle|CopyAngle|Tangent|PolarLine|Midpoint)\\[$)|((Circle3|(?<==)Line|Ray|Segment|Midpoint|ABisect|PBisect|ShiftSeg|Compass|Circle|CopyAngle)\\[[^,]*,$)|((Circle3|ABisect|ShiftSeg|Compass|CopyAngle)\\[[^,]*,[^,]*,$)|(CopyAngle\\[[^,]*,[^,]*,[^,]*,$)|(CopyAngle\\[[^,]*,[^,]*,[^,]*,[^,]*,$)|((FixAngle\\[)[^,]*,$)|(Intersect\\[[^,]*,[^,]*,[^,]*,$)')) {
                var varlistsumpt=varlist(1).concat(varlist(0));
                return varlistsumpt;
            }
            else if (linePrefix.match('(PolarPoint\\[$)|((Parallel|Perp)\\[[^,]*,$)')) {
                var varlistsumls=varlist(2).concat(varlist(4));
                return varlistsumls;
            }
            else if (linePrefix.match('Linepoint\\[$')) {
                var varlistsumlcs=varlist(2).concat(varlist(3)).concat(varlist(4));
                return varlistsumlcs;
            }
            else if (linePrefix.match('(CenterPoint\\[$)|((PolarLine|PolarPoint)\\[[^,]*,$)|((Tangent\\[)[^,]*,$)')) {
                return varlist(3);
            }
            else if (linePrefix.match('(Intersect\\[$)|((Intersect\\[)[^,]*,$)')) {
                var varlistsumlc=varlist(2).concat(varlist(3));
                return varlistsumlc;
            }
            else if (linePrefix.match('EdgePoint\\[$')) {
                return varlist(2);
            }
            else if (linePrefix.match('(((EdgePoint|Tangent)\\[)[^,]*,$)|((Intersect\\[)[^,]*,[^,]*,$)')) {
                return [new vscode.CompletionItem('0', vscode.CompletionItemKind.Constant),
                        new vscode.CompletionItem('1', vscode.CompletionItemKind.Constant),
                ];
            }

            var varlistsum = varlist(0).concat(varlist(1)).concat(varlist(2)).concat(varlist(3)).concat(varlist(4));
            if (linePrefix.match('(((initial|explore|hidden|named)(=|(=.*,)))|(result(=|(.*,)|([^:]*:))))$')) {
                return varlistsum;
            }
            else if (linePrefix.match('movepoints(=|(=.*,))$')) {
                return varlist(0);
            }
            if (linePrefix.match('^(i|e|r|m|h|n)[^=]*$')) {
                return [new vscode.CompletionItem('initial', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('result', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('explore', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('rules', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('movepoints', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('hidden', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('named', vscode.CompletionItemKind.Property),
                ];
            }
          }
        },
        '[',',','=','',':'
    );
      
    context.subscriptions.push(completion);

}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}