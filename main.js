const ethers = require('ethers');
const fs = require('fs');
const os = require('os');
const Web3 = require('web3');
const {JsonRpcProvider} = require("@ethersproject/providers");
const dotenv = require("dotenv");
const easyWallet = require("easy-wallet");

const result = dotenv.config();
if (result.error) {
  throw result.error;
}

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});

process.on('RemoteException', function (err) {
  console.log('Caught exception: ', err);
});

const mySigner = easyWallet.Signer(process.env.PRIVATE_KEY, process.env.BSC_RPC);
const myWallet = mySigner.address;

// log
const logger = async(file, string) => {
	try{
		fs.open(file, 'a', 666, function( e, id ) {
			fs.write( id, string + os.EOL, null, 'utf8', function(){
				fs.close(id, function(){
					//console.log('* LOG UPDATED');
				});
			});
		});
	} catch(e){
		
	}	
}


const getCurrentTimestamp = () => {
  return Math.floor(Date.now() / 1000)
}

// your investiment
const initialBetAmount = parseFloat(process.env.BET_AMOUNT);
const martingaleFactor = parseInt(process.env.MARTINGALE_MULTIPLIER);
const secondsToBet = parseInt(process.env.TIME_TO_BET);
var betAmount = 0;

// load
let maxLoaded = 0;
let loaded = 0;

// your wallet
const privateKey = process.env.PRIVATE_KEY;

const BET_BEAR = 'BEAR';
const BEAR = 'BEAR';
const BET_BULL = 'BULL';
const BULL = 'BULL';

const pancake_prediction_address = '0x18B2A687610328590Bc8F2e5fEdDe3b582A49cdA';

// set up contract
let abi = JSON.parse(fs.readFileSync('abi.json', 'utf8'));

let totalValidTips = 0;
let won = 0;
let lost = 0;
let bets = {};
let investiment = 0;
let currentBet = null;
let currentRound = 0;
let earnings = 0;
let payoutAmount = 0;
let payoutCount = 0;
let lockedPrice = 0;
let betLost = false;
let locked = false;

// martingale control
var martingale = [];

// bet
var getBet = () => {
	if(martingale.length == 0)
		return initialBetAmount;
	
	var max = 0;
	var pos = null;
	
	for(var i = 0 ; i < martingale.length ; i++){
		if(martingale[i] > max){
			max = martingale[i];
			pos = i;
		}
	}
	
	martingale.splice(pos, 1);
	return max;	
}

var registerLoss = (amount) => {
	martingale.push(amount*martingaleFactor);
	console.log('LOSS');
	console.log(martingale);
}

var registerReversion = () => {
	martingale.push(betAmount);
}

let bullCount = 0;
let bullAmount = 0;
let bearCount = 0;
let bearAmount = 0;

let provider = [];
const path = "m/44'/60'/0'/0/0";
let wallet = [];
let signer = [];
let prediction = [];

const wallets = {};
let analytics = {};

const mainNode = process.env.BSC_BASE_RPC;
const rpcArr = process.env.BSC_RPC_LIST.split(',');

const web3 = new Web3(new Web3.providers.HttpProvider(mainNode));  // FILL THIS WITH YOUR WEBSOCKET LINK

web3.eth.handleRevert = true

let predictionContract = new web3.eth.Contract(abi, pancake_prediction_address);

let log = {};
let end = {};

let populateAnalytics = async (events) => {
	for(var i = 0 ; i < events.length ; i++){			
		switch(events[i].event){
			case 'BetBear':
				var epoch = events[i].returnValues.epoch;
				var sender = events[i].returnValues.sender;
				
				if(wallets[sender] == null)
					wallets[sender] = {};

				wallets[sender][epoch] = {bet: BET_BEAR, result: null};
			break;
			case 'BetBull':
				var epoch = events[i].returnValues.epoch;
				var sender = events[i].returnValues.sender;
				
				if(wallets[sender] == null)
					wallets[sender] = {};

				wallets[sender][epoch] = {bet: BET_BULL, result: null};
			break;
			case 'Claim':
				var epoch = events[i].returnValues.epoch;
				var sender = events[i].returnValues.sender;
				
				if(wallets[sender] != null && wallets[sender][epoch] != null){
					wallets[sender][epoch].result = true;		
				}
			break;				
		}
	}
}

const blockLimit = 1000;

