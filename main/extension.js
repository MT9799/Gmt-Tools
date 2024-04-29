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
         '[CoorX(Num), CoorY(Num)]: Point_free',
         'Construct a free point in coordinate system.',
        ['(Point)\n\nThe X-axis coordinate.\n\nTowards the right side of the screen.',
         '(Point)\n\nThe Y-axis coordinate.\n\nTowards the bottom of the screen.']],

        ['Intersect',
         'Intersect[Object1(Ln/Ccl), Object2(Ln/Ccl), Param(0/1), <Exception(Pt)>]: Point_fixed',
         'Construct an intersection of two objects.',
        ['(Line/Segment/Circle)\n\nThe first object.',
         '(Line/Segment/Circle)\n\nThe second object.',
         '(0/1)\n\nOne of the intersections.\n* When Ln,Ln: 0;\n* When Ln,Ccl: According to the defined direction of the line;\n* When Ccl,Ccl: According to the centers\' order defined in this func.',
         '<Optional>(Point)\n\nExclude the given position.\n\nGenerally supply a defined intersection to always return the other one.']],
        
        ['Line',
         'Line[Point1(Pt), Point2(Pt)]: Line_straight',
         'Construct a line through two points.',
        ['(Point)\n\nThe first point.',
         '(Point)\n\nThe second point.']],

        ['Circle',
         'Circle[Center(Pt), Radius(Pt)]: Circle',
         'Construct a circle by its center and a point on it.',
        ['(Point)\n\nThe center point.',
         '(Point)\n\nThe point on this circle.']],

        ['Ray',
         'Ray[Point_starting(Pt), Point_passing(Pt)]: Ray',
         'Construct a ray from a point and through another point.',
        ['(Point)\n\nThe start point.',
         '(Point)\n\nThe point passed through.']],

        ['Segment',
         'Segment[Endpoint1(Pt), Endpoint2(Pt)]: Segment',
         'Construct a segment between two points.',
        ['(Point)\n\nThe first endpoint.',
         '(Point)\n\nThe second endpoint.']],

        ['Linepoint',
         'Linepoint[Object(Ln/Ccl), Position(Num)]: Point_free',
         'Construct a free point on the object.',
        ['(Line/Segment/Circle)\n\nThe given object.',
         '(Number)\n\nThe position of the point.\n* When Ln/Seg: the distance of two defined points is \'1\',as order;\n* When Ccl: starting from the difined point, and the length of one circle is \'pi\', clockwise.']],

        ['EdgePoint',
         'EdgePoint[Line(Ln), Param(0/1)]: Point_imaginary',
         'Construct an infinite point of a line.',
        ['(Line)\n\nThe given line.',
         '(0/1)\n\nOne of the edges.\n\nAccording to the defined direction of the line.']],

        ['CenterPoint',
         'CenterPoint[Circle(Ccl)]: Point_fixed',
         'Construct the center point of a circle.',
        ['(Circle)\n\nThe given circle.']],

        ['Midpoint',
         'Midpoint[Point1(Pt), Point2(Pt)]: Point_fixed',
         'Construct the middle point between two points.',
        ['(Point)\n\nThe first point.',
         '(Point)\n\nThe second point.']],

        ['Perp',
         'Perp[Point(Pt), Line(Ln)]: Line_straight',
         'Construct the perpendicular line of a line through a point.',
        ['(Point)\n\nThe point on the perpendicular line.',
         '(Line/Segment)\n\nThe original line.']],

        ['Parallel',
         'Parallel[Point(Pt), Line(Ln)]: Line_straight',
         'Construct the parallel line of a line through a point.',
        ['(Point)\n\nThe point on the parallel line.',
         '(Line/Segment)\n\nThe original line.']],

        ['ABisect',
         'ABisect[Point_side1(Pt), Vertex(Pt), Point_side2(Pt)]: Line_straight',
         'Construct the bisect line of an angle by its vertex and two points on its side.',
        ['(Point)\n\nThe point on one side.',
         '(Point)\n\nThe point as the vertex.',
         '(Point)\n\nThe point on the other side.']],

        ['PBisect',
         'PBisect[Point1(Pt), Point2(Pt)]: Line_straight',
         'Construct the perpendicular bisect line between two points.',
        ['(Point)\n\nThe first point.',
         '(Point)\n\nThe second point.']],

        ['ShiftSeg',
         'ShiftSeg[Endpoint1(Pt), Endpoint2(Pt), Endpoint_new(Pt)]: Segment',
         'Copy an equal parallel segment(or a length) to a new point.',
        ['(Point)\n\nThe first endpoint of the initial segment.',
         '(Point)\n\nThe second endpoint of the initial segment.',
         '(Point)\n\nThe point determined the new segment.']],

        ['Compass',
         'Compass[Center(Pt), Radius(Pt), Center_new(Pt)]: Circle',
         'Copy an equal circle to a new center.',
        ['(Point)\n\nThe center point of the initial circle.',
         '(Point)\n\nThe point on the initial circle.',
         '(Point)\n\nThe point determined the center of the new circle.']],

        ['Circle3',
         'Circle3[Point1(Pt), Point2(Pt), Point3(Pt)]: Circle',
         'Construct a circumcircle by 3 points.',
        ['(Point)\n\nThe first point on the circle.',
         '(Point)\n\nThe second point on the circle.',
         '(Point)\n\nThe third point on the circle.']],

        ['FixAngle',
         'FixAngle[Vertex(Pt), Direction(Pt), Degree(Num)]: Ray',
         'Construct a fixed angle ray on a side by 2 points.',
        ['(Point)\n\nThe vertex of the fixed angle.',
         '(Point)\n\nThe point on the first side as the direction.',
         '(Point)\n\nThe degree of the fixed angle, turning anticlockwise.']],

        ['CopyAngle',
         'CopyAngle[Point_side1(Pt), Vertex(Pt), Point_side2(Pt), Point_side_new(Pt), Vertex_new(Pt)]: Ray',
         'Copy an equal angle ray to a new side by 2 points.',
        ['(Point)\n\nThe point on one side of the initial angle.',
         '(Point)\n\nThe vertex of the initial angle.',
         '(Point)\n\nThe point on the other side of the initial angle.',
         '(Point)\n\nThe point determined a side of the new angle.',
         '(Point)\n\nThe vertex of the new angle.']],

        ['Tangent',
         'Tangent[Point(Pt), Circle(Ccl), Param(0/1)]: Line_straight',
         'Construct the tangent line of a circle from a point.',
        ['(Point)\n\nThe point on the tangent line.',
         '(Circle)\n\nThe circle tangent to the line.',
         '(0/1)\n\nOne of the tangent lines.\n\nAccording to the defined order.']],

        ['PolarLine',
         'PolarLine[Point(Pt), Circle(Ccl)]: Line_straight',
         'Construct the polar line of a point about a circle.',
        ['(Point)\n\nThe given point.',
         '(Circle)\n\nThe given circle.']],

        ['PolarPoint',
         'PolarPoint[Line(Ln), Circle(Ccl)]: Point_fixed',
         'Construct the polar point of a line about a circle.',
        ['(Line)\n\nThe given line.',
         '(Circle)\n\nThe given circle.']],

        ['initial',
         'initial=...Obj',
         '(Required)\n\nInitial conditions, displayed as black solid lines in the beginning.'],

        ['named',
         'named=...Obj.Name',
         '(Another form of \'initial\')\n\nInitial named objects.\n\n\'Name\' can accept only one character(A-Z,a-z,0-9) and can\'t allow the same names, or it will sort in A-Z(a-z) order.\n\nNote: The objects here don\'t need to be redefined in \'initial\'.'],

        ['movepoints',
         'movepoints=...FreePts',
         '(Optional)\n\nInitial movable (free) points.\n\nAlways hidden except in dragging mode.\n\nNote: Free points in \'initial\' don\'t need to be redefined here.'],

        ['hidden',
         'hidden=...Obj',
         '(Optional)\n\nHidden objects.\n\nAlways hidden except in dragging mode.\n\nNote: It\'s better to define free points in \'movepoints\'.'],

        ['result',
         'result=...Obj<:...Obj_displayed>',
         '(Required)\n\nObjects sought and displayed(optional) as result, separated by a colon.\n\nOften more than one result, wrap and write others.\n\nNotes: A line is more suitable as a result than a segment, even if the display is segment; if the result is just a part of the configeration, it\'s better to display the whole.'],

        ['explore',
         'explore=...Obj',
         '(Required)\n\nResults displayed in exploring mode.'],

        ['rules',
         'rules=...Obj?Obj',
         '(Optional)\n\nForce rules in this level, displayed as red dashed lines while moving. Operators:\n* \'#\' - Objects must intersect.\n* \'/\' - Objects can\'t intersect.\n* \'<\',\'>\' - Numerical comparison.\n* \'.\' - Connector. Example: \'A.B.C\': The size of angle ABC; \'A.B\': The length of segment AB.\n* \'|\' - OR-condition.\n\nNotes: It shouldn\'t be written when the solutions are naturally non-exist. It should be written when the solutions: \n* 1)can be better constructed in special cases;\n* 2)can\'t be constructed in the same method in all cases;\n* 3)are lost(but not 0) in some cases.']
        
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

                if (linePrefix.match('=.*\\[[^\\]=]*$')){

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
                    signatures.documentation = new vscode.MarkdownString(refDoc[docNum][2]);

                    const paramLocation = atParam(refDoc[docNum][1],commas);
                    if (paramLocation){
                        signatures.parameters = [new vscode.ParameterInformation(paramLocation,new vscode.MarkdownString(refDoc[docNum][3][commas]))];
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
                    signatures.documentation = new vscode.MarkdownString(refDoc[docNum][2]);

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
                    compItem.documentation = new vscode.MarkdownString(objects[i][2]);
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
                        varPoint.splice(0,0,[varConsts[0],variablePrefix.split('=')[1],'A fixed point.']);
                        varPointIndex.splice(0,0,varConsts[0]);
                    }
                    else if (variablePrefix.match('=(Line|Ray|Parallel|Perp|ABisect|PBisect|FixAngle|CopyAnfle|Tangent|PolarLine)\\[')){
                        varLine.splice(0,0,[varConsts[0],variablePrefix.split('=')[1],'A straight line.']);
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

                const currentLine = document.lineAt(position).text;
                if (currentLine.match('result.*:')){
                    var varCurrentLine = currentLine.match(new RegExp('(?<=(:.*,)|:)[^,]+(?=,)','g'));
                }
                else if (currentLine.match('initial|exlpore|hidden|movepoints|(result[^:]*)')){
                    var varCurrentLine = currentLine.match(new RegExp('(?<==|,)[^,]+(?=,)','g'));
                }
                else if (currentLine.match('named')){
                    var varCurrentLine = currentLine.match(new RegExp('((?<==|,)[^,]+(?=\\.))|((?<==|,)[^,]+(?=,))','g'));
                }
                else {
                    var varCurrentLine = currentLine.match(new RegExp('(?<=\\[|,)[^,]+(?=,)','g'));
                }
                if (!varCurrentLine == []) {
                    if (currentLine.match('ShiftSeg')&&varCurrentLine.length==2){
                        varCurrentLine.splice(1,1);
                    }
                    else if (currentLine.match('CopyAngle')&&varCurrentLine.length==4&&varCurrentLine[0]==varCurrentLine[3]){
                        varCurrentLine.splice(2,1);
                    }
                    else if (currentLine.match('CopyAngle')&&varCurrentLine.length==4&&varCurrentLine[2]==varCurrentLine[3]){
                        varCurrentLine.splice(0,1);
                    }
                    else if (currentLine.match('CopyAngle')&&varCurrentLine.length>=3){
                        varCurrentLine.splice(0,3);
                    }
                    for (var i=0;i<varCurrentLine.length;i++){
                        if (varPointIndex.indexOf(varCurrentLine[i])>-1){
                            varPoint.splice(varPoint.indexOf(varCurrentLine[i]),1);
                            varPointIndex.splice(varPoint.indexOf(varCurrentLine[i]),1);
                        }
                        else if (varFreePtIndex.indexOf(varCurrentLine[i])>-1){
                            varFreePt.splice(varFreePt.indexOf(varCurrentLine[i]),1);
                            varFreePtIndex.splice(varPoint.indexOf(varCurrentLine[i]),1);
                        }
                        else if (varLineIndex.indexOf(varCurrentLine[i])>-1){
                            varLine.splice(varLine.indexOf(varCurrentLine[i]),1);
                            varLineIndex.splice(varPoint.indexOf(varCurrentLine[i]),1);
                        }
                        else if (varCircleIndex.indexOf(varCurrentLine[i])>-1){
                            varCircle.splice(varCircle.indexOf(varCurrentLine[i]),1);
                            varCircleIndex.splice(varPoint.indexOf(varCurrentLine[i]),1);
                        }
                        else if (varSegIndex.indexOf(varCurrentLine[i])>-1){
                            varSeg.splice(varSeg.indexOf(varCurrentLine[i]),1);
                            varSegIndex.splice(varPoint.indexOf(varCurrentLine[i]),1);
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
            
            if (linePrefix.match('((Circle3|Compass|Circle|Line|Ray|Segment|ShiftSeg|Parallel|Perp|ABisect|PBisect|FixAngle|CopyAngle|Tangent|PolarLine|Midpoint)\\[[^,\\]=]*$)|((Circle3|(?<==)Line|Ray|Segment|Midpoint|ABisect|PBisect|ShiftSeg|Compass|Circle|CopyAngle)\\[[^,]*,[^,\\]=]*$)|((Circle3|ABisect|ShiftSeg|Compass|CopyAngle)\\[[^,]*,[^,]*,[^,\\]=]*$)|(CopyAngle\\[[^,]*,[^,]*,[^,]*,[^,\\]=]*$)|(CopyAngle\\[[^,]*,[^,]*,[^,]*,[^,]*,[^,\\]=]*$)|((FixAngle\\[)[^,]*,[^,\\]=]*$)|(Intersect\\[[^,]*,[^,]*,[^,]*,[^,\\]=]*$)')) {
                var varlistsumpt=varList(1).concat(varList(0));
                return varlistsumpt;
            }
            else if (linePrefix.match('(PolarPoint\\[[^,\\]=]*$)|((Parallel|Perp)\\[[^,]*,[^,\\]=]*$)')) {
                var varlistsumls=varList(2).concat(varList(4));
                return varlistsumls;
            }
            else if (linePrefix.match('(Linepoint\\[[^,\\]=]*$)|(Intersect\\[[^,\\]=]*$)|((Intersect\\[)[^,]*,[^,\\]=]*$)')) {
                var varlistsumlcs=varList(2).concat(varList(3)).concat(varList(4));
                return varlistsumlcs;
            }
            else if (linePrefix.match('(CenterPoint\\[[^,\\]=]*$)|((PolarLine|PolarPoint)\\[[^,]*,[^,\\]=]*$)|((Tangent\\[)[^,]*,[^,\\]=]*$)')) {
                return varList(3);
            }
            else if (linePrefix.match('EdgePoint\\[[^,\\]=]*$')) {
                return varList(2);
            }
            else if (linePrefix.match('((Tangent\\[)[^,]*,[^,]*,[^,\\]=]*$)|((EdgePoint\\[)[^,]*,[^,\\]=]*$)|((Intersect\\[)[^,]*,[^,]*,[^,\\]=]*$)')) {
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
            else if (linePrefix.match('^[iermhnIERMHN][^=]*$')) {
                return completionList(getRef(LevelSettings),vscode.CompletionItemKind.Property);
            }
            else if (linePrefix.match('(?<!(initial|explore|hidden|named|result|movepoints|rules))=[A-Za-z]?[^=,:\\[]*$')) {
                const funcAll = funcSeg.concat(funcPoint).concat(funcLine).concat(funcCircle);
                return completionList(getRef(funcAll),vscode.CompletionItemKind.Function);
            }
          }
        },
        '[',',','=','',':'
    );

    const hover = vscode.languages.registerHoverProvider(
        'gmt',{
          provideHover(document,position){
            
            const wordCurrent = document.getText(document.getWordRangeAtPosition(position));

            for (let i=0; i<refDoc.length; i++){
                if (wordCurrent == refDoc[i][0]){
                    let MdHover = new vscode.MarkdownString();
                    MdHover.appendCodeblock(refDoc[i][1],'gmt');
                    var refHover = [MdHover,refDoc[i][2]];
                }
            }

            if (refHover){
                return new vscode.Hover(refHover);
            }
            else{
                var varRefList = [];
                for (let i=0; i<document.lineCount; i++)
                { 
                    var varS = document.lineAt(i).text;
                    let varConsts = varS.match('^.*(?==)');

                    if (varS.match('=(Linepoint)?\\[')){
                        varRefList.push([varConsts[0],varS.split('=')[1],'A free point.']);
                    }
                    else if (varS.match('=(Intersect|Midpoint|EdgePoint|CenterPoint|PolarPoint)\\[')){
                        varRefList.push([varConsts[0],varS.split('=')[1],'A fixed point.']);
                    }
                    else if (varS.match('=(Line|Ray|Parallel|Perp|ABisect|PBisect|FixAngle|CopyAnfle|Tangent|PolarLine)\\[')){
                        varRefList.push([varConsts[0],varS.split('=')[1],'A straight line.']);
                    }
                    else if (varS.match('=(Circle3|Compass|Circle)\\[')){
                        varRefList.push([varConsts[0],varS.split('=')[1],'A circle.']);
                    }
                    else if (varS.match('=(Segment|ShiftSeg)\\[')){
                        varRefList.push([varConsts[0],varS.split('=')[1],'A segment.']);
                    }
                }
                
                const ifNamed = document.lineAt(position.line).text;
                var namesPos = [];
                if (ifNamed.match('named=')){
                    var namedList = ifNamed.split('');
                    for (let i=0; i<namedList.length; i++){
                        if (namedList[i] == '.'){
                            namesPos.push(i+1);
                        }
                    }
                }

                if (namesPos.indexOf(position.character) == -1 | namesPos == []){
                    for (let i=0; i<varRefList.length; i++){
                        if (wordCurrent == varRefList[i][0]){
                            let MdHover = new vscode.MarkdownString();
                            MdHover.appendCodeblock(varRefList[i][0]+': '+varRefList[i][1],'gmt');
                            var varHover = [MdHover,varRefList[i][2]];
                        }
                    }
                }

                if (varHover){
                    return new vscode.Hover(varHover);
                }
            }
          }
        }
    );

    context.subscriptions.push(completion);
    context.subscriptions.push(outline);
    context.subscriptions.push(signhelp);
    context.subscriptions.push(hover);

}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}