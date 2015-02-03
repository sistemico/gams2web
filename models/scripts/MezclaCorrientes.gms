$title 'Modelo cambio de fase - Javier Francesconi';
$inlinecom /* */

sets
 pcpidg 'coef for ideal gas heat capacity'  /D1, D2, D3, D4, D5/,
 il     'phase liquid  components' /H2O/;

SET  stgen  corrientes liquida o gaseosa del sistema
         /W_Ent1,W_Ent2,W_Sal/;

table Coef_cpV(il, *) ideal gas heat capacity
         A                 B                       C                       D                       E
H2O     33.6490177383234  -5.72320874595774e-003   2.31625795026247e-005  -1.17168073811224e-008   1.87687669336460e-012;

table data(il, *)
         PM       Tc       Pc      Vc       Vdif    dHForm
H2O      18.015   647.3   221.2     57.1    13.10  -241000;

table vapAntoine(il, *) vapor pressure data
          tmin    tmax       A         B         C    D         E            F
H2O        1.85   374.15    65.9278   -7227.53   0   -7.17695   4.03E-06     2;

table Coef_cpL(il, *) liquid heat capacity
       tmin    tmax     A       B         C          D          E
H2O    160.05  389    276.37   -2.09010   8.13E-03  -1.41E-05   9.37E-09;

table Coef_Hvap(il, *) 'entalpia de vaporizacion kJ/kgmol'
          tmin    tmax      A       B         C            D           E
H2O       160.05  512.92    52053   0.3199   -0.2119999    0.25795    -8.78E-13;


SCALARS
*Constantes
Rg    'cal/mol/K'   /1.987/,
Rgbis 'cm3 atm mol-1 K-1'  /0.082057e3/,
PI                /3.141592654/,
Tref              /298.16/,
scT   'Escalado de Temperaturas';

PI=4*arctan(1);
scT=1000;

Variables
Ftlgen(stgen),
Flgen(il,stgen),
z(il,stgen)      'Fraccion molar del compuesto i en la corriente liquida strl',
Ptotal         'Presion total del sistema (atm)',
Ts(il)         'Temperatura de saturacion del compuesto il a la presion Ptotal (K)',
Tstream(stgen)        'Temperatura de la corriente liquida (K)',
minT_Tb(stgen),
maxT_Tr(stgen),
max0_difTTb(stgen),
min0_difTrT(stgen),
frac_vapor(stgen),
frac_vapor2(stgen),
vaux1(stgen),
vaux2(stgen),
absdifTTb(stgen),
absdifTTr(stgen),
Hgen(stgen),
Hgenil(il,stgen),
Hliq(il,stgen),
Hvap(il,stgen),
Hv(il),
deltaHvap(il),
pfdHvap(il,stgen),
Tb(stgen),
Tr(stgen),
pfvTstr(stgen),
pfvTb(stgen),
pfvTr(stgen),
pFH(il,stgen),
*Reacciones
FO,FO2,FO3;

EQUATIONS
eqTs(il),eqDeltaHvap(il),
eqXgen(il,stgen),eqFtlgen(stgen),
eqHgen(stgen),
eqHgen1(il,stgen),eqHgen2(il,stgen),eqHgen3(il,stgen),eqHgen4(stgen),eqHgen5(stgen),
eqHgen6(stgen),eqHgen7(stgen),eqHgen8(stgen),eqHgen9(stgen),eqHgen10(stgen),eqHgen11(stgen),
eqHgen12(stgen),eqHgen13(stgen),eqHgen14(stgen),eqHgen15(stgen),eqHgen16(stgen),
eqHgen8_r1(stgen),eqHgen9_r1(stgen),eqHgen17(stgen),
eqXgen(il,stgen),
eqFtlgen(stgen),
eqBM(il),
eqBE,
eqHgen_c1(il,stgen),
eqHgen1_c1(il,stgen),
eqHgen1_c2(il,stgen)
eqObj1,eqObj2;