let init = async () => {	
	// READ BLOCKS
	const latest = await web3.eth.getBlockNumber();
	let block = latest - blockLimit;
	
	console.log('READ FROM BLOCK "' + block + '" to "' + latest + '"');

	var deepReach = 10;
	var step = 1;
	
	var reach = (blockFrom, blockTo) => {
		predictionContract.getPastEvents(['Claim', 'BetBull', 'BetBear' ], {
			fromBlock: blockFrom,
			toBlock: blockTo
		}, function(error, events){ })
		.then(function(events){
			populateAnalytics(events);
			
			var from = blockFrom-blockLimit;
			var to = blockFrom;			
			
			console.log('READ FROM BLOCK "' + from + '" to "' + to + '"');
			
			if(step >= deepReach){
				sortByRate();
				providerConnect();
				return;
			} else {				
				reach(from, to);
				step++;
			}
		})
		.catch((err) => console.error(err));		
	}
	
	reach(block, 'latest');
}

init();

let BetBear = async (sender, epoch, amount) => {
	console.log('BetBear: ' + sender + ', ' + epoch + ', ' + amount);
	
	if(wallets[sender] != null && wallets[sender][epoch] != null){
		//console.log('-> TIP: SENDER ALREADY REGISTERED FOR #' + epoch);
		//console.log(wallets[sender][epoch]);
		return;
	}
	
	let = bnb = parseFloat(await web3.utils.fromWei(amount + '', "ether"));
	
	if(wallets[sender] == null)
		wallets[sender] = {'win': 0, 'rounds': 0, 'result': 0};
	
	wallets[sender][epoch] = {bet: BET_BEAR, result: null};
	
	if(
		(
			(wallets[sender].result >= process.env.COPY_WIN_RATE && wallets[sender].rounds >= process.env.COPY_ROUNDS_PLAYED)
		)	
	){
		console.log('* GOOD PLAYER (#' + epoch + ') (' + wallets[sender].win + '/' + wallets[sender].rounds + '/' + wallets[sender].result + '%) BET BEAR: ' + sender + ' -> ' + bnb + ' BNB');
		bearCount++;
		bearAmount = bearAmount + bnb;	
		return;
	}
}

let BetBull = async (sender, epoch, amount) => {
	console.log('BetBull: ' + sender + ', ' + epoch + ', ' + amount);
	
	if(wallets[sender] != null && wallets[sender][epoch] != null){
		return;
	}	
	
	let = bnb = parseFloat(await web3.utils.fromWei(amount + '', "ether"));

	if(wallets[sender] == null)
		wallets[sender] = {'win': 0, 'rounds': 0, 'result': 0};
	
	wallets[sender][epoch] = {bet: BET_BULL, result: null};
	
	if(
		(
			(wallets[sender].result >= process.env.COPY_WIN_RATE && wallets[sender].rounds >= process.env.COPY_ROUNDS_PLAYED)
		)
	){
		console.log('* GOOD PLAYER (#' + epoch + ') (' + wallets[sender].win + '/' + wallets[sender].rounds + '/' + wallets[sender].result + '%) BET BULL: ' + sender + ' -> ' + bnb + ' BNB');
		bullCount++;
		bullAmount = bullAmount + bnb;
		return;
	}	
}

let Claim = async (sender, epoch, amount) => {
	if(wallets[sender] != null && wallets[sender][epoch] != null && wallets[sender][epoch].result != null){
		return;
	}	
	
	let = bnb = parseFloat(await web3.utils.fromWei(amount + '', "ether"));	
	
	if(wallets[sender] != null && wallets[sender][epoch] != null){
		wallets[sender][epoch].result = true;		
	}
}

