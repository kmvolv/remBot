# remBot
A Reminder Bot for Competitive Coding Contests on Whatsapp

This bot was made using [whatsapp-web.js](https://wwebjs.dev/), which is a library for NodeJS. In addition to this, the data for the competitive coding contests is procured using the [CLIST API](https://clist.by/api/v2/doc/).

Due to constraints in the number of API requests and hosting platforms, this can be utilized through local hosting for the time being. 

To host this bot locally, follow the following steps :
- You first need an API key, which you can get after creating an account on [clist](clist.by) and then clicking on 'show my api-key' present in [this link](https://clist.by/api/v2/doc/)
- Then, enter your API key and CLIST username in the `apikey` and `usrname` variables present in the first two lines of the `index.js` file in the repository.
- Run `npm start` in your terminal, make sure the dependencies are installed. 
- A new chromium browser will open up, where you will be prompted to log-in to whatsapp web through a QR code. 
- You're all set up!

## Commands Available:
  - **!list** : Gives a list of the top 10 upcoming contests in popular competitive coding platforms within a week.
  - **!remind {_value_}** : Sets up a reminder for the contest with index number of `value`. The reminder message is sent **10 minutes** before the contest begins.
  - **!help** : Shows the user a list of available commands.
  
 
## Future Scope:
- The elephant in the room is definitely the fact that it isn't being hosted on a hosting platform.
- More commands to make the reminders more dynamic, as well as to obtain additional information on contests. 
