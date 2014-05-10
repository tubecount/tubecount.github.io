//yt api doc
//http://code.google.com/intl/nl-NL/apis/youtube/2.0/developers_guide_protocol_partial.html

//api call single video
//https://developers.google.com/youtube/2.0/developers_guide_protocol_video_entries

//var fields = "fields=openSearch:totalResults,entry(title,media:group(yt:videoid),media:group(yt:duration),media:group(media:description),media:group(media:thumbnail[@yt:name='default'](@url)),yt:statistics,yt:rating,published,gd:comments(gd:feedLink(@countHint)))";
var fields = "fields=openSearch:totalResults,entry(title,media:group(yt:videoid),media:group(yt:duration),media:group(media:description),media:group(media:thumbnail(@url)),yt:statistics,yt:rating,published,gd:comments(gd:feedLink(@countHint)))";
//var fields = "";
var fieldsTotal = "fields=yt:statistics(@totalUploadViews)";
var fieldsAdd = "fields=entry(title)";
//var fieldsAdd = "";

//var fieldsTotal = "";
var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
var startIndex = 1;
var maxResults = 50;
var lastEntries;
var entries;
var scroller;
var scrollerChannels;
var scroller3;
var currentChannel;
var currentHasMore = true;
var xx = 0;
var yy = 0;
var vid_w = 106;
var vid_h = 80;
var colums = 3;
var ismore = false;
var lastYY;
var reloadAngle = 0;
var channels = ["mininederland"];

var deleting = false;
var channelsFileName = "channels.txt";
var filer;
var loadImages = new Array();
var timer;
var highlightColor = "#324F85";
var startEvent = "mousedown"; //"touchstart" 
var endEvent = "mouseup"; //"touchend" 
var v_timer;
var v_highlightColor = "#324F85";
var messageBox;
var player_w = 320;
var player_h = 200;
var currentSortType = "viewcount";
var imagestoload;
var imagesloaded = 0;
var showSort = false;

var removeAnimateCount = 300;
var currentNewcount = 0;
var isOnline= true;
var isloading = false;
var gettingVids = false;
var currentChannelTotalViews;
var timeoutInSeconds = 10;
var el_array = [];
var sort_array = [];
var sort_array_newcount = [];
var sort_array_likes = [];
var sort_array_count = [];
var isSorting = false;
var removedAnimate = false;
var showmore = true;
var getvidsTimer;
var isReloading = false;
var videostoload;

var currentSortArray;
var isbuying = false;
var isdeleting = false;

var currentVideo;

document.addEventListener("touchmove", function(e){e.preventDefault();}, false);

function checkOnline(){
	isOnline = (navigator.connection != undefined && (navigator.connection.type == Connection.NONE || navigator.connection.type == Connection.UNKNOWN)) != true;
}




function onDeviceReady(){

 	checkOnline();



	messageBox  = window.plugins.messageBox;

	document.addEventListener("offline", function(){
		isOnline = false;
		showOffline();
	}, false);


	document.addEventListener("online", function(){
		isOnline = true;
	}, false);

	document.addEventListener("resume", function(){
		checkOnline();

		if(isOnline){
			hideOffline();
		}

	}, false);

	filer = new FileStorage();

	filer.onready(function(){
		console.log("ready..");
		$(init);
	});
}


function handleOpenURL(url){
	//alert(url);
	// TODO: do something with the url passed in
	// allow channel(s) to be loaded and saved with url scheme: tubecount://wiibart,ijustine
}

function setColums(){
	var w = $(window).width();	
	colums = Math.floor(  w / vid_w  );
	var m =   Math.round(  (w - (colums * vid_w)) /2 );
	$("#videoScroller").css("margin-left", m + "px");
}

function handleOrientationChange(){

	setColums();
	updateGridPosition(currentSortArray);
	updateScroller();
}


var canvasDetail;
var contextDetail;