let EndRound = async (epoch, roundId, price) => {
	sortByRate();
	
	let check = async () => {
		let round = await predictionContract.methods.rounds(epoch).call();
		
		lockPrice = round.lockPrice/100000000;
		closePrice = round.closePrice/100000000;		
		
		let bet = bets[epoch];
		
		if(bet != null && bet.checked == false){			
			resultType = closePrice > lockPrice ? BET_BULL : BET_BEAR;
			
			let totalAmount = web3.utils.fromWei(round.totalAmount, "ether");
			let bullAmount = web3.utils.fromWei(round.bullAmount, "ether");
			let bearAmount = web3.utils.fromWei(round.bearAmount, "ether");			
			let bearPayout = totalAmount/bearAmount;
			let bullPayout = totalAmount/bullAmount;		
			
			let lastResult = resultType == bet.direction;
			
			payout = 0;
			let earning = 0;
			let averagePayout = 0;
			if(resultType == bet.direction){				
				earning = bet.direction == BET_BULL ? bet.value*bullPayout : bet.value*bearPayout;
				payout = bet.direction == BET_BULL ? bullPayout : bearPayout;
				earnings = earnings + earning;
				
				payoutCount++;
				payoutAmount = payoutAmount + payout;
				averagePayout = payoutAmount/payoutCount;
				loaded = 0;
				
				won++;
				
				claim(epoch);
			} else {
				//process.exit(0);
				registerLoss(bet.value);
				earning = bet.value*(-1);
				
				lost++;
			}
			
			// log
			let total = won + lost;
			let rate = (won*100)/total;			
			let strBet = 'BET: ' + epoch + ',' + bet.value + ',' + bet.direction + ',' + (lastResult ? 'WON' : 'LOST') + ',' + payout + ',RATE: ' + rate.toFixed(3) + '%,AVERAGE PAYOUT: '+ (payoutCount > 0 ? (payoutAmount/payoutCount) : 0);
			
			if(resultType == bet.direction){	
				console.log('|-> BET WON #' + epoch + ', PAYOUT: ' + payout + ', EARNING: ' + earning + ', CURRENT PROFIT: ' + (earnings-investiment) + ', AVERAGE PAYOUT: ' + averagePayout);
			} else {
				console.log('|-> BET LOST #' + epoch + ', LOST: ' + earning + ', CURRENT PROFIT: ' + (earnings-investiment));
			}

			logger('bet.log.txt', strBet); 			
			bets[epoch].checked = true; 
			
			console.log('|-> TIP COUNT: ' + totalValidTips);
		} else if(bet != null && bet.checked) {
			console.log('-> EPOCH #' + epoch + ' ALREADY VERIFIED');
		}
	}
	
	setTimeout(check, 10000);	
}

let timeout = null;
let timeoutRedundance = null;

let start = {};

let Redundance = async () => {
	// READ BLOCKS
	const latest = await web3.eth.getBlockNumber();
	let block = latest - 100

	predictionContract.getPastEvents(['BetBull', 'BetBear' ], {
				fromBlock: block,
				toBlock: 'latest'
			}, function(error, events){ })
			.then(function(events){
				for(var i = 0 ; i < events.length ; i++){			
					switch(events[i].event){
						case 'BetBear':
							var epoch = events[i].returnValues.epoch;
							var sender = events[i].returnValues.sender;
							var amount = events[i].returnValues.amount;
							
							BetBear(sender, epoch, amount);							
						break;
						case 'BetBull':
							var epoch = events[i].returnValues.epoch;
							var sender = events[i].returnValues.sender;
							var amount = events[i].returnValues.amount;
							
							BetBull(sender, epoch, amount);							
						break;				
					}
				}
			}
			)
			.catch((err) => console.error(err));	
};

let StartRound = async (epoch) => {
	if(start[epoch] != null)
		return;
	
	start[epoch] = true;
	
	let round = await predictionContract.methods.rounds(epoch).call();
	let delay = getCurrentTimestamp()-round.startTimestamp;	
	
	console.log('StartRound:' + epoch + ' with delay of '  + delay + ' seconds');
	delay = delay < 0 ? 0 : delay;
	delay = delay > 10 ? 10 : delay;
	
	bullCount = 0;
	bullAmount = 0;
	bearCount = 0;
	bearAmount = 0;
	
	currentRound = epoch;
	
	var checkBet = 300000 - ((secondsToBet+delay)*1000);
	
	try{
		clearTimeout(timeout);
	} catch(e){}
	timeout = setTimeout(() => { fetchRoundData(epoch); }, checkBet);
	
	try{
		clearTimeout(timeoutRedundance);
	} catch(e){}
	timeoutRedundance = setTimeout(Redundance, checkBet-1000);	
}

