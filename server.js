let path = require('path')
let fs = require('fs')
let express = require('express')
let http = require('http')
let app = express()
let port = process.env.PORT|| 7200 
let parser = require('body-parser')
let logger = require('morgan')
let {Run} = require('./lib/programerrun')
let {exec} = require('child_process')
let {callbackify,promisify} = require('util')
let chDir = callbackify(promisify(process.chdir))
let DeleteEleByName = require('./client/src/utils/deleteByname')
let {
    Duplex,
    Readable
} = require('stream')

const {
    log
} = console

// initial
let server = http.createServer(app)
let io = require('socket.io')(server)
// middleware section 
app.use(logger('dev'))
app.use(parser.json())
// config server
server.listen(port, () => {
    log(`App started at ${port}`)
    log(process.cwd())
    

    // change directory to client and  run start-script
if(process.cwd().includes('client')) {
exec('yarn start', (data,err) => err ? log(err): log('starting react-client'))
}
process.chdir('./client')
// 
exec('yarn start', (err, done) => err ? log(err) : log('starting react-client'))

})

// routes
app.get('/api', (req, res) => {
  res.json({message:'Welcome to the api'})
})
// config socket.io
let numUsers;
let unts = new Set()
let users 
io.on('connection', (socket) => {
// create a table for users
   
    let addedUser = false
    log(`${socket.id} connected sucessfully`)


    // when the client emits  'add user', this listen and excutes 
    socket.on('add user', (username) => {

        if (addedUser) return;

        // we store the username in the socket session for this client 

        socket.username = username;
        unts.add(username)
        users = [...unts]
       
      numUsers = users.length
        addedUser = true;
        socket.emit('login', {
            numUsers,users
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers,users
        })
    })
    // when the client emits new message, this listen and executes
    socket.on('message', (data) => {
        if (socket.username) {
            // we tell the client to execute the new message
            socket.broadcast.emit('message', {
                username: socket.username,
                message: data
            })

        } else {
            // send a message to the username, that they no a part of the join chat, they should exit and regroup

            socket.emit('message', {
                username: 'admin',
                message: `your not a part of the group chat anymore, exit and rejoin`
            })
        }

    })
    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', () => {
        if (socket.username) {
            socket.broadcast.emit('typing', {
                username: socket.username
            })
        }

    })
    // when the client is recording an audio, we broadcast it to others
    socket.on('recording',()=>{
        if(socket.username){
            socket.broadcast.emit('recording',{
                username:socket.username
            })
        }
    })
    // when a new joins, let other know here is 


    socket.on('end', () => {

 let {username} = socket

        if (addedUser) {
            
            //DeleteEleByName(users,socket.username)
        
           unts.delete(username)
           users = [...unts]
            log(users)
            numUsers = users.length
            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers,
                users
            });
            // disconnect the users from the backend 

            socket.disconnect({
                close: true
            })
        }

    })
    // listen for discontinues
    socket.on('disconnect', () => {
        if (addedUser) {
            
            log(`${socket.id} disconnected , ${numUsers} left`)
        }

    })
    /* Buffer to Duplex function 
     function bufferToStream (buffer){
let stream = new Readable({objectMode: true,
    read() {}
    })
     stream.push(buffer)
     stream.push(null)
     return stream
     }
     */
    // listen for the files
    socket.on('File', file => {
        // 
        const {
            username
        } = socket
        if (addedUser) {
            // send the file now
            let username = socket.username,
                sentFile = file
                
            setTimeout(() => socket.compress(true).broadcast.emit('sent-file', {
                username,
                sentFile
            }), 5)
            /*create readable stream

            let pathName = path.resolve(`./temp-files/${file.name}`)
             let read = fs.appendFile(pathName,file.file,(err)=>
             { if(err) {log(err)}
             
             
             let  readStream = fs.createReadStream(pathName,{encoding:'binary'}), chunks = [];
                   log(read)

                   readStream.on('data', chunk => {
                       chunks.push(chunk)
                       
                   })
                   //  handle error
                   readStream.on('error', err => log(err))
                   // hande file now
                   readStream.on('close', () => {
                       log('gone to close ....')
                       /// broadcast the file 
                       
                      
                       // delete the file from file system
                       fs.unlink(pathName, (err) => err ? log(err) : log('file successfulled loaded'))

                   })
             
               })
               */


        }


    })
})
// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
    // set static folder
    app.use(express.static('client/build'))

    app.use('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}