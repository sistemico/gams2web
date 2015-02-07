
$Title {{ model_name|title }} (TRNSPORT,SEQ=1)
$Ontext

This problem finds a least cost shipping schedule that meets
requirements at markets and supplies at factories.


Dantzig, G B, Chapter 3.3. In Linear Programming and Extensions.
Princeton University Press, Princeton, New Jersey, 1963.

This formulation is described in detail in:
Rosenthal, R E, Chapter 2: A GAMS Tutorial. In GAMS: A User's Guide.
The Scientific Press, Redwood City, California, 1988.

The line numbers will not match those in the book because of these
comments.

$Offtext

{% set cell_width = 15 %}

  Sets
       i   canning plants   / {{ args.plants | join(', ', attribute='text') }} /
       j   markets          / {{ args.markets | join(', ', attribute='text') }} / ;

  Parameters

       a(i)  capacity of plant i in cases
          /
            {% for plant in args.plants -%}
                {{ plant.text.ljust(cell_width) }} {{ args.capacity[loop.index - 1] }}
            {% endfor %}
          /

       b(j)  demand at market j in cases
         /
           {% for market in args.markets -%}
               {{ market.text.ljust(cell_width) }} {{ args.demand[loop.index - 1] }}
           {% endfor %}
         /;

  Table d(i,j)  distance in thousands of miles

  {% for market in args.markets -%}
      {{ ' ' * cell_width if loop.first }}{{ '{}'.format(market.text).center(cell_width) }}
  {%- endfor %}
  {% for row in args.distance|slice(args.plants|length) -%}
      {{ '{}'.format(args.plants[loop.index - 1].text).rjust(cell_width) }}
      {%- for value in row -%}
          {{ '{}'.format(value).center(cell_width) }}
      {%- endfor -%}{{'  ;' if loop.last}}
  {% endfor %}

  Scalar f  freight in dollars per case per thousand miles  /{{ args.freight }}/ ;

  Parameter c(i,j)  transport cost in thousands of dollars per case ;

            c(i,j) = f * d(i,j) / 1000 ;

  Variables
       x(i,j)  shipment quantities in cases
       z       total transportation costs in thousands of dollars ;

  Positive Variable x ;

  Equations
       cost        define objective function
       supply(i)   observe supply limit at plant i
       demand(j)   satisfy demand at market j ;

  cost ..        z  =e=  sum((i,j), c(i,j)*x(i,j)) ;

  supply(i) ..   sum(j, x(i,j))  =l=  a(i) ;

  demand(j) ..   sum(i, x(i,j))  =g=  b(j) ;

  Model {{ model_name }} /all/ ;

  Solve {{ model_name }} using lp minimizing z ;

  Display x.l, x.m ;
