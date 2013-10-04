<?php

for ($i=1; $i<=9; $i++) {
    for ($j=1; $j<=9; $j++) {
echo '        { '."\n";
echo "            \"param\": \"y.fx('$i','$j','%d')=1;\", "."\n";
echo '            "label": "Fila '.$i.' Columna '.$j.'", '."\n";
echo '            "validador" : { "tipo": "integer", "rango": { "low": 1, "high": 9} }'."\n";
echo '        },'."\n";
    }
}
