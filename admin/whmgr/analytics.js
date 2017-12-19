const fs = require('fs');
const sortBy = require('sort-by');

class Analytics {
	/**
	  * Constructor used to set the account
	  * of the user.
	*/
	constructor(account){
		if(account){
			this.account = account;
		}
		else{
			throw "WHMGR Analytics requires an account.";
		}	
	}

	/**
	  * Function used to get all requests.
	  * @return The views.
	*/
	get_all(callback){
		let account = this.account;
		fs.readFile(`/home/${account}/logs/access.log`, (err, log) => {
			if(err){
				throw err;
			}
			else{
				let requests = log.toString().split("\n");
				let views = [];

				for(let i = 0; i < requests.length; i++){
					let the_request = requests[i];
					let system = the_request.split(' ')[12];

					views.push({
						ip: the_request.split(' ')[0],
						time: the_request.split(' ')[3],
						resource: the_request.split(' ')[6],
						system: system
					});
				}

				callback(views.sort(sortBy('-time')));
			}
		});
	}

	/**
	  * Function used to get the requests
	  * from today only.
	*/
	get_today(callback){
		let account = this.account;
		fs.readFile(`/home/${account}/logs/access.log`, (err, log) => {
			if(err){
				throw err;
			}
			else{
				let requests = log.toString().split("\n");
				let views = [];

				for(let i = 0; i < requests.length; i++){
					let the_request = requests[i];
					let system = the_request.split(' ')[12];

					/** 
					  * Only push the request if the data is
					  * today.
					*/
					let date = the_request.split(' ')[3];
						date = date.split('[')[1];
						date = date.split(':')[0];

					// Define the months of the year.
					let months = [
						'',
						'Jan',
						'Feb',
						'Mar',
						'Apr',
						'May',
						'Jun',
						'Jul',
						'Aug',
						'Sep',
						'Oct',
						'Nov',
						'Dec'					
					];

					/** 
					  * Generate todays date to match
					  * the format of apache2's log date.
					*/
					let dateObj = new Date();
					let month = months[('0' + (dateObj.getMonth() + 1)).slice(-2)];
					let day = ('0' + dateObj.getDate()).slice(-2);
					let year = dateObj.getFullYear();
					let shortDate = day + '/' + month + '/' + year;

					if(date == shortDate){
						views.push({
							ip: the_request.split(' ')[0],
							time: the_request.split(' ')[3],
							resource: the_request.split(' ')[6],
							system: system
						});
					}
				}

				callback(views.sort(sortBy('-time')));
			}
		});
	}
}

module.exports = Analytics;