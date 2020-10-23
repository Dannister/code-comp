function main(gameState, side) {
  const myTeam = gameState.teamStates[side];
  const [rows, cols] = gameState.boardSize;
  const otherTeam = side === 'home' ? gameState.teamStates.away : gameState.teamStates.home;
  const tileStates = gameState.tileStates;
  const mySideDir = side === 'home' ? 'north' : 'south';
  var movesArr = [];
  var moveTiles = [];
  for (var i = 0; i < myTeam.length; i++) {
    if (myTeam[i].isDead) {
      movesArr.push('none');
      continue;
    }
    var myOtherTeamMembers = [];
    if (i != 0) {
      myOtherTeamMembers.push(myTeam[0]);
    }
    if (i != 1) {
      myOtherTeamMembers.push(myTeam[1]);
    }
    if (i != 2) {
      myOtherTeamMembers.push(myTeam[2]);
    }
    if (i >= 0) {
      var currentCoord = myTeam[i].coord;
      if (isTileSafe(currentCoord, i, myOtherTeamMembers, moveTiles, otherTeam, tileStates)) {
        movesArr.push('none');
        moveTiles.push(currentCoord);
      } else {
        var northTile = new Array(currentCoord[0] - 1, currentCoord[1]);
        var southTile = new Array(currentCoord[0] + 1, currentCoord[1]);
        var eastTile = new Array(currentCoord[0], currentCoord[1] + 1);
        var westTile = new Array(currentCoord[0], currentCoord[1] - 1);
        var otherMonMovingNorth = moveToTileAlreadyQueued(northTile, moveTiles);
        var otherMonMovingSouth = moveToTileAlreadyQueued(southTile, moveTiles);
        var otherMonMovingEast = moveToTileAlreadyQueued(eastTile, moveTiles);
        var otherMonMovingWest = moveToTileAlreadyQueued(westTile, moveTiles);
        if (otherMonMovingEast && !otherMonMovingWest) {
          if (isTileLegal(westTile, rows, cols) && isTileSafe(westTile, i, myOtherTeamMembers, moveTiles, otherTeam, tileStates)) {
            movesArr.push('west');
            moveTiles.push(westTile);
            pushedEastOrWest = true;
            continue;
          }
        } else if (!otherMonMovingEast && otherMonMovingWest) {
          if (isTileLegal(eastTile, rows, cols) && isTileSafe(eastTile, i, myOtherTeamMembers, moveTiles, otherTeam, tileStates)) {
            movesArr.push('east');
            moveTiles.push(eastTile);
            pushedEastOrWest = true;
            continue;
          }
        }
        var moveEast = Math.random() > 0.5;
        var pushedEastOrWest = false;
        if (moveEast && isTileLegal(eastTile, rows, cols) && isTileSafe(eastTile, i, myOtherTeamMembers, moveTiles, otherTeam, tileStates)) {
            movesArr.push('east');
            moveTiles.push(eastTile);
            pushedEastOrWest = true;
        } else {
          if (isTileLegal(westTile, rows, cols) && isTileSafe(westTile, i, myOtherTeamMembers, moveTiles, otherTeam, tileStates)) {
              movesArr.push('west');
              moveTiles.push(westTile);
              pushedEastOrWest = true;
          } else if (isTileLegal(eastTile, rows, cols) && isTileSafe(eastTile, i, myOtherTeamMembers, moveTiles, otherTeam, tileStates)) {
              movesArr.push('east');
              moveTiles.push(eastTile);
              pushedEastOrWest = true;
            }
        }
        if (!pushedEastOrWest) {
          if (mySideDir === 'north' && isTileLegal(southTile, rows, cols) && isTileSafe(southTile, i, myOtherTeamMembers, moveTiles, otherTeam, tileStates)) {
            movesArr.push('south');
            moveTiles.push(southTile);
          } else if (mySideDir === 'south' && isTileLegal(northTile, rows, cols) && isTileSafe(northTile, i, myOtherTeamMembers, moveTiles, otherTeam, tileStates)) {
            movesArr.push('north');
            moveTiles.push(northTile);
          } else {
            var availableMoves = [];
            if (isTileLegal(northTile) && tileStates[northTile[0]][northTile[1]] > 1) {
              availableMoves.push('north');
            }
            if (isTileLegal(southTile) && tileStates[southTile[0]][southTile[1]] > 1) {
              availableMoves.push('south');
            }
            if (isTileLegal(eastTile) && tileStates[eastTile[0]][eastTile[1]] > 1) {
              availableMoves.push('east');
            }
            if (isTileLegal(westTile) && tileStates[westTile[0]][westTile[1]] > 1) {
              availableMoves.push('west');
            }
            var move = availableMoves[Math.floor(Math.random() * availableMoves.length)]
            movesArr.push(move);
            if (move === 'north') {
              moveTiles.push(northTile);
            } else if (move === 'south') {
              moveTiles.push(southTile);
            } else if (move === 'south') {
              moveTiles.push(eastTile);
            } else {
              moveTiles.push(westTile);
            }
          }
        }
      }
    } else {
      movesArr.push('none');
    }
  }
  return movesArr;
}
function isTileLegal(targetPos, rows, cols) {
  return targetPos[0] >= 0 && targetPos[0] < rows && targetPos[1] >= 0 && targetPos[1] < cols;
}
function isTileSafe(testPos, thisMonInd, myOtherTeamMembers, moveTiles, otherTeam, tileStates) {
  var tileHealth = tileStates[testPos[0]][testPos[1]];
  if (tileHealth <= 1) {
    return false;
  }
  for (enemy of otherTeam) {
    if (enemy.isDead) {
      continue;
    }
    if ((enemyIsAdjacent(testPos, enemy.coord) || (testPos[0] === enemy.coord[0] && testPos[1] === enemy.coord[1])) && tileHealth < 3) {
      return false;
    }
  }
  for (var i = 0; i < thisMonInd; i++) {
    var myMon = myOtherTeamMembers[i];
    if (myMon.isDead) {
      continue;
    }
    if ((enemyIsAdjacent(testPos, myMon.coord) && moveTiles[i][0] === testPos[0] && moveTiles[i][1] === testPos[1] && tileHealth < 3)
      || (testPos[0] === myMon.coord[0] && testPos[1] === myMon.coord[1] && moveTiles[i][0] === testPos[0] && moveTiles[i][1] === testPos[1])) {
      return false;
    }
  }
  return true;
}
function enemyIsAdjacent(pos, otherPos) {
  return (pos[0] === otherPos[0] && Math.abs(pos[1] - otherPos[1]) === 1) || (pos[1] === otherPos[1] && Math.abs(pos[0] - otherPos[0]) === 1);
}
function moveToTileAlreadyQueued(testTile, moveTiles) {
  for (tile of moveTiles) {
    if (testTile[0] === tile[0] && testTile[1] === tile[1]) {
      return true;
    }
  }
  return false;
}