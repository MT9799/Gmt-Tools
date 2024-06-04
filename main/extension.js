const vscode = require('vscode');

function activate(context) {
      
    const outline = vscode.languages.registerDocumentSymbolProvider(
        "gmt", 
        {
          provideDocumentSymbols(document) {

            return new Promise(resolve => 
            {
                const symbolsArr = [];
                const nodes = [symbolsArr];
                let isInVarfreept = false;
                let isInVarpt = false;
                let isInVarline = false;
                let isInVarseg = false;
                let isInVarcircle = false;
                //let isInLvlsetting = false;
                
                for (let i=0; i<document.lineCount; i++) {
                    const line = document.lineAt(i);
                    const tokens = line.text.split("=");

                    if (line.text.match(new RegExp('^.+(?==(Linepoint)?\\[)'))) {

                        const marker_symbol = new vscode.DocumentSymbol(
                            tokens[0],tokens[1],
                            vscode.SymbolKind.Variable,
                            line.range,line.range
                        );

                        if (!isInVarfreept) {
                            const varSymbolKind = new vscode.DocumentSymbol('Var_FreePoints','',vscode.SymbolKind.Function,line.range, line.range);
                            nodes[0].push(varSymbolKind);
                            nodes.push(varSymbolKind.children);
                            var varfreeptset = nodes.length;
                            isInVarfreept = true;
                        }

                        nodes[varfreeptset-1].push(marker_symbol);
                    }

                    else if (line.text.match(new RegExp('^.+(?==(Intersect|Midpoint|EdgePoint|CenterPoint|PolarPoint)\\[)'))) {

                        const marker_symbol = new vscode.DocumentSymbol(
                            tokens[0],tokens[1],
                            vscode.SymbolKind.Variable,
                            line.range,line.range
                        );

                        if (!isInVarpt) {
                            const varSymbolKind = new vscode.DocumentSymbol('Var_Points','',vscode.SymbolKind.Function,line.range, line.range);
                            nodes[0].push(varSymbolKind);
                            nodes.push(varSymbolKind.children);
                            var varptset = nodes.length;
                            isInVarpt = true;
                        }

                        nodes[varptset-1].push(marker_symbol);
                    }

                    else if (line.text.match(new RegExp('^.+(?==(Line|Ray|Parallel|Perp|ABisect|PBisect|FixAngle|CopyAngle|Tangent|PolarLine)\\[)'))) {

                        const marker_symbol = new vscode.DocumentSymbol(
                            tokens[0],tokens[1],
                            vscode.SymbolKind.Variable,
                            line.range,line.range
                        );

                        if (!isInVarline) {
                            const varSymbolKind = new vscode.DocumentSymbol('Var_Lines','',vscode.SymbolKind.Function,line.range, line.range);
                            nodes[0].push(varSymbolKind);
                            nodes.push(varSymbolKind.children);
                            var varlineset = nodes.length;
                            isInVarline = true;
                        }

                        nodes[varlineset-1].push(marker_symbol);
                    }

                    else if (line.text.match(new RegExp('^.+(?==(Circle3|Compass|Circle)\\[)'))) {

                        const marker_symbol = new vscode.DocumentSymbol(
                            tokens[0],tokens[1],
                            vscode.SymbolKind.Variable,
                            line.range,line.range
                        );

                        if (!isInVarcircle) {
                            const varSymbolKind = new vscode.DocumentSymbol('Var_Circles','',vscode.SymbolKind.Function,line.range, line.range);
                            nodes[0].push(varSymbolKind);
                            nodes.push(varSymbolKind.children);
                            var varcircleset = nodes.length;
                            isInVarcircle = true;
                        }

                        nodes[varcircleset-1].push(marker_symbol);
                    }

                    else if (line.text.match(new RegExp('^.+(?==(Segment|ShiftSeg)\\[)'))) {

                        const marker_symbol = new vscode.DocumentSymbol(
                            tokens[0],tokens[1],
                            vscode.SymbolKind.Variable,
                            line.range,line.range
                        );

                        if (!isInVarseg) {
                            const varSymbolKind = new vscode.DocumentSymbol('Var_Segments','',vscode.SymbolKind.Function,line.range, line.range);
                            nodes[0].push(varSymbolKind);
                            nodes.push(varSymbolKind.children);
                            var varsegset = nodes.length;
                            isInVarseg = true;
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

                        nodes[0].push(cmd_symbol);
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
         '(Optional)\n\nForce rules in this level, displayed as red dashed lines while moving. Operators \'?\':\n* \'#\' - Objects must intersect.\n* \'/\' - Objects can\'t intersect.\n* \'<\',\'>\' - Numerical comparison.\n* \'.\' - Connector. Example: \'A.B.C\': The size of angle ABC; \'A.B\': The length of segment AB.\n* \'|\' - OR-condition.\n\nNotes: It shouldn\'t be written when the solutions are naturally non-exist. It should be written when the solutions: \n* 1)can be better constructed in special cases;\n* 2)can\'t be constructed in the same method in all cases;\n* 3)are lost(but not 0) in some cases.']
        
    ];

    const signhelp = vscode.languages.registerSignatureHelpProvider(
        'gmt', 
        {
          provideSignatureHelp(document,position) {
            return new Promise(resolve =>
            {
                function atParam(str,num) {
                    let params = str.substring(str.indexOf('[')+1, str.indexOf(']'));
                    let paramsArray = params.split(',');
                    var paramLength = [];
                    let posStart = str.indexOf('[')+1, posEnd = str.indexOf('[');

                    for (let i=0; i<paramsArray.length; i++) {
                        posEnd += paramsArray[i].length+1;
                        paramLength.push([posStart,posEnd]);
                        posStart += paramsArray[i].length+1;
                    }

                    return paramLength[num];
                }

                function atLvlSet(str) {
                    let EquSym = str.indexOf('=');
                    let paramLength = [EquSym+1,str.length];
                    return paramLength;
                }

                const linePrefix = document.lineAt(position).text.substring(0, position.character);
                var symbolResult = new vscode.SignatureHelp();

                if (linePrefix.match('=.*\\[[^\\]=]*$')) {

                    let getFunc = linePrefix.match('(?<==).*(?=\\[)')[0];
                    if (getFunc == '') {
                        var docNum = 0;
                    }
                    else {
                        for (let i=0; i<refDoc.length; i++) {
                            if (refDoc[i][0] == getFunc) {
                                var docNum = i;
                            }
                        }
                    }
                          
                    if (linePrefix.match(',')) {
                        var commas = linePrefix.match(RegExp(',','g')).length;
                    }
                    else {var commas = 0;}
                    
                    if (docNum != undefined) {
                        var signatures = new vscode.SignatureInformation();
                        signatures.label = refDoc[docNum][1];
                        signatures.documentation = new vscode.MarkdownString(refDoc[docNum][2]);

                        const paramLocation = atParam(refDoc[docNum][1],commas);
                        if (paramLocation) {
                            signatures.parameters = [new vscode.ParameterInformation(paramLocation,new vscode.MarkdownString(refDoc[docNum][3][commas]))];
                        }
                    }

                    symbolResult.signatures = [signatures];
                    symbolResult.activeParameter = 0;
                    symbolResult.activeSignature = 0;
                }
                else if (linePrefix.match('^(initial|named|movepoints|hidden|result|explore|rules)=.*')) {

                    let getFunc = linePrefix.match('^.*(?==)')[0];

                    for (let i=0; i<refDoc.length; i++) {
                        if (refDoc[i][0] == getFunc) {
                            var docNum = i;
                        }
                    }
                    
                    if (docNum != undefined) {
                        var signatures = new vscode.SignatureInformation();
                        signatures.label = refDoc[docNum][1];
                        signatures.documentation = new vscode.MarkdownString(refDoc[docNum][2]);

                        const paramLocation = atLvlSet(refDoc[docNum][1]);
                        if (paramLocation) {
                            signatures.parameters = [new vscode.ParameterInformation(paramLocation)];
                        }
                    }

                    symbolResult.signatures = [signatures];
                    symbolResult.activeParameter = 0;
                    symbolResult.activeSignature = 0;
                }

                if (symbolResult) {
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

            function completionList(objects,kind) {
                var comp = [];
                for (let i=0; i<objects.length; i++) {
                    var compItem = new vscode.CompletionItem();
                    compItem.label = {label: objects[i][0], description: objects[i][2]};
                    compItem.detail = objects[i][1];
                    compItem.documentation = new vscode.MarkdownString(objects[i][2]);
                    compItem.kind = kind;
                    comp.splice(0,0,compItem);
                }
                return comp;
            }

            function varList(arg) {
                var varFreePt = [], varPoint = [], varLine = [], varCircle = [], varSeg = [];
                var varFreePtIndex = [], varPointIndex = [], varLineIndex = [], varCircleIndex = [], varSegIndex = [];

                for (let i=0; i<position.line; i++)
                { 
                    const variablePrefix = document.lineAt(i).text;
                    var varConsts = variablePrefix.match('^.*(?==)');
                    
                    if (variablePrefix.match('=(Linepoint)?\\[')) {
                        varFreePt.splice(0,0,[varConsts[0],variablePrefix.split('=')[1],'A free point.']);
                        varFreePtIndex.splice(0,0,varConsts[0]);
                    }
                    else if (variablePrefix.match('=(Intersect|Midpoint|EdgePoint|CenterPoint|PolarPoint)\\[')) {
                        varPoint.splice(0,0,[varConsts[0],variablePrefix.split('=')[1],'A fixed point.']);
                        varPointIndex.splice(0,0,varConsts[0]);
                    }
                    else if (variablePrefix.match('=(Line|Ray|Parallel|Perp|ABisect|PBisect|FixAngle|CopyAngle|Tangent|PolarLine)\\[')) {
                        varLine.splice(0,0,[varConsts[0],variablePrefix.split('=')[1],'A straight line.']);
                        varLineIndex.splice(0,0,varConsts[0]);
                    }
                    else if (variablePrefix.match('=(Circle3|Compass|Circle)\\[')) {
                        varCircle.splice(0,0,[varConsts[0],variablePrefix.split('=')[1],'A circle.']);
                        varCircleIndex.splice(0,0,varConsts[0]);
                    }
                    else if (variablePrefix.match('=(Segment|ShiftSeg)\\[')) {
                        varSeg.splice(0,0,[varConsts[0],variablePrefix.split('=')[1],'A segment.']);
                        varSegIndex.splice(0,0,varConsts[0]);
                    }
                }

                const currentLine = document.lineAt(position).text;
                if (currentLine.match('result.*:')) {
                    var varCurrentLine = currentLine.match(new RegExp('(?<=(:.*,)|:)[^,]+(?=,)','g'));
                }
                else if (currentLine.match('initial|exlpore|hidden|movepoints|(result[^:]*)')) {
                    var varCurrentLine = currentLine.match(new RegExp('(?<==|,)[^,]+(?=,)','g'));
                }
                else if (currentLine.match('named')) {
                    var varCurrentLine = currentLine.match(new RegExp('((?<==|,)[^,]+(?=\\.))|((?<==|,)[^,]+(?=,))','g'));
                }
                else {
                    var varCurrentLine = currentLine.match(new RegExp('(?<=\\[|,)[^,]+(?=,)','g'));
                }
                if (!varCurrentLine == []) {
                    if (currentLine.match('ShiftSeg')&&varCurrentLine.length==2) {
                        varCurrentLine.splice(1,1);
                    }
                    else if (currentLine.match('CopyAngle')&&varCurrentLine.length==4&&varCurrentLine[0]==varCurrentLine[3]) {
                        varCurrentLine.splice(2,1);
                    }
                    else if (currentLine.match('CopyAngle')&&varCurrentLine.length==4&&varCurrentLine[2]==varCurrentLine[3]) {
                        varCurrentLine.splice(0,2);
                    }
                    else if (currentLine.match('CopyAngle')&&varCurrentLine.length==4&&varCurrentLine[1]==varCurrentLine[3]) {
                        varCurrentLine.splice(0,3);
                    }
                    else if (currentLine.match('CopyAngle')&&varCurrentLine.length>=3) {
                        varCurrentLine.splice(0,3);
                    }
                    for (let i=0;i<varCurrentLine.length;i++) {
                        let isInPt = varPointIndex.indexOf(varCurrentLine[i]);
                        let isInFrPt = varFreePtIndex.indexOf(varCurrentLine[i]);
                        let isInLn = varLineIndex.indexOf(varCurrentLine[i]);
                        let isInCcl = varCircleIndex.indexOf(varCurrentLine[i]);
                        let isInSeg = varSegIndex.indexOf(varCurrentLine[i]);
                        if (isInPt > -1) {
                            varPoint.splice(isInPt,1);
                            varPointIndex.splice(isInPt,1);
                        }
                        else if (isInFrPt > -1) {
                            varFreePt.splice(isInFrPt,1);
                            varFreePtIndex.splice(isInFrPt,1);
                        }
                        else if (isInLn > -1) {
                            varLine.splice(isInLn,1);
                            varLineIndex.splice(isInLn,1);
                        }
                        else if (isInCcl > -1) {
                            varCircle.splice(isInCcl,1);
                            varCircleIndex.splice(isInCcl,1);
                        }
                        else if (isInSeg > -1) {
                            varSeg.splice(isInSeg,1);
                            varSegIndex.splice(isInSeg,1);
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

            function getRef(arr) {
                let refs = [];
                for (let i=0; i<arr.length; i++) {
                    for (let j=0; j<refDoc.length; j++) {
                        if (refDoc[j][0] == arr[i]) {
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
          provideHover(document,position) {
            
            const wordCurrent = document.getText(document.getWordRangeAtPosition(position));
            const lineCurrent = document.lineAt(position).text;

            for (let i=0; i<refDoc.length; i++) {
                if (wordCurrent == refDoc[i][0]) {
                    let MdHover = new vscode.MarkdownString();
                    MdHover.appendCodeblock(refDoc[i][1],'gmt');
                    var refHover = [MdHover,refDoc[i][2]];
                }
            }

            if (refHover && !lineCurrent.match('^#')) {
                return new vscode.Hover(refHover);
            }
            else{
                var varRefList = [];
                for (let i=0; i<document.lineCount; i++)
                { 
                    let varS = document.lineAt(i).text;
                    let varConsts = varS.match('^.*(?==)');

                    if (varS.match('=(Linepoint)?\\[')) {
                        varRefList.push([varConsts[0],varS.split('=')[1],'A free point.']);
                    }
                    else if (varS.match('=(Intersect|Midpoint|EdgePoint|CenterPoint|PolarPoint)\\[')) {
                        varRefList.push([varConsts[0],varS.split('=')[1],'A fixed point.']);
                    }
                    else if (varS.match('=(Line|Ray|Parallel|Perp|ABisect|PBisect|FixAngle|CopyAngle|Tangent|PolarLine)\\[')) {
                        varRefList.push([varConsts[0],varS.split('=')[1],'A straight line.']);
                    }
                    else if (varS.match('=(Circle3|Compass|Circle)\\[')) {
                        varRefList.push([varConsts[0],varS.split('=')[1],'A circle.']);
                    }
                    else if (varS.match('=(Segment|ShiftSeg)\\[')) {
                        varRefList.push([varConsts[0],varS.split('=')[1],'A segment.']);
                    }
                }
                
                var namesPos = [];
                if (lineCurrent.match('named=')) {
                    let namedList = lineCurrent.split('');
                    for (let i=0; i<namedList.length; i++) {
                        if (namedList[i] == '.') {
                            namesPos.push(i+1);
                        }
                    }
                }

                if (namesPos.indexOf(position.character) == -1 | namesPos == []) {
                    for (let i=0; i<varRefList.length; i++) {
                        if (wordCurrent == varRefList[i][0]) {
                            let MdHover = new vscode.MarkdownString();
                            MdHover.appendCodeblock(varRefList[i][0]+': '+varRefList[i][1],'gmt');
                            var varHover = [MdHover,varRefList[i][2]];
                        }
                    }
                }

                if (varHover && !lineCurrent.match('^#')) {
                    return new vscode.Hover(varHover);
                }
            }
          }
        }
    );

    const rename = vscode.languages.registerRenameProvider(
        'gmt',
        {
          provideRenameEdits(document,position,newName) {

            const rangeCurrent = document.getWordRangeAtPosition(position);
            const wordCurrent = document.getText(rangeCurrent);
            const lineCurrent = document.lineAt(position).text;
            if (!rangeCurrent) {
                throw new Error('Can\'t find symbols.');
            }
            if (wordCurrent.match('^(Linepoint|Intersect|Midpoint|EdgePoint|CenterPoint|PolarPoint|Line|Ray|Parallel|Perp|ABisect|PBisect|FixAngle|CopyAngle|Tangent|PolarLine|Circle3|Compass|Circle|Segment|ShiftSeg|initial|explore|hidden|named|result|movepoints|rules)$')) {
                throw new Error('Can\'t rename functions.');
            }
            else if (wordCurrent.match('^(-?[0-9]+\\.?[0-9]*)$')) {
                throw new Error('Can\'t rename numbers.');
            }
            if (lineCurrent.match('^#')) {
                throw new Error('Can\'t rename comments.');
            }
            var ranges = [];
            var namesRange = [];

            for (let i=0; i<document.lineCount; i++) {
                let lineCrt = document.lineAt(i).text;
                if (lineCrt.match('named=')) {
                    let namedList = lineCrt.split('');
                    for (let j=0; j<namedList.length; j++) {
                        if (namedList[j] == '.') {
                            namesRange.push(document.getWordRangeAtPosition(position.with(i,j+1)));
                        }
                    }
                }
            }
            
            let isInNamed = false;
            for (let i=0; i<namesRange.length; i++) {
                if (namesRange[i].isEqual(rangeCurrent)) {
                    isInNamed = true;
                }
            }
            
            if (!isInNamed) {
                for (let i=0; i<document.lineCount; i++) {
                    const lineCurrent = document.lineAt(i).text;
                    for (let j=0; j<lineCurrent.length; j++) {
                        let rangeGet = document.getWordRangeAtPosition(position.with(i,j));
                        let wordGet = document.getText(rangeGet);
                        if (wordCurrent == wordGet) {
                            let isInRange = false;
                            for (let k=0; k<ranges.length; k++) {
                                if (ranges[k].isEqual(rangeGet)) {
                                    isInRange = true;
                                }
                            }
                            if (namesRange) {
                                for (let k=0; k<namesRange.length; k++) {
                                    if (namesRange[k].isEqual(rangeGet)) {
                                        isInRange = true;
                                    }
                                }
                            }
                            if (!isInRange) {
                                ranges.push(rangeGet);
                            }
                        }
                    }
                }
            }
            else {
                ranges.push(rangeCurrent);
            }
            
            const fUri = vscode.Uri.parse(document.uri);
            var edits = new vscode.WorkspaceEdit();
            for (let i=0; i<ranges.length; i++) {
                edits.replace(fUri,ranges[i],newName);
            }

            return edits;
          }
        }
    );


    function provideDiagnostics() {

      let diagnosticCollection = vscode.languages.createDiagnosticCollection('gmt');
    
      vscode.workspace.onDidChangeTextDocument(event => {

        let document = event.document;
        let position = new vscode.Position;

        if (document.languageId === 'gmt') {

            let diagnostics = [];
            let dText = document.getText();

            diagnosticCollection.clear();

            var varFreePt = [], varPoint = [], varLine = [], varCircle = [], varSeg = [], varAll = [];
            for (let i=0; i<document.lineCount; i++)
            { 
                const lineCrt = document.lineAt(i).text;

                if (!lineCrt.startsWith('#')) {

                    //check brackets
                    let lSqBkt = lineCrt.match('\\[');
                    let rSqBkt = lineCrt.match('\\]$');
                    let uSqBkt = lineCrt.match('((?<=\\[.*)[\\[\\]](?=.*\\]))|((?<=^[^=]*)\\[)');
                    if (lSqBkt && !rSqBkt) {
                        let lSqBkt = lineCrt.matchAll(/\[/g);
                        for (const match of lSqBkt) {
                            let range = new vscode.Range(
                                i, match.index,
                                i, match.index + match[0].length
                            );
                            diagnostics.push(new vscode.Diagnostic(range, 'Missing bracket.', vscode.DiagnosticSeverity.Error));
                        }
                    }
                    else if (!lSqBkt && rSqBkt) {
                        let rSqBkt = lineCrt.matchAll(/\]/g);
                        for (const match of rSqBkt) {
                            let range = new vscode.Range(
                                i, match.index,
                                i, match.index + match[0].length
                            );
                            diagnostics.push(new vscode.Diagnostic(range, 'Missing bracket.', vscode.DiagnosticSeverity.Error));
                        }
                    }
                    if (uSqBkt) {
                        let uSqBkt = lineCrt.matchAll(/((?<=\[.*)[\[\]](?=.*\]))|((?<=^[^=]*)\[)/g);
                        for (const match of uSqBkt) {
                            let range = new vscode.Range(
                                i, match.index,
                                i, match.index + match[0].length
                            );
                            diagnostics.push(new vscode.Diagnostic(range, 'Unexpected bracket.', vscode.DiagnosticSeverity.Error));
                        }
                    }

                    //check commas
                    let uCmm = lineCrt.match('((?<=\\].*),)|(,(?=.*[=\\[]))|((?<=^[^=]*),)');
                    let dbCmm = lineCrt.match('(,,)|(,(?=\\]))|(,$)|((?<=[\\[=]),)');
                    if (uCmm) {
                        let uCmm = lineCrt.matchAll(/((?<=\].*),)|(,(?=.*[=\[]))|((?<=^[^=]*),)/g);
                        for (const match of uCmm) {
                            let range = new vscode.Range(
                                i, match.index,
                                i, match.index + match[0].length
                            );
                            diagnostics.push(new vscode.Diagnostic(range, 'Unexpected \',\'.', vscode.DiagnosticSeverity.Error));
                        }
                    }
                    if (dbCmm) {
                        let dbCmm = lineCrt.matchAll(/(,,)|(,(?=\]))|(,$)|((?<=[\[=]),)/g);
                        for (const match of dbCmm) {
                            let range = new vscode.Range(
                                i, match.index,
                                i, match.index + match[0].length
                            );
                            diagnostics.push(new vscode.Diagnostic(range, 'Incomplete parameter.', vscode.DiagnosticSeverity.Error));
                        }
                    }

                    //check equals
                    if (lineCrt.startsWith('=') | lineCrt.endsWith('=')) {
                        diagnostics.push(new vscode.Diagnostic(document.lineAt(i).range, 'Undefined expression.', vscode.DiagnosticSeverity.Error));
                    }
                    if (lineCrt.match('=') && !lineCrt.match('^(initial|explore|hidden|named|result|movepoints|rules)=') && !lineCrt.match('\\[')) {
                        diagnostics.push(new vscode.Diagnostic(document.lineAt(i).range, 'Incomplete expression or missing brackets.', vscode.DiagnosticSeverity.Error));
                    }
                    if (lineCrt.match('(?<=\\[.*)=(?=.*\\])')) {
                        let uEql = lineCrt.matchAll(/=/g);
                        for (const match of uEql) {
                            let range = new vscode.Range(
                                i, match.index,
                                i, match.index + match[0].length
                            );
                            diagnostics.push(new vscode.Diagnostic(range, 'Unexpected \'=\'.', vscode.DiagnosticSeverity.Error));
                        }
                    }
                    if (lineCrt.match('=.*=')) {
                        let mEql = lineCrt.matchAll(/=/g);
                        for (const match of mEql) {
                            let range = new vscode.Range(
                                i, match.index,
                                i, match.index + match[0].length
                            );
                            diagnostics.push(new vscode.Diagnostic(range, 'Unknown syntax.', vscode.DiagnosticSeverity.Error));
                        }
                    }

                    //check colons
                    if (lineCrt.match('(?<!result=[^:]*):')) {
                        let mCln = lineCrt.matchAll(/(?<!result=[^:]*):/g);
                        for (const match of mCln) {
                            let range = new vscode.Range(
                                i, match.index,
                                i, match.index + match[0].length
                            );
                            diagnostics.push(new vscode.Diagnostic(range, 'Unexpected \':\'.', vscode.DiagnosticSeverity.Error));
                        }
                    }

                    //check dots
                    if (lineCrt.match('\\.,|,\\.|[\\[<>]\\.|\\.[\\]<>]|\\.\\.|=\\.|\\.$|(?<!(named|rules|\\[).*)\\.')) {
                        let mDt = lineCrt.matchAll(/\.(?=,)|(?<=,)\.|(?<=\[|<|>)\.|\.(?=\]|<|>)|\.\.|(?<==)\.|\.$|(?<!(named|rules|\[).*)\./g);
                        for (const match of mDt) {
                            let range = new vscode.Range(
                                i, match.index,
                                i, match.index + match[0].length
                            );
                            diagnostics.push(new vscode.Diagnostic(range, 'Unexpected or incomplete \'.\'.', vscode.DiagnosticSeverity.Error));
                        }
                    }

                    //check other punctuations
                    if (!lineCrt.match('rules') && lineCrt.match('#|<|>|/|\\|')) {
                        let mPc = lineCrt.matchAll(/#|<|>|[/]|\|/g);
                        for (const match of mPc) {
                            let range = new vscode.Range(
                                i, match.index,
                                i, match.index + match[0].length
                            );
                            diagnostics.push(new vscode.Diagnostic(range, 'Unknown syntax.', vscode.DiagnosticSeverity.Error));
                        }
                    }
                    let dbOth = lineCrt.match('((:|\\|)(:|\\|))|(^(:|\\|))|((:|\\|)$)|((?<==|,)(:|\\|))|((:|\\|)(?==|,))');
                    if (dbOth) {
                        let dbOth = lineCrt.matchAll(/((:|\|)(:|\|))|(^(:|\|))|((:|\|)$)|((?<==|,)(:|\|))|((:|\|)(?==|,))/g);
                        for (const match of dbOth) {
                            let range = new vscode.Range(
                                i, match.index,
                                i, match.index + match[0].length
                            );
                            diagnostics.push(new vscode.Diagnostic(range, 'Incomplete parameter.', vscode.DiagnosticSeverity.Error));
                        }
                    }

                    var lineWord = [], lineRange = [];
                    for (let j=0; j<lineCrt.length; j++) {
                        let rangeGet = document.getWordRangeAtPosition(position.with(i,j));
                        let wordGet = document.getText(rangeGet);
                        let isInLst = false;
                        for (let k=0; k<lineRange.length; k++) {
                            if (rangeGet && lineRange[k]) {
                                if (lineRange[k].isEqual(rangeGet)) {
                                    isInLst = true;
                                }
                            }
                        }
                        if (!isInLst) {
                            lineWord.push(wordGet);
                            lineRange.push(rangeGet);
                        }
                    }

                    if (lineCrt.match('^[^,]+=[^,]*\\[')) {

                        //check var names
                        if (lineRange[0]) {
                            if (!lineWord[0].match('^[a-zA-Z_][a-zA-Z0-9_]*$')) {
                                diagnostics.push(new vscode.Diagnostic(lineRange[0], 'Illegal name.', vscode.DiagnosticSeverity.Error));
                            }
                            else if (lineWord[0].match('^(initial|explore|hidden|named|result|movepoints|rules)$')) {
                                diagnostics.push(new vscode.Diagnostic(lineRange[0], 'Keywords cannot be used for names.', vscode.DiagnosticSeverity.Error));
                            }
                        }

                        //check function names
                        if (lineRange[1]) {
                            if (!lineWord[1].match('^(Linepoint|Intersect|Midpoint|EdgePoint|CenterPoint|PolarPoint|Line|Ray|Parallel|Perp|ABisect|PBisect|FixAngle|CopyAngle|Tangent|PolarLine|Circle3|Compass|Circle|Segment|ShiftSeg)$')) {
                                diagnostics.push(new vscode.Diagnostic(lineRange[1], 'Unknown function.', vscode.DiagnosticSeverity.Error));
                            }
                        }

                        //check ifdefined
                        for (let j=2; j<lineWord.length; j++) {
                            if (lineRange[j] && varAll.indexOf(lineWord[j]) == -1 && !lineWord[j].match('^-?[0-9]+\\.?[0-9]*$')) {
                                diagnostics.push(new vscode.Diagnostic(lineRange[j], 'Object not defined.', vscode.DiagnosticSeverity.Error));
                            }
                        }

                        function paramnum(num) {
                            var mmtcha = lineCrt.matchAll(/(?<=\[).*(?=\])/g);

                            if (num == 1) {
                                var umtch = '\\[[^,]*,[^\\]]*';
                                var umtcha = lineCrt.matchAll(/(?<=\[[^,]*),[^\]]*/g);
                                var mmtch = '\\[\\]';
                                var uinfo = 'Unecessary parameters. Need 1.';
                                var minfo = 'Missing parameters. Need 1.'
                            }
                            else if (num == 2) {
                                var umtch = '\\[[^,]*,[^,]*,[^\\]]*';
                                var umtcha = lineCrt.matchAll(/(?<=\[[^,]*,[^,]*),[^\]]*/g);
                                var mmtch = '\\[[^,]*\\]';
                                var uinfo = 'Unecessary parameters. Need 2.';
                                var minfo = 'Missing parameters. Need 2.'
                            }
                            else if (num == 3) {
                                var umtch = '\\[[^,]*,[^,]*,[^,]*,[^\\]]*';
                                var umtcha = lineCrt.matchAll(/(?<=\[[^,]*,[^,]*,[^,]*),[^\]]*/g);
                                var mmtch = '\\[[^,]*(,[^,]*)?\\]';
                                var uinfo = 'Unecessary parameters. Need 3.';
                                var minfo = 'Missing parameters. Need 3.'
                            }
                            else if (num == 3.5) {
                                var umtch = '\\[[^,]*,[^,]*,[^,]*,[^,]*,[^\\]]*';
                                var umtcha = lineCrt.matchAll(/(?<=\[[^,]*,[^,]*,[^,]*,[^,]*),[^\]]*/g);
                                var mmtch = '\\[[^,]*(,[^,]*)?\\]';
                                var uinfo = 'Unecessary parameters. Need 3 or 4.';
                                var minfo = 'Missing parameters. Need 3 or 4.'
                            }
                            else if (num == 5) {
                                var umtch = '\\[[^,]*,[^,]*,[^,]*,[^,]*,[^,]*,[^\\]]*';
                                var umtcha = lineCrt.matchAll(/(?<=\[[^,]*,[^,]*,[^,]*,[^,]*,[^,]*),[^\]]*/g);
                                var mmtch = '\\[[^,]*(,[^,]*)?(,[^,]*)?(,[^,]*)?\\]';
                                var uinfo = 'Unecessary parameters. Need 5.';
                                var minfo = 'Missing parameters. Need 5.'
                            }

                            if (lineCrt.match(umtch)) {
                                for (const match of umtcha) {
                                    let range = new vscode.Range(
                                        i,match.index,
                                        i,match.index + match[0].length
                                    );
                                    diagnostics.push(new vscode.Diagnostic(range, uinfo, vscode.DiagnosticSeverity.Error));
                                }
                            }
                            else if (lineCrt.match(mmtch)) {
                                for (const match of mmtcha) {
                                    let range = new vscode.Range(
                                        i,match.index,
                                        i,match.index + match[0].length
                                    );
                                    diagnostics.push(new vscode.Diagnostic(range, minfo, vscode.DiagnosticSeverity.Error));
                                }
                            }
                        }

                        function paramtype(type,pos) {
                            if (varAll.indexOf(lineWord[pos]) != -1) {
                                if (type == 'lsc') {
                                    if (lineRange[pos] && varLine.concat(varCircle).concat(varSeg).indexOf(lineWord[pos]) == -1) {
                                        diagnostics.push(new vscode.Diagnostic(lineRange[pos], 'Type error. Line/Seg/Circle expected.', vscode.DiagnosticSeverity.Error));
                                    }
                                }
                                else if (type == 'pt') {
                                    if (lineRange[pos] && varFreePt.concat(varPoint).indexOf(lineWord[pos]) == -1) {
                                        diagnostics.push(new vscode.Diagnostic(lineRange[pos], 'Type error. Point expected.', vscode.DiagnosticSeverity.Error));
                                    }
                                }
                                else if (type == 'ln') {
                                    if (lineRange[pos] && varLine.indexOf(lineWord[pos]) == -1) {
                                        diagnostics.push(new vscode.Diagnostic(lineRange[pos], 'Type error. Straightline expected.', vscode.DiagnosticSeverity.Error));
                                    }
                                }
                                else if (type == 'ls') {
                                    if (lineRange[pos] && varLine.concat(varSeg).indexOf(lineWord[pos]) == -1) {
                                        diagnostics.push(new vscode.Diagnostic(lineRange[pos], 'Type error. Line/Seg expected.', vscode.DiagnosticSeverity.Error));
                                    }
                                }
                                else if (type == 'ccl') {
                                    if (lineRange[pos] && varCircle.indexOf(lineWord[pos]) == -1) {
                                        diagnostics.push(new vscode.Diagnostic(lineRange[pos], 'Type error. Circle expected.', vscode.DiagnosticSeverity.Error));
                                    }
                                }
                                else if (type == 'num') {
                                    if (lineRange[pos] && !lineWord[pos].match('^-?[0-9]+\\.?[0-9]*$')) {
                                        diagnostics.push(new vscode.Diagnostic(lineRange[pos], 'Type error. Number expected.', vscode.DiagnosticSeverity.Error));
                                    }
                                }
                                else if (type == 'prm') {
                                    if (lineRange[pos] && !lineWord[pos].match('^(0|1)$')) {
                                        diagnostics.push(new vscode.Diagnostic(lineRange[pos], 'Invalid parameter. Should be \'0\' or \'1\'.', vscode.DiagnosticSeverity.Error));
                                    }
                                }
                            }
                        }

                        function paramdiff(pos1,pos2) {
                            if (lineRange[pos1] && lineRange[pos2] && lineWord[pos1] == lineWord[pos2]) {
                                diagnostics.push(new vscode.Diagnostic(lineRange[pos1], 'Duplicate parameters.', vscode.DiagnosticSeverity.Warning));
                                diagnostics.push(new vscode.Diagnostic(lineRange[pos2], 'Duplicate parameters.', vscode.DiagnosticSeverity.Warning));
                            }
                        }

                        //freePoint
                        if (lineCrt.match('=\\[')) {
                            paramnum(2);
                            paramtype('num',2);
                            paramtype('num',3);
                        }

                        //Linepoint
                        if (lineCrt.match('=Linepoint\\[')) {
                            paramnum(2);
                            paramtype('lsc',2);
                            paramtype('num',3);
                        }

                        //Intersect
                        if (lineCrt.match('=Intersect\\[')) {
                            paramnum(3.5);
                            paramtype('lsc',2);
                            paramtype('lsc',3);
                            paramtype('prm',4);
                            paramtype('pt',5);
                            if (!lineRange[4]) {
                                paramtype('pt',6);
                            }
                            paramdiff(2,3);
                        }
                        
                        //Midpoint
                        if (lineCrt.match('=Midpoint\\[')) {
                            paramnum(2);
                            paramtype('pt',2);
                            paramtype('pt',3);
                            paramdiff(2,3);
                        }
                        
                        //EdgePoint
                        if (lineCrt.match('=EdgePoint\\[')) {
                            paramnum(2);
                            paramtype('ln',2);
                            paramtype('prm',3);
                        }
                        
                        //CenterPoint
                        if (lineCrt.match('=CenterPoint\\[')) {
                            paramnum(1);
                            paramtype('ccl',2);
                        }
                        
                        //PolarPoint
                        if (lineCrt.match('=PolarPoint\\[')) {
                            paramnum(2);
                            paramtype('ls',2);
                            paramtype('ccl',3);
                        }
                        
                        //Line
                        if (lineCrt.match('=Line\\[')) {
                            paramnum(2);
                            paramtype('pt',2);
                            paramtype('pt',3);
                            paramdiff(2,3);
                        }
                        
                        //Ray
                        if (lineCrt.match('=Ray\\[')) {
                            paramnum(2);
                            paramtype('pt',2);
                            paramtype('pt',3);
                            paramdiff(2,3);
                        }
                        
                        //Parallel
                        if (lineCrt.match('=Parallel\\[')) {
                            paramnum(2);
                            paramtype('pt',2);
                            paramtype('ls',3);
                        }
                        
                        //Perp
                        if (lineCrt.match('=Perp\\[')) {
                            paramnum(2);
                            paramtype('pt',2);
                            paramtype('ls',3);
                        }
                        
                        //ABisect
                        if (lineCrt.match('=ABisect\\[')) {
                            paramnum(3);
                            paramtype('pt',2);
                            paramtype('pt',3);
                            paramtype('pt',4);
                            paramdiff(2,3);
                            paramdiff(2,4);
                            paramdiff(3,4);
                        }
                        
                        //PBisect
                        if (lineCrt.match('=PBisect\\[')) {
                            paramnum(2);
                            paramtype('pt',2);
                            paramtype('pt',3);
                            paramdiff(2,3);
                        }
                        
                        //FixAngle
                        if (lineCrt.match('=FixAngle\\[')) {
                            paramnum(3);
                            paramtype('pt',2);
                            paramtype('pt',3);
                            paramtype('num',4);
                            paramdiff(2,3);
                        }
                        
                        //CopyAngle
                        if (lineCrt.match('=CopyAngle\\[')) {
                            paramnum(5);
                            paramtype('pt',2);
                            paramtype('pt',3);
                            paramtype('pt',4);
                            paramtype('pt',5);
                            paramtype('pt',6);
                            paramdiff(2,3);
                            paramdiff(2,4);
                            paramdiff(3,4);
                            paramdiff(5,6);
                            if (lineWord[5] == lineWord[2]) {
                                paramdiff(3,6);
                            }
                        }
                        
                        //Tangent
                        if (lineCrt.match('=Tangent\\[')) {
                            paramnum(3);
                            paramtype('pt',2);
                            paramtype('ccl',3);
                            paramtype('prm',4);
                        }
                        
                        //PolarLine
                        if (lineCrt.match('=PolarLine\\[')) {
                            paramnum(2);
                            paramtype('pt',2);
                            paramtype('ccl',3);
                        }
                        
                        //Circle3
                        if (lineCrt.match('=Circle3\\[')) {
                            paramnum(3);
                            paramtype('pt',2);
                            paramtype('pt',3);
                            paramtype('pt',4);
                            paramdiff(2,3);
                            paramdiff(2,4);
                            paramdiff(3,4);
                        }
                        
                        //Compass
                        if (lineCrt.match('=Compass\\[')) {
                            paramnum(3);
                            paramtype('pt',2);
                            paramtype('pt',3);
                            paramtype('pt',4);
                            paramdiff(2,3);
                            paramdiff(2,4);
                            paramdiff(3,4);
                        }
                        
                        //Circle
                        if (lineCrt.match('=Circle\\[')) {
                            paramnum(2);
                            paramtype('pt',2);
                            paramtype('pt',3);
                            paramdiff(2,3);
                        }
                        
                        //Segment
                        if (lineCrt.match('=Segment\\[')) {
                            paramnum(2);
                            paramtype('pt',2);
                            paramtype('pt',3);
                            paramdiff(2,3);
                        }
                        
                        //ShiftSeg
                        if (lineCrt.match('=ShiftSeg\\[')) {
                            paramnum(3);
                            paramtype('pt',2);
                            paramtype('pt',3);
                            paramtype('pt',4);
                            paramdiff(2,3);
                            paramdiff(2,4);
                        }
                        
                    }

                    //initial, explore, hidden
                    else if (lineCrt.match('^(initial|explore|hidden)=')) {
                        for (j=1; j<lineWord.length; j++) {
                            for (k=j+1; k<lineWord.length; k++) {
                                if (lineRange[j] && lineRange[k] && lineWord[j] == lineWord[k]) {
                                    diagnostics.push(new vscode.Diagnostic(lineRange[j], 'Duplicate objects.', vscode.DiagnosticSeverity.Warning));
                                    diagnostics.push(new vscode.Diagnostic(lineRange[k], 'Duplicate objects.', vscode.DiagnosticSeverity.Warning));
                                }
                            }
                            if (lineRange[j] && varAll.indexOf(lineWord[j]) == -1) {
                                diagnostics.push(new vscode.Diagnostic(lineRange[j], 'Object not found.', vscode.DiagnosticSeverity.Warning));
                            }
                        }
                    }

                    //result
                    else if (lineCrt.match('^result=')) {
                        for (j=1; j<lineWord.length; j++) {
                            for (k=j+1; k<lineWord.length; k++) {
                                if (lineRange[j] && lineRange[k] && lineWord[j] == lineWord[k]) {
                                    if (!document.getText(lineRange[j].union(lineRange[k])).match(':')) {
                                        diagnostics.push(new vscode.Diagnostic(lineRange[j], 'Duplicate objects.', vscode.DiagnosticSeverity.Warning));
                                        diagnostics.push(new vscode.Diagnostic(lineRange[k], 'Duplicate objects.', vscode.DiagnosticSeverity.Warning));
                                    }
                                }
                            }
                            if (lineRange[j] && varAll.indexOf(lineWord[j]) == -1) {
                                diagnostics.push(new vscode.Diagnostic(lineRange[j], 'Object not found.', vscode.DiagnosticSeverity.Warning));
                            }
                        }
                    }

                    //movepoints
                    else if (lineCrt.match('^movepoints=')) {
                        for (j=1; j<lineWord.length; j++) {
                            for (k=j+1; k<lineWord.length; k++) {
                                if (lineRange[j] && lineRange[k] && lineWord[j] == lineWord[k]) {
                                    diagnostics.push(new vscode.Diagnostic(lineRange[j], 'Duplicate objects.', vscode.DiagnosticSeverity.Warning));
                                    diagnostics.push(new vscode.Diagnostic(lineRange[k], 'Duplicate objects.', vscode.DiagnosticSeverity.Warning));
                                }
                            }
                            if (lineRange[j] && varFreePt.indexOf(lineWord[j]) == -1) {
                                diagnostics.push(new vscode.Diagnostic(lineRange[j], 'Type error, freepoints expected.', vscode.DiagnosticSeverity.Error));
                            }
                        }
                    }

                    //named
                    else if (lineCrt.match('^named=')) {
                        let lineName =[];
                        for (j=2; j<lineWord.length; j++) {
                            if (lineRange[j-1] && lineRange[j] && document.getText(lineRange[j-1].union(lineRange[j])).match('\\.')) {
                                lineName.push({word: lineWord[j], range: lineRange[j]});
                                lineWord.splice(j,1);
                                lineRange.splice(j,1);
                            }
                        }
                        let noName = lineCrt.matchAll(/((?<=,)[^\.]*(?=,))|((?<=,)[^\.]*$)|((?<==)[^\.]*(?=,))/g);
                        for (const match of noName) {
                            let range = new vscode.Range(
                                i, match.index,
                                i, match.index + match[0].length
                            );
                            lineName.push({word: document.getText(range), range: range});
                        }
                        for (j=0; j<lineName.length; j++) {
                            for (k=j+1; k<lineName.length; k++) {
                                if (lineName[j].range && lineName[k].range && lineName[j].word == lineName[k].word) {
                                    diagnostics.push(new vscode.Diagnostic(lineName[j].range, 'Duplicate names. If not change, it will be reassigned.', vscode.DiagnosticSeverity.Warning));
                                    diagnostics.push(new vscode.Diagnostic(lineName[k].range, 'Duplicate names. If not change, it will be reassigned.', vscode.DiagnosticSeverity.Warning));
                                }
                            }
                            if (lineName[j].range && !lineName[j].word.match('(^[A-Za-z]$)|(^\\.[0-9]$)')) {
                                diagnostics.push(new vscode.Diagnostic(lineName[j].range, 'Invalid name. If not change, it will be reassigned.', vscode.DiagnosticSeverity.Warning));
                            }
                        }
                        for (j=1; j<lineWord.length; j++) {
                            for (k=j+1; k<lineWord.length; k++) {
                                if (lineRange[j] && lineRange[k] && lineWord[j] == lineWord[k]) {
                                    diagnostics.push(new vscode.Diagnostic(lineRange[j], 'Duplicate objects.', vscode.DiagnosticSeverity.Warning));
                                    diagnostics.push(new vscode.Diagnostic(lineRange[k], 'Duplicate objects.', vscode.DiagnosticSeverity.Warning));
                                }
                            }
                            if (lineRange[j] && varAll.indexOf(lineWord[j]) == -1) {
                                diagnostics.push(new vscode.Diagnostic(lineRange[j], 'Object not found.', vscode.DiagnosticSeverity.Warning));
                            }
                        }
                    }

                    //rules
                    else if (lineCrt.match('^rules=')) {
                        for (j=1; j<lineWord.length; j++) {
                            if (lineRange[j] && varAll.indexOf(lineWord[j]) == -1 && !lineWord[j].match('^-?[0-9]+\\.?[0-9]*$')) {
                                diagnostics.push(new vscode.Diagnostic(lineRange[j], 'Object not found.', vscode.DiagnosticSeverity.Warning));
                            }
                        }
                        let ruleAll = lineCrt.matchAll(/((?<==)[^,\|]*(?=(,|\|)))|((?<=(,|\|))[^,\|]*(?=(,|\|)))|((?<=(,|\|))[^,\|]*$)|((?<==)[^,\|]*$)/g);
                        let rules = [];
                        for (const match of ruleAll) {
                            let range = new vscode.Range(
                                i,match.index,
                                i,match.index + match[0].length
                            );
                            if (!document.getText(range) == '') {
                                rules.push({word: document.getText(range), range: range});
                                //diagnostics.push(new vscode.Diagnostic(range, 'This is a rule.', vscode.DiagnosticSeverity.Information));
                            }
                        }
                        for (j=0; j<rules.length; j++) {

                            // #/
                            if (rules[j].word.match('#|/')) {
                                if (rules[j].word.match('(#$)|(^#)|(/$)|(^/)')) {
                                    diagnostics.push(new vscode.Diagnostic(rules[j].range, 'Incomplete rule.', vscode.DiagnosticSeverity.Error));
                                }
                                let obj1 = rules[j].word.match('^.*(?=/|#)');
                                let obj2 = rules[j].word.match('(?<=/|#).*$');
                                if (!obj1[0].match('^[a-zA-Z_][a-zA-Z0-9_]*$') | !obj2[0].match('^[a-zA-Z_][a-zA-Z0-9_]*$')) {
                                    diagnostics.push(new vscode.Diagnostic(rules[j].range, 'Invalid rule.', vscode.DiagnosticSeverity.Error));
                                }
                            }

                            // <>.
                            else if (rules[j].word.match('<|>')) {
                                if (rules[j].word.match('(<$)|(^<)|(>$)|(^>)')) {
                                    diagnostics.push(new vscode.Diagnostic(rules[j].range, 'Incomplete rule.', vscode.DiagnosticSeverity.Error));
                                }
                                let obj1 = rules[j].word.match('^.*(?=<|>)');
                                let obj2 = rules[j].word.match('(?<=<|>).*$');
                                if (!obj1[0] == '') {
                                    if (!obj1[0].match('^(([^\\.]*\\.[^\\.]*\\.[^\\.]*)|([^\\.]*\\.[^\\.]*))$')) {
                                        diagnostics.push(new vscode.Diagnostic(rules[j].range, 'Invalid length/angle description. \nShould be like \'A.B\' or \'A.B.C\'.', vscode.DiagnosticSeverity.Error));
                                    }
                                    let obj11 = obj1[0].split('.');
                                    for (k=0; k<obj11.length; k++) {
                                        if (varFreePt.concat(varPoint).indexOf(obj11[k]) == -1) {
                                            diagnostics.push(new vscode.Diagnostic(rules[j].range, 'Type error, points expected.', vscode.DiagnosticSeverity.Error));
                                        }
                                    }
                                }
                                if (!obj2[0] == '') {
                                    if (!obj2[0].match('^(([^\\.]*\\.[^\\.]*\\.[^\\.]*)|([^\\.]*\\.[^\\.]*)|(-?[0-9]+\\.?[0-9]*))$')) {
                                        diagnostics.push(new vscode.Diagnostic(rules[j].range, 'Invalid length/angle description. \nShould be like \'A.B\' or \'A.B.C\'.', vscode.DiagnosticSeverity.Error));
                                    }
                                    if (!obj2[0].match('^-?[0-9]+\\.?[0-9]*$')) {
                                        let obj21 = obj2[0].split('.');
                                        for (k=0; k<obj21.length; k++) {
                                            if (varFreePt.concat(varPoint).indexOf(obj21[k]) == -1) {
                                                diagnostics.push(new vscode.Diagnostic(rules[j].range, 'Type error, points expected.', vscode.DiagnosticSeverity.Error));
                                            }
                                        }
                                    }
                                }
                            }

                            else {
                                diagnostics.push(new vscode.Diagnostic(rules[j].range, 'Invalid rule.', vscode.DiagnosticSeverity.Error));
                            }
                        }
                    }

                    let getVar = lineCrt.match('^.*(?==)');
                    if (getVar) {

                        //check redefinitions
                        if (varAll.indexOf(getVar[0]) != -1 && getVar[0] != 'result') {
                            let varRegE = getVar[0]+'(?==)';
                            let rVarAll = dText.matchAll(RegExp(varRegE,'g'));
                            for (const match of rVarAll) {
                                let range = new vscode.Range(
                                    document.positionAt(match.index),
                                    document.positionAt(match.index + match[0].length)
                                );
                                diagnostics.push(new vscode.Diagnostic(range, 'Redifined variable or setting.', vscode.DiagnosticSeverity.Warning));
                            }
                        }
                        else {
                            varAll.push(getVar[0]);
                        }

                        if (lineCrt.match('=(Linepoint)?\\[')) {
                            varFreePt.push(getVar[0]);
                        }
                        else if (lineCrt.match('=(Intersect|Midpoint|EdgePoint|CenterPoint|PolarPoint)\\[')) {
                            varPoint.push(getVar[0]);
                        }
                        else if (lineCrt.match('=(Line|Ray|Parallel|Perp|ABisect|PBisect|FixAngle|CopyAngle|Tangent|PolarLine)\\[')) {
                            varLine.push(getVar[0]);
                        }
                        else if (lineCrt.match('=(Circle3|Compass|Circle)\\[')) {
                            varCircle.push(getVar[0]);
                        }
                        else if (lineCrt.match('=(Segment|ShiftSeg)\\[')) {
                            varSeg.push(getVar[0]);
                        }
                    }
                }
            }

            //TEST: find 'ERROR'
            let text = document.getText();
            let regex = /ERROR/g;
            let matches = text.matchAll(regex);
            for (const match of matches) {
                let range = new vscode.Range(
                    document.positionAt(match.index),
                    document.positionAt(match.index + match[0].length)
                );
                diagnostics.push(new vscode.Diagnostic(range, 'SyntaxError: Found "ERROR"', vscode.DiagnosticSeverity.Error));
            }
            
            diagnosticCollection.set(document.uri, diagnostics);
        }
      });

      return diagnosticCollection;
    }

    const diagnostic = provideDiagnostics();


    context.subscriptions.push(completion);
    context.subscriptions.push(outline);
    context.subscriptions.push(signhelp);
    context.subscriptions.push(hover);
    context.subscriptions.push(rename);
    context.subscriptions.push(diagnostic);

}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}