require('dotenv').config()
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/',(req,res)=>{
    res.send('Hello World')
})

app.get('/twitter',(req,res)=>{
    res.send('AsliSOna')
})

const githubData={
    "login": "Avibglore1",
  "id": 156946023,
  "node_id": "U_kgDOCVrOZw",
  "avatar_url": "https://avatars.githubusercontent.com/u/156946023?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/Avibglore1",
  "html_url": "https://github.com/Avibglore1",
  "followers_url": "https://api.github.com/users/Avibglore1/followers",
  "following_url": "https://api.github.com/users/Avibglore1/following{/other_user}",
  "gists_url": "https://api.github.com/users/Avibglore1/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/Avibglore1/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/Avibglore1/subscriptions",
  "organizations_url": "https://api.github.com/users/Avibglore1/orgs",
  "repos_url": "https://api.github.com/users/Avibglore1/repos",
  "events_url": "https://api.github.com/users/Avibglore1/events{/privacy}",
  "received_events_url": "https://api.github.com/users/Avibglore1/received_events",
  "type": "User",
  "user_view_type": "public",
  "site_admin": false,
  "name": "Avinash Kumar",
  "company": null,
  "blog": "",
  "location": null,
  "email": null,
  "hireable": null,
  "bio": null,
  "twitter_username": null,
  "public_repos": 35,
  "public_gists": 0,
  "followers": 2,
  "following": 0,
  "created_at": "2024-01-17T18:01:10Z",
  "updated_at": "2025-01-30T10:31:50Z"
}
app.get('/githu',(req,res)=>{
    console.log("GitHub route hit");
    res.json(githubData);
})

app.listen(PORT,()=>{
    console.log(`App listening on port ${PORT}`);   
})