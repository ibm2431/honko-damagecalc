$("#p2 .ability").bind("keyup change", function() {
    autosetWeather($(this).val(), 1);
    autosetTerrain($(this).val(), 1);
});

$("#p2 .item").bind("keyup change", function() {
    autosetStatus("#p2", $(this).val());
});

lastManualStatus["#p2"] = "Healthy";
lastAutoStatus["#p1"] = "Healthy";

var resultLocations = [[],[],[],[],[],[]];
for (var i = 0; i < 6; i++) {
    resultLocations[0].push({
        "move":"#resultMoveL" + (i+1),
        "damage":"#resultDamageL" + (i+1)
    });
    resultLocations[1].push({
        "move":"#resultMoveR" + (i+1),
        "damage":"#resultDamageR" + (i+1)
    });
    resultLocations[2].push({
        "move":"#resultPoke2MoveL" + (i+1),
        "damage":"#resultPoke2DamageL" + (i+1)
    });
    resultLocations[3].push({
        "move":"#resultPoke2MoveR" + (i+1),
        "damage":"#resultPoke2DamageR" + (i+1)
    });
    resultLocations[4].push({
        "move":"#resultPoke3MoveL" + (i+1),
        "damage":"#resultPoke3DamageL" + (i+1)
    });
    resultLocations[5].push({
        "move":"#resultPoke3MoveR" + (i+1),
        "damage":"#resultPoke3DamageR" + (i+1)
    });
}