function init() {



	//detail canvas
	canvasDetail = document.getElementById("canvasDetail");
	contextDetail = canvasDetail.getContext("2d");
	contextDetail.textBaseline = "middle";
	center = canvasDetail.width / 2;

	initScrollers();


	$(window).bind('orientationchange', handleOrientationChange);

	setupClickHandlers();

	setColums();


	if(filer == undefined){
		console.log("filer = undefined");
		return;
	}


			setTimeout(function(){
			scroller = new iScroll("videos",{ hScrollbar: false, vScrollbar: false});
		},100);

		scroller3 = new iScroll("vid_detail");

	filer.ReadFile(channelsFileName, function(file){

		if(file != undefined){

			var json = JSON.parse(file);

			if(json.list.length == 0){
				add();
				return;
			}

			if(json != undefined){

				$("#container").show();
				if(json.list != undefined) channels = json.list;
				if(json.current != undefined) currentChannel = json.current;
			} 
		}


		if(currentChannel == undefined) currentChannel = channels[0];
		updateList();

	//	$("#name").html(currentChannel);
		
		if(isOnline){
			filer.ReadFile(getLastEntriesFilename(currentChannel), function(file){
				if(file != undefined) lastEntries = JSON.parse(file);
				getChannelTotal(currentChannel);
				getvids(currentChannel);
			});
		}
		else{
			handleOffline(currentChannel);
		}

	 });

}


function makeDetailCanvas(){

	contextDetail.fillStyle =  "#111";
	contextDetail.fillRect(0,0,500,500);
	contextDetail.textAlign = 'center';

    var vidimage = new Image();

    vidimage.onload = function(){

        contextDetail.drawImage(vidimage,10,70);

		var text = formatCount(currentVideo.count);

	    neonLightEffect( contextDetail, text  );


        //draw footer
	    contextDetail.textBaseline = "bottom";
	    contextDetail.fillStyle = "rgba(255,255,255,1)";
		contextDetail.font = 35 +"px " + "LeagueGothicRegular";
	    contextDetail.fillText("http://tubecount.com",center,484) ;

        //contextDetail.globalAlpha = 1;

        share();
    }


	//480x360
    vidimage.src = currentVideo.image2;
}

function neonLightEffect(ctx, text) {
	var font = 80 +"px " + "LeagueGothicRegular";
	ctx.textAlign = 'center';
	ctx.font = 80 +"px " + "LeagueGothicRegular";
	ctx.textBaseline = "top";
	var jitter = 10; // the distance of the maximum jitter
	var offsetX = 30;
	var offsetY = 70;
	// save state
	ctx.save();
	ctx.font = font;
	ctx.fillStyle = "rgba(255,255,255,0.95)";
	ctx.fillText(text, center, 0);
	// created jittered stroke
	ctx.lineWidth = 0.80;
	ctx.strokeStyle = "rgba(255,255,255,0.25)";
	var i = 5; while(i--) { 
		var left = jitter / 2 - Math.random() * jitter;
		var top = jitter / 2 - Math.random() * jitter;
		ctx.strokeText(text, center + left, top );
	}	
	ctx.strokeStyle = "rgba(0,0,0,0.20)";
	ctx.strokeText(text, center, 0);
	ctx.restore();
};


function share(){

	//TODO check internet

        Instagram.isInstalled(function (err, installed) {
            if (installed) {
                
                Instagram.share("canvasDetail", function (err) {
                    if (err) {
                        //showAlert("Not shared")
                    } else {
                        showAlert("Shared");
                    }
                });

            } else {
                    navigator.notification.confirm(
                    "Get Instagram, it's cool",
                    function(buttonIndex){   
                        if(buttonIndex == 1) {
                            //popup("Launch InstaGram intall", "TODO");
                            document.location = "itmss://itunes.apple.com/nl/app/instagram/id389801252";
                        }
                    },'Instagram not installed','Yes !,Exit'
                    );
            }
        });

    }




function doSort(sortarray, element_id){
	currentSortArray = sortarray;
	clearCurrentSort();
	$(element_id).addClass("currentSort");

	isSorting = true;

	if(entries.videos.length > removeAnimateCount){
		removedAnimate = true;
		$("#videoScroller div").removeClass("vidanimate");
	}
	else if(removedAnimate){
		removedAnimate = false;
		$("#videoScroller div").addClass("vidanimate");
	}

	updateGridPosition(sortarray);

	setTimeout(function(){
		isSorting = false;
	},1000);

	setTimeout(function(){
		$("#sortblock").hide();
	}, 70);
}

