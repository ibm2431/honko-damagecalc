  var recoveryMoves = {
    "Recover": true,
    "Synthesis": true,
    "Rest": true,
    "Softboiled": true,
    "Moonlight": true
  }
  var setupMoves = {
    "Calm Mind": true,
    "Swords Dance": true,
    "Dragon Dance": true
  }
  var bypassAccuracyMoves = {
    "Aerial Ace": true,
    "Feint Attack": true,
    "Magical Leaf": true,
    "Swift": true,
    "Vital Throw": true
  }
  var OHKOMoves = {
    "Fissure": true,
    "Guillotine": true,
    "Horn Drill": true,
    "Sheer Cold": true
  };

$.fn.DataTable.ColVis.prototype._fnDomColumnButton = function(i) {
    var
        that = this,
        column = this.s.dt.aoColumns[i],
        dt = this.s.dt;
    
    var title = this.s.fnLabel === null ?
        column.sTitle :
        this.s.fnLabel(i, column.sTitle, column.nTh);
    
    return $(
            '<li ' + (dt.bJUI ? 'class="ui-button ui-state-default"' : '') + '>' +
            '<label>' +
            '<input type="checkbox" />' +
            '<span>' + title + '</span>' +
            '</label>' +
            '</li>'
        )
        .click(function(e) {
            var showHide = !$('input', this).is(":checked");
            if (e.target.nodeName.toLowerCase() !== "li") {
                showHide = !showHide;
            }
            
            /* Need to consider the case where the initialiser created more than one table - change the
             * API index that DataTables is using
             */
            var oldIndex = $.fn.dataTableExt.iApiIndex;
            $.fn.dataTableExt.iApiIndex = that._fnDataTablesApiIndex.call(that);
            
            // Optimisation for server-side processing when scrolling - don't do a full redraw
            if (dt.oFeatures.bServerSide) {
                that.s.dt.oInstance.fnSetColumnVis(i, showHide, false);
                that.s.dt.oInstance.fnAdjustColumnSizing(false);
                if (dt.oScroll.sX !== "" || dt.oScroll.sY !== "") {
                    that.s.dt.oInstance.oApi._fnScrollDraw(that.s.dt);
                }
                that._fnDrawCallback();
            } else {
                that.s.dt.oInstance.fnSetColumnVis(i, showHide);
            }
            
            $.fn.dataTableExt.iApiIndex = oldIndex; /* Restore */
            
            if ( (e.target.nodeName.toLowerCase() === 'input' || e.target.nodeName.toLowerCase() === 'li') && that.s.fnStateChange !== null ) {
                that.s.fnStateChange.call(that, i, showHide);
            }
        })[0];
};

$.fn.dataTableExt.oSort['damage100-asc'] = function (a, b) {
    return parseFloat(a) - parseFloat(b);
}
$.fn.dataTableExt.oSort['damage100-desc'] = function (a, b) {
    return parseFloat(b) - parseFloat(a);
}

$.fn.dataTableExt.oSort['damage48-asc'] = function (a, b) {
    return parseInt(a) - parseInt(b);
}
$.fn.dataTableExt.oSort['damage48-desc'] = function (a, b) {
    return parseInt(b) - parseInt(a);
}

