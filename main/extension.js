const vscode = require('vscode');

function activate(context) {

    const completion = vscode.languages.registerCompletionItemProvider(
        'gmt',
        {
          provideCompletionItems(document, position) {

            function completionList(objects,kind){
                var comp = [];
                for (var i=0;i<objects.length;i++){
                    comp.splice(0,0,new vscode.CompletionItem(objects[i], kind));
                }
                return comp;
            }

            function varlist(arg){
                var varFreePt = [];
                var varPoint = [];
                var varLine = [];
                var varCircle = [];
                var varSeg = [];

                for (var i=0; i<position.line; i++)
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
            if (linePrefix.match('(((initial|explore|hidden|named)(=|(=.*,)))|(result(=|(.*,)|([^:]*:))))[A-Za-z]?$')) {
                return varlistsum;
            }
            else if (linePrefix.match('movepoints(=|(=.*,))$')) {
                return varlist(0);
            }
            if (linePrefix.match('^[iermhnIERMHN][^=]*$')) {
                return completionList(LevelSettings,vscode.CompletionItemKind.Property);
            }
            if (linePrefix.match('=[A-Za-z][^=:]*$')) {
                const funcAll = funcSeg.concat(funcPoint).concat(funcLine).concat(funcCircle);
                return completionList(funcAll,vscode.CompletionItemKind.Function);
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