# 参考：ggb与gmt文件结构、语法

## 一、ggb文件

Geogebra的数据存储文件，后缀名.ggb，其实是一个zip，里面一般有以下文件：

`geogebra.xml` - 绘图的核心文件，下面会详述；

`geogebra_defaults2d.xml` - 2d模式下的预设文件，里面有默认点型、线型等，具体设置这里略；

`geogebra_defaults3d.xml` - 3d模式下的预设文件，跟2d的文件类似，具体设置这里略；

`geogebra_javascript.js` - 似乎是ggb程序的全局函数接口，不过一般用不上；

`geogebra_thumbnail.png` - ggb文档的缩略图，即保存文件时窗口中的图象。

有时会有以下文件：

`geogebra_macro.xml` - 宏文件，用于保存用户自定义的工具等；

---

下面稍微详细地介绍核心文件——geogebra.xml。

直接上示例：

```xml
<!--有很多省略，感兴趣者可以自行探究-->
<geogebra ...>

<!--控制程序gui的状态-->
<gui>
    ...
</gui>

<!--控制坐标系和网格的状态-->
<euclidianView>
    ...
    <coordSystem .../>
    ...
    <lineStyle axes= grid=/>
    <axis id="0" show="true" .../>
    <axis id="1" show="true" .../>
</euclidianView>

<!--其它功能，略过-->
<algebraView>
    ...
</algebraView>
<kernel>
    ...
</kernel>
...

<!--核心绘图部分-->
<construction title="" author="" date="">

    <!--element存储每一个对象的信息，type是对象类型（此处是点），label是对象名称，若有下标则用下划线连接，如“a_1”-->
    <element type="point" label="A">
        <!--控制显示状态-->
        <show object="true" label="true" ev="4"/>
        <!--条件，如下例为当布尔值a为true时显示对象-->
        <condition showObject="a"/>
        <!--对象颜色、透明度-->
        <objColor r="77" g="77" b="255" alpha="0.0"/>
        <!--对象图层-->
        <layer val="0"/>
        <!--对象模式？-->
        <labelMode val="0"/>
        <!--运动-->
        <animation step="0.1" speed="1" type="1" playing="false"/>
        <!--点径和样式-->
        <pointSize val="5"/>
        <pointStyle val="0"/>
        <!--位置，对于自由点和图形上的点来说很重要，而对于其他图形可能就是辅助绘图的作用-->
        <coords x="-52.83478338979716" y="-10.290286031896448" z="1.0"/>
    </element>

    <element ...>
        ...
    </element>

    <!--command绘图指令，即某一对象的作图来源，name为类型名，详见下文-->
    <command name="Circle">
        <!--input为父图形（对象），output为生成的图形（对象）-->
        <input a0="A" a1="B"/>
        <output a0="c"/>
    </command>
    <!--对于command中的output，一般都有一个element对应；自由点没有command-->

    <!--type为conic（圆锥曲线，这里是圆）的情况-->
    <element type="conic" label="c">
        <!--和点的属性差不多，省略-->
        ...
        <!--线的样式，包括粗细、线型、不透明度等-->
        <lineStyle thickness="5" type="0" typeHidden="1" opacity="178"/>
        <!--？未知用途-->
        <eqnStyle style="specific"/>
        <eigenvectors x0="1.0" y0="0.0" z0="1.0" x1="-0.0" y1="1.0" z1="1.0"/>
        <!--存储位置信息的矩阵，A2是一般式的常数项，A4和A5是圆心坐标的相反数-->
        <matrix A0="1.0" A1="1.0" A2="-13186.39405635661" A3="0.0" A4="52.83478338979716" A5="10.290286031896448"/>
    </element>
    ...
    <command name="Line">
        ...
    </command>
    <!--type为line（线）的情况-->
    <element type="line" label="f">
        <!--和圆的属性差不多，省略-->
        ...
        <!--存储线的位置，为一般式（ax+by+c=0）的a、b、c三项-->
        <coords x="249.25271993503958" y="294.4539903895778" z="-6564.85154844239"/>
    </element>

</construction>
</geogebra>

```

element的type类别还有“ray”（射线）、“segment”（线段）、“boolean”、“button”、“list”等等，而能进行gmt转换的只有前2种ray、segment以及示例中的3种point、line、conic（圆）。

---

关于command（ggb与gmt转换的核心，只有自由点没有这个属性。下面是一些实例用法，如果出现了其他的，那很可能是使用了一些不支持转换的绘制指令）：

```xml
<!--类型为 直线-->
<command name="Line">
    <!--a0为经过的第一点 P，a1为经过的第二点 A-->
    <input a0="P" a1="A" />
    <!--a0为该直线的名称 g-->
    <output a0="g" />
</command>
```

除了Line的其余一些类型（以下函数在readme中已有介绍，故从简）：