function calculate() {
  if (mode === 'three-vs-all') {
    calculatePointTable();
    return;
  }
    var highestKO = '';
    var points = 0;
    var attacker, defender, setName, setTier;
    var selectedTiers = getSelectedTiers();
    var setOptions = getSetOptions();
    var dataSet = [];
    var allTiers = false;
    var inSelectedTiers = false;
    if (_.contains(selectedTiers, "All")) {
      allTiers = true;
    }
    for (var i = 0; i < setOptions.length; i++) {
        if (setOptions[i].id && typeof setOptions[i].id !== "undefined") {
            setName = setOptions[i].id.substring(setOptions[i].id.indexOf("(") + 1, setOptions[i].id.lastIndexOf(")"));
            inSelectedTiers = false;
            if (allTiers) {
              inSelectedTiers = true;
            }
            else {
              var setTiers = setOptions[i].tiers;
              for (var j = 0; j < setTiers.length; j++) {
                if (_.contains(selectedTiers, setTiers[j])) {
                  inSelectedTiers = true;
                }
              }
            }
            if (inSelectedTiers) {
                var defenderHasRecovery = false;
                var defenderHasSetup = false;
                var defenderHasDT = false;
                var attackherHasBypassAccuracy = false;
                attacker = (mode === "one-vs-all") ? new Pokemon($("#p1")) : new Pokemon(setOptions[i].id);
                defender = (mode === "one-vs-all") ? new Pokemon(setOptions[i].id) : new Pokemon($("#p1"));
                var field = new Field();
                var damageResults = calculateMovesOfAttacker(attacker, defender, field);
                var result, minDamage, maxDamage, minPercentage, maxPercentage, minPixels, maxPixels;
                var defenderSide = field.getSide( ~~(mode === "one-vs-all") );
                var highestDamage = -1;
                var highestKO = "no chance";
                var data = [setOptions[i].id];
                data.push(attacker.name);
                var highestIsExplosion = false;
                for (var n = 0; n < 4; n++) {
                  result = damageResults[n];
                  minDamage = result.damage[0] * attacker.moves[n].hits;
                  maxDamage = result.damage[result.damage.length-1] * attacker.moves[n].hits;
                  minPercentage = Math.floor(minDamage * 1000 / defender.maxHP) / 10;
                  maxPercentage = Math.floor(maxDamage * 1000 / defender.maxHP) / 10;
                  minPixels = Math.floor(minDamage * 48 / defender.maxHP);
                  maxPixels = Math.floor(maxDamage * 48 / defender.maxHP);
                  result.koChanceText = attacker.moves[n].bp === 0 ? 'No chance'
                          : getKOChanceText(result.damage, attacker, defender, defenderSide, attacker.moves[n].hits, attacker.ability === 'Bad Dreams');
                  
                  // Write highest damage, or a new OHKO if the previous highest was Explosion.
                  if ((maxDamage > highestDamage) || (highestIsExplosion && (result.koChanceText == "guaranteed OHKO"))) {
                    // But don't overwrite with higher damage Explosion if we can already OHKO them with another move.
                    if (!((attacker.moves[n].name == "Explosion") && (highestKO == "guaranteed OHKO"))) {
                      highestDamage = maxDamage;
                      while (data.length > 2) { 
                          data.pop();
                      }
                      data.push( attacker.moves[n].name.replace("Hidden Power", "HP") );
                      data.push( minPercentage + " - " + maxPercentage + "%" );
                      data.push( minPixels + " - " + maxPixels + "px" );
                      data.push( result.koChanceText );
                      highestKO = result.koChanceText;
                      
                      if (attacker.moves[n].name == "Explosion") {
                        // Note if we can only OHKO them through Explosion
                        highestIsExplosion = true;
                      }
                    }
                  }
                  if (bypassAccuracyMoves[attacker.moves[n].name]) {
                    attackerHasBypassAccuracy = true;
                  }
                  
                  if (recoveryMoves[defender.moves[n].name]) {
                    defenderHasRecovery = true;
                  }
                  else if (recoveryMoves[defender.moves[n].name]) {
                    defenderHasSetup = true;
                  }
                  else if (defender.moves[n].name == "Double Team") {
                    defenderHasDT = true;
                  }
                }
                
                // Calculate points for how well we do against all pokemon
                if (mode === "one-vs-all") {
                  if (highestKO == "guaranteed OHKO") {
                    if (highestIsExplosion) {
                      // While being able to kill them is nice...
                      points = points + 1;
                    }
                    else {
                      // ...it's not as nice as doing so without killing ourselves.
                      points = points + 2;
                    }
                  }
                  else if ((_.contains(highestKO, "chance to OHKO")) || (_.contains(highestKO, "guaranteed 2HKO"))) {
                    points = points + 1;
                  }
                  else {
                    if (defenderHasRecovery) {
                      // We take at least 3 hits to kill them, and they have a recovery move.
                      points = points - 0.5;
                    }
                    if (defenderHasDT && (!attackerHasBypassAccuracy)) {
                      // We take at least 3 hits to kill them, and they have Double Team
                      points = points - 1;
                    }
                    if (!((_.contains(highestKO, "chance to 2HKO")) || (_.contains(highestKO, "guaranteed 3HKO")) ||
                          (_.contains(highestKO, "chance to 3HKO")) || (_.contains(highestKO, "guaranteed 4HKO")))) {
                      // We take 5 or more hits to kill them - its a really bad matchup
                      points = points - 1;
                      
                      if (defenderHasDT && (!attackerHasBypassAccuracy)) {
                        // AND they have Double Team?! This is worth -4 total instead of just -2.
                        points = points - 2;
                      }
                    }
                  }
                }
                else { // mode is all-vs-one
                  if ((highestKO == "guaranteed OHKO") || _.contains(highestKO, "chance to OHKO")) {
                    points = points - 2;
                  }
                  else if (_.contains(highestKO, "guaranteed 2HKO") || _.contains(highestKO, "chance to 2HKO")) {
                    points = points - 1;
                  }
                  else {
                    if (defenderHasRecovery) {
                      // They take at least three hits to kill us, and we have a recovery move.
                      points = points + 0.5;
                    }
                    if (!((_.contains(highestKO, "chance to 3HKO")) || (_.contains(highestKO, "guaranteed 3HKO")) ||
                          (_.contains(highestKO, "chance to 4HKO")) || (_.contains(highestKO, "guaranteed 4HKO")))) {
                      // They take at least five hits to kill us. This is good.
                      points = points + 1;
                    }
                    
                    // No extra points for Double Team (for us) because it's not as effective for us as it is for the AI!
                  }
                }
                
               
                data.push( (mode === "one-vs-all") ? defender.type1 : attacker.type1 );
                data.push( (mode === "one-vs-all") ? defender.type2 : attacker.type2 );
                data.push( (mode === "one-vs-all") ? defender.ability : attacker.ability );
                data.push( (mode === "one-vs-all") ? defender.item : attacker.item );
                data.push(points);
                dataSet.push(data);
            
            }
        }
    }
    table.rows.add(dataSet).draw();
    $("#vsAllPoints").text(points);
}

