$win = $(window)
$liquidCrystal = $('#liquidCrystal')
$seekUI = $('#seekUI')
$seekBar = $('#seekBer')
$textArea = $('#textArea')
$repeat = $('#repeat')
$random = $('#random')
$searchBar = $('#search-bar')
$currentTime = $('#currentTime')
$playpause = $('#playpause')
$volume = $('#volume')
$container = $('#container')
$selectBox = $('#select-box')
$dummyNavi = $('#dummyNavi')
player = document.getElementById('player')
domain = 'https://itunes.apple.com/'
country = 'en'
feedType = 'topsongs'
limit = 200
genre = 
	All: ''
	Alternative: 20
	Blues: 2
	Childrens_Music: 4
	Classical: 5
	Country: 6
	Dance: 17
	Electronic: 7
	HipHop_Rap: 18
	Jass: 11
	Pop: 14
	R_and_B_Soul:15
	Reggae: 24
	Rock: 21
	Singer_Songwriter: 10
	Soundtrack: 16
	World:19

titles = []
im_images = []
im_releaseDate = []
link_href_m4a = []
id_label = []
now = 0
isPlaying = false
currentTime=0
currentTimePars=0
$seekSlider = {}
randomFlag = false
repeatFlag = 1
panelWidth=0
paneLineLength = 0
searchFlag = false
nowGenre = 'Dance'
firstLoad = false

trace = ->
	###
		console.log(link_href_m4a[now])
	###

removePanelAnimation = ->
	$container.find('.panel').removeClass('scale')

addPanelAnimation = ->
	$container.find('.panel').removeClass('scale').eq(now).addClass('scale')

setPlayingPanel = ->
	$container.find('.panel').find('div').hide().end().eq(now).find('div').show()

thumbnailAnimation = ->
	###
	何かアニメーション
	###

isRandom = ->
	if randomFlag
		now = Math.floor(Math.random()*limit)

pause = ->
	player.pause()
	removePanelAnimation()

play = ->
	$('#apple').hide()
	$('#thumbnail,#textArea').show()
	if now is link_href_m4a.length
		if repeatFlag is 1
			return false
		else
			now = 0
	else if now is -1
		now = link_href_m4a.length
		
	isRandom()
	player.src = link_href_m4a[now]
	player.error = ->
		alert('error')
	player.play()
	trace()
	thumbnailChanger()
	addPanelAnimation()

thumbnailChanger = ->
	$('#thumbnail').attr 'src', im_images[now]
	$('#title').text titles[now].split(' - ')[0]
	$('#name').text titles[now].split(' - ')[1]
	setPlayingPanel()

onResizeHandler = ->
	width = $win.width()*0.95
	$WW = $win.width()
	if $WW > 1200
		$searchBar.css({'right': 45+'px'}).show()
		$dummyNavi.show()
		$volume.show()
		.next($liquidCrystal).width(580).css({'right': ($WW/2)-290+'px'}).show()
		.find($textArea).width(480)
		.find($seekUI).width($liquidCrystal.width()-120).show()
		.find($repeat).show()
		.next().next($seekBar).show().width($seekUI.width()-100).find('.slider').width($seekUI.width()-100).show()
		.parent().next().next($random).show()
	else if ($WW <= 1200) && ($WW >= 850)
		$searchBar.css({'right': 45-($WW/100)+'px'}).show()
		$dummyNavi.show()
		$volume.hide()
		.next($liquidCrystal).width($WW*0.48).css({'right': ($WW/2)-($liquidCrystal.width()/2)+'px'}).show()
		.find($textArea).width($liquidCrystal.width()-110)
		.find($seekUI).width($liquidCrystal.width()-110)
		.find($repeat).show()
		.next().next($seekBar).show().width($seekUI.width()-100).find('.slider').width($seekUI.width()-100).show()
		.parent().next().next($random).show()
	else if ($WW < 850) && ($WW >= 700)
		$searchBar.css({'right': 15-($WW/100)+'px'}).show()
		$dummyNavi.hide()
		$volume.hide()
		.next($liquidCrystal).width($WW*0.48).css({'right': ($WW/2)-($liquidCrystal.width()/2)+'px'}).show()
		.find($textArea).width($liquidCrystal.width()-110)
		.find($seekUI).width($liquidCrystal.width()-110).show()
		.find($repeat).show()
		.next().next($seekBar).show().width($seekUI.width()-100).find('.slider').width($seekUI.width()-100).show()
		.parent().next().next($random).show()
	else if $win.width()<700
		$dummyNavi.hide()
		$searchBar.css({'right': 15-(($WW)/100)+'px'}).show()
		$liquidCrystal.css({'width': $WW*0.483+'px'}).hide()
		
	for i in [0..9]
		if width > (panelWidth*i) then paneLineLength=i
	$container.width panelWidth*paneLineLength+20


setQuePos = (pos) ->
	player.currentTime = (pos/100)*30

timeupdates = ->
	currentTime = player.currentTime
	currentTimePars = (currentTime/30)*100
	$seekSlider.slider 'setValue', currentTimePars
	nowTime = Math.round(currentTime)
	if nowTime < 10
		nowTime = '0' + nowTime
	$currentTime.empty().text "0:"+nowTime
	isPlaying = true
	

searchBarClose = (e) ->
	if $(e.target).parent('ul').parent('div').attr('id') is 'select-box' || $(e.target).attr('id') is 'search-bar' then return
	searchFlag = false
	$selectBox.hide()

searchBarOpen = ->
	searchFlag = !searchFlag
	if searchFlag
		$selectBox.show()
	else
		$selectBox.hide()

