const fs = require('fs');

/**
  * Class used to validate the license
  * file information.
*/
class License {
	/**
	  * Function used to check if the license file exists.
	*/
	static file_exists(){
		return fs.existsSync('./whmgr/license');
	}

	/**
	  * Function used to check if whmgr's license
	  * is valid.
	*/
	static is_valid(){
		if(License.file_exists()){
			return true;
		}
		else{
			return false;
		}
	}
}

module.exports = License;