const providerConnect = () => {
	console.log(rpcArr);
	
	for(var i in rpcArr){
		var pos = provider.length;
		
		provider[pos] = new ethers.providers.JsonRpcProvider(rpcArr[i]);
		
		
		// provider log
		provider[pos].on('open', () => {
			console.log('OPEN');
		});

		provider[pos].on('close', () => {
			console.log('PROVIDER SOCKET CLOSE: TRYING TO RECONNECT...');
		})

		provider[pos].on('pong', () => {
			console.log('PROVIDER SOCKET PONG');
		})
		
		provider[pos].on('error', (e) => {
			//console.log(e);
			//console.log('* PROVIDER SOCKET ERROR: TRYING TO RECONNECT IN 1S...');
		})	
		
		wallet[pos] = new ethers.Wallet(privateKey, provider[pos]);
		signer[pos] = wallet[pos].connect(provider[pos]);
		
		var isMainNode = mainNode == rpcArr[i];
		
		events = [
				'event BetBear(address indexed sender, uint256 indexed epoch, uint256 amount)',
				'event BetBull(address indexed sender, uint256 indexed epoch, uint256 amount)',
				'event Claim(address indexed sender, uint256 indexed epoch, uint256 amount)',
				'event EndRound(uint256 indexed epoch, uint256 indexed roundId, int256 price)',
				'event StartRound(uint256 indexed epoch)'
			];			
			

		prediction[pos] = new ethers.Contract(
			pancake_prediction_address,
			events,
			signer[pos]
		);
	
		prediction[pos].on('Claim', Claim);		
		prediction[pos].on('EndRound', EndRound);	
		prediction[pos].on('StartRound', StartRound);
		
		console.log('LISTENING ' + rpcArr[i] + '...');
	}
}

let sortByRate = () => {
	analytics = [];
	for(var sender in wallets){
		var count = 0;
		var success = 0;
		for(var epoch in wallets[sender]){
			if(epoch == 'result' || epoch == 'win' || epoch == 'rounds' )
				continue;
			
			count++;
			
			if(wallets[sender][epoch].result === true)
				success++;
		}

		if(count > 0){
			wallets[sender]['result'] = (success*100)/count;
			wallets[sender]['win'] = success;
			wallets[sender]['rounds'] = count;
			analytics.push({wallet: sender, rate: wallets[sender]['result'], rounds: count, win: success});
		}
	}
	
	if(analytics.length == 0){
		return false;
	}

	// sort by value
	analytics.sort(function (a, b) {
		return b.rate - a.rate || b.rounds - a.rounds;
	});
	
	try{
		var strResult = "";
		for(var i = 0 ; i < analytics.length ; i++){
			if(typeof analytics[i] == 'undefined')
				return null;
			
			if(analytics[i].rate == 0){
				continue;
			}
			
			strResult += analytics[i].wallet + ' ' + analytics[i].rate + '% / ' + analytics[i].rounds + ' / ' + analytics[i].win + os.EOL;
		}
		
		try{
			fs.open('big.players.data.test2.txt', 'w', 666, function( e, id ) {
				fs.write( id, strResult, null, 'utf8', function(){
					fs.close(id, function(){
						console.log('* LOG UPDATED');
					});
				});
			});
		} catch(e){
			console.log(e);
		}		
		
	} catch(e){
		console.log(e);
	}
	

}

const fetchRoundData = async (epoch) => {	
	console.log('#EPOCH (' + epoch + ') COUNT TEST ' + bearCount + ' BEAR/ ' + bullCount + ' BULL')
	console.log('#EPOCH (' + epoch + ') AMOUNT TEST ' + bearAmount + ' BNB BEAR/ ' + bullAmount + ' BNB BULL')
	
	if(bearCount == 0 && bullCount == 0)
		return;
	
	totalValidTips = totalValidTips + bearCount + bullCount;
	
	if(
		(bearCount > 1 && bearCount > bullCount && bearAmount > bullAmount)
	){
		var b = getBet();
		
		console.log('|-> EPOCH: ' + epoch + ' -> BEAR - ' + b);			
		// register bet
		bets[epoch] = {direction: BET_BEAR, value: b, checked: false};
		// increase investiment
		investiment = investiment + b;
		
		loaded = loaded + b;
		maxLoaded = loaded > maxLoaded ? loaded : maxLoaded;
		
		if(process.env.DEMO_MODE == 0){
			bear(epoch, b.toFixed(18));
		}
		
		setTimeout(() => { EndRound(epoch, 0, 0); }, 340000);
		betAmount = b;
		return;
	} 

	if(
		(bullCount > 1 && bullCount > bearCount && bullAmount > bearAmount)
	){
		var b = getBet();
		
		console.log('|-> EPOCH: ' + epoch + ' -> BULL - ' + b);			
		// register bet
		bets[epoch] = {direction: BET_BULL, value: b, checked: false};
		// increase investiment
		investiment = investiment + b;

		loaded = loaded + b;
		maxLoaded = loaded > maxLoaded ? loaded : maxLoaded;	
		
		if(process.env.DEMO_MODE == 0){
			bull(epoch, b.toFixed(18));
		}
		
		setTimeout(() => { EndRound(epoch, 0, 0); }, 340000);
		betAmount = b;
		return;
	}
}

