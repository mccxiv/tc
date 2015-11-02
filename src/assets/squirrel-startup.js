module.exports = function() {
	if (process.platform !== 'win32') return false;

	var squirrelCommand = process.argv[1];

	if (squirrelCommand) {
		var createShortcut;
		var app = require('app');
		var path = require('path');
		var execSync = require('child_process').execSync;
		var target = path.basename(process.execPath);
		var updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');

		switch (squirrelCommand) {
			case '--squirrel-install':
				createShortcut = updateDotExe + ' --createShortcut="' + target + '" --shortcut-locations=Desktop,StartMenu';
				console.log (createShortcut);
				execSync(createShortcut);
				app.quit();
				return true;
			case '--squirrel-uninstall':
				createShortcut = updateDotExe + ' --removeShortcut="' + target + '"';
				console.log (createShortcut);
				execSync(createShortcut);
				app.quit();
				return true;
			case '--squirrel-updated':
			case '--squirrel-obsolete':
				app.quit();
				return true;
		}
	}
};