function clearCurrentSort(){
	$("#sortnew, #sorttotal, #sortlikes, #sortlatest").removeClass("currentSort");
}


function setupClickHandlers(){

	$("#reload").bind(startEvent, reload);

	$("#detail_share").bind(startEvent, function(ev){
		ev.stopPropagation();
		$("#player").hide();
		$("#video_share").show();	
		makeDetailCanvas();
	});

	$("#shareHeader").bind(startEvent, function(ev){
		ev.stopPropagation();
		$("#player").show();
		$("#video_share").hide();	
	});

	

	$("#sortnew").bind(startEvent, function(){
		doSort(sort_array_newcount,"#sortnew");
	});

	$("#sorttotal").bind(startEvent, function(){
		doSort(sort_array_count,"#sorttotal");
	});

	$("#sortlikes").bind(startEvent, function(){
		doSort(sort_array_likes,"#sortlikes");
	});

	$("#sortlatest").bind(startEvent, function(){
		doSort(undefined,"#sortlatest");
	});



	$("#channelsHeader").bind(startEvent, closeChannelList);

	$("#detailHeader").bind(startEvent, closePlayer);


	$("#btn_sort").bind(startEvent, function(){
		event.stopPropagation();
		showSort = true;
		$("#sortblock").toggle();
	})

	// $("#footer").bind(startEvent, function(){
	// 	more();
	// })

	$("#btnAdd").bind(startEvent, function(){
		add();
	});

	$("#btnEdit").bind(startEvent, function(){
		toggleDelete();
	});

	$("#listNames").on("click", "div",function(e){
		if(busy) return;
		e.stopPropagation();

		closeList(this);
	});

	$("#videoScroller").on("click", "div.vid",function(){
		if(isSorting) return;
		var id = $(this).attr("data-id");
		if(id == "nPZxme7ZZHE") showPlayer(id);
	});
}

function showOffline(){
	$("#offline").show();
	$("#videos").addClass("videos_offline");
	$("#vid_detail,#wrapper").addClass("offline");

	updateScroller();
	showMore(false);
	$("#imgreload").hide();
}

function hideOffline(){
	$("#offline").hide();
	$("#videos").removeClass("videos_offline");

	$("#vid_detail,#wrapper").removeClass("offline");

	updateScroller();
	$("#imgreload").show();
}

function handleOffline(channel){

	filer.ReadFile(getLastEntriesFilename(channel), function(file){
		if(file != undefined){
			console.log("going to process last entries from file");
			lastEntries = JSON.parse(file);
			entries = lastEntries;

			imagestoload =  entries.videos.length;

			$("#waiting").show();
			updateVideos();
		}
		else{
			$("#waiting").hide();
			$("#footer").hide();
			gettingVids = false;
		}
	});
}

function initScrollers(){
	scrollerChannels = new iScroll("wrapper",{ hScrollbar: false, vScrollbar: false});
}


function trim(value) {
  value = value.replace(/^\s+/,''); 
  value = value.replace(/\s+$/,'');
  return value;
}