function calculatePointTable() {
  var us, them, setName, setTier;
  var selectedTiers = getSelectedTiers();
  var setOptions = getSetOptions();
  var dataSet = [];
  var allTiers = false;
  var inSelectedTiers = false;
  var calculatePointsForNPokes = 3;
  if (_.contains(selectedTiers, "All")) {
    allTiers = true;
  }
  
  var bestPoke = "", bestKOChance = "", bestMove = "";
  var bestPercentage = "", bestPixels = "" ;
  
  var field = new Field();
  var ourSide = field.getSide(0);
  var theirSide = field.getSide(1);
  
  var vsPoints = 0, totalPoints = 0;
  var p1 = new Pokemon($("#p1"));
  var p2 = new Pokemon($("#p2"));
  var p3 = new Pokemon($("#p3"));
  p1.points = 0;
  p2.points = 0;
  p3.points = 0;
  var ourTeam = [];
  ourTeam[1] = p1;
  ourTeam[2] = p2;
  ourTeam[3] = p3;
  var teamTotalPoints = 0;

  for (var pokeN = 1; pokeN <= calculatePointsForNPokes; pokeN++) {
    var us = ourTeam[pokeN];
    for (var n = 0; n < 4; n++) {
      if (bypassAccuracyMoves[us.moves[n].name]) {
        us.BypassAccuracy = true;
      }
      else if (recoveryMoves[us.moves[n].name]) {
        us.HaveRecovery = true;
      }
      else if (recoveryMoves[us.moves[n].name]) {
        us.HaveSetup = true;
      }
      // Unlike if enemies do, we don't care if we have Double Team, because
      // we assume the AI will just hit through it anyway (spoiler: it will).
    }
  }


  for (var i = 0; i < setOptions.length; i++) {
    if (setOptions[i].id && typeof setOptions[i].id !== "undefined") {
      setName = setOptions[i].id.substring(setOptions[i].id.indexOf("(") + 1, setOptions[i].id.lastIndexOf(")"));
      inSelectedTiers = false;
      if (allTiers) {
        inSelectedTiers = true;
      }
      else {
        var setTiers = setOptions[i].tiers;
        for (var j = 0; j < setTiers.length; j++) {
          if (_.contains(selectedTiers, setTiers[j])) {
            inSelectedTiers = true;
          }
        }
      }
      if (inSelectedTiers) {
        var bestDamage = -1;
        var bestPoints = -100;
        var badMatchups = 0;
        them = new Pokemon(setOptions[i].id);
        them.HasRecovery = false;
        them.HasSetup = false;
        them.HasDT = false;
        them.HasOHKO = false;
        them.HasRoar = false;

        for (var pokeN = 1; pokeN <= calculatePointsForNPokes; pokeN++) {
          us = ourTeam[pokeN];
        
          var ourDamageResults = calculateMovesOfAttacker(us, them, field);
          var theirDamageResults = calculateMovesOfAttacker(them, us, field);
          var ourHighestDamage = -1, theirHighestDamage = -1;
          var ourHighestKO = "no chance", theirHighestKO = "no chance";
          var ourResult = 0, ourMinDamage = 0, ourMaxDamage = 0, ourMinPercentage = 0, ourMaxPercentage = 0, ourMinPixels = 0, ourMaxPixels = 0;
          var theirResult = 0, theirMinDamage = 0, theirMaxDamage = 0, theirMinPercentage = 0, theirMaxPercentage = 0, theirMinPixels = 0, theirMaxPixels = 0;
          var ourHighestIsExplosion = false, theirHighestIsExplosion = false;
          
          for (var n = 0; n < 4; n++) {
            // US
            // --------------------------------------------
            ourResult = ourDamageResults[n];
            ourMinDamage = ourResult.damage[0] * us.moves[n].hits;
            ourMaxDamage = ourResult.damage[ourResult.damage.length-1] * us.moves[n].hits;
            ourMinPercentage = Math.floor(ourMinDamage * 1000 / them.maxHP) / 10;
            ourMaxPercentage = Math.floor(ourMaxDamage * 1000 / them.maxHP) / 10;
            ourMinPixels = Math.floor(ourMinDamage * 48 / them.maxHP);
            ourMaxPixels = Math.floor(ourMaxDamage * 48 / them.maxHP);
            ourResult.koChanceText = us.moves[n].bp === 0 ? 'No chance'
                    : getKOChanceText(ourResult.damage, us, them, theirSide, us.moves[n].hits, us.ability === 'Bad Dreams');
            
            // Write highest damage, or a new OHKO if the previous highest was Explosion.
            if ((ourMaxDamage > ourHighestDamage) || (ourHighestIsExplosion && (ourResult.koChanceText == "guaranteed OHKO"))) {
              // But don't overwrite with higher damage Explosion if we can already OHKO them with another move.
              if (!((us.moves[n].name == "Explosion") && (ourHighestKO == "guaranteed OHKO"))) {
                ourHighestDamage = ourMaxDamage;
                ourHighestKO = ourResult.koChanceText;

                if ((ourHighestDamage > bestDamage) || ((bestMove == "Explosion") && (ourResult.koChanceText == "guaranteed OHKO"))) {
                  bestPoke = us.name;
                  bestMove = us.moves[n].name.replace("Hidden Power", "HP");
                  bestPercentage = ourMinPercentage + " - " + ourMaxPercentage + "%";
                  bestPixels = ourMinPixels + " - " + ourMaxPixels + "px";
                  bestKOChance = ourResult.koChanceText;
                  bestDamage = ourHighestDamage;
                }

                if (us.moves[n].name == "Explosion") {
                  // Note if we can only OHKO them through Explosion
                  ourHighestIsExplosion = true;
                }
                else {
                  ourHighestIsExplosion = false;
                }
              }
            }
            
            // THEM
            // --------------------------------------------
            theirResult = theirDamageResults[n];
            theirMinDamage = theirResult.damage[0] * them.moves[n].hits;
            theirMaxDamage = theirResult.damage[theirResult.damage.length-1] * them.moves[n].hits;
            theirMinPercentage = Math.floor(theirMinDamage * 1000 / us.maxHP) / 10;
            theirMaxPercentage = Math.floor(theirMaxDamage * 1000 / us.maxHP) / 10;
            theirMinPixels = Math.floor(theirMinDamage * 48 / us.maxHP);
            theirMaxPixels = Math.floor(theirMaxDamage * 48 / us.maxHP);
            theirResult.koChanceText = them.moves[n].bp === 0 ? 'No chance'
                    : getKOChanceText(theirResult.damage, them, us, ourSide, them.moves[n].hits, them.ability === 'Bad Dreams');
            
            // Write highest damage, or a new OHKO if the previothem highest was Explosion.
            if ((theirMaxDamage > theirHighestDamage) || (theirHighestIsExplosion && (theirResult.koChanceText == "guaranteed OHKO"))) {
              // But don't overwrite with higher damage Explosion if they can already OHKO us with another move.
              if (!((them.moves[n].name == "Explosion") && (theirHighestKO == "guaranteed OHKO"))) {
                theirHighestDamage = theirMaxDamage;
                theirHighestKO = theirResult.koChanceText;
                
                if (them.moves[n].name == "Explosion") {
                  // Note if they can only OHKO us through Explosion
                  theirHighestIsExplosion = true;
                }
              }
            }
            
            // THEIR MOVE BONUSES
            // -----------------------------------------
            if (recoveryMoves[them.moves[n].name]) {
              them.HasRecovery = true;
            }
            else if (recoveryMoves[them.moves[n].name]) {
              them.HasSetup = true;
            }
            else if (OHKOMoves[them.moves[n].name]) {
              them.HasOHKO = true;
            }
            else if (them.moves[n].name == "Roar") {
              them.HasRoar = true;
            }
            else if (them.moves[n].name == "Double Team") {
              them.HasDT = true;
            }
          }
          
          // MATCHUP POINTS
          // -----------------------------------------
          vsPoints = 0;
          
          // Us versus them.
          if (ourHighestKO == "guaranteed OHKO") {
            if (!((us.rawStats[5] < them.rawStats[5]) && (theirHighestKO == "guaranteed OHKO"))) {
              // It doesn't matter if we can OHKO them if they can do the same to us and are faster.
              if (ourHighestIsExplosion) {
                // While being able to kill them is nice...
                vsPoints = vsPoints + 1;
              }
              else {
                // ...it's not as nice as doing so without killing ourselves.
                vsPoints = vsPoints + 2;
              }
            }
          }
          else if ((_.contains(ourHighestKO, "chance to OHKO")) || (_.contains(ourHighestKO, "guaranteed 2HKO"))) {
            if (!((us.rawStats[5] < them.rawStats[5]) && (theirHighestKO == "guaranteed OHKO"))) {
              // It doesn't matter if we can 2HKO them if they can OHKO us and are faster.
              
              if ((them.rawStats[5] > us.rawStats[5]) && 
                  ((theirHighestKO == "guaranteed 2HKO") || _.contains(theirHighestKO, "chance to OHKO"))) {
                // Taking half our health in damage before we kill them isn't worth as much.
                vsPoints = vsPoints + 0.5;
              }
              else {
                vsPoints = vsPoints + 1;
              }
            }
          }
          else {
            if (them.HasRecovery) {
              // We take at least 3 hits to kill them, and they have a recovery move.
              vsPoints = vsPoints - 0.5;
            }
            if (them.HasDT && (!us.BypassAccuracy)) {
              // We take at least 3 hits to kill them, and they have Double Team
              vsPoints = vsPoints - 1;
            }
            if (them.HasSetup) {
              // We take at least 3 hits to kill them, and they have a setup move.
              // They could end up sweeping our entire team if we stick to this matchup.
              vsPoints = vsPoints - 2;
            }
            if (!((_.contains(ourHighestKO, "chance to 2HKO")) || (_.contains(ourHighestKO, "guaranteed 3HKO")) ||
                  (_.contains(ourHighestKO, "chance to 3HKO")) || (_.contains(ourHighestKO, "guaranteed 4HKO")))) {
              // We take 5 or more hits to kill them - its a really bad matchup
              vsPoints = vsPoints - 1;
              
              if (them.HasDT && (!us.BypassAccuracy)) {
                // AND they have Double Team?! This is worth -4 total instead of just -2.
                vsPoints = vsPoints - 2;
              }
            }
          }
          
          // Them versus us.
          // While we assume we will never hit our "chance to XKHO", we assume the AI will always hit their chance.
          if (them.HasOHKO && (!(us.ability == "Sturdy"))) {
            // I want to say all enemy pokemon who possess a OHKO possess at least two, so we don't need to check types.
            
            if (!((them.rawStats[5] < us.rawStats[5]) && (ourHighestKO == "guaranteed OHKO"))) {
              // But, them having a OHKO doesn't matter if we can OHKO them and are faster!
              vsPoints = vsPoints - 1;
            }
          }
          
          if ((theirHighestKO == "guaranteed OHKO") || _.contains(theirHighestKO, "chance to OHKO")) {
            if (!((them.rawStats[5] < us.rawStats[5]) && (ourHighestKO == "guaranteed OHKO"))) {
              // It doesn't matter if they can OHKO us if we can do the same to them and are faster.
              vsPoints = vsPoints - 2;
            }
          }
          else if (_.contains(theirHighestKO, "guaranteed 2HKO") || _.contains(theirHighestKO, "chance to 2HKO")) {
            if (!((them.rawStats[5] < us.rawStats[5]) && (ourHighestKO == "guaranteed OHKO"))) {
              // It doesn't matter if they can 2HKO us if we can OHKO them before they move
              if ((us.rawStats[5] > them.rawStats[5]) && 
                  ((ourHighestKO == "guaranteed 2HKO") || _.contains(ourHighestKO, "chance to OHKO"))) {
                // We only lose a half point if we'll kill them after only one hit
                vsPoints = vsPoints - 0.5;
              }
              else {
                vsPoints = vsPoints - 1;
              }
            }
          }
          else {
            if (us.HaveRecovery) {
              // They take at least three hits to kill us, and we have a recovery move.
              vsPoints = vsPoints + 0.5;
            }
            if (us.HaveSetup && !them.HasRoar) {
              // Since they take at least three hits to kill us, we might be able to do a little setup against them.
              vsPoints = vsPoints + 0.5;
            }
            if (!((_.contains(theirHighestKO, "chance to 3HKO")) || (_.contains(theirHighestKO, "guaranteed 3HKO")) ||
                  (_.contains(theirHighestKO, "chance to 4HKO")) || (_.contains(theirHighestKO, "guaranteed 4HKO")))) {
              // They take at least five hits to kill us. This is good.
              vsPoints = vsPoints + 1;
              
              if (us.HaveSetup && !them.HasRoar) {
                // They take at least five hits to kill us. We have setup. Sweep their whole team.
                vsPoints = vsPoints + 2.5;
              }
            }
          }
          
          us.points = us.points + vsPoints;
          
          if (vsPoints < 0) {
            badMatchups = badMatchups + 1;
            if (badMatchups >= 2) {
              // Apply an additional penalty if we already struggle against this pokemon
              teamTotalPoints = teamTotalPoints + (vsPoints * (badMatchups / 2));
            }
          }
          else if ((vsPoints > 0) && (badMatchups > 1)) {
            // This pokemon serves as a counter to something our other two struggle with.
            // It deserves additional points for its important contribution.
            us.points = us.points + vsPoints;
          }
          
          if (vsPoints > bestPoints) {
            bestPoints = vsPoints;
          }
        }
        
        var data = [setOptions[i].id];
        data.push(bestPoke);
        data.push(bestMove);
        data.push(bestPercentage);
        data.push(bestPixels);
        data.push(bestKOChance);
        data.push(them.type1);
        data.push(them.type2);
        data.push(them.ability);
        data.push(them.item);
        data.push(bestPoints);
        dataSet.push(data);
        teamTotalPoints = teamTotalPoints + bestPoints;
      }
    }
  }
  
  table.rows.add(dataSet).draw();
  
  //teamTotalPoints = teamTotalPoints + p1.points + p2.points + p3.points;
  var pointsText = p1.name + ": " + p1.points;
  pointsText = pointsText + ", " + p2.name + ": " + p2.points;
  pointsText = pointsText + ", " + p3.name + ": " + p3.points;
  pointsText = pointsText + ", Team: " + teamTotalPoints;
  $("#vsAllPoints").text(pointsText);
}

