const {
  google
} = require('googleapis');
const fs = require('fs');

// initialize the Youtube API library
const youtube = google.youtube({
  version: 'v3',
  auth: <your Youtube api key>
});

async function search(daysAgo = 0) {
  let now = new Date();
  let nextDay = new Date();
  now.setDate(now.getDate() - daysAgo);
  nextDay.setDate(now.getDate() + 1);

  const res = youtube.search.list({
    part: 'id,snippet',
    q: 'highlights -1st|interview',
    channelId: 'UCoh_z6QB0AGB1oxWufvbDUg',
    maxResults: 15,
    publishedAfter: ISODateString(now),
    publishedBefore: ISODateString(nextDay),
  });
  return res.then(e => {
    return (JSON.stringify(e.data.items
      .map(g => {
        match = g.snippet.title.match(/(\w+) (\w+) vs (\w+) (\w+) Full/g);
	if (match) {
          return {
            title: match[0].slice(0, -5),
            url: 'https://www.youtube.com/watch?v=' + g.id.videoId,
            thumbnail: g.snippet.thumbnails.medium.url,
          }
        }
      })
      .filter(f => f)
      , null, 2))
    //console.log('%j', e.data.items.map(e => e.id))
  });

  /*
    Transform date format to RFC3339
  */
  function ISODateString(d) {
    function pad(n) {
      return n < 10 ? '0' + n : n
    }
    return d.getUTCFullYear() + '-' +
      pad(d.getUTCMonth() + 1) + '-' +
      pad(d.getUTCDate()) + 'T' +
      '00:00:00Z'
  }
}

//search(1).catch(console.error);

module.exports = {
  search : function(daysAgo) {
    return search(daysAgo);
  },
}
