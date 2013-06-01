(function(){
    $(function(){
        var $win = $(window);
        var $liquidCrystal = $('#liquidCrystal');
        var $seekUI = $('#seekUI');
        var $seekBar = $('#seekBer');
        var $textArea = $('#textArea');
        var $repeat = $('#repeat');
        var $random = $('#random');
        var $searchBar = $('#search-bar');
        var $currentTime = $('#currentTime');
        var $playpause = $('#playpause');
        var $volume = $('#volume');
        var $container = $('#container');
        var $selectBox = $('#select-box');
        var $dummyNavi = $('#dummyNavi');
        var player = document.getElementById('player');
        var domain = 'https://itunes.apple.com/';
        var country = 'en';
        var feedType = 'topsongs';
        var limit = 200;
        var genre = {
                All: '',
                Alternative: 20,
                Blues: 2,
                Childrens_Music: 4,
                Classical: 5,
                Country: 6,
                Dance: 17,
                Electronic: 7,
                HipHop_Rap: 18,
                Jass: 11,
                Pop: 14,
                R_and_B_Soul:15,
                Reggae: 24,
                Rock: 21,
                Singer_Songwriter: 10,
                Soundtrack: 16,
                World:19
            };
        var titles = [];
        var im_images = [];
        var im_releaseDate = [];
        var link_href_m4a = [];
        var id_label = [];
        var now = 0;
        var isPlaying = false;
        var currentTime=0;
        var currentTimePars=0;
        var $seekSlider;
        var randomFlag = false;
        var repeatFlag = 1;
        var panelWidth=0;
        var paneLineLength = 0;
        var searchFlag = false;
        var nowGenre = 'Dance';
        var firstLoad = false;

        
        getUserAgent();        
        
        
        function getUserAgent() {
	        var agent=''
			,	userAgent=navigator.userAgent;
			if(userAgent.search(/Safari/) != -1){
				agent='Safari';
				if (userAgent.search(/Chrome/) != -1){
					agent='Chrome';
				}
			}
			
			if (agent==='') {
				$(document.body).empty().html(
					'<p style="text-align:center;margin:0 auto;font-size:150px;"><strong>ChromeかSafariで見てー！</strong></p>'
				);
			} else {
				init();
			}
        }

        function init() {
            loadRSS(country, feedType, limit, ''/* genre['Dance'] */);
            initVolume();
            initSeek();
        }

        function initSeek() {
            $seekSlider = $seekBar.find('.slider').slider({max: 100, value:1, tooltip:'hide'}).on('slide', function(e){
                setQuePos(this.value);
            });
            $seekSlider.slider('setValue', 0).end().find('.slider').find('.slider-handle').eq(1).hide().end().end().find('.tooltip-inner').hide();
        }

        function initVolume() {
            player.volume = 0.5;
            $('#volume').find('.slider').slider({max: 100, value:1, tooltip:'hide'}).on('slide', function(e){
                setVolume(this.value);
            }).slider('setValue', 50).end().find('.slider').find('.slider-handle').eq(1).hide().end().end().find('.tooltip-inner').hide();
        }

        function setVolume(value) {
            if (!isNaN( parseInt( value ))) player.volume = value*0.01;
        }

        function loadRSS(country, feedType, limit, genre) {
            $container.empty();
            nowGenre = genre;
            now = 0;
            titles = [];
            im_images = [];
            im_releaseDate = [];
            link_href_m4a = [];
            var url = domain+country+'/rss/'+feedType+'/limit='+limit+'/genre='+genre+'/json';
            $.ajax({
                type: "GET",
                url: url,
                dataType: 'json',
                success: function(data) {
                    data.feed.entry.forEach(function(entry){
                        titles.push(entry['title'].label);
                        im_images.push(entry['im:image'][2].label);
                        im_releaseDate.push(entry['im:releaseDate'].label);
                        link_href_m4a.push(entry['link'][1].attributes.href);
                        id_label.push(entry['id'].label);
                    });
                },
                error: function(data){
                    alert('error!');
                },
                complete: function(){
                    initPanels();
                    setupEventListener();
                    setup();
                    onResizeHandler();
                    firstLoad = true;
                }
            })
        }

        function initPanels(){
            var panels = '';
            var num=0;
            var len = link_href_m4a.length
            for (var i=0; i<len; i++) {
                panels +=
                    '<div class="panel">'+
                        '<img id="sound_'+i+'" src="'+im_images[i]+'" /><br />'+
                        '<div><p class="panelTitle">'+titles[i].split(' - ')[0]+'</p><p>'+titles[i].split(' - ')[1]+'</p></div>'+
                    '</div>';
            }
            $container.append(panels);
        }
        
        function setup() {
            pause();
            $liquidCrystal.show();
            var pnl = $container.find('.panel');
            panelWidth = pnl.width()+parseInt(pnl.css('margin-left').split('px')[0])+parseInt(pnl.css('margin-right').split('px')[0]);
            $selectBox.find('li').eq(0).css({'background':'url(img/search-check.png) no-repeat 0 0'});
        }

        function setupEventListener() {
            $container.children('.panel').on('click', function(e){
                var _now = $(this).find('img').attr('id').split('sound_')[1];
                if (now == _now) {
                    if (isPlaying) {window.open(id_label[now])} else {play();}
                    return;
                }
                now = _now;
                play();
            }).hover(function(){
                if($container.find('.panel').index(this)!=now) $(this).find('div').fadeIn(100);
            },function(){
                if($container.find('.panel').index(this)!=now) $(this).find('div').fadeOut(100);
            });
            
            if (!firstLoad) {
	            $win.resize(onResizeHandler);
	            $(document.body).on('click', searchBarClose);
	            $searchBar.on('click', searchBarOpen);
	            $selectBox.find('li').on('click', selectboxClickHandler).hover(fadeAnime, fadeAnime);
	            $(player).on('ended', function(){
	                if(repeatFlag!=3)now++;
	                play();
	            }).on('playing', function(){
	                $playpause.css({'background': 'url(img/pauseBtn.png) no-repeat'});
	            }).on('pause', function(){
	                $playpause.css({'background': 'url(img/playBtn.png) no-repeat'});
	                isPlaying = false;
	            }).on('timeupdate', timeupdates);
	
	            $playpause.on('click', function(){
	                if (isPlaying==true) {
	                    pause()
	                } else {
	                    play();
	                }
	            });
	
	            $('#prev').on('click', function(){
	                if(repeatFlag!=3)now--;
	                isRandom();
	                play();
	            });
	
	            $('#next').on('click', function(){
	                if(repeatFlag!=3)now++;
	                isRandom();
	                play();
	            });
	
	            $random.on('click', function(){
	                randomFlag = !randomFlag;
	                if (randomFlag){
	                    $(this).css({'background':'url(img/btn-random_on.png)'});
	                } else {
	                    $(this).css({'background':'url(img/btn-random_off.png)'});
	                }
	            });
	
	            $repeat.on('click', function(){
	                repeatFlag++;
	                if (repeatFlag==4) repeatFlag = 1;
	                var bg = '';
	                switch (repeatFlag) {
	                    case 1 : bg = 'btn-repeat_off.png'; break;
	                    case 2 : bg = 'btn-repeat_on.png'; break;
	                    case 3 : bg = 'btn-repeat_one.png'; break;
	                }
	                $(this).css({'background':'url(img/'+ bg +')'});
	            });
	            
            }
        }

        function fadeAnime(e) {
            if (e.type=='mouseenter'){
                $(e.target).fadeTo(0, 0.7);
            } else if (e.type=='mouseleave') {
                $(e.target).fadeTo(0, 1);
            }
        }

        function selectboxClickHandler() {
            var index = $selectBox.find('li').index(this);
            var n=0;
            var _key = '';
            for ( var key in genre ) {
                if (index==n) _key = key;
                n++;
            }
            $selectBox.find('li').css({'background': 'none'});
            $(this).css({'background': 'url(img/search-check.png) no-repeat 0 0'});
            loadRSS(country, feedType, limit, genre[_key]);
        }

        function searchBarOpen() {
            searchFlag = !searchFlag;
            if (searchFlag){
                $selectBox.show();
            } else {
                $selectBox.hide();
            }
        }

        function searchBarClose(e) {
            if ($(e.target).parent('ul').parent('div').attr('id')=='select-box'||$(e.target).attr('id')=='search-bar') return;
            searchFlag = false;
            $selectBox.hide();
        }

        function timeupdates() {
            currentTime = player.currentTime;
            currentTimePars = (currentTime/30)*100;
            $seekSlider.slider('setValue', currentTimePars)

            var nowTime = Math.round(currentTime);
            if (nowTime<10) nowTime = '0' + nowTime;
            $currentTime.empty().text("0:"+nowTime);
            isPlaying = true;
        }

        function setQuePos(pos) {
            player.currentTime = (pos/100)*30;
        }

        function onResizeHandler() {
            var width = $win.width()*0.95;
            var $WW = $win.width();
            if ($WW>1200) {
                $searchBar.css({'right': 45+'px'}).show();
                $dummyNavi.show();
            	$volume.show()
            		.next($liquidCrystal).width(580).css({'right': ($WW/2)-290+'px'}).show()
            		.find($textArea).width(480)
            		.find($seekUI).width($liquidCrystal.width()-120).show()
            		.find($repeat).show()
            		.next().next($seekBar).show().width($seekUI.width()-100).find('.slider').width($seekUI.width()-100).show()
            		.parent().next().next($random).show();
            } else if (($WW<=1200)&&($WW>=850)) {
                $searchBar.css({'right': 45-($WW/100)+'px'}).show();
                $dummyNavi.show();
            	$volume.hide()
            		.next($liquidCrystal).width($WW*0.48).css({'right': ($WW/2)-($liquidCrystal.width()/2)+'px'}).show()
            		.find($textArea).width($liquidCrystal.width()-110)
            		.find($seekUI).width($liquidCrystal.width()-110)
            		.find($repeat).show()
            		.next().next($seekBar).show().width($seekUI.width()-100).find('.slider').width($seekUI.width()-100).show()
            		.parent().next().next($random).show();
            } else if (($WW<850)&&($WW>=700)) {
                $searchBar.css({'right': 15-($WW/100)+'px'}).show();
                $dummyNavi.hide();
            	$volume.hide()
            		.next($liquidCrystal).width($WW*0.48).css({'right': ($WW/2)-($liquidCrystal.width()/2)+'px'}).show()
            		.find($textArea).width($liquidCrystal.width()-110)
            		.find($seekUI).width($liquidCrystal.width()-110).show()
            		.find($repeat).show()
            		.next().next($seekBar).show().width($seekUI.width()-100).find('.slider').width($seekUI.width()-100).show()
            		.parent().next().next($random).show();
            } else if ($win.width()<700) {
                $dummyNavi.hide();
                $searchBar.css({'right': 15-(($WW)/100)+'px'}).show();
                $liquidCrystal.css({'width': $WW*0.483+'px'}).hide();
            }

            for (var i=0;i<10;i++) {
                if (width>panelWidth*i) paneLineLength=i;
            }
            $container.width(panelWidth*paneLineLength+20);
        }

        function thumbnailChanger() {
            $('#thumbnail').attr('src', im_images[now]);
            $('#title').text(titles[now].split(' - ')[0]);
            $('#name').text(titles[now].split(' - ')[1]);
            setPlayingPanel();
            //thumbnailAnimation();
        }

        function play() {
            $('#apple').hide();
            $('#thumbnail,#textArea').show();
            if (now==link_href_m4a.length){
                if (repeatFlag==1) {
                    return false;
                } else {
                    now=0;
                }
            } else if (now==-1) {
                now=link_href_m4a.length;
            }
            isRandom();
            player.src = link_href_m4a[now];
            player.error = function(){
                alert('error')
            };
            player.play();
            trace();
            thumbnailChanger();
            addPanelAnimation();
        }
        
        function pause() {
	        player.pause();
	        removePanelAnimation();
        }

        function isRandom() {
            if (randomFlag) now = Math.floor(Math.random()*limit);
        }

        function thumbnailAnimation() {
            // なにかアニメーション
        }

        function setPlayingPanel() {
            $container.find('.panel').find('div').hide().end().eq(now).find('div').show();
        }

        function addPanelAnimation() {
            $container.find('.panel').removeClass('scale').eq(now).addClass('scale');
        }

        function removePanelAnimation() {
            $container.find('.panel').removeClass('scale');
        }

        function trace(){
            //console.log('//======== now playing ========//');
            //console.log(titles[now]);
            //console.log(link_href_m4a[now]);
        }
    })
})();