function getSelectedTiers() {
    var selectedTiers = $('.tiers input:checked').map(function () { 
        return this.id; 
    }).get();
    return selectedTiers;
}

var calculateMovesOfAttacker;
$(".gen").change(function () {
    $(".tiers input").prop("checked", false);
    $("#singles-format").attr("disabled", false);
    switch(gen) {
        case 1:
            calculateMovesOfAttacker = CALCULATE_MOVES_OF_ATTACKER_RBY;
            break;
        case 2:
            calculateMovesOfAttacker = CALCULATE_MOVES_OF_ATTACKER_GSC;
            break;
        case 3:
            calculateMovesOfAttacker = CALCULATE_MOVES_OF_ATTACKER_ADV;
            break;
        case 4:
            calculateMovesOfAttacker = CALCULATE_MOVES_OF_ATTACKER_DPP;
            break;
        default:
            calculateMovesOfAttacker = CALCULATE_MOVES_OF_ATTACKER_BW;
            break;
    }
    adjustTierBorderRadius();
    
    if ( $.fn.DataTable.isDataTable("#holder-2")  ) {
        table.clear();
        constructDataTable();
        placeBsBtn();
    }
});

function adjustTierBorderRadius() {
    var squaredLeftCorner = { "border-top-left-radius": 0, "border-bottom-left-radius": 0 };
    var roundedLeftCorner = { "border-top-left-radius": "8px", "border-bottom-left-radius": "8px" };
    if (gen <= 2) {
        $("#UU").next("label").css(roundedLeftCorner);
    } else {
            $("#UU").next("label").css(squaredLeftCorner);
            $("#NU").next("label").css(roundedLeftCorner);
            
            if (gen > 3) {
                $("#NU").next("label").css(squaredLeftCorner);
                $("#LC").next("label").css(roundedLeftCorner);
                
                if (gen > 4) {
                    $("#LC").next("label").css(squaredLeftCorner);
                    $("#Doubles").next("label").css(roundedLeftCorner);
                    
                    if (gen > 5) {
                        $("#Doubles").next("label").css(squaredLeftCorner);
                    }
                }
            }
    }
}

