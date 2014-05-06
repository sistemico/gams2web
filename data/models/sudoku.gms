$title '{{ title }}';
$inlinecom /* */

sets

i      'filas' /1*9/,
j      'columnas' /1*9/ ,
k      'numeros' /1*9 / ,
i1(i) /1*3/     ,
i2(i) /4*6/,
i3(i) /7*9/,
j1(j) /1*3/     ,
j2(j) /4*6/,
j3(j) /7*9/;

Variables
y(i,j,k), z;

EQUATIONS

asigfila(i,k), asigcol(j,k), asignum (i,j),
asigcel1(k),  asigcel2(k), asigcel3(k),  asigcel4(k), asigcel5(k),
asigcel6(k),  asigcel7(k),  asigcel8(k), asigcel9(k), obj;

asigfila(i,k).. sum(j, y(i,j,k)) =E=1;
asigcol(j,k).. sum(i, y(i,j,k)) =E=1;
asignum(i,j).. sum (k, y(i,j,k)) =E=1;
asigcel1(k)..  sum( (i1,j1), y (i1, j1,k) )=E=1;
asigcel2(k)..  sum( (i1,j2), y (i1, j2,k) )=E=1;
asigcel3(k)..  sum( (i1,j3), y (i1, j3,k) )=E=1;
asigcel4(k)..  sum( (i2,j1), y (i2, j1,k) )=E=1;
asigcel5(k)..  sum( (i2,j2), y (i2, j2,k) )=E=1;
asigcel6(k)..  sum( (i2,j3), y (i2, j3,k) )=E=1;
asigcel7(k)..  sum( (i3,j1), y (i3, j1,k) )=E=1;
asigcel8(k)..  sum( (i3,j2), y (i3, j2,k) )=E=1;
asigcel9(k)..  sum( (i3,j3), y (i3, j3,k) )=E=1;
obj..   z=G= y('1','2','3');
Model sudocu /All/;
y.lo(i,j,k)=0;
y.up(i,j,k)=1;
$ontext
here enter data
y.fx('1','3','1')=1;      y.fx('1','4','2')=1;   y.fx('1','5','5')=1;
y.fx('1','7','3')=1;      y.fx('2','1','2')=1;   y.fx('2','2','5')=1;
y.fx('2','4','6')=1;      y.fx('2','6','7')=1;   y.fx('2','9','9')=1;
y.fx('3','1','9')=1;      y.fx('3','5','8')=1;   y.fx('3','6','4')=1;
y.fx('3','9','2')=1;      y.fx('4','4','4')=1;   y.fx('5','3','8')=1;
y.fx('5','5','9')=1;      y.fx('5','7','1')=1;   y.fx('6','6','8')=1;
y.fx('7','1','8')=1;      y.fx('7','4','3')=1;   y.fx('7','5','7')=1;
y.fx('7','9','1')=1;      y.fx('8','1','7')=1;   y.fx('8','4','9')=1;
y.fx('8','6','6')=1;      y.fx('8','8','8')=1;   y.fx('8','9','4')=1;
y.fx('9','3','9')=1;      y.fx('9','5','4')=1;   y.fx('9','6','5')=1;
y.fx('9','7','6')=1;
$offtext

{# TODO: Render parameters
{% for row in rows %}
    {% for column in columns %}
        y.fx('{{ row }}','{{ column }}','{{ value[row][column] }}')=1;
    {% endfor %}
{% endfor %}
#}

y.fx('1','1','2')=1;      y.fx('1','4','3')=1;   y.fx('1','8','8')=1;
y.fx('2','1','5')=1;      y.fx('2','4','6')=1;   y.fx('2','8','7')=1;
y.fx('3','1','9')=1;      y.fx('3','4','8')=1;   y.fx('3','8','1')=1;
y.fx('4','3','7')=1;      y.fx('4','5','1')=1;   y.fx('4','7','5')=1;
y.fx('5','3','3')=1;      y.fx('5','7','8')=1;   y.fx('6','3','6')=1;
y.fx('6','5','4')=1;      y.fx('6','7','9')=1;   y.fx('7','2','1')=1;
y.fx('7','6','5')=1;      y.fx('7','9','6')=1;   y.fx('8','2','8')=1;
y.fx('8','6','9')=1;      y.fx('8','9','2')=1;   y.fx('9','2','4')=1;
y.fx('9','6','7')=1;      y.fx('9','9','8')=1;


solve sudocu  USING NLP minimising z;