function makeEntries(data){

	if(entries == undefined) {
		entries = new Object();
		entries.total = data.feed.openSearch$totalResults.$t;
		entries.time = Date();
		entries.videos = [];
	}

	var len = data.feed.entry.length;
	
	for(var k =0; k<len; k++){

		try{
			var yt = data.feed.entry[k];
			var v = {};
			v.id = yt.media$group.yt$videoid.$t;
			v.title = yt.title.$t;
			v.description = yt.media$group.media$description.$t;
			
			v.image = yt.media$group.media$thumbnail[0].url;
			v.image2 = yt.media$group.media$thumbnail[2].url;

			v.count = Number(yt.yt$statistics != undefined && yt.yt$statistics.viewCount != undefined ? yt.yt$statistics.viewCount : 0);

			if(yt.yt$rating != undefined){
				v.likes    = yt.yt$rating.numLikes != undefined ? parseInt( yt.yt$rating.numLikes ) : 0;
				v.dislikes = yt.yt$rating.numDislikes != undefined ? parseInt( yt.yt$rating.numDislikes ) : 0;

				v.perc = perc(v.likes, v.dislikes);
			}
			else{
				v.likes = 0;
				v.dislikes = 0;
			}

			if(yt.published != undefined){
				v.published = formatDate(yt.published.$t);
			}

			v.favorites = Number(yt.yt$statistics != undefined && yt.yt$statistics.favoriteCount != undefined ? yt.yt$statistics.favoriteCount : 0);		
			v.comments = Number(yt.gd$comments != undefined ? yt.gd$comments.gd$feedLink.countHint : 0);
			v.duration = yt.media$group.yt$duration.seconds;

			entries.videos.push(v);
		}
		catch(e){
			continue;
		}
	}
}


function formatMillion(d){
	var arr = d.toString().split("");
	var len = len2 = arr.length;
	while(len--){
		if(len != 0 && (len2 - len) %3 ==0 ) arr.splice(len ,0,"," );
	}
	return arr.join("");
}

function getChannelTotal(channel){

	if(isOnline){

		$.getJSON("http://gdata.youtube.com/feeds/api/users/"+channel+"?"+fieldsTotal+"&v=2&alt=json-in-script&callback=?",
		  function(data){
		  	var totViews = parseInt(data.entry.yt$statistics.totalUploadViews);

		  	currentChannelTotalViews = totViews;

			$("#total").html(formatMillion(totViews));
			
			$("#new").html("");
		
			if(lastEntries != undefined && lastEntries.totViews != undefined){
				var newviews = currentChannelTotalViews - lastEntries.totViews;
				if(newviews > 0)$("#new").html("+"+formatMillion(newviews));
			}
		  });
	}
	else{
		if(lastEntries != undefined && lastEntries.totViews != undefined){		
				$("#total").html(formatMillion(lastEntries.totViews));
		}
	}
}



function getvids(channel){

	if(channel == undefined) return;

	if(!isOnline) {
		return handleOffline(channel);
	}

	if(gettingVids) return;
	gettingVids = true;

	$("#waiting").show();

	currentChannel = channel;

	getvidsTimer = setTimeout(function(){
		isOnline = false;
		showOffline();
		handleOffline(currentChannel);
	},7000)

	$.ajax({
		url: "http://gdata.youtube.com/feeds/api/users/"+channel+"/uploads?"+fields+"&v=2&alt=json&max-results="+maxResults+"&start-index="+startIndex,
		success: function(data){
			clearTimeout(getvidsTimer);

	  		if(isOnline == false){
	  			gettingVids = true;
	  			handleOffline(currentChannel);
	  			return;
	  		}

			if(data.feed.entry == undefined ){
				showAlert("Error getting data");
				return;
			}
			
			var totalVids = parseInt(data.feed.openSearch$totalResults.$t);
			makeEntries(data);

			if(totalVids == entries.videos.length){
				showMore(false);
			}

			imagestoload = data.feed.entry.length;
			updateVideos();	
			startIndex+=maxResults;
		},
		error:function(error){
			gettingVids = false;
			clearTimeout(getvidsTimer);
				if(error.status == 403){
					showAlert("This channel has been terminated");
				}
				else{
					showAlert("Error getting data");
				}
				$("#waiting").hide()
				showChannels();
		}

	});

}

function updateStorage(){

	if(lastEntries == undefined) {
		//filer.WriteFile(getLastEntriesFilename(currentChannel), JSON.stringify(entries))
		//return;
		lastEntries = {};
		lastEntries.videos = [];
	}

	if(currentChannelTotalViews != undefined) lastEntries.totViews = currentChannelTotalViews;

	for(var i=0;i<entries.videos.length;i++){
		updateLastEntries(entries.videos[i]);
	}

	filer.WriteFile(getLastEntriesFilename(currentChannel), JSON.stringify(lastEntries))
}