var table;
function constructDataTable() {
  var columnDefs = [];
  if (mode === "three-vs-all") {
    columnDefs = [
        {
            targets: [4, 6, 7, 8, 9],
            visible: false,
            searchable: false
        },
        {
            targets: [3],
            type: 'damage100'
        },
        {
            targets: [4],
            type: 'damage48'
        },
        {   targets: [5],
            iDataSort: 3
        }
    ];
  }
  else {
    columnDefs = [
        {
            targets: [1, 4, 6, 7, 8, 9, 10],
            visible: false,
            searchable: false
        },
        {
            targets: [3],
            type: 'damage100'
        },
        {
            targets: [4],
            type: 'damage48'
        },
        {   targets: [5],
            iDataSort: 3
        }
    ];
  }
    table = $("#holder-2").DataTable( {
        destroy: true,
        columnDefs: columnDefs,
        dom: 'C<"clear">fti',
        colVis: {
            exclude: (gen > 2) ? [0, 1, 3] : (gen === 2) ? [0, 1, 3, 8] : [0, 1, 3, 8, 9],
            stateChange: function(iColumn, bVisible) {
                var column = table.settings()[0].aoColumns[iColumn];
                if (column.bSearchable !== bVisible) {
                    column.bSearchable = bVisible;
                    table.rows().invalidate();
                }
            }
        },
        paging: false,
        scrollX: Math.floor(dtWidth/100)*100, // round down to nearest hundred
        scrollY: dtHeight,
        scrollCollapse: true
    } );
    $(".dataTables_wrapper").css({ "max-width": dtWidth });
}

