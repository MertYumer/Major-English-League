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
            const goalscorerIndex = Math.floor(Math.random() * 11) + 1;
            const players = Object.keys(team.players);
            let player;

            if (goalscorerIndex === 10 || goalscorerIndex === 11) {
                player = players[10];
            } else {
                player = players[goalscorerIndex];
            }

            team.players[player]++;
        }

        //adds clean sheet to the goalkeeper when the team keeps clean sheet
        function addCleanSheetToGoalkeeperStats(team) {
            const players = Object.keys(team.players);
            const player = players[0];
            team.players[player]++;
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

                /*enables the nextMatchweekButton if the last fixture from the current
                matchweek is played and there is at leaste one more matchweek*/
                if (+startButton.value === 10 && +nextMatchweekButton.value < 38) {
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
        new Team('Arsenal', {'Leno': 0, 'Bellerin': 0, 'Sokratis': 0, 'Koscielny': 0, 'Monreal': 0,
            'Torreira': 0, 'Xhaka': 0, 'Ozil': 0, 'Mkhitaryan': 0, 'Aubameyang': 0, 'Lacazzette': 0}),
        new Team('Aston Villa', {'Steer': 0, 'El Mohamady': 0, 'Tuanzebe': 0, 'Mings': 0, 'Taylor': 0,
            'Hourihane': 0, 'Adomah': 0, 'McGinn': 0, 'Grealish': 0, 'El-Ghazi': 0, 'Abraham': 0}),
        new Team('Bournemouth', {'Begovic': 0, 'Francis': 0, 'Ake': 0, 'S. Cook': 0, 'Rico': 0, 'Ibe': 0,
            'Lerma': 0, 'L. Cook': 0, 'Stanislas': 0, 'Wilson': 0, 'King': 0}),
        new Team('Brighton & Hove Albion', {'Ryan': 0, 'Montoya': 0, 'Duffy': 0, 'Dunk': 0, 'Bernardo': 0,
            'Stephens': 0, 'Propper': 0, 'Jahanbakhsh': 0, 'Gross': 0, 'Izquierdo': 0, 'Andone': 0}),
        new Team('Burnley', {'Heaton': 0, 'Lowton': 0, 'Tarkowski': 0, 'Mee': 0, 'Ward': 0, 'Gudmundsson': 0,
            'Cork': 0, 'Defour': 0, 'Brady': 0, 'Hendrick': 0, 'Wood': 0}),
        new Team('Chelsea', {'Kepa': 0, 'Azpilicueta': 0, 'Rudiger': 0, 'Luiz': 0, 'Alonso': 0, 'Jorginho': 0,
            'Kovacic': 0, 'Kante': 0, 'William': 0, 'Hazard': 0, 'Morata': 0}),
        new Team('Crystal Palace', {'Hennesey': 0, 'Wan Bissaka': 0, 'Tomkins': 0, 'Sakho': 0, 'var Aanholt': 0,
            'Townsend': 0, 'Milivojevic': 0, 'Meyer': 0, 'Schlupp': 0, 'Benteke': 0, 'Zaha': 0}),
        new Team('Everton', {'Pickford': 0, 'Coleman': 0, 'Zouma': 0, 'Mina': 0, 'Digne': 0, 'Gueye': 0,
            'Gomes': 0, 'Walcott': 0, 'Sigurdsson': 0, 'Richarlison': 0, 'Tosun': 0}),
        new Team('Leicester City', {'Schmeichel': 0, 'Maguire': 0, 'Evans': 0, 'Soyuncu': 0, 'Pereira': 0,
            'Ndidi': 0, 'Iborra': 0, 'Chillwell': 0, 'Maddison': 0, 'Iheanacho': 0, 'Vardy': 0}),
        new Team('Liverpool', {'Alisson': 0, 'Alexander-Arnold': 0, 'Lovren': 0, 'van Dijk': 0, 'Robertson': 0,
            'Fabinho': 0, 'Henderson': 0, 'Wijnaldum': 0, 'Mane': 0, 'Firmino': 0, 'Salah': 0}),
        new Team('Manchester City', {'Ederson': 0, 'Walker': 0, 'Stones': 0, 'Laporte': 0, 'Mendy': 0,
            'Fernandinho': 0, 'de Bruyne': 0, 'Silva': 0, 'Mahrez': 0, 'Sterling': 0, 'Aguero': 0}),
        new Team('Manchester United', {'De Gea': 0, 'Valencia': 0, 'Smalling': 0, 'Bailly': 0, 'Young': 0,
            'Matic': 0, 'Fred': 0, 'Pogba': 0, 'Lingard': 0, 'Sanchez': 0, 'Lukaku': 0}),
        new Team('Newcastle United', {'Dubravka': 0, 'Yedlin': 0, 'Schär': 0, 'Lascelles': 0, 'Dummett': 0,
            'Ki Sung-yeung': 0, 'Shelvey': 0, 'Ritchie': 0, 'Perez': 0, 'Kenedy': 0, 'Rondon': 0}),
        new Team('Norwich City', {'Krull': 0, 'Aarens': 0, 'Cimerman': 0, 'Godfrey': 0, 'Lewis': 0, 'McLean': 0,
            'Vranchich': 0, 'Buendia': 0, 'Stiepermann': 0, 'Hernandez': 0, 'Puki': 0}),
        new Team('Sheffield United', {'Henderson': 0, 'Boldlock': 0, 'Basham': 0, 'Ign': 0, 'O\'Conn': 0,
            'Norud': 0, 'Flek': 0, 'Stevens': 0, 'Duffy': 0, 'Sharpe': 0, 'Makgoldrik': 0}),
        new Team('Southampton', {'McGarthy': 0, 'Vestegaard': 0, 'Yoshida': 0, 'Hoedt': 0, 'Cedric': 0,
            'Bertrand': 0, 'Romeu': 0, 'Lemina': 0, 'Ward-Powse': 0, 'Elyounoussi': 0, 'Austin': 0}),
        new Team('Tottenham Hotspur', {'Lloris': 0, 'Trippier': 0, 'Alderweireld': 0, 'Verthongen': 0,
            'Davies': 0, 'Dier': 0, 'Dembele': 0, 'Alli': 0, 'Eriksen': 0, 'Son': 0, 'Kane': 0}),
        new Team('Watford', {'Foster': 0, 'Janmaat': 0, 'Cathcart': 0, 'Kabaseie': 0, 'Masina': 0,
            'Doucoure': 0, 'Capoue': 0, 'Deulofeu': 0, 'Hughes': 0, 'Pereyra': 0, 'Gray': 0}),
        new Team('West Ham United', {'Fabianski': 0, 'Fredericks': 0, 'Balbuena': 0, 'Ogbonna': 0,
            'Cresswell': 0, 'Rice': 0, 'Noble': 0, 'Anderson': 0, 'Wilshere': 0, 'Arnautovic': 0, 'Chicharito': 0}),
        new Team('Wolverhampton Wanderers', {'Patricio': 0, 'Dendoncker': 0, 'Coady': 0, 'Boly': 0, 'Doherty': 0,
            'Jonny': 0, 'Neves': 0, 'Moutinho': 0, 'Traore': 0, 'Jota': 0, 'Jimenez': 0}),
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