function updateLastEntries(vid){
	var id = vid.id;

	for(i=0;i<lastEntries.videos.length;i++){
		if(lastEntries.videos[i].id == id){
			//update lastEntries
			lastEntries.videos[i].count = vid.count;
			lastEntries.videos[i].likes = vid.likes;
			lastEntries.videos[i].dislikes = vid.dislikes;
			return;
		}
	}
	//add to lastentries if not found
	lastEntries.videos.push(vid);
}

function more(){

	$("#sortblock div").removeClass("currentSort")

	if(showSort) $("#sortblock").hide();

	if(showmore ){
		ismore = true;
		lastYY =  yy;
		getvids(currentChannel);
	}
}

function updateGridPosition(sortarray){

	if(entries == undefined) return;

		xx = 0;
		yy = 0;

		var len = el_array.length; 
		for(var i = 0; i< len; i++){
			xx = (i*vid_w) % (vid_w * colums);
			if(i>=colums && xx == 0) yy+=vid_h;
			el_array[ sortarray == undefined ? i : sortarray[i] ].style.webkitTransform = "translate3d("+xx+"px,"+yy+"px,0px)";
		}
}

function updateVideos(){
	videostoload = entries.videos;
	var i=startIndex-1
	addVideo(i, videostoload[i], xx,yy);
}


function videoCached(id){
	if(lastEntries == undefined) return false;

	var len = lastEntries.videos.length;

	for(var i=0;i<len;i++){
		if(lastEntries.videos[i].id == id){
			 return true;
		}
	}
	return false;
}

function getLocalFile(channel, videoid){
	return filer.fileSystem.root.fullPath + "/" + channel + "/" + videoid + ".jpg";
}

function getRelativeFile(channel, videoid){
	return encodeURI("file://" + getLocalFile(channel,videoid));
}


function addVideo(i, video){

	if(video == undefined){	
		finishLoad();
		return;
	}

	xx = (i*vid_w) % (vid_w * colums);
	if(i>=colums && xx == 0) yy+=vid_h;
	setVideo(i,video.image, video, xx, yy);
}


function updateSortArray(type, arr, sortfunc){

	arr.length = 0;

	var len = sort_array.length;

	sort_array.sort(sortfunc);

	for(var i=0;i<len;i++){
		arr.push(sort_array[i].id);
	}
}


function updateWaiting(perc){
	$(".waiting_perc").css("width", perc + "%");
}

function hideWaiting(){
	$("#waiting_txt span").html("Loading...");
	$("#waiting").hide();
	updateList();
	isdeleting = false;
}

function setVideo(i,imgname,video, xpos, ypos){

	var im = new Image();

	im.onload = function(){

		video.newcount = checknew(video.id);

		if(video.newcount > 0) currentNewcount+= video.newcount;

		var countClass = "count";
		if (video.perc > 0) countClass+= " up";
		else if (video.perc < 0) countClass+= " down";


		var op = video.id == "nPZxme7ZZHE" ? 1 : 0.5;

		el_array[i] = $("<div data-id='"+video.id+"' class='vid vidanimate' style='opacity: "+op+";background : center url("+imgname+");"+setpos(xpos,ypos)+"'> \
				<div class='new'>"+getNewString(video.newcount)+"</div> \
				<div class='"+countClass+"'>"+video.count+"</div></div>").appendTo("#videoScroller")[0];

		sort_array.push({
			id:i,
			perc:video.perc,
			newcount:video.newcount,
			count: video.count
		});

		imagesloaded++;

		var perc = 50 - ((imagesloaded / imagestoload) * 50);

		updateWaiting(perc);

		if(imagesloaded == imagestoload){
			finishLoad();
		}
		else{

			i++;
			addVideo(i, videostoload[i]);
		}

	};

	im.onabort = function(){
		console.log("image load aborted");
	}

	im.onerror = function(){
		console.log("image load error: " + imgname);

		imagesloaded++;
		i++;
		addVideo(i, videostoload[i]);
	}

	im.src = imgname;
}


function finishLoad(){
	updateSortArray("newcount", sort_array_newcount, sortByNew);
	updateSortArray("count", sort_array_count, sortByViewCount);
	updateSortArray("likes", sort_array_likes, sortByLikes);

	$("#waiting").hide();
	$(".waiting_perc").css("width", "50%");
	imagesloaded = 0;
	updateScroller();
	gettingVids = false;
	isReloading = false;

	if(currentNewcount == 0){
		$("#sortnew").hide();
		$("#sorttotal").addClass("sortblocktop");
	}
	else{
		$("#sortnew").show();
		$("#sorttotal").removeClass("sortblocktop");	
	}
	if(isOnline) updateStorage();
}


function updateScroller(){

	if(entries == undefined) return;

	var el = document.getElementById("videoScroller");
	el.style.height = yy + vid_h + "px";
			
	setTimeout(function(){
		scroller.refresh();
	},100);

	if(entries.videos.length > maxResults){
		setTimeout(function(){
			//scroller.scrollTo(0, scroller.maxScrollY, 1000)	;
			scroller.scrollTo(0,scroller.maxScrollY,1000)

		},200);	
	}
}

function setpos(x,y){
	return "-webkit-transform: translate3d("+x+"px,"+y+"px,0px);";
}


function sortByViewCount(a, b) {
	if(a.count == undefined || b.count == undefined) return 0;

	var x = parseInt(a.count);
	var y = parseInt(b.count);
	return ((x < y) ? 1 : ((x > y) ? -1 : 0));
}

function sortByNew(a,b){
	return b.newcount - a.newcount;
}

function sortByLikes(a,b){
	var a = a.perc != undefined ? a.perc : 0;
	var b = b.perc != undefined ? b.perc : 0;
	return b-a;
}

function removeChannelDivs(){
	$("#videoScroller>div").remove();
}

function saveLocalChannelList(){
	filer.WriteFile(channelsFileName, JSON.stringify({
			list: channels,
			current: currentChannel
		}
		));
}

function changeChannel(){

	entries = undefined;
	lastEntries = undefined;
	startIndex = 1;

	xx = 0;
	yy = 0;

	if(isOnline) showMore(true);

	ismore = false;
	scroller.scrollTo(0,0,1000);

	$("#total").html("");
	$("#new").html("");
}

function checknew(id){
	if(lastEntries == undefined || lastEntries == null ) return 0;
	var last = getViewCount(id, lastEntries);
	if(last == 0) return 0;
	var now =  getViewCount(id, entries);
	return now - last;
}

function getNewString(n){
	if(n>0) return "+" + n;
	else return "";
}

function getViewCount(id, ent){
	var count = 0;

	var len = ent.videos.length;

	for(var key = 0; key < len; key++)
	{
		if(ent.videos[key].id == id)
		{
			count = parseInt(ent.videos[key].count);
			break;
		}			
	}
	return count;
}

var busy = false;

function showChannels(ev){

	if(gettingVids) return ;

	busy = true;
	setTimeout(function(){
		busy = false;
	},500);

	if(showSort) $("#sortblock").hide();
	$("#list").show();
	scrollerChannels.refresh();
}

function closeList(el){

	var selected;
	var selectedEl;

	if(el.className.indexOf("deleteChannel") != -1 ) selectedEl = el.parentElement;
	else selectedEl = el;

	selected = selectedEl.attributes["data-channel"].value;

	if(!deleting && selected == currentChannel){
		$("#list").hide();
		return;
	}

	$("#sortblock div").removeClass("currentSort");
	$("#sortlatest").addClass("currentSort");

	changeChannel();
	var oldChannel = currentChannel;
	currentNewcount = 0;

	if(deleting){

		if(isdeleting) return;

		isdeleting = true;

		selectedEl.style.color = "rgba(255, 255, 255, 0.39)";

		var j = channels.indexOf(selected);
		channels.splice(j,1);
		//updateList();
		//scrollerChannels.refresh();

		if(window.Touch){

			$("#waiting_txt span").html("Deleting Channel Data...");
			$("#waiting").show();
			
			filer.DeleteDirectory(selected, updateWaiting, hideWaiting );
			filer.DeleteFile( getLastEntriesFilename(selected));

		}

		saveLocalChannelList();
	}
	else{
		currentChannel = selected;
		document.getElementById("name").innerHTML = currentChannel;

		saveLocalChannelList();

		removeChannelDivs();
		closeChannelList();

		setTimeout(function(){
			filer.ReadFile(getLastEntriesFilename(currentChannel), function(file){
				if(file != undefined) lastEntries = JSON.parse(file);
				
				el_array.length = 0;
				sort_array.length = 0;
				
				getChannelTotal(currentChannel);
				getvids(currentChannel );
			});
		},10);
	}
	showButtonsAndLabels();
}