selectboxClickHandler = ->
	index = $selectBox.find('li').index(@)
	n = 0
	_key = ''
	for key of genre
		if index is n
			_key = key
			console.log n
		n++
	$selectBox.find('li').css
		'background': 'none'
	$(@).css
		'background': 'url(img/search-check.png) no-repeat 0 0'
	loadRSS country, feedType, limit, genre[_key]

fadeAnime = (e) ->
	if e.type is 'mouseenter'
		$(e.target).fadeTo 0, 0.7
	else if e.type is 'mouseleave'
		$(e.target).fadeTo 0, 1

setupEventListener = ->
	$container.children('.panel').on 'click', (e) ->
		_now = $(@).find('img').attr('id').split('sound_')[1]
		if now is _now 
			if isPlaying then window.open(id_label[now]) else play()
		now = _now
		play()
	$container.children('.panel').hover ->
		if $container.find('.panel').index(@) isnt now then $(@).find('div').fadeIn(100)
	, ->
		if $container.find('.panel').index(@) isnt now then $(@).find('div').fadeOut(100)
	
	if !firstLoad
		$win.resize onResizeHandler
		$(document.body).on 'click', searchBarClose
		$searchBar.on 'click', searchBarOpen
		$selectBox.find('li').on('click', selectboxClickHandler).hover fadeAnime, fadeAnime
		$(player).on 'ended', ->
			if repeatFlag isnt 3
				now++
				play()
		$(player).on 'playing', ->
			$playpause.css
				'background': 'url(img/pauseBtn.png) no-repeat'
		$(player).on 'pause', ->
			$playpause.css
				'background': 'url(img/playBtn.png) no-repeat'
			isPlaying = false
		$(player).on 'timeupdate', timeupdates
		$playpause.on 'click', ->
			if isPlaying is true
				pause()
			else
				play()
		
		$('#prev').on 'click', ->
			if repeatFlag isnt 3
				now--
				isRandom()
				play()
			
		$('#next').on 'click', ->
			if repeatFlag isnt 3
				now++
				isRandom()
				play()
		$random.on 'click', ->
			randomFlag = !randomFlag
			if randomFlag
				$(@).css
					'background':'url(img/btn-random_on.png)'
			else
				$(@).css
					'background':'url(img/btn-random_off.png)'
				
		$repeat.on 'click', ->
			repeatFlag++
			if repeatFlag is 4 then repeatFlag = 1
			bg = ''
			switch repeatFlag
				when 1
					bg = 'btn-repeat_off.png'
				when 2
					bg = 'btn-repeat_on.png'
				when 3
					bg = 'btn-repeat_one.png'
					
			$(@).css
				'background':'url(img/'+ bg +')'

initPanels = ->
	console.log 'initPanels'
	panels = ''
	num = 0
	len = link_href_m4a.length
	for i in [0..len-1]
		panels += '<div class="panel"><img id="sound_'+i+'" src="'+im_images[i]+'" /><br /><div><p class="panelTitle">'+titles[i].split(' - ')[0]+'</p><p>'+titles[i].split(' - ')[1]+'</p></div></div>'
	$container.append panels
	
setup = ->
	pause()
	$liquidCrystal.show()
	pnl = $container.find '.panel'
	panelWidth = pnl.width()+parseInt(pnl.css('margin-left').split('px')[0])+parseInt(pnl.css('margin-right').split('px')[0])
	

loadRSS = (country, feedType, limit, genre) ->
	console.log genre
	$container.empty()
	nowGenre = genre
	now = 0
	titles = []
	im_images = []
	im_releaseDate = []
	link_href_m4a = []
	url = domain+country+'/rss/'+feedType+'/limit='+limit+'/genre='+genre+'/json'
	$.ajax
		type: 'GET'
		url: url
		dataType: 'json'
		success: (data) ->
			data.feed.entry.forEach (entry) ->
				titles.push entry['title'].label
				im_images.push entry['im:image'][2].label
				im_releaseDate.push entry['im:releaseDate'].label
				link_href_m4a.push entry['link'][1].attributes.href
				id_label.push entry['id'].label
		error: (data) ->
			alert 'error!'
		complete: ->
			initPanels()
			setupEventListener()
			setup()
			onResizeHandler()
			firstLoad = true

initSeek = ->
	$seekSlider = $seekBar.find('.slider').slider({max: 100, value:1, tooltip:'hide'}).on 'slide', (e) ->
		setQuePos @.value
	$seekSlider.slider('setValue', 0).end().find('.slider').find('.slider-handle').eq(1).hide().end().end().find('.tooltip-inner').hide()

setVolume = (value) ->
	if (!isNaN( parseInt( value )))
		player.volume = value*0.01

initVolume = ->
	player.volume = 0.5
	$('#volume').find('.slider').slider({max: 100, value:1, tooltip:'hide'}).on('slide', (e) ->
		setVolume(@.value)
	).slider('setValue', 50).end().find('.slider').find('.slider-handle').eq(1).hide().end().end().find('.tooltip-inner').hide()

init = ->
	loadRSS(country, feedType, limit, '')
	initVolume()
	initSeek()
	$selectBox.find('li').eq(0).css
		'background':'url(img/search-check.png) no-repeat 0 0'

getUserAgent = ->
	agent = ''
	ua = navigator.userAgent
	if ua.search(/Safari/) isnt -1
		agent = 'safari'
		if ua.search(/Chrome/) isnt -1
			agent = 'Chrome'
			
	if agent is ''
		$(document.body).empty().html('<p style="text-align:center;margin:0 auto;font-size:150px;"><strong>ChromeかSafariで見てー！</strong></p>')
	else
		init()
		
getUserAgent()





