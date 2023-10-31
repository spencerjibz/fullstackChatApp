let { log, clear } = console
log(typeof log, typeof clear)

// setup and global
let {
	sendFile,
	recieveFile,
	sockSwitch,
	isloaded,
	typed,
	isRecording,
	recorded,
} = window
let Upload,
	aud,
	img,
	Input,
	FileUpload,
	recordBtn,
	recordVis,
	mic,
	recorder,
	soundFile,
	RecFile,
	secUrl,
	rec,
	state = 0
function setup() {
	noCanvas()
	Upload = select("#upload")
	recordVis = createImg(
		"https://img.icons8.com/nolan/50/000000/audio-wave.png"
	).hide()
	secUrl = "https://img.icons8.com/color/48/000000/record.png"
	FileUpload = createFileInput(handleFile).hide()
	Input = document.getElementById("texter")
	recordBtn = select("#recordBtn")
	recordVis.class("recordVis")
	Upload.mouseClicked(handleUpload)
	recordBtn.mousePressed(handleRecord)
	// audio section
	mic = new p5.AudioIn()

	// create a sound recorder
	recorder = new p5.SoundRecorder()

	// create an empty sound file that we will use to playback the recording
	soundFile = new p5.SoundFile()
}
let $Message = (msg, label) => {
	let container = select("#txt")
	let li = createElement("li", msg)
	li.addClass(label)
	container.child(li)
	return li
}
let $Header = (msg) => {
	select("#header").html(msg)
}

function handleUpload(e) {
	Upload.child(FileUpload)
	FileUpload.show()
	FileUpload.input(handleFile)
}
// handled recording

/// handle the choosed files

function handleFile(file) {
	upFile = file
	// logic to handle the file uploaded
	switch (file.type) {
		case "audio": // HANDLE VIDEOS
			aud = createAudio(file.data).hide()

			aud.showControls()
			$Message("audio", "sent").child(aud)
			$(".messages").animate(
				{
					scrollTop: $(document).height(),
				},
				"fast"
			)
			sendFile(file, () => {
				aud.show()
				FileUpload.hide()
			})

			break
		case "image": // HANDLE IMAGES FILES
			img = createImg(file.data).hide()
			$Message("image", "sent").child(img)
			img.show()
			img.size(200, 200)
			$(".messages").animate(
				{
					scrollTop: $(document).height(),
				},
				"fast"
			)
			sendFile(file, () => {
				log(img)
				FileUpload.hide()
			})
			break
		case "video":
			let vid = createVideo(file.data).hide()
			vid.showControls()
			vid.size(400, 400)
			$Message("video", "sent").child(vid)
			$(".messages").animate(
				{
					scrollTop: $(document).height(),
				},
				"fast"
			)
			sendFile(file, () => {
				vid.show()
				FileUpload.hide()
			})

			break

		default:
			break
	}
}
// handle typing
let typedArrayToURL = (typedArray, mimeType) => {
	return URL.createObjectURL(
		new Blob([typedArray.buffer], {
			type: mimeType,
		})
	)
}
// add recieved files to the dom
recieveFile((data) => {
	RecFile = data
	log(data.sentFile.file, RecFile)
	let { sentFile, username } = data

	let buff = new Uint8Array(sentFile.file)
	let loc = typedArrayToURL(buff, {
		type: `${sentFile.type + "/" + sentFile.subtype}`,
	})
	let src = `data:${
		sentFile.type + "/" + sentFile.subtype
	};base64,${window.btoa(sentFile.file)}`
	log(src)
	switch (sentFile.type) {
		case "audio":
			let sentAud = createAudio(loc).hide()
			// sentAud.elt.setAttribute('src', `data:${sentFile.type +'/'+sentFile.subtype};base64,${window.btoa(sentFile.data)}`)
			sentAud.showControls()
			$Message(username, "replies").child(sentAud)
			sentAud.show()
			$(".messages").animate(
				{
					scrollTop: $(document).height(),
				},
				"fast"
			)

			break
		case "image":
			let sentImg = createImg(sentFile.data)
			//sentImg.elt.setAttribute('src',`data:${sentFile.type +'/'+sentFile.subtype};base64,${window.btoa(sentFile.data)}`)
			$Message(username, "replies").child(sentImg)
			sentImg.show()
			sentImg.size(200, 200)
			$(".messages").animate(
				{
					scrollTop: $(document).height(),
				},
				"fast"
			)
			break
		case "recording":
			$(` .list-group li:contains(${sockSwitch.username})`).html(
				sockSwitch.username
			)
			sentRec = sentFile.data
			log(sentRec)
			let con = new Uint8Array(sentFile.data)
			rec = createAudio(
				typedArrayToURL(con, { mimeType: sentFile.Mimetype })
			).hide()
			rec.showControls()

			$Message(username, "sent").child(rec)
			rec.show()
			$(".messages").animate(
				{
					scrollTop: $(document).height(),
				},
				"fast"
			)

			break
		case "video": // handle video files
			let sentVid = createVideo(loc).hide()
			sentVid.size(400, 400)
			sentVid.showControls()
			$Message(username, "replies").child(sentVid)
			sentVid.show()
			$(".messages").animate(
				{
					scrollTop: $(document).height(),
				},
				"fast"
			)

			break
		default:
			break
	}
})
// add audio recording to the chatapp
function handleRecord() {
	// users must manually enable their browser microphone for recording to work properly!
	mic.start()

	// connect the mic to the recorder
	recorder.setInput(mic)

	// use the '.enabled' boolean to make sure user enabled the mic (otherwise we'd record silence)
	// Tell recorder to record to a p5.SoundFile which we will use for playback

	if (mic.enabled) {
		recorder.record(soundFile)
		isRecording()
		log("recording....")

		//  hide the at
		recordBtn.hide()

		$(".recordVis").appendTo(".message-input .wrap")

		recordVis.size(30, 30)
		recordVis.show()
		state++
		recordVis.mousePressed(() => {
			if (recorder.recording) {
				recorder.stop()
				mic.stop()

				log("recording stopped")
			} else {
				// audiobuffer to blob

				setTimeout(() => {
					// play the result!
					//RecFile= save(soundFile, 'mySound.wav',true); // save file
					recordVis.hide()
					RecFile = soundFile.getBlob()
					log(RecFile)
					rec = createAudio(URL.createObjectURL(RecFile)).hide()
					rec.showControls()

					$Message("recording", "sent").child(rec)
					rec.show()
					$(".messages").animate(
						{
							scrollTop: $(document).height(),
						},
						"fast"
					)

					let file = {
						type: "recording",
						Mimetype: RecFile.type,
						file: RecFile.size,
						data: RecFile,
						name: `${sockSwitch.id}+${Math.random()}.wav`,
					}
					sendFile(file, () => {
						recordBtn.show()
					})
				}, 100)
			}
		})
	}
}

new p5()
