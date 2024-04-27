const vscode = require('vscode');

function activate(context) {
      
    const outline = vscode.languages.registerDocumentSymbolProvider(
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

                    if (line.text.match(new RegExp('^.+(?==(Linepoint)?\\[)'))) {

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

                    else if (line.text.match(new RegExp('^.+(?==(Intersect|Midpoint|EdgePoint|CenterPoint|PolarPoint)\\[)'))) {

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

                    else if (line.text.match(new RegExp('^.+(?==(Line|Ray|Parallel|Perp|ABisect|PBisect|FixAngle|CopyAnfle|Tangent|PolarLine)\\[)'))) {

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

                    else if (line.text.match(new RegExp('^.+(?==(Circle3|Compass|Circle)\\[)'))) {

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

                    else if (line.text.match(new RegExp('^.+(?==(Segment|ShiftSeg)\\[)'))) {

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

                    else if (line.text.match(new RegExp('^(initial|named|movepoints|hidden|result|explore|rules)=.*',))) {

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

    const refDoc = [

        ['Point',
         '[XPos(Num), YPos(Num)]: Free_point',
         'Construct a free point in coordinate system.',
        ['(Point)\nThe X-axis coordinate.\nTowards the right side of the screen',
         '(Point)\nThe Y-axis coordinate.\nTowards the bottom of the screen.']],

        ['Intersect',
         'Intersect[Object1(Ln/Ccl), Object2(Ln/Ccl), Param(0/1), <Exception(Pt)>]: Point',
         'Construct an intersection of two objects.',
        ['(Line/Segment/Circle)\nThe first object.',
         '(Line/Segment/Circle)\nThe second object.',
         '(0/1)\nOne of the intersections.\nWhen Ln,Ln: 0\nWhen Ln,Ccl: According to the points\' order of the line\nWhen Ccl,Ccl: According to the centers\' order defined in this func',
         '<Optional>(Point)\nExclude the given position.\nGenerally supply a defined intersection to return the other one.']],
        
        ['Line',
         'Line[Point1(Pt), Point2(Pt)]: Line',
         'Construct a line through two points.',
        ['(Point)\nThe first point.',
         '(Point)\nThe second point.']],

        ['Circle',
         'Circle[Center(Pt), Radius(Pt)]: Circle',
         'Construct a circle by its center and a point on it.',
        ['(Point)\nThe center point.',
         '(Point)\nThe point on this circle.']],

        ['Ray',
         'Ray[Start_point(Pt), Point_on_ray(Pt)]: Ray',
         'Construct a ray from a point and through another point.',
        ['(Point)\nThe start point.',
         '(Point)\nThe end point.']],

        ['Segment',
         'Segment[Endpoint1(Pt), Endpoint2(Pt)]: Segment',
         'Construct a segment between two points.',
        ['(Point)\nThe first endpoint.',
         '(Point)\nThe second endpoint.']],

        ['Linepoint',
         'Linepoint[Object(Ln/Ccl), Position(Num)]: Free_point',
         'Construct a free point on the object.',
        ['(Line/Segment/Circle)\nThe given object.',
         '(Number)\nThe position of the point.\nWhen Ln: the distance of two defined points is \'1\',as order.\nWhen Ccl: starting from the difined point, and the length of one circle is \'pi\', clockwise.']],

        ['EdgePoint',
         'EdgePoint[Line(Ln), Param(0/1)]: (Point)',
         'Construct an infinite point of a line.',
        ['(Line)\nThe given line.',
         '(0/1)\nOne of the edges.\nAccording to the defined order of the Line.']],

        ['CenterPoint',
         'CenterPoint[Object(Ccl)]: Point',
         'Construct the center point of a circle.',
        ['(Circle)\nThe given circle.']],

        ['Midpoint',
         'Midpoint[Point1(Pt), Point2(Pt)]: Point',
         'Construct the middle point between two points.',
        ['(Point)\nThe first point.',
         '(Point)\nThe second point.']],

        ['Perp',
         'Perp[Point(Pt), Line(Ln)]: Line',
         'Construct the perpendicular line through a point.',
        ['(Point)\nThe point on the perpendicular line.',
         '(Line/Segment)\nThe line which is perpendicular to it.']],

        ['Parallel',
         'Parallel[Point(Pt), Line(Ln)]: Line',
         'Construct the parallel line through a point.',
        ['(Point)\nThe point on the parallel line.',
         '(Line/Segment)\nThe line which is parallel to it.']],

        ['ABisect',
         'ABisect[Point1(Pt), Vertex(Pt), Point3(Pt)]: Line',
         'Construct the angle bisect line by its vertex and two points on its side.',
        ['(Point)\nThe first point on one side.',
         '(Point)\nThe second point as the vertex.',
         '(Point)\nThe third point on the other side.']],

        ['PBisect',
         'PBisect[Point1(Pt), Point2(Pt)]: Line',
         'Construct the perpendicular bisect line between two points.',
        ['(Point)\nThe first point.',
         '(Point)\nThe second point.']],

        ['ShiftSeg',
         'ShiftSeg[Endpoint1(Pt), Endpoint2(Pt), Target_point(Pt)]: Segment',
         'Copy an equal parallel segment(or a length) to a new point.',
        ['(Point)\nThe first endpoint of the initial segment.',
         '(Point)\nThe second endpoint of the initial segment.',
         '(Point)\nThe third point determined the new segment.']],

        ['Compass',
         'Compass[Center(Pt), Radius(Pt), Target_center(Pt)]: Circle',
         'Copy an equal circle to a new center.',
        ['(Point)\nThe center point of the initial circle.',
         '(Point)\nThe point on the initial circle.',
         '(Point)\nThe point determined the center of the new circle.']],

        ['Circle3',
         'Circle3[Point1(Pt), Point2(Pt), Point3(Pt)]: Circle',
         'Construct the circumcircle of 3 points.',
        ['(Point)\nThe first point on the circle.',
         '(Point)\nThe second point on the circle.',
         '(Point)\nThe third point on the circle.']],

        ['FixAngle',
         'FixAngle[Vertex(Pt), Direction(Pt), Degree(Num)]: Ray',
         'Construct a fixed angle ray on the ray by 2 points.',
        ['(Point)\nThe vertex of the fixed angle.',
         '(Point)\nThe point as the direction of the first side of the fixed angle.',
         '(Point)\nThe degree of the fixed angle turning anticlockwise.']],

        ['CopyAngle',
         'CopyAngle[Point1(Pt), Vertex(Pt), Point3(Pt), Target_point(Pt), Target_vertex(Pt)]: Ray',
         'Copy an equal angle ray to 2 new points.',
        ['(Point)\nThe point on one side of the initial angle.',
         '(Point)\nThe vertex of the initial angle.',
         '(Point)\nThe point on the other side of the initial angle.',
         '(Point)\nThe point determined a side of the new angle.',
         '(Point)\nThe vertex of the new angle.']],

        ['Tangent',
         'Tangent[Point(Pt), Circle(Ccl), Param(0/1)]: Line',
         'Construct the tangent line of a circle from a point.',
        ['(Point)\nThe point through which the tangent line passes.',
         '(Circle)\nThe circle tangent to the line.',
         '(0/1)\nOne of the tangent lines.']],

        ['PolarLine',
         'PolarLine[Point(Pt), Circle(Ccl)]: Line',
         'Construct the polar line of a point about a circle.',
        ['(Point)\nThe given line.',
         '(Circle)\nThe given circle.']],

        ['PolarPoint',
         'PolarPoint[Line(Ln), Circle(Ccl)]: Point',
         'Construct the polar point of a line about a circle.',
        ['(Line)\nThe given line.',
         '(Circle)\nThe given circle.']],

        ['initial',
         'initial=...Obj',
         '(Required)\nInitial conditions, displayed as black solid lines in the beginning.'],

        ['named',
         'named=...Obj.Name',
         '(Optional)\nInitial named objects.\n\'Name\' can only accept one letter, or it will sort in A-Z order.\nNote: The objects here don\'t need to be redefined in \'initial\'.'],

        ['movepoints',
         'movepoints=...FreePts',
         '(Optional)\nInitial movable (free) points.\nAlways hidden except in dragging mode.\nNote: Free points in \'initial\' don\'t need to be redefined here.'],

        ['hidden',
         'hidden=...Obj',
         '(Optional)\nHidden objects.\nAlways hidden except in dragging mode.\nNote: It\'s better to define free points in \'movepoints\'.'],

        ['result',
         'result=...Obj<:...Obj_displayed>',
         '(Required)\nObjects sought and displayed(optional) as result, separated by a colon.\nOften more than one result, wrap and write others.\nNotes: A line is more suitable as a result than a segment, even if the display is segment; if the result is just a part of the configeration, it\'s better to display the whole.'],

        ['explore',
         'explore=...Obj',
         '(Required)\nResults displayed in exploring mode.'],

        ['rules',
         'rules=...Obj?Obj',
         '(Optional)\nForce rules in this level, displayed as red dashed lines while moving. Operators:\n\'#\' - Objects must intersect.\n\'/\' - Objects can\'t intersect.\n\'<\',\'>\' - Numerical comparison.\n\'.\' - Connector. Example: \'A.B.C\': The size of angle ABC; \'A.B\': The length of segment AB.\n\'|\' - OR-condition.\nNotes: It shouldn\'t be written when the solutions are naturally non-exist. It should be written when the solutions 1)can be better constructed in special cases; 2)can\'t be constructed in the same method in all cases; 3)are lost(but not 0) in some cases.']
        
    ];

    const signhelp = vscode.languages.registerSignatureHelpProvider(
        'gmt', 
        {
          provideSignatureHelp(document,position){
            return new Promise(resolve =>
            {
                function atParam(str,num){
                    let params = str.substring(str.indexOf('[')+1, str.indexOf(']'));
                    let paramsArray = params.split(',');
                    var paramLength = [];
                    let posStart = str.indexOf('[')+1, posEnd = str.indexOf('[');

                    for (let i=0; i<paramsArray.length; i++){
                        posEnd += paramsArray[i].length+1;
                        paramLength.push([posStart,posEnd]);
                        posStart += paramsArray[i].length+1;
                    }

                    return paramLength[num];
                }

                function atLvlSet(str){
                    let EquSym = str.indexOf('=');
                    let paramLength = [EquSym+1,str.length];
                    return paramLength;
                }

                const linePrefix = document.lineAt(position).text.substring(0, position.character);
                var symbolResult = new vscode.SignatureHelp();

                if (linePrefix.match('=.*\\[[^\\]]*')){

                    let getFunc = linePrefix.match('(?<==).*(?=\\[)')[0];
                    if (!getFunc){
                        var docNum = 0;
                    }
                    else {
                        for (let i=0; i<refDoc.length; i++){
                            if (refDoc[i][0] == getFunc){
                                var docNum = i;
                            }
                        }
                    }
                          
                    if (linePrefix.match(',')){
                        var commas = linePrefix.match(RegExp(',','g')).length;
                    }
                    else {var commas = 0;}
                    
                    var signatures = new vscode.SignatureInformation();
                    signatures.label = refDoc[docNum][1];
                    signatures.documentation = refDoc[docNum][2];

                    const paramLocation = atParam(refDoc[docNum][1],commas);
                    if (paramLocation){
                        signatures.parameters = [new vscode.ParameterInformation(paramLocation,refDoc[docNum][3][commas])];
                    }

                    symbolResult.signatures = [signatures];
                    symbolResult.activeParameter = 0;
                    symbolResult.activeSignature = 0;
                }
                else if (linePrefix.match('^(initial|named|movepoints|hidden|result|explore|rules)=.*')){

                    let getFunc = linePrefix.match('^.*(?==)')[0];

                    for (let i=0; i<refDoc.length; i++){
                        if (refDoc[i][0] == getFunc){
                            var docNum = i;
                        }
                    }
                    
                    var signatures = new vscode.SignatureInformation();
                    signatures.label = refDoc[docNum][1];
                    signatures.documentation = refDoc[docNum][2];

                    const paramLocation = atLvlSet(refDoc[docNum][1]);
                    if (paramLocation){
                        signatures.parameters = [new vscode.ParameterInformation(paramLocation)];
                    }

                    symbolResult.signatures = [signatures];
                    symbolResult.activeParameter = 0;
                    symbolResult.activeSignature = 0;
                }

                if (symbolResult){
                    resolve(symbolResult);
                }
            });
          }
        },
        '[',',','='
    );

    const completion = vscode.languages.registerCompletionItemProvider(
        'gmt',
        {
          provideCompletionItems(document, position) {

            function completionList(objects,kind){
                var comp = [];
                for (let i=0; i<objects.length; i++){
                    var compItem = new vscode.CompletionItem();
                    compItem.label = {label: objects[i][0], description: objects[i][2]};
                    compItem.detail = objects[i][1];
                    compItem.documentation = objects[i][2];
                    compItem.kind = kind;
                    comp.splice(0,0,compItem);
                }
                return comp;
            }

            function varList(arg){
                var varFreePt = [], varPoint = [], varLine = [], varCircle = [], varSeg = [];
                var varFreePtIndex = [], varPointIndex = [], varLineIndex = [], varCircleIndex = [], varSegIndex = [];

                for (let i=0; i<position.line; i++)
                { 
                    const variablePrefix = document.lineAt(i).text;
                    var varConsts = variablePrefix.match('^.*(?==)');
                    
                    if (variablePrefix.match('=(Linepoint)?\\[')){
                        varFreePt.splice(0,0,[varConsts[0],variablePrefix.split('=')[1],'A free point.']);
                        varFreePtIndex.splice(0,0,varConsts[0]);
                    }
                    else if (variablePrefix.match('=(Intersect|Midpoint|EdgePoint|CenterPoint|PolarPoint)\\[')){
                        varPoint.splice(0,0,[varConsts[0],variablePrefix.split('=')[1],'A point.']);
                        varPointIndex.splice(0,0,varConsts[0]);
                    }
                    else if (variablePrefix.match('=(Line|Ray|Parallel|Perp|ABisect|PBisect|FixAngle|CopyAnfle|Tangent|PolarLine)\\[')){
                        varLine.splice(0,0,[varConsts[0],variablePrefix.split('=')[1],'A line.']);
                        varLineIndex.splice(0,0,varConsts[0]);
                    }
                    else if (variablePrefix.match('=(Circle3|Compass|Circle)\\[')){
                        varCircle.splice(0,0,[varConsts[0],variablePrefix.split('=')[1],'A circle.']);
                        varCircleIndex.splice(0,0,varConsts[0]);
                    }
                    else if (variablePrefix.match('=(Segment|ShiftSeg)\\[')){
                        varSeg.splice(0,0,[varConsts[0],variablePrefix.split('=')[1],'A segment.']);
                        varSegIndex.splice(0,0,varConsts[0]);
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
                        if (varPointIndex.indexOf(varCurrentline[i])>-1){
                            varPoint.splice(varPoint.indexOf(varCurrentline[i]),1);
                            varPointIndex.splice(varPoint.indexOf(varCurrentline[i]),1);
                        }
                        else if (varFreePtIndex.indexOf(varCurrentline[i])>-1){
                            varFreePt.splice(varFreePt.indexOf(varCurrentline[i]),1);
                            varFreePtIndex.splice(varPoint.indexOf(varCurrentline[i]),1);
                        }
                        else if (varLineIndex.indexOf(varCurrentline[i])>-1){
                            varLine.splice(varLine.indexOf(varCurrentline[i]),1);
                            varLineIndex.splice(varPoint.indexOf(varCurrentline[i]),1);
                        }
                        else if (varCircleIndex.indexOf(varCurrentline[i])>-1){
                            varCircle.splice(varCircle.indexOf(varCurrentline[i]),1);
                            varCircleIndex.splice(varPoint.indexOf(varCurrentline[i]),1);
                        }
                        else if (varSegIndex.indexOf(varCurrentline[i])>-1){
                            varSeg.splice(varSeg.indexOf(varCurrentline[i]),1);
                            varSegIndex.splice(varPoint.indexOf(varCurrentline[i]),1);
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

            function getRef(arr){
                let refs = [];
                for (let i=0; i<arr.length; i++){
                    for (let j=0; j<refDoc.length; j++){
                        if (refDoc[j][0] == arr[i]){
                            refs.push([arr[i],refDoc[j][1],refDoc[j][2]]);
                        }
                    }
                }
                return refs;
            }

            const linePrefix = document.lineAt(position).text.substring(0, position.character);
            const funcSeg = ['Segment','ShiftSeg'];
            const funcLine = ['Line','Ray','Parallel','Perp','ABisect','PBisect','FixAngle','CopyAngle','Tangent','PolarLine'];
            const funcCircle = ['Circle','Compass','Circle3'];
            const funcPoint = ['Intersect','Linepoint','Midpoint','EdgePoint','CenterPoint','PolarPoint'];
            const LevelSettings = ['initial','result','explore','rules','movepoints','hidden','named'];
                        
            if (linePrefix.match('^S[0-9]+=$')) {
                return completionList(getRef(funcSeg),vscode.CompletionItemKind.Function);
            }
            else if (linePrefix.match('^s[0-9]+=$')) {
                return completionList(getRef(funcLine),vscode.CompletionItemKind.Function);
            }
            else if (linePrefix.match('^c[0-9]+=$')) {
                return completionList(getRef(funcCircle),vscode.CompletionItemKind.Function);
            }
            else if (linePrefix.match('^(([A-RT-Z][0-9]*)|[A-Z])=$')) {
                return completionList(getRef(funcPoint),vscode.CompletionItemKind.Function);
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
                return completionList(getRef(LevelSettings),vscode.CompletionItemKind.Property);
            }
            if (linePrefix.match('=[A-Za-z][^=:\\[]*$')) {
                const funcAll = funcSeg.concat(funcPoint).concat(funcLine).concat(funcCircle);
                return completionList(getRef(funcAll),vscode.CompletionItemKind.Function);
            }
          }
        },
        '[',',','=','',':'
    );

    context.subscriptions.push(completion);
    context.subscriptions.push(outline);
    context.subscriptions.push(signhelp);

}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}