* Ray：射线，input：a0为端点，a1为经过的点
* Segment：线段，input：a0为第一个端点，a1为第二个端点
* Circle：圆
  * （三点圆）input：a0、a1、a2三点
  * （圆规）input：a0为圆心点，a1为线段或者长度（包括线段对象、“Segment[A, B]”及“Radius[c]”）
  * （圆）input：a0为圆心点，a1为圆上一点
* Point：对象上的点，input：a0为对象
* Intersect：交点
  * （单个）input：a0为第一个对象，a1为第二个对象，a2控制是哪个交点（线线交点没有a2）
  * （多个）
    * input：a0、a1同上，始终没有a2
    * output：如果是线圆、圆圆交点，通常有两个a0、a1；线线交点只有a0
* Midpoint：中点
  * （两点）input：a0为第一点，a1为第二点
  * （线段）input：a0为线段
* OrthogonalLine：垂线，input：a0为垂线上一点，a1为与其垂直的线
* LineBisector：中垂线，
  * （两点）input：a0为第一点，a1为第二点
  * （线段）input：a0为线段
* AngularBisetctor：角平分线
  * （三点）input：a0、a2分别为角两边上一点，a1为角的顶点；
  * （两线）
    * input：a0、a1两线
    * output：a0、a1两条角平分线
* Center：中心，input：a0为一圆
* Tangent：切线
  * （点）
    * input：a0为一点，a1为一圆
    * output：通常有a0、a1两个，如果点在圆上那么输出只有a0一个
  * （直线）
    * input：a0为一线，a1为一圆
    * output：为圆的与线平行的两切线，通常有a0、a1两个
* Polar：极线，input：a0为一点，a1为一圆
* Diameter：径线，
  * input：a0为一线，a1为一圆
  * output：a0为过圆心且垂直于线的垂线

以下为ggb中仿照gmt的自定义工具，详见后文

* PolarPoint：极点，input：a0为一线，a1为一圆
* EdgePoint：无穷远点
  * input：a0为一线
  * output：a0、a1两假想的点
* FixAngle：定值角，input：a0为角的顶点，a1为始边上一点，a2为逆时针的角度数
* CopyAngle：复制角，input：a0、a1、a2为被复制的角的边上一点、顶点和另一边上一点，a3、a4为复制后角的边上一点和顶点
* ShiftSeg：平移线段
  * input：a0为被平移的线段的一端点，a1为另一端点，a2为平移后的一端点
  * output：a0为一反向延长线段，a1为其另一顶点

---

## 二、gmt文件

游戏Euclidea的关卡预绘制文件，后缀名为.gmt。（猜测是“geometry”的缩写）

分为绘制和设定两部分，前者将全部的图形画出，后者决定每种模式下显示出的图形。

---

语法：

* **全局：**
  “#”在开头，表注释，一般于开头简述关卡名；
  “=”为赋值，意为“是”；
  变量名一般大写字母表示点，c+数字表示圆，s+数字表示直线或射线，S+数字表示线段（点过多时可使用A1,B1等，但谨防重名）；
  并列的对象间用半角逗号“,”隔开；
  "initial""result"等为关卡相关设定，下文有述。
