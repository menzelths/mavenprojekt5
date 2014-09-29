/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


$(function(){
$("body").append("<canvas id='bild' width='1000' height='800'></canvas><br>");
$("body").append("<input type='button' class='holen knopf' b='Startet / stoppt die Simulation' id='start' value='Start / Stopp'></input>");
$("body").append("<input type='button' class='holen knopf' b='Setzt die Simulation zurück' id='reset' value='Reset'></input><br>");
  $("body").append("<input type='button' class='holen knopf' b='Ändert das rechte Ende: keine Begrenzung - festes Ende - loses Ende' id='ende' value='Rechtes Ende ändern'></input>");
$("body").append("<input type='button' class='holen knopf' b='Stellt Verbindung zwischen den Teilchen an / aus' id='verbinden' value='Verbinden an / aus'></input>");
$("body").append("<input type='button' class='holen knopf' b='Schaltet Anzeige der Zeiger an / aus' id='pfeil' value='Zeiger an / aus'></input><br>");

var _g = $("#bild")[0].getContext("2d");
var _zeit = 0;
var _deltazeit = 0.017;
var _raID = null;
var _posX = 0;
var _amplitude = 30;
var _einlaufend = true;
var _ruecklaufend = true;
var _superposition = true;
var _zeiger = false;
var _ystart = [100, 200, 350, 500, 700];
var _xabstand = 50;
var _breite = 1000;
var _verbinden = false;
var _hoehe = 800;
var _lambda = 600; // wellenlänge in pixeln
var _T = 2.5;
var _c = _lambda / _T; // phasengeschwindigkeit
var _rechtesEnde = 0; // 0 kein Ende, 1 festes Ende, 2 losesEnde
var _beobachtet = -1;
var _beobachteteWerte = [];
var _ende = ["ohne Ende", "festes Ende", "loses Ende"];
var _aktiv = false;
var _alteZeit = 0;
var _zeitFaktor = 30.0;



$("body").append("<select id='auswahl' b='Wählt das zu beobachtende Teilchen aus' class='holen select'></select>");
  $("#auswahl").append("<option id='0'>Teilchen wählen</option>");
  for (var i=0;i<_breite/_xabstand+1;i++){
    $("#auswahl").append("<option id='"+(i+1)+"'>Teilchen "+(i+1)+"</option>");
  }
  
$("body").append("<div id='ausgabe'></div>");  
  
function Punkt(x, y) {
    this.x = x;
    this.y = y;
}

$("#auswahl").change(function(){
  var nr=parseInt($("#auswahl option:selected").attr("id"),10);
  if (nr>0){
    _beobachtet=nr;
    _beobachteteWerte = [];
  }
  if (isNaN(nr)||nr===0){
    _beobachtet=-1;
    _beobachteteWerte = [];
   
  }
});  
  
$("#verbinden").on("click", function() {
    _verbinden = !_verbinden;
});

$("#ende").on("click", function() {
    _rechtesEnde = (_rechtesEnde + 1) % 3;
    $("#ausgabe").html("Rechts: " + _ende[_rechtesEnde]);
    _zeit = 0;
    _beobachteteWerte = [];
});

$("#pfeil").on("click", function() {
    _zeiger = !_zeiger;
});

$("#reset").on("click", function() {
    if (_raID !== null) {
        cancelAnimationFrame(_raID);
    }
    _zeit = 0;
    _beobachteteWerte = [];
    _beobachtet = parseInt($("#beobachtet").val(), 10);
    _aktiv = false;
    _g.fillStyle = "#ffffff";
    _g.fillRect(0, 0, _breite, _hoehe);
   $("#auswahl").val(0).change();

});

$("#start").on("click", function() {
    if (_aktiv === false) {
        _aktiv = true;
        _alteZeit = (new Date()).getTime();
        _raID = requestAnimationFrame(animation);
    } else {
        if (_raID !== null) {
            cancelAnimationFrame(_raID);
        }
        _aktiv = false;
    }
});

$("#stop").on("click", function() {
    if (_raID !== null) {
        cancelAnimationFrame(_raID);
    }
});

function zeichnePfeil(startx, starty, zielx, ziely, farbe) {
    _g.strokeStyle = farbe;
    _g.beginPath();
    _g.moveTo(startx, starty);
    _g.lineTo(startx + zielx, starty + ziely);
    _g.lineWidth = "3";
    _g.stroke();
}

function render(punkte, punkte_r) {
    var laenge = _breite / _xabstand + 1;
    while (punkte.length < laenge) {
        punkte.push(null);
    }
    while (punkte_r.length < laenge) {
        punkte_r.push(null);
    }
    var punkte2 = [];
    punkte_r.pop(); // letzten wert streichen
    while (punkte_r.length > 0) {
        punkte2.push(punkte_r.pop());
    } // jetzt umgedrehtes feld in punkte2
    if (_rechtesEnde === 1) {
        var p = punkte[punkte.length - 1];
        if (p != null) {
            var p2 = new Punkt(-p.x, -p.y);
        }
        punkte2.push(p2);
    } else if (_rechtesEnde === 2) {
        var p = punkte[punkte.length - 1];
        if (p != null) {
            var p2 = new Punkt(p.x, p.y);
            punkte2.push(p2);
        }
    }
    var summex = [], summey = [];
    for (var i = 0; i < punkte.length; i++) {
        summex[i] = 0;
        summey[i] = 0;
        if (punkte[i] != null) {
            if (_zeiger === true) {
                zeichnePfeil(i * _xabstand, _ystart[0], punkte[i].x, punkte[i].y, "#ff0000");
            }
            zeichnePfeil(i * _xabstand, _ystart[3], punkte[i].x, punkte[i].y, "#ff0000");
            _g.fillStyle = "#ff0000";
            _g.fillRect(i * _xabstand - 2, _ystart[0] + punkte[i].y - 2, 5, 5);
            summex[i] += punkte[i].x;
            summey[i] += punkte[i].y;
        } else {
            punkte[i] = new Punkt(0, 0);
            _g.fillStyle = "#ff0000";
            _g.fillRect(i * _xabstand - 2, _ystart[0] - 2, 5, 5);
        }
        if (punkte2[i] != null) {
            if (_zeiger === true) {
                zeichnePfeil(i * _xabstand, _ystart[1], punkte2[i].x, punkte2[i].y, "#0000ff");
            }
            zeichnePfeil(i * _xabstand, _ystart[3], punkte2[i].x, punkte2[i].y, "#0000ff");
            _g.fillStyle = "#0000ff";
            _g.fillRect(i * _xabstand - 2, _ystart[1] + punkte2[i].y - 2, 5, 5);
            summex[i] += punkte2[i].x;
            summey[i] += punkte2[i].y;
        } else {
            punkte2[i] = new Punkt(0, 0);
            _g.fillStyle = "#0000ff";
            _g.fillRect(i * _xabstand - 2, _ystart[1] - 2, 5, 5);
        }
        if (_zeiger === true) {
            zeichnePfeil(i * _xabstand, _ystart[2], summex[i], summey[i], "#000000");
        }
        zeichnePfeil(i * _xabstand, _ystart[3], summex[i], summey[i], "#000000");
        _g.fillStyle = "#000000";
        _g.fillRect(i * _xabstand - 2, _ystart[2] + summey[i] - 2, 5, 5);


    }
    if (_verbinden === true) {
        _g.beginPath();
        _g.moveTo(0, _ystart[2] + summey[0]);
        for (var i = 1; i < summex.length; i++) {
            _g.lineTo(i * _xabstand, _ystart[2] + summey[i]);
        }
        _g.strokeStyle = "#000000";
        _g.stroke();

        _g.beginPath();
        _g.moveTo(0, _ystart[0] + punkte[0].y);
        for (var i = 1; i < punkte.length; i++) {

            _g.lineTo(i * _xabstand, _ystart[0] + punkte[i].y);
        }
        _g.strokeStyle = "#ff0000";
        _g.stroke();

        _g.beginPath();
        _g.moveTo(0, _ystart[1] + punkte2[0].y);
        for (var i = 1; i < punkte.length; i++) {

            _g.lineTo(i * _xabstand, _ystart[1] + punkte2[i].y);
        }
        _g.strokeStyle = "#0000ff";
        _g.stroke();
    }

}

function animation(t) {
    var aktuelleZeit = (new Date()).getTime();
    _zeit += (aktuelleZeit - _alteZeit) / 1000.0;
    _alteZeit = aktuelleZeit;
    var hoeheBeobachtet = 0;
    _raID = requestAnimationFrame(animation);

    _g.fillStyle = "#ffffff";
    _g.fillRect(0, 0, _breite, _hoehe);

    _g.strokeStyle = "#000000";
    for (var i = 0; i < _ystart.length; i++) {
        _g.beginPath();
        _g.lineWidth = "1";
        _g.moveTo(0, _ystart[i]);
        _g.lineTo(_breite, _ystart[i]);
        _g.stroke();
    }


    var strecke = _c * _zeit;
    var b = 0; // beobachteter Punkt
    var beobachtet = false;
    var punkte = [];
    var punkte_r = [];
    for (var i = 0; i <= 2 * _breite + _xabstand; i += _xabstand) {
        b++;
        // erst testen, ob die welle schon so weit ist
        if (b === _beobachtet) {

            _g.fillStyle = "ffff00";
            _g.fillRect(i - 5, _ystart[0] - 50, 10, 550);
        }
        if (strecke >= i) { // einlaufende Welle zeichnen
            var x = _amplitude * Math.cos(2 * 3.1415 * (i / _lambda - _zeit / _T));
            var y = _amplitude * Math.sin(2 * 3.1415 * (i / _lambda - _zeit / _T));

            if (b === _beobachtet) {
                _beobachteteWerte.push(_zeit);
                _beobachteteWerte.push(y);
                beobachtet = true;
            }
            var xr = 0;
            var yr = 0;
            if (i > _breite && _rechtesEnde > 0) { // schon gespiegelt

                if (_rechtesEnde === 1) {
                    xr = _amplitude * Math.cos(2 * 3.1415 * (i / _lambda - _zeit / _T) + 3.1415);
                    yr = _amplitude * Math.sin(2 * 3.1415 * (i / _lambda - _zeit / _T) + 3.1415);
                } else if (_rechtesEnde === 2) {
                    xr = _amplitude * Math.cos(2 * 3.1415 * (i / _lambda - _zeit / _T));
                    yr = _amplitude * Math.sin(2 * 3.1415 * (i / _lambda - _zeit / _T));
                }
                punkte_r.push(new Punkt(xr, yr));
                // überlagerung
                if (_superposition === true) {
                    x = _amplitude * Math.cos(2 * 3.1415 * ((_breite - (i - _breite)) / _lambda - _zeit / _T));
                    y = _amplitude * Math.sin(2 * 3.1415 * ((_breite - (i - _breite)) / _lambda - _zeit / _T));
                    var xneu = x + xr;
                    var yneu = y + yr;
                    if (b === _beobachtet + 2 * (i - _breite) / _xabstand) {
                        _beobachteteWerte[_beobachteteWerte.length - 1] = yneu;

                        beobachtet = true;
                    }
                }
            } else if (i <= _breite) {
                punkte.push(new Punkt(x, y));
            }
        }
    }

    render(punkte, punkte_r);

    if (beobachtet === false) {
        _beobachteteWerte.push(_zeit);
        _beobachteteWerte.push(0);
    }
    //beobachtetes teilchen malen
    _g.fillStyle = "#00aa00";

    if (!isNaN(_beobachtet)&&_beobachtet>0) {
        // feld schrumpfen
        if (_beobachteteWerte.length > 2) {
            while ((_beobachteteWerte[_beobachteteWerte.length - 2] - _beobachteteWerte[0]) * _zeitFaktor > _breite) {
                _beobachteteWerte.splice(0, 2);
            }
        }
        for (var j = 0; j < _beobachteteWerte.length; j += 2) {
            _g.fillRect((_beobachteteWerte[j] - _beobachteteWerte[0]) * _zeitFaktor - 2, _ystart[4] + _beobachteteWerte[j + 1] - 2, 5, 5);
        }
    }

}
});