function placeBsBtn() {
    var honkalculator = "<button style='position:absolute' class='bs-btn bs-btn-default'>Honkalculate</button>";
    $("#holder-2_wrapper").prepend(honkalculator);
    $(".bs-btn").click(function() {
        var formats = getSelectedTiers();
        if (!formats.length) {
            $(".bs-btn").popover({
                content: "No format selected",
                placement: "right"
            }).popover('show');
            setTimeout(function(){ $(".bs-btn").popover('destroy') }, 1350);
        }
        table.clear();
        calculate();
    });
}

$(".mode").change(function() {

  if ( $("#one-vs-one").prop("checked") ) {
    window.location.replace( "index.html" );
  }
  else {
    if ( $("#one-vs-all").prop("checked") ) {
      $("#all-vs-one").prop("checked", false);
      $("#three-vs-all").prop("checked", false);
      mode = "one-vs-all";
    }
    else if ($("#all-vs-one").prop("checked")) {
      $("#one-vs-all").prop("checked", false);
      $("#three-vs-all").prop("checked", false);
      mode = "all-vs-one";
    }
    else if ( $("#three-vs-all").prop("checked") ) {
      $("#one-vs-all").prop("checked", false);
      $("#all-vs-one").prop("checked", false);
      mode = "three-vs-all";
    }

  }
});

