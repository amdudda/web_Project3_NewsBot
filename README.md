# Twitter News Bot

## Final Project for Web Programming class

### Description and Features

This program is a Twitter News Bot with accompanying web site.  It gathers data from three news APIs, stores the results, and tweets new articles to the @TransNewsWeb twitter account.

There are two major components to the code: the bot code, which is the file "tweetybird.js", and the web site, which is managed through "app.js" and the files in the routes directory. Tweetybird.js connects to the three APIs, stores the results in an array of articles, and saves them to a MongoDB database. Articles that are already in the database are discarded, and new ones are stored in a "tweetables" array.  The tweetables are forwarded to a callback that tweets the articles at three-minute intervals.

The web page (hosted at https://transnewspulse.herokuapp.com/) interacts with the MongoDB datastore to pull up recent articles. The site also allows people to create user accounts so they can save articles into a list of personal favorites. I had to use an npm module to force the site to run over https so that user data (such as passwords) get encrypted in transit.  It also has a search page so people can search for articles stored in the database.

### Prerequisites to Run
* This runs on Nodejs with a MongoDB datastore
* It also requires Twitter API consumer & client keys, and keys for the NYT, Guardian, and Bing APIs.

### Known Issues

* User password management is not yet fully implemented. The routes are set up and working, but I need to do some client-side code so that reset submission can only happen if the new password is successfully confirmed.
* I noticed some odd layout quirks when testing the web site on my Kindle. I may switch to using Bootstrap to handle CSS styling of the pages.
* Sometime after my initial deployment, my NYT api started generating errors, and it seems to be affecting my ability to fetch & store their data. So my tweets don't seem to be getting tweeted. (I think I have traced the cause to callbacks being told to proceed before the data is actually ready.)

### Possible Additional Features

* A "forgot password" feature. There are security and data privacy issues with this. Given the sensitive nature of the topic (transgender issues), I have opted explicitly _not_ to save any readily traceable user information such as email addresses.