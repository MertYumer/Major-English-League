function solve() {
    //creates tournament in which each team plays every other team home and away
    function createFixtures() {
        for (let firstTeam = 0; firstTeam < teams.length; firstTeam++) {
            for (let secondTeam = firstTeam + 1; secondTeam < teams.length; secondTeam++) {
                fixtures.push([teams[firstTeam], teams[secondTeam]]);
                fixtures.push([teams[secondTeam], teams[firstTeam]]);
            }
        }
    }

    //creates all matchweeks and checks if some of the teams is repeated in a single matchweek
    function createMatchweeks() {
        //iterates through all matchweeks
        for (let j = 0; j < 38; j++) {
            matchweeks[j] = [];
            //adds all teams that play in current matchweek
            let addedTeams = [];
            //adds the indexes of all fixtures in current matchweek
            let fixturesIndexes = [];

            //every matchweek contains 10 fixtures
            while (matchweeks[j].length < 10) {
                //chooses random index from the available fixtures
                let randomIndex = Math.floor(Math.random() * fixtures.length);

                //gets teams' names from current fixture
                const homeTeamName = fixtures[randomIndex][0].name;
                const awayTeamName = fixtures[randomIndex][1].name;

                //checks if some of the two teams is already in current matchweek
                if (!addedTeams.includes(homeTeamName) && !addedTeams.includes(awayTeamName)) {
                    matchweeks[j].push(fixtures[randomIndex]);
                    fixturesIndexes.push(randomIndex);
                    addedTeams.push(homeTeamName);
                    addedTeams.push(awayTeamName);
                }
            }

            //removes all fixtures that were chosen in current matchweek
            fixtures.filter(f => !fixturesIndexes.includes(fixtures.indexOf(f)));
        }
    }

    function addFixturesToMatchweek() {
        //counts the number of played matchweeks
        nextMatchweekButton.value++;

        //sets startButton.value to 0, so it counts on which row is the current fixture
        startButton.value = 0;
        startButton.disabled = false;

        //disables nextMatchweekButton until all fixtures in current matchweek are not finished
        nextMatchweekButton.disabled = true;

        //gets current matchweek
        const matchweek = matchweeks.shift();

        //iterates through all table rows and adds time, team names and result
        for (let row = 0; row < matchweekRows.length; row++) {
            matchweekRows[row].cells[0].textContent = '0\'';
            matchweekRows[row].cells[1].textContent = matchweek[row][0].name;
            matchweekRows[row].cells[2].textContent = '0 - 0';
            matchweekRows[row].cells[3].textContent = matchweek[row][1].name;
        }
    }

    function startMatch() {
        //adds goal to random player when the team scores a goal
        function addGoalToPlayerStats(team) {
            const randomGoalscorerIndex = Math.floor(Math.random() * 11) + 1;
            let playerName;

            //checks if random index is 10 or 11(because the striker has bigger chance of scoring)
            if (randomGoalscorerIndex === 10 || randomGoalscorerIndex === 11) {
                playerName = team.players[10];
            } else {
                playerName = team.players[randomGoalscorerIndex];
            }

            //checks if player's name is among the goalscorers
            const playerIndex = goalScorers.findIndex(p => p.name === playerName);

            if (playerIndex === -1) {
                const player = {
                    name: playerName,
                    team: team.name,
                    goals: 1
                };

                goalScorers.push(player);
            } else {
                goalScorers[playerIndex].goals++;
            }
        }

        //adds clean sheet to the goalkeeper when the team keeps clean sheet
        function addCleanSheetToGoalkeeperStats(team) {
            const playerName = team.players[0];

            //checks if player's name is among the goalkeepers
            const playerIndex = goalKeepers.findIndex(p => p.name === playerName);

            if (playerIndex === -1) {
                const player = {
                    name: playerName,
                    team: team.name,
                    cleanSheets: 1
                };

                goalKeepers.push(player);
            } else {
                goalKeepers[playerIndex].cleanSheets++;
            }
        }

        //finds the current fixture's row
        const row = +startButton.value;

        //counts the number of played fixtures in current matchweek
        startButton.value++;

        //disables the startButton if the last fixture from the current matchweek is played
        if (+startButton.value === 10) {
            startButton.disabled = true;
        }

        //gets current time and result cells
        let timeRow = matchweekRows[row].cells[0];
        let resultRow = matchweekRows[row].cells[2];

        //gets the playing teams
        let homeTeam = teams[teams
            .findIndex(t => t.name === matchweekRows[row].cells[1].textContent)];

        let awayTeam = teams[teams
            .findIndex(t => t.name === matchweekRows[row].cells[3].textContent)];

        let minutes = 0;
        let homeTeamGoals = 0;
        let awayTeamGoals = 0;
        let randomGoalNumber;

        //simulates the fixture
        let time = setInterval(() => {
            minutes++;
            timeRow.textContent = `${minutes}'`;

            /*chooses random number and if it is 11, adds one goal to the home team,
            else if it is 12 - adds one goal to the away team(this is temporary)*/
            randomGoalNumber = Math.floor(Math.random() * 101);

            if (randomGoalNumber === 11) {
                homeTeamGoals++;
                addGoalToPlayerStats(homeTeam);

            } else if (randomGoalNumber === 12) {
                awayTeamGoals++;
                addGoalToPlayerStats(awayTeam);
            }

            //changes result if necessary
            resultRow.textContent = `${homeTeamGoals} - ${awayTeamGoals}`;

            //checks if minutes are equal to 90 and ends the fixture
            if (minutes === 90) {
                timeRow.textContent = 'FT';

                if (awayTeamGoals === 0) {
                    addCleanSheetToGoalkeeperStats(homeTeam);
                }

                if (homeTeamGoals === 0) {
                    addCleanSheetToGoalkeeperStats(awayTeam);
                }

                clearInterval(time);
                updateStatsOfTeams(homeTeam, awayTeam, homeTeamGoals, awayTeamGoals);
                updateLeagueTableStats();

                //orders goalscorers by goals count and goalkeepers by clean sheets in descending order
                goalScorers.sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));
                goalKeepers.sort((a, b) => b.cleanSheets - a.cleanSheets || a.name.localeCompare(b.name));

                /*enables the nextMatchweekButton if the last fixture from the current
                matchweek is played and there is at least one more matchweek*/
                if (+startButton.value === 10 && +nextMatchweekButton.value < 38) {
                    nextMatchweekButton.disabled = false;
                }
            }
        }, 1);
    }

    function updateStatsOfTeams(homeTeam, awayTeam, homeTeamGoals, awayTeamGoals) {
        function updatePlayedMatchesAndGoals(team, homeGoals, awayGoals) {
            team.playedMatches++;
            team.goalsFor += homeGoals;
            team.goalsAgainst += awayGoals;
            team.goalDifference = team.goalsFor - team.goalsAgainst;
        }

        updatePlayedMatchesAndGoals(homeTeam, homeTeamGoals, awayTeamGoals);
        updatePlayedMatchesAndGoals(awayTeam, awayTeamGoals, homeTeamGoals);

        if (homeTeamGoals > awayTeamGoals) {
            homeTeam.wins++;
            homeTeam.points += 3;
            awayTeam.losses++;

        } else if (homeTeamGoals < awayTeamGoals) {
            awayTeam.wins++;
            awayTeam.points += 3;
            homeTeam.losses++;

        } else {
            homeTeam.draws++;
            homeTeam.points++;

            awayTeam.draws++;
            awayTeam.points++;
        }
    }

    function updateLeagueTableStats() {
        /*sorts teams in table - first by points in descending,
        then by goal difference in descending,
        then by most scored goals in descending,
        then by name in ascending*/
        teams.sort((a, b) =>
            b.points - a.points
            || b.goalDifference - a.goalDifference
            || b.goalsFor - a.goalsFor
            || a.name.localeCompare(b.name));

        //iterates through every cell in table and adds teams' stats
        for (let row = 0; row < leagueTable.length; row++) {
            const currentTeam = Object.values(teams[row]);

            for (let col = 1; col < leagueTable[row].cells.length; col++) {
                leagueTable[row].cells[col].textContent = currentTeam[col - 1];
            }
        }
    }

    class Team {
        constructor(name, players) {
            this.name = name;
            this.playedMatches = 0;
            this.wins = 0;
            this.draws = 0;
            this.losses = 0;
            this.goalsFor = 0;
            this.goalsAgainst = 0;
            this.goalDifference = 0;
            this.points = 0;
            this.players = players;
        }
    }

    let teams = [
        new Team('Arsenal', ['Leno', 'Bellerin', 'Sokratis', 'Koscielny', 'Monreal',
            'Torreira', 'Xhaka', 'Ozil', 'Mkhitaryan', 'Aubameyang', 'Lacazzette']),
        new Team('Aston Villa', ['Steer', 'El Mohamady', 'Tuanzebe', 'Mings', 'Taylor',
            'Hourihane', 'Adomah', 'McGinn', 'Grealish', 'El-Ghazi', 'Abraham']),
        new Team('Bournemouth', ['Begovic', 'Francis', 'Ake', 'S. Cook', 'Rico', 'Ibe',
            'Lerma', 'L. Cook', 'Stanislas', 'Wilson', 'King']),
        new Team('Brighton & Hove Albion', ['Ryan', 'Montoya', 'Duffy', 'Dunk', 'Bernardo',
            'Stephens', 'Propper', 'Jahanbakhsh', 'Gross', 'Izquierdo', 'Andone']),
        new Team('Burnley', ['Heaton', 'Lowton', 'Tarkowski', 'Mee', 'Ward', 'Gudmundsson',
            'Cork', 'Defour', 'Brady', 'Hendrick', 'Wood']),
        new Team('Chelsea', ['Kepa', 'Azpilicueta', 'Rudiger', 'Luiz', 'Alonso', 'Jorginho',
            'Kovacic', 'Kante', 'William', 'Hazard', 'Morata']),
        new Team('Crystal Palace', ['Hennesey', 'Wan Bissaka', 'Tomkins', 'Sakho', 'var Aanholt',
            'Townsend', 'Milivojevic', 'Meyer', 'Schlupp', 'Benteke', 'Zaha']),
        new Team('Everton', ['Pickford', 'Coleman', 'Zouma', 'Mina', 'Digne', 'Gueye',
            'Gomes', 'Walcott', 'Sigurdsson', 'Richarlison', 'Tosun']),
        new Team('Leicester City', ['Schmeichel', 'Maguire', 'Evans', 'Soyuncu', 'Pereira',
            'Ndidi', 'Iborra', 'Chillwell', 'Maddison', 'Iheanacho', 'Vardy']),
        new Team('Liverpool', ['Alisson', 'Alexander-Arnold', 'Lovren', 'van Dijk', 'Robertson',
            'Fabinho', 'Henderson', 'Wijnaldum', 'Mane', 'Firmino', 'Salah']),
        new Team('Manchester City', ['Ederson', 'Walker', 'Stones', 'Laporte', 'Mendy',
            'Fernandinho', 'de Bruyne', 'Silva', 'Mahrez', 'Sterling', 'Aguero']),
        new Team('Manchester United', ['De Gea', 'Valencia', 'Smalling', 'Bailly', 'Young',
            'Matic', 'Fred', 'Pogba', 'Lingard', 'Sanchez', 'Lukaku']),
        new Team('Newcastle United', ['Dubravka', 'Yedlin', 'Schar', 'Lascelles', 'Dummett',
            'Ki Sung-yeung', 'Shelvey', 'Ritchie', 'Perez', 'Kenedy', 'Rondon']),
        new Team('Norwich City', ['Krull', 'Aarens', 'Cimerman', 'Godfrey', 'Lewis', 'McLean',
            'Vranchich', 'Buendia', 'Stiepermann', 'Hernandez', 'Puki']),
        new Team('Sheffield United', ['Henderson', 'Boldlock', 'Basham', 'Ign', 'O\'Conn',
            'Norud', 'Flek', 'Stevens', 'Duffy', 'Sharpe', 'Makgoldrik']),
        new Team('Southampton', ['McGarthy', 'Vestegaard', 'Yoshida', 'Hoedt', 'Cedric',
            'Bertrand', 'Romeu', 'Lemina', 'Ward-Powse', 'Elyounoussi', 'Austin']),
        new Team('Tottenham Hotspur', ['Lloris', 'Trippier', 'Alderweireld', 'Verthongen',
            'Davies', 'Dier', 'Dembele', 'Alli', 'Eriksen', 'Son', 'Kane']),
        new Team('Watford', ['Foster', 'Janmaat', 'Cathcart', 'Kabaseie', 'Masina',
            'Doucoure', 'Capoue', 'Deulofeu', 'Hughes', 'Pereyra', 'Gray']),
        new Team('West Ham United', ['Fabianski', 'Fredericks', 'Balbuena', 'Ogbonna',
            'Cresswell', 'Rice', 'Noble', 'Anderson', 'Wilshere', 'Arnautovic', 'Chicharito']),
        new Team('Wolverhampton Wanderers', ['Patricio', 'Dendoncker', 'Coady', 'Boly', 'Doherty',
            'Jonny', 'Neves', 'Moutinho', 'Traore', 'Jota', 'Jimenez']),
    ];

    let fixtures = [];
    let matchweeks = [];
    let goalScorers = [];
    let goalKeepers = [];

    let leagueTable = document.querySelector('#leagueTable tbody').rows;
    let matchweekRows = document.querySelector('#matchweek tbody').rows;

    let startButton = document.getElementById('startBtn');
    startButton.addEventListener('click', startMatch);

    let nextMatchweekButton = document.getElementById('nextBtn');
    nextMatchweekButton.addEventListener('click', addFixturesToMatchweek);

    //executes these functions immediately after the page loads
    createFixtures();
    createMatchweeks();
    addFixturesToMatchweek();
}