$(".tiers label").mouseup(function() {
    var oldID = $('.tiers input:checked').attr("id");
    var newID = $(this).attr("for");
    if ((oldID === "Doubles" || _.startsWith(oldID, "VGC")) && (newID !== oldID)) {
        $("#singles-format").attr("disabled", false);
        $("#singles-format").prop("checked", true);
    }
    if ((_.startsWith(oldID, "VGC") || oldID === "LC") && (!_.startsWith(newID, "VGC") && newID !== "LC")) {
        setLevel("100");
    }
});

$(".tiers input").change(function() {
    var type = $(this).attr("type");
    var id = $(this).attr("id");
    $(".tiers input").not(":" + type).prop("checked", false); // deselect all radios if a checkbox is checked, and vice-versa
    
    if (id === "Doubles" || _.startsWith(id, "VGC")) {
        $("#doubles-format").prop("checked", true);
        $("#singles-format").attr("disabled", true);
    }
    
    if (id === "LC" && $('.level').val() !== "5") {
        setLevel("5");
    }
    
    if (_.startsWith(id, "VGC") && $('.level').val() !== "50") {
        setLevel("50");
    }
});

function setLevel(lvl) {
    $('.level').val(lvl);
    $('.level').keyup();
    $('.level').popover({
        content: "Level has been set to " + lvl,
        placement: "right"
    }).popover('show');
    setTimeout(function(){ $('.level').popover('destroy') }, 1350);
}

