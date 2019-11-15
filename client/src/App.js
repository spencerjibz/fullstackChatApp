import React, { Component } from 'react'
import './App.css';
import $ from 'jquery'
import Helmet from 'react-helmet'
import Transporter from './utils/socket'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'

import {ListGroup,ListGroupItem,Form,Button,Row,Col,Container} from 'react-bootstrap'
let sockSwitch
let {AddUser,AddMessage,login,AddParticipates,RecieveMessage,isTyping,typed,joined,EndChat,Left,SendFile,RecieveFile,socket,isRecording,recorded} = Transporter()
window.$ = $
// for p5 to get access to the socket method
window.sendFile = SendFile
window.recieveFile = RecieveFile
window.sockSwitch = socket
window.typed = typed
window.isRecording = isRecording
window.recorded = recorded
window.isloaded  = false
sockSwitch = socket;
const {log} = console
// randon colors for different messages
let colors = [
  '#e21400', '#91580f', '#f8a700', '#f78b00',
  '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
  '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
];
let random_color = colors[Math.floor(Math.random() * colors.length)];
let repl = colors[Math.floor(Math.random()*colors.length-2)]
export default class App extends Component {
	constructor(props){
   super(props)
   this.state = {isUser:false,username:'',isActive:false,message:'',users:[],isTyping:'',toggleEmoji:false}
   this.handleChange = this.handleChange.bind(this)
   this.handleSubmit = this.handleSubmit.bind(this)
   this.sendMessage = this.sendMessage.bind(this)
   this.handleExit = this.handleExit.bind(this)
   this.handleTyping = this.handleTyping.bind(this)
	}
	handleChange(e){
		this.setState({
			[e.target.name]: e.target.value
		})
  }
  

  sendMessage(e) {
    e.preventDefault()
    if (this.state.message.length > 0) {
      AddMessage(this.state.message,()=>{
        $Message(`<p>${this.state.message}</p>`, 'sent')
 this.setState({
   message: ''
 })
 $('#texter').val('')
 $(".messages").animate({
   scrollTop: $(document).height()
 }, "fast");


      })
     
    }

     



  }
  handleTyping(e){

 isTyping()


  }
	handleSubmit(e){
   e.preventDefault()
// username verification
if(this.state.username.length>0){
  // connect the socket and  login users
sockSwitch.connect()  
AddUser(this.state.username,()=>{
this.setState({isUser:true,isActive:true})
login(data=>{
 this.setState({users:data.users})
let msg = ` <h5 style='color:lightblue;'id='head'>${data.numUsers===1?' 1 participant':`${data.numUsers} participants`}</h5>`

$Header(msg)

})
window.isloaded = true



})

  

}
// Recieve Message from others 
RecieveMessage((data) => {
 this.setState({isTyping:false})
  $(` .list-group li:contains(${data.username})`).html(data.username)
  let msg = `<span><h6 style='color:${repl};'>${data.username}</h6><p style='color:${random_color};'>${data.message}</p></span>`
 $Message(msg,'replies')
  $(".messages").animate({
   scrollTop: $(document).height()
 }, "fast");
  let replies = document.getElementsByClassName('replies')
  let arr = [...replies]
  //  remove any duplicates 
  var map = {};
  $(".replies").each(function () {
    var value = $(this).text();
    if (map[value] == null) {
      map[value] = true;
    } else {
      $(this).remove();
    }
  });
  if(arr.length>0){
    // add different color to the replies
 arr.forEach(v=>{
   v.style.color = repl

 })
 
  }
})
    // recieve typing 
    let typer
    typed((data)=>{
      log('typings')
      typer = data.username
       this.setState({isTyping:true})
      $(` .list-group li:contains(${data.username})`).html(`${data.username} typing...`)
      // 

      setTimeout(() => $(` .list-group li:contains(${typer})`), 2000)
  
  

    })
  
   
  
    
// notify  others if someone leaves
Left((data) => {
  if (data) {
    this.setState({users:data.users})
    let msg = `<h5 style='color:${random_color};'>${data.username}  left chat</h5><p style='color:${random_color};'>${data.numUsers} involved</p>`
   $Header(msg)
  }

})

 // alert others users if another user has joined
 joined((data) => {
   let {users} = data
   this.setState({users})
   let msg = `<p>${data.username}  joined </p><br><p>${data.numUsers} participates now</p>`
   $Header(msg)
 })


  }
  // add Emojis
  addEmoji(e){
    let sym = e.unified.split('-')
    let codesArray = []
    sym.forEach(el => codesArray.push('0x' + el))
    let emoji = String.fromCodePoint(...codesArray)
     this.setState({message:this.state.message+emoji,toggleEmoji:false})
    
  }
  // toggle emoji 
  showEmoji(e){
e.preventDefault()
this.setState({toggleEmoji:true})


  }