* **预绘制：**
  变量习惯规则已述，按照逻辑顺序绘制。（需要注意的是，预绘制只是找出条件和所求作，不一定要按照题目限制和最简方法绘制，而有时为了避免这个文件泄露解法，建议**始终**不按照最简作法预绘制）

  * [x,y] - 平面中的点，动点（原点几乎在屏幕正中心，不同的是，其坐标系y轴正方向是**朝下**的）；
  * Line[A,B] - 过点A,B的直线；
  * Segment[A,B] - 线段AB；
  * Ray[A,B] - 从点A出发过点B的射线；
  * Circle[A,B] - 以点A为圆心，AB为半径的圆；
  * Compass[A,B,C] - 以点C为圆心，AB长为半径的圆；
  * Intersect[对象1,对象2,x,A?] - 两个对象的一个交点，
    * 关于x：
      * 两线交点x=0，线与圆交点、圆与圆交点x=0或1；
      * 若是线与圆，则按*线的方向*计数；若是圆与圆，则以（*此处*）连心线的绘制方向起逆时针计数；
      * *线的方向*情况很复杂，如：
        * 直线（射线，线段）：第一定义点至第二定义点的方向；
        * 垂线：参考线方向顺转90°；
        * 中垂线：参考线方向顺转90°；
        * 角平分线：角的开口方向；
        * 还有切线、极线等等，建议自己尝试；
    * 第四个参数猜测是作排除用，表示两对象非A点的另一个交点（一般用在移动对象时可能引起的参数x发生颠倒导致两点重叠等错误时），如果写了，参数x可能会被无视；不写不会引起歧义，可以省略或填写“-”；
  * Linepoint[对象,x] - 对象上一点，
    * 对象是圆，x为x轴正方向起的弧度，顺时针为正，逆时针为负（一般使用-pi到pi）；
    * 对象是线，x的情况很复杂，如：
      * 直线是以第一定义点为起点，按方向（*线的方向*见前）与两定义点间距离倍数；
      * 垂线（平行线）是以定义点为起点，按方向与被垂直（平行）的线定义点间距离倍数（可以一路迭代回去）；
      * 中垂线虽然也是按方向与两定义点间距离倍数，但是起点在顺转90°处；
      * 角平分线则是以顶点为起点，按方向与坐标系100单位长度倍数；
      * 切线是以切点为起点，按方向与切圆半径的倍数；
      * 还有一些，建议自己尝试；
  * Midpoint[A,B] - A、B的中点；
  * Perp[A,s1] - 过A作s1的垂线；
  * Parallel[A,s1] - 过A作s1的平行线；
  * FixAngle[A,B,x] - 以A为顶点，AB为始边作逆时针转过x度的射线（可能有精度问题，请慎用）；
  * ABisect[A,B,C] - 作角ABC的角平分线；
  * PBisect[A,B] - 作A、B的中垂线；
  * CenterPoint[c1] - 作圆c1的中心；
  * EdgePoint[s1,x] - 线s1上的无穷远点，x=0或1，分别为线负、正方向上假想的无穷远的点；
  * Tangent[A,c1,x] - 过A作c1的切线，x=0或1，从0到1依次为两个切点的顺序，从圆心到点逆时针数，[如图](img/p2.png)；
  * Circle3[A,B,C] - 过A、B、C三点作圆；
  * CopyAngle[A,B,C,D,E] - 以E为新顶点，D为新边上一点，复制角ABC，做出射线（需要注意方向，[如图](img/p1.png)）；
  * ShiftSeg[A,B,C] - 平移线段BA，使B到C的位置；
  * PolarLine[A,c1] - 作A关于圆c1的极线；
  * PolarPoint[s1,c1] - 作线s1关于圆c1的极点。
* **设定：**
  （default.realm中的用户操作函数此处不赘述）

  * check_level - 检查等级？，官方的关卡写在开头，作用不明；
  * ver - 等级？，也是官方的关卡写在开头，作用不明；
  * initial - 初始条件，刚开始黑实线显示的对象；
  * named - 带标签的初始条件，这里写了initial就可以不写；
  * hidden - 作图时隐藏的对象，在移动模式不隐藏（与movepoints有部分相似功能，所以一般不用）；
  * movepoints - 可移动点，本身就是动点（即自由点和图形上的点）且initial有的不必写，写的一般是initial没给，但条件范围可变的动点，如果无则不用写；
  * result - 所求，
    * 如果要求作出（程序判定）的和画面显示作出（橙色标亮）的不一致（一般是判直线而不判线段；标亮时一般连带题设等标出完整的图形），前后者中间加“:”；
    * 如果有多解则另起分开写；
  * explore - 探索界面显示的橙色标亮内容，一般是所求及其相关；
  * rules - 题目限制（限制题目给出图形的位置关系，就是有些题移动对象时会出现的红色虚线），
    * 例如，常用的有以下几种：
      * “对象1#对象2”表示两者必须相交；
      * “对象1/对象2”表示两者不能相交；
      * “A.B.C>90”表示角ABC须大于90度；
      * “A.B<C.D”表示AB长度须小于CD；
      * “|”表示“或”条件；
      * “,”表示“与”条件（运算级低于“|”）；
    * 当移动给出图形使题解全部不存在时，不必写；
    * 有必要写rules的情况：
      * （偷步）移动给出图形后，某一情况下能用更优解作出；
      * （漏解）移动给出图形后，某一情况下能作出部分解，但不能作出所有的解；
      * （不均）移动给出图形后，某一情况下不能用同一种（最优）解法作出所有的解；
      * （跳变）移动给出图形后，某一情况下的解result判定不出来，或是result判定的解与题意不符。

---

下面是一个示例，来自官方的13.10 - “Billinards on Round Table”：

```gmt
#BilliardsOnRoundTable
ver=1

O=[0,20]
P=[200,130]
M=Midpoint[O,P]
c1=Circle[O,P]
s1=Line[P,O]
A=Linepoint[s1,1.6]
B=Linepoint[s1,0.6]
r1=Segment[A,B]
s2=PBisect[A,B]
E=Intersect[s1,s2,0,-]
c2=Circle[E,B]
F=Intersect[s2,c2,1,-]
s3=Line[F,O]
G=Intersect[s3,c2,1,F]
s4=PBisect[G,O]
H=Intersect[s4,s1,0,-]
c3=Circle[H,O]
I=Intersect[c3,c1,1,-]
J=Intersect[c3,c1,0,I]

initial=c1

hidden=P

named=O,A,B

result=I
result=J

explore=I

rules=O#r1,O.M<O.H
```

以上所有结果皆由试验拟出，可能与实际有偏差，如果发现错误请指出。
