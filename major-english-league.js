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
        //finds the current fixture's row
        const row = +startButton.value;
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

        //simulates the fixture
        let time = setInterval(() => {
            minutes++;
            timeRow.textContent = `${minutes}'`;

            /*chooses random number and if it is 11, adds one goal to the home team,
            else if it is 12 - adds one goal to the away team(this is temporary)*/
            let randomNumber = Math.floor(Math.random() * 101);

            if (randomNumber === 11) {
                homeTeamGoals++;
            } else if (randomNumber === 12) {
                awayTeamGoals++;
            }

            //changes result if necessary
            resultRow.textContent = `${homeTeamGoals} - ${awayTeamGoals}`;

            //checks if minutes are equal to 90 and ends the fixture
            if (minutes === 90) {
                timeRow.textContent = 'FT';
                clearInterval(time);
                updateStatsOfTeams(homeTeam, awayTeam, homeTeamGoals, awayTeamGoals);
                updateTableStats();

                //disables the startButton if the last fixture from the current matchweek is played
                if (+startButton.value === 10) {
                    nextMatchweekButton.disabled = false;
                }
            }
        }, 100);
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

    function updateTableStats() {
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
        constructor(name) {
            this.name = name;
            this.playedMatches = 0;
            this.wins = 0;
            this.draws = 0;
            this.losses = 0;
            this.goalsFor = 0;
            this.goalsAgainst = 0;
            this.goalDifference = 0;
            this.points = 0;
        }
    }

    let teams = [
        new Team('Arsenal'),
        new Team('Aston Villa'),
        new Team('Bournemouth'),
        new Team('Brighton & Hove Albion'),
        new Team('Burnley'),
        new Team('Chelsea'),
        new Team('Crystal Palace'),
        new Team('Everton'),
        new Team('Leicester City'),
        new Team('Liverpool'),
        new Team('Manchester City'),
        new Team('Manchester United'),
        new Team('Newcastle United'),
        new Team('Norwich City'),
        new Team('Sheffield United'),
        new Team('Southampton'),
        new Team('Tottenham Hotspur'),
        new Team('Watford'),
        new Team('West Ham United'),
        new Team('Wolverhampton Wanderers'),
    ];

    let fixtures = [];
    let matchweeks = [];

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
