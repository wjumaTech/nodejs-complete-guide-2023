const fs = require('fs');

const unlinkFile = ( file ) => {

	fs.unlink(file, (err) => {
		if( err ) {
			throw Error(err);
		}
	})
}

module.exports = unlinkFile;