var damageResults;
function calculate() {
    var p1 = new Pokemon($("#p1"));
    var p3 = new Pokemon($("#p3"));
    var p4 = new Pokemon($("#p4"));
    var p2 = new Pokemon($("#p2"));
    var field = new Field();
    damageResults = calculateAllMoves(p1, p2, p3, p4, field);
    var result, minDamage, maxDamage, minDisplay, maxDisplay;
    var highestDamages = [-1, -1, -1, -1, -1, -1];
    var bestResults = [0, 0, 0, 0, 0, 0];
    for (var i = 0; i < 4; i++) {
        result = damageResults[0][i];
        minDamage = result.damage[0] * p1.moves[i].hits;
        maxDamage = result.damage[result.damage.length-1] * p1.moves[i].hits;
        minDisplay = notation === '%' ? Math.floor(minDamage * 1000 / p2.maxHP) / 10 : Math.floor(minDamage * 48 / p2.maxHP);
        maxDisplay = notation === '%' ? Math.floor(maxDamage * 1000 / p2.maxHP) / 10 : Math.floor(maxDamage * 48 / p2.maxHP);
        result.damageText = minDamage + "-" + maxDamage + " (" + minDisplay + " - " + maxDisplay + notation + ")";
        result.koChanceText = p1.moves[i].bp === 0 ? 'No chance'
                : getKOChanceText(result.damage, p1, p2, field.getSide(1), p1.moves[i].hits, p1.ability === 'Bad Dreams');
        $(resultLocations[0][i].move + " + label").text(p1.moves[i].name.replace("Hidden Power", "HP"));
        $(resultLocations[0][i].damage).text(minDisplay + " - " + maxDisplay + notation);
        if (maxDamage > highestDamages[0]) {
            highestDamages[0] = maxDamage;
            bestResults[0] = i;
        }
        
        result = damageResults[1][i];
        minDamage = result.damage[0] * p2.moves[i].hits;
        maxDamage = result.damage[result.damage.length-1] * p2.moves[i].hits;
        minDisplay = notation === '%' ? Math.floor(minDamage * 1000 / p1.maxHP) / 10 : Math.floor(minDamage * 48 / p1.maxHP);
        maxDisplay = notation === '%' ? Math.floor(maxDamage * 1000 / p1.maxHP) / 10 : Math.floor(maxDamage * 48 / p1.maxHP);
        result.damageText = minDamage + "-" + maxDamage + " (" + minDisplay + " - " + maxDisplay + notation + ")";
        result.koChanceText = p2.moves[i].bp === 0 ? 'No chance'
                : getKOChanceText(result.damage, p2, p1, field.getSide(0), p2.moves[i].hits, p2.ability === 'Bad Dreams');
        $(resultLocations[1][i].move + " + label").text(p2.moves[i].name.replace("Hidden Power", "HP"));
        $(resultLocations[1][i].damage).text(minDisplay + " - " + maxDisplay + notation);
        if (maxDamage > highestDamages[1]) {
            highestDamages[1] = maxDamage;
            bestResults[1] = i;
        }
        
        result = damageResults[2][i];
        minDamage = result.damage[0] * p3.moves[i].hits;
        maxDamage = result.damage[result.damage.length-1] * p3.moves[i].hits;
        minDisplay = notation === '%' ? Math.floor(minDamage * 1000 / p2.maxHP) / 10 : Math.floor(minDamage * 48 / p2.maxHP);
        maxDisplay = notation === '%' ? Math.floor(maxDamage * 1000 / p2.maxHP) / 10 : Math.floor(maxDamage * 48 / p2.maxHP);
        result.damageText = minDamage + "-" + maxDamage + " (" + minDisplay + " - " + maxDisplay + notation + ")";
        result.koChanceText = p3.moves[i].bp === 0 ? 'No chance'
                : getKOChanceText(result.damage, p3, p2, field.getSide(1), p3.moves[i].hits, p3.ability === 'Bad Dreams');
        $(resultLocations[2][i].move + " + label").text(p3.moves[i].name.replace("Hidden Power", "HP"));
        $(resultLocations[2][i].damage).text(minDisplay + " - " + maxDisplay + notation);
        if (maxDamage > highestDamages[2]) {
            highestDamages[2] = maxDamage;
            bestResults[2] = i;
        }
        
        result = damageResults[3][i];
        minDamage = result.damage[0] * p2.moves[i].hits;
        maxDamage = result.damage[result.damage.length-1] * p2.moves[i].hits;
        minDisplay = notation === '%' ? Math.floor(minDamage * 1000 / p3.maxHP) / 10 : Math.floor(minDamage * 48 / p3.maxHP);
        maxDisplay = notation === '%' ? Math.floor(maxDamage * 1000 / p3.maxHP) / 10 : Math.floor(maxDamage * 48 / p3.maxHP);
        result.damageText = minDamage + "-" + maxDamage + " (" + minDisplay + " - " + maxDisplay + notation + ")";
        result.koChanceText = p2.moves[i].bp === 0 ? 'No chance'
                : getKOChanceText(result.damage, p2, p3, field.getSide(0), p2.moves[i].hits, p2.ability === 'Bad Dreams');
        $(resultLocations[3][i].move + " + label").text(p2.moves[i].name.replace("Hidden Power", "HP"));
        $(resultLocations[3][i].damage).text(minDisplay + " - " + maxDisplay + notation);
        if (maxDamage > highestDamages[3]) {
            highestDamages[3] = maxDamage;
            bestResults[3] = i;
        }
        
        result = damageResults[4][i];
        minDamage = result.damage[0] * p4.moves[i].hits;
        maxDamage = result.damage[result.damage.length-1] * p4.moves[i].hits;
        minDisplay = notation === '%' ? Math.floor(minDamage * 1000 / p2.maxHP) / 10 : Math.floor(minDamage * 48 / p2.maxHP);
        maxDisplay = notation === '%' ? Math.floor(maxDamage * 1000 / p2.maxHP) / 10 : Math.floor(maxDamage * 48 / p2.maxHP);
        result.damageText = minDamage + "-" + maxDamage + " (" + minDisplay + " - " + maxDisplay + notation + ")";
        result.koChanceText = p4.moves[i].bp === 0 ? 'No chance'
                : getKOChanceText(result.damage, p4, p2, field.getSide(1), p4.moves[i].hits, p4.ability === 'Bad Dreams');
        $(resultLocations[4][i].move + " + label").text(p4.moves[i].name.replace("Hidden Power", "HP"));
        $(resultLocations[4][i].damage).text(minDisplay + " - " + maxDisplay + notation);
        if (maxDamage > highestDamages[4]) {
            highestDamages[4] = maxDamage;
            bestResults[4] = i;
        }
        
        result = damageResults[5][i];
        minDamage = result.damage[0] * p2.moves[i].hits;
        maxDamage = result.damage[result.damage.length-1] * p2.moves[i].hits;
        minDisplay = notation === '%' ? Math.floor(minDamage * 1000 / p4.maxHP) / 10 : Math.floor(minDamage * 48 / p4.maxHP);
        maxDisplay = notation === '%' ? Math.floor(maxDamage * 1000 / p4.maxHP) / 10 : Math.floor(maxDamage * 48 / p4.maxHP);
        result.damageText = minDamage + "-" + maxDamage + " (" + minDisplay + " - " + maxDisplay + notation + ")";
        result.koChanceText = p2.moves[i].bp === 0 ? 'No chance'
                : getKOChanceText(result.damage, p2, p4, field.getSide(0), p2.moves[i].hits, p2.ability === 'Bad Dreams');
        $(resultLocations[5][i].move + " + label").text(p2.moves[i].name.replace("Hidden Power", "HP"));
        $(resultLocations[5][i].damage).text(minDisplay + " - " + maxDisplay + notation);
        if (maxDamage > highestDamages[5]) {
            highestDamages[5] = maxDamage;
            bestResults[5] = i;
        }
    }
    var bestestResult = 0;
    for (var i = 0; i < 6; i++) {
      var bestResult = $(resultLocations[i][bestResults[i]].move).prop("checked", true);
      bestResult.prop("checked", true);
      if (highestDamages[i] > highestDamages[bestestResult]) {
        bestestResult = i;
      }
      bestResult.change();
    }
    $(resultLocations[bestestResult][bestResults[bestestResult]].move).prop("checked", true);
    $(resultLocations[bestestResult][bestResults[bestestResult]].move).change();
    

    $("#resultHeaderL").text(p1.name + "'s Moves against "+ p2.name);
    $("#resultPoke2HeaderL").text(p3.name + "'s Moves against "+ p2.name);
    $("#resultPoke3HeaderL").text(p4.name + "'s Moves against "+ p2.name);
    $("#resultHeaderR").text(p2.name + "'s Moves against " +p1.name);
    $("#resultPoke2HeaderR").text(p2.name + "'s Moves against " + p3.name);
    $("#resultPoke3HeaderR").text(p2.name + "'s Moves against " + p4.name);
}

