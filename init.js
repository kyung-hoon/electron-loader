// usage : node init.js <build target> <temp folder name>
let myArgs = process.argv.slice(2)
installer_build_type = myArgs[0]
let dir = myArgs[1]

// make DIR
const fs = require('fs')
const exec = require('child_process').exec

!fs.existsSync(dir) && fs.mkdirSync(dir)

let target_build_script
if (installer_build_type === 'msi') {
  target_build_script = 'msi_build_env.py'
} else if(installer_build_type === 'squirrel') {
  target_build_script = 'squirrel_build_script.py'
  fs.createReadStream('squirrel_build_index.txt').pipe(fs.createWriteStream('./' + dir + '/squirrel_build_index.txt'));
} else if(installer_build_type === 'nsis'){
  target_build_script = 'windows_build.py'
} else{
  console.log("usage : node init.js <build target> <temp folder name>")
}

// copy python script
fs.createReadStream(target_build_script).pipe(fs.createWriteStream('./' + dir + '/' + target_build_script));
fs.createReadStream('manifest.json').pipe(fs.createWriteStream('./'+ dir +'/manifest.json'));
fs.createReadStream('package.json').pipe(fs.createWriteStream('./'+ dir +'/package.json'));

// init build script
process.chdir(dir)
console.log(process.cwd())
exec("python3 " + target_build_script, function (error, stdout, stderr) {
  console.log('stdout: ' + stdout);
  console.log('stderr: ' + stderr);
  if (error !== null) {
      console.log('exec error: ' + error);
  }
});
// exec("python " + target_build_script)