$(".set-selector").change(function(e) {
    var format = getSelectedTiers()[0];
    if (genWasChanged) {
        genWasChanged = false;
    } else if (_.startsWith(format, "VGC") && $('.level').val() !== "50") {
        setLevel("50");
    } else if (format === "LC" && $('.level').val() !== "5") {
        setLevel("5");
    }
});

var mode, dtHeight, dtWidth;
$(document).ready(function() {
    var url = window.location.href;
    mode = url.substring(url.indexOf('=') + 1, url.length);
    $("#" + mode).prop("checked", true);
    $("#holder-2 th:first").text( (mode === "all-vs-one") ? "Attacker" : "Defender" );
    $("#holder-2").show();
    
    calcDTDimensions();
    constructDataTable();
    placeBsBtn();
});

function calcDTDimensions() {
    $("#holder-2").DataTable( {
        dom: 'C<"clear">frti'
    });
    
    var theadBottomOffset = getBottomOffset($(".sorting"));
    var heightUnderDT = getBottomOffset($(".holder-0")) - getBottomOffset($("#holder-2 tbody"));
    dtHeight = $(document).height() - theadBottomOffset - heightUnderDT;
    dtWidth = $(window).width() - $("#holder-2").offset().left;
    dtWidth -= 2 * parseFloat($(".holder-0").css("padding-right"));
}

function getBottomOffset(obj) {
    return obj.offset().top + obj.outerHeight();
}
