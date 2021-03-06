/*You can get skill ID's from https://moongourd.com/info or do /proxy au debug and use the skill, it will print on your console.
Recommanded to note the skill name in same order so you don't get confused :3 */

/* --------------------------------------------- NO EDITO BELOW THIS --------------------------------------------- */

const Command = require('command'),
	skills = require('./skills');

module.exports = function AutoUse(dispatch){
const command = Command(dispatch);


let enabled = true,
	debug = false,
	brooch = {
		id : 0,
		cooldown : 0
	},
	rootbeer = {
		id : 80081,
		amount : 0,
		cooldown : 0
	},
	useBroochOn,
	useRootBeerOn,
	useOutOfCombat,
	delay;

	command.add('au', (arg) => {
		if(arg){
			arg = arg.toLowerCase();
			if(arg === 'on'){
				enabled = true;
				command.message('[Auto Use] Enabled.');
			}
			else if(arg === 'off'){
				enabled = false;
				command.message('[Auto Use] Disabled.');
			}
			else if(arg === 'debug'){
				debug = !debug;
				command.message(`[Auto Use] Debug Status : ${debug}`);
			}
			else if(arg === 'help'){
				command.message('[Auto Use] Commands : debug | on | off')
			}
		}
		else command.message('[Auto Use] Commands : debug | on | off');
	});

	let useItem = (item, loc, w) => {
		dispatch.toServer('C_USE_ITEM', 3, {
			gameId: dispatch.game.me.gameId,
			id: item,
			dbid: { low: 0, high: 0, unsigned: true },
			target: { low: 0, high: 0, unsigned: true },
			amount: 1,
			dest: { x: 0, y: 0, z: 0 },
			loc: loc,
			w: w,
			unk1: 0,
			unk2: 0,
			unk3: 0,
			unk4: true
        });
        if(debug) console.log('Used : ' + item);
	};

	let handle = (info) => {
		if((useOutOfCombat || dispatch.game.me.inCombat) && !dispatch.game.me.inBattleground){
			if(useBroochOn.includes(info.skill.id) && Date.now() > brooch.cooldown) setTimeout(useItem, delay, brooch.id, info.loc, info.w);
			if(useRootBeerOn.includes(info.skill.id) && rootbeer.amount > 0 && Date.now() > rootbeer.cooldown) setTimeout(useItem, delay, rootbeer.id, info.loc, info.w);
		}
	}; 

	dispatch.game.on('enter_game', () => {
        useBroochOn = skills[dispatch.game.me.class].useBroochOn;
        useRootBeerOn = skills[dispatch.game.me.class].useRootBeerOn;
        useOutOfCombat = skills[dispatch.game.me.class].useOutOfCombat;
        delay = skills[dispatch.game.me.class].delay;
    });

 	dispatch.hook('C_USE_ITEM', 3, event => {
 		if(debug) console.log('ID of Item Used: ' + event.id);
 	});

	dispatch.hook('S_INVEN', 16, event => {
		if(!enabled) return;
		const broochinfo = event.items.find(item => item.slot === 20);
		const beer = event.items.find(item => item.id === rootbeer.id);
		if(broochinfo) brooch.id = broochinfo.id;
		if(beer) rootbeer.amount = beer.amount;
	});

	dispatch.hook('C_START_SKILL', 7, {order: Number.NEGATIVE_INFINITY}, event => {
		if(debug){
			const Time = new Date();
			console.log('Time: ' + Time.getHours() + ':' + Time.getMinutes() + ' | Skill ID : ' + event.skill.id);
		}
		if(!enabled) return;
		handle(event);
	});

	dispatch.hook('S_START_COOLTIME_ITEM', 1, {order: Number.NEGATIVE_INFINITY}, event => {
		if(!enabled) return;
		if(event.item === brooch.id) brooch.cooldown = Date.now() + event.cooldown*1000;
		else if(event.item === rootbeer.id) rootbeer.cooldown = Date.now() + event.cooldown*1000;
	});

}