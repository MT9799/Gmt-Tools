import zipfile
import os
import xml.etree.ElementTree as ET
import tempfile
import random as r
import math as m

def isOnCircle(x,y,a,b,c):
    if round(x**2+2*b*x+y**2+2*c*y+a,10) == 0:
        return True
    else:
        return False

def process_zip_file(path, func):
    with tempfile.TemporaryDirectory() as temp_dir:
        with zipfile.ZipFile(path, 'r') as ref:
            ref.extractall(temp_dir)
        func(temp_dir)

def process_xml(xml_file):
    ele_dict, ele_rnm, com_list = {}, {}, {}
    gmt_text = '#The following generated content is for reference only.\n#The params of the linepoints are random. Please carefully adjust them after converting.\n#The game setting \'rules\' is inconvertible. Please complete them if need.\n'
    with open(xml_file+'/geogebra.xml', 'r', encoding='utf-8') as file:
        content = file.read()
    #print(content)
    root = ET.fromstring(content)
    constr = root.find('construction')

    if constr is not None:
        for comm in constr.findall('command'):
            c_name = comm.get('name')
            c_out0 = comm.find('output').get('a0')
            c_out1 = comm.find('output').get('a1')
            if c_out0 != '':
                com_list[c_out0] = c_name
            if c_out1 is not None and c_out1 != '':
                com_list[c_out1] = c_name

        cc, ln, el, sg, pt = 1, 1, 1, 1, 0
        loc = {}
        for elem in constr.findall('element'):
            elem_name = elem.get('label')
            elem_type = elem.get('type')
            ele_dict[elem_name] = elem_type

            if elem_type == 'point':
                loc[elem_name] = [float(elem.find('coords').get('x')), float(elem.find('coords').get('y'))]
                if pt < 26:
                    ele_rnm[elem_name] = chr(pt+65)
                else:
                    if pt%26 == 18:
                        pt += 1
                    ele_rnm[elem_name] = chr(pt%26+65)+str(pt//26)
                pt += 1
            elif elem_type in ['line', 'ray']:
                loc[elem_name] = [float(elem.find('coords').get('x')), float(elem.find('coords').get('y')), float(elem.find('coords').get('z'))]
                ele_rnm[elem_name] = 's'+str(ln)
                ln += 1
            elif elem_type == 'conic':
                loc[elem_name] = [float(elem.find('matrix').get('A2')), float(elem.find('matrix').get('A4')), float(elem.find('matrix').get('A5'))]
                ele_rnm[elem_name] = 'c'+str(cc)
                cc += 1
            elif elem_type == 'segment':
                loc[elem_name] = [float(elem.find('coords').get('x')), float(elem.find('coords').get('y')), float(elem.find('coords').get('z'))]
                ele_rnm[elem_name] = 'S'+str(sg)
                sg += 1
            

            if elem_name not in com_list:
                if elem.get('type') == 'point':
                    gmt_text += ele_rnm.get(elem_name)+'=['+elem.find('coords').get('x')+','+str(float(elem.find('coords').get('y'))*(-1))+']\n'
                #else: 
                    #gmt_text += '#Unknown figure: '+elem_type+' '+elem_name+'\n'
                    #print('Unknown figure: '+elem_type+'. Please check your board.')

        print(ele_dict)
        print(com_list)
        print(ele_rnm)

        apt, aln, acc, var_dic, var_dicp, hid = 1, 1, 1, {}, {}, []
        for comm in constr.findall('command'):
            c_in0 = comm.find('input').get('a0')
            c_in1 = comm.find('input').get('a1')
            c_in2 = comm.find('input').get('a2')
            c_in3 = comm.find('input').get('a3')
            c_in4 = comm.find('input').get('a4')
            c_in0p = ele_rnm.get(c_in0)
            c_in1p = ele_rnm.get(c_in1)
            c_in2p = ele_rnm.get(c_in2)
            c_in3p = ele_rnm.get(c_in3)
            c_in4p = ele_rnm.get(c_in4)
            c_out0 = comm.find('output').get('a0')
            c_out1 = comm.find('output').get('a1')
            c_out0p = ele_rnm.get(c_out0)
            c_out1p = ele_rnm.get(c_out1)
            c_nm = comm.get('name')
            var_dic[c_out0p] = [c_nm, c_in0, c_in1, c_in2, c_in3, c_in4]
            var_dicp[c_out0p] = [c_nm, c_in0p, c_in1p, c_in2p, c_in3p, c_in4p]
            if c_out0p is None:
                print('Invalid construction: '+str(var_dicp[c_out0p])+'.')
                continue
            if c_out1p is not None:
                var_dic[c_out1p] = [c_nm, c_in0, c_in1, c_in2, c_in3, c_in4]
                var_dicp[c_out1p] = [c_nm, c_in0p, c_in1p, c_in2p, c_in3p, c_in4p]
            
            if c_nm == 'Line':
                if ele_dict.get(c_in1) != 'point':
                    gmt_text += c_out0p+'=Parallel['+c_in0p+','+c_in1p+']\n'
                else:
                    gmt_text += c_out0p+'=Line['+c_in0p+','+c_in1p+']\n'
            elif c_nm == 'Ray':
                gmt_text += c_out0p+'=Ray['+c_in0p+','+c_in1p+']\n'
            elif c_nm == 'Segment':
                gmt_text += c_out0p+'=Segment['+c_in0p+','+c_in1p+']\n'
            elif c_nm == 'Circle':
                if c_in2 is not None:
                    gmt_text += c_out0p+'=Circle3['+c_in0p+','+c_in1p+','+c_in2p+']\n'
                    t_cp = 'pt'+str(apt)
                    hid.append(t_cp)
                    gmt_text += t_cp+'=CenterPoint['+c_out0p+']\n'
                    var_dic[c_out0p] = [c_nm, t_cp, c_in0, c_in1, c_in2, c_in3, c_in4]
                    var_dicp[c_out0p] = [c_nm, t_cp, c_in0p, c_in1p, c_in2p, c_in3p, c_in4p]
                    apt += 1
                elif c_in1[:7] == 'Segment':
                    br0 = c_in1.find('[')
                    br1 = c_in1.find(']')
                    cm = c_in1.find(', ')
                    gmt_text += c_out0p+'=Compass['+ele_rnm.get(c_in1[br0+1:cm])+','+ele_rnm.get(c_in1[cm+2:br1])+','+c_in0p+']\n'
                elif c_in1[:6] == 'Radius':
                    br0 = c_in1.find('[')
                    br1 = c_in1.find(']')
                    rd_c = c_in1[br0+1:br1]
                    rd_cp = ele_rnm.get(rd_c)
                    t_ct = var_dicp.get(rd_cp)[1]
                    if var_dicp.get(rd_cp)[4] is not None:
                        t_ct = var_dicp.get(rd_cp)[1]
                    if var_dicp.get(rd_cp)[3] is not None or ele_dict.get(var_dic.get(rd_cp)[2]) == 'point':
                        c_dp = var_dicp.get(rd_cp)[2]
                    else:
                        c_dp = 'pt'+str(apt)
                        gmt_text += c_dp+'=Linepoint['+rd_cp+',0]\n'
                        hid.append(c_dp)
                        apt += 1
                    gmt_text += c_out0p+'=Compass['+t_ct+','+c_dp+','+c_in0p+']\n'
                elif ele_dict.get(c_in1) != 'point':
                    if com_list.get(c_in1) == 'Segment':
                        gmt_text += c_out0p+'=Compass['+var_dicp.get(c_in1p)[1]+','+var_dicp.get(c_in1p)[2]+','+c_in0p+']\n'
                    elif com_list.get(c_in1) == 'ShiftSeg':
                        cp_cp = list(var_dicp.keys())[list(var_dicp.keys()).index(c_in1p)+1]
                        gmt_text += c_out0p+'=Compass['+var_dicp.get(c_in1p)[3]+','+cp_cp+','+c_in0p+']\n'
                else:
                    gmt_text += c_out0p+'=Circle['+c_in0p+','+c_in1p+']\n'
            elif c_nm == 'Point':
                if ele_dict.get(c_in0) == 'conic':
                    atan = m.atan((loc.get(c_in0)[2]+loc.get(c_out0)[1])/(loc.get(c_in0)[1]+loc.get(c_out0)[0]))
                    if loc.get(c_in0)[1]+loc.get(c_out0)[0] < 0:
                        if loc.get(c_in0)[2]+loc.get(c_out0)[1] > 0:
                            atan += m.pi
                        elif loc.get(c_in0)[2]+loc.get(c_out0)[1] < 0:
                            atan -= m.pi
                    gmt_text += c_out0p+'=Linepoint['+c_in0p+','+str(-atan)+']\n'
                else:
                    gmt_text += c_out0p+'=Linepoint['+c_in0p+','+str(r.randrange(20,80)/100)+']\n'
            elif c_nm == 'Intersect':
                if c_in2 is None:
                    if c_out1p is None:
                        gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',0]\n'
                    else:
                        if com_list.get(c_in0) in ['OrthogonalLine','LineBisector'] or com_list.get(c_in1) in ['OrthogonalLine','LineBisector']:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',1]\n'
                            gmt_text += c_out1p+'=Intersect['+c_in0p+','+c_in1p+',0]\n'
                        else:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',0]\n'
                            gmt_text += c_out1p+'=Intersect['+c_in0p+','+c_in1p+',1]\n'
                else:
                    oncc = 0
                    if (com_list.get(c_in0) == 'Line' and ele_dict.get(var_dic.get(c_in0p)[2]) == 'point') or com_list.get(c_in0) == 'Ray' or com_list.get(c_in0) == 'Segment':
                        if isOnCircle(loc.get(var_dic.get(c_in0p)[1])[0],loc.get(var_dic.get(c_in0p)[1])[1],loc.get(c_in1)[0],loc.get(c_in1)[1],loc.get(c_in1)[2]) == True:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',-,'+var_dicp.get(c_in0p)[1]+']\n'
                            oncc = 1
                        elif isOnCircle(loc.get(var_dic.get(c_in0p)[2])[0],loc.get(var_dic.get(c_in0p)[2])[1],loc.get(c_in1)[0],loc.get(c_in1)[1],loc.get(c_in1)[2]) == True:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',-,'+var_dicp.get(c_in0p)[2]+']\n'
                            oncc = 1
                    elif com_list.get(c_in0) == 'ShiftSeg':
                        if isOnCircle(loc.get(var_dic.get(c_in0p)[3])[0],loc.get(var_dic.get(c_in0p)[3])[1],loc.get(c_in1)[0],loc.get(c_in1)[1],loc.get(c_in1)[2]) == True:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',-,'+var_dicp.get(c_in0p)[3]+']\n'
                            oncc = 1
                    elif com_list.get(c_in0) == 'OrthogonalLine' or (com_list.get(c_in0) == 'Line' and ele_dict.get(var_dic.get(c_in0p)[2]) != 'point'):
                        if isOnCircle(loc.get(var_dic.get(c_in0p)[1])[0],loc.get(var_dic.get(c_in0p)[1])[1],loc.get(c_in1)[0],loc.get(c_in1)[1],loc.get(c_in1)[2]) == True:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',-,'+var_dicp.get(c_in0p)[1]+']\n'
                            oncc = 1
                    elif com_list.get(c_in0) == 'AngularBisector':
                        if isOnCircle(loc.get(var_dic.get(c_in0p)[2])[0],loc.get(var_dic.get(c_in0p)[2])[1],loc.get(c_in1)[0],loc.get(c_in1)[1],loc.get(c_in1)[2]) == True:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',-,'+var_dicp.get(c_in0p)[2]+']\n'
                            oncc = 1
                    elif (com_list.get(c_in1) == 'Line' and ele_dict.get(var_dic.get(c_in1p)[2]) == 'point') or com_list.get(c_in1) == 'Ray' or com_list.get(c_in1) == 'Segment':
                        if isOnCircle(loc.get(var_dic.get(c_in1p)[1])[0],loc.get(var_dic.get(c_in1p)[1])[1],loc.get(c_in0)[0],loc.get(c_in0)[1],loc.get(c_in0)[2]) == True:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',-,'+var_dicp.get(c_in1p)[1]+']\n'
                            oncc = 1
                        elif isOnCircle(loc.get(var_dic.get(c_in1p)[2])[0],loc.get(var_dic.get(c_in1p)[2])[1],loc.get(c_in0)[0],loc.get(c_in0)[1],loc.get(c_in0)[2]) == True:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',-,'+var_dicp.get(c_in1p)[2]+']\n'
                            oncc = 1
                    elif com_list.get(c_in1) == 'ShiftSeg':
                        if isOnCircle(loc.get(var_dic.get(c_in1p)[3])[0],loc.get(var_dic.get(c_in1p)[3])[1],loc.get(c_in0)[0],loc.get(c_in0)[1],loc.get(c_in0)[2]) == True:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',-,'+var_dicp.get(c_in1p)[3]+']\n'
                            oncc = 1
                    elif com_list.get(c_in1) == 'OrthogonalLine' or (com_list.get(c_in1) == 'Line' and ele_dict.get(var_dic.get(c_in1p)[2]) != 'point'):
                        if isOnCircle(loc.get(var_dic.get(c_in1p)[1])[0],loc.get(var_dic.get(c_in1p)[1])[1],loc.get(c_in0)[0],loc.get(c_in0)[1],loc.get(c_in0)[2]) == True:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',-,'+var_dicp.get(c_in1p)[1]+']\n'
                            oncc = 1
                    elif com_list.get(c_in1) == 'AngularBisector':
                        if isOnCircle(loc.get(var_dic.get(c_in1p)[2])[0],loc.get(var_dic.get(c_in1p)[2])[1],loc.get(c_in0)[0],loc.get(c_in0)[1],loc.get(c_in0)[2]) == True:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',-,'+var_dicp.get(c_in1p)[2]+']\n'
                            oncc = 1
                    elif com_list.get(c_in0) == 'Circle' and var_dic.get(c_in0p)[3] is None and ele_dict.get(var_dic.get(c_in0p)[2]) == 'point':
                        if isOnCircle(loc.get(var_dic.get(c_in0p)[2])[0],loc.get(var_dic.get(c_in0p)[2])[1],loc.get(c_in1)[0],loc.get(c_in1)[1],loc.get(c_in1)[2]) == True:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',-,'+var_dicp.get(c_in0p)[2]+']\n'
                            oncc = 1
                    elif com_list.get(c_in1) == 'Circle' and var_dic.get(c_in1p)[3] is None and ele_dict.get(var_dic.get(c_in1p)[2]) == 'point':
                        if isOnCircle(loc.get(var_dic.get(c_in1p)[2])[0],loc.get(var_dic.get(c_in1p)[2])[1],loc.get(c_in0)[0],loc.get(c_in0)[1],loc.get(c_in0)[2]) == True:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',-,'+var_dicp.get(c_in1p)[2]+']\n'
                            oncc = 1
                    elif com_list.get(c_in0) == 'Circle' and var_dic.get(c_in0p)[3] is not None:
                        if isOnCircle(loc.get(var_dic.get(c_in0p)[2])[0],loc.get(var_dic.get(c_in0p)[2])[1],loc.get(c_in1)[0],loc.get(c_in1)[1],loc.get(c_in1)[2]) == True:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',-,'+var_dicp.get(c_in0p)[2]+']\n'
                            oncc = 1
                        elif isOnCircle(loc.get(var_dic.get(c_in0p)[3])[0],loc.get(var_dic.get(c_in0p)[3])[1],loc.get(c_in1)[0],loc.get(c_in1)[1],loc.get(c_in1)[2]) == True:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',-,'+var_dicp.get(c_in0p)[3]+']\n'
                            oncc = 1
                        elif isOnCircle(loc.get(var_dic.get(c_in0p)[4])[0],loc.get(var_dic.get(c_in0p)[4])[1],loc.get(c_in1)[0],loc.get(c_in1)[1],loc.get(c_in1)[2]) == True:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',-,'+var_dicp.get(c_in0p)[4]+']\n'
                            oncc = 1
                    elif com_list.get(c_in1) == 'Circle' and var_dic.get(c_in1p)[3] is not None:
                        if isOnCircle(loc.get(var_dic.get(c_in1p)[2])[0],loc.get(var_dic.get(c_in1p)[2])[1],loc.get(c_in0)[0],loc.get(c_in0)[1],loc.get(c_in0)[2]) == True:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',-,'+var_dicp.get(c_in1p)[2]+']\n'
                            oncc = 1
                        elif isOnCircle(loc.get(var_dic.get(c_in1p)[3])[0],loc.get(var_dic.get(c_in1p)[3])[1],loc.get(c_in0)[0],loc.get(c_in0)[1],loc.get(c_in0)[2]) == True:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',-,'+var_dicp.get(c_in1p)[3]+']\n'
                            oncc = 1
                        elif isOnCircle(loc.get(var_dic.get(c_in1p)[4])[0],loc.get(var_dic.get(c_in1p)[4])[1],loc.get(c_in0)[0],loc.get(c_in0)[1],loc.get(c_in0)[2]) == True:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+',-,'+var_dicp.get(c_in1p)[4]+']\n'
                            oncc = 1
                    if oncc == 0:
                        if com_list.get(c_in0) in ['OrthogonalLine','LineBisector'] or com_list.get(c_in1) in ['OrthogonalLine','LineBisector']:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+','+str(2-int(c_in2))+']\n'
                        else:
                            gmt_text += c_out0p+'=Intersect['+c_in0p+','+c_in1p+','+str(int(c_in2)-1)+']\n'
            elif c_nm == 'Midpoint':
                if c_in1 is None:
                    if com_list.get(c_in0) == 'Segment':
                        gmt_text += c_out0p+'=Midpoint['+var_dicp.get(c_in0p)[1]+','+var_dicp.get(c_in0p)[2]+']\n'
                    elif com_list.get(c_in0) == 'ShiftSeg':
                        mp_cp = list(var_dicp.keys())[list(var_dicp.keys()).index(c_in0p)+1]
                        gmt_text += c_out0p+'=Midpoint['+var_dicp.get(c_in0p)[3]+','+mp_cp+']\n'
                else:
                    gmt_text += c_out0p+'=Midpoint['+c_in0p+','+c_in1p+']\n'
            elif c_nm == 'OrthogonalLine':
                gmt_text += c_out0p+'=Perp['+c_in0p+','+c_in1p+']\n'
            elif c_nm == 'LineBisector':
                if c_in1 is None:
                    if com_list.get(c_in0) == 'Segment':
                        gmt_text += c_out0p+'=PBisect['+var_dicp.get(c_in0p)[1]+','+var_dicp.get(c_in0p)[2]+']\n'
                    elif com_list.get(c_in0) == 'ShiftSeg':
                        lb_cp = list(var_dicp.keys())[list(var_dicp.keys()).index(c_in0p)+1]
                        gmt_text += c_out0p+'=PBisect['+var_dicp.get(c_in0p)[3]+','+lb_cp+']\n'
                else:
                    gmt_text += c_out0p+'=PBisect['+c_in0p+','+c_in1p+']\n'
            elif c_nm == 'AngularBisector':
                if c_in2 is None:
                    if c_out1p is not None:
                        ab_p = 'pt'+str(apt)
                        gmt_text += ab_p+'=Intersect['+c_in0p+','+c_in1p+',0]\n'
                        hid.append(ab_p)
                        apt += 1
                        ab_ep00 = 'pt'+str(apt)
                        gmt_text += ab_ep00+'=EdgePoint['+c_in0p+',0]\n'
                        hid.append(ab_ep00)
                        apt += 1
                        ab_ep01 = 'pt'+str(apt)
                        gmt_text += ab_ep01+'=EdgePoint['+c_in0p+',1]\n'
                        hid.append(ab_ep01)
                        apt += 1
                        ab_ep10 = 'pt'+str(apt)
                        gmt_text += ab_ep10+'=EdgePoint['+c_in1p+',0]\n'
                        hid.append(ab_ep10)
                        apt += 1
                        ab_ep11 = 'pt'+str(apt)
                        gmt_text += ab_ep11+'=EdgePoint['+c_in1p+',1]\n'
                        hid.append(ab_ep11)
                        apt += 1
                        gmt_text += c_out0p+'=ABisect['+ab_ep00+','+ab_p+','+ab_ep10+']\n'
                        gmt_text += c_out1p+'=ABisect['+ab_ep01+','+ab_p+','+ab_ep10+']\n'
                    else:
                        ab_lp = 'pt'+str(apt)
                        gmt_text += ab_lp+'=Linepoint['+c_in0p+',0]\n'
                        hid.append(ab_lp)
                        apt += 1
                        ab_l = 'ln'+str(aln)
                        gmt_text += ab_l+'=Perp['+ab_lp+','+c_in0p+']\n'
                        hid.append(ab_l)
                        aln += 1
                        ab_p = 'pt'+str(apt)
                        gmt_text += ab_p+'=Intersect['+ab_l+','+c_in1p+',0]\n'
                        hid.append(ab_p)
                        apt += 1
                        ab_mp = 'pt'+str(apt)
                        gmt_text += ab_mp+'=Midpoint['+ab_lp+','+ab_p+']\n'
                        hid.append(ab_mp)
                        apt += 1
                        gmt_text += c_out0p+'=Perp['+ab_mp+','+ab_l+']\n'
                    #gmt_text += '#Invalid a_bisect tool: '+c_out0+'=ABisect['+c_in0p+','+c_in1p+',0]\n'
                    #gmt_text += '#Invalid a_bisect tool: '+c_out1+'=ABisect['+c_in0p+','+c_in1p+',1]\n'
                    #print('Can\'t convert the a_bisect tool used on 2 lines.')
                else:
                    gmt_text += c_out0p+'=ABisect['+c_in0p+','+c_in1p+','+c_in2p+']\n'
            elif c_nm == 'Center':
                gmt_text += c_out0p+'=CenterPoint['+c_in0p+']\n'
            elif c_nm == 'Tangent':
                if ele_dict.get(c_in0) != 'point':
                    t_cp = var_dicp.get(c_in1p)[1]
                    if var_dicp.get(c_in1p)[4] is not None:
                        t_cp = var_dicp.get(c_in1p)[1]
                    gmt_text += 'ln'+str(aln)+'=Perp['+t_cp+','+c_in0p+']\n'
                    hid.append('ln'+str(aln))
                    gmt_text += 'pt'+str(apt)+'=Intersect['+'ln'+str(aln)+','+c_in1p+',0]\n'
                    hid.append('pt'+str(apt))
                    apt += 1
                    gmt_text += 'pt'+str(apt)+'=Intersect['+'ln'+str(aln)+','+c_in1p+',1]\n'
                    hid.append('pt'+str(apt))
                    gmt_text += c_out0p+'=Tangent['+'pt'+str(apt-1)+','+c_in1p+',0]\n'
                    gmt_text += c_out1p+'=Tangent['+'pt'+str(apt)+','+c_in1p+',1]\n'
                    apt += 1
                    aln += 1
                else:
                    gmt_text += c_out0p+'=Tangent['+c_in0p+','+c_in1p+',0]\n'
                    if c_out1p is not None:
                        gmt_text += c_out1p+'=Tangent['+c_in0p+','+c_in1p+',1]\n'
            elif c_nm == 'Polar':
                #if ele_dict.get(c_in0) != 'point':
                    #gmt_text += '#Invalid polarline tool: '+c_out0+'=PolarLine['+c_in0p+','+c_in1p+',0]\n'
                    #print('Can\'t convert the polarline tool used on a line.')
                #else:
                gmt_text += c_out0p+'=PolarLine['+c_in0p+','+c_in1p+']\n'
            elif c_nm == 'PolarPoint':
                gmt_text += c_out0p+'=PolarPoint['+c_in0p+','+c_in1p+']\n'
            elif c_nm == 'ShiftSeg':
                gmt_text += c_out0p+'=ShiftSeg['+c_in0p+','+c_in1p+','+c_in2p+']\n'
                gmt_text += 'cc'+str(acc)+'=Compass['+c_in0p+','+c_in1p+','+c_in2p+']\n'
                gmt_text += c_out1p+'=Intersect[cc'+str(acc)+','+c_out0p+',1]\n'
                hid.append('cc'+str(acc))
                acc += 1
            elif c_nm == 'CopyAngle':
                gmt_text += c_out0p+'=CopyAngle['+c_in0p+','+c_in1p+','+c_in2p+','+c_in3p+','+c_in4p+']\n'
            elif c_nm == 'FixAngle':
                gmt_text += c_out0p+'=FixAngle['+c_in0p+','+c_in1p+','+c_in2[:-1]+']\n'
            elif c_nm == 'EdgePoint':
                gmt_text += c_out0p+'=EdgePoint['+c_in0p+',0]\n'
                gmt_text += c_out1p+'=EdgePoint['+c_in0p+',1]\n'
            elif c_nm == 'Diameter':
                d_ct = var_dicp.get(c_in1p)[1]
                if var_dicp.get(c_in1p)[4] is not None:
                    d_ct = var_dicp.get(c_in1p)[1]
                gmt_text += c_out0p+'=Perp['+d_ct+','+c_in0p+']\n'             
                
            else:
                gmt_text += '#Unknown construction tool: '+c_nm+'.\n'
                print('Unknown construction: '+c_nm+'. Please check your ggb file.')

        ini, nmd, mpt, expl, rst, disp = '', '', '', '', {}, {}
        for exp in constr.findall('expression'):
            lbl = exp.get('label')
            obj = exp.get('exp')
            if obj != '{}':
                objp = obj[1:][:-1].split(', ')
                objpp = [ele_rnm.get(i) for i in objp]
                objppp = ','.join(i for i in objpp)
                if lbl == 'initial':
                    ini += 'initial='+ objppp
                elif lbl == 'named':
                    nmd += 'named='+ objppp
                elif lbl == 'movepoints':
                    mpt += 'movepoints='+ objppp
                elif lbl == 'explore':
                    expl += 'explore='+ objppp
                elif lbl[:6] == 'result':
                    rst[lbl[6:]] = objppp
                elif lbl[:7] == 'display':
                    disp[lbl[7:]] = objppp
                
                    

    #print(gmt_text)
    #gmt_text += '\n\ninitial='+",".join(i for i in list(ele_rnm.values()))+'\n'
    if ini != '':
        gmt_text += '\n'+ini+'\n'
    else:
        gmt_text += '\n#initial=\n'
    if nmd != '':
        gmt_text += '\n'+nmd+'\n'
    else:
        gmt_text += '\n#named=\n'
    if hid != []:
        gmt_text += '\nhidden='+",".join(i for i in hid)+'\n'
    else:
        gmt_text += '\n#hidden=\n'
    if mpt != '':
        gmt_text += '\n'+mpt+'\n'
    else:
        gmt_text += '\n#movepoints=\n'
    if rst != {}:
        for i in rst:
            if disp.get(i):
                gmt_text += '\nresult='+rst.get(i)+':'+disp.get(i)
            else:
                gmt_text += '\nresult='+rst.get(i)
        gmt_text += '\n'
    else:
        gmt_text += '\n#result=\n'
    if expl != '':
        gmt_text += '\n'+expl+'\n'
    else:
        gmt_text += '\n#explore=\n'
    gmt_text += '\n#rules='
    output_gmt(gmt_text)

def output_gmt(text):
    global filename
    with open(filename+".gmt",'a') as f:
        f.truncate(0)
        f.write(text)


path_list=os.listdir('./')
for ggb_path in path_list:
    filename = os.path.splitext(ggb_path)[0]
    if os.path.splitext(ggb_path)[1] == '.ggb':
        process_zip_file(ggb_path, process_xml)


print('Successfully converted!')
input('press enter to exit')