$(".result-move").change(function() {
    if (damageResults) {
        var result = findDamageResult($(this));
        if (result) {
            $("#mainResult").text(result.description + ": " + result.damageText + " -- " + result.koChanceText);
            $("#damageValues").text("Possible damage amounts: (" + result.damage.join(", ") + ")");
        }
    }
});

function findDamageResult(resultMoveObj) {
    var selector = "#" + resultMoveObj.attr("id");
    for (var i = 0; i < resultLocations.length; i++) {
        for (var j = 0; j < resultLocations[i].length; j++) {
            if (resultLocations[i][j].move === selector) {
                return damageResults[i][j];
            }
        }
    }
}

var calculateAllMoves;

$(".gen").change(function () {
    switch (gen) {
        case 1:
            calculateAllMoves = CALCULATE_ALL_MOVES_RBY;
            break;
        case 2:
            calculateAllMoves = CALCULATE_ALL_MOVES_GSC;
            break;
        case 3:
            calculateAllMoves = CALCULATE_ALL_MOVES_ADV;
            break;
        case 4:
            calculateAllMoves = CALCULATE_ALL_MOVES_DPP;
            break;
        default:
            calculateAllMoves = CALCULATE_ALL_MOVES_BW;
            break;
    }
});

$(".mode").change(function() {
    window.location.replace( "honkalculate.html?mode=" + $(this).attr("id") );
});

$(".notation").change(function () {
    calculate();
});

$(document).ready(function() {
    $(".calc-trigger").bind("change keyup", function() {
        setTimeout(calculate, 0);
    });
    calculate();
});