  handleExit(){
EndChat(() => {
  $(".messages").animate({
    scrollTop: $(document).height()
  }, "fast");

  $('#messages').empty()
  this.setState({
    active: false,
    isUser: false,
    username: ''
  })
  sockSwitch.close()
  window.isloaded = false
  //prevent sketch from loading twice by reloading from cache
 window.location.reload(false)
  log('logged out',sockSwitch)
})

  }
  render() {
    return  this.state.isUser?(
      <div id='frame'>
       <Sidepanel Active={this.state.users}/>
        <Content Username={this.state.username} handleChange={this.handleChange} Typing ={this.handleTyping.bind(this)} ToggleEmoji={this.state.toggleEmoji} Emoji={this.showEmoji.bind(this)} addEmoji={this.addEmoji.bind(this)} sendMsg={this.sendMessage} Msg={this.state.message} Exit={this.handleExit} Sent={this.state.Sent}/>
      <Helmet>
          <script lang='javascript' src='/sketch.js' id='myscript' async={false}></script>
      </Helmet>
      </div>
    ):(
       
   <Container className='jumbotron' id='init'>

 <ListGroup style={{margin:'100px'}}>
     <div className='text-center'>
  <h3 style={{color:'lightblue'}}>Welcome to My Chat Room</h3>

     </div>

     <ListGroupItem style={{position:'center'}}>
        
  <Form onSubmit={this.handleSubmit}>
      <Row className = "justify-content-md-center" >
 <Form.Group controlId="formBasicEmail" style={{width:'50%',margin:'10px'}}>
   <Col> Choose a Username:<br/>
   <Form.Control type="text" value={this.state.username} name="username" onChange={this.handleChange}/>
   <br/>
    <Button  variant="secondary" type="submit">
    Enter ChatRoom
  </Button>
  </Col>
    
  </Form.Group>
  </Row>
  </Form>
  
  </ListGroupItem>
</ListGroup>
    </Container>)
  }
}
// content 
let $Message = (msg,label)=> {
  $(`<li class=${label}>${msg}</li>`).appendTo($('.messages ul'));
}
let $Header =(msg)=>{
  $('#header').html(msg)
}
class Content extends Component{

	componentDidMount(){
		$(".messages").animate({
			scrollTop: $(document).height()
		}, "fast");
    log(sockSwitch)
    $('.recordVis').appendTo('.message-input .wrap')
	}
	
		
	
	// send the message 
	
	   
   render(){
     const {Sent} = this.props
     return (
<div className='content'>
<div className='contact-profile '>

           <p className='text-center'>{this.props.Username}</p>
     
      <div className="social-media">
             {(<i className="ion-md-exit" onClick={this.props.Exit}></i>)||(<button className='alert alert-success' OnClick={this.props.Exit}>Exit</button>)}
			

</div>
</div>
<div className='messages'>
<ul id='txt'>

</ul>
         </div>
           {this.props.ToggleEmoji ? (<span><Picker set='emojione' title='Pick your emoji…' emoji='point_up' 
           style={{ position: 'absolute', bottom: '20px', right: '20px' }}
           onSelect={this.props.addEmoji}/></span>):null}


<div className='message-input'>
           <div className="wrap">
             <form id='inputCont' >
             <input type="text" id='texter' onBeforeInput={this.props.Typing} name='message' placeholder="Write your message..." value={this.props.Msg} onChange={this.props.handleChange} />
               
             <i className="fa fa-paperclip attachment" id='upload' aria-hidden="true">
                 
             <input type='file'  id='uploader' style={{display:'none'}}></input></i>
               <i className="ion-ios-happy"  onClick={this.props.Emoji}></i> 
               <i className="ion-md-mic" id='recordBtn'></i> 
             <button className="submit" onClick={this.props.sendMsg}><i className="fa fa-paper-plane" aria-hidden="true"></i></button>
             </form>
           </div>
          
</div>

</div>

     )
   }
}

class Sidepanel extends Component{
  constructor(props){
    super(props)
  }
  render(){
    const {Active} = this.props
    return (<div id='sidepanel'>
        <div id='#contacts'>
      <span> <p className='alert-alert-info text-center' id='header'></p></span>
        <ul className='list-group text-center' >
        Active users:
     {Active.length>0? Active.map((v,i)=><li  className ='list-group-item alert-info' id='users' key={i}>{v}</li>):null}


      </ul>
      </div>

    </div>)
  }
}