*--- Bloque de Ecuaciones ------------------------------------------------------
*eqTs('H2O').. Ts('H2O')=e=0.426776e2+ (-0.389270e4/(LOG(Ptotal*0.101325)+(-0.948654e1)));
*eqTsW.. LOG(Ptotal*101.325)=e= 65.9278 + (-7227.53)/Ts_W + (-7.17695)*LOG(Ts_W)+ 4.03E-06*Ts_W**2;
*eqTs('EtOL').. LOG(Ptotal*101.325)=e= 86.486 + (-7931.1)/Ts('EtOL') +(-10.2498)*LOG(Ts('EtOl))+ 6.39E-06*POWER(Ts('EtOl'),2);
eqTs(il).. LOG(Ptotal*101.325)=e= vapAntoine(il, 'A')+vapAntoine(il,'B')/(vapAntoine(il, 'C')+Ts(il)*scT)
                                  +vapAntoine(il,'D')*LOG(Ts(il)*scT)+vapAntoine(il,'E')*POWER(Ts(il)*scT,vapAntoine(il,'F'));

eqDeltaHvap(il).. deltaHvap(il)*1000 =e= EXP(LOG(Coef_Hvap(il,'A'))
                      + LOG(1 - (Ts(il)*scT/data(il,'Tc')))*(Coef_Hvap(il,'B')
                      + Coef_Hvap(il,'C')*(Ts(il)*scT/data(il,'Tc'))
                      + Coef_Hvap(il,'D')*POWER((Ts(il)*scT/data(il,'Tc')),2)
                      + Coef_Hvap(il,'E')*POWER((Ts(il)*scT/data(il,'Tc')),3)));

eqXgen(il,stgen)..  z(il,stgen)*Ftlgen(stgen) =e= Flgen(il,stgen);
*eqXgen(il,stgen).. 0=E=0;
eqFtlgen(stgen)..   Ftlgen(stgen)=e= SUM(il,Flgen(il,stgen));

*eqHgen1(stgen).. Hgen(stgen)*3600=e=HvapTs(stgen)-Hliq(stgen)-frac_vapor(stgen)*deltaHvap('H2O')+Hvap(stgen);
eqHgen(stgen)..   Hgen(stgen)*3600=e= SUM(il,pFH(il,stgen));
*eqHgen(stgen)..   Hgen(stgen)*3600=e= SUM(il,Flgen(il,stgen)*Hgenil(il,stgen));
eqHgen_c1(il,stgen)..   SQR(Flgen(il,stgen))+2*pFH(il,stgen)+SQR(Hgenil(il,stgen))=e=SQR(Flgen(il,stgen)+Hgenil(il,stgen));;
*eqHgen1(il,stgen).. Hgenil(il,stgen)=e=Hvap(il,stgen)+Hliq(il,stgen)-deltaHvap(il)+frac_vapor2(stgen)*frac_vapor(stgen)*deltaHvap(il);
eqHgen1(il,stgen).. 0=E=0;
eqHgen1_c1(il,stgen).. Hgenil(il,stgen)=e=Hvap(il,stgen)+Hliq(il,stgen)-deltaHvap(il)+pfdHvap(il,stgen);
eqHgen1_C2(il,stgen).. SQR(frac_vapor(stgen))+2*pfdHvap(il,stgen)+SQR(deltaHvap(il))=e=SQR(frac_vapor(stgen)+deltaHvap(il));

$ontext
eqHgen2(stgen).. Hliq(stgen)*1000 =e= (Coef_cpL('H2O','A')*(minT_Tb(stgen)-Tref)
                            +Coef_cpL('H2O','B')*(POWER(minT_Tb(stgen),2)-Tref**2)/2
                            +Coef_cpL('H2O','C')*(POWER(minT_Tb(stgen),3)-Tref**3)/3
                            +Coef_cpL('H2O','D')*(POWER(minT_Tb(stgen),4)-Tref**4)/4
                            +Coef_cpL('H2O','E')*(POWER(minT_Tb(stgen),5)-Tref**5)/5);

eqHgen3_1(stgen).. HvapTs(stgen)*1000=e=(Coef_cpV('H2O','A')*(Ts('H2O')-Tref)
                            +Coef_cpV('H2O','B')*(POWER(Ts('H2O'),2)-SQR(Tref))/2
                            +Coef_cpV('H2O','C')*(POWER(Ts('H2O'),3)-POWER(Tref,3))/3
                            +Coef_cpV('H2O','D')*(POWER(Ts('H2O'),4)-POWER(Tref,4))/4
                            +Coef_cpV('H2O','E')*(POWER(Ts('H2O'),5)-POWER(Tref,5))/5);


$offtext
eqHgen2(il,stgen).. Hliq(il,stgen)*1000 =e= (Coef_cpL(il,'A')*(minT_Tb(stgen)*scT-Ts(il)*scT)
                            +Coef_cpL(il,'B')*(POWER(minT_Tb(stgen)*scT,2)-POWER(Ts(il)*scT,2))/2
                            +Coef_cpL(il,'C')*(POWER(minT_Tb(stgen)*scT,3)-POWER(Ts(il)*scT,3))/3
                            +Coef_cpL(il,'D')*(POWER(minT_Tb(stgen)*scT,4)-POWER(Ts(il)*scT,4))/4
                            +Coef_cpL(il,'E')*(POWER(minT_Tb(stgen)*scT,5)-POWER(Ts(il)*scT,5))/5);

eqHgen3(il,stgen).. Hvap(il,stgen)*1000=e=data(il,'dHForm')+(Coef_cpV(il,'A')*(maxT_Tr(stgen)*scT-Tref)
                            +Coef_cpV(il,'B')*(POWER(maxT_Tr(stgen)*scT,2)-POWER(Tref,2))/2
                            +Coef_cpV(il,'C')*(POWER(maxT_Tr(stgen)*scT,3)-POWER(Tref,3))/3
                            +Coef_cpV(il,'D')*(POWER(maxT_Tr(stgen)*scT,4)-POWER(Tref,4))/4
                            +Coef_cpV(il,'E')*(POWER(maxT_Tr(stgen)*scT,5)-POWER(Tref,5))/5);

*eqHgen4(stgen).. POWER(Tstream(stgen)-Ts('H2O'),2)=e=4*POWER(0.5*Tstream(stgen)+0.5*Ts('H2O')-minT_Tb(stgen),2);
*eqHgen5(stgen).. POWER(Tstream(stgen)-Ts('H2O'),2)=e=4*POWER(maxT_Tr(stgen)-0.5*Tstream(stgen)-0.5*Ts('H2O'),2);
*eqHgen6(stgen).. POWER(Tstream(stgen)-Ts('H2O'),2)=e=4*POWER(max0_difTTb(stgen)-0.5*Tstream(stgen)+0.5*Ts('H2O'),2);
*eqHgen7(stgen).. POWER(Ts('H2O')-Tstream(stgen),2)=e=4*POWER(0.5*Ts('H2O')-0.5*Tstream(stgen)-min0_difTrT(stgen),2);

*eqHgen4(stgen).. minT_Tb(stgen)=e=0.5*Tstream(stgen)+0.5*Tb(stgen)-SQRT(POWER(Tstream(stgen)-Tb(stgen),2)/4+1e-6)+SQRT(1e-6);
*eqHgen5(stgen).. maxT_Tr(stgen)=e=0.5*Tstream(stgen)+0.5*Tr(stgen)+SQRT(POWER(Tstream(stgen)-Tr(stgen),2)/4+1e-6)-SQRT(1e-6);
*eqHgen6(stgen).. max0_difTTb(stgen)=e=0.5*Tstream(stgen)-0.5*Tr(stgen)+SQRT(POWER(Tstream(stgen)-Tb(stgen),2)/4+1e-6)-SQRT(1e-6);
*eqHgen7(stgen).. min0_difTrT(stgen)=e=0.5*Tb(stgen)-0.5*Tstream(stgen)-SQRT(POWER(Tr(stgen)-Tstream(stgen),2)/4+1e-6)+SQRT(1e-6);

eqHgen4(stgen).. minT_Tb(stgen)=e=0.5*Tstream(stgen)+0.5*Tb(stgen)-absdifTTb(stgen);
eqHgen5(stgen).. maxT_Tr(stgen)=e=0.5*Tstream(stgen)+0.5*Tr(stgen)+absdifTTr(stgen);
eqHgen6(stgen).. max0_difTTb(stgen)=e=0.5*Tstream(stgen)-0.5*Tb(stgen)+absdifTTb(stgen);
eqHgen7(stgen).. min0_difTrT(stgen)=e=0.5*Tr(stgen)-0.5*Tstream(stgen)-absdifTTr(stgen);


eqHgen8(stgen).. vaux1(stgen)=e=max0_difTTb(stgen)-frac_vapor(stgen)*(Tstream(stgen)-Tb(stgen));
eqHgen9(stgen).. vaux2(stgen)=e=min0_difTrT(stgen)-frac_vapor(stgen)*(Tr(stgen)-Tstream(stgen));
*eqHgen8(stgen).. vaux1(stgen)=e=max0_difTTb(stgen)-frac_vapor(stgen)*(Tstream(stgen)-Tb(stgen))+Tstream(stgen)-Tb(stgen);
*eqHgen9(stgen).. vaux2(stgen)=e=min0_difTrT(stgen)-frac_vapor(stgen)*(Tr(stgen)-Tstream(stgen))-Tstream(stgen)+Tr(stgen);
*eqHgen8(stgen).. 0=e=0;
*eqHgen9(stgen).. 0=e=0;

eqHgen8_r1(stgen).. vaux1(stgen)=e=max0_difTTb(stgen)-pfvTstr(stgen)+pfvTb(stgen);
eqHgen9_r1(stgen).. vaux2(stgen)=e=min0_difTrT(stgen)-pfvTr(stgen)+pfvTstr(stgen);

*eqHgen8_r1(stgen).. vaux1(stgen)=e=max0_difTTb(stgen)-pfvTstr(stgen)+pfvTb(stgen)+Tstream(stgen)-Tb(stgen);
*eqHgen9_r1(stgen).. vaux2(stgen)=e=min0_difTrT(stgen)-pfvTr(stgen)+pfvTstr(stgen)-Tstream(stgen)+Tr(stgen);
*eqHgen8_r1(stgen).. 0=e=0;
*eqHgen9_r1(stgen).. 0=e=0;


eqHgen10(stgen).. POWER(absdifTTb(stgen),2)=e=POWER(Tstream(stgen)-Tb(stgen),2)/4;
eqHgen11(stgen).. POWER(absdifTTr(stgen),2)=e=POWER(Tstream(stgen)-Tr(stgen),2)/4;

eqHgen12(stgen).. Tb(stgen)=e=Ts('H2O');
eqHgen13(stgen).. Tr(stgen)=e=Ts('H2O');
eqHgen14(stgen).. SQR(frac_vapor(stgen))+2*pfvTstr(stgen)+SQR(Tstream(stgen))=e=SQR(frac_vapor(stgen)+Tstream(stgen));
eqHgen15(stgen).. SQR(frac_vapor(stgen))+2*pfvTb(stgen)+SQR(Tb(stgen))=e=SQR(frac_vapor(stgen)+Tb(stgen));
eqHgen16(stgen).. SQR(frac_vapor(stgen))+2*pfvTr(stgen)+SQR(Tr(stgen))=e=SQR(frac_vapor(stgen)+Tr(stgen));
eqHgen17(stgen).. frac_vapor2(stgen)=e=0.5*(1+tanh((Tstream(stgen)-Tr(stgen))/1e-4));
*eqHgen17(stgen).. frac_vapor2(stgen)=e=(1/(1+(exp(-(Tstream(stgen)/Tr(stgen)-1)/1e-3))));


* Mass Balance
eqBM(il)..  (Flgen(il,'W_Ent1')+Flgen(il,'W_Ent2'))=e=Flgen(il,'W_Sal');
* Energy Balance
eqBE..  (Hgen('W_Sal')-Hgen('W_Ent1')-Hgen('W_Ent2'))=e=0;
* Objetive Functions
eqObj1..   FO=e=0; /* dummy variable */
*eqObj2..   FO2=e=Tstream('W_Sal')*scT; /*Outlet Temperature*/
eqObj2..   FO2=e=Hgen('W_Sal'); /*Outlet Temperature*/

Model VAP /all/;
Model CalTs /eqTs,EqOBJ1 /;
********** Variables de decision *********************************************
Ptotal.fx=1;

******************************************************************************


Ts.l('H2O')=(276+100)/scT;
Ts.lo('H2O')=(150.16)/scT;
Ts.up('H2O')=(646.13)/scT;
Ts.l('H2O')=(0.426776E02+ (-0.389270e4/(LOG(Ptotal.l*0.101325)+(-0.948654e1))))/scT;

SOLVE CalTs USING NLP minimising FO;

deltaHvap.lo(il)=-10000;
deltaHvap.up(il)=10000;
deltaHvap.l(il)=EXP(LOG(Coef_Hvap(il,'A'))
                + LOG(1 - (Ts.l(il)*scT/data(il,'Tc')))*(Coef_Hvap(il,'B')
                + Coef_Hvap(il,'C')*(Ts.l(il)*scT/data(il,'Tc'))
                + Coef_Hvap(il,'D')*POWER((Ts.l(il)*scT/data(il,'Tc')),2)
                + Coef_Hvap(il,'E')*POWER((Ts.l(il)*scT/data(il,'Tc')),3)))/1000;

frac_vapor.lo(stgen)=0;
frac_vapor.up(stgen)=1;
vaux1.lo(stgen)=0;
vaux2.lo(stgen)=0;
absdifTTb.lo(stgen)=0;
absdifTTr.lo(stgen)=0;


Tstream.fx('W_Ent1')=(273+25)/scT;
frac_vapor.l('W_Ent1')=0;
Tstream.fx('W_Ent2')=(273+450)/scT;
frac_vapor.l('W_Ent2')=1;

Tb.l(stgen)=Ts.l('H2O');
Tr.l(stgen)=Ts.l('H2O');

minT_Tb.l(stgen)=0.5*Tstream.l(stgen)+0.5*Tb.l(stgen)-SQRT(POWER(Tstream.l(stgen)-Tb.l(stgen),2)/4);
maxT_Tr.l(stgen)=0.5*Tstream.l(stgen)+0.5*Tr.l(stgen)+SQRT(POWER(Tstream.l(stgen)-Tr.l(stgen),2)/4);
max0_difTTb.l(stgen)=0.5*Tstream.l(stgen)-0.5*Tb.l(stgen)+SQRT(POWER(Tstream.l(stgen)-Tb.l(stgen),2)/4);
min0_difTrT.l(stgen)=0.5*Tr.l(stgen)-0.5*Tstream.l(stgen)-SQRT(POWER(Tr.l(stgen)-Tstream.l(stgen),2)/4);

absdifTTb.l(stgen)=SQRT(POWER(Tstream.l(stgen)-Tb.l(stgen),2)/4);
absdifTTr.l(stgen)=SQRT(POWER(Tstream.l(stgen)-Tr.l(stgen),2)/4);

Hliq.l(il,stgen)=(Coef_cpL(il,'A')*(minT_Tb.l(stgen)*scT-Tref)
                            +Coef_cpL(il,'B')*(POWER(minT_Tb.l(stgen)*scT,2)-Tref**2)/2
                            +Coef_cpL(il,'C')*(POWER(minT_Tb.l(stgen)*scT,3)-Tref**3)/3
                            +Coef_cpL(il,'D')*(POWER(minT_Tb.l(stgen)*scT,4)-Tref**4)/4
                            +Coef_cpL(il,'E')*(POWER(minT_Tb.l(stgen)*scT,5)-Tref**5)/5)/1000;
Hvap.l(il,stgen)=(Coef_cpV(il,'A')*(maxT_Tr.l(stgen)*scT-Ts.l(il)*scT)
                            +Coef_cpV(il,'B')*(POWER(maxT_Tr.l(stgen)*scT,2)-POWER(Ts.l(il)*scT,2))/2
                            +Coef_cpV(il,'C')*(POWER(maxT_Tr.l(stgen)*scT,3)-POWER(Ts.l(il)*scT,3))/3
                            +Coef_cpV(il,'D')*(POWER(maxT_Tr.l(stgen)*scT,4)-POWER(Ts.l(il)*scT,4))/4
                            +Coef_cpV(il,'E')*(POWER(maxT_Tr.l(stgen)*scT,5)-POWER(Ts.l(il)*scT,5))/5)/1000;
Hgenil.l(il,stgen)=Hliq.l(il,stgen)+frac_vapor.l(stgen)*deltaHvap.l(il)-deltaHvap.l(il)+Hvap.l(il,stgen);


pfdHvap.l(il,stgen)=frac_vapor.l(stgen)*deltaHvap.l(il);
pfvTstr.l(stgen)=frac_vapor.l(stgen)*Tstream.l(stgen)*scT;
pfvTb.l(stgen)=frac_vapor.l(stgen)*Tb.l(stgen)*scT;
pfvTr.l(stgen)=frac_vapor.l(stgen)*Tr.l(stgen)*scT;

vaux1.l(stgen)=max0_difTTb.l(stgen)-pfvTstr.l(stgen)+pfvTb.l(stgen)+Tstream.l(stgen)-Tb.l(stgen);
vaux2.l(stgen)=min0_difTrT.l(stgen)-pfvTr.l(stgen)+pfvTstr.l(stgen)-Tstream.l(stgen)+Tr.l(stgen);



Flgen.fx('H2O','W_Ent1')=1;
Flgen.fx('H2O','W_Ent2')=5;
Tstream.lo('W_Sal')=(273-25)/scT;
Tstream.up('W_Sal')=(273+700)/scT;


pFH.l(il,stgen)=Flgen.l(il,stgen)*Hgenil.l(il,stgen);
Hgen.l(stgen)= SUM(il,pFH.l(il,stgen))/3600;


*OPTION NLP=BARON;
SOLVE VAP USING NLP minimising FO;

*Flgen.lo('H2O','W_Ent2')=0.01;
*Flgen.up('H2O','W_Ent2')=10;
*Tstream.lo('W_Ent1')=273+25;
Tstream.lo('W_Ent2')=(273+25)/scT;
*Tstream.up('W_Ent1')=273+500;
Tstream.up('W_Ent2')=(273+500)/scT;
*VAP.scaleopt=3;
*OPTION NLP=BARON;
*frac_vapor.l('W_Ent2')=1;

SOLVE VAP USING NLP minimising FO2;
*Flgen.lo('H2O','W_Ent2')=5;

SOLVE VAP USING NLP MAXIMIZING FO2;


FILE Nominal /Resultados.txt/;
PUT Nominal;

PUT 'Corriente Liq/Gas ':20,'Temp':20;
LOOP(il, PUT 'F_',il.TL:8 );
PUT 'Ftotal':10;
LOOP(il, PUT 'x_',il.TL:8 );
PUT 'Hgen':12;
PUT 'Vapor Fracction':22;
LOOP (stgen,
         PUT /;
         PUT stgen.tl:17;
         PUT (Tstream.l(stgen)*scT):7:2,'K (',(Tstream.l(stgen)*scT-273):7:2,'C)';
         LOOP (il,PUT Flgen.l(il,stgen):10:5;
               );
         PUT Ftlgen.l(stgen):10:5;
         LOOP (il,PUT z.l(il,stgen):10:4;
               );
         PUT Hgen.l(stgen):12:6;
     );
PUT /;


FILE Nominal2 /Salida/;
PUT Nominal2;

PUT 'Corriente Liq/Gas ':20,'Temp':20;
LOOP(il, PUT 'F_',il.TL:8 );
PUT 'Ftotal':10;
LOOP(il, PUT 'x_',il.TL:8 );
PUT 'Hgen':12;
PUT 'Vapor Fracction':22;
LOOP (stgen,
         PUT /;
         PUT stgen.tl:17;
         PUT (Tstream.l(stgen)*scT):7:2,'K (',(Tstream.l(stgen)*scT-273):7:2,'C)';
         LOOP (il,PUT Flgen.l(il,stgen):10:5;
               );
         PUT Ftlgen.l(stgen):10:5;
         LOOP (il,PUT z.l(il,stgen):10:4;
               );
         PUT Hgen.l(stgen):12:6;
     );
PUT /;
