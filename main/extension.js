const vscode = require('vscode');

function activate(context) {

    const completion1 = vscode.languages.registerCompletionItemProvider(
        'gmt',
        {
          provideCompletionItems(document, position) {
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            
            if (linePrefix.match('^S[0-9]+(?==)')) {
                return [new vscode.CompletionItem('Segment', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('ShiftSeg', vscode.CompletionItemKind.Function),
                ];
            }
            else if (linePrefix.match('^s[0-9]+(?==)')) {
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
            else if (linePrefix.match('^c[0-9]+(?==)')) {
                return [new vscode.CompletionItem('Circle', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('Compass', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('Circle3', vscode.CompletionItemKind.Function),
                ];
            }
            else if (linePrefix.match('^(([A-RT-Z][0-9]*)|[A-Z])(?==)')) {
                return [new vscode.CompletionItem('Intersect', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('Linepoint', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('Midpoint', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('EdgePoint', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('CenterPoint', vscode.CompletionItemKind.Function),
                        new vscode.CompletionItem('PolarPoint', vscode.CompletionItemKind.Function),
                ];
            }
          }
        },
        '='
    );

    const completion2 = vscode.languages.registerCompletionItemProvider(
        'gmt',
        {
          provideCompletionItems(document, position) {

            function varlist(arg){
                var varPoint = [];
                var varLine = [];
                var varCircle = [];
                for (var i=0; i<document.lineCount; i++)
                { 
                    const variablePrefix = document.lineAt(i).text;
                    var varConsts = variablePrefix.match('^.*(?==)');
                    
                    if (variablePrefix.match('=(Intersect|Linepoint|Midpoint|EdgePoint|CenterPoint|PolarPoint)?\\[')){
                        varPoint.splice(0,0,varConsts[0]);
                    }
                    else if (variablePrefix.match('=(Line|Ray|Segment|ShiftSeg|Parallel|Perp|ABisect|PBisect|FixAngle|CopyAnfle|Tangent|PolarLine)\\[')){
                        varLine.splice(0,0,varConsts[0]);
                    }
                    else if (variablePrefix.match('=(Circle3|Compass|Circle)\\[')){
                        varCircle.splice(0,0,varConsts[0]);
                    }
                }
                var varConstsList = Array();
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
                return varConstsList;
            }

            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            
            if (linePrefix.match('((Circle3|Compass|Circle|Line|Ray|Segment|ShiftSeg|Parallel|Perp|ABisect|PBisect|FixAngle|CopyAngle|Tangent|PolarLine|Midpoint)\\[$)|((Circle3|(?<==)Line|Ray|Segment|Midpoint|ABisect|PBisect|ShiftSeg|Compass|Circle|CopyAngle)\\[.*,$)|((FixAngle\\[)[^,]*,$)|(Intersect\\[.*,.*,.*,$)')) {
                return varlist(1);
            }
            else if (linePrefix.match('((Linepoint|EdgePoint|PolarPoint)\\[$)|((Parallel|Perp)\\[.*,$)')) {
                return varlist(2);
            }
            else if (linePrefix.match('(CenterPoint\\[$)|((PolarLine|PolarPoint)\\[.*,$)|((Tangent\\[)[^,]*,$)')) {
                return varlist(3);
            }
            else if (linePrefix.match('(Intersect\\[$)|((Intersect\\[)[^,]*,$)')) {
                var varlistsum=varlist(2).concat(varlist(3));
                return varlistsum;
            }
            else if (linePrefix.match('(((EdgePoint|Tangent)\\[).*,$)|((Intersect\\[)[^,]*,[^,]*,$)')) {
                return [new vscode.CompletionItem('0', vscode.CompletionItemKind.Constant),
                        new vscode.CompletionItem('1', vscode.CompletionItemKind.Constant),
                ];
            }
          }
        },
        '[',','
    );
      
      context.subscriptions.push(completion1);
      context.subscriptions.push(completion2);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}