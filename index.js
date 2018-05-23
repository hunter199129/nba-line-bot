var linebot = require('linebot');
var express = require('express');
var youtubeapi = require('./youtubeApi');

var bot = linebot({
  channelId: <Line channel id>,
  channelSecret: <Line channel secret>,
  channelAccessToken: <Line channel access token>
});

const helpMessage = `打HL可以看到今天Highlights, 電腦版打HLPC
後面加數字可以看到幾天以前
ex: hl1 表示前一天的highlights`;

bot.on('message', function (event) {
  if (event.message.type = 'text') {
    let msg = event.message.text;
    try { msg = msg.toLocaleLowerCase() }
    catch (err) { console.log(err) }
    let reply = '';

    if (msg === '/help') reply = helpMessage;
    if (msg === '嗨阿帆') reply = msg;
    if (msg.match(/^hlpc/)) youtubeHighlightsPC(event, Number(msg.match(/\d/)));
    if (msg.match(/^hl(?!pc)/)) youtubeHighlightsCarousel(event, Number(msg.match(/\d/))); 

    event.reply(reply).then(function (data) {
      // success 
      console.log(msg);
    }).catch(function (error) {
      // error 
      console.log('error');
    });
  }
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});

//youtubeapi.search().then(e => console.log(JSON.parse(e).map(f => `${f.title}\n${f.url}\n`)));

youtubeHighlightsPC = (event, daysAgo) => {
  youtubeapi.search(daysAgo).then(e => {
    event.reply(JSON.parse(e).map(f => `${f.title}\n${f.url}`).join('\n'));
  });
};

youtubeHighlightsCarousel = (event, daysAgo) => {
  youtubeapi.search(daysAgo).then(e => {
    let data = JSON.parse(e);
    let columns = [];
    data.forEach(f => {
console.log(f.title)
      if (columns.length === 6) {
        event.reply(carouselTemplate(columns)).then(data => 
          console.log('Send: '+JSON.stringify(data))
        ).catch(err => 
          console.log(err)
        );
        columns = [];
      } else {
        columns.push(columnTemplate(f.thumbnail, f.title, f.url));
      }
    });
    if (columns.length > 0) {
      //console.log(JSON.stringify(carouselTemplate(columns)));
      event.reply(carouselTemplate(columns)).then(data => 
        console.log('Send: '+JSON.stringify(data))
      ).catch(err => 
        console.log(err)
      );
    }
  });
}

//youtubeHighlightsCarousel();

carouselTemplate = (columns, altText = 'NBA Highlights') => ({
  "type": "template",
  "altText": altText,
  "template": {
    "type": "carousel",
    "columns": columns,
    "imageAspectRatio": "rectangle",
    "imageSize": "cover"
  }
})

columnTemplate = (imgUrl, text, videoUri) => (
  {
    "thumbnailImageUrl": imgUrl,
    "imageBackgroundColor": "#FFFFFF",
    "text": text,
    "actions": [
      {
        "type": "uri",
        "label": "Play video",
        "uri": videoUri
      }
    ]
  }
)
