# Twitter News Bot

## Final Project for Web Programming class

### Description and Features

This program is a Twitter News Bot with accompanying web site.  It gathers data from three news APIs, stores the results, and tweets new articles to the @TransNewsWeb twitter account.

There are two major components to the code: the bot code, which is the file "tweetybird.js", and the web site, which is managed through "app.js" and the files in the routes directory. Tweetybird.js connects to the three APIs, stores the results in an array of articles, and saves them to a mongodb database. Articles that are already in the database are discarded, and new ones are forwarded to a callback that tweets them at three-minute intervals.

The web page interacts with the MongoDB datastore to pull up recent articles. The site also allows people to create user accounts so they can save articles into a list of personal favorites. I had to use an npm module to force the site to run over https so that user data (such as passwords) get encrypted in transit.

### Known Issues

* User password management is not yet fully implemented. The routes are set up and working, but I need to do some client-side code so that reset submission can only happen if the new password is successfully confirmed.

### Possible Additional Features

* A "forgot password" feature. There are security and data privacy issues with this. Given the sensitive nature of the topic (transgender issues), I have opted explicitly _not_ to save any readily traceable user information such as email addresses.