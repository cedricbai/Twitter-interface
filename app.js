const express = require('express');
const bodyParser = require('body-parser');
var Twit = require('twit');
var config = require('./config').config;
var friendList = [];
var friendList_screenname = [];
var message_events = [];
var user_screen_name;
var message_id = [];
var message_text = [];
var sender_name = [];
var sender_screenname = [];
var sender_profile_img = [];
var friends_images = [];
var twit_text = [];
var profile_url;
var retweet_counts = [];
var liked_counts = [];
var post_time = [];
var message_time = [];
var other_screen_name;
var the_date;
const app = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'pug');

var T = new Twit(config);

function parseTwitterDate(tdate) {
    var system_date = new Date(Date.parse(tdate));
    var user_date = new Date();
    // if (K.ie) {
    //    system_date = Date.parse(tdate.replace(/( \+)/, ' UTC$1'))
    // }
    var diff = Math.floor((user_date - system_date) / 1000);
    if (diff <= 1) {return "just now";}
    else if (diff < 20) {return diff + " seconds ago";}
    else if (diff < 40) {return "half a minute ago";}
    else if (diff < 60) {return "less than a minute ago";}
    else if (diff <= 90) {return "one minute ago";}
    else if (diff <= 3540) {return Math.round(diff / 60) + " minutes ago";}
    else if (diff <= 5400) {return "1 hour ago";}
    else if (diff <= 86400) {return Math.round(diff / 3600) + " hours ago";}
    else if (diff <= 129600) {return "1 day ago";}
    else if (diff < 604800) {return Math.round(diff / 86400) + " days ago";}
    else if (diff <= 777600) {return "1 week ago";}
    else{
    	return "on " + system_date.toDateString().slice(4, 10);
	}
}


// var K = function () {
//     var a = navigator.userAgent;
//     console.log(a);
//     return {
//         ie: a.match(/MSIE\s([^;]*)/)
//     }
// }();

app.get('/', (req, res) => {
    T.get('account/verify_credentials', function(err, data, response){
    	user_screen_name = data.screen_name;
    }).then(function(result){
	T.get('statuses/user_timeline', { screen_name: user_screen_name, count: 5 }, function(err, data, response) {
	profile_url = data[0].user.profile_image_url;
	for(let i = 0; i < data.length; i++)
	{
		the_date = parseTwitterDate(data[i].created_at);
		post_time.push(the_date);
		twit_text.push(data[i].text);
		retweet_counts.push(data[i].retweet_count);
		liked_counts.push(data[i].favorite_count);
	}
}).then(function(result){
	T.get('friends/list', { screen_name: user_screen_name, count: 5 },  function (err, data, response) {
	  for(let i = 0; i < 5; i++)
	  {
	  	friendList.push(data.users[i].name);
	  	friends_images.push(data.users[i].profile_image_url);
	  	friendList_screenname.push(data.users[i].screen_name);
	  }
	}).then(function(result){
         T.get('direct_messages/events/list', function(err, data, response) {
			message_events = data.events;
		    if(message_events.length >= 5)
		    {
			    for(let i = 0; i < 5; i++)
			    {
			    	message_id.push(message_events[i].id);
			    }
			    for(let m = 0; m < 5; m++)
			    {
			    	T.get('direct_messages/show', { id: message_id[m] }, function(err, message, response) {
			    	//onsole.log(message.text);
			    		//console.log(message.text);
			    		if(message.sender.screen_name != user_screen_name)
			    		{
			    			other_screen_name = message.sender.screen_name;
			    		}
			    	    message_text[m] = message.text;
			    	    sender_name[m] = message.sender.name;
			    	    sender_screenname[m] = message.sender.screen_name;
			    	    sender_profile_img[m] = message.sender.profile_image_url;
			    	    message_time[m] = parseTwitterDate(message.created_at);
			    	})

			   }
		    }
		}).then(function(result){
			                if(message_text.length == 5 && sender_name.length == 5 && sender_screenname.length == 5 && message_time.length == 5){
			    			res.render('index', { img_url: profile_url, post_time, message_time, twit_text, friendList, retweet_counts, liked_counts,
			                 friendList_screenname, friends_images, other_screen_name, message_text, sender_name, sender_screenname, sender_profile_img });
			    			return;
			           }
			        });	
		})
	});
   });
});

app.listen(3000, () => {
	console.log('This application is running on localhost: 3000')
});