function showButtonsAndLabels(){
		$("#imgreload").show();
		$("#footer").show();
}

function closeChannelList(ev){

	
	if(channels.indexOf(currentChannel) == -1){
		removeChannelDivs();
		changeChannel();

		if(channels.length >0){
			//load first first channel in list

			currentChannel = channels[0];

		//	$("#name").html(currentChannel);
			showButtonsAndLabels();	
			getChannelTotal(currentChannel);
			getvids(currentChannel);
			saveLocalChannelList();
		}
		else{
			$("#name").html("add channel");
			$("#imgreload").hide();
			$("#footer").hide();
			currentChannel = undefined;
		}
	}

	$(".deleteChannel").hide();
	deleting = false;
	$("#btnEdit").html("Edit");
	$("#list").hide();

}


function add(){


	if(!isOnline) return showNoInternet();

	$(".deleteChannel").hide();

	var name;

	if(window.Touch){

	    messageBox.prompt('Enter a Youtube channel', '', function(button, value) {
	       name = value;
	       if (button == "cancel" || value == ""){
	       	return;
	       }
		getChannel(name);
		});
	}
	else{
		name = prompt('Enter a Youtube channel');
		getChannel(name);
	}
}

function getChannel(channel){

	if( channels.indexOf(channel.toLowerCase()) != -1  ){	
		showAlert("Channel already in list");
		return;
	}

	$.ajax({

		url: "http://gdata.youtube.com/feeds/api/users/"+channel+"/uploads?"+fieldsAdd+"&v=2&alt=json&max-results=1",
		success: function(data){
			if(data.feed.entry != undefined && data.feed.entry.length > 0 ){	
					channels.push(channel.toLowerCase());
					updateList(true);
					saveLocalChannelList();
					return;
			}
			else{
				showAlert("No content available");
			}
		},
		error: function(error){
			showAlert("Channel not found");
		}

		});
}


function showAlert(text){
			if(window.Touch){
				navigator.notification.alert(text, null, " ");
			}
			else{
				alert(text);
			}
}


function updateList(scrollToEnd){
	var t = "";

	$("#btnEdit").toggle(channels.length > 0 );

	var len = channels.length;
	for(var n = 0; n<len; n++){
		t+="<div data-channel='"+channels[n]+"'>"+channels[n]+"<div class='deleteChannel'>&#xf056;</div></div>";	
	}
	$("#listNames").html(t);

	if(deleting) $(".deleteChannel").show();

	if(scrollToEnd === true){
		scrollerChannels.refresh();
		var lastChannel = channels[channels.length-1];
		scrollerChannels.scrollToElement( "#listNames [data-channel="+lastChannel+"]", 200 );
	}
}



function toggleDelete(){
	if(deleting){
		deleting =false;
		$(".deleteChannel").hide();
		document.getElementById("btnEdit").innerHTML = "Edit";
	}else{
		deleting = true;
		$(".deleteChannel").show();
		document.getElementById("btnEdit").innerHTML = "Done";
	}
}

function showMore(bool){
	showmore = bool;
	$("#imgmore").toggle(bool);
}

function reload(ev){

	ev.stopPropagation();

	if(isReloading) return;
	isReloading = true;

	el_array.length = 0;
	sort_array.length = 0;

	if(showSort) $("#sortblock").hide();

	if(!isOnline) return showNoInternet();

	removeChannelDivs();
	
	currentNewcount = 0;

	reloadAngle+=360;
	//$("#imgreload").css("-webkit-transform", "rotate("+reloadAngle+"deg)" );	
	$("#reload").css("-webkit-transform", "rotate("+reloadAngle+"deg)" );	

	entries.videos.splice(maxResults, entries.videos.length - maxResults);

	scroller.scrollTo(0,0,1000);
	var video;

	showMore(true);
	ismore	= false;
	xx = 0;
	yy = 0;
	startIndex = 1;
	entries = undefined;

	getChannelTotal(currentChannel);
	getvids(currentChannel);
}

function showPlayer(id){
	$("#sortblock").hide();
	showVideoDetails(id);

	setTimeout(function(){
			addAnimate("#vid_viewcount", "animated tada");
		},700);

	$("#player").show();
}

function closePlayer(){
	$("#vidframe").attr("src", "blank.html");
	$("#player").hide();
	$("#vid_detail").hide();
	$("#vidframe").hide();
}

function showEl(id, number){
	if(number == 0) $("#" + id).hide();
	else $("#" + id).show();
}


function findVideo(id){
		for(var i = 0; i < entries.videos.length; i++){
		if(entries.videos[i].id == id){
			 return entries.videos[i];
		}
	}
}

var currentVideoId;


function formatCount(count){
	return formatMillion(count) + (count == 1 ? " view" : " views")
}

function showVideoDetails(id){

	currentVideoId = id;
	
	if(id == undefined){
		//showAlert("no id");
		return;
	}

	var v = findVideo(id);
	currentVideo = v;

	if(isOnline){
		$("#vid_image").hide();
		$("#vidframe").attr("src", "http://www.youtube.com/embed/" + id + "?showinfo=0" );

		$("#vidframe").show();			


	}
	else{
		$("#vidframe").hide();	
		$("#vid_image").attr("src", getRelativeFile(currentChannel,id)).show();	
	}

	$("#vid_title").html(v.title);

	$("#vid_description").html(v.description);

	$("#vid_viewcount").html(formatCount(v.count));
	$("#vid_newcount").html(v.newcount > 0 ?  "+" + formatMillion(v.newcount) : "");

	$("#vid_likeinfo").show();
	$("#vid_likes").html(formatMillion(v.likes) + (v.likes == 1 ? " like" : " likes"));
	$("#vid_dislikes").html(formatMillion(v.dislikes) + (v.dislikes == 1 ? " dislike" : " dislikes")) ;
	
	if(v.likes > v.dislikes){
		$("#vid_likeinfo").removeClass("red").addClass("green");
	}
	else if (v.dislikes > v.likes){
		$("#vid_likeinfo").removeClass("green").addClass("red");
	}
	else if (v.likes == 0 && v.dislikes == 0){
		$("#vid_likeinfo").hide();
	}
	else if(v.likes == v.dislikes) {
		$("#vid_likeinfo").removeClass("green").removeClass("red");
	}
	
	$("#vid_favorites").html(v.favorites + (v.favorites == 1 ? " favorite" : " favorites"));
	$("#vid_comments").html(formatMillion(v.comments) + (v.comments == 1 ? " comment" : " comments"));

	showEl("vid_likes", v.likes);	
	showEl("vid_dislikes", v.dislikes);			
	showEl("vid_favorites", v.favorites);
	showEl("vid_comments", v.comments);

	if(v.published != "")  $("#vid_published").html(v.published);
	else $("#vid_published").html("");

	$("#vid_detail").show();
	setTimeout(function(){
		scroller3.refresh();
		}, 300);

};

function getLastEntriesFilename(channel){
	return "lastentries-" + channel + ".txt";
}


function padzero(d) {
    return ("0" + d).slice(-2);
}

function perc(a,b){
	return a - b;
}


function showNoInternet(){
	showAlert("Internet connection required");
}

function formatDate(datetime) {
    var d = new Date(datetime);
	return "published on " + months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear() + " (" + padzero(d.getHours()) + ":" + padzero(d.getMinutes()) +")";
}



filer = new FileStorage();
$(init);




function addAnimate(element_ID, animation) {
    $(element_ID).addClass(animation);
    window.setTimeout( function(){
        $(element_ID).removeClass(animation)}, 1300
    );
}