const bull = (epoch, amount) => {	
	(async () => {	
		const amountIn = await web3.utils.toWei(amount, "ether");
		const gasPrice = await web3.eth.getGasPrice();
		
		const query = await predictionContract.methods.betBull(epoch);

		const tx = {
			from: myWallet,
			// target address, this could be a smart contract address
			to: pancake_prediction_address, 
			// optional if you are invoking say a payable function 
			value: web3.utils.toHex(amountIn),
			// this encodes the ABI of the method and the arguements
			data: query.encodeABI(),
			// gas price
			gasPrice: web3.utils.toHex(gasPrice), 
			// estimated gas
			gasLimit: web3.utils.toHex(450000),
			// nonce
			nonce: web3.eth.getTransactionCount(myWallet),
		};
		
		const signPromise = web3.eth.accounts.signTransaction(tx, privateKey);
		
		signPromise.then((signedTx) => {
			// raw transaction string may be available in .raw or 
			// .rawTransaction depending on which signTransaction
			// function was called
			const sentTx = web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);  

			sentTx.on("receipt", receipt => {
				console.log(receipt);
			});

			sentTx.on("error", err => {
				console.log("1" + err);	
				
				delete bets[epoch];
				registerReversion();
			});
		  
		}).catch((err) => {		
			console.log("2" + err);

			delete bets[epoch];
			registerReversion();
		});	
	})()
	
}

const bear = (epoch, amount) => {	
	(async () => {		
		const amountIn = await web3.utils.toWei(amount, "ether");
		const gasPrice = await web3.eth.getGasPrice();
		
		const query = await predictionContract.methods.betBear(epoch);

		const tx = {
			from: myWallet,
			// target address, this could be a smart contract address
			to: pancake_prediction_address, 
			// optional if you are invoking say a payable function 
			value: web3.utils.toHex(amountIn),
			// this encodes the ABI of the method and the arguements
			data: query.encodeABI(),
			// gas price
			gasPrice: web3.utils.toHex(gasPrice), 
			// estimated gas
			gasLimit: web3.utils.toHex(450000),
			// nonce
			nonce: web3.eth.getTransactionCount(myWallet),
		};
		
		const signPromise = web3.eth.accounts.signTransaction(tx, privateKey);
		
		signPromise.then((signedTx) => {	
			// raw transaction string may be available in .raw or 
			// .rawTransaction depending on which signTransaction
			// function was called
			const sentTx = web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);  

			sentTx.on("receipt", receipt => {
				console.log(receipt);
			});

			sentTx.on("error", err => {
				console.log("1" + err);	
				
				delete bets[epoch];
				registerReversion();
			});
		  
		}).catch((err) => {			
			console.log("2" + err);	

			delete bets[epoch];
			registerReversion();
		});	
	})()
	
}

const claim = async (epoch) => {	
	let claimable = await predictionContract.methods.claimable(epoch, myWallet).call();
	console.log('EPOCH CLAIMABLE #' + epoch + ':' + claimable);
	
	if(claimable){
		const gasPrice = await web3.eth.getGasPrice();
		
		const query = await predictionContract.methods.claim([epoch]);

		const tx = {
			from: myWallet,
			// target address, this could be a smart contract address
			to: pancake_prediction_address, 
			// this encodes the ABI of the method and the arguements
			data: query.encodeABI(),
			// gas price
			gasPrice: web3.utils.toHex(gasPrice), 
			// estimated gas
			gasLimit: web3.utils.toHex(450000),
			// nonce
			nonce: web3.eth.getTransactionCount(myWallet),
		};
		
		const signPromise = web3.eth.accounts.signTransaction(tx, privateKey);
		
		signPromise.then((signedTx) => {	
			// raw transaction string may be available in .raw or 
			// .rawTransaction depending on which signTransaction
			// function was called
			const sentTx = web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);  

			sentTx.on("receipt", receipt => {
				console.log(receipt);
			});

			sentTx.on("error", err => {
				console.log("1" + err);	
			});
		  
		}).catch((err) => {		  
			console.log("2" + err);		  
		});			
	}
}