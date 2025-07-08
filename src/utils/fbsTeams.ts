// fbsTeams.ts

import { getCoachProfile } from './localStorage';


export interface Team {
  name: string,
  nickName: string,
  abbrev: string,
  conference: 'ACC' | 'Big Ten' | 'Big 12' | 'Pac-12' | 'SEC' | 'Independents' | 'AAC' | 'C-USA' | 'MAC' | 'MWC' | 'Sun Belt',
  city: string,
  state: string
  stadium: string
}

export const fbsTeams: Team[] = [
  {
    "name": "Air Force",
    "nickName": "Falcons",
    "city": "Colorado Springs",
    "state": " Colorado",
    "conference": "MWC",
    "stadium": "Falcon Stadium",
    "abbrev": "AFA"
  },
  {
    "name": "Akron",
    "nickName": "Zips",
    "city": "Akron",
    "state": " Ohio",
    "conference": "MAC",
    "stadium": "InfoCision Stadium",
    "abbrev": "AKR"
  },
  {
    "name": "Alabama",
    "nickName": "Crimson Tide",
    "city": "Tuscaloosa",
    "state": " Alabama",
    "conference": "SEC",
    "stadium": "Bryant–Denny Stadium",
    "abbrev": "BAMA"
  },
  {
    "name": "Appalachian State",
    "nickName": "Mountaineers",
    "city": "Boone",
    "state": " North Carolina",
    "conference": "Sun Belt",
    "stadium": "Kidd Brewer Stadium",
    "abbrev": "APP"
  },
  {
    "name": "Arizona",
    "nickName": "Wildcats",
    "city": "Tucson",
    "state": " Arizona",
    "conference": "Big 12",
    "stadium": "Arizona Stadium",
    "abbrev": "ARIZ"
  },
  {
    "name": "Arizona State",
    "nickName": "Sun Devils",
    "city": "Tempe",
    "state": " Arizona",
    "conference": "Big 12",
    "stadium": "Sun Devil Stadium",
    "abbrev": "ASU"
  },
  {
    "name": "Arkansas",
    "nickName": "Razorbacks",
    "city": "Fayetteville",
    "state": " Arkansas",
    "conference": "SEC",
    "stadium": "Donald W. Reynolds Razorback Stadium",
    "abbrev": "ARK"
  },
  {
    "name": "Arkansas State",
    "nickName": "Red Wolves",
    "city": "Jonesboro",
    "state": " Arkansas",
    "conference": "Sun Belt",
    "stadium": "Centennial Bank Stadium",
    "abbrev": "ARST"
  },
  {
    "name": "Army",
    "nickName": "Black Knights",
    "city": "West Point",
    "state": " New York",
    "conference": "AAC",
    "stadium": "Michie Stadium",
    "abbrev": "ARMY"
  },
  {
    "name": "Auburn",
    "nickName": "Tigers",
    "city": "Auburn",
    "state": " Alabama",
    "conference": "SEC",
    "stadium": "Jordan-Hare Stadium",
    "abbrev": "AUB"
  },
  {
    "name": "Ball State",
    "nickName": "Cardinals",
    "city": "Muncie",
    "state": " Indiana",
    "conference": "MAC",
    "stadium": "Scheumann Stadium",
    "abbrev": "BALL"
  },
  {
    "name": "Baylor",
    "nickName": "Bears",
    "city": "Waco",
    "state": " Texas",
    "conference": "Big 12",
    "stadium": "McLane Stadium",
    "abbrev": "BAY"
  },
  {
    "name": "Boise State",
    "nickName": "Broncos",
    "city": "Boise",
    "state": " Idaho",
    "conference": "MWC",
    "stadium": "Albertsons Stadium",
    "abbrev": "BSU"
  },
  {
    "name": "Boston College",
    "nickName": "Eagles",
    "city": "Chestnut Hill",
    "state": " Massachusetts",
    "conference": "ACC",
    "stadium": "Alumni Stadium",
    "abbrev": "BC"
  },
  {
    "name": "Bowling Green",
    "nickName": "Falcons",
    "city": "Bowling Green",
    "state": " Ohio",
    "conference": "MAC",
    "stadium": "Doyt Perry Stadium",
    "abbrev": "BGSU"
  },
  {
    "name": "Buffalo",
    "nickName": "Bulls",
    "city": "Amherst",
    "state": " New York",
    "conference": "MAC",
    "stadium": "UB Stadium",
    "abbrev": "BUFF"
  },
  {
    "name": "BYU",
    "nickName": "Cougars",
    "city": "Provo",
    "state": " Utah",
    "conference": "Big 12",
    "stadium": "LaVell Edwards Stadium",
    "abbrev": "BYU"
  },
  {
    "name": "California",
    "nickName": "Golden Bears",
    "city": "Berkeley",
    "state": " California",
    "conference": "ACC",
    "stadium": "California Memorial Stadium",
    "abbrev": "CAL"
  },
  {
    "name": "Central Michigan",
    "nickName": "Chippewas",
    "city": "Mount Pleasant",
    "state": " Michigan",
    "conference": "MAC",
    "stadium": "Kelly/Shorts Stadium",
    "abbrev": "CMU"
  },
  {
    "name": "Charlotte",
    "nickName": "49ers",
    "city": "Charlotte",
    "state": " North Carolina",
    "conference": "AAC",
    "stadium": "Jerry Richardson Stadium",
    "abbrev": "CHAR"
  },
  {
    "name": "Cincinnati",
    "nickName": "Bearcats",
    "city": "Cincinnati",
    "state": " Ohio",
    "conference": "Big 12",
    "stadium": "Nippert Stadium",
    "abbrev": "CIN"
  },
  {
    "name": "Clemson",
    "nickName": "Tigers",
    "city": "Clemson",
    "state": " South Carolina",
    "conference": "ACC",
    "stadium": "Memorial Stadium",
    "abbrev": "CLEM"
  },
  {
    "name": "Coastal Carolina",
    "nickName": "Chanticleers",
    "city": "Conway",
    "state": " South Carolina",
    "conference": "Sun Belt",
    "stadium": "Brooks Stadium",
    "abbrev": "CCAR"
  },
  {
    "name": "Colorado",
    "nickName": "Buffaloes",
    "city": "Boulder",
    "state": " Colorado",
    "conference": "Big 12",
    "stadium": "Folsom Field",
    "abbrev": "COLO"
  },
  {
    "name": "Colorado State",
    "nickName": "Rams",
    "city": "Fort Collins",
    "state": " Colorado",
    "conference": "MWC",
    "stadium": "Canvas Stadium",
    "abbrev": "CSU"
  },
  {
    "name": "Delaware",
    "nickName": "Blue Hens",
    "city": "Newark",
    "state": " Delaware",
    "conference": "C-USA",
    "stadium": "Delaware Stadium",
    "abbrev": "DU"
  },
  {
    "name": "Duke",
    "nickName": "Blue Devils",
    "city": "Durham",
    "state": " North Carolina",
    "conference": "ACC",
    "stadium": "Wallace Wade Stadium",
    "abbrev": "DUKE"
  },
  {
    "name": "East Carolina",
    "nickName": "Pirates",
    "city": "Greenville",
    "state": " North Carolina",
    "conference": "AAC",
    "stadium": "Dowdy–Ficklen Stadium",
    "abbrev": "ECU"
  },
  {
    "name": "Eastern Michigan",
    "nickName": "Eagles",
    "city": "Ypsilanti",
    "state": " Michigan",
    "conference": "MAC",
    "stadium": "Rynearson Stadium",
    "abbrev": "EMU"
  },
  {
    "name": "FIU",
    "nickName": "Panthers",
    "city": "Westchester",
    "state": " Florida",
    "conference": "C-USA",
    "stadium": "Pitbull Stadium",
    "abbrev": "FIU"
  },
  {
    "name": "Florida",
    "nickName": "Gators",
    "city": "Gainesville",
    "state": " Florida",
    "conference": "SEC",
    "stadium": "Ben Hill Griffin Stadium",
    "abbrev": "FLA"
  },
  {
    "name": "Florida Atlantic",
    "nickName": "Owls",
    "city": "Boca Raton",
    "state": " Florida",
    "conference": "AAC",
    "stadium": "FAU Stadium",
    "abbrev": "FAU"
  },
  {
    "name": "Florida State",
    "nickName": "Seminoles",
    "city": "Tallahassee",
    "state": " Florida",
    "conference": "ACC",
    "stadium": "Bobby Bowden Field at Doak Campbell Stadium",
    "abbrev": "FSU"
  },
  {
    "name": "Fresno State",
    "nickName": "Bulldogs",
    "city": "Fresno",
    "state": " California",
    "conference": "MWC",
    "stadium": "Valley Children's Stadium",
    "abbrev": "FRES"
  },
  {
    "name": "Georgia",
    "nickName": "Bulldogs",
    "city": "Athens",
    "state": " Georgia",
    "conference": "SEC",
    "stadium": "Sanford Stadium",
    "abbrev": "UGA"
  },
  {
    "name": "Georgia Southern",
    "nickName": "Eagles",
    "city": "Statesboro",
    "state": " Georgia",
    "conference": "Sun Belt",
    "stadium": "Paulson Stadium",
    "abbrev": "GASO"
  },
  {
    "name": "Georgia State",
    "nickName": "Panthers",
    "city": "Atlanta",
    "state": " Georgia",
    "conference": "Sun Belt",
    "stadium": "Georgia State Stadium",
    "abbrev": "GSU"
  },
  {
    "name": "Georgia Tech",
    "nickName": "Yellow Jackets",
    "city": "Atlanta",
    "state": " Georgia",
    "conference": "ACC",
    "stadium": "Bobby Dodd Stadium at Historic Grant Field",
    "abbrev": "GT"
  },
  {
    "name": "Hawaii",
    "nickName": "Rainbow Warriors",
    "city": "Honolulu",
    "state": " Hawaii",
    "conference": "MWC",
    "stadium": "Clarence T. C. Ching Athletics Complex",
    "abbrev": "HAW"
  },
  {
    "name": "Houston",
    "nickName": "Cougars",
    "city": "Houston",
    "state": " Texas",
    "conference": "Big 12",
    "stadium": "TDECU Stadium",
    "abbrev": "HOU"
  },
  {
    "name": "Illinois",
    "nickName": "Fighting Illini",
    "city": "Champaign",
    "state": " Illinois",
    "conference": "Big Ten",
    "stadium": "Memorial Stadium",
    "abbrev": "ILL"
  },
  {
    "name": "Indiana",
    "nickName": "Hoosiers",
    "city": "Bloomington",
    "state": " Indiana",
    "conference": "Big Ten",
    "stadium": "Memorial Stadium",
    "abbrev": "IND"
  },
  {
    "name": "Iowa",
    "nickName": "Hawkeyes",
    "city": "Iowa City",
    "state": " Iowa",
    "conference": "Big Ten",
    "stadium": "Nile Kinnick Stadium",
    "abbrev": "IOWA"
  },
  {
    "name": "Iowa State",
    "nickName": "Cyclones",
    "city": "Ames",
    "state": " Iowa",
    "conference": "Big 12",
    "stadium": "Jack Trice Stadium",
    "abbrev": "ISU"
  },
  {
    "name": "Jacksonville State",
    "nickName": "Gamecocks",
    "city": "Jacksonville",
    "state": " Alabama",
    "conference": "C-USA",
    "stadium": "Burgess–Snow Field at JSU Stadium",
    "abbrev": "JVST"
  },
  {
    "name": "James Madison",
    "nickName": "Dukes",
    "city": "Harrisonburg",
    "state": " Virginia",
    "conference": "Sun Belt",
    "stadium": "Bridgeforth Stadium",
    "abbrev": "JMU"
  },
  {
    "name": "Kansas",
    "nickName": "Jayhawks",
    "city": "Lawrence",
    "state": " Kansas",
    "conference": "Big 12",
    "stadium": "David Booth Kansas Memorial Stadium",
    "abbrev": "KU"
  },
  {
    "name": "Kansas State",
    "nickName": "Wildcats",
    "city": "Manhattan",
    "state": " Kansas",
    "conference": "Big 12",
    "stadium": "Bill Snyder Family Football Stadium",
    "abbrev": "KSU"
  },
  {
    "name": "Kennesaw State",
    "nickName": "Owls",
    "city": "Kennesaw",
    "state": " GA",
    "conference": "C-USA",
    "stadium": "Fifth Third Stadium",
    "abbrev": "KENN"
  },
  {
    "name": "Kent State",
    "nickName": "Golden Flashes",
    "city": "Kent",
    "state": " Ohio",
    "conference": "MAC",
    "stadium": "Dix Stadium",
    "abbrev": "KENT"
  },
  {
    "name": "Kentucky",
    "nickName": "Wildcats",
    "city": "Lexington",
    "state": " Kentucky",
    "conference": "SEC",
    "stadium": "Kroger Field",
    "abbrev": "UK"
  },
  {
    "name": "Liberty",
    "nickName": "Flames",
    "city": "Lynchburg",
    "state": " Virginia",
    "conference": "C-USA",
    "stadium": "Williams Stadium",
    "abbrev": "LIB"
  },
  {
    "name": "Louisiana",
    "nickName": "Ragin Cajuns",
    "city": "Lafayette",
    "state": " Louisiana",
    "conference": "Sun Belt",
    "stadium": "Cajun Field",
    "abbrev": "ULL"
  },
  {
    "name": "Louisiana Tech",
    "nickName": "Bulldogs",
    "city": "Ruston",
    "state": " Louisiana",
    "conference": "C-USA",
    "stadium": "Joe Aillet Stadium",
    "abbrev": "LT"
  },
  {
    "name": "Louisiana-Monroe",
    "nickName": "Warhawks",
    "city": "Monroe",
    "state": " Louisiana",
    "conference": "Sun Belt",
    "stadium": "JPS Field at Malone Stadium",
    "abbrev": "ULM"
  },
  {
    "name": "Louisville",
    "nickName": "Cardinals",
    "city": "Louisville",
    "state": " Kentucky",
    "conference": "ACC",
    "stadium": "L&N Federal Credit Union Stadium",
    "abbrev": "LOU"
  },
  {
    "name": "LSU",
    "nickName": "Tigers",
    "city": "Baton Rouge",
    "state": " Louisiana",
    "conference": "SEC",
    "stadium": "Tiger Stadium",
    "abbrev": "LSU"
  },
  {
    "name": "Marshall",
    "nickName": "Thundering Herd",
    "city": "Huntington",
    "state": " West Virginia",
    "conference": "Sun Belt",
    "stadium": "Joan C. Edwards Stadium",
    "abbrev": "MRSH"
  },
  {
    "name": "Maryland",
    "nickName": "Terrapins",
    "city": "College Park",
    "state": " Maryland",
    "conference": "Big Ten",
    "stadium": "SECU Stadium",
    "abbrev": "UMD"
  },
  {
    "name": "Memphis",
    "nickName": "Tigers",
    "city": "Memphis",
    "state": " Tennessee",
    "conference": "AAC",
    "stadium": "Simmons Bank Liberty Stadium",
    "abbrev": "MEM"
  },
  {
    "name": "Miami (FL)",
    "nickName": "Hurricanes",
    "city": "Mami Gardens",
    "state": " Florida",
    "conference": "ACC",
    "stadium": "Hard Rock Stadium",
    "abbrev": "MIA"
  },
  {
    "name": "Miami (OH)",
    "nickName": "RedHawks",
    "city": "Oxford",
    "state": " Ohio",
    "conference": "MAC",
    "stadium": "Yager Stadium",
    "abbrev": "M-OH"
  },
  {
    "name": "Michigan",
    "nickName": "Wolverines",
    "city": "Ann Arbor",
    "state": " Michigan",
    "conference": "Big Ten",
    "stadium": "Michigan Stadium",
    "abbrev": "MICH"
  },
  {
    "name": "Michigan State",
    "nickName": "Spartans",
    "city": "East Lansing",
    "state": " Michigan",
    "conference": "Big Ten",
    "stadium": "Spartan Stadium",
    "abbrev": "MSU"
  },
  {
    "name": "Middle Tennessee",
    "nickName": "Blue Raiders",
    "city": "Murfreesboro",
    "state": " Tennessee",
    "conference": "C-USA",
    "stadium": "Johnny \"Red\" Floyd Stadium",
    "abbrev": "MTSU"
  },
  {
    "name": "Minnesota",
    "nickName": "Golden Gophers",
    "city": "Minneapolis",
    "state": " Minnesota",
    "conference": "Big Ten",
    "stadium": "Huntington Bank Stadium",
    "abbrev": "MINN"
  },
  {
    "name": "Mississippi State",
    "nickName": "Bulldogs",
    "city": "Starkville",
    "state": " Mississippi",
    "conference": "SEC",
    "stadium": "Davis Wade Stadium",
    "abbrev": "MSST"
  },
  {
    "name": "Missouri",
    "nickName": "Tigers",
    "city": "Columbia",
    "state": " Missouri",
    "conference": "SEC",
    "stadium": "Faurot Field at Memorial Stadium",
    "abbrev": "MIZZ"
  },
  {
    "name": "Missouri State",
    "nickName": "Bears",
    "city": "Springfield",
    "state": " Missouri",
    "conference": "C-USA",
    "stadium": "	Robert W. Plaster Stadium",
    "abbrev": "MIST"
  },
  {
    "name": "Navy",
    "nickName": "Midshipmen",
    "city": "Annapolis",
    "state": " Maryland",
    "conference": "AAC",
    "stadium": "Navy–Marine Corps Memorial Stadium",
    "abbrev": "NAVY"
  },
  {
    "name": "NC State",
    "nickName": "Wolfpack",
    "city": "Raleigh",
    "state": " North Carolina",
    "conference": "ACC",
    "stadium": "Carter–Finley Stadium",
    "abbrev": "NCST"
  },
  {
    "name": "Nebraska",
    "nickName": "Cornhuskers",
    "city": "Lincoln",
    "state": " Nebraska",
    "conference": "Big Ten",
    "stadium": "Memorial Stadium",
    "abbrev": "NEB"
  },
  {
    "name": "Nevada",
    "nickName": "Wolf Pack",
    "city": "Reno",
    "state": " Nevada",
    "conference": "MWC",
    "stadium": "Mackay Stadium",
    "abbrev": "NEV"
  },
  {
    "name": "New Mexico",
    "nickName": "Lobos",
    "city": "Albuquerque",
    "state": " New Mexico",
    "conference": "MWC",
    "stadium": "University Stadium",
    "abbrev": "UNM"
  },
  {
    "name": "New Mexico State",
    "nickName": "Aggies",
    "city": "Las Cruces",
    "state": " New Mexico",
    "conference": "C-USA",
    "stadium": "Aggie Memorial Stadium",
    "abbrev": "NMSU"
  },
  {
    "name": "North Carolina",
    "nickName": "Tar Heels",
    "city": "Chapel Hill",
    "state": " North Carolina",
    "conference": "ACC",
    "stadium": "Kenan Memorial Stadium",
    "abbrev": "UNC"
  },
  {
    "name": "North Texas",
    "nickName": "Mean Green",
    "city": "Denton",
    "state": " Texas",
    "conference": "AAC",
    "stadium": "DATCU Stadium",
    "abbrev": "UNT"
  },
  {
    "name": "Northern Illinois",
    "nickName": "Huskies",
    "city": "DeKalb",
    "state": " Illinois",
    "conference": "MAC",
    "stadium": "Huskie Stadium",
    "abbrev": "NIU"
  },
  {
    "name": "Northwestern",
    "nickName": "Wildcats",
    "city": "Evanston",
    "state": " Illinois",
    "conference": "Big Ten",
    "stadium": "Martin Stadium",
    "abbrev": "NW"
  },
  {
    "name": "Notre Dame",
    "nickName": "Fighting Irish",
    "city": "Notre Dame",
    "state": " Indiana",
    "conference": "Independents",
    "stadium": "Notre Dame Stadium",
    "abbrev": "ND"
  },
  {
    "name": "Ohio",
    "nickName": "Bobcats",
    "city": "Athens",
    "state": " Ohio",
    "conference": "MAC",
    "stadium": "Peden Stadium",
    "abbrev": "OHIO"
  },
  {
    "name": "Ohio State",
    "nickName": "Buckeyes",
    "city": "Columbus",
    "state": " Ohio",
    "conference": "Big Ten",
    "stadium": "Ohio Stadium",
    "abbrev": "OSU"
  },
  {
    "name": "Oklahoma",
    "nickName": "Sooners",
    "city": "Norman",
    "state": " Oklahoma",
    "conference": "SEC",
    "stadium": "Gaylord Family Oklahoma Memorial Stadium",
    "abbrev": "OU"
  },
  {
    "name": "Oklahoma State",
    "nickName": "Cowboys",
    "city": "Stillwater",
    "state": " Oklahoma",
    "conference": "Big 12",
    "stadium": "Boone Pickens Stadium",
    "abbrev": "OKST"
  },
  {
    "name": "Old Dominion",
    "nickName": "Monarchs",
    "city": "Norfolk",
    "state": " Virginia",
    "conference": "Sun Belt",
    "stadium": "S.B. Ballard Stadium",
    "abbrev": "ODU"
  },
  {
    "name": "Ole Miss",
    "nickName": "Rebels",
    "city": "Oxford",
    "state": " Mississippi",
    "conference": "SEC",
    "stadium": "Vaught–Hemingway Stadium",
    "abbrev": "MISS"
  },
  {
    "name": "Oregon",
    "nickName": "Ducks",
    "city": "Eugene",
    "state": " Oregon",
    "conference": "Big Ten",
    "stadium": "Autzen Stadium",
    "abbrev": "ORE"
  },
  {
    "name": "Oregon State",
    "nickName": "Beavers",
    "city": "Corvallis",
    "state": " Oregon",
    "conference": "Pac-12",
    "stadium": "Reser Stadium",
    "abbrev": "ORST"
  },
  {
    "name": "Penn State",
    "nickName": "Nittany Lions",
    "city": "University Park",
    "state": " Pennsylvania",
    "conference": "Big Ten",
    "stadium": "Beaver Stadium",
    "abbrev": "PSU"
  },
  {
    "name": "Pittsburgh",
    "nickName": "Panthers",
    "city": "Pittsburgh",
    "state": " Pennsylvania",
    "conference": "ACC",
    "stadium": "Acrisure Stadium",
    "abbrev": "PITT"
  },
  {
    "name": "Purdue",
    "nickName": "Boilermakers",
    "city": "West Lafayette",
    "state": " Indiana",
    "conference": "Big Ten",
    "stadium": "Ross–Ade Stadium",
    "abbrev": "PUR"
  },
  {
    "name": "Rice",
    "nickName": "Owls",
    "city": "Houston",
    "state": " Texas",
    "conference": "AAC",
    "stadium": "Rice Stadium",
    "abbrev": "RICE"
  },
  {
    "name": "Rutgers",
    "nickName": "Scarlet Knights",
    "city": "Piscataway",
    "state": " New Jersey",
    "conference": "Big Ten",
    "stadium": "SHI Stadium",
    "abbrev": "RUTG"
  },
  {
    "name": "Sam Houston",
    "nickName": "Bearkats",
    "city": "Hunstville",
    "state": " Texas",
    "conference": "C-USA",
    "stadium": "Bowers Stadium",
    "abbrev": "SAM"
  },
  {
    "name": "San Diego State",
    "nickName": "Aztecs",
    "city": "San Diego",
    "state": " California",
    "conference": "MWC",
    "stadium": "Snapdragon Stadium",
    "abbrev": "SDSU"
  },
  {
    "name": "San Jose State",
    "nickName": "Spartans",
    "city": "San Jose",
    "state": " California",
    "conference": "MWC",
    "stadium": "CEFCU Stadium",
    "abbrev": "SJSU"
  },
  {
    "name": "SMU",
    "nickName": "Mustangs",
    "city": "University Park",
    "state": " Texas",
    "conference": "ACC",
    "stadium": "Gerald J. Ford Stadium",
    "abbrev": "SMU"
  },
  {
    "name": "South Alabama",
    "nickName": "Jaguars",
    "city": "Mobile",
    "state": " Alabama",
    "conference": "Sun Belt",
    "stadium": "Hancock Whitney Stadium",
    "abbrev": "USA"
  },
  {
    "name": "South Carolina",
    "nickName": "Gamecocks",
    "city": "Columbia",
    "state": " South Carolina",
    "conference": "SEC",
    "stadium": "Williams–Brice Stadium",
    "abbrev": "SCAR"
  },
  {
    "name": "South Florida",
    "nickName": "Bulls",
    "city": "Tampa",
    "state": " Florida",
    "conference": "AAC",
    "stadium": "Raymond James Stadium",
    "abbrev": "USF"
  },
  {
    "name": "Southern Miss",
    "nickName": "Golden Eagles",
    "city": "Hattiesburg",
    "state": " Mississippi",
    "conference": "Sun Belt",
    "stadium": "M.M. Roberts Stadium",
    "abbrev": "USM"
  },
  {
    "name": "Stanford",
    "nickName": "Cardinal",
    "city": "Stanford",
    "state": " California",
    "conference": "ACC",
    "stadium": "Stanford Stadium",
    "abbrev": "STAN"
  },
  {
    "name": "Syracuse",
    "nickName": "Orange",
    "city": "Syracuse",
    "state": " New York",
    "conference": "ACC",
    "stadium": "JMA Wireless Dome",
    "abbrev": "SYR"
  },
  {
    "name": "TCU",
    "nickName": "Horned Frogs",
    "city": "Fort Worth",
    "state": " Texas",
    "conference": "Big 12",
    "stadium": "Amon G. Carter Stadium",
    "abbrev": "TCU"
  },
  {
    "name": "Temple",
    "nickName": "Owls",
    "city": "Philadelphia",
    "state": " Pennsylvania",
    "conference": "AAC",
    "stadium": "Lincoln Financial Field",
    "abbrev": "TEM"
  },
  {
    "name": "Tennessee",
    "nickName": "Volunteers",
    "city": "Knoxville",
    "state": " Tennessee",
    "conference": "SEC",
    "stadium": "Neyland Stadium",
    "abbrev": "TENN"
  },
  {
    "name": "Texas",
    "nickName": "Longhorns",
    "city": "Austin",
    "state": " Texas",
    "conference": "SEC",
    "stadium": "Darrell K Royal–Texas Memorial Stadium",
    "abbrev": "TEX"
  },
  {
    "name": "Texas A&M",
    "nickName": "Aggies",
    "city": "College Station",
    "state": " Texas",
    "conference": "SEC",
    "stadium": "Kyle Field",
    "abbrev": "TAMU"
  },
  {
    "name": "Texas State",
    "nickName": "Bobcats",
    "city": "San Marcos",
    "state": " Texas",
    "conference": "Sun Belt",
    "stadium": "Bobcat Stadium",
    "abbrev": "TXST"
  },
  {
    "name": "Texas Tech",
    "nickName": "Red Raiders",
    "city": "Lubbock",
    "state": " Texas",
    "conference": "Big 12",
    "stadium": "Jones AT&T Stadium",
    "abbrev": "TTU"
  },
  {
    "name": "Toledo",
    "nickName": "Rockets",
    "city": "Toledo",
    "state": " Ohio",
    "conference": "MAC",
    "stadium": "Glass Bowl",
    "abbrev": "TOL"
  },
  {
    "name": "Troy",
    "nickName": "Trojans",
    "city": "Troy",
    "state": " Alabama",
    "conference": "Sun Belt",
    "stadium": "Veterans Memorial Stadium",
    "abbrev": "TROY"
  },
  {
    "name": "Tulane",
    "nickName": "Green Wave",
    "city": "New Orleans",
    "state": " Louisiana",
    "conference": "AAC",
    "stadium": "Yulman Stadium",
    "abbrev": "TULN"
  },
  {
    "name": "Tulsa",
    "nickName": "Golden Hurricane",
    "city": "Tulsa",
    "state": " Oklahoma",
    "conference": "AAC",
    "stadium": "Skelly Field at H. A. Chapman Stadium",
    "abbrev": "TLSA"
  },
  {
    "name": "UAB",
    "nickName": "Blazers",
    "city": "Birmingham",
    "state": " Alabama",
    "conference": "AAC",
    "stadium": "Protective Stadium",
    "abbrev": "UAB"
  },
  {
    "name": "UCF",
    "nickName": "Knights",
    "city": "Orlando",
    "state": " Florida",
    "conference": "Big 12",
    "stadium": "FBC Mortgage Stadium",
    "abbrev": "UCF"
  },
  {
    "name": "UCLA",
    "nickName": "Bruins",
    "city": "Pasadena",
    "state": " California",
    "conference": "Big Ten",
    "stadium": "Rose Bowl",
    "abbrev": "UCLA"
  },
  {
    "name": "UConn",
    "nickName": "Huskies",
    "city": "East Hartford",
    "state": " Connecticut",
    "conference": "Independents",
    "stadium": "Pratt & Whitney Stadium at Rentschler Field",
    "abbrev": "CONN"
  },
  {
    "name": "UMass",
    "nickName": "Minuteman",
    "city": "Hadley",
    "state": " Massachusetts",
    "conference": "Independents",
    "stadium": "Warren McGuirk Alumni Stadium",
    "abbrev": "UMASS"
  },
  {
    "name": "UNLV",
    "nickName": "Rebels",
    "city": "Las Vegas",
    "state": " Nevada",
    "conference": "MWC",
    "stadium": "Allegiant Stadium",
    "abbrev": "UNLV"
  },
  {
    "name": "USC",
    "nickName": "Trojans",
    "city": "Los Angeles",
    "state": " California",
    "conference": "Big Ten",
    "stadium": "Los Angeles Memorial Coliseum",
    "abbrev": "USC"
  },
  {
    "name": "UTEP",
    "nickName": "Miners",
    "city": "El Paso",
    "state": " Texas",
    "conference": "C-USA",
    "stadium": "Sun Bowl",
    "abbrev": "UTEP"
  },
  {
    "name": "UTSA",
    "nickName": "Roadrunners",
    "city": "San Antonio",
    "state": " Texas",
    "conference": "AAC",
    "stadium": "Alamodome",
    "abbrev": "UTSA"
  },
  {
    "name": "Utah",
    "nickName": "Utes",
    "city": "Salt Lake City",
    "state": " Utah",
    "conference": "Big 12",
    "stadium": "Rice–Eccles Stadium",
    "abbrev": "UTAH"
  },
  {
    "name": "Utah State",
    "nickName": "Aggies",
    "city": "Logan",
    "state": " Utah",
    "conference": "MWC",
    "stadium": "Maverik Stadium",
    "abbrev": "USU"
  },
  {
    "name": "Vanderbilt",
    "nickName": "Commodores",
    "city": "Nashville",
    "state": " Tennessee",
    "conference": "SEC",
    "stadium": "FirstBank Stadium",
    "abbrev": "VAN"
  },
  {
    "name": "Virginia",
    "nickName": "Cavaliers",
    "city": "Charlottesville",
    "state": " Virginia",
    "conference": "ACC",
    "stadium": "Scott Stadium",
    "abbrev": "UVA"
  },
  {
    "name": "Virginia Tech",
    "nickName": "Hokies",
    "city": "Blacksburg",
    "state": " Virginia",
    "conference": "ACC",
    "stadium": "Lane Stadium",
    "abbrev": "VT"
  },
  {
    "name": "Wake Forest",
    "nickName": "Demon Deacons",
    "city": "Winston-Salem",
    "state": " North Carolina",
    "conference": "ACC",
    "stadium": "Allegacy Federal Credit Union Stadium",
    "abbrev": "WAKE"
  },
  {
    "name": "Washington",
    "nickName": "Huskies",
    "city": "Seattle",
    "state": " Washington",
    "conference": "Big Ten",
    "stadium": "Husky Stadium",
    "abbrev": "UW"
  },
  {
    "name": "Washington State",
    "nickName": "Cougars",
    "city": "Pullman",
    "state": " Washington",
    "conference": "Pac-12",
    "stadium": "Martin Stadium",
    "abbrev": "WSU"
  },
  {
    "name": "West Virginia",
    "nickName": "Mountaineers",
    "city": "Morgantown",
    "state": " West Virginia",
    "conference": "Big 12",
    "stadium": "Milan Puskar Stadium",
    "abbrev": "WVU"
  },
  {
    "name": "Western Kentucky",
    "nickName": "Hilltoppers",
    "city": "Bowling Green",
    "state": " Kentucky",
    "conference": "C-USA",
    "stadium": "Houchens Industries–L. T. Smith Stadium",
    "abbrev": "WKU"
  },
  {
    "name": "Western Michigan",
    "nickName": "Broncos",
    "city": "Kalamazoo",
    "state": " Michigan",
    "conference": "MAC",
    "stadium": "Waldo Stadium",
    "abbrev": "WMU"
  },
  {
    "name": "Wisconsin",
    "nickName": "Badgers",
    "city": "Madison",
    "state": " Wisconsin",
    "conference": "Big Ten",
    "stadium": "Camp Randall Stadium",
    "abbrev": "WIS"
  },
  {
    "name": "Wyoming",
    "nickName": "Cowboys",
    "city": "Laramie",
    "state": " Wyoming",
    "conference": "MWC",
    "stadium": "War Memorial Stadium",
    "abbrev": "WYO"
  }
]

export function getTeamByName(name:string): Team|undefined {
  return fbsTeams.find(team => team.name === name);
}

export function getTeamData(teamName: string): Team | null {
  const baseTeam = getTeamByName(teamName);
  if (!baseTeam) {
    return null; // Team not found in the base list
  }

  const coachProfile = getCoachProfile();

  // Check if there's a conference override for the user's specific team
  if (coachProfile && coachProfile.schoolName === teamName && coachProfile.conference) {
    return {
      ...baseTeam,
      conference: coachProfile.conference as Team['conference'], // Apply the override
    };
  }

  // If no override, return the base data
  return baseTeam;
}
