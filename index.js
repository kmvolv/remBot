const apikey = ""
const usrname = ""
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const { Client, LocalAuth } = require('whatsapp-web.js');

const month_dict = {
  '01' : 'January'
  , '02' : 'February'
  , '03' : 'March'
  , '04' : 'April'
  , '05' : 'May'
  , '06' : 'June'
  , '07' : 'July'
  , '08' : 'August'
  , '09' : 'September'
  , '10' : 'October'
  , '11' : 'November'
  , '12' : 'December'
}

const day_dict = {
  'Sun' : 'Sunday'
  , 'Mon' : 'Monday'
  , 'Tue' : 'Tuesday'
  , 'Wed' : 'Wednesday'
  , 'Thu' : 'Thursday'
  , 'Fri' : 'Friday'
  , 'Sat' : 'Saturday'
}

function date_suffx(date){
  if(date[0] === '1') return (date + 'th')
  else if(date[0] === '0'){
      date = date.slice(-1)
      if(date === '1') return (date + 'st')
      else if(date === '2') return (date + 'nd')
      else if(date == '3') return (date + 'rd')
      else return (date + 'th')
  }
  else if(date[1] === '1') return (date + 'st')
  else if(date[1] === '2') return (date + 'nd')
  else if(date[1] === '3') return (date + 'rd')
  else return (date + 'th')
  
}

function format_time(date_str){
  const dets = date_str.split(" ")
  const tims = dets[0].split(".")
  return (day_dict[dets[1]] + ", " + date_suffx(tims[0]) + " " + month_dict[tims[1]] + " " + dets[2])
}

function compare_dates(date){
  let cdate = new Date(date).getTime()
  cdate += (19800000)
  let now = new Date().getTime()

  if(cdate < now){
    return -1
  }
  else{
    return (parseInt((cdate-now))/1000)
  }
}

function isInteger(value) {
  return /^\d+$/.test(value);
}

function dispFunc(obj,idx){
  let finmsg = ""

  finmsg = finmsg.concat(
    idx == null? "" : "*" + JSON.stringify(idx) + ".*\n"
    , "*Contest Name* : "   
    , JSON.stringify(obj.event).slice(1,-1)
    , "\n*Contest Starts on* :"
    , JSON.stringify(format_time(obj.start)).slice(1,-1)
    , "\n*Duration of contest* : "
    , JSON.stringify(obj.duration).slice(1,-1)
    , "\n*Contest Link* : "
    , JSON.stringify(obj.href).slice(1,-1)
    , "\n*Contest Ends at* : "
    , JSON.stringify(format_time(obj.end)).slice(1,-1)
  )

  return finmsg
}

function secondsToHrs(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);

  var hDisplay = (h >= 0 ? h == 0 ? "" : h + (h == 1 ? " Hour " : " Hours, ") : "");
  var mDisplay = m >= 0 ? m + (m == 1 ? " Minute " : " Minutes ") : "";
  return hDisplay + mDisplay; 
}

const client = new Client({
    puppeteer: {
      executablePath: '/usr/bin/brave-browser-stable',
    },
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: false,
    }
});


client.initialize();

client.on('authenticated', (session) => {
    console.log('WHATSAPP WEB => Authenticated');
  });

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on("ready", async () => {
    console.log("WHATSAPP WEB => Ready");
  });

client.on('message', async message => {
  const msg = await axios("https://clist.by:443/api/v2/contest/?upcoming=true&username=" + usrname + "&api_key=" + apikey + "&host__regex=(%3F%3Acodeforces%5C.com)%7C(%3F%3Acodechef%5C.com)%7C(%3F%3Aleetcode%5C.com)%7C(%3F%3Aatcoder%5C.jp)%7C(%3F%3Acodingcompetitions%5C.withgoogle%5C.com)&order_by=start&limit=10&format_time=true&start_time__during=604800&total_count=true")
      .then(res => res.data)
      let finmsg = ""
      let arr_objs = []
      let ind = 1

      msg["objects"].forEach(function(obj){
        let infomsg = dispFunc(obj,ind)
        arr_objs.push(obj)

        finmsg = finmsg.concat(infomsg, ind == msg["objects"].length? "" : "\n\n")
        ind+=1
      }
    )
	if(message.body === '!list') {
        client.sendMessage(message.from,finmsg)
	}
   
  else if(message.body.match(/^(!remind)/)){
    get_cid = message.body.split(" ")
    if(isInteger(get_cid[1])){
      const idxval = parseInt(get_cid[1])
      if(idxval > arr_objs.length || idxval <= 0){
        client.sendMessage(message.from, "Invalid Command, please follow the format")
      }
      else{
        const contest = await axios("https://clist.by:443/api/v2/contest/" + arr_objs[idxval-1].id + "/?upcoming=true&username=" + usrname + "&api_key=" + apikey + "&host__regex=(%3F%3Acodeforces%5C.com)%7C(%3F%3Acodechef%5C.com)%7C(%3F%3Aleetcode%5C.com)%7C(%3F%3Aatcoder%5C.jp)%7C(%3F%3Acodingcompetitions%5C.withgoogle%5C.com)&order_by=start&limit=10&format_time=true&start_time__during=604800&total_count=true")
          .then(res => res.data)

        const timediff = compare_dates(contest.start)
        if(timediff === -1){
          client.sendMessage(message.from,  "The contest has already started!\n\nYou can enter the contest through this link:\n"+ arr_objs[idxval-1].href)
        }
        else{
          let remval = dispFunc(arr_objs[idxval-1])
          let usr_msg = "*Reminder set!* The contest will begin in " + secondsToHrs(timediff) + "\n\n*_Contest Details:_*\n\n" + remval + "\n\nThe reminder message will be sent *10 minutes* before the start time of the contest."
          client.sendMessage(message.from, usr_msg)

          let reminder_time = Math.max(timediff - 600, 0)
          setTimeout(function(){
            client.sendMessage(message.from, "*REMINDER!* This contest begins soon!\n\n" + remval)
          }
          , reminder_time*1000)
        }
      }
    }
    else{
      client.sendMessage(message.from, "Invalid Command, please follow the format")
    }
  }

  else if(message.body === '!help'){
    help_msg = 
    `Hi there, Welcome to remBot! Take a look at the commands you can use to interact with the bot :

      - *!list* : Gives an indexed list of upcoming/ongoing contests from Competitive Coding Platforms.
      - *!remind _{value}_* : Schedules a reminder for the contest with index of *_value_*.`
    client.sendMessage(message.from, help_msg)
  }
});