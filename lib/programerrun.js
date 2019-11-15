let {
    spawn
} = require('child_process')
const {
    log
} = console
const Path = require('path')
//  function that runs the  cmd /bash/terminal commands and binaries with all stdin(interactive)
exports.Run = function Runner(cmd, args, dir, cb) {
    let eve = spawn(cmd, args, {
        cwd: dir,
        stdio: 'inherit',
        stderr: 'inherit'
    })
    eve.on('error', data => cb(data.toString()))
    cb(eve.stderr, eve.stdout, eve.stdin)
}
