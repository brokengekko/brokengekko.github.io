// score calc functions ¯\_(ツ)_/¯

import meta from '../proto/meta';

const mostOf = (ourArray, ourItem, masters) => {
	const theMax = Math.max.apply(null, ourArray.map(elt => elt[ourItem]));
	console.log(checkThreshold(ourItem, theMax) ? "pass" : "fail");
	return ourArray.filter(elt => elt[ourItem] === theMax).length === 1 && checkThreshold(ourItem, theMax) ?
	ourArray.find(elt => elt[ourItem] === theMax).color :
	// TODO: does not clear master if all drop below threshold 
	checkThreshold(ourItem, theMax) ? masters[ourItem] : "";
};

const checkThreshold = (item, max) => meta[item].threshold && max >= meta[item].threshold;

const checkGold = (players, color) => {
	const most = players.reduce((acc, player) => player.gold > acc ? player.gold : acc, 0);
	const richest = players.filter(player => player.gold === most).length > 1 ? '' : players.find(player => player.gold === most).color;
	const least = players.reduce((acc, player) => player.gold < acc ? player.gold : acc, 100);
	const poorest = players.filter(player => player.gold === least).map(player => player.color);
	return color === richest ? meta.gold.richest : poorest.includes(color) ? meta.gold.poorest : 0;
};

const checkCards = player => (player.merchant ? meta.merchant.score : 0) +
	(player.constitution ? meta.constitution.score : 0) +
	(player.printer ? meta.printer.score : 0);

const calcPlayerScore = (playerState, masters, players) =>
	Object.keys(masters).reduce((acc, item) =>
		masters[item] === playerState.color ? acc + meta[item].score : acc, 0) +
	checkGold(players, playerState.color) +
	(playerState.settlements * meta.settlements.score) +
	(playerState.cities * meta.cities.score) +
	(playerState.defenders * meta.defenders) +
	playerState.fish +
	meta.spices.score(playerState.spices) +
	meta.pirates.score(playerState.pirates) +
	checkCards(playerState);

export { mostOf, checkThreshold, checkGold, checkCards, calcPlayerScore };
