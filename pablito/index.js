import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import axios from "axios";
import cors from "cors";
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
dotenv.config();
app.use(cors());
app.get("/get-data", async (req, res) => {
    console.log(req.query.name);
    const name = req.query.name;
    const player = await axios.get(`https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${process.env.API_KEY}`);
    const data2 = await axios.get(
        `https://eun1.api.riotgames.com/lol/league/v4/entries/by-summoner/${player.data.id}?api_key=${process.env.API_KEY}`
    );
    const matches = await axios.get(
        `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${player.data.puuid}/ids?api_key=${process.env.API_KEY}`
    );

    const requests = matches.data.splice(0, 5).map((match) => {
        return axios.get(`https://europe.api.riotgames.com/lol/match/v5/matches/${match}?api_key=${process.env.API_KEY}`);
    });

    const matchesWithData = await Promise.all(requests);
    const resultOfMatches = matchesWithData.map((match) => match.data);
    // const tier = data2.data[0].tier ? data2.data[0].tier : "NO TIER";
    // const rank = data2.data[0].rank ? data2.data[0].rank : "NO RANK";
    // console.log(data2.request);
    const data = {
        profileIcon: `http://ddragon.leagueoflegends.com/cdn/13.1.1/img/profileicon/${player.data.profileIconId}.png`,
        name: player.data.name,
        level: player.data.summonerLevel,
        tier: data2.data.length > 0 ? data2.data[0].tier : "NO TIER",
        rank: data2.data.length > 0 ? data2.data[0].rank : "NO RANK",
        wins: data2.data.length > 0 ? data2.data[0].wins : "NO WINS",
        losses: data2.data.length > 0 ? data2.data[0].losses : "NO LOSSES",
        matches: matches.data,
        matchesWithData: resultOfMatches
    };
    res.send(JSON.stringify(data));
});

app.listen(3005, () => {
    console.log("